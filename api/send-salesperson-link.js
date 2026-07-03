/**
 * API: Send Salesperson Verification Link
 * Location: api/send-salesperson-link.js
 * Endpoint: /api/send-salesperson-link
 * Method: POST
 * 
 * When admin assigns a salesperson in the CRM,
 * this API sends an SMS to the salesperson with
 * a verification link (20-minute window to upload video)
 */

const twilio = require('twilio');
const admin = require('firebase-admin');

// Twilio credentials from environment
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

// Salesperson phone numbers (map salesperson name to phone)
const salespersonPhones = {
  'john-smith': '+14694043192',        // TEST: using your business number
  'sarah-jones': '+14694043192',       // TEST: using your business number
  'mike-johnson': '+14694043192',      // TEST: using your business number
  'jessica-williams': '+14694043192',  // TEST: using your business number
  'david-brown': '+14694043192'        // TEST: using your business number
};

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get data from request body
    const { recordId, recordType, salespersonName, customerName, vehicleYear, vehicleMake, vehicleModel } = req.body;

    console.log('[send-salesperson-link] Processing request');
    console.log(`  Record: ${recordId}`);
    console.log(`  Salesperson: ${salespersonName}`);
    console.log(`  Customer: ${customerName}`);
    console.log(`  Vehicle: ${vehicleYear} ${vehicleMake} ${vehicleModel}`);

    // ══════════════════════════════════════════════════════════
    // VALIDATION
    // ══════════════════════════════════════════════════════════

    if (!recordId || !recordType || !salespersonName) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['recordId', 'recordType', 'salespersonName']
      });
    }

    // Get phone number for this salesperson
    const phoneNumber = salespersonPhones[salespersonName];
    if (!phoneNumber) {
      return res.status(400).json({
        error: 'Salesperson not found',
        salesperson: salespersonName
      });
    }

    // ══════════════════════════════════════════════════════════
    // BUILD VERIFICATION LINK
    // ══════════════════════════════════════════════════════════

    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : 'https://expressvehiclelocators.com';

    const verificationLink = `${baseUrl}/verification?recordId=${recordId}&type=${recordType}`;

    console.log('[send-salesperson-link] Verification link:', verificationLink);

    // ══════════════════════════════════════════════════════════
    // BUILD SMS MESSAGE
    // ══════════════════════════════════════════════════════════

    const vehicleInfo = `${vehicleYear} ${vehicleMake} ${vehicleModel}`.trim();

    const smsMessage = `EVL: New Vehicle Assignment ⏱️

Customer: ${customerName}
Vehicle: ${vehicleInfo}

You have 20 MINUTES to verify this vehicle is in stock and ready for sale.

Upload 30-second video proof showing:
✓ Vehicle exterior (no major damage)
✓ VIN plate visible
✓ Odometer/mileage
✓ Interior walk-around

VERIFICATION LINK (20-min timer):
${verificationLink}`;

    console.log('[send-salesperson-link] SMS message ready');

    // ══════════════════════════════════════════════════════════
    // SEND SMS VIA TWILIO
    // ══════════════════════════════════════════════════════════

    console.log('[send-salesperson-link] Sending SMS to:', phoneNumber);

    const smsResult = await client.messages.create({
      body: smsMessage,
      from: fromNumber,
      to: phoneNumber
    });

    console.log('[send-salesperson-link] SMS sent successfully');
    console.log(`  Message SID: ${smsResult.sid}`);

    // ══════════════════════════════════════════════════════════
    // UPDATE FIREBASE
    // ══════════════════════════════════════════════════════════

    const db = admin.firestore();
    const collectionName = recordType === 'lead' ? 'evl_leads' : 'evl_deals';
    const docRef = db.collection(collectionName).doc(recordId);

    await docRef.update({
      verificationLinkSentAt: new Date(),
      verificationLinkSentToSP: salespersonName,
      verificationSmsSid: smsResult.sid,
      verificationLinkSentStatus: 'sent'
    });

    console.log('[send-salesperson-link] Firebase updated');

    // ══════════════════════════════════════════════════════════
    // RETURN SUCCESS
    // ══════════════════════════════════════════════════════════

    return res.status(200).json({
      success: true,
      recordId: recordId,
      salesperson: salespersonName,
      phoneNumber: phoneNumber,
      smsSid: smsResult.sid,
      verificationLink: verificationLink,
      message: `Verification link sent to ${salespersonName} via SMS`
    });

  } catch (error) {
    console.error('[send-salesperson-link] Error:', error.message);
    return res.status(500).json({
      error: 'Failed to send verification link',
      message: error.message
    });
  }
};
