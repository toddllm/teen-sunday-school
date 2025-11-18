import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useScavengerHunts } from '../contexts/ScavengerHuntContext';
import './ScavengerHuntPage.css';

const ScavengerHuntPage = () => {
  const { huntId } = useParams();
  const navigate = useNavigate();
  const {
    getActiveHunts,
    getHuntById,
    addSubmission,
    getSubmissionsByStudent
  } = useScavengerHunts();

  const [selectedHunt, setSelectedHunt] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [useCamera, setUseCamera] = useState(false);
  const [stream, setStream] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const activeHunts = getActiveHunts();

  useEffect(() => {
    // Load student name from localStorage
    const savedName = localStorage.getItem('scavenger-hunt-student-name');
    if (savedName) {
      setStudentName(savedName);
      setNameSubmitted(true);
    }

    // If huntId is provided in URL, load that hunt
    if (huntId) {
      const hunt = getHuntById(huntId);
      if (hunt) {
        setSelectedHunt(hunt);
      }
    }
  }, [huntId, getHuntById]);

  useEffect(() => {
    // Cleanup camera stream when component unmounts or camera is closed
    return () => {
      stopCamera();
    };
  }, []);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setMessage('Please enter your name!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    localStorage.setItem('scavenger-hunt-student-name', studentName.trim());
    setNameSubmitted(true);
  };

  const handleChangeName = () => {
    setNameSubmitted(false);
    localStorage.removeItem('scavenger-hunt-student-name');
  };

  const handleSelectHunt = (hunt) => {
    setSelectedHunt(hunt);
    navigate(`/scavenger-hunt/${hunt.id}`);
  };

  const handleBackToHunts = () => {
    setSelectedHunt(null);
    setSelectedPrompt(null);
    setShowCamera(false);
    setPhotoDataUrl(null);
    setDescription('');
    navigate('/scavenger-hunt');
  };

  const handleSelectPrompt = (prompt) => {
    setSelectedPrompt(prompt);
    setShowCamera(true);
    setPhotoDataUrl(null);
    setDescription('');
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setUseCamera(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setMessage('Unable to access camera. Please use file upload instead.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setUseCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setPhotoDataUrl(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage('Please select an image file!');
        setTimeout(() => setMessage(''), 3000);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoDataUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetakePhoto = () => {
    setPhotoDataUrl(null);
    setDescription('');
  };

  const handleSubmitPhoto = () => {
    if (!photoDataUrl) {
      setMessage('Please capture or upload a photo first!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (!description.trim()) {
      setMessage('Please add a description explaining how your photo relates to the verse!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    addSubmission({
      huntId: selectedHunt.id,
      promptId: selectedPrompt.id,
      studentName: studentName,
      photoDataUrl: photoDataUrl,
      description: description.trim()
    });

    setMessage('✅ Photo submitted successfully! It will be reviewed by your teacher.');
    setPhotoDataUrl(null);
    setDescription('');
    setShowCamera(false);
    setSelectedPrompt(null);

    setTimeout(() => setMessage(''), 4000);
  };

  const handleCancelSubmission = () => {
    setShowCamera(false);
    setSelectedPrompt(null);
    setPhotoDataUrl(null);
    setDescription('');
    stopCamera();
  };

  const getMySubmissions = () => {
    if (!nameSubmitted || !selectedHunt) return [];
    return getSubmissionsByStudent(studentName).filter(
      sub => sub.huntId === selectedHunt.id
    );
  };

  const hasSubmittedForPrompt = (promptId) => {
    const mySubmissions = getMySubmissions();
    return mySubmissions.some(sub => sub.promptId === promptId);
  };

  // Name entry screen
  if (!nameSubmitted) {
    return (
      <div className="scavenger-hunt-page">
        <div className="name-entry-container">
          <h1>Photo Scavenger Hunt</h1>
          <p>Enter your name to get started!</p>
          <form onSubmit={handleNameSubmit} className="name-form">
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Your name..."
              className="name-input"
              autoFocus
            />
            <button type="submit" className="submit-name-btn">
              Start Hunting!
            </button>
          </form>
          {message && <div className="message error">{message}</div>}
        </div>
      </div>
    );
  }

  // Camera/photo submission view
  if (showCamera && selectedPrompt) {
    return (
      <div className="scavenger-hunt-page">
        <div className="camera-container">
          <div className="camera-header">
            <h2>{selectedPrompt.verseReference}</h2>
            <button onClick={handleCancelSubmission} className="close-btn">
              ✕ Cancel
            </button>
          </div>

          <div className="verse-display">
            <p className="verse-text">"{selectedPrompt.verse}"</p>
            <p className="prompt-text">{selectedPrompt.prompt}</p>
          </div>

          {message && (
            <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          {!photoDataUrl ? (
            <div className="photo-capture">
              {useCamera ? (
                <div className="camera-view">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="camera-video"
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  <div className="camera-controls">
                    <button onClick={capturePhoto} className="capture-btn">
                      📷 Capture Photo
                    </button>
                    <button onClick={stopCamera} className="cancel-camera-btn">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="upload-options">
                  <button onClick={startCamera} className="camera-option-btn">
                    📷 Use Camera
                  </button>
                  <div className="divider">OR</div>
                  <label className="upload-option-btn">
                    📁 Upload Photo
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              )}
            </div>
          ) : (
            <div className="photo-review">
              <img src={photoDataUrl} alt="Captured" className="captured-photo" />

              <div className="description-section">
                <label htmlFor="description">
                  Explain how your photo relates to the verse:
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what your photo shows and how it connects to the verse..."
                  className="description-input"
                  rows="4"
                />
              </div>

              <div className="review-controls">
                <button onClick={handleRetakePhoto} className="retake-btn">
                  🔄 Retake Photo
                </button>
                <button onClick={handleSubmitPhoto} className="submit-photo-btn">
                  ✓ Submit Photo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Hunt prompts view
  if (selectedHunt) {
    const mySubmissions = getMySubmissions();
    const completedCount = selectedHunt.prompts.filter(p =>
      hasSubmittedForPrompt(p.id)
    ).length;

    return (
      <div className="scavenger-hunt-page">
        <div className="hunt-view">
          <div className="hunt-header">
            <div>
              <h1>{selectedHunt.title}</h1>
              <p className="student-name">
                Playing as: <strong>{studentName}</strong>
                <button onClick={handleChangeName} className="change-name-btn">
                  (change)
                </button>
              </p>
            </div>
            <button onClick={handleBackToHunts} className="back-btn">
              ← Back to Hunts
            </button>
          </div>

          <p className="hunt-description">{selectedHunt.description}</p>

          <div className="progress-section">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${(completedCount / selectedHunt.prompts.length) * 100}%`
                }}
              />
            </div>
            <p className="progress-text">
              {completedCount} of {selectedHunt.prompts.length} prompts completed
            </p>
          </div>

          {message && (
            <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="prompts-grid">
            {selectedHunt.prompts.map((prompt, index) => {
              const submitted = hasSubmittedForPrompt(prompt.id);
              const submission = mySubmissions.find(s => s.promptId === prompt.id);

              return (
                <div
                  key={prompt.id}
                  className={`prompt-card ${submitted ? 'completed' : ''}`}
                >
                  <div className="prompt-number">Prompt {index + 1}</div>
                  {submitted && <div className="completed-badge">✓ Submitted</div>}

                  <h3 className="prompt-reference">{prompt.verseReference}</h3>
                  <p className="prompt-verse">"{prompt.verse}"</p>
                  <p className="prompt-instruction">{prompt.prompt}</p>

                  {submitted && submission ? (
                    <div className="submission-preview">
                      <img
                        src={submission.photoDataUrl}
                        alt="Your submission"
                        className="submission-thumbnail"
                      />
                      <p className="submission-description">{submission.description}</p>
                      <p className="submission-status">
                        {submission.approved ? (
                          <span className="approved">✓ Approved</span>
                        ) : (
                          <span className="pending">⏳ Pending Review</span>
                        )}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSelectPrompt(prompt)}
                      className="take-photo-btn"
                    >
                      📷 Take Photo
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {completedCount === selectedHunt.prompts.length && (
            <div className="completion-message">
              <h2>🎉 Congratulations!</h2>
              <p>You've submitted photos for all prompts! Your teacher will review them soon.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Hunt selection view
  return (
    <div className="scavenger-hunt-page">
      <div className="hunt-selection">
        <div className="page-header">
          <h1>Photo Scavenger Hunt</h1>
          <p className="student-name">
            Welcome, <strong>{studentName}</strong>!
            <button onClick={handleChangeName} className="change-name-btn">
              (change name)
            </button>
          </p>
        </div>

        <p className="instructions">
          Choose a scavenger hunt and capture photos that represent each Bible verse!
        </p>

        {activeHunts.length === 0 ? (
          <div className="empty-state">
            <h2>No Active Hunts</h2>
            <p>Check back later for new scavenger hunts!</p>
          </div>
        ) : (
          <div className="hunts-grid">
            {activeHunts.map(hunt => {
              const mySubmissions = getSubmissionsByStudent(studentName).filter(
                sub => sub.huntId === hunt.id
              );
              const completedCount = hunt.prompts.filter(p =>
                mySubmissions.some(s => s.promptId === p.id)
              ).length;
              const progress = (completedCount / hunt.prompts.length) * 100;

              return (
                <div key={hunt.id} className="hunt-card" onClick={() => handleSelectHunt(hunt)}>
                  <h2>{hunt.title}</h2>
                  <p className="hunt-description">{hunt.description}</p>

                  <div className="hunt-stats">
                    <div className="stat">
                      <span className="stat-label">Prompts:</span>
                      <span className="stat-value">{hunt.prompts.length}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Your Progress:</span>
                      <span className="stat-value">
                        {completedCount}/{hunt.prompts.length}
                      </span>
                    </div>
                  </div>

                  {completedCount > 0 && (
                    <div className="mini-progress-bar">
                      <div
                        className="mini-progress-fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}

                  <button className="select-hunt-btn">
                    {completedCount === 0 ? 'Start Hunt' : 'Continue'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScavengerHuntPage;
