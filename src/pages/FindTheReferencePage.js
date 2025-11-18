import React from 'react';
import { useNavigate } from 'react-router-dom';
import FindTheReference from '../components/games/FindTheReference';
import './FindTheReferencePage.css';

const FindTheReferencePage = () => {
  const navigate = useNavigate();

  return (
    <div className="find-reference-page">
      <div className="page-header">
        <h1>Find the Reference</h1>
        <button onClick={() => navigate('/')} className="back-button">
          ← Back to Home
        </button>
      </div>

      <div className="page-description">
        <p>
          Test your knowledge of Bible verses! Read the verse and identify the correct
          reference from the multiple choice options. Track your progress and improve
          your scripture memory.
        </p>
      </div>

      <FindTheReference />
    </div>
  );
};

export default FindTheReferencePage;
