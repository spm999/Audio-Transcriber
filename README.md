# Audio Recorder and Transcription App

This is a full-stack application that allows users to record audio, upload it, and retrieve transcriptions for the recordings. It is built using React for the frontend and Node.js/Express for the backend, with MongoDB for storage.

## Features

* Record audio directly from the browser.
* Upload audio files to the server.
* Fetch a list of recorded audio files.
* Retrieve and display transcriptions of recorded audio.
* Delete audio recordings.

## Installation

### Prerequisites

* Node.js (v12 or later)
* MongoDB

### Backend Setup

1. Clone the repository:

```
  git clone https://github.com/spm999/Audio-Transcriber.git
  cd server

```

2. Install backend dependencies:

```
  npm install

```

3. Create a `.env` file in the `backend` directory with the following content:

   ```
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   DEEPGRAM_API_KEY=
   MONGODB_URI=
   ```

   For the above, get cloudinary api and deepgram api by visiting their sites.
4. Start the backend server:

   ```
   npm start
   ```

### Frontend Setup

1. Open a new terminal window and navigate to the `frontend` directory:

```
   cd app
```

2. Install frontend dependencies:

   ```
   npm install
   ```
3. Start the frontend development server:

```
    npm run dev
```

## Usage

1. **Recording Audio:**
   * Enter a title for the recording.
   * Click the "Start Recording" button to start recording audio.
   * Click the "Stop Recording" button to stop recording.
   * Click the "Upload" button to upload the recorded audio.
2. **Viewing Recordings:**
   * The recordings will be listed in the "Recordings List" section.
   * Click on the "Get Transcription" button to retrieve the transcription.
   * Click on the "Delete" button to remove the recording.

## API Endpoints

### Recording Endpoints

* **GET /api/recordings**
  * Fetch all recordings.
* **POST /api/recordings/upload**
  * Upload a new recording. Requires `title` and `audio` in the form-data.
* **DELETE /api/recordings/:recordingId**
  * Delete a recording by ID.

### Transcription Endpoints

* **POST /api/transcription/:recordingId**
  Transcribe an audio

## Project Structure

```
project/
│
├── backend/                   # Backend server code
│   │
│   ├── config/                # Configuration files
│   │   ├── cloudinary.js      # Configuration for Cloudinary
│   │   └── config.js          # General project configuration
│   │
│   ├── models/                # Database models
│   │   └── Recording.js       # Model definition for recordings
│   │
│   ├── routes/                # Express routes
│   │   ├── recording.js       # Routes for handling recordings
│   │   ├── transcription.js   # Routes for transcription handling
│   │
│   ├── utils/                 # Utility functions
│   │   └── db.js              # Database utility functions
│   │
│   ├── server.js              # Entry point for backend server
│   ├── package.json           # Node.js dependencies and scripts
│   └── package-lock.json      # Lock file for Node.js dependencies
│
└── frontend/                  # Frontend application code
 |  │
 |  ├── public/                # Public assets (index.html, images, etc.)
 |  ├── src/                   # Source code directory
 |   │   │
 |   │   ├── components/        # React components
 |   │   │   ├── Record.jsx     # Component for recording audio
 |   │   │   ├── RecordingsList.jsx  # Component for listing recordings
 |   │   │   └── ...            # Other components
 |   │   │
 |   │   ├── App.jsx            # Main component or app entry point
 |   │   ├── index.css          # Global styles
 |   │   └── main.jsx           # Main entry file for ReactDOM
│
├── .gitignore
├── README.md
└── LICENSE
```

## Contributing

Contributions are welcome!

## License

This project is licensed under the MIT License. See the [LICENSE]() file for details.

## Acknowledgements

* Thanks to [Deepgram](https://deepgram.com/) and [Cloudinary](https://cloudinary.com/) for providing resources and tools.
