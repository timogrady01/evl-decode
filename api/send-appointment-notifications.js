import nodemailer from 'nodemailer';

export default async function handler(req, res) {
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
    // ════════════════════════════════════════════════════════════════
    // SEND EMAIL VIA EmailJS
    // ════════════════════════════════════════════════════════════════

    if (!customerEmail) {
      console.error('[send-appointment-notifications] No customer email provided');
      return res.status(400).json({ error: 'Customer email is required' });
    }

    // EmailJS credentials (from userMemories)
    const emailjsServiceId = 'service_rvscjt3';
    const emailjsPublicKey = 'iilAte2T5SzOKb-fn';

    // Template IDs (from newly created templates)
    const customerTemplateId = 'template_vq2a756'; // EVL-APPT-CONFIRMATION
    const adminTemplateId = 'template_1rnlq4o';    // EVL-APPT-ADMIN
    const adminEmail = 'togradyevl@gmail.com';

    // ════════════════════════════════════════════════════════════════
    // SEND TO CUSTOMER
    // ════════════════════════════════════════════════════════════════

    console.log('[send-appointment-notifications] Sending customer confirmation email to:', customerEmail);

    const customerEmailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: emailjsServiceId,
        template_id: customerTemplateId,
        user_id: emailjsPublicKey,
        template_params: {
          to_email: customerEmail,
          customerName: customerName,
          appointmentDate: appointmentDate,
          appointmentTime: appointmentTime,
          vehicleInfo: vehicleInfo
        }
      })
    });

    const customerEmailData = await customerEmailResponse.json();

    if (!customerEmailResponse.ok) {
      console.error('[send-appointment-notifications] Customer email failed:', customerEmailData);
      return res.status(500).json({ error: 'Failed to send customer email', details: customerEmailData });
    }

    console.log('[send-appointment-notifications] Customer email sent successfully');

    // ════════════════════════════════════════════════════════════════
    // SEND TO ADMIN
    // ════════════════════════════════════════════════════════════════

    console.log('[send-appointment-notifications] Sending admin alert email to:', adminEmail);

    const adminEmailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: emailjsServiceId,
        template_id: adminTemplateId,
        user_id: emailjsPublicKey,
        template_params: {
          to_email: adminEmail,
          customerName: customerName,
          customerPhone: customerPhone,
          customerEmail: customerEmail,
          vehicleInfo: vehicleInfo,
          appointmentDate: appointmentDate,
          appointmentTime: appointmentTime
        }
      })
    });

    const adminEmailData = await adminEmailResponse.json();

    if (!adminEmailResponse.ok) {
      console.error('[send-appointment-notifications] Admin email failed:', adminEmailData);
      return res.status(500).json({ error: 'Failed to send admin email', details: adminEmailData });
    }

    console.log('[send-appointment-notifications] Admin email sent successfully');

    // ════════════════════════════════════════════════════════════════
    // SUCCESS RESPONSE
    // ════════════════════════════════════════════════════════════════

    return res.status(200).json({
      success: true,
      message: 'Both emails sent successfully',
      appointmentId: appointmentId,
      customerEmail: customerEmail,
      adminEmail: adminEmail
    });

  } catch (error) {
    console.error('[send-appointment-notifications] Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
