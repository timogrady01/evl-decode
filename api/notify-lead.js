const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { customerName, customerPhone, customerEmail, source } = req.body;

  console.log('[notify-lead] Sending Gmail notification for:', customerName);

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'togradyevl@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    const mailOptions = {
      from: 'EVL Platform <togradyevl@gmail.com>',
      to: 'togradyevl@gmail.com',
      subject: '🚗 NEW EVL LEAD — ' + (customerName || 'Unknown') + ' — $49 Find My Vehicle',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#090E17;color:#ffffff;padding:30px;border-radius:12px;">
          <h2 style="color:#2B84FE;margin-bottom:20px;">🚗 New EVL Lead — Action Required</h2>
          <div style="background:#020203;border:1px solid #2a3f5f;border-radius:8px;padding:20px;margin-bottom:20px;">
            <p style="margin:8px 0;"><strong style="color:#C8D0DC;">Name:</strong> <span style="color:#ffffff;">${customerName || 'Not provided'}</span></p>
            <p style="margin:8px 0;"><strong style="color:#C8D0DC;">Phone:</strong> <span style="color:#ffffff;">${customerPhone || 'Not provided'}</span></p>
            <p style="margin:8px 0;"><strong style="color:#C8D0DC;">Email:</strong> <span style="color:#ffffff;">${customerEmail || 'Not provided'}</span></p>
            <p style="margin:8px 0;"><strong style="color:#C8D0DC;">Bucket:</strong> <span style="color:#00C853;">Find My Vehicle — $49</span></p>
            <p style="margin:8px 0;"><strong style="color:#C8D0DC;">Time:</strong> <span style="color:#ffffff;">${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} CST</span></p>
          </div>
          <div style="background:rgba(43,132,254,0.15);border:1px solid #2B84FE;border-radius:8px;padding:16px;text-align:center;">
            <p style="color:#2B84FE;font-weight:bold;font-size:16px;margin:0;">⏱ Call within 2 hours — time kills deals!</p>
          </div>
          <p style="margin-top:20px;font-size:12px;color:#C8D0DC;text-align:center;">
            View all leads at <a href="https://expressvehiclelocators.com/admin-dashboard" style="color:#2B84FE;">expressvehiclelocators.com/admin-dashboard</a>
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('[notify-lead] Gmail notification sent successfully');
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('[notify-lead] Gmail error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
