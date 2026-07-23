/**
 * API: Notify Manager of Salesperson Assignment
 * Endpoint: /api/notify-manager
 * Method: POST
 * 
 * When admin assigns salesperson to a lead in CRM,
 * this function sends SMS to the Sales Manager
 */

const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

// Manager phone numbers (UPDATE THESE)
const MANAGER_NUMBERS = {
  'sales-manager': '+14694043192',
  'internet-manager': '+14694043192'
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { salesperson, customerName, vehicleInfo, recordId } = req.body;
    
    if (!salesperson || !customerName || !vehicleInfo) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    console.log(`[notify-manager] Assigning to: ${salesperson}`);
    
    const message = `EVL: Salesperson "${salesperson}" assigned to "${customerName}" for ${vehicleInfo}. Record: ${recordId}. Monitor for verification (20 min).`;
    
    const managerNumber = MANAGER_NUMBERS['sales-manager'];
    
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: managerNumber
    });
    
    console.log(`[notify-manager] SMS sent: ${result.sid}`);
    
    return res.status(200).json({
      success: true,
      messageSid: result.sid
    });
    
  } catch (error) {
    console.error('[notify-manager] Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
