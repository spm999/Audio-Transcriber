require('dotenv').config();

module.exports = {
  deepgram: {
    apiKey: process.env.DEEPGRAM_API_KEY
  },
  mongodbUri: process.env.MONGODB_URI
};
