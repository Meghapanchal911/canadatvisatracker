from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Max
from .models import VisaType, ProcessingSnapshot, ScrapeLog
from .serializers import (
    VisaTypeSerializer,
    ProcessingSnapshotSerializer,
    ScrapeLogSerializer
)

# Valid country codes — basic validation
def is_valid_country_code(code):
    return code and len(code) == 2 and code.isalpha()


class VisaTypeListView(generics.ListAPIView):
    """
    GET /api/visa-types/
    Returns all visa types ordered by category then name.
    """
    queryset = VisaType.objects.all().order_by('category', 'name')
    serializer_class = VisaTypeSerializer


class SnapshotListView(generics.ListAPIView):
    """
    GET /api/snapshots/?visa_code=study&country_code=IN&limit=90
    Returns processing time history for a specific visa + country.
    """
    serializer_class = ProcessingSnapshotSerializer

    def get_queryset(self):
        queryset = ProcessingSnapshot.objects.all()

        visa_code = self.request.query_params.get('visa_code')
        if visa_code:
            # Validate visa code exists
            if not VisaType.objects.filter(code=visa_code).exists():
                return ProcessingSnapshot.objects.none()
            queryset = queryset.filter(visa_type__code=visa_code)

        country_code = self.request.query_params.get('country_code')
        if country_code:
            if not is_valid_country_code(country_code):
                return ProcessingSnapshot.objects.none()
            queryset = queryset.filter(country_code=country_code.upper())

        # Configurable limit — default 90, max 365
        try:
            limit = min(int(self.request.query_params.get('limit', 90)), 365)
        except ValueError:
            limit = 90

        return queryset.order_by('-scraped_date')[:limit]


class TrendsView(APIView):
    """
    GET /api/trends/?country_code=IN
    Returns each visa type with its most recent processing time.
    """
    def get(self, request):
        country_code = request.query_params.get('country_code', 'IN').upper()

        # Validate country code
        if not is_valid_country_code(country_code):
            return Response(
                {'error': 'Invalid country code. Must be a 2-letter code like IN, CA, US.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        visa_types = VisaType.objects.all().order_by('category', 'name')
        results = []

        for visa_type in visa_types:
            latest = ProcessingSnapshot.objects.filter(
                visa_type=visa_type,
                country_code=country_code
            ).order_by('-scraped_date').first()

            results.append({
                'visa_code':       visa_type.code,
                'visa_name':       visa_type.name,
                'category':        visa_type.category,
                'country_code':    country_code,
                'processing_days': latest.processing_days if latest else None,
                'last_updated':    latest.scraped_date if latest else None,
            })

        return Response(results)


class LastUpdatedView(APIView):
    """
    GET /api/last-updated/
    Returns timestamp of the most recent successful scrape.
    """
    def get(self, request):
        latest_log = ScrapeLog.objects.filter(
            status='success'
        ).order_by('-run_at').first()

        if latest_log:
            return Response({
                'last_updated':  latest_log.run_at,
                'records_saved': latest_log.records_saved,
                'status':        'ok'
            })

        return Response({
            'last_updated':  None,
            'records_saved': 0,
            'status':        'no scrape run yet'
        })


class ScrapeLogListView(generics.ListAPIView):
    """
    GET /api/scrape-logs/
    Returns the last 10 scrape logs for monitoring.
    """
    queryset = ScrapeLog.objects.all().order_by('-run_at')[:10]
    serializer_class = ScrapeLogSerializer


class StatsView(APIView):
    """
    GET /api/stats/
    Returns summary statistics about the dataset.
    Useful for the dashboard header and README.
    """
    def get(self, request):
        total_snapshots = ProcessingSnapshot.objects.count()
        total_visa_types = VisaType.objects.count()
        total_countries = ProcessingSnapshot.objects.values('country_code').distinct().count()
        latest_log = ScrapeLog.objects.filter(status='success').order_by('-run_at').first()

        return Response({
            'total_snapshots':  total_snapshots,
            'total_visa_types': total_visa_types,
            'total_countries':  total_countries,
            'last_scraped':     latest_log.run_at if latest_log else None,
            'status':           'ok'
        })