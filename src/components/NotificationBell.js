import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePassageComments } from '../contexts/PassageCommentContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import './NotificationBell.css';

function NotificationBell() {
  const { currentUser } = useAuth();
  const { subscribeToNotifications, markNotificationRead } = usePassageComments();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notificationDetails, setNotificationDetails] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }

    const unsubscribe = subscribeToNotifications((newNotifications) => {
      setNotifications(newNotifications);
      // Load details for each notification
      newNotifications.forEach(loadNotificationDetails);
    });

    return unsubscribe;
  }, [currentUser, subscribeToNotifications]);

  const loadNotificationDetails = async (notification) => {
    try {
      // Load sender info
      const senderDoc = await getDoc(doc(db, 'users', notification.senderId));
      const senderName = senderDoc.exists()
        ? senderDoc.data().displayName
        : 'Someone';

      // Load group info
      const groupDoc = await getDoc(doc(db, 'groups', notification.groupId));
      const groupName = groupDoc.exists() ? groupDoc.data().name : 'a group';

      setNotificationDetails((prev) => ({
        ...prev,
        [notification.id]: { senderName, groupName },
      }));
    } catch (error) {
      console.error('Error loading notification details:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      await markNotificationRead(notification.id);
      setShowDropdown(false);

      // Navigate to the passage/discussion
      // You might want to customize this based on your app structure
      navigate(`/bible-tool?passage=${encodeURIComponent(notification.passageRef)}&group=${notification.groupId}`);
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  };

  const formatNotificationText = (notification) => {
    const details = notificationDetails[notification.id];
    if (!details) return 'Loading...';

    const { senderName, groupName } = details;

    if (notification.type === 'reply') {
      return `${senderName} replied to your comment in ${groupName}`;
    } else {
      return `${senderName} commented on ${notification.passageRef} in ${groupName}`;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString();
  };

  if (!currentUser) return null;

  return (
    <div className="notification-bell">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="bell-button"
        aria-label="Notifications"
      >
        🔔
        {notifications.length > 0 && (
          <span className="notification-badge">{notifications.length}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            <button
              onClick={() => setShowDropdown(false)}
              className="close-btn"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="no-notifications">No new notifications</p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className="notification-item"
                >
                  <p className="notification-text">
                    {formatNotificationText(notification)}
                  </p>
                  <span className="notification-time">
                    {formatTime(notification.createdAt)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
