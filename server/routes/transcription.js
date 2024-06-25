// backend/routes/recordings.js
const express = require('express');
const router = express.Router();
const Recording = require('../models/Recording');
const fs = require('fs');
const axios = require('axios');
const { createClient } = require('@deepgram/sdk');
require('dotenv').config(); // Load environment variables

// Deepgram client
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

// Helper function to download audio file
const downloadAudioFile = async (url, path) => {
  const writer = fs.createWriteStream(path);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

// Transcription route - POST /api/transcription/:id
router.post('/:id', async (req, res) => {
  try {
    const recordingId = req.params.id;

    // Fetch the recording from the database
    const recording = await Recording.findById(recordingId);
    if (!recording) {
      return res.status(404).json({ error: 'Recording not found' });
    }

    // Check if transcription already exists
    if (recording.transcription) {
      return res.json({ success: true, transcription: recording.transcription });
    }

    const audioUrl = recording.audioUrl;
    const tempFilePath = './temp_audio.mp3'; // Temporary file path (matching the actual file extension)

    // Download the audio file to a local path
    await downloadAudioFile(audioUrl, tempFilePath);

    // Transcribe the audio file using Deepgram
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      fs.readFileSync(tempFilePath),
      {
        model: 'nova-2',
        smart_format: true,
      }
    );

    if (error) {
      console.error('Deepgram transcription error:', error);
      return res.status(500).json({ error: 'Error transcribing audio' });
    }


    // Extract the transcription from the result
    const transcription = result.results.channels[0].alternatives[0].transcript;

    // Check if transcription result is empty string
    if (transcription.trim() === '') {
      return res.status(400).json({ error: 'Transcription result is empty' });
    }

    // Update the recording with the transcription
    recording.transcription = transcription;
    await recording.save();

    // Delete the temporary audio file
    fs.unlinkSync(tempFilePath);

    res.json({ success: true, transcription });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({ error: 'Error transcribing audio' });
  }
});


module.exports = router;
