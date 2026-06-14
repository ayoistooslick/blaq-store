import { useState, useEffect } from 'react';
import { FiUser, FiPhone, FiCheckCircle, FiRefreshCw, FiShield } from 'react-icons/fi';
import { RiAdminLine } from 'react-icons/ri';
import client from '../api/client.js';

export default function AdminDashboard() {
  const [pendingSellers, setPendingSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approving, setApproving] = useState({});

  const fetchPending = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await client.get('/admin/pending-sellers');
      setPendingSellers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (id, action) => {
    setApproving(prev => ({ ...prev, [id]: action }));
    try {
      await client.put(`/admin/review-seller/${id}`, { action });
      setPendingSellers(prev => prev.filter(u => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} seller.`);
    } finally {
      setApproving(prev => ({ ...prev, [id]: null }));
    }
  };

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem',
      }}>
        <div>
          <h3 style={{ fontWeight: 800, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RiAdminLine color="var(--accent)" />
            Seller Approval Queue
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Review and approve pending seller applications.
          </p>
        </div>
        <button onClick={fetchPending} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}>
          <FiRefreshCw size={13} /> Refresh
        </button>
      </div>

      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-accent)',
        borderRadius: 'var(--radius-lg)',
        padding: '0.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
      }}>
        <FiShield color="var(--accent)" size={16} style={{ marginLeft: '0.75rem' }} />
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', padding: '0.6rem 0' }}>
          You are logged in as <strong style={{ color: 'var(--accent)' }}>Super Admin</strong>. Handle approvals with care.
        </span>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : error ? (
        <p className="error-msg">{error}</p>
      ) : pendingSellers.length === 0 ? (
        <div className="empty-state">
          <FiCheckCircle size={40} style={{ margin: '0 auto 0.75rem', color: 'var(--success)' }} />
          <p style={{ fontWeight: 600 }}>All clear!</p>
          <p style={{ fontSize: '0.82rem', marginTop: '0.35rem' }}>No pending seller applications right now.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pendingSellers.map(applicant => (
            <div key={applicant._id} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem 1.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'var(--accent-dim)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FiUser color="var(--accent)" size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{applicant.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{applicant.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <FiPhone size={12} />
                  {applicant.phoneNumber || 'No phone number'}
                </div>
                <span className="badge badge-yellow">Pending Review</span>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleAction(applicant._id, 'reject')}
                  disabled={!!approving[applicant._id]}
                  className="btn-danger"
                >
                  {approving[applicant._id] === 'reject' ? 'Rejecting...' : 'Reject'}
                </button>
                <button
                  onClick={() => handleAction(applicant._id, 'approve')}
                  disabled={!!approving[applicant._id]}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <FiCheckCircle size={14} />
                  {approving[applicant._id] === 'approve' ? 'Approving...' : 'Approve'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
