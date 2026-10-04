import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import AuthLayout from '../components/AuthLayout';
import CloudLogo from '../components/CloudLogo';
import FormInput from '../components/FormInput';
import SocialButton from '../components/SocialButton';
import './Auth.css';

/* ── Feature-icon SVGs for the left panel ── */

function CloudIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>
  );
}

function SyncIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

/* ── Form-field icons ── */

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

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
const REGISTER_FEATURES = [
  { icon: <CloudIcon />, title: '20 GB Free Storage', description: 'Get started with free storage' },
  { icon: <SyncIcon />, title: 'Access on All Devices', description: 'Sync across all your devices' },
  { icon: <UsersIcon />, title: 'Share & Collaborate', description: 'Work together in real-time' },
  { icon: <ShieldCheckIcon />, title: 'Safe & Private', description: 'Your data is always protected' },
];


/* ═══════════════════════════════════════════
   REGISTER PAGE
   ═══════════════════════════════════════════ */

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault(); // Page ko automatic reload hone se rokta hai

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    if (!agreedTerms) {
      alert('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setIsLoading(true);
    try {
      // Backend ko fullName, email, password, confirmPassword bheja account create karne ke liye
      await api.post('/api/auth/register', { fullName, email, password, confirmPassword });
      alert('Registration successful! Please login.');
      navigate('/login'); // Success ke baad Login page par bhej diya
    } catch (error) {
      alert('Registration failed! ' + (error.response?.data?.message || 'Something went wrong.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      badge="Free Cloud Storage"
      headline={
        <>
          Create Your{' '}
          <span className="highlight">G-Drive-Clone</span>{' '}
          Account
        </>
      }
      subtext="Join millions who store, share, and collaborate on their files securely in the cloud."
      features={REGISTER_FEATURES}
    >
      {/* ── Register Card ── */}
      <div className="auth-card">
        {/* Brand */}
        <div className="auth-card__brand">
          <CloudLogo size={24} />
          <span className="auth-card__brand-name">G-Drive-Clone</span>
        </div>

        {/* Heading */}
        <h2 className="auth-card__title">Create Account</h2>
        <p className="auth-card__subtitle">
          Let's get started! Fill in the details below to create your account.
        </p>

        {/* Form */}
        <form method="post" onSubmit={handleRegister} noValidate>
          <FormInput
            label="Full Name"
            type="text"
            name="fullName"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            icon={<UserIcon />}
            required
            autoComplete="name"
          />

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
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<LockIcon />}
            required
            autoComplete="new-password"
          />

          <FormInput
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={<LockIcon />}
            required
            autoComplete="new-password"
          />

          {/* Terms checkbox */}
          <div className="form-terms">
            <input
              type="checkbox"
              id="terms-checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
            />
            <label htmlFor="terms-checkbox" className="form-terms__text">
              I agree to the <a href="#terms">Terms of Service</a> and{' '}
              <a href="#privacy">Privacy Policy</a>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="auth-btn"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <span className="auth-btn__spinner" aria-label="Creating account…" />
            ) : (
              <>
                Create Account
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
          <span>or sign up with</span>
        </div>

        {/* Social */}
        <div className="social-buttons">
          <SocialButton provider="google" />
          <SocialButton provider="microsoft" />
          <SocialButton provider="github" />
        </div>

        {/* Switch */}
        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  );
}