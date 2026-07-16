// Sends the 5 live-auction dealer notification emails (unitCard, nudge, outbid,
// finalCall, winner) via Resend, replacing the dead EmailJS templates that
// evl-notif-engine.html used to call directly from the browser.

const https = require('https');

function buildEmail(type, p) {
  switch (type) {
    case 'unitCard':
      return {
        subject: `⚡ New Unit Available: ${p.vehicle}`,
        html: `
          <h2 style="color:#2B84FE;">New Unit Now Available</h2>
          <p>Hi ${p.to_name || ''},</p>
          <p><strong>${p.vehicle}</strong> (VIN: ${p.vin || '—'}) is now available on the WS Exchange.</p>
          <p>Miles: ${p.miles || '—'} &middot; Condition: ${p.condition || '—'} &middot; Source: ${p.source_dealer || '—'} &middot; ${p.days || '—'} days on lot</p>
          <p>Retail Value: ${p.retail_value || '—'} &middot; WS Floor: ${p.ws_floor || '—'}</p>
          <p>Recalls: ${p.recalls || '—'}</p>
          <p>Bidding closes: ${p.deadline || '—'}</p>
          <p><a href="${p.bid_url}">Bid now &rarr;</a></p>
        `
      };
    case 'nudge':
      return {
        subject: `📡 ${p.vehicle} — ${p.time_remaining} remaining`,
        html: `
          <h2 style="color:#2B84FE;">Auction Update</h2>
          <p>Hi ${p.to_name || ''},</p>
          <p><strong>${p.vehicle}</strong> — Current high bid: ${p.high_bid}</p>
          <p>${p.nudge_message}</p>
          <p>Active bidders: ${p.active_bidders || '—'} &middot; Time remaining: ${p.time_remaining}</p>
          <p><a href="${p.bid_url}">Go to bid board &rarr;</a></p>
        `
      };
    case 'outbid':
      return {
        subject: `⚠️ Outbid on ${p.vehicle}`,
        html: `
          <h2 style="color:#e53e3e;">You've Been Outbid</h2>
          <p>Hi ${p.to_name || ''},</p>
          <p><strong>${p.vehicle}</strong> — your bid: ${p.your_bid}, new high bid: ${p.high_bid} (${p.difference} more)</p>
          <p>Time remaining: ${p.time_remaining}</p>
          <p><a href="${p.bid_url}">Counter now &rarr;</a></p>
        `
      };
    case 'finalCall':
      return {
        subject: `🚨 Final Hour: ${p.vehicle}`,
        html: `
          <h2 style="color:#e53e3e;">Final Hour — Auction Closing Soon</h2>
          <p>Hi ${p.to_name || ''},</p>
          <p><strong>${p.vehicle}</strong> closes at ${p.deadline_time}</p>
          <p>Current high bid: ${p.high_bid} &middot; Your status: ${p.my_status}</p>
          <p><a href="${p.bid_url}">Last chance to bid &rarr;</a></p>
        `
      };
    case 'winner':
      return {
        subject: `✅ You Won: ${p.vehicle}`,
        html: `
          <h2 style="color:#00C853;">Congratulations — You Won!</h2>
          <p>Hi ${p.to_name || ''},</p>
          <p>You won <strong>${p.vehicle}</strong> at ${p.winning_bid}.</p>
          <p>EVL fee: ${p.evl_fee}</p>
          <p>Reference: ${p.ref_number}</p>
          <p>EVL will call you within 2 hours to finalize.</p>
        `
      };
    case 'unitSold':
      return {
        subject: `✅ Unit Sold: ${p.vehicle}`,
        html: `
          <h2 style="color:#00C853;">Unit Sold — Pickup Details</h2>
          <p>Hi ${p.to_name || ''},</p>
          <p><strong>${p.vehicle}</strong> (VIN: ${p.vin || '—'}) — winning bid: ${p.winning_bid}</p>
          <p>Reference: ${p.ref_number}</p>
          <p>Bidding Dealer: ${p.bd_name || '—'}</p>
          <p>Pickup window: ${p.pickup_window || '—'}</p>
        `
      };
    default:
      return null;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, params } = req.body;

  if (!type || !params || !params.to_email) {
    return res.status(400).json({ success: false, error: 'Missing type, params, or to_email' });
  }

  const emailContent = buildEmail(type, params);
  if (!emailContent) {
    return res.status(400).json({ success: false, error: 'Unknown notification type: ' + type });
  }

  const payload = JSON.stringify({
    from: 'Express Vehicle Locators <no-reply@expressvehiclelocators.com>',
    reply_to: 'togradyevl@gmail.com',
    to: params.to_email,
    subject: emailContent.subject,
    html: emailContent.html
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
          console.log('[send-auction-notification] Resend response:', response.statusCode, data);
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

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[send-auction-notification] Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};
