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


// Route to append new recording to existing transcription - POST /api/transcription/:id/append
router.post('/:id/append', async (req, res) => {
  try {
    const recordingId = req.params.id;

    // Fetch the recording from the database
    const recording = await Recording.findById(recordingId);
    if (!recording) {
      return res.status(404).json({ error: 'Recording not found' });
    }

    // Check if there's an existing transcription to append to
    if (!recording.transcription) {
      return res.status(400).json({ error: 'No transcription exists to append to' });
    }

    // Handle file upload if needed (for example, to Cloudinary)
    let appendedTranscription = '';

    // Example: Upload new audio file to Cloudinary
    if (req.file) {
      const uploadedFile = req.file; // Assuming req.file contains the new audio file

      // Implement upload logic to Cloudinary or other service
      // const uploadedAudioUrl = await uploadToCloudinary(uploadedFile);

      // Example: Append transcription text from uploaded audio
      const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
        fs.readFileSync(uploadedFile.path),
        {
          model: 'nova-2',
          smart_format: true,
        }
      );

      if (error) {
        console.error('Deepgram transcription error:', error);
        return res.status(500).json({ error: 'Error transcribing uploaded audio' });
      }

      appendedTranscription = result.results.channels[0].alternatives[0].transcript;
    } else {
      // If no file upload, append with a dummy text (for testing)
      appendedTranscription = "Append new transcription text here...";
    }

    // Update the transcription in MongoDB with the appended transcription
    recording.transcription += "\n" + appendedTranscription; // Example: Concatenate with newline

    await recording.save();

    // Optionally, clean up the uploaded file or handle other post-processing

    res.json({ success: true, message: 'Recording appended to transcription successfully' });
  } catch (error) {
    console.error('Error appending recording:', error);
    res.status(500).json({ error: 'Error appending recording to transcription' });
  }
});

module.exports = router;



// backend/routes/recordings.js

// const express = require('express');
// const router = express.Router();
// const Recording = require('../models/Recording');
// const fs = require('fs');
// const axios = require('axios');
// const { createClient } = require('@deepgram/sdk');
// const multer = require('multer');
// const ffmpeg = require('fluent-ffmpeg');
// require('dotenv').config(); // Load environment variables

// // Deepgram client
// const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

// // Set up multer for file uploads
// const upload = multer({ dest: 'uploads/' });

// // Helper function to download audio file
// const downloadAudioFile = async (url, path) => {
//   const writer = fs.createWriteStream(path);
//   const response = await axios({
//     url,
//     method: 'GET',
//     responseType: 'stream',
//   });

//   response.data.pipe(writer);

//   return new Promise((resolve, reject) => {
//     writer.on('finish', resolve);
//     writer.on('error', reject);
//   });
// };

// // Helper function to concatenate audio files
// const concatenateAudioFiles = (inputFiles, outputFile) => {
//   return new Promise((resolve, reject) => {
//     const ffmpegCommand = ffmpeg();

//     inputFiles.forEach(file => {
//       ffmpegCommand.input(file);
//     });

//     ffmpegCommand
//       .on('end', resolve)
//       .on('error', reject)
//       .mergeToFile(outputFile);
//   });
// };

// // Transcription route - POST /api/transcription/:id
// router.post('/:id', async (req, res) => {
//   try {
//     const recordingId = req.params.id;

//     // Fetch the recording from the database
//     const recording = await Recording.findById(recordingId);
//     if (!recording) {
//       return res.status(404).json({ error: 'Recording not found' });
//     }

//     // Check if transcription already exists
//     if (recording.transcription) {
//       return res.json({ success: true, transcription: recording.transcription });
//     }

//     const audioUrl = recording.audioUrl;

//     // Call Deepgram API to get transcription
//     const transcription = await deepgram.transcription.preRecorded({
//       url: audioUrl,
//     }, { punctuate: true });

//     // Update the recording with the transcription
//     recording.transcription = transcription.results.channels[0].alternatives[0].transcript;
//     await recording.save();

//     res.json({ success: true, transcription: recording.transcription });
//   } catch (error) {
//     console.error('Transcription error:', error);
//     res.status(500).json({ error: 'Failed to transcribe the recording.' });
//   }
// });

// // Append new recording - POST /api/transcription/:id/append
// router.post('/:id/append', upload.single('audio'), async (req, res) => {
//   try {
//     const recordingId = req.params.id;
//     const newAudioPath = req.file.path; // Path of the new audio file uploaded

//     // Fetch the recording from the database
//     const recording = await Recording.findById(recordingId);
//     if (!recording) {
//       return res.status(404).json({ error: 'Recording not found' });
//     }

//     // Download the existing audio to a local file
//     const existingAudioPath = `uploads/existing_${recordingId}.mp3`;
//     await downloadAudioFile(recording.audioUrl, existingAudioPath);

//     // Concatenate the existing audio with the new audio
//     const concatenatedAudioPath = `uploads/concatenated_${recordingId}.mp3`;
//     await concatenateAudioFiles([existingAudioPath, newAudioPath], concatenatedAudioPath);

//     // Upload the concatenated audio to the same S3 bucket or storage service
//     const concatenatedAudioUrl = await uploadToS3(concatenatedAudioPath);

//     // Update the recording's audioUrl to the new concatenated audio URL
//     recording.audioUrl = concatenatedAudioUrl;
//     await recording.save();

//     // Clean up temporary files
//     fs.unlinkSync(existingAudioPath);
//     fs.unlinkSync(newAudioPath);
//     fs.unlinkSync(concatenatedAudioPath);

//     res.json({ success: true, message: 'Recording appended successfully' });
//   } catch (error) {
//     console.error('Append recording error:', error);
//     res.status(500).json({ error: 'Failed to append the new recording.' });
//   }
// });

// module.exports = router;
