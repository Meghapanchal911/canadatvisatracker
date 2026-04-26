from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import VisaType, ProcessingSnapshot, ScrapeLog
from datetime import date


class VisaTypeModelTest(TestCase):
    """Tests for the VisaType model"""

    def setUp(self):
        # This runs before every test
        # Creates a sample VisaType we can use in tests
        self.visa = VisaType.objects.create(
            code='study',
            name='Study Permit',
            category='Temporary Residence'
        )

    def test_visa_type_created_correctly(self):
        """Test that a VisaType saves and retrieves correctly"""
        visa = VisaType.objects.get(code='study')
        self.assertEqual(visa.name, 'Study Permit')
        self.assertEqual(visa.category, 'Temporary Residence')

    def test_visa_type_str(self):
        """Test the string representation"""
        self.assertEqual(str(self.visa), 'study - Study Permit')

    def test_duplicate_code_not_allowed(self):
        """Test that two VisaTypes cannot have the same code"""
        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            VisaType.objects.create(
                code='study',  # duplicate
                name='Another Study',
                category='Temporary Residence'
            )


class ProcessingSnapshotModelTest(TestCase):
    """Tests for the ProcessingSnapshot model"""

    def setUp(self):
        self.visa = VisaType.objects.create(
            code='work',
            name='Work Permit',
            category='Temporary Residence'
        )
        self.snapshot = ProcessingSnapshot.objects.create(
            visa_type=self.visa,
            scraped_date=date.today(),
            processing_days=45,
            country_code='IN',
            source_url='https://example.com'
        )

    def test_snapshot_created_correctly(self):
        """Test that a snapshot saves correctly"""
        snap = ProcessingSnapshot.objects.get(
            visa_type=self.visa,
            country_code='IN'
        )
        self.assertEqual(snap.processing_days, 45)

    def test_snapshot_str(self):
        """Test the string representation"""
        self.assertIn('work', str(self.snapshot))
        self.assertIn('45', str(self.snapshot))


class VisaTypeAPITest(APITestCase):
    """Tests for the /api/visa-types/ endpoint"""

    def setUp(self):
        VisaType.objects.create(code='study', name='Study Permit', category='Temporary Residence')
        VisaType.objects.create(code='work', name='Work Permit', category='Temporary Residence')

    def test_get_visa_types_returns_200(self):
        """Test that the endpoint returns 200 OK"""
        response = self.client.get('/api/visa-types/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_visa_types_returns_correct_count(self):
        """Test that all visa types are returned"""
        response = self.client.get('/api/visa-types/')
        self.assertEqual(len(response.data), 2)

    def test_get_visa_types_has_correct_fields(self):
        """Test that response includes expected fields"""
        response = self.client.get('/api/visa-types/')
        first = response.data[0]
        self.assertIn('code', first)
        self.assertIn('name', first)
        self.assertIn('category', first)


class TrendsAPITest(APITestCase):
    """Tests for the /api/trends/ endpoint"""

    def setUp(self):
        self.visa = VisaType.objects.create(
            code='study',
            name='Study Permit',
            category='Temporary Residence'
        )
        ProcessingSnapshot.objects.create(
            visa_type=self.visa,
            scraped_date=date.today(),
            processing_days=21,
            country_code='IN',
            source_url='https://example.com'
        )

    def test_trends_returns_200(self):
        response = self.client.get('/api/trends/?country_code=IN')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_trends_invalid_country_returns_400(self):
        """Test that invalid country code returns 400"""
        response = self.client.get('/api/trends/?country_code=INVALID')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_trends_returns_processing_days(self):
        """Test that correct processing days are returned"""
        response = self.client.get('/api/trends/?country_code=IN')
        study = next((t for t in response.data if t['visa_code'] == 'study'), None)
        self.assertIsNotNone(study)
        self.assertEqual(study['processing_days'], 21)


class StatsAPITest(APITestCase):
    """Tests for the /api/stats/ endpoint"""

    def test_stats_returns_200(self):
        response = self.client.get('/api/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_stats_has_required_fields(self):
        response = self.client.get('/api/stats/')
        self.assertIn('total_snapshots', response.data)
        self.assertIn('total_visa_types', response.data)
        self.assertIn('total_countries', response.data)