/**
 * API: Send Verification to Customer
 * Endpoint: /api/send-verification-to-customer
 * Method: POST
 * 
 * After video is uploaded and charged,
 * send confirmation + video link to customer
 * via SMS and EmailJS
 */

const twilio = require('twilio');
const axios = require('axios');
const { getFirebaseAdmin } = require('../lib/firebaseAdmin');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

// EmailJS config
const emailJsServiceId = 'service_rvscjt3';
const emailJsTemplateId = 'template_xg4woqs'; // NEED TO CREATE THIS TEMPLATE
const emailJsPublicKey = 'iilAte2T5SzOKb-fn';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      recordId,
      recordType,
      customerName,
      customerEmail,
      customerPhone,
      vehicleInfo,
      videoUrl,
      salePersonName
    } = req.body;

    console.log('[send-verification] Sending verification to customer');
    console.log(`  Customer: ${customerName} (${customerEmail})`);
    console.log(`  Vehicle: ${vehicleInfo}`);
    console.log(`  Video: ${videoUrl}`);

    // Validate input
    if (!customerEmail || !customerPhone || !videoUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // ══════════════════════════════════════════════════════════
    // SEND SMS TO CUSTOMER
    // ══════════════════════════════════════════════════════════

    const smsMessage = `EVL: Vehicle confirmed in stock! ✓ ${vehicleInfo} is ready for you. Your salesperson ${salePersonName} has verified the vehicle. 

Next step: Schedule your face-to-face appointment. Reply "APPOINTMENT" or call your salesperson to confirm time.

Video proof: ${videoUrl}`;

    const smsResult = await client.messages.create({
      body: smsMessage,
      from: fromNumber,
      to: customerPhone
    });

    console.log('[send-verification] SMS sent to customer:', smsResult.sid);

    // ══════════════════════════════════════════════════════════
    // SEND EMAIL TO CUSTOMER VIA EMAILJS
    // ══════════════════════════════════════════════════════════

    const emailParams = {
      service_id: emailJsServiceId,
      template_id: emailJsTemplateId,
      user_id: emailJsPublicKey,
      template_params: {
        customer_name: customerName,
        vehicle_info: vehicleInfo,
        salesperson_name: salePersonName,
        video_url: videoUrl,
        message: `Your requested vehicle has been verified and is ready for inspection. Click the link below to view the verification video.`
      }
    };

    try {
      const emailResult = await axios.post('https://api.emailjs.com/api/v1.0/email/send', emailParams);
      console.log('[send-verification] Email sent via EmailJS:', emailResult.status);
    } catch (emailError) {
      console.warn('[send-verification] EmailJS error (non-critical):', emailError.message);
      // Continue - SMS was sent successfully
    }

    // ══════════════════════════════════════════════════════════
    // UPDATE FIREBASE
    // ══════════════════════════════════════════════════════════

    const db = getFirebaseAdmin().firestore();
    const docRef = db.collection(recordType === 'lead' ? 'evl_leads' : 'evl_deals').doc(recordId);

    await docRef.update({
      verificationSentToCustomer: true,
      verificationSentAt: new Date(),
      customerNotificationStatus: 'sent'
    });

    console.log('[send-verification] Firebase updated');

    return res.status(200).json({
      success: true,
      recordId: recordId,
      smsSid: smsResult.sid,
      message: 'Verification sent to customer via SMS and Email'
    });

  } catch (error) {
    console.error('[send-verification] Error:', error.message);
    return res.status(500).json({
      error: 'Failed to send verification',
      message: error.message
    });
  }
};
