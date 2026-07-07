const https = require('https');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { customerName, customerPhone, customerEmail, source } = req.body;
  console.log('[notify-lead] Firing for:', customerName, customerPhone);

  const htmlBody = `
    <h2 style="color:#2B84FE;">🚗 New EVL Lead — Action Required</h2>
    <p><strong>Name:</strong> ${customerName || 'Not provided'}</p>
    <p><strong>Phone:</strong> ${customerPhone || 'Not provided'}</p>
    <p><strong>Email:</strong> ${customerEmail || 'Not provided'}</p>
    <p><strong>Bucket:</strong> Find My Vehicle — $49</p>
    <p><strong>Time:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} CST</p>
    <p><strong>⏱ Call within 2 hours — time kills deals!</strong></p>
    <p><a href="https://expressvehiclelocators.com/admin-dashboard">View Admin Dashboard</a></p>
  `;

  const payload = JSON.stringify({
    from: 'EVL Platform <onboarding@resend.dev>',
    to: 'togradyevl@gmail.com',
    subject: '🚗 NEW EVL LEAD — ' + (customerName || 'Unknown') + ' — $49',
    html: htmlBody
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
          console.log('[notify-lead] Resend response:', response.statusCode, data);
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

    console.log('[notify-lead] Email sent successfully via Resend');
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('[notify-lead] Resend error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
