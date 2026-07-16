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
const https = require('https');
const { getFirebaseAdmin } = require('../lib/firebaseAdmin');
const { isEmailSuppressed, complianceFooter } = require('../lib/emailCompliance');
const { logCommunication } = require('../lib/commsLog');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

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
    // SEND EMAIL TO CUSTOMER VIA RESEND
    // ══════════════════════════════════════════════════════════

    let emailStatus = 'skipped - no email provided';

    if (customerEmail) {
      const suppressed = await isEmailSuppressed(customerEmail);
      if (suppressed) {
        console.log('[send-verification] Email skipped - unsubscribed:', customerEmail);
        emailStatus = 'skipped - unsubscribed';
      } else {
      try {
        const htmlBody = `
          <h2 style="color:#2B84FE;">Vehicle Confirmed In Stock!</h2>
          <p>Hi ${customerName || 'there'},</p>
          <p>&#9989; <strong>${vehicleInfo}</strong> is ready for you. Your salesperson ${salePersonName || ''} has verified the vehicle in person.</p>
          <p><a href="${videoUrl}">View the verification video &rarr;</a></p>
          <p>Next step: schedule your face-to-face appointment. Reply to this email or call your salesperson to confirm a time.</p>
          <p>Questions? Call or Text: (469) 404-3192</p>
          <p>&mdash; Express Vehicle Locators</p>
        ` + complianceFooter(customerEmail);
        const payload = JSON.stringify({
          from: 'Express Vehicle Locators <no-reply@expressvehiclelocators.com>',
          reply_to: 'togradyevl@gmail.com',
          to: customerEmail,
          subject: 'Vehicle Confirmed In Stock — ' + (vehicleInfo || ''),
          html: htmlBody
        });

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
              console.log('[send-verification] Resend response:', response.statusCode, data);
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

        console.log('[send-verification] Email sent via Resend');
        emailStatus = 'sent';
      } catch (emailError) {
        console.error('[send-verification] Email failed:', emailError.message);
        emailStatus = 'failed - ' + emailError.message;
      }
      }
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

    await logCommunication({
      customerPhone, customerEmail, leadId: recordId, type: 'sms', purpose: 'vehicle-verification',
      content: videoUrl, status: 'sent', providerMessageId: smsResult.sid
    });
    await logCommunication({
      customerPhone, customerEmail, leadId: recordId, type: 'email', purpose: 'vehicle-verification',
      content: videoUrl,
      status: emailStatus === 'sent' ? 'sent' : emailStatus.startsWith('skipped') ? 'skipped' : 'failed'
    });

    return res.status(200).json({
      success: true,
      recordId: recordId,
      smsSid: smsResult.sid,
      emailStatus: emailStatus,
      message: 'Verification sent to customer via SMS' + (emailStatus === 'sent' ? ' and Email' : ' (email: ' + emailStatus + ')')
    });

  } catch (error) {
    console.error('[send-verification] Error:', error.message);
    return res.status(500).json({
      error: 'Failed to send verification',
      message: error.message
    });
  }
};
