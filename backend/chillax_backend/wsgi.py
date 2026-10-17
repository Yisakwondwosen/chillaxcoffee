"""
WSGI config for chillax_backend project.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chillax_backend.settings')

application = get_wsgi_application()
app = application  # Required for Vercel WSGI serverless runtime
