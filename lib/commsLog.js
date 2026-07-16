// Shared communications logger - one source of truth for recording every
// SMS/email sent to a customer or dealer. This is what makes "what have we
// sent this person, and when" an answerable question instead of guesswork.
//
// Usage: await logCommunication({ customerPhone, customerEmail, leadId, type, purpose, content, status, providerMessageId })

const { getFirebaseAdmin } = require('./firebaseAdmin');

async function logCommunication({ customerPhone, customerEmail, leadId, type, purpose, content, status, providerMessageId }) {
  try {
    const db = getFirebaseAdmin().firestore();
    await db.collection('evl_communications').add({
      customerPhone: customerPhone || null,
      customerEmail: customerEmail ? customerEmail.trim().toLowerCase() : null,
      leadId: leadId || null,
      type: type || 'unknown',        // 'sms' or 'email'
      purpose: purpose || 'unknown',  // e.g. 'welcome-message', 'payment-link', 'auction-unitCard'
      content: content || null,
      status: status || 'unknown',    // 'sent', 'failed', 'skipped'
      providerMessageId: providerMessageId || null,
      timestamp: new Date()
    });
  } catch (err) {
    // Never let logging failure break the actual send - log and move on
    console.error('[commsLog] Failed to log communication (non-fatal):', err.message);
  }
}

module.exports = { logCommunication };
