import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import AuthLayout from '../components/AuthLayout';
import CloudLogo from '../components/CloudLogo';
import FormInput from '../components/FormInput';
import SocialButton from '../components/SocialButton';
import './Auth.css';

/* ── Feature-icon SVGs for the left panel ── */

function StorageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 2 7l10 5 10-5-10-5Z" />
      <path d="m2 17 10 5 10-5" />
      <path d="m2 12 10 5 10-5" />
    </svg>
  );
}

function DevicesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12" y2="18" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function PrivacyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

/* ── Form-field icons ── */

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}


/* ── Left-panel feature list ── */
const LOGIN_FEATURES = [
  { icon: <StorageIcon />, title: 'Secure Storage', description: 'Your files are always safe' },
  { icon: <DevicesIcon />, title: 'Access Anywhere', description: 'On all your devices' },
  { icon: <ShareIcon />, title: 'Easy Sharing', description: 'Share with anyone' },
  { icon: <PrivacyIcon />, title: 'Your Privacy', description: 'We never share your data' },
];


/* ═══════════════════════════════════════════
   LOGIN PAGE
   ═══════════════════════════════════════════ */

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Backend ko credentials bheje
      const response = await api.post('/api/auth/login', { email, password });

      // Response se JWT token nikal kar browser ki local storage me save kar liya
      const token = response.data.data.accessToken;
      localStorage.setItem('token', token);

      // Successfully login ke baad Dashboard page par chale jao
      navigate('/dashboard');
    } catch (error) {
      alert('Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      badge="Your Files, Always With You"
      headline={
        <>
          Access Your World{' '}
          <span className="highlight">Anywhere</span>
        </>
      }
      subtext="Sign in to your G-Drive-Clone account and securely access, store, and manage your files from any device, anytime."
      features={LOGIN_FEATURES}
    >
      {/* ── Login Card ── */}
      <div className="auth-card">
        {/* Brand */}
        <div className="auth-card__brand">
          <CloudLogo size={24} />
          <span className="auth-card__brand-name">G-Drive-Clone</span>
        </div>

        {/* Heading */}
        <h2 className="auth-card__title">Sign In</h2>
        <p className="auth-card__subtitle">
          Welcome back! Please sign in to continue to your G-Drive-Clone account.
        </p>

        {/* Form */}
        <form method="post" onSubmit={handleLogin} noValidate>
          <FormInput
            label="Email Address"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<MailIcon />}
            required
            autoComplete="email"
          />

          <FormInput
            label="Password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<LockIcon />}
            required
            autoComplete="current-password"
          />

          {/* Extras row */}
          <div className="form-extras">
            <label className="form-checkbox">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="form-checkbox__label">Remember me</span>
            </label>
            <a href="#forgot" className="form-forgot">Forgot password?</a>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="auth-btn"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <span className="auth-btn__spinner" aria-label="Signing in…" />
            ) : (
              <>
                Sign In
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider" role="separator">
          <span>or continue with</span>
        </div>

        {/* Social */}
        <div className="social-buttons">
          <SocialButton provider="google" />
          <SocialButton provider="microsoft" />
          <SocialButton provider="github" />
        </div>

        {/* Switch */}
        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/register">Sign up</Link>
        </p>
      </div>
    </AuthLayout>
  );
}