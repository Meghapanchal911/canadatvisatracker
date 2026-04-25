import django
import os
import sys
from datetime import date

# This is needed to use Django models from outside a Django view
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from tracker.models import VisaType, ProcessingSnapshot, ScrapeLog
from scraper.fetch import fetch_processing_times
from scraper.parse import parse_processing_times


def run_pipeline():
    """
    Orchestrates the full scrape → parse → save pipeline.
    1. Fetch raw data from IRCC
    2. Parse into clean records
    3. Save to database
    4. Log the result
    """
    print("🚀 Starting pipeline...")
    records_saved = 0

    try:
        # Step 1 — Fetch
        raw_data = fetch_processing_times()
        if raw_data is None:
            raise Exception("fetch_processing_times() returned None")

        # Step 2 — Parse
        records = parse_processing_times(raw_data)
        if not records:
            raise Exception("parse_processing_times() returned empty list")

        # Step 3 — Save to database
        for record in records:

            # get_or_create checks if this VisaType already exists
            # If it does, it returns the existing one
            # If it doesn't, it creates a new one
            # This means running the scraper daily won't create duplicate VisaTypes
            visa_type, created = VisaType.objects.get_or_create(
                code=record['visa_code'],
                defaults={
                    'name':     record['visa_name'],
                    'category': record['category'],
                }
            )

            if created:
                print(f"  ➕ Created new VisaType: {visa_type.code}")

            # update_or_create checks if a snapshot already exists
            # for this visa_type + scraped_date combination
            # If today's snapshot exists, update it
            # If not, create a new one
            snapshot, snap_created = ProcessingSnapshot.objects.update_or_create(
                visa_type=visa_type,
                scraped_date=record['scraped_date'],
                country_code=record['country_code'] if hasattr(ProcessingSnapshot, 'country_code') else None,
                defaults={
                    'processing_days': record['processing_days'],
                    'source_url':      'https://www.canada.ca/content/dam/ircc/documents/json/data-ptime-en.json',
                }
            )

            if snap_created:
                records_saved += 1

        print(f"✅ Pipeline complete. {records_saved} new records saved to database.")

        # Step 4 — Log success
        ScrapeLog.objects.create(
            status='success',
            records_saved=records_saved,
            error_message=''
        )

    except Exception as e:
        # Log the failure so you can debug it later
        print(f"❌ Pipeline failed: {e}")
        ScrapeLog.objects.create(
            status='failed',
            records_saved=0,
            error_message=str(e)
        )


if __name__ == '__main__':
    run_pipeline()