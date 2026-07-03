/**
 * API: Auto-Create Deal from Appointment
 * File Location: api/auto-create-deal.js
 * Endpoint: /api/auto-create-deal
 * Method: POST
 * 
 * When a customer books an appointment, this API automatically creates
 * a matching deal record in the evl_deals collection.
 */

const admin = require('firebase-admin');

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get appointment data from request body
    const {
      appointmentId,
      customerName,
      vehicleInfo,
      appointmentDate,
      appointmentTimeString,
      customerPhone,
      customerEmail,
      recordId,
      sourceType
    } = req.body;

    console.log('[auto-create-deal] Creating deal from appointment');
    console.log(`  Appointment ID: ${appointmentId}`);
    console.log(`  Customer: ${customerName}`);
    console.log(`  Vehicle: ${vehicleInfo}`);

    // ══════════════════════════════════════════════════════════
    // VALIDATION
    // ══════════════════════════════════════════════════════════

    if (!appointmentId || !customerName || !vehicleInfo) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['appointmentId', 'customerName', 'vehicleInfo']
      });
    }

    // ══════════════════════════════════════════════════════════
    // CREATE DEAL IN FIREBASE
    // ══════════════════════════════════════════════════════════

    const db = admin.firestore();

    // Parse appointment date
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTimeString}:00`);

    // Create the deal object
    const dealData = {
      customerName: customerName,
      vehicleInfo: vehicleInfo,
      appointmentDate: appointmentDate,
      appointmentTime: appointmentDateTime,
      appointmentTimeString: appointmentTimeString,
      customerPhone: customerPhone,
      customerEmail: customerEmail,
      status: 'scheduled',
      sourceType: sourceType || 'verification',
      linkedAppointmentId: appointmentId,
      linkedRecordId: recordId || null,
      dateCreated: new Date(),
      lastUpdated: new Date(),
      dealStage: 'scheduled',
      notes: `Auto-created from appointment booking on ${new Date().toLocaleString()}`
    };

    // Add to Firebase: evl_deals collection
    const dealRef = await db.collection('evl_deals').add(dealData);

    console.log('[auto-create-deal] Deal created successfully');
    console.log(`  Deal ID: ${dealRef.id}`);

    // ══════════════════════════════════════════════════════════
    // UPDATE APPOINTMENT WITH DEAL REFERENCE
    // ══════════════════════════════════════════════════════════

    // Link the appointment back to the deal
    await db.collection('evl_appointments').doc(appointmentId).update({
      linkedDealId: dealRef.id,
      dealCreatedAt: new Date()
    });

    console.log('[auto-create-deal] Appointment updated with deal reference');

    // ══════════════════════════════════════════════════════════
    // RETURN SUCCESS
    // ══════════════════════════════════════════════════════════

    return res.status(201).json({
      success: true,
      dealId: dealRef.id,
      customerName: customerName,
      vehicleInfo: vehicleInfo,
      appointmentDate: appointmentDate,
      status: 'scheduled',
      message: 'Deal created successfully'
    });

  } catch (error) {
    console.error('[auto-create-deal] Error:', error.message);
    return res.status(500).json({
      error: 'Failed to create deal',
      message: error.message
    });
  }
};
