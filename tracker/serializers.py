from rest_framework import serializers
from .models import VisaType, ProcessingSnapshot, ScrapeLog


class VisaTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisaType
        fields = ['id', 'code', 'name', 'category', 'created_at']


class ProcessingSnapshotSerializer(serializers.ModelSerializer):
    # This adds the visa type code and name directly into the response
    # Instead of just showing a number like "visa_type: 2"
    visa_type_code = serializers.CharField(source='visa_type.code', read_only=True)
    visa_type_name = serializers.CharField(source='visa_type.name', read_only=True)

    class Meta:
        model = ProcessingSnapshot
        fields = [
            'id',
            'visa_type_code',
            'visa_type_name',
            'country_code',
            'processing_days',
            'scraped_date',
        ]


class ScrapeLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScrapeLog
        fields = ['id', 'run_at', 'status', 'records_saved', 'error_message']