import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiPhone, FiLogIn, FiUserPlus } from 'react-icons/fi';
import { RiStore2Fill } from 'react-icons/ri';
import client from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', phoneNumber: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to="/dashboard" replace />;

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
      navigate('/dashboard');
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
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(245,197,24,0.06) 0%, transparent 60%)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 440,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '2.25rem',
        boxShadow: 'var(--shadow)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <RiStore2Fill size={28} color="var(--accent)" />
            <span style={{ fontWeight: 900, fontSize: '1.3rem', letterSpacing: '-0.02em' }}>
              BLAQ<span style={{ color: 'var(--accent)' }}>STORE</span>
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {mode === 'login' ? 'Welcome back. Sign in to continue.' : 'Create your account to get started.'}
          </p>
        </div>

        <div style={{
          display: 'flex', gap: '0.35rem', marginBottom: '1.75rem',
          background: 'var(--bg-elevated)', padding: '0.3rem', borderRadius: 'var(--radius)',
        }}>
          {['login', 'register'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              style={{
                flex: 1, padding: '0.55rem', borderRadius: 8,
                fontSize: '0.875rem', fontWeight: 600, border: 'none',
                background: mode === m ? 'var(--accent)' : 'transparent',
                color: mode === m ? '#000' : 'var(--text-secondary)',
                transition: 'all 0.2s', cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {mode === 'register' && (
            <div className="form-group">
              <label>Full Name</label>
              <div style={{ position: 'relative' }}>
                <FiUser style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={15} />
                <input
                  type="text" name="name" value={form.name} onChange={handleChange}
                  className="form-input" placeholder="Your full name"
                  style={{ paddingLeft: '2.4rem' }} required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <FiMail style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={15} />
              <input
                type="email" name="email" value={form.email} onChange={handleChange}
                className="form-input" placeholder="you@example.com"
                style={{ paddingLeft: '2.4rem' }} required
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label>WhatsApp Number</label>
              <div style={{ position: 'relative' }}>
                <FiPhone style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={15} />
                <input
                  type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleChange}
                  className="form-input" placeholder="+2348012345678"
                  style={{ paddingLeft: '2.4rem' }} required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={15} />
              <input
                type="password" name="password" value={form.password} onChange={handleChange}
                className="form-input" placeholder="••••••••"
                style={{ paddingLeft: '2.4rem' }} required
              />
            </div>
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              marginTop: '0.5rem', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: '0.45rem',
              padding: '0.8rem',
            }}
          >
            {mode === 'login' ? <FiLogIn size={16} /> : <FiUserPlus size={16} />}
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
