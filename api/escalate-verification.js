/**
 * API: Escalate Verification (Timeout Handler)
 * File Location: api/escalate-verification.js
 * Endpoint: /api/escalate-verification
 * Method: POST
 * 
 * When salesperson doesn't upload video within 20 minutes,
 * this API escalates to the Sales Manager
 */

const twilio = require('twilio');
const { getFirebaseAdmin } = require('../lib/firebaseAdmin');

// Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

// Manager phone numbers (who to escalate to)
const managerPhones = {
  'sales-manager': '+14698772164',      // Sales Manager
  'internet-manager': '+14694043192'    // Internet Manager
};

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get data from request body
    const { recordId, recordType, customerName, vehicleInfo, salespersonName } = req.body;

    console.log('[escalate-verification] Escalation triggered');
    console.log(`  Record: ${recordId}`);
    console.log(`  Salesperson: ${salespersonName}`);
    console.log(`  Customer: ${customerName}`);

    // ══════════════════════════════════════════════════════════
    // VALIDATION
    // ══════════════════════════════════════════════════════════

    if (!recordId || !recordType) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['recordId', 'recordType']
      });
    }

    // ══════════════════════════════════════════════════════════
    // BUILD ESCALATION MESSAGE
    // ══════════════════════════════════════════════════════════

    const vehicleText = vehicleInfo || 'Unknown Vehicle';

    const escalationMessage = `⚠️ EVL ESCALATION: Verification Timeout

Salesperson: ${salespersonName}
Customer: ${customerName}
Vehicle: ${vehicleText}
Record ID: ${recordId}

ISSUE: Salesperson did not upload verification video within 20-minute deadline.

ACTION REQUIRED: Contact salesperson or take over verification.
Record Status: ESCALATED (pending manager action)`;

    console.log('[escalate-verification] Message ready');

    // ══════════════════════════════════════════════════════════
    // SEND SMS TO BOTH MANAGERS
    // ══════════════════════════════════════════════════════════

    const smsResults = [];

    // Send to Sales Manager
    try {
      console.log('[escalate-verification] Sending SMS to Sales Manager...');
      
      const smsResult = await client.messages.create({
        body: escalationMessage,
        from: fromNumber,
        to: managerPhones['sales-manager']
      });

      console.log('[escalate-verification] SMS sent to Sales Manager:', smsResult.sid);
      smsResults.push({
        manager: 'sales-manager',
        smsSid: smsResult.sid,
        status: 'sent'
      });
    } catch (smsError) {
      console.warn('[escalate-verification] Sales Manager SMS error:', smsError.message);
      smsResults.push({
        manager: 'sales-manager',
        status: 'failed',
        error: smsError.message
      });
    }

    // Send to Internet Manager (backup)
    try {
      console.log('[escalate-verification] Sending SMS to Internet Manager...');
      
      const smsResult = await client.messages.create({
        body: escalationMessage,
        from: fromNumber,
        to: managerPhones['internet-manager']
      });

      console.log('[escalate-verification] SMS sent to Internet Manager:', smsResult.sid);
      smsResults.push({
        manager: 'internet-manager',
        smsSid: smsResult.sid,
        status: 'sent'
      });
    } catch (smsError) {
      console.warn('[escalate-verification] Internet Manager SMS error:', smsError.message);
      smsResults.push({
        manager: 'internet-manager',
        status: 'failed',
        error: smsError.message
      });
    }

    // ══════════════════════════════════════════════════════════
    // UPDATE FIREBASE - MARK AS ESCALATED
    // ══════════════════════════════════════════════════════════

    const db = getFirebaseAdmin().firestore();
    const collectionName = recordType === 'lead' ? 'evl_leads' : 'evl_deals';
    const docRef = db.collection(collectionName).doc(recordId);

    await docRef.update({
      verificationStatus: 'escalated',
      verificationEscalatedAt: new Date(),
      escalatedToManager: 'sales-manager',
      escalationReason: 'timeout_20_minutes',
      assignmentStatus: 'escalated'
    });

    console.log('[escalate-verification] Firebase updated - status set to escalated');

    // ══════════════════════════════════════════════════════════
    // RETURN SUCCESS
    // ══════════════════════════════════════════════════════════

    return res.status(200).json({
      success: true,
      recordId: recordId,
      escalatedAt: new Date(),
      message: 'Verification timeout - escalated to managers',
      smsResults: smsResults
    });

  } catch (error) {
    console.error('[escalate-verification] Error:', error.message);
    return res.status(500).json({
      error: 'Escalation failed',
      message: error.message
    });
  }
};
