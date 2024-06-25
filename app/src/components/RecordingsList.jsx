import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Recorder from './Recorder'; // Assuming Recorder component is in the same directory

const RecordingsList = () => {
  const [recordings, setRecordings] = useState([]);
  const [transcribing, setTranscribing] = useState(null); // Track which recording is being transcribed
  const [showTranscriptionFor, setShowTranscriptionFor] = useState(null); // Track which recording's transcription is being shown
  const [transcriptionErrors, setTranscriptionErrors] = useState({}); // State for transcription errors

  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/recordings');
      setRecordings(response.data.recordings);
    } catch (error) {
      console.error('Fetch recordings failed:', error);
    }
  };

  const handleTranscription = async (recordingId) => {
    setTranscribing(recordingId); // Set the transcribing state to the current recording ID
    try {
      const response = await axios.post(`http://localhost:5000/api/transcription/${recordingId}`);
      if (response.data.error) {
        console.error('Transcription request failed:', response.data.error);
        setTranscriptionErrors(prevErrors => ({
          ...prevErrors,
          [recordingId]: response.data.error,
        }));
      } else {
        const { transcription } = response.data;
        if (transcription.trim() === '') {
          setTranscriptionErrors(prevErrors => ({
            ...prevErrors,
            [recordingId]: 'Transcription result is empty',
          }));
        } else {
          const updatedRecordings = recordings.map(recording => {
            if (recording._id === recordingId) {
              recording.transcription = transcription;
            }
            return recording;
          });
          setRecordings(updatedRecordings);
          setShowTranscriptionFor(recordingId); // Show the transcription for the current recording
          setTranscriptionErrors(prevErrors => ({
            ...prevErrors,
            [recordingId]: null, // Clear any previous transcription errors for this recording
          }));
        }
      }
    } catch (error) {
      console.error('Transcription request failed:', error);
      setTranscriptionErrors(prevErrors => ({
        ...prevErrors,
        [recordingId]: 'Failed to transcribe the recording.', // Set generic error message
      }));
    } finally {
      setTranscribing(null); // Clear the transcribing state
    }
  };

  const handleDelete = async (recordingId) => {
    try {
      await axios.delete(`http://localhost:5000/api/recordings/${recordingId}`);
      // Remove the deleted recording from the state
      setRecordings(recordings.filter(recording => recording._id !== recordingId));
    } catch (error) {
      console.error('Delete request failed:', error);
    }
  };

  const handleHideTranscription = (recordingId) => {
    setShowTranscriptionFor(prevId => prevId === recordingId ? null : prevId);
  };

  return (
    <div className="recordings-list">
      <h2 className="recordings-list__title">Recordings List</h2>
      <Recorder onUpload={fetchRecordings} /> {/* Pass fetchRecordings function as prop */}
      {recordings.map(recording => (
        <div key={recording._id} className="recording-item">
          <h3 className="recording-item__title">{recording.title}</h3>
          <audio controls className="recording-item__audio">
            <source src={recording.audioUrl} type="audio/webm" />
            Your browser does not support the audio element.
          </audio>
          <div className="recording-item__transcription">
            {showTranscriptionFor === recording._id && recording.transcription ? (
              <div>
                <p><strong>Transcription:</strong> {recording.transcription}</p>
                <button onClick={() => handleHideTranscription(recording._id)} className="recording-item__button">
                  Hide Transcription
                </button>
              </div>
            ) : (
              <>
                {transcribing === recording._id ? (
                  <p className="recording-item__transcribing">Transcribing...</p>
                ) : (
                  <button 
                    onClick={() => handleTranscription(recording._id)}
                    className="recording-item__button"
                    disabled={transcribing === recording._id}
                  >
                    Get Transcription
                  </button>
                )}
                {transcriptionErrors[recording._id] && (
                  <p className="recording-item__error">{transcriptionErrors[recording._id]}</p>
                )}
              </>
            )}
          </div>
          <button onClick={() => handleDelete(recording._id)} className="recording-item__button recording-item__button--delete">Delete</button>
        </div>
      ))}
    </div>
    // <div>
    //   <h2>Recordings List</h2>
    //   <Recorder onUpload={fetchRecordings} /> {/* Pass fetchRecordings function as prop */}
    //   {recordings.map(recording => (
    //     <div key={recording._id} style={{ marginBottom: '20px' }}>
    //       <h3>{recording.title}</h3>
    //       <audio controls>
    //         <source src={recording.audioUrl} type="audio/webm" />
    //         Your browser does not support the audio element.
    //       </audio>
    //       <div>
    //         {showTranscriptionFor === recording._id && recording.transcription ? (
    //           <div>
    //             <p><strong>Transcription:</strong> {recording.transcription}</p>
    //             <button onClick={() => handleHideTranscription(recording._id)}>Hide Transcription</button>
    //           </div>
    //         ) : (
    //           <>
    //             {transcribing === recording._id ? (
    //               <p>Transcribing...</p>
    //             ) : (
    //               <button 
    //                 onClick={() => handleTranscription(recording._id)}
    //                 disabled={transcribing === recording._id}
    //               >
    //                 Get Transcription
    //               </button>
    //             )}
    //             {transcriptionErrors[recording._id] && (
    //               <p style={{ color: 'red' }}>{transcriptionErrors[recording._id]}</p>
    //             )}
    //           </>
    //         )}
    //       </div>
    //       <button onClick={() => handleDelete(recording._id)}>Delete</button>
    //     </div>
    //   ))}
    // </div>
  );
};

export default RecordingsList;