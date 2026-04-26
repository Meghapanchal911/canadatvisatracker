from django.urls import path
from .views import (
    VisaTypeListView,
    SnapshotListView,
    TrendsView,
    LastUpdatedView,
    ScrapeLogListView,
    StatsView,
)

urlpatterns = [
    path('visa-types/',   VisaTypeListView.as_view(),  name='visa-types'),
    path('snapshots/',    SnapshotListView.as_view(),  name='snapshots'),
    path('trends/',       TrendsView.as_view(),        name='trends'),
    path('last-updated/', LastUpdatedView.as_view(),   name='last-updated'),
    path('scrape-logs/',  ScrapeLogListView.as_view(), name='scrape-logs'),
    path('stats/',        StatsView.as_view(),         name='stats'),
]