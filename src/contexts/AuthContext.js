import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInAnonymously
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up with email and password
  const signup = async (email, password, displayName) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Update profile with display name
    await updateProfile(result.user, { displayName });

    // Create user profile in Firestore
    await setDoc(doc(db, 'users', result.user.uid), {
      uid: result.user.uid,
      email: result.user.email,
      displayName: displayName,
      createdAt: new Date().toISOString(),
      role: 'member', // Default role
    });

    return result;
  };

  // Sign in with email and password
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Sign in anonymously (for guests)
  const loginAnonymously = async () => {
    const result = await signInAnonymously(auth);

    // Create minimal user profile
    await setDoc(doc(db, 'users', result.user.uid), {
      uid: result.user.uid,
      displayName: 'Guest User',
      isAnonymous: true,
      createdAt: new Date().toISOString(),
      role: 'member',
    });

    return result;
  };

  // Sign out
  const logout = () => {
    return signOut(auth);
  };

  // Load user profile from Firestore
  const loadUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        await loadUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    loginAnonymously,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
