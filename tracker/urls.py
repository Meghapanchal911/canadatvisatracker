from django.urls import path
from .views import (
    VisaTypeListView,
    SnapshotListView,
    TrendsView,
    LastUpdatedView,
)

urlpatterns = [
    path('visa-types/',   VisaTypeListView.as_view(),  name='visa-types'),
    path('snapshots/',    SnapshotListView.as_view(),  name='snapshots'),
    path('trends/',       TrendsView.as_view(),        name='trends'),
    path('last-updated/', LastUpdatedView.as_view(),   name='last-updated'),
]