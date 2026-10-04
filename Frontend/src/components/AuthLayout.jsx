import { Link } from 'react-router-dom';
import CloudLogo from './CloudLogo';

/**
 * AuthLayout — Shared split-screen layout for Login & Register pages.
 *
 * @param {object} props
 * @param {string} props.badge        — small pill text above the headline
 * @param {string} props.headline     — main headline (can include JSX)
 * @param {string} props.subtext      — paragraph below headline
 * @param {Array}  props.features     — [{icon, title, description}]
 * @param {React.ReactNode} props.children — the form card
 */
export default function AuthLayout({ badge, headline, subtext, features, children }) {
  return (
    <div className="auth-page">
      {/* ── Top Navigation ── */}
      <nav className="auth-nav" aria-label="Main navigation">
        <Link to="/login" className="auth-nav__brand" aria-label="G-Drive-Clone home">
          <CloudLogo size={28} />
          <span className="auth-nav__name">G-Drive-Clone</span>
        </Link>
        <div className="auth-nav__links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#help">Help</a>
        </div>
      </nav>

      {/* ── Split Content ── */}
      <main className="auth-split">
        {/* Left — Branding Panel */}
        <section className="auth-left" aria-label="Product information">
          <div className="auth-left__content">
            {/* Badge */}
            <div className="auth-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{badge}</span>
            </div>

            {/* Headline */}
            <h1 className="auth-headline">{headline}</h1>

            {/* Sub-text */}
            <p className="auth-subtext">{subtext}</p>

            {/* Cloud Illustration */}
            <div className="auth-cloud-visual" aria-hidden="true">
              <div className="auth-cloud-visual__cloud auth-cloud-visual__cloud--main">
                <CloudIllustration />
              </div>
              <div className="auth-cloud-visual__float auth-cloud-visual__float--folder" title="Folder">
                <FolderIcon />
              </div>
              <div className="auth-cloud-visual__float auth-cloud-visual__float--doc" title="Document">
                <DocIcon />
              </div>
              <div className="auth-cloud-visual__float auth-cloud-visual__float--image" title="Image">
                <ImageIcon />
              </div>
              <div className="auth-cloud-visual__float auth-cloud-visual__float--shield" title="Secure">
                <ShieldIcon />
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="auth-features">
              {features.map((f, i) => (
                <div className="auth-feature" key={i}>
                  <div className="auth-feature__icon" aria-hidden="true">{f.icon}</div>
                  <div>
                    <p className="auth-feature__title">{f.title}</p>
                    <p className="auth-feature__desc">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right — Form Panel */}
        <section className="auth-right" aria-label="Authentication form">
          {children}
        </section>
      </main>
    </div>
  );
}


/* ── Inline SVG Illustrations ── */

function CloudIllustration() {
  return (
    <svg viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="auth-cloud-svg" aria-hidden="true">
      <ellipse cx="120" cy="110" rx="110" ry="18" fill="rgba(59,130,246,0.06)" />
      <path d="M60 90a40 40 0 0 1 78-12 30 30 0 0 1 50 22H52a28 28 0 0 1 8-10Z" fill="url(#cg1)" />
      <path d="M80 95a28 28 0 0 1 54-8 22 22 0 0 1 36 16H74a20 20 0 0 1 6-8Z" fill="url(#cg2)" opacity=".7" />
      <defs>
        <linearGradient id="cg1" x1="60" y1="50" x2="188" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#93C5FD" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="cg2" x1="80" y1="65" x2="170" y2="103" gradientUnits="userSpaceOnUse">
          <stop stopColor="#BFDBFE" />
          <stop offset="1" stopColor="#60A5FA" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" fill="#fef3c7" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#dbeafe" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill="#d1fae5" />
      <circle cx="8.5" cy="8.5" r="1.5" fill="#10b981" />
      <polyline points="21 15 16 10 5 21" stroke="#10b981" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#e0e7ff" />
      <polyline points="9 12 11 14 15 10" stroke="#6366f1" strokeWidth="2" />
    </svg>
  );
}
