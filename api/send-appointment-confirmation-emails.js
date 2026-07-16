// Sends all 4 appointment-confirmation emails (GSM, Salesperson, Customer, Admin)
// via Resend, replacing the dead EmailJS calls previously in appointment-confirm.html.

const https = require('https');
const { isEmailSuppressed, complianceFooter } = require('../lib/emailCompliance');

function sendResendEmail({ to, subject, html }) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      from: 'Express Vehicle Locators <no-reply@expressvehiclelocators.com>',
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

function staffHtml(apptData, role, toName) {
  return `
    <h2 style="color:#2B84FE;">New Appointment — ${role} Notification</h2>
    <p>Hi ${toName || role},</p>
    <p><strong>Customer:</strong> ${apptData.custName || ''}</p>
    <p><strong>Phone:</strong> ${apptData.custPhone || ''}</p>
    <p><strong>Email:</strong> ${apptData.custEmail || ''}</p>
    <p><strong>Vehicle:</strong> ${apptData.vehicle || ''}</p>
    <p><strong>Appointment:</strong> ${apptData.date} at ${apptData.time}</p>
    <p><strong>Dealer:</strong> ${apptData.dealerName || ''}</p>
    <p><strong>Credit Tier:</strong> ${apptData.creditLabel || 'Not provided'}</p>
    <p><strong>Payment Range:</strong> ${apptData.paymentRange || 'Not provided'}</p>
    <p><strong>Notes:</strong> ${apptData.notes || 'None'}</p>
    <p><strong>Confirmation #:</strong> ${apptData.confirmNum || ''}</p>
  `;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apptData = req.body;
  const results = {};

  // 1 — GSM notification
  if (apptData.gsmEmail && !(await isEmailSuppressed(apptData.gsmEmail))) {
    try {
      await sendResendEmail({
        to: apptData.gsmEmail,
        subject: 'New Appointment — ' + (apptData.custName || 'Customer'),
        html: staffHtml(apptData, 'General Sales Manager', apptData.gsmName) + complianceFooter(apptData.gsmEmail)
      });
      results.gsm = 'sent';
    } catch (e) {
      console.error('[send-appointment-confirmation-emails] GSM email failed:', e.message);
      results.gsm = 'failed - ' + e.message;
    }
  } else {
    results.gsm = apptData.gsmEmail ? 'skipped - unsubscribed' : 'skipped - no GSM email provided';
  }

  // 2 — Salesperson notification
  if (apptData.spEmail && !(await isEmailSuppressed(apptData.spEmail))) {
    try {
      await sendResendEmail({
        to: apptData.spEmail,
        subject: 'New Appointment — ' + (apptData.custName || 'Customer'),
        html: staffHtml(apptData, 'Salesperson', apptData.spName) + complianceFooter(apptData.spEmail)
      });
      results.salesperson = 'sent';
    } catch (e) {
      console.error('[send-appointment-confirmation-emails] SP email failed:', e.message);
      results.salesperson = 'failed - ' + e.message;
    }
  } else {
    results.salesperson = apptData.spEmail ? 'skipped - unsubscribed' : 'skipped - no salesperson email provided';
  }

  // 3 — Customer confirmation
  if (apptData.custEmail && !(await isEmailSuppressed(apptData.custEmail))) {
    try {
      const html = `
        <h2 style="color:#2B84FE;">Your Appointment Is Confirmed</h2>
        <p>Hi ${apptData.custName || 'there'},</p>
        <p><strong>${apptData.vehicle || ''}</strong> &mdash; ${apptData.date} at ${apptData.time}</p>
        <p><strong>Dealer:</strong> ${apptData.dealerName || ''}</p>
        <p><strong>Address:</strong> ${apptData.dealerAddress || 'Your EVL advisor will confirm the address'}</p>
        <p><strong>Phone:</strong> ${apptData.dealerPhone || ''}</p>
        <p><strong>Confirmation #:</strong> ${apptData.confirmNum || ''}</p>
        <p>Questions? Call or Text: (469) 404-3192</p>
        <p>&mdash; Express Vehicle Locators</p>
      ` + complianceFooter(apptData.custEmail);
      await sendResendEmail({
        to: apptData.custEmail,
        subject: 'Your EVL Appointment Is Confirmed',
        html
      });
      results.customer = 'sent';
    } catch (e) {
      console.error('[send-appointment-confirmation-emails] Customer email failed:', e.message);
      results.customer = 'failed - ' + e.message;
    }
  } else {
    results.customer = apptData.custEmail ? 'skipped - unsubscribed' : 'skipped - no customer email provided';
  }

  // 4 — EVL Admin alert (to Tim)
  try {
    const adminHtml = staffHtml(apptData, 'Admin', 'Tim');
    await sendResendEmail({
      to: 'togradyevl@gmail.com',
      subject: 'New Appointment Booked — ' + (apptData.custName || 'Customer'),
      html: adminHtml
    });
    results.admin = 'sent';
  } catch (e) {
    console.error('[send-appointment-confirmation-emails] Admin email failed:', e.message);
    results.admin = 'failed - ' + e.message;
  }

  const anySucceeded = Object.values(results).some(v => v === 'sent');

  return res.status(anySucceeded ? 200 : 500).json({
    success: anySucceeded,
    results
  });
};
