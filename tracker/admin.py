from django.contrib import admin
from .models import VisaType, ProcessingSnapshot, ScrapeLog

@admin.register(VisaType)
class VisaTypeAdmin(admin.ModelAdmin):
    # Columns shown in the list view
    list_display = ['code', 'name', 'category', 'created_at']
    # Search bar - search by code or name
    search_fields = ['code', 'name']
    # Filter sidebar on the right
    list_filter = ['category']


@admin.register(ProcessingSnapshot)
class ProcessingSnapshotAdmin(admin.ModelAdmin):
    list_display = ['visa_type', 'scraped_date', 'processing_days', 'created_at']
    search_fields = ['visa_type__code', 'visa_type__name']
    list_filter = ['visa_type', 'scraped_date']
    # Show newest records first
    ordering = ['-scraped_date']


@admin.register(ScrapeLog)
class ScrapeLogAdmin(admin.ModelAdmin):
    list_display = ['run_at', 'status', 'records_saved', 'error_message']
    list_filter = ['status']
    ordering = ['-run_at']
