"""
SMS Service — MSG91 integration for OTP delivery.
Supports: MSG91 (primary), console fallback (dev mode).
"""
import hashlib
import json
import logging
import os
import urllib.request
import urllib.error
from django.conf import settings

logger = logging.getLogger('accounts')


def send_otp_sms(mobile, otp):
    """
    Send OTP via MSG91 API.
    Returns: {'success': bool, 'method': str, 'error': str|None}
    """
    # Format mobile number with country code
    full_number = f"+91{mobile}" if not mobile.startswith('+') else mobile
    clean_number = full_number.replace('+', '')

    # Check if MSG91 is configured
    auth_key = getattr(settings, 'MSG91_AUTH_KEY', '')
    template_id = getattr(settings, 'MSG91_TEMPLATE_ID', '')
    
    if auth_key:
        # Production: Send via MSG91 API
        try:
            payload = {
                "mobile": clean_number,
                "otp": otp,
                "otp_length": 6,
                "otp_expiry": getattr(settings, 'OTP_EXPIRY_SECONDS', 60),
            }
            if template_id:
                payload["template_id"] = template_id

            data = json.dumps(payload).encode('utf-8')
            req = urllib.request.Request(
                'https://api.msg91.com/api/v5/otp',
                data=data,
                headers={
                    'authkey': auth_key,
                    'Content-Type': 'application/json',
                },
                method='POST',
            )
            
            with urllib.request.urlopen(req, timeout=10) as resp:
                body = json.loads(resp.read().decode('utf-8'))
                
                if body.get('type') == 'success':
                    logger.info(f'[MSG91] OTP sent to {clean_number}')
                    return {'success': True, 'method': 'msg91', 'error': None}
                else:
                    error_msg = body.get('message', 'Unknown MSG91 error')
                    logger.error(f'[MSG91] Failed: {error_msg}')
                    return {'success': False, 'method': 'msg91', 'error': error_msg}

        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8', errors='replace')
            logger.error(f'[MSG91] HTTP {e.code}: {error_body}')
            return {'success': False, 'method': 'msg91', 'error': f'SMS service error ({e.code})'}
        except Exception as e:
            logger.error(f'[MSG91] Exception: {e}')
            return {'success': False, 'method': 'msg91', 'error': str(e)}
    
    # Dev mode: log OTP to console (never send real SMS)
    logger.info(f'[DEV SMS] Mobile: {mobile} OTP: {otp}')
    print(f'\n{"="*50}')
    print(f'[DEV SMS] OTP for {mobile}: {otp}')
    print(f'[DEV SMS] MSG91 not configured — OTP logged to console only')
    print(f'{"="*50}\n')
    return {'success': True, 'method': 'console', 'error': None}


def send_admin_otp_sms(mobile, otp):
    """Send admin OTP — same as user OTP but with different logging."""
    return send_otp_sms(mobile, otp)
