// Shared email compliance helpers - one source of truth for:
// 1. Checking the suppression list (evl_email_suppression) before sending
// 2. Building the standard CAN-SPAM footer (address, unsubscribe, terms)
//
// Used by every endpoint that emails a real third party (dealers, customers,
// GSMs, salespeople) - NOT used for admin-only alerts to Tim himself.

const https = require('https');

function isEmailSuppressed(email) {
  return new Promise((resolve) => {
    if (!email) return resolve(false);
    const docId = email.trim().toLowerCase().replace(/\//g, '_SLASH_');
    const projectId = 'evl-acquisition-radar';
    const apiKey = 'AIzaSyCvvH8bYkoHM933iwODK4AlT2T4HVAJzho';
    const path = `/v1/projects/${projectId}/databases/(default)/documents/evl_email_suppression/${encodeURIComponent(docId)}?key=${apiKey}`;
    const options = { hostname: 'firestore.googleapis.com', path, method: 'GET' };
    const request = https.request(options, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        // 200 = document exists = suppressed. 404 = not suppressed.
        resolve(response.statusCode === 200);
      });
    });
    request.on('error', () => resolve(false)); // fail open - don't block sending on a network error
    request.end();
  });
}

function complianceFooter(email) {
  const unsubLink = `https://expressvehiclelocators.com/unsubscribe?email=${encodeURIComponent(email || '')}`;
  return `
    <hr style="border:none;border-top:1px solid #ddd;margin:24px 0;">
    <p style="font-size:12px;color:#888;">
      Evest Data Technology &mdash; 6860 North Dallas Parkway STE# 200, Plano, TX 75024<br>
      <a href="${unsubLink}" style="color:#888;">Unsubscribe</a> &middot; <a href="https://expressvehiclelocators.com/terms" style="color:#888;">Terms and Conditions</a>
    </p>
  `;
}

module.exports = { isEmailSuppressed, complianceFooter };
