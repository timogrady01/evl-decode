const https = require('https');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { customerName, customerPhone, customerEmail, source } = req.body;

  console.log('[notify-lead] Sending notification for:', customerName);

  const payload = JSON.stringify({
    service_id: 'service_rvscjt3',
    template_id: 'template_1rnlq4o',
    user_id: 'iilAte2T5SzOKb-fn',
    accessToken: process.env.EMAILJS_PRIVATE_KEY,
    template_params: {
      name: customerName || 'New Lead',
      email: customerEmail || 'togradyevl@gmail.com',
      customerName: customerName || 'New Lead',
      customerPhone: customerPhone || 'Not provided',
      customerEmail: customerEmail || 'Not provided',
      vehicleInfo: 'Not yet specified — EVL will call to find out',
      appointmentDate: source || 'NEW FIND MY VEHICLE LEAD — $49',
      appointmentTime: new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })
    }
  });

  try {
    await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.emailjs.com',
        path: '/api/v1.0/email/send',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      };

      const request = https.request(options, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
          console.log('[notify-lead] EmailJS response:', response.statusCode, data);
          if (response.statusCode === 200) {
            resolve(data);
          } else {
            reject(new Error('EmailJS returned ' + response.statusCode + ': ' + data));
          }
        });
      });

      request.on('error', reject);
      request.write(payload);
      request.end();
    });

    console.log('[notify-lead] Email sent successfully');
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('[notify-lead] Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
