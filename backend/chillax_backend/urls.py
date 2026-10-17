"""
chillax_backend URL Configuration
"""
from django.contrib import admin
from django.urls import path, include
from api.views import root_landing_view

urlpatterns = [
    path('', root_landing_view, name='root_landing'),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
