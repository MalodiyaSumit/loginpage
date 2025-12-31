import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import { API_URL } from '../config';
import { setAccessToken } from '../utils/api';
import '../styles/Auth.css';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Required for cookies
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors
        if (data.errors) {
          throw new Error(data.errors[0].message);
        }
        throw new Error(data.message || 'Login failed');
      }

      // Store access token and user data
      setAccessToken(data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      setToast({ show: true, message: 'Login successful!', type: 'success' });

      setTimeout(() => {
        navigate('/home');
      }, 1000);
    } catch (error) {
      setToast({ show: true, message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: '', type: 'success' })}
      />

      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome back</h1>
          <p>Please enter your details to sign in</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-link">Forgot password?</a>
          </div>

          <button type="submit" className={`btn btn-primary ${loading ? 'loading' : ''}`}>
            <span className="btn-text">Sign in</span>
            <span className="btn-loader"></span>
          </button>
        </form>

        <p className="switch-text">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
