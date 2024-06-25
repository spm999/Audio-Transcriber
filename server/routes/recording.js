// backend/routes/recordings.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const Recording = require('../models/Recording');

// Multer storage configuration (in-memory for example)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST /api/recordings/upload
router.post('/upload', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload file to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'video', folder: 'uploads/recordings' }, // Adjust resource_type and folder as necessary
        (error, result) => {
          if (error || !result) {
            console.error('Cloudinary upload error:', error);
            return reject('Error uploading file to Cloudinary');
          }
          resolve(result);
        }
      ).end(req.file.buffer);
    });

    // Create a new Recording object
    const newRecording = new Recording({
      title: req.body.title,
      audioUrl: result.secure_url,
      cloudinaryId: result.public_id
    });

    // Save the recording to the database
    await newRecording.save();

    res.status(201).json({ success: true, recording: newRecording });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error uploading recording' });
  }
});

// GET /api/recordings - Fetch all recordings
router.get('/', async (req, res) => {
    try {
      const recordings = await Recording.find().sort({ createdAt: -1 }); // Fetch all recordings and sort by latest
      res.json({ success: true, recordings });
    } catch (err) {
      console.error('Error fetching recordings:', err);
      res.status(500).json({ error: 'Error fetching recordings' });
    }
  });


// DELETE /api/recordings/:id
router.delete('/:id', async (req, res) => {
  try {
    const recordingId = req.params.id;
    const recording = await Recording.findById(recordingId);

    if (!recording) {
      return res.status(404).json({ error: 'Recording not found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(recording.cloudinaryId, { resource_type: 'video' });

    // Delete from MongoDB
    await Recording.findByIdAndDelete(recordingId);

    res.json({ success: true, message: 'Recording deleted' });
  } catch (error) {
    console.error('Error deleting recording:', error);
    res.status(500).json({ error: 'Error deleting recording' });
  }
});


module.exports = router;
