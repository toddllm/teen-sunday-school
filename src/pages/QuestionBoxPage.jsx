import React from 'react';
import QuestionSubmitForm from '../components/QuestionSubmitForm';
import './QuestionBoxPage.css';

function QuestionBoxPage() {
  // For demo purposes, using a default group ID
  // In production, this would come from the user's context or route params
  const DEFAULT_GROUP_ID = 'default-group'; // This should be replaced with actual group selection

  return (
    <div className="question-box-page">
      <div className="page-header">
        <h1>Anonymous Question Box</h1>
        <p className="page-subtitle">
          Got a question? We're here to help! Submit your questions anonymously,
          and our leaders will address them during class or provide written answers.
        </p>
      </div>

      <div className="page-content">
        <QuestionSubmitForm groupId={DEFAULT_GROUP_ID} />
      </div>

      <div className="info-section">
        <h2>About the Question Box</h2>
        <div className="info-cards">
          <div className="info-card">
            <div className="info-icon">🔒</div>
            <h3>Completely Anonymous</h3>
            <p>
              Your questions are 100% anonymous. We don't collect any personal
              information when you submit a question.
            </p>
          </div>
          <div className="info-card">
            <div className="info-icon">💡</div>
            <h3>All Questions Welcome</h3>
            <p>
              No question is too big or small. Ask about the Bible, faith, life,
              or anything you're curious about.
            </p>
          </div>
          <div className="info-card">
            <div className="info-icon">👥</div>
            <h3>Leaders Who Care</h3>
            <p>
              Our caring leaders review all questions and provide thoughtful,
              biblical answers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionBoxPage;
