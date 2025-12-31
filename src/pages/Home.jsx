import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, getAccessToken, logout } from '../utils/api';
import '../styles/Home.css';

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const verifyUser = async () => {
      const accessToken = getAccessToken();

      if (!accessToken) {
        navigate('/');
        return;
      }

      try {
        const response = await apiFetch('/api/auth/verify');

        if (!response.ok) {
          throw new Error('Invalid token');
        }

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="home">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-container">
          <a href="/home" className="logo">
            <div className="logo-icon">P</div>
            <span>Projectify</span>
          </a>

          <ul className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
            <li><a href="#" className="active">Home</a></li>
            <li><a href="#">Features</a></li>
            <li><a href="#">Pricing</a></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Contact</a></li>
          </ul>

          <div className="nav-right">
            <div className="user-dropdown">
              <button className="user-btn">
                <div className="user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="user-name">{user.name}</span>
                <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div className="dropdown-menu">
                <a href="#" className="dropdown-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Profile
                </a>
                <a href="#" className="dropdown-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                  Settings
                </a>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="dropdown-item logout">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>

            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
        </div>
        <div className="hero-container">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            Welcome back, {user.name}!
          </div>
          <h1 className="hero-title">
            Manage Your Projects<br />
            <span className="gradient-text">Like Never Before</span>
          </h1>
          <p className="hero-description">
            Streamline your workflow, collaborate with your team, and deliver
            projects on time. Everything you need in one powerful platform.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary btn-lg">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Create New Project
            </button>
            <button className="btn btn-secondary btn-lg">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Watch Demo
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Active Users</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Projects Created</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">99%</span>
              <span className="stat-label">Satisfaction</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-container">
          <div className="section-header">
            <span className="section-tag">Features</span>
            <h2 className="section-title">Everything you need to succeed</h2>
            <p className="section-description">
              Powerful features to help you manage projects, collaborate with teams, and achieve your goals faster.
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3>Task Management</h3>
              <p>Organize tasks, set priorities, and track progress with our intuitive task management system.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3>Team Collaboration</h3>
              <p>Work together seamlessly with real-time updates, comments, and file sharing capabilities.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <h3>Analytics & Reports</h3>
              <p>Get insights into your team's performance with detailed analytics and customizable reports.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon orange">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3>Timeline View</h3>
              <p>Visualize project timelines with Gantt charts and stay on top of deadlines effortlessly.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon pink">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3>Instant Messaging</h3>
              <p>Communicate instantly with your team through built-in chat and notification system.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon cyan">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <h3>Cloud Storage</h3>
              <p>Store and access your files from anywhere with secure cloud storage integration.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-container">
          <h2>Ready to boost your productivity?</h2>
          <p>Join thousands of teams already using Projectify to deliver amazing results.</p>
          <button className="btn btn-white btn-lg">
            Start Your Free Trial
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <a href="/home" className="logo">
              <div className="logo-icon">P</div>
              <span>Projectify</span>
            </a>
            <p>Making project management simple and effective for teams of all sizes.</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Product</h4>
              <a href="#">Features</a>
              <a href="#">Pricing</a>
              <a href="#">Integrations</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Blog</a>
              <a href="#">Careers</a>
            </div>
            <div className="footer-col">
              <h4>Support</h4>
              <a href="#">Help Center</a>
              <a href="#">Contact</a>
              <a href="#">Status</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Projectify. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
