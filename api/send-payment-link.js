const twilio = require('twilio');

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

  // ── EMAIL TO CUSTOMER via EmailJS ──
  if (customerEmail) {
    try {
      await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: 'service_rvscjt3',
          template_id: 'template_5kvb9cb',
          user_id: 'iilAte2T5SzOKb-fn',
          template_params: {
            customerName: customerName,
            email: customerEmail,
            bucketLabel: linkInfo.label,
            bucketPrice: linkInfo.price,
            paymentLink: linkInfo.url
          }
        })
      });
      console.log('[send-payment-link] Customer email sent via EmailJS');
      results.customerEmail = 'sent';
    } catch (emailError) {
      console.error('[send-payment-link] Customer email failed:', emailError.message);
      results.customerEmail = 'failed - ' + emailError.message;
    }
  } else {
    results.customerEmail = 'skipped - no email provided';
  }

  return res.status(200).json({
    success: true,
    bucket,
    linkSent: linkInfo.url,
    results
  });
};
