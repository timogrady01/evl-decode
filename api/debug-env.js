export default async function handler(req, res) {
  return res.status(200).json({
    has_sid: !!process.env.TWILIO_ACCOUNT_SID,
    has_token: !!process.env.TWILIO_AUTH_TOKEN,
    has_phone: !!process.env.TWILIO_PHONE_NUMBER,
    sid_prefix: process.env.TWILIO_ACCOUNT_SID ? process.env.TWILIO_ACCOUNT_SID.substring(0,6) : 'missing',
    node_env: process.env.NODE_ENV
  });
}
