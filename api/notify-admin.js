// General-purpose admin notification email.
// Any page can POST { subject, message } (plain text/HTML message body) here
// to alert Tim at togradyevl@gmail.com, instead of each page needing its own
// EmailJS/Resend integration.

const https = require('https');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { subject, message, htmlBody } = req.body;
  console.log('[notify-admin] Incoming:', subject);

  const finalHtml = htmlBody || `<div style="font-family:sans-serif;white-space:pre-wrap;">${message || 'No message provided'}</div>`;

  const payload = JSON.stringify({
    from: 'EVL Admin Alerts <no-reply@expressvehiclelocators.com>',
    to: 'togradyevl@gmail.com',
    subject: subject || 'EVL Admin Notification',
    html: finalHtml
  });

  try {
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
          console.log('[notify-admin] Resend response:', response.statusCode, data);
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

    console.log('[notify-admin] Email sent successfully via Resend');
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('[notify-admin] Resend error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};
