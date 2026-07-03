/**
 * API: Upload Verification Video
 * Endpoint: /api/upload-verification-video
 * Method: POST (multipart/form-data)
 * 
 * When salesperson submits video on verification page,
 * this function:
 * 1. Receives video file
 * 2. Uploads to Cloudinary
 * 3. Updates Firebase with video URL
 * 4. Returns success/error
 */

const formidable = require('formidable');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const admin = require('firebase-admin');

// Cloudinary config
cloudinary.config({
  cloud_name: 'dv8cpebgp',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = async (req, res) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm();
  form.maxFileSize = 100 * 1024 * 1024; // 100MB

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        throw new Error('Form parse error: ' + err.message);
      }

      const videoFile = files.video;
      const recordId = fields.recordId?.[0] || fields.recordId;
      const recordType = fields.recordType?.[0] || fields.recordType;
      const customerName = fields.customerName?.[0] || fields.customerName;
      const vehicleInfo = fields.vehicleInfo?.[0] || fields.vehicleInfo;

      console.log('[upload-verification-video] Received upload');
      console.log(`  Record: ${recordId} (${recordType})`);
      console.log(`  Customer: ${customerName}`);
      console.log(`  Vehicle: ${vehicleInfo}`);
      console.log(`  Video: ${videoFile?.originalFilename}`);

      // Validate input
      if (!videoFile) {
        return res.status(400).json({ error: 'No video file provided' });
      }

      if (!recordId || !recordType) {
        return res.status(400).json({ error: 'Missing recordId or recordType' });
      }

      // Upload to Cloudinary
      console.log('[upload-verification-video] Uploading to Cloudinary...');

      const uploadResult = await cloudinary.uploader.upload(videoFile.filepath, {
        resource_type: 'video',
        public_id: `evl-verification-${recordId}-${Date.now()}`,
        folder: 'evl/verifications',
        eager: [
          { width: 300, height: 200, crop: 'fill', format: 'jpg' }
        ]
      });

      console.log('[upload-verification-video] Uploaded to Cloudinary');
      console.log(`  URL: ${uploadResult.secure_url}`);

      // Update Firebase with video info
      const db = admin.firestore();
      const docRef = db.collection(recordType === 'lead' ? 'evl_leads' : 'evl_deals').doc(recordId);

      await docRef.update({
        verificationVideoUrl: uploadResult.secure_url,
        verificationVideoCloudinaryId: uploadResult.public_id,
        verificationUploadedAt: new Date(),
        verificationStatus: 'received',
        assignmentStatus: 'verified'
      });

      console.log('[upload-verification-video] Firebase updated');

      // Clean up temp file
      try {
        fs.unlinkSync(videoFile.filepath);
      } catch (e) {
        console.warn('Could not delete temp file:', e.message);
      }

      // Return success
      return res.status(200).json({
        success: true,
        videoUrl: uploadResult.secure_url,
        cloudinaryId: uploadResult.public_id,
        recordId: recordId,
        message: 'Video uploaded successfully. Processing payment and scheduling...'
      });

    } catch (error) {
      console.error('[upload-verification-video] Error:', error.message);
      return res.status(500).json({
        error: 'Upload failed',
        message: error.message
      });
    }
  });
};
