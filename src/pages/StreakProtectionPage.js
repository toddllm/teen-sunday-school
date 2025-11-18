import React from 'react';
import { useStreak } from '../contexts/StreakContext';
import StreakProtection from '../components/StreakProtection';
import './StreakProtectionPage.css';

function StreakProtectionPage() {
  const {
    currentStreak,
    graceDaysAvailable,
    freezeDaysAvailable,
    activateFreezeDay,
    getGraceFreezStats
  } = useStreak();

  return (
    <div className="streak-protection-page">
      <StreakProtection
        graceDaysAvailable={graceDaysAvailable}
        freezeDaysAvailable={freezeDaysAvailable}
        currentStreak={currentStreak}
        activateFreezeDay={activateFreezeDay}
        getGraceFreezStats={getGraceFreezStats}
      />
    </div>
  );
}

export default StreakProtectionPage;
