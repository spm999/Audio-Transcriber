import React, { useState, useRef } from 'react';
import axios from 'axios';

const Recorder = ({ onUpload }) => {
  const [title, setTitle] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [uploading, setUploading] = useState(false); // State for upload loading indicator
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const startRecording = () => {
    if (audioBlob) {
      alert('Please upload or delete the current recording before starting a new one.');
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
          setAudioBlob(blob);
          audioChunksRef.current.current = [];
        };
        mediaRecorderRef.current.start();
        setIsRecording(true);
      })
      .catch(error => {
        console.error('Error accessing microphone:', error);
      });
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const handleUpload = async () => {
    if (!title || !audioBlob) {
      alert('Please provide a title and record an audio.');
      return;
    }

    try {
      setUploading(true); // Set uploading state to true
      const formData = new FormData();
      formData.append('title', title);
      formData.append('audio', audioBlob, 'recording.mp3');

      const response = await axios.post('http://localhost:5000/api/recordings/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Uploaded:', response.data);
      alert('Audio uploaded successfully!');
      setTitle('');
      setAudioBlob(null);

      // Notify parent component to fetch updated recordings
      if (onUpload) {
        onUpload();
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false); // Set uploading state back to false
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete the current recording?')) {
      setAudioBlob(null);
      setTitle('');
    }
  };

  return (
    <div className="audio-recorder">
      <h2 className="audio-recorder__title">Record Audio</h2>
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Enter title"
        className="audio-recorder__input"
      />
      {isRecording ? (
        <div className="audio-recorder__recording">
          <p className="audio-recorder__recording-status">Recording...</p>
          <button onClick={stopRecording} className="audio-recorder__button audio-recorder__button--stop">
            Stop Recording
          </button>
        </div>
      ) : (
        <button
          onClick={startRecording}
          className="audio-recorder__button audio-recorder__button--start"
          disabled={!!audioBlob} // Disable if there is an existing audioBlob
        >
          Start Recording
        </button>
      )}
      {audioBlob && (
        <div className="audio-recorder__preview">
          <audio controls className="audio-recorder__audio">
            <source src={URL.createObjectURL(audioBlob)} type="audio/mp3" />
          </audio>
          {uploading ? (
            <p className="audio-recorder__uploading">Uploading...</p>
          ) : (
            <div>
              <button onClick={handleUpload} className="audio-recorder__button audio-recorder__button--upload">
                Upload
              </button>
              <button onClick={handleDelete} className="audio-recorder__button audio-recorder__button--delete">
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Recorder;
