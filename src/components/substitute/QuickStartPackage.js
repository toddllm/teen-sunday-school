import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './QuickStartPackage.css';

function QuickStartPackage({ assignmentId, onBack, onComplete }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [packageData, setPackageData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchQuickStartPackage();
  }, [assignmentId]);

  const fetchQuickStartPackage = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/substitute/assignments/${assignmentId}/quick-start`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quick-start package');
      }

      const data = await response.json();
      setPackageData(data.package);
    } catch (err) {
      console.error('Error fetching quick-start package:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteClass = async () => {
    if (!window.confirm('Mark this class as completed?')) {
      return;
    }

    try {
      const response = await fetch(`/api/substitute/assignments/${assignmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          status: 'COMPLETED',
          notes: notes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to complete class');
      }

      alert('Class marked as completed!');
      onComplete();
    } catch (err) {
      console.error('Error completing class:', err);
      alert('Failed to complete class. Please try again.');
    }
  };

  const handleStartPresentation = () => {
    if (packageData?.lesson) {
      navigate(`/lesson/${packageData.lesson.id}/present`);
    } else {
      alert('No lesson assigned for this class.');
    }
  };

  if (loading) {
    return (
      <div className="quick-start-package">
        <div className="container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading quick-start package...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div className="quick-start-package">
        <div className="container">
          <div className="error-state">
            <h2>Error Loading Package</h2>
            <p>{error || 'Failed to load quick-start package'}</p>
            <button onClick={onBack} className="btn btn-primary">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { assignment, group, lesson, regularTeacher, preset } = packageData;

  return (
    <div className="quick-start-package">
      <div className="container">
        <div className="package-header">
          <button onClick={onBack} className="back-button">
            ← Back to Dashboard
          </button>
          <div className="header-content">
            <h1>Quick-Start Package</h1>
            <p className="assignment-date">
              {new Date(assignment.scheduledDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
          <div className="header-actions">
            {lesson && preset.autoLoadPresentation && (
              <button onClick={handleStartPresentation} className="btn btn-primary btn-lg">
                Start Presentation
              </button>
            )}
            <button onClick={handleCompleteClass} className="btn btn-secondary">
              Complete Class
            </button>
          </div>
        </div>

        <div className="quick-access-nav">
          <button
            className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          {lesson && (
            <>
              <button
                className={`nav-tab ${activeTab === 'lesson' ? 'active' : ''}`}
                onClick={() => setActiveTab('lesson')}
              >
                Lesson
              </button>
              <button
                className={`nav-tab ${activeTab === 'materials' ? 'active' : ''}`}
                onClick={() => setActiveTab('materials')}
              >
                Materials
              </button>
            </>
          )}
          <button
            className={`nav-tab ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            Students
          </button>
          <button
            className={`nav-tab ${activeTab === 'emergency' ? 'active' : ''}`}
            onClick={() => setActiveTab('emergency')}
          >
            Emergency Info
          </button>
        </div>

        <div className="package-content">
          {activeTab === 'overview' && (
            <div className="tab-content">
              <div className="overview-grid">
                <div className="info-card">
                  <h3>Class Information</h3>
                  <div className="info-item">
                    <label>Group:</label>
                    <span>{group.name}</span>
                  </div>
                  {group.description && (
                    <div className="info-item">
                      <label>Description:</label>
                      <span>{group.description}</span>
                    </div>
                  )}
                  {group.grade && (
                    <div className="info-item">
                      <label>Grade:</label>
                      <span>{group.grade}</span>
                    </div>
                  )}
                  {(group.ageMin || group.ageMax) && (
                    <div className="info-item">
                      <label>Age Range:</label>
                      <span>
                        {group.ageMin && group.ageMax
                          ? `${group.ageMin}-${group.ageMax} years`
                          : group.ageMin
                          ? `${group.ageMin}+ years`
                          : `Up to ${group.ageMax} years`}
                      </span>
                    </div>
                  )}
                  <div className="info-item">
                    <label>Students:</label>
                    <span>{group.memberCount} students</span>
                  </div>
                </div>

                {lesson && (
                  <div className="info-card">
                    <h3>Today's Lesson</h3>
                    <div className="lesson-title">{lesson.title}</div>
                    <div className="info-item">
                      <label>Quarter/Unit/Lesson:</label>
                      <span>Q{lesson.quarter} / U{lesson.unit} / L{lesson.lessonNumber}</span>
                    </div>
                    <div className="info-item">
                      <label>Scripture:</label>
                      <span>{lesson.scripture}</span>
                    </div>
                    {lesson.slides && (
                      <div className="info-item">
                        <label>Slides:</label>
                        <span>{lesson.slides.length} slides prepared</span>
                      </div>
                    )}
                  </div>
                )}

                {regularTeacher && (
                  <div className="info-card">
                    <h3>Regular Teacher</h3>
                    <div className="info-item">
                      <label>Name:</label>
                      <span>{regularTeacher.name}</span>
                    </div>
                    <div className="info-item">
                      <label>Email:</label>
                      <span>
                        <a href={`mailto:${regularTeacher.email}`}>
                          {regularTeacher.email}
                        </a>
                      </span>
                    </div>
                  </div>
                )}

                {assignment.notes && (
                  <div className="info-card highlight">
                    <h3>Special Instructions</h3>
                    <p className="notes-content">{assignment.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'lesson' && lesson && (
            <div className="tab-content">
              <div className="lesson-details">
                <h2>{lesson.title}</h2>
                <div className="lesson-meta">
                  <span>Quarter {lesson.quarter}</span>
                  <span>•</span>
                  <span>Unit {lesson.unit}</span>
                  <span>•</span>
                  <span>Lesson {lesson.lessonNumber}</span>
                </div>

                <div className="scripture-box">
                  <h3>Scripture Reference</h3>
                  <p className="scripture-text">{lesson.scripture}</p>
                </div>

                {lesson.content && (
                  <div className="lesson-content-box">
                    <h3>Lesson Overview</h3>
                    {typeof lesson.content === 'string' ? (
                      <p>{lesson.content}</p>
                    ) : (
                      <div>
                        {lesson.content.summary && <p>{lesson.content.summary}</p>}
                        {lesson.content.objectives && (
                          <div className="objectives">
                            <h4>Learning Objectives:</h4>
                            <ul>
                              {lesson.content.objectives.map((obj, idx) => (
                                <li key={idx}>{obj}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="action-buttons">
                  <button onClick={handleStartPresentation} className="btn btn-primary btn-lg">
                    Start Lesson Presentation
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'materials' && lesson && (
            <div className="tab-content">
              <div className="materials-grid">
                {preset.includeSlides && lesson.slides && (
                  <div className="material-card">
                    <div className="material-icon">📊</div>
                    <h3>Slides</h3>
                    <p>{lesson.slides.length} slides prepared and ready to present</p>
                    <button onClick={handleStartPresentation} className="btn btn-outline">
                      View Slides
                    </button>
                  </div>
                )}

                {preset.includeGames && lesson.games && (
                  <div className="material-card">
                    <div className="material-icon">🎮</div>
                    <h3>Interactive Games</h3>
                    <p>
                      {Object.keys(lesson.games).length} game
                      {Object.keys(lesson.games).length !== 1 ? 's' : ''} available
                    </p>
                    <div className="game-list">
                      {Object.keys(lesson.games).map(gameType => (
                        <span key={gameType} className="game-badge">
                          {gameType}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {preset.includeDiscussion && lesson.content?.discussionQuestions && (
                  <div className="material-card">
                    <div className="material-icon">💬</div>
                    <h3>Discussion Questions</h3>
                    <ul className="discussion-list">
                      {lesson.content.discussionQuestions.map((q, idx) => (
                        <li key={idx}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {assignment.customMaterials && (
                  <div className="material-card">
                    <div className="material-icon">📎</div>
                    <h3>Additional Materials</h3>
                    <div className="custom-materials">
                      {Array.isArray(assignment.customMaterials) ? (
                        assignment.customMaterials.map((material, idx) => (
                          <div key={idx} className="material-link">
                            {material.url ? (
                              <a href={material.url} target="_blank" rel="noopener noreferrer">
                                {material.name || material.url}
                              </a>
                            ) : (
                              <span>{material.name || material}</span>
                            )}
                          </div>
                        ))
                      ) : (
                        <p>{assignment.customMaterials}</p>
                      )}
                    </div>
                  </div>
                )}

                {preset.backupActivities && (
                  <div className="material-card highlight">
                    <div className="material-icon">⚡</div>
                    <h3>Backup Activities</h3>
                    <p className="helper-text">Use these if you need extra content</p>
                    <ul className="backup-list">
                      {preset.backupActivities.map((activity, idx) => (
                        <li key={idx}>{activity}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="tab-content">
              <div className="students-section">
                {group.leaders && group.leaders.length > 0 && (
                  <div className="leaders-list">
                    <h3>Group Leaders</h3>
                    <div className="leader-cards">
                      {group.leaders.map(leader => (
                        <div key={leader.id} className="leader-card">
                          <div className="leader-name">{leader.name}</div>
                          <div className="leader-email">
                            <a href={`mailto:${leader.email}`}>{leader.email}</a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {group.students && group.students.length > 0 && (
                  <div className="students-list">
                    <h3>Students ({group.students.length})</h3>
                    <div className="student-grid">
                      {group.students.map(student => (
                        <div key={student.id} className="student-badge">
                          {student.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(!group.students || group.students.length === 0) && (
                  <div className="empty-message">
                    <p>No student information available.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'emergency' && (
            <div className="tab-content">
              <div className="emergency-section">
                {assignment.emergencyContacts && assignment.emergencyContacts.length > 0 && (
                  <div className="emergency-contacts">
                    <h3>Emergency Contacts</h3>
                    <div className="contacts-list">
                      {assignment.emergencyContacts.map((contact, idx) => (
                        <div key={idx} className="contact-card">
                          <div className="contact-name">{contact.name}</div>
                          <div className="contact-role">{contact.role}</div>
                          <div className="contact-phone">
                            <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="emergency-tips">
                  <h3>Quick Tips for Substitutes</h3>
                  <ul>
                    <li>Arrive 15 minutes early to review materials and set up</li>
                    <li>Introduce yourself and explain you're substituting</li>
                    <li>Follow the lesson plan but adapt to the group's needs</li>
                    <li>Keep emergency contact information handy</li>
                    <li>Leave notes for the regular teacher about how class went</li>
                  </ul>
                </div>

                <div className="notes-section">
                  <h3>Your Notes (Optional)</h3>
                  <p className="helper-text">
                    Add any notes about the class to share with the regular teacher
                  </p>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="How did the class go? Any issues or highlights to share?"
                    rows="6"
                    className="notes-textarea"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuickStartPackage;
