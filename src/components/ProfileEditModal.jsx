import { useState, useRef } from 'react';
import { FiX, FiUser, FiMail, FiPhone, FiSave, FiCamera } from 'react-icons/fi';
import client from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProfileEditModal({ onClose }) {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    phoneNumber: user.phoneNumber || '',
  });
  const [avatarPreview, setAvatarPreview] = useState(user.avatar || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileRef = useRef(null);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
    setSuccess('');
  };

  const handleAvatarPick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.');
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      let newAvatar = user.avatar || '';

      if (avatarFile) {
        setAvatarUploading(true);
        const fd = new FormData();
        fd.append('avatar', avatarFile);
        try {
          const avatarRes = await client.post('/auth/avatar', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          newAvatar = avatarRes.data.avatar;
        } catch {
          setError('Profile picture upload failed — profile info was still saved.');
        }
        setAvatarUploading(false);
      }

      const res = await client.put('/auth/profile', form);
      updateUser({ ...user, ...res.data, avatar: newAvatar });
      setSuccess('Profile updated!');
      setTimeout(() => onClose(), 1100);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
      setAvatarUploading(false);
    }
  };

  const initials = (user.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 600,
        background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
    >
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        width: '100%', maxWidth: 440,
        boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.15rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-elevated)',
        }}>
          <div>
            <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.1rem' }}>Edit Profile</h3>
            <p style={{ fontSize: '0.77rem', color: 'var(--text-muted)' }}>Update your photo, name, email or number</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '0.45rem',
              cursor: 'pointer', color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <FiX size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {/* Avatar picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem', marginBottom: '0.25rem' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: avatarPreview ? 'transparent' : 'var(--accent-dim)',
                border: '2.5px solid var(--border-accent)',
                overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem', fontWeight: 900, color: 'var(--accent)',
              }}>
                {avatarPreview
                  ? <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : initials
                }
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                style={{
                  position: 'absolute', bottom: -2, right: -2,
                  width: 26, height: 26, borderRadius: '50%',
                  background: 'var(--accent)', border: '2px solid var(--bg-card)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
              >
                <FiCamera size={13} color="#000" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarPick}
                style={{ display: 'none' }}
              />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.88rem' }}>Profile picture</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: 1.5 }}>
                Click the camera icon to upload.<br />Max 5MB · JPG, PNG, WEBP
              </p>
              {avatarFile && (
                <p style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 600, marginTop: '0.3rem' }}>
                  {avatarUploading ? 'Uploading…' : '✓ New photo selected'}
                </p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <div style={{ position: 'relative' }}>
              <FiUser style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} size={14} />
              <input type="text" name="name" value={form.name} onChange={handleChange} className="form-input" placeholder="Your full name" style={{ paddingLeft: '2.4rem' }} required />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <FiMail style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} size={14} />
              <input type="email" name="email" value={form.email} onChange={handleChange} className="form-input" placeholder="you@example.com" style={{ paddingLeft: '2.4rem' }} required />
            </div>
          </div>

          <div className="form-group">
            <label>WhatsApp Number</label>
            <div style={{ position: 'relative' }}>
              <FiPhone style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} size={14} />
              <input type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className="form-input" placeholder="+2348012345678" style={{ paddingLeft: '2.4rem' }} />
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 'var(--radius)', padding: '0.7rem 1rem', fontSize: '0.82rem', color: 'var(--danger)', fontWeight: 500 }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.3)', borderRadius: 'var(--radius)', padding: '0.7rem 1rem', fontSize: '0.82rem', color: 'var(--success)', fontWeight: 600 }}>
              {success}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.65rem', paddingTop: '0.1rem' }}>
            <button type="button" onClick={onClose} disabled={loading} className="btn-ghost" style={{ flex: 1, padding: '0.75rem', fontSize: '0.875rem' }}>
              Cancel
            </button>
            <button
              type="submit" disabled={loading} className="btn-primary"
              style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', padding: '0.75rem', fontSize: '0.875rem' }}
            >
              <FiSave size={15} />
              {loading ? (avatarUploading ? 'Uploading photo…' : 'Saving…') : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
