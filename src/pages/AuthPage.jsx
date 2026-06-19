import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiPhone, FiLogIn, FiUserPlus, FiArrowRight } from 'react-icons/fi';
import { RiStore2Fill, RiGamepadLine } from 'react-icons/ri';
import { BsShieldCheck, BsLightningFill } from 'react-icons/bs';
import client from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Twemoji from '../components/Twemoji.jsx';

const PERKS = [
  { icon: <RiGamepadLine size={18} />, text: 'Premium gaming accounts' },
  { icon: <BsShieldCheck size={16} />, text: 'Verified sellers only' },
  { icon: <BsLightningFill size={15} />, text: 'Instant WhatsApp contact' },
];

export default function AuthPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', phoneNumber: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to="/" replace />;

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password, phoneNumber: form.phoneNumber };

      const res = await client.post(endpoint, payload);
      login(res.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 62px)',
      display: 'flex',
      background: 'var(--bg-primary)',
    }}>
      <div className="auth-left-panel">
        <div style={{ maxWidth: 380 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2.5rem' }}>
            <div style={{
              width: 46, height: 46, borderRadius: 12,
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <RiStore2Fill size={24} color="#000" />
            </div>
            <span style={{ fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-0.03em' }}>
              BLAQ<span style={{ color: 'var(--accent)' }}>STORE</span>
            </span>
          </div>

          <h2 style={{
            fontWeight: 900, fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
            lineHeight: 1.15, letterSpacing: '-0.04em',
            marginBottom: '1.25rem',
          }}>
            The #1 Gaming<br />
            Account <span style={{ color: 'var(--accent)' }}>Marketplace</span>
          </h2>

          <p style={{
            color: 'var(--text-secondary)', fontSize: '0.95rem',
            lineHeight: 1.7, marginBottom: '2.5rem',
          }}>
            Buy and sell premium gaming accounts from verified sellers. Secure, fast, and trusted.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {PERKS.map((p, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.85rem',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'var(--accent-dim)',
                  border: '1px solid var(--border-accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--accent)', flexShrink: 0,
                }}>
                  {p.icon}
                </div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {p.text}
                </span>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '3rem',
            padding: '1.25rem',
            background: 'rgba(245,197,24,0.06)',
            border: '1px solid var(--border-accent)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.7 }}>
              "Blaq Store made it super easy to sell my Free Fire account. Got a buyer within hours!"
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700, marginTop: '0.6rem' }}>
              — Verified Seller
            </p>
          </div>
        </div>
      </div>

      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem 1.5rem',
        background: 'radial-gradient(ellipse at 70% 30%, rgba(245,197,24,0.04) 0%, transparent 60%)',
      }}>
        <div className="auth-card">
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontWeight: 800, fontSize: '1.35rem',
              letterSpacing: '-0.03em', marginBottom: '0.35rem',
            }}>
              <Twemoji text={mode === 'login' ? 'Welcome back 👋' : 'Join Blaq Store 🎮'} />
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {mode === 'login'
                ? 'Sign in to browse the marketplace.'
                : 'Create your free account in seconds.'}
            </p>
          </div>

          <div className="auth-tab-switcher">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`auth-tab ${mode === m ? 'auth-tab-active' : ''}`}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {mode === 'register' && (
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-wrapper">
                  <FiUser className="input-icon" size={15} />
                  <input
                    type="text" name="name" value={form.name} onChange={handleChange}
                    className="form-input" placeholder="Your full name"
                    style={{ paddingLeft: '2.5rem' }} required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" size={15} />
                <input
                  type="email" name="email" value={form.email} onChange={handleChange}
                  className="form-input" placeholder="you@example.com"
                  style={{ paddingLeft: '2.5rem' }} required
                />
              </div>
            </div>

            {mode === 'register' && (
              <div className="form-group">
                <label>WhatsApp Number</label>
                <div className="input-wrapper">
                  <FiPhone className="input-icon" size={15} />
                  <input
                    type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleChange}
                    className="form-input" placeholder="+2348012345678"
                    style={{ paddingLeft: '2.5rem' }} required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" size={15} />
                <input
                  type="password" name="password" value={form.password} onChange={handleChange}
                  className="form-input" placeholder="••••••••"
                  style={{ paddingLeft: '2.5rem' }} required
                />
              </div>
            </div>

            {error && (
              <div className="auth-error">
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary auth-submit-btn"
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="btn-spinner" /> Please wait...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  {mode === 'login' ? <FiLogIn size={16} /> : <FiUserPlus size={16} />}
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <FiArrowRight size={15} />
                </span>
              )}
            </button>
          </form>

          <p style={{
            textAlign: 'center', fontSize: '0.8rem',
            color: 'var(--text-muted)', marginTop: '1.5rem',
          }}>
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--accent)', fontWeight: 700, fontSize: '0.8rem',
              }}
            >
              {mode === 'login' ? 'Register here' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>

      <style>{`
        .auth-left-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 4rem;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border);
          min-width: 420px;
          max-width: 460px;
        }
        .auth-card {
          width: 100%;
          max-width: 420px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 2.25rem 2rem;
          box-shadow: 0 8px 40px rgba(0,0,0,0.4);
        }
        .auth-tab-switcher {
          display: flex;
          gap: 0.3rem;
          margin-bottom: 1.75rem;
          background: var(--bg-elevated);
          padding: 0.3rem;
          border-radius: var(--radius);
        }
        .auth-tab {
          flex: 1;
          padding: 0.6rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 700;
          border: none;
          background: transparent;
          color: var(--text-muted);
          transition: all 0.2s;
          cursor: pointer;
          letter-spacing: 0.02em;
        }
        .auth-tab-active {
          background: var(--accent);
          color: #000;
          box-shadow: 0 2px 12px rgba(245,197,24,0.3);
        }
        .auth-submit-btn {
          width: 100%;
          padding: 0.9rem;
          font-size: 0.95rem;
          border-radius: var(--radius);
          margin-top: 0.25rem;
          letter-spacing: 0.02em;
        }
        .auth-error {
          background: rgba(231,76,60,0.1);
          border: 1px solid rgba(231,76,60,0.3);
          border-radius: var(--radius);
          padding: 0.7rem 1rem;
          font-size: 0.82rem;
          color: var(--danger);
          font-weight: 500;
        }
        .input-wrapper {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }
        .btn-spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(0,0,0,0.3);
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @media (max-width: 820px) {
          .auth-left-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}
