// backend/models/Recording.js
const mongoose = require('mongoose');

const recordingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  audioUrl: { type: String, required: true },
  cloudinaryId: { type: String, required: true },
  transcription: { type: String, default: '' }
});

module.exports = mongoose.model('Recording', recordingSchema);
