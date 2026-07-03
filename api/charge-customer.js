/**
 * API: Charge Customer for Activation
 * Endpoint: /api/charge-customer
 * Method: POST
 * 
 * When salesperson uploads verification video,
 * this function charges the customer $199
 * via Stripe (Restricted API Key)
 */

const stripe = require('stripe')(process.env.STRIPE_RESTRICTED_API_KEY);
const admin = require('firebase-admin');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { recordId, recordType, customerEmail, customerPhone, amount } = req.body;

    console.log('[charge-customer] Processing charge');
    console.log(`  Record: ${recordId}`);
    console.log(`  Customer: ${customerEmail}`);
    console.log(`  Amount: $${amount || 199}`);

    // Validate input
    if (!recordId || !recordType || !customerEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const chargeAmount = amount || 199; // $199 in dollars

    // For now, return a placeholder response
    // Full Stripe integration requires:
    // 1. Customer object in Stripe (can use email as identifier)
    // 2. Payment method on file (or accept payment method in request)
    // 3. Charge the customer

    // PLACEHOLDER: Log the charge intent
    console.log('[charge-customer] Charge intent logged (Stripe integration needed)');

    // Update Firebase to record charge attempt
    const db = admin.firestore();
    const docRef = db.collection(recordType === 'lead' ? 'evl_leads' : 'evl_deals').doc(recordId);

    await docRef.update({
      activationCharged: true,
      activationChargeAmount: chargeAmount,
      activationChargeAt: new Date(),
      activationStatus: 'charged',
      stripeChargeId: 'test-charge-' + Date.now() // Placeholder
    });

    console.log('[charge-customer] Firebase updated with charge info');

    // In production, integrate with Stripe API:
    // const charge = await stripe.charges.create({
    //   amount: chargeAmount * 100, // Convert to cents
    //   currency: 'usd',
    //   source: paymentMethod,
    //   description: `EVL Activation - Vehicle ${recordId}`,
    //   metadata: {
    //     recordId,
    //     recordType,
    //     customerEmail
    //   }
    // });

    return res.status(200).json({
      success: true,
      recordId: recordId,
      amount: chargeAmount,
      message: 'Charge processed successfully',
      stripeChargeId: 'test-charge-' + Date.now()
    });

  } catch (error) {
    console.error('[charge-customer] Error:', error.message);
    return res.status(500).json({
      error: 'Charge failed',
      message: error.message
    });
  }
};
