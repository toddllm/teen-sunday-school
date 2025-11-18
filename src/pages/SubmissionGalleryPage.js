import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useScavengerHunts } from '../contexts/ScavengerHuntContext';
import './SubmissionGalleryPage.css';

const SubmissionGalleryPage = () => {
  const { huntId } = useParams();
  const navigate = useNavigate();
  const {
    getHuntById,
    getSubmissionsByHunt,
    updateSubmission,
    deleteSubmission,
    getLeaderboard
  } = useScavengerHunts();

  const hunt = getHuntById(huntId);
  const allSubmissions = getSubmissionsByHunt(huntId);

  const [filterPrompt, setFilterPrompt] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [message, setMessage] = useState('');
  const [view, setView] = useState('gallery'); // 'gallery' or 'leaderboard'

  if (!hunt) {
    return (
      <div className="submission-gallery-page">
        <div className="error-message">
          <h2>Hunt not found</h2>
          <button onClick={() => navigate('/admin/scavenger-hunt')} className="back-btn">
            Back to Admin
          </button>
        </div>
      </div>
    );
  }

  const getFilteredSubmissions = () => {
    let filtered = allSubmissions;

    if (filterPrompt !== 'all') {
      filtered = filtered.filter(sub => sub.promptId === filterPrompt);
    }

    if (filterStatus === 'approved') {
      filtered = filtered.filter(sub => sub.approved);
    } else if (filterStatus === 'pending') {
      filtered = filtered.filter(sub => !sub.approved);
    }

    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const handleApprove = (submission) => {
    updateSubmission(submission.id, { approved: true });
    setMessage(`✅ Approved submission from ${submission.studentName}!`);
    setTimeout(() => setMessage(''), 3000);
    if (selectedSubmission?.id === submission.id) {
      setSelectedSubmission({ ...submission, approved: true });
    }
  };

  const handleUnapprove = (submission) => {
    updateSubmission(submission.id, { approved: false });
    setMessage(`Unapproved submission from ${submission.studentName}`);
    setTimeout(() => setMessage(''), 3000);
    if (selectedSubmission?.id === submission.id) {
      setSelectedSubmission({ ...submission, approved: false });
    }
  };

  const handleDelete = (submission) => {
    if (window.confirm(`Are you sure you want to delete ${submission.studentName}'s submission?`)) {
      deleteSubmission(submission.id);
      setMessage(`✅ Deleted submission from ${submission.studentName}`);
      setTimeout(() => setMessage(''), 3000);
      if (selectedSubmission?.id === submission.id) {
        setSelectedSubmission(null);
      }
    }
  };

  const getPromptInfo = (promptId) => {
    const prompt = hunt.prompts.find(p => p.id === promptId);
    return prompt || { verseReference: 'Unknown', prompt: 'Unknown prompt' };
  };

  const filteredSubmissions = getFilteredSubmissions();
  const leaderboard = getLeaderboard(huntId);

  return (
    <div className="submission-gallery-page">
      <div className="gallery-header">
        <div>
          <h1>{hunt.title} - Submissions</h1>
          <p className="hunt-subtitle">{allSubmissions.length} total submissions</p>
        </div>
        <button onClick={() => navigate('/admin/scavenger-hunt')} className="back-btn">
          ← Back to Admin
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'info'}`}>
          {message}
        </div>
      )}

      <div className="view-toggle">
        <button
          onClick={() => setView('gallery')}
          className={`toggle-btn ${view === 'gallery' ? 'active' : ''}`}
        >
          Gallery View
        </button>
        <button
          onClick={() => setView('leaderboard')}
          className={`toggle-btn ${view === 'leaderboard' ? 'active' : ''}`}
        >
          Leaderboard
        </button>
      </div>

      {view === 'leaderboard' ? (
        <div className="leaderboard-view">
          <h2>Leaderboard (Approved Submissions)</h2>
          {leaderboard.length === 0 ? (
            <div className="empty-state">
              <p>No approved submissions yet</p>
            </div>
          ) : (
            <div className="leaderboard-list">
              {leaderboard.map((entry, index) => (
                <div key={entry.name} className="leaderboard-entry">
                  <div className="rank">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && `#${index + 1}`}
                  </div>
                  <div className="student-info">
                    <h3>{entry.name}</h3>
                    <p>{entry.count} approved {entry.count === 1 ? 'submission' : 'submissions'}</p>
                  </div>
                  <div className="submission-thumbnails">
                    {entry.submissions.slice(0, 3).map(sub => (
                      <img
                        key={sub.id}
                        src={sub.photoDataUrl}
                        alt="Submission"
                        className="mini-thumbnail"
                        onClick={() => {
                          setView('gallery');
                          setSelectedSubmission(sub);
                        }}
                      />
                    ))}
                    {entry.submissions.length > 3 && (
                      <div className="more-indicator">
                        +{entry.submissions.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="filters">
            <div className="filter-group">
              <label htmlFor="promptFilter">Filter by Prompt:</label>
              <select
                id="promptFilter"
                value={filterPrompt}
                onChange={(e) => setFilterPrompt(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Prompts</option>
                {hunt.prompts.map((prompt, index) => (
                  <option key={prompt.id} value={prompt.id}>
                    Prompt {index + 1}: {prompt.verseReference}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="statusFilter">Filter by Status:</label>
              <select
                id="statusFilter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Submissions</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
              </select>
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="empty-state">
              <h2>No submissions found</h2>
              <p>Try adjusting your filters or wait for students to submit photos.</p>
            </div>
          ) : (
            <div className="submissions-layout">
              <div className="submissions-grid">
                {filteredSubmissions.map(submission => {
                  const promptInfo = getPromptInfo(submission.promptId);
                  return (
                    <div
                      key={submission.id}
                      className={`submission-card ${selectedSubmission?.id === submission.id ? 'selected' : ''} ${submission.approved ? 'approved' : 'pending'}`}
                      onClick={() => setSelectedSubmission(submission)}
                    >
                      <img
                        src={submission.photoDataUrl}
                        alt="Submission"
                        className="submission-image"
                      />
                      <div className="submission-info">
                        <div className="student-badge">{submission.studentName}</div>
                        <div className="prompt-badge">{promptInfo.verseReference}</div>
                        {submission.approved && (
                          <div className="approved-badge">✓ Approved</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedSubmission && (
                <div className="submission-detail">
                  <div className="detail-header">
                    <h2>Submission Details</h2>
                    <button
                      onClick={() => setSelectedSubmission(null)}
                      className="close-detail-btn"
                    >
                      ✕
                    </button>
                  </div>

                  <img
                    src={selectedSubmission.photoDataUrl}
                    alt="Submission"
                    className="detail-image"
                  />

                  <div className="detail-content">
                    <div className="detail-row">
                      <span className="detail-label">Student:</span>
                      <span className="detail-value">{selectedSubmission.studentName}</span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Prompt:</span>
                      <span className="detail-value">
                        {getPromptInfo(selectedSubmission.promptId).verseReference}
                      </span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Submitted:</span>
                      <span className="detail-value">
                        {new Date(selectedSubmission.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Status:</span>
                      <span className={`detail-value status-${selectedSubmission.approved ? 'approved' : 'pending'}`}>
                        {selectedSubmission.approved ? '✓ Approved' : '⏳ Pending Review'}
                      </span>
                    </div>

                    <div className="prompt-context">
                      <h3>Verse & Prompt:</h3>
                      <p className="verse-text">
                        "{getPromptInfo(selectedSubmission.promptId).verse}"
                      </p>
                      <p className="prompt-text">
                        {getPromptInfo(selectedSubmission.promptId).prompt}
                      </p>
                    </div>

                    <div className="student-description">
                      <h3>Student's Explanation:</h3>
                      <p>{selectedSubmission.description}</p>
                    </div>

                    <div className="detail-actions">
                      {selectedSubmission.approved ? (
                        <button
                          onClick={() => handleUnapprove(selectedSubmission)}
                          className="unapprove-btn"
                        >
                          Unapprove
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApprove(selectedSubmission)}
                          className="approve-btn"
                        >
                          ✓ Approve
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(selectedSubmission)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SubmissionGalleryPage;
