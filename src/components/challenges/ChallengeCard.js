import React from 'react';
import { useChallenges } from '../../contexts/ChallengeContext';
import ProgressBar from './ProgressBar';
import './ChallengeCard.css';

const ChallengeCard = ({ challenge, onClick }) => {
  const { getDaysRemaining, getProgressPercentage, CHALLENGE_TYPE_LABELS } = useChallenges();

  const daysLeft = getDaysRemaining(challenge);
  const progress = getProgressPercentage(challenge);
  const isCompleted = challenge.status === 'COMPLETED';
  const isExpired = challenge.status === 'EXPIRED';

  return (
    <div
      className={`challenge-card ${isCompleted ? 'completed' : ''} ${isExpired ? 'expired' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div className="challenge-card-header">
        <div className="challenge-title-group">
          <h3 className="challenge-title">{challenge.name}</h3>
          <span className="challenge-group-name">{challenge.group?.name}</span>
        </div>
        <div className="challenge-status-badges">
          {isCompleted && <span className="status-badge completed">Completed!</span>}
          {isExpired && <span className="status-badge expired">Expired</span>}
          {!isCompleted && !isExpired && daysLeft <= 3 && (
            <span className="status-badge urgent">{daysLeft} days left</span>
          )}
        </div>
      </div>

      {challenge.description && (
        <p className="challenge-description">{challenge.description}</p>
      )}

      <div className="challenge-type">
        <span className="type-icon">🎯</span>
        <span className="type-label">{CHALLENGE_TYPE_LABELS[challenge.type]}</span>
      </div>

      <div className="challenge-goal">
        <span className="goal-current">{challenge.metrics?.totalProgress || 0}</span>
        <span className="goal-separator">/</span>
        <span className="goal-target">{challenge.targetValue}</span>
        <span className="goal-label"> {CHALLENGE_TYPE_LABELS[challenge.type].toLowerCase()}</span>
      </div>

      <ProgressBar progress={progress} />

      <div className="challenge-footer">
        <div className="challenge-participants">
          <span className="participant-icon">👥</span>
          <span className="participant-count">
            {challenge.metrics?.participantCount || 0} participants
          </span>
        </div>
        <div className="challenge-deadline">
          <span className="deadline-icon">📅</span>
          <span className="deadline-text">
            {daysLeft === 0
              ? 'Ends today'
              : daysLeft === 1
              ? '1 day left'
              : `${daysLeft} days left`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChallengeCard;
