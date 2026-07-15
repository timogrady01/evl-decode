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
        resolve(response.statusCode === 200);
      });
    });
    request.on('error', () => resolve(false));
    request.end();
  });
}

// ── BUCKET → STRIPE PAYMENT LINK MAP ──
const PAYMENT_LINKS = {
  'find-my-vehicle': {
    url: 'https://buy.stripe.com/test_6oU00k82P9Yo4IB1GG8ww01',
    label: 'Find My Vehicle',
    price: '$49'
  },
  'advisory': {
    url: 'https://buy.stripe.com/test_9B6aEY0Anb2scb31GG8ww02',
    label: 'Advisory',
    price: '$249'
  },
  'full-service': {
    url: 'https://buy.stripe.com/test_8x24gAbf14E46QJbhg8ww03',
    label: 'Full Service',
    price: '$399'
  },
  'service-vault-99': {
    url: 'https://buy.stripe.com/test_3cI8wQ3MzeeEcb39988ww04',
    label: 'Service Vault',
    price: '$99/year'
  },
  'service-vault-199': {
    url: 'https://buy.stripe.com/test_8x2eVeaaX7Qgfnf4SS8ww05',
    label: 'Service Vault',
    price: '$199/year'
  },
  'service-vault-299': {
    url: 'https://buy.stripe.com/test_7sY6oI6YL3A02At3O08ww06',
    label: 'Service Vault',
    price: '$299/year'
  }
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { customerName, customerPhone, customerEmail, bucket, leadId } = req.body;
  console.log('[send-payment-link] Incoming request:', { customerName, customerPhone, customerEmail, bucket, leadId });

  const linkInfo = PAYMENT_LINKS[bucket];
  if (!linkInfo) {
    return res.status(400).json({ error: 'Unknown bucket: ' + bucket });
  }

  const results = {};

  // ── SMS TO CUSTOMER ──
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && twilioPhoneNumber && customerPhone) {
      const client = twilio(accountSid, authToken);
      const normalizedPhone = customerPhone.replace(/\D/g, '');
      const e164Phone = '+1' + normalizedPhone.slice(-10);
      const firstName = (customerName || '').split(' ')[0] || 'there';
      const smsBody = `Hi ${firstName}, thanks for talking with EVL! Here's your secure payment link for ${linkInfo.label} (${linkInfo.price}): ${linkInfo.url} Reply STOP to opt out. -EVL`;

      const customerMsg = await client.messages.create({
        body: smsBody,
        from: twilioPhoneNumber,
        to: e164Phone
      });
      console.log('[send-payment-link] Customer SMS sent:', customerMsg.sid);
      results.customerSMS = customerMsg.sid;
    } else {
      results.customerSMS = 'skipped - missing phone or Twilio config';
    }
  } catch (smsError) {
    console.error('[send-payment-link] SMS failed (non-fatal):', smsError.message);
    results.customerSMS = 'failed - ' + smsError.message;
  }

  // ── EMAIL TO CUSTOMER via RESEND ──
  if (customerEmail) {
    const suppressed = await isEmailSuppressed(customerEmail);
    if (suppressed) {
      console.log('[send-payment-link] Email skipped - unsubscribed:', customerEmail);
      results.customerEmail = 'skipped - unsubscribed';
    } else {
    try {
      const firstName = (customerName || '').split(' ')[0] || 'there';
      const unsubLink = `https://expressvehiclelocators.com/unsubscribe?email=${encodeURIComponent(customerEmail)}`;
      const htmlBody = `
        <h2 style="color:#2B84FE;">Your EVL Payment Link</h2>
        <p>Hi ${firstName},</p>
        <p>Thank you for your interest in Express Vehicle Locators! Here is your secure payment link for <strong>${linkInfo.label} (${linkInfo.price})</strong>:</p>
        <p><a href="${linkInfo.url}">${linkInfo.url}</a></p>
        <p>Questions? Call or Text: (469) 404-3192</p>
        <p><a href="https://expressvehiclelocators.com">Visit our home page &rarr;</a></p>
        <p>— EVL</p>
        <hr style="border:none;border-top:1px solid #ddd;margin:24px 0;">
        <p style="font-size:12px;color:#888;">
          Evest Data Technology &mdash; 6860 North Dallas Parkway STE# 200, Plano, TX 75024<br>
          <a href="${unsubLink}" style="color:#888;">Unsubscribe</a> &middot; <a href="https://expressvehiclelocators.com/terms" style="color:#888;">Terms and Conditions</a>
        </p>
      `;
      const payload = JSON.stringify({
        from: 'Express Vehicle Locators <no-reply@expressvehiclelocators.com>',
        reply_to: 'togradyevl@gmail.com',
        to: customerEmail,
        subject: 'Your EVL Payment Link — ' + linkInfo.label + ' (' + linkInfo.price + ')',
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
            console.log('[send-payment-link] Resend response:', response.statusCode, data);
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

      console.log('[send-payment-link] Customer email sent via Resend');
      results.customerEmail = 'sent';
    } catch (emailError) {
      console.error('[send-payment-link] Customer email failed:', emailError.message);
      results.customerEmail = 'failed - ' + emailError.message;
    }
    }
  } else {
    results.customerEmail = 'skipped - no email provided';
  }

  // ── DETERMINE REAL SUCCESS (at least one channel must have actually sent) ──
  const smsOk = typeof results.customerSMS === 'string' && !results.customerSMS.startsWith('failed') && !results.customerSMS.startsWith('skipped');
  const emailOk = results.customerEmail === 'sent';
  const overallSuccess = smsOk || emailOk;

  return res.status(overallSuccess ? 200 : 500).json({
    success: overallSuccess,
    bucket,
    linkSent: linkInfo.url,
    results
  });
};
