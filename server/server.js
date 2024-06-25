const express = require('express');
const db=require('./utils/db')
const bodyParser = require('body-parser');
const cors = require('cors');
const recordingsRouter = require('./routes/recording');
const transcribeFile=require('./routes/transcription')

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());


// Routes
app.use('/api/recordings', recordingsRouter);
app.use('/api/transcription', transcribeFile);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));

