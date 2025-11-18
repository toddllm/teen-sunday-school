import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSmallGroups } from '../contexts/SmallGroupContext';
import { useUser } from '../contexts/UserContext';
import { useLessons } from '../contexts/LessonContext';
import './GroupDetailPage.css';

function GroupDetailPage() {
  const { groupId } = useParams();
  const { currentUser } = useUser();
  const {
    getGroupById,
    getGroupMembers,
    getGroupPlans,
    getGroupMessages,
    postMessage,
    deleteMessage,
    isGroupLeader,
    isGroupMember,
    generateInviteLink,
    addMember,
    removeMember,
    updateMemberRole,
    addGroupPlan,
    removeGroupPlan,
  } = useSmallGroups();
  const { lessons } = useLessons();

  const [activeTab, setActiveTab] = useState('discussion'); // discussion, plans, members
  const [newMessage, setNewMessage] = useState('');
  const [selectedPassage, setSelectedPassage] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [showAddPlanForm, setShowAddPlanForm] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const group = getGroupById(groupId);
  const members = getGroupMembers(groupId);
  const plans = getGroupPlans(groupId);
  const messages = getGroupMessages(groupId);
  const isLeader = isGroupLeader(groupId);
  const isMember = isGroupMember(groupId);

  useEffect(() => {
    if (group) {
      setInviteLink(generateInviteLink(groupId));
    }
  }, [group, groupId, generateInviteLink]);

  if (!group) {
    return (
      <div className="group-detail-page">
        <div className="container">
          <div className="error-state">
            <h2>Group not found</h2>
            <p>This group doesn't exist or you don't have access to it.</p>
            <Link to="/groups" className="btn btn-primary">
              Back to My Groups
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isMember) {
    return (
      <div className="group-detail-page">
        <div className="container">
          <div className="error-state">
            <h2>Access Denied</h2>
            <p>You are not a member of this group.</p>
            <Link to="/groups" className="btn btn-primary">
              Back to My Groups
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handlePostMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      postMessage(groupId, newMessage, selectedPassage || null);
      setNewMessage('');
      setSelectedPassage('');
    }
  };

  const handleDeleteMessage = (messageId) => {
    if (window.confirm('Delete this message?')) {
      deleteMessage(messageId);
    }
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (newMemberName.trim()) {
      addMember(groupId, newMemberName);
      setNewMemberName('');
      setShowAddMemberForm(false);
    }
  };

  const handleRemoveMember = (memberId, memberName) => {
    if (window.confirm(`Remove ${memberName} from this group?`)) {
      removeMember(memberId);
    }
  };

  const handleToggleMemberRole = (member) => {
    const newRole = member.role === 'leader' ? 'member' : 'leader';
    updateMemberRole(member.id, newRole);
  };

  const handleAddPlan = (e) => {
    e.preventDefault();
    if (selectedLessonId) {
      const lesson = lessons.find((l) => l.id === selectedLessonId);
      if (lesson) {
        addGroupPlan(groupId, lesson.id, lesson.title, new Date().toISOString().split('T')[0]);
        setSelectedLessonId('');
        setShowAddPlanForm(false);
      }
    }
  };

  const handleRemovePlan = (planId, planName) => {
    if (window.confirm(`Remove "${planName}" from this group?`)) {
      removeGroupPlan(planId);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="group-detail-page">
      <div className="container">
        {/* Header */}
        <div className="group-header">
          <div className="group-header-main">
            <Link to="/groups" className="back-link">
              ← Back to Groups
            </Link>
            <h1>{group.name}</h1>
            {group.description && <p className="group-description">{group.description}</p>}
          </div>
          {isLeader && (
            <button
              className="btn btn-secondary"
              onClick={() => setShowInviteModal(true)}
            >
              📨 Invite Members
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="group-tabs">
          <button
            className={`tab ${activeTab === 'discussion' ? 'active' : ''}`}
            onClick={() => setActiveTab('discussion')}
          >
            💬 Discussion ({messages.length})
          </button>
          <button
            className={`tab ${activeTab === 'plans' ? 'active' : ''}`}
            onClick={() => setActiveTab('plans')}
          >
            📖 Reading Plans ({plans.length})
          </button>
          <button
            className={`tab ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            👥 Members ({members.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Discussion Tab */}
          {activeTab === 'discussion' && (
            <div className="discussion-tab">
              <form onSubmit={handlePostMessage} className="message-form">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Share your thoughts, questions, or prayer requests..."
                  className="message-input"
                  rows="3"
                  required
                />
                <div className="message-form-footer">
                  <input
                    type="text"
                    value={selectedPassage}
                    onChange={(e) => setSelectedPassage(e.target.value)}
                    placeholder="Related passage (optional, e.g., John 3:16)"
                    className="passage-input"
                  />
                  <button type="submit" className="btn btn-primary">
                    Post Message
                  </button>
                </div>
              </form>

              <div className="messages-list">
                {messages.length === 0 ? (
                  <div className="empty-messages">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className="message-card">
                      <div className="message-header">
                        <strong>{message.userName}</strong>
                        <span className="message-time">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                      {message.passageRef && (
                        <div className="message-passage">📖 {message.passageRef}</div>
                      )}
                      <p className="message-body">{message.body}</p>
                      {(currentUser?.id === message.userId || isLeader) && (
                        <button
                          className="delete-message-btn"
                          onClick={() => handleDeleteMessage(message.id)}
                          title="Delete message"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Plans Tab */}
          {activeTab === 'plans' && (
            <div className="plans-tab">
              {isLeader && (
                <div className="plans-header">
                  {!showAddPlanForm ? (
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowAddPlanForm(true)}
                    >
                      + Add Reading Plan
                    </button>
                  ) : (
                    <form onSubmit={handleAddPlan} className="add-plan-form">
                      <select
                        value={selectedLessonId}
                        onChange={(e) => setSelectedLessonId(e.target.value)}
                        className="plan-select"
                        required
                      >
                        <option value="">Select a lesson...</option>
                        {lessons.map((lesson) => (
                          <option key={lesson.id} value={lesson.id}>
                            {lesson.title} (Q{lesson.quarter}, U{lesson.unit}, L{lesson.lessonNumber})
                          </option>
                        ))}
                      </select>
                      <button type="submit" className="btn btn-primary btn-sm">
                        Add
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setShowAddPlanForm(false);
                          setSelectedLessonId('');
                        }}
                      >
                        Cancel
                      </button>
                    </form>
                  )}
                </div>
              )}

              <div className="plans-list">
                {plans.length === 0 ? (
                  <div className="empty-plans">
                    <p>
                      No reading plans assigned yet.
                      {isLeader && ' Add one to get started!'}
                    </p>
                  </div>
                ) : (
                  plans.map((plan) => {
                    const lesson = lessons.find((l) => l.id === plan.planId);
                    return (
                      <div key={plan.id} className="plan-card">
                        <div className="plan-info">
                          <h3>{plan.planName}</h3>
                          {lesson && (
                            <p className="plan-details">
                              Quarter {lesson.quarter}, Unit {lesson.unit}, Lesson {lesson.lessonNumber}
                            </p>
                          )}
                          <p className="plan-start-date">
                            Started: {new Date(plan.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="plan-actions">
                          {lesson && (
                            <Link
                              to={`/lesson/${lesson.id}`}
                              className="btn btn-primary btn-sm"
                            >
                              View Lesson
                            </Link>
                          )}
                          {isLeader && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleRemovePlan(plan.id, plan.planName)}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="members-tab">
              {isLeader && (
                <div className="members-header">
                  {!showAddMemberForm ? (
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowAddMemberForm(true)}
                    >
                      + Add Member
                    </button>
                  ) : (
                    <form onSubmit={handleAddMember} className="add-member-form">
                      <input
                        type="text"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        placeholder="Member name"
                        className="member-input"
                        autoFocus
                        required
                      />
                      <button type="submit" className="btn btn-primary btn-sm">
                        Add
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setShowAddMemberForm(false);
                          setNewMemberName('');
                        }}
                      >
                        Cancel
                      </button>
                    </form>
                  )}
                </div>
              )}

              <div className="members-list">
                {members.map((member) => (
                  <div key={member.id} className="member-card">
                    <div className="member-info">
                      <strong>{member.userName}</strong>
                      <span className={`role-badge ${member.role}`}>
                        {member.role === 'leader' ? '👑 Leader' : '👤 Member'}
                      </span>
                    </div>
                    <div className="member-meta">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </div>
                    {isLeader && currentUser?.id !== member.userId && (
                      <div className="member-actions">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleToggleMemberRole(member)}
                        >
                          {member.role === 'leader'
                            ? 'Remove Leader'
                            : 'Make Leader'}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() =>
                            handleRemoveMember(member.id, member.userName)
                          }
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Invite Members</h2>
            <p>Share this link with people you want to invite to this group:</p>
            <div className="invite-link-box">
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="invite-link-input"
              />
              <button
                className="btn btn-primary"
                onClick={handleCopyInviteLink}
              >
                {copySuccess ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
            <p className="invite-note">
              Note: In this demo, you can manually add members using the Members tab.
            </p>
            <button
              className="btn btn-secondary"
              onClick={() => setShowInviteModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupDetailPage;
