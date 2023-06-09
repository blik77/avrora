# -*- coding: utf-8 -*-
import os, sys
sys.path.insert(0, '/var/www/u0900157/data/www/avrora.kasckadc.ru/web_project')
sys.path.insert(1, '/var/www/u0900157/data/avroraenv/lib/python3.9/site-packages')
os.environ['DJANGO_SETTINGS_MODULE'] = 'web_project.settings'
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
