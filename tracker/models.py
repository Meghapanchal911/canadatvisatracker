from django.db import models

class VisaType(models.Model):
    """
    Represents a type of Canadian visa or immigration stream.
    Example: Federal Skilled Worker, Canadian Experience Class, etc.
    """
    code = models.CharField(max_length=100, unique=True)  
    # Short code like "FSW", "CEC", "TR" — unique means no duplicates
    
    name = models.CharField(max_length=200)              
    # Full name like "Federal Skilled Worker"
    
    category = models.CharField(max_length=100)          
    # Category like "Permanent Residence" or "Temporary"
    
    created_at = models.DateTimeField(auto_now_add=True) 
    # Automatically saves the date/time when this record is first created

    def __str__(self):
        return f"{self.code} - {self.name}"
        # This controls how the object looks in Django admin and print statements


class ProcessingSnapshot(models.Model):
    """
    A single data point: on a given date, what was the processing
    time for a specific visa type?
    This table grows daily as the scraper runs.
    """
    visa_type = models.ForeignKey(
        VisaType, 
        on_delete=models.CASCADE,  
        # If a VisaType is deleted, delete all its snapshots too
        related_name='snapshots'   
        # Lets you do visa_type.snapshots.all() to get all snapshots for a visa
    )
    
    scraped_date = models.DateField()                    
    # The date this data point was captured, e.g. 2026-04-25
    
    country_code = models.CharField(max_length=5, default='')
    # Two-letter country code e.g. "IN", "CA", "US"

    processing_days = models.IntegerField()              
    # Processing time in days as reported by IRCC, e.g. 18
    
    source_url = models.URLField(max_length=500)         
    # Where we scraped this from — good for debugging
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['visa_type', 'scraped_date', 'country_code']  
        # Prevents saving duplicate data for the same visa on the same day
        ordering = ['-scraped_date']                     
        # Default sort: newest first

    def __str__(self):
        return f"{self.visa_type.code} | {self.scraped_date} | {self.processing_days} days"


class ScrapeLog(models.Model):
    """
    A log entry for every time the scraper runs.
    Lets you see scraper history, debug failures, and track reliability.
    """
    STATUS_CHOICES = [
        ('success', 'Success'),
        ('failed', 'Failed'),
    ]
    
    run_at = models.DateTimeField(auto_now_add=True)     
    # When the scraper ran
    
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    # Either "success" or "failed"
    
    records_saved = models.IntegerField(default=0)       
    # How many new snapshots were saved in this run
    
    error_message = models.TextField(blank=True)         
    # Empty if success, contains the error if failed

    def __str__(self):
        return f"{self.run_at} | {self.status} | {self.records_saved} records"