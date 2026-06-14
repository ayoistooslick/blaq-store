import { useState } from 'react';
import { FiUser, FiPhone, FiMail, FiArrowUpRight, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { RiVipCrownLine } from 'react-icons/ri';
import client from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

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
        padding: '1.75rem',
      }}>
        <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiUser color="var(--accent)" />
          Profile
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <ProfileRow icon={<FiUser />} label="Name" value={user.name} />
          <ProfileRow icon={<FiMail />} label="Email" value={user.email} />
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.85rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>Role</div>
            <span className={`badge ${status === 'approved' ? 'badge-green' : 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>
              {user.role}
            </span>
          </div>
        </div>
      </div>

      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-accent)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RiVipCrownLine color="var(--accent)" />
              Become a Seller
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: 360 }}>
              Apply to list your gaming accounts on Blaq Store and reach buyers directly via WhatsApp.
            </p>
          </div>
          <span className={`badge ${statusCfg.cls}`} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' }}>
            {statusCfg.icon} {statusCfg.label}
          </span>
        </div>

        <hr className="divider" />

        {status === 'none' && (
          <>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Your WhatsApp number on file: <strong style={{ color: 'var(--text-primary)' }}>{user.phoneNumber || 'N/A'}</strong>
            </p>
            <button
              onClick={handleBecomeSeller}
              disabled={loading}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <FiArrowUpRight />
              {loading ? 'Submitting...' : 'Submit Seller Application'}
            </button>
          </>
        )}
        {status === 'pending' && (
          <p style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>
            Your application is under review. You'll be upgraded once approved by the admin.
          </p>
        )}
        {status === 'rejected' && (
          <p style={{ fontSize: '0.85rem', color: 'var(--danger)' }}>
            Your application was rejected. Contact the admin for more info.
          </p>
        )}

        {error && <p className="error-msg" style={{ marginTop: '0.75rem' }}>{error}</p>}
        {msg && <p style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.75rem' }}>{msg}</p>}
      </div>
    </div>
  );
}

function ProfileRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ color: 'var(--text-muted)', display: 'flex' }}>{icon}</div>
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>{value || '—'}</div>
      </div>
    </div>
  );
}
