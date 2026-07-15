const twilio = require('twilio');
const https = require('https');

// Check if this email has unsubscribed - checks evl_email_suppression in Firestore
function isEmailSuppressed(email) {
  return new Promise((resolve) => {
    if (!email) return resolve(false);
    const docId = email.trim().toLowerCase().replace(/\//g, '_SLASH_');
    const projectId = 'evl-acquisition-radar';
    const apiKey = 'AIzaSyCvvH8bYkoHM933iwODK4AlT2T4HVAJzho';
    const path = `/v1/projects/${projectId}/databases/(default)/documents/evl_email_suppression/${encodeURIComponent(docId)}?key=${apiKey}`;
    const options = { hostname: 'firestore.googleapis.com', path, method: 'GET' };
    const request = https.request(options, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        // 200 = document exists = suppressed. 404 = not suppressed.
        resolve(response.statusCode === 200);
      });
    });
    request.on('error', () => resolve(false)); // fail open - don't block sending on a network error
    request.end();
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { customerName, customerPhone, customerEmail } = req.body;
  console.log('[send-welcome-message] Incoming request:', { customerName, customerPhone, customerEmail });

  const firstName = (customerName || '').split(' ')[0] || 'there';
  const homeLink = 'https://expressvehiclelocators.com';

  const results = {};

  // ── WELCOME TEXT TO CUSTOMER ──
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && twilioPhoneNumber && customerPhone) {
      const client = twilio(accountSid, authToken);
      const normalizedPhone = customerPhone.replace(/\D/g, '');
      const e164Phone = '+1' + normalizedPhone.slice(-10);

      const smsBody = `Hi ${firstName}, thank you for your inquiry with Express Vehicle Locators. We received your request and our team will be in touch. Learn more: ${homeLink} Reply STOP to opt out. -EVL`;

      const customerMsg = await client.messages.create({
        body: smsBody,
        from: twilioPhoneNumber,
        to: e164Phone
      });
      console.log('[send-welcome-message] Customer SMS sent:', customerMsg.sid);
      results.customerSMS = customerMsg.sid;
    } else {
      results.customerSMS = 'skipped - missing phone or Twilio config';
    }
  } catch (smsError) {
    console.error('[send-welcome-message] SMS failed (non-fatal):', smsError.message);
    results.customerSMS = 'failed - ' + smsError.message;
  }

  // ── WELCOME EMAIL TO CUSTOMER via RESEND ──
  if (customerEmail) {
    const suppressed = await isEmailSuppressed(customerEmail);
    if (suppressed) {
      console.log('[send-welcome-message] Email skipped - unsubscribed:', customerEmail);
      results.customerEmail = 'skipped - unsubscribed';
    } else {
    try {
      const unsubLink = `${homeLink}/unsubscribe?email=${encodeURIComponent(customerEmail)}`;
      const htmlBody = `
        <h2 style="color:#2B84FE;">What Express Vehicle Locators Actually Does For You</h2>
        <p>Hi ${firstName},</p>
        <p>Thank you for your inquiry with Express Vehicle Locators!</p>
        <p>Before you ever walk onto a dealer lot, here's what you're up against:</p>
        <ul>
          <li>New cars typically sell 3-5% over invoice in 2026 &mdash; often $2,000 to $6,000 above what the dealer actually paid, depending on the vehicle.</li>
          <li>Used cars usually carry a 15-25% markup over the dealer's cost &mdash; commonly $1,500 to $4,000 more than they paid, according to Edmunds.</li>
          <li>Industry data (NADA) puts the average dealer's gross profit margin on a new car sale at right around 3.9% &mdash; but that's before financing markup, add-ons, and holdback money most buyers never see.</li>
        </ul>
        <p>That's the gap Express Vehicle Locators exists to close.</p>
        <p>We're a technology platform built by someone who has spent years on the actual dealership floor &mdash; not a broker, not a lender, not a dealer ourselves. We give you the real numbers before you negotiate, so you're working from facts instead of guesswork.</p>
        <p><a href="${homeLink}">See how it works &rarr;</a></p>
        <p>Questions? Call or Text: (469) 404-3192</p>
        <p>&mdash; Express Vehicle Locators</p>
        <hr style="border:none;border-top:1px solid #ddd;margin:24px 0;">
        <p style="font-size:12px;color:#888;">
          Evest Data Technology &mdash; 6860 North Dallas Parkway STE# 200, Plano, TX 75024<br>
          <a href="${unsubLink}" style="color:#888;">Unsubscribe</a> &middot; <a href="${homeLink}/terms" style="color:#888;">Terms and Conditions</a>
        </p>
      `;
      const payload = JSON.stringify({
        from: 'Express Vehicle Locators <no-reply@expressvehiclelocators.com>',
        reply_to: 'togradyevl@gmail.com',
        to: customerEmail,
        subject: 'What Express Vehicle Locators Actually Does For You',
        html: htmlBody
      });

      await new Promise((resolve, reject) => {
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
            console.log('[send-welcome-message] Resend response:', response.statusCode, data);
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

      console.log('[send-welcome-message] Customer email sent via Resend');
      results.customerEmail = 'sent';
    } catch (emailError) {
      console.error('[send-welcome-message] Customer email failed:', emailError.message);
      results.customerEmail = 'failed - ' + emailError.message;
    }
    }
  } else {
    results.customerEmail = 'skipped - no email provided';
  }

  const smsOk = typeof results.customerSMS === 'string' && !results.customerSMS.startsWith('failed') && !results.customerSMS.startsWith('skipped');
  const emailOk = results.customerEmail === 'sent';
  const overallSuccess = smsOk || emailOk;

  return res.status(overallSuccess ? 200 : 500).json({
    success: overallSuccess,
    results
  });
};
