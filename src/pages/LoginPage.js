import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, register, quickLogin } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLoginMode) {
        login(formData.email, formData.password);
        navigate('/');
      } else {
        if (!formData.name) {
          setError('Name is required for registration');
          return;
        }
        register(formData);
        login(formData.email, formData.password);
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleQuickLogin = (role) => {
    try {
      if (role === 'admin') {
        quickLogin('Admin User', 'admin@example.com');
      } else if (role === 'leader') {
        quickLogin('Group Leader', 'leader@example.com');
      } else {
        quickLogin('Member User', 'member@example.com');
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Teen Sunday School</h1>
        <h2>{isLoginMode ? 'Login' : 'Register'}</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          {!isLoginMode && (
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={!isLoginMode}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-primary">
            {isLoginMode ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="toggle-mode">
          {isLoginMode ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setIsLoginMode(false)}
                className="btn-link"
              >
                Register
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsLoginMode(true)}
                className="btn-link"
              >
                Login
              </button>
            </p>
          )}
        </div>

        <div className="quick-login">
          <p className="quick-login-title">Quick Demo Login:</p>
          <div className="quick-login-buttons">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="btn-secondary"
            >
              Login as Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('leader')}
              className="btn-secondary"
            >
              Login as Leader
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('member')}
              className="btn-secondary"
            >
              Login as Member
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
