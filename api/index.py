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

django_app = get_wsgi_application()

def app(environ, start_response):
    path = environ.get('PATH_INFO', '')
    if path.startswith('/admin') and not path.endswith('/') and '.' not in path:
        environ['PATH_INFO'] = f"{path}/"
    return django_app(environ, start_response)
