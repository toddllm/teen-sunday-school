import React, { useState, useEffect } from 'react';
import { useProfile } from '../contexts/ProfileContext';
import { useAuth } from '../contexts/AuthContext';
import AvatarSelector from '../components/profile/AvatarSelector';
import NicknameInput from '../components/profile/NicknameInput';
import UserDisplay from '../components/profile/UserDisplay';
import './ProfileSettingsPage.css';

function ProfileSettingsPage() {
  const { user } = useAuth();
  const {
    profile,
    loading,
    updateProfile,
    getAvatarById,
  } = useProfile();

  const [nickname, setNickname] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Load initial values from profile
  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname || '');
      setSelectedAvatarId(profile.avatarId || null);
    }
  }, [profile]);

  // Check if there are changes
  useEffect(() => {
    const nicknameChanged = nickname !== (profile?.nickname || '');
    const avatarChanged = selectedAvatarId !== (profile?.avatarId || null);
    setHasChanges(nicknameChanged || avatarChanged);
  }, [nickname, selectedAvatarId, profile]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    // Build update object with only changed fields
    const updates = {};
    if (nickname !== (profile?.nickname || '')) {
      updates.nickname = nickname;
    }
    if (selectedAvatarId !== (profile?.avatarId || null)) {
      updates.avatarId = selectedAvatarId;
    }

    const result = await updateProfile(updates);

    if (result.success) {
      setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
      setHasChanges(false);
    } else {
      setSaveMessage({
        type: 'error',
        text: result.error || 'Failed to update profile',
        details: result.details,
      });
    }

    setIsSaving(false);

    // Clear message after 5 seconds
    setTimeout(() => setSaveMessage(null), 5000);
  };

  const handleReset = () => {
    setNickname(profile?.nickname || '');
    setSelectedAvatarId(profile?.avatarId || null);
    setHasChanges(false);
    setSaveMessage(null);
  };

  if (loading && !profile) {
    return (
      <div className="profile-settings">
        <div className="profile-settings__loading">Loading profile...</div>
      </div>
    );
  }

  const selectedAvatar = selectedAvatarId ? getAvatarById(selectedAvatarId) : null;

  return (
    <div className="profile-settings">
      <div className="profile-settings__container">
        <header className="profile-settings__header">
          <h1 className="profile-settings__title">Profile Settings</h1>
          <p className="profile-settings__subtitle">
            Personalize your profile with a fun avatar and nickname
          </p>
        </header>

        {/* Preview Section */}
        <section className="profile-settings__section profile-settings__preview">
          <h2 className="profile-settings__section-title">Preview</h2>
          <div className="profile-settings__preview-card">
            <UserDisplay
              nickname={nickname}
              firstName={user?.firstName}
              avatar={selectedAvatar}
              size="large"
            />
          </div>
        </section>

        {/* Nickname Section */}
        <section className="profile-settings__section">
          <h2 className="profile-settings__section-title">Nickname</h2>
          <p className="profile-settings__section-description">
            Choose a fun nickname that represents you (3-20 characters)
          </p>
          <NicknameInput
            value={nickname}
            onChange={setNickname}
            showValidation={true}
          />
        </section>

        {/* Avatar Section */}
        <section className="profile-settings__section">
          <h2 className="profile-settings__section-title">Avatar</h2>
          <p className="profile-settings__section-description">
            Select an avatar to personalize your profile
          </p>
          <AvatarSelector
            selectedId={selectedAvatarId}
            onSelect={setSelectedAvatarId}
          />
        </section>

        {/* Actions */}
        <div className="profile-settings__actions">
          <button
            className="profile-settings__button profile-settings__button--primary"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            className="profile-settings__button profile-settings__button--secondary"
            onClick={handleReset}
            disabled={!hasChanges || isSaving}
          >
            Reset
          </button>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div
            className={`profile-settings__message profile-settings__message--${saveMessage.type}`}
          >
            {saveMessage.text}
            {saveMessage.details && saveMessage.details.length > 0 && (
              <ul className="profile-settings__message-details">
                {saveMessage.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileSettingsPage;
