// api/send-sms.js
// EVL Twilio SMS Serverless Function
// Sits between the auction page and Twilio — keeps credentials hidden and secure

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, message } = req.body;

  // Basic validation
  if (!to || !message) {
    return res.status(400).json({ error: 'Missing required fields: to, message' });
  }

  // Normalize phone number to E.164 format (Twilio requirement)
  // Strips parentheses, dashes, spaces, dots — keeps digits only, then adds +1
  function normalizePhone(raw) {
    let digits = raw.replace(/[^\d]/g, ''); // strip everything except digits
    if (digits.length === 10) digits = '1' + digits; // assume US if 10 digits
    if (digits.length === 11 && digits.startsWith('1')) return '+' + digits;
    if (raw.trim().startsWith('+')) return raw.trim(); // already E.164
    return '+' + digits; // fallback
  }

  const toFormatted = normalizePhone(to);

  // Credentials pulled from Vercel environment variables (never exposed in code)
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return res.status(500).json({ error: 'Twilio credentials not configured' });
  }

  try {
    // Call Twilio REST API directly (no SDK needed)
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const body = new URLSearchParams({
      To:   toFormatted,
      From: fromNumber,
      Body: message
    });

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type':  'application/x-www-form-urlencoded'
        },
        body: body.toString()
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Twilio error:', data);
      return res.status(response.status).json({ error: data.message || 'Twilio error' });
    }

    return res.status(200).json({ success: true, sid: data.sid });

  } catch (err) {
    console.error('SMS send error:', err);
    return res.status(500).json({ error: 'Failed to send SMS' });
  }
}
