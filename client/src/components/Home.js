import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, meetingAPI } from '../utils/api';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [guestName, setGuestName] = useState('');
  
  // Auth form state
  const [authForm, setAuthForm] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!localStorage.getItem('token');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = isLogin
        ? await authAPI.login({ email: authForm.email, password: authForm.password })
        : await authAPI.register(authForm);

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setShowAuth(false);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
      setLoading(false);
    }
  };

  const handleCreateMeeting = async () => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }

    try {
      const response = await meetingAPI.create({
        title: 'Quick Meeting',
        description: 'Created from MeetSync'
      });
      navigate(`/room/${response.data.meetingId}`);
    } catch (err) {
      setError('Failed to create meeting');
    }
  };

  const handleJoinMeeting = () => {
    if (!joinCode.trim()) {
      setError('Please enter a meeting code');
      return;
    }

    const name = guestName.trim() || 'Guest';
    navigate(`/room/${joinCode.trim()}?name=${encodeURIComponent(name)}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  return (
    <div className="home">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="logo">
            <span className="logo-icon">📹</span>
            <span className="logo-text">MeetSync</span>
          </div>
          <div className="nav-actions">
            {isAuthenticated ? (
              <button onClick={handleLogout} className="btn-secondary">
                Logout
              </button>
            ) : (
              <button onClick={() => setShowAuth(true)} className="btn-secondary">
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="hero">
          <h1 className="hero-title">Premium video meetings for everyone</h1>
          <p className="hero-subtitle">
            Connect, collaborate, and celebrate from anywhere with MeetSync
          </p>

          <div className="action-cards">
            <div className="action-card">
              <h3>Create a Meeting</h3>
              <p>Start an instant meeting</p>
              <button onClick={handleCreateMeeting} className="btn-primary">
                New Meeting
              </button>
            </div>

            <div className="action-card">
              <h3>Join a Meeting</h3>
              <div className="join-form">
                <input
                  type="text"
                  placeholder="Enter meeting code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="input"
                />
                <input
                  type="text"
                  placeholder="Your name (optional)"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="input"
                />
                <button onClick={handleJoinMeeting} className="btn-primary">
                  Join
                </button>
              </div>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>
      </main>

      {showAuth && (
        <div className="modal-overlay" onClick={() => setShowAuth(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAuth(false)}>
              ✕
            </button>
            
            <h2>{isLogin ? 'Sign In' : 'Create Account'}</h2>
            
            <form onSubmit={handleAuth} className="auth-form">
              {!isLogin && (
                <input
                  type="text"
                  placeholder="Username"
                  value={authForm.username}
                  onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                  className="input"
                  required
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                className="input"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                className="input"
                required
              />
              
              {error && <div className="error-message">{error}</div>}
              
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
              </button>
            </form>

            <div className="auth-toggle">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="link-button"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
