/**
 * API: Notify Salesperson of Assignment
 * Endpoint: /api/notify-salesperson
 * Method: POST
 * 
 * When admin assigns a lead to a salesperson,
 * this function sends SMS to the salesperson
 * with vehicle info and 20-minute verification deadline
 */

const twilio = require('twilio');
const { getFirebaseAdmin } = require('../lib/firebaseAdmin');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

// Salesperson phone numbers (UPDATE THESE - all currently point to placeholder number)
const SALESPERSON_NUMBERS = {
  'john-smith': '+14694043192',
  'sarah-jones': '+14694043192',
  'mike-johnson': '+14694043192',
  'jessica-williams': '+14694043192',
  'david-brown': '+14694043192'
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { salesperson, customerName, vehicleInfo, recordId, recordType } = req.body;
    
    if (!salesperson || !customerName || !vehicleInfo || !recordId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    console.log(`[notify-sp] Notifying salesperson: ${salesperson}`);
    
    // Build message with verification instructions
    const message = `EVL: You are assigned to customer "${customerName}" for vehicle: ${vehicleInfo}. VERIFY WITHIN 20 MINUTES. Send VIDEO showing: VIN plate + odometer + quick walk around (used: spare tire + tools; new: window sticker). Reply with VIDEO or confirmation text.`;
    
    // Get salesperson phone number
    const spPhone = SALESPERSON_NUMBERS[salesperson];
    
    if (!spPhone) {
      return res.status(400).json({ error: 'Salesperson phone number not found' });
    }
    
    // Send SMS to salesperson
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: spPhone
    });
    
    console.log(`[notify-sp] SMS sent to ${salesperson}: ${result.sid}`);
    
    // Update Firebase record with notification timestamp
    try {
      const db = getFirebaseAdmin().firestore();
      const docRef = db.collection(recordType === 'lead' ? 'evl_leads' : 'evl_deals').doc(recordId);
      
      await docRef.update({
        spNotificationSentAt: new Date(),
        spNotificationMessageSid: result.sid,
        verificationDeadline: new Date(Date.now() + 20 * 60 * 1000) // 20 minutes from now
      });
      
      console.log(`[notify-sp] Firebase updated with notification timestamp`);
    } catch (fbError) {
      console.error('[notify-sp] Firebase update error (non-critical):', fbError.message);
      // Continue - SMS was sent successfully
    }
    
    return res.status(200).json({
      success: true,
      messageSid: result.sid,
      salesperson: salesperson,
      verificationDeadline: new Date(Date.now() + 20 * 60 * 1000)
    });
    
  } catch (error) {
    console.error('[notify-sp] Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
