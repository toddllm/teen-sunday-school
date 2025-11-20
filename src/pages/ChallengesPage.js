import React, { useState, useEffect } from 'react';
import { useChallenges } from '../contexts/ChallengeContext';
import { useAuth } from '../contexts/AuthContext';
import ChallengeCard from '../components/challenges/ChallengeCard';
import Leaderboard from '../components/challenges/Leaderboard';
import ProgressBar from '../components/challenges/ProgressBar';
import './ChallengesPage.css';

const ChallengesPage = () => {
  const { user } = useAuth();
  const {
    activeChallenges,
    loading,
    error,
    fetchActiveChallenges,
    joinChallenge,
    getChallengeDetails,
    getChallengeLeaderboard,
  } = useChallenges();

  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [challengeDetails, setChallengeDetails] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Refresh challenges on mount
  useEffect(() => {
    fetchActiveChallenges();
  }, [fetchActiveChallenges]);

  // Fetch challenge details when selected
  useEffect(() => {
    if (selectedChallenge) {
      loadChallengeDetails(selectedChallenge.id);
    }
  }, [selectedChallenge]);

  const loadChallengeDetails = async (challengeId) => {
    try {
      setDetailsLoading(true);
      const [details, leaderboardData] = await Promise.all([
        getChallengeDetails(challengeId),
        getChallengeLeaderboard(challengeId, 10),
      ]);
      setChallengeDetails(details);
      setLeaderboard(leaderboardData);
    } catch (err) {
      console.error('Error loading challenge details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleChallengeClick = (challenge) => {
    setSelectedChallenge(challenge);
  };

  const handleBack = () => {
    setSelectedChallenge(null);
    setChallengeDetails(null);
    setLeaderboard([]);
  };

  const handleJoinChallenge = async () => {
    if (!selectedChallenge) return;

    try {
      await joinChallenge(selectedChallenge.id);
      // Reload challenge details
      await loadChallengeDetails(selectedChallenge.id);
      // Refresh active challenges list
      await fetchActiveChallenges();
    } catch (err) {
      alert(`Failed to join challenge: ${err.message}`);
    }
  };

  // Loading state
  if (loading && !selectedChallenge) {
    return (
      <div className="challenges-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading challenges...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !selectedChallenge) {
    return (
      <div className="challenges-page">
        <div className="error-state">
          <h2>Unable to load challenges</h2>
          <p>{error}</p>
          <button onClick={fetchActiveChallenges} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Detail view
  if (selectedChallenge && challengeDetails) {
    const isParticipant = challengeDetails.participants?.some(
      p => p.userId === user?.id
    );

    return (
      <div className="challenges-page challenge-detail-view">
        <button onClick={handleBack} className="back-button">
          ← Back to Challenges
        </button>

        <div className="challenge-detail-container">
          <div className="challenge-detail-header">
            <h1>{challengeDetails.name}</h1>
            <span className="challenge-group-tag">{challengeDetails.group?.name}</span>
          </div>

          {challengeDetails.description && (
            <p className="challenge-detail-description">{challengeDetails.description}</p>
          )}

          <div className="challenge-detail-stats">
            <div className="stat-card">
              <span className="stat-label">Goal</span>
              <span className="stat-value">{challengeDetails.targetValue}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Progress</span>
              <span className="stat-value">
                {challengeDetails.metrics?.totalProgress || 0}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Participants</span>
              <span className="stat-value">
                {challengeDetails.metrics?.participantCount || 0}
              </span>
            </div>
          </div>

          <div className="challenge-progress-section">
            <h3>Team Progress</h3>
            <ProgressBar
              progress={challengeDetails.metrics?.progressPercentage || 0}
              height="32px"
            />
            <p className="progress-text">
              {challengeDetails.metrics?.totalProgress || 0} of{' '}
              {challengeDetails.targetValue} completed
            </p>
          </div>

          {!isParticipant && challengeDetails.status === 'ACTIVE' && (
            <div className="join-challenge-section">
              <button onClick={handleJoinChallenge} className="join-button">
                Join This Challenge
              </button>
            </div>
          )}

          {leaderboard && leaderboard.length > 0 && (
            <Leaderboard entries={leaderboard} currentUserId={user?.id} />
          )}

          {challengeDetails.celebrationMessage &&
            challengeDetails.status === 'COMPLETED' && (
              <div className="celebration-message">
                <h3>🎉 Challenge Completed!</h3>
                <p>{challengeDetails.celebrationMessage}</p>
              </div>
            )}
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="challenges-page">
      <div className="challenges-header">
        <h1>Team Challenges</h1>
        <p>Join your group in reaching shared goals together!</p>
      </div>

      {activeChallenges.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <h2>No Active Challenges</h2>
          <p>Check back later or ask your leader to create a new challenge!</p>
        </div>
      ) : (
        <div className="challenges-grid">
          {activeChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onClick={() => handleChallengeClick(challenge)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChallengesPage;
