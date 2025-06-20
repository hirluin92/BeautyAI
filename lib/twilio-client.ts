import twilio from 'twilio';

// Bypass SSL verification in development to avoid self-signed certificate errors
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  throw new Error('Twilio credentials are not set in environment variables.');
}

const twilioClient = twilio(accountSid, authToken);

export default twilioClient; 