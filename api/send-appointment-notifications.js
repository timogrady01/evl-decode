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

  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      console.error('[send-appointment-notifications] Missing Twilio credentials');
      return res.status(500).json({ error: 'Twilio credentials not configured' });
    }

    const client = twilio(accountSid, authToken);
    const results = {};

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

    // ── SMS TO EVL (TIM) ──
    const evlPhone = process.env.EVL_ADMIN_PHONE || twilioPhoneNumber;
    const adminSMS = `NEW EVL APPOINTMENT: ${customerName} booked for ${appointmentDate} at ${appointmentTime}. Vehicle: ${vehicleInfo}. Phone: ${customerPhone}. Email: ${customerEmail}.`;

    const adminMsg = await client.messages.create({
      body: adminSMS,
      from: twilioPhoneNumber,
      to: evlPhone
    });

    console.log('[send-appointment-notifications] Admin SMS sent:', adminMsg.sid);
    results.adminSMS = adminMsg.sid;

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
