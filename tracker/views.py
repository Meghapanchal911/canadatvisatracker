from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Max
from .models import VisaType, ProcessingSnapshot, ScrapeLog
from .serializers import (
    VisaTypeSerializer,
    ProcessingSnapshotSerializer,
    ScrapeLogSerializer
)


class VisaTypeListView(generics.ListAPIView):
    """
    GET /api/visa-types/
    Returns all 8 visa types.
    """
    queryset = VisaType.objects.all().order_by('category', 'name')
    serializer_class = VisaTypeSerializer


class SnapshotListView(generics.ListAPIView):
    """
    GET /api/snapshots/?visa_code=study&country_code=IN
    Returns processing time history for a specific visa type.
    Both filters are optional.
    """
    serializer_class = ProcessingSnapshotSerializer

    def get_queryset(self):
        queryset = ProcessingSnapshot.objects.all()

        # Filter by visa code if provided in URL
        visa_code = self.request.query_params.get('visa_code')
        if visa_code:
            queryset = queryset.filter(visa_type__code=visa_code)

        # Filter by country code if provided in URL
        country_code = self.request.query_params.get('country_code')
        if country_code:
            queryset = queryset.filter(country_code=country_code)

        return queryset.order_by('-scraped_date')[:90]
        # Limit to last 90 records to keep responses fast


class TrendsView(APIView):
    """
    GET /api/trends/
    Returns each visa type with its most recent processing time
    for a given country (default: IN for India).
    """
    def get(self, request):
        country_code = request.query_params.get('country_code', 'IN')

        visa_types = VisaType.objects.all()
        results = []

        for visa_type in visa_types:
            # Get the most recent snapshot for this visa type and country
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
    Returns the date of the most recent scrape.
    Used by the frontend to show "Data last updated X"
    """
    def get(self, request):
        latest_log = ScrapeLog.objects.filter(
            status='success'
        ).order_by('-run_at').first()

        if latest_log:
            return Response({
                'last_updated': latest_log.run_at,
                'records_saved': latest_log.records_saved,
            })

        return Response({'last_updated': None, 'records_saved': 0})