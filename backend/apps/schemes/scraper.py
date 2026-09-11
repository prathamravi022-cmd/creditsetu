# -*- coding: utf-8 -*-
"""myScheme & JanSamarth Scraper Service"""
import json, logging, hashlib, time
from decimal import Decimal
import requests
from django.utils import timezone

logger = logging.getLogger(__name__)
MYSCHEME_SEARCH = "https://www.myscheme.gov.in/api/scheme-listing"
JANSAMARTH_SCHEMES = "https://www.jansamarth.in/api/v1/scheme/getAllSchemes"
MOSJE_MINISTRY = "Ministry of Social Justice and Empowerment"
HEADERS = {"User-Agent": "Mozilla/5.0", "Accept": "application/json"}
REQUEST_TIMEOUT = 15

