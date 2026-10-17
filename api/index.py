"""
Vercel Serverless Function entry point for Django Backend.
"""
import os
import sys

# Ensure backend directory is in Python path
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(base_dir, 'backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

current_backend = os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend'))
if current_backend not in sys.path:
    sys.path.insert(0, current_backend)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chillax_backend.settings')

from django.core.wsgi import get_wsgi_application

app = get_wsgi_application()
