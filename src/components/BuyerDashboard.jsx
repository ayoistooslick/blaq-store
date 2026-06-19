import { useState } from 'react';
import { FiUser, FiPhone, FiMail, FiArrowUpRight, FiClock, FiCheckCircle, FiXCircle, FiEdit2 } from 'react-icons/fi';
import { RiVipCrownLine } from 'react-icons/ri';
import client from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import ProfileEditModal from './ProfileEditModal.jsx';
import Twemoji from './Twemoji.jsx';

const STATUS_CONFIG = {
  none: { label: 'Not Applied', icon: <FiArrowUpRight />, cls: 'badge-gray' },
  pending: { label: 'Pending Review', icon: <FiClock />, cls: 'badge-yellow' },
  approved: { label: 'Approved', icon: <FiCheckCircle />, cls: 'badge-green' },
  rejected: { label: 'Rejected', icon: <FiXCircle />, cls: 'badge-red' },
};

export default function BuyerDashboard() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [editOpen, setEditOpen] = useState(false);

  const status = user.sellerRequestStatus || 'none';
  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.none;

  const handleBecomeSeller = async () => {
    setLoading(true);
    setError('');
    setMsg('');
    try {
      const res = await client.post('/auth/become-seller');
      setMsg(res.data.message || 'Application submitted!');
      updateUser({ ...user, sellerRequestStatus: 'pending' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 600 }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.1rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-elevated)',
        }}>
          <h3 style={{ fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiUser color="var(--accent)" size={16} />
            My Profile
          </h3>
          <button
            onClick={() => setEditOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.45rem 0.9rem',
              background: 'var(--accent-dim)',
              border: '1px solid var(--border-accent)',
              borderRadius: 'var(--radius)',
              color: 'var(--accent)',
              fontSize: '0.8rem', fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,197,24,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-dim)'}
          >
            <FiEdit2 size={13} />
            Edit
          </button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Avatar row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-accent)', flexShrink: 0 }} />
            ) : (
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'var(--accent-dim)', border: '2px solid var(--border-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', fontWeight: 900, color: 'var(--accent)', flexShrink: 0,
              }}>
                {(user.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.97rem' }}><Twemoji text={user.name} /></div>
              <div style={{ fontSize: '0.77rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{user.email}</div>
              <button onClick={() => setEditOpen(true)} style={{ marginTop: '0.35rem', background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.73rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                Change photo →
              </button>
            </div>
          </div>
          <ProfileRow icon={<FiUser size={15} />} label="Full Name" value={user.name} />
          <ProfileRow icon={<FiMail size={15} />} label="Email Address" value={user.email} />
          <ProfileRow icon={<FiPhone size={15} />} label="WhatsApp Number" value={user.phoneNumber} />
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.45rem' }}>
              Account Role
            </div>
            <span className="badge badge-gray" style={{ textTransform: 'capitalize', fontSize: '0.8rem' }}>
              {user.role}
            </span>
          </div>
        </div>
      </div>

      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-accent)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.1rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(245,197,24,0.04)',
          flexWrap: 'wrap', gap: '0.75rem',
        }}>
          <h3 style={{ fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RiVipCrownLine color="var(--accent)" size={16} />
            Become a Seller
          </h3>
          <span className={`badge ${statusCfg.cls}`} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' }}>
            {statusCfg.icon} {statusCfg.label}
          </span>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.7 }}>
            Apply to list your gaming accounts on Blaq Store and reach buyers directly via WhatsApp.
          </p>

          {status === 'none' && (
            <>
              <div style={{
                background: 'var(--bg-elevated)', borderRadius: 'var(--radius)',
                padding: '0.75rem 1rem', marginBottom: '1.1rem',
                fontSize: '0.83rem', color: 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <FiPhone size={13} color="var(--accent)" />
                WhatsApp on file:&nbsp;
                <strong style={{ color: user.phoneNumber ? 'var(--text-primary)' : 'var(--danger)' }}>
                  {user.phoneNumber || 'None set — please edit your profile first'}
                </strong>
              </div>
              <button
                onClick={handleBecomeSeller}
                disabled={loading || !user.phoneNumber}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 1.25rem' }}
              >
                <FiArrowUpRight size={15} />
                {loading ? 'Submitting...' : 'Submit Seller Application'}
              </button>
            </>
          )}
          {status === 'pending' && (
            <p style={{ fontSize: '0.875rem', color: 'var(--accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiClock size={15} /> Your application is under review. You'll be upgraded once approved.
            </p>
          )}
          {status === 'rejected' && (
            <p style={{ fontSize: '0.875rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiXCircle size={15} /> Your application was rejected. Contact the admin for more info.
            </p>
          )}

          {error && <p className="error-msg" style={{ marginTop: '0.75rem' }}>{error}</p>}
          {msg && <p style={{ color: 'var(--success)', fontSize: '0.875rem', fontWeight: 600, marginTop: '0.75rem' }}>{msg}</p>}
        </div>
      </div>

      {editOpen && <ProfileEditModal onClose={() => setEditOpen(false)} />}
    </div>
  );
}

function ProfileRow({ icon, label, value }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.9rem',
      padding: '0.65rem 0.85rem',
      background: 'var(--bg-elevated)',
      borderRadius: 'var(--radius)',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-muted)', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontSize: '0.9rem', color: value ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 500, marginTop: '0.1rem' }}>
          {value || '—'}
        </div>
      </div>
    </div>
  );
}
