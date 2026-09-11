"""
SMS Notification Service — Twilio integration.
Sends status updates via SMS for each application stage.
Ready for production — currently logs to console for hackathon demo.
"""
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

# Status messages in English + Hindi
STATUS_MESSAGES = {
    'submitted': {
        'en': 'Your application {app_id} has been submitted successfully. We will review it shortly.',
        'hi': 'आपका आवेदन {app_id} सफलतापूर्वक जमा हो गया है। हम इसकी समीक्षा जल्द ही करेंगे।',
    },
    'under_review': {
        'en': 'Your application {app_id} is now under review. Track status at: {url}',
        'hi': 'आपका आवेदन {app_id} अब समीक्षा के अधीन है। स्थिति देखें: {url}',
    },
    'documents_needed': {
        'en': 'Action needed: Your application {app_id} requires additional documents. Please upload at: {url}',
        'hi': 'कार्रवाई आवश्यक: आपके आवेदन {app_id} के लिए अतिरिक्त दस्तावेज़ चाहिए। कृपया अपलोड करें: {url}',
    },
    'approved': {
        'en': 'Congratulations! Your application {app_id} has been APPROVED. Visit your bank to complete formalities.',
        'hi': 'बधाई हो! आपका आवेदन {app_id} स्वीकृत हो गया है। औपचारिकताएं पूरी करने के लिए बैंक जाएं।',
    },
    'rejected': {
        'en': 'Your application {app_id} could not be approved. For details, contact your assigned bank or raise a grievance.',
        'hi': 'आपका आवेदन {app_id} स्वीकृत नहीं हो सका। विवरण के लिए बैंक से संपर्क करें या शिकायत दर्ज करें।',
    },
    'disbursed': {
        'en': 'Loan disbursed! ₹{amount} from application {app_id} has been credited to your account.',
        'hi': 'ऋण वितरित! आवेदन {app_id} से ₹{amount} आपके खाते में जमा कर दिया गया है।',
    },
}


def send_status_update(
    phone: str,
    application_number: str,
    status: str,
    amount: float = 0,
    language: str = 'en',
) -> bool:
    """
    Send SMS status update to the applicant.

    In hackathon mode: logs the message to console.
    In production: sends via Twilio API.

    Returns True if sent successfully.
    """
    template = STATUS_MESSAGES.get(status, {})
    message_text = template.get(language, template.get('en', ''))

    url = 'https://govt-platform.in/status'  # Placeholder URL

    message_text = message_text.format(
        app_id=application_number,
        url=url,
        amount=f'{amount:,.0f}' if amount else '0',
    )

    logger.info(f'SMS → {phone}: {message_text}')

    # --- Twilio Integration (activate in production) ---
    # if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
    #     from twilio.rest import Client
    #     client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    #     message = client.messages.create(
    #         body=message_text,
    #         from_=settings.TWILIO_PHONE_NUMBER,
    #         to=f'+91{phone}',
    #     )
    #     logger.info(f'Twilio SID: {message.sid}')
    #     return True

    return True


def send_otp_sms(phone: str, otp: str) -> bool:
    """Send OTP via SMS."""
    message_text = f'Your OTP for GovTech Scheme Platform is: {otp}. Valid for 5 minutes. Do not share.'
    logger.info(f'SMS OTP → {phone}: {message_text}')
    return True
