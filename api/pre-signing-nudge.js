const twilio = require('twilio');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    appointmentId,
    customerName,
    customerPhone,
    dealerName
  } = req.body;

  console.log('[pre-signing-nudge] Incoming SMS request:', {
    appointmentId,
    customerName,
    customerPhone
  });

  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      console.error('[pre-signing-nudge] Missing Twilio credentials');
      return res.status(500).json({ error: 'Twilio credentials not configured' });
    }

    const client = twilio(accountSid, authToken);

    if (!customerPhone) {
      console.error('[pre-signing-nudge] No customer phone provided');
      return res.status(400).json({ error: 'Customer phone number is required' });
    }

    const normalizedPhone = customerPhone.replace(/\D/g, '');
    const e164Phone = '+1' + normalizedPhone.slice(-10);

    console.log('[pre-signing-nudge] Sending SMS to:', e164Phone);

    const smsBody = `Hi ${customerName}, before you sign, review your fair deal worksheet at expressvehiclelocators.com/fair-deal-worksheet. You have leverage. -EVL`;

    const message = await client.messages.create({
      body: smsBody,
      from: twilioPhoneNumber,
      to: e164Phone
    });

    console.log('[pre-signing-nudge] SMS sent successfully:', message.sid);

    return res.status(200).json({
      success: true,
      message: 'Pre-signing nudge SMS sent successfully',
      appointmentId: appointmentId,
      customerPhone: e164Phone,
      messageSid: message.sid
    });

  } catch (error) {
    console.error('[pre-signing-nudge] Error:', error);
    return res.status(500).json({ error: 'Failed to send SMS', details: error.message });
  }
};
