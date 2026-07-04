const twilio = require('twilio');

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
    appointmentId,
    customerName,
    customerEmail,
    type
  });

  const results = {};

  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      console.error('[send-appointment-notifications] Missing Twilio credentials');
      return res.status(500).json({ error: 'Twilio credentials not configured' });
    }

    const client = twilio(accountSid, authToken);

    // ── SMS TO CUSTOMER ──
    if (customerPhone) {
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
    }

    // ── EMAIL TO CUSTOMER via EmailJS ──
    if (customerEmail) {
      try {
        const emailjsResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: 'service_rvscjt3',
            template_id: 'template_vq2a756',
            user_id: 'iilAte2T5SzOKb-fn',
            template_params: {
              customerName: customerName,
              appointmentDate: appointmentDate,
              appointmentTime: appointmentTime,
              vehicleInfo: vehicleInfo,
              email: customerEmail
            }
          })
        });
        console.log('[send-appointment-notifications] Customer email sent via EmailJS');
        results.customerEmail = 'sent';
      } catch (emailError) {
        console.error('[send-appointment-notifications] Customer email error:', emailError);
        results.customerEmail = 'failed';
      }
    }

    // ── EMAIL TO ADMIN (TIM) via EmailJS ──
    try {
      const adminEmailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: 'service_rvscjt3',
          template_id: 'template_1rnlq4o',
          user_id: 'iilAte2T5SzOKb-fn',
          template_params: {
            customerName: customerName,
            customerPhone: customerPhone,
            customerEmail: customerEmail,
            vehicleInfo: vehicleInfo,
            appointmentDate: appointmentDate,
            appointmentTime: appointmentTime,
            email: 'togradyevl@gmail.com'
          }
        })
      });
      console.log('[send-appointment-notifications] Admin email sent via EmailJS');
      results.adminEmail = 'sent';
    } catch (adminEmailError) {
      console.error('[send-appointment-notifications] Admin email error:', adminEmailError);
      results.adminEmail = 'failed';
    }

    return res.status(200).json({
      success: true,
      message: 'Appointment notifications sent',
      results
    });

  } catch (error) {
    console.error('[send-appointment-notifications] Error:', error);
    return res.status(500).json({ error: 'Failed to send notifications', details: error.message });
  }
};
