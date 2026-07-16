const twilio = require('twilio');
const https = require('https');

function sendResendEmail({ to, subject, html, fromLabel }) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      from: (fromLabel || 'Express Vehicle Locators') + ' <no-reply@expressvehiclelocators.com>',
      reply_to: 'togradyevl@gmail.com',
      to: to,
      subject: subject,
      html: html
    });
    const options = {
      hostname: 'api.resend.com',
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.RESEND_API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    const request = https.request(options, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error('Resend returned ' + response.statusCode + ': ' + data));
        }
      });
    });
    request.on('error', reject);
    request.write(payload);
    request.end();
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    appointmentId,
    customerName,
    vehicleInfo,
    appointmentDate,
    appointmentTime,
    customerPhone,
    customerEmail,
    type
  } = req.body;

  console.log('[send-appointment-notifications] Incoming request:', {
    appointmentId, customerName, customerEmail, type
  });

  const results = {};

  // ── SMS TO CUSTOMER (optional - won't crash if fails) ──
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && twilioPhoneNumber && customerPhone) {
      const client = twilio(accountSid, authToken);
      const normalizedPhone = customerPhone.replace(/\D/g, '');
      const e164Phone = '+1' + normalizedPhone.slice(-10);
      const customerSMS = `Hi ${customerName}, your EVL appointment is confirmed for ${appointmentDate} at ${appointmentTime}. Vehicle: ${vehicleInfo}. Our team will be in touch. -EVL`;
      const customerMsg = await client.messages.create({
        body: customerSMS,
        from: twilioPhoneNumber,
        to: e164Phone
      });
      console.log('[send-appointment-notifications] Customer SMS sent:', customerMsg.sid);
      results.customerSMS = customerMsg.sid;
    } else {
      results.customerSMS = 'skipped - missing phone or Twilio config';
    }
  } catch (smsError) {
    console.error('[send-appointment-notifications] SMS failed (non-fatal):', smsError.message);
    results.customerSMS = 'failed - ' + smsError.message;
  }

  // ── EMAIL TO CUSTOMER via RESEND ──
  if (customerEmail) {
    try {
      const html = `
        <h2 style="color:#2B84FE;">Your Appointment Is Confirmed</h2>
        <p>Hi ${customerName || 'there'},</p>
        <p>Your EVL appointment is confirmed for <strong>${appointmentDate} at ${appointmentTime}</strong>.</p>
        <p>Vehicle: ${vehicleInfo || ''}</p>
        <p>Our team will be in touch. Questions? Call or Text: (469) 404-3192</p>
        <p>&mdash; Express Vehicle Locators</p>
      `;
      await sendResendEmail({
        to: customerEmail,
        subject: 'Your EVL Appointment Is Confirmed',
        html
      });
      console.log('[send-appointment-notifications] Customer email sent via Resend');
      results.customerEmail = 'sent';
    } catch (emailError) {
      console.error('[send-appointment-notifications] Customer email failed:', emailError.message);
      results.customerEmail = 'failed - ' + emailError.message;
    }
  } else {
    results.customerEmail = 'skipped - no email provided';
  }

  // ── EMAIL TO ADMIN (TIM) via RESEND ──
  try {
    const adminHtml = `
      <h2>New Appointment Booked</h2>
      <p><strong>Customer:</strong> ${customerName || ''}</p>
      <p><strong>Phone:</strong> ${customerPhone || ''}</p>
      <p><strong>Email:</strong> ${customerEmail || ''}</p>
      <p><strong>Vehicle:</strong> ${vehicleInfo || ''}</p>
      <p><strong>Appointment:</strong> ${appointmentDate} at ${appointmentTime}</p>
    `;
    await sendResendEmail({
      to: 'togradyevl@gmail.com',
      subject: 'New Appointment Booked - ' + (customerName || 'Customer'),
      html: adminHtml,
      fromLabel: 'EVL Admin Alerts'
    });
    console.log('[send-appointment-notifications] Admin email sent via Resend');
    results.adminEmail = 'sent';
  } catch (adminEmailError) {
    console.error('[send-appointment-notifications] Admin email failed:', adminEmailError.message);
    results.adminEmail = 'failed - ' + adminEmailError.message;
  }

  const smsOk = typeof results.customerSMS === 'string' && !results.customerSMS.startsWith('failed') && !results.customerSMS.startsWith('skipped');
  const customerEmailOk = results.customerEmail === 'sent';
  const adminEmailOk = results.adminEmail === 'sent';
  const overallSuccess = smsOk || customerEmailOk || adminEmailOk;

  return res.status(overallSuccess ? 200 : 500).json({
    success: overallSuccess,
    message: 'Appointment notifications processed',
    results
  });
};
