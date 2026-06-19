import { useState, useEffect } from 'react';
import {
  FiUser, FiPhone, FiCheckCircle, FiRefreshCw, FiShield,
  FiUsers, FiActivity, FiMail, FiCalendar, FiXCircle, FiUserMinus,
} from 'react-icons/fi';
import { RiAdminLine, RiUserStarLine } from 'react-icons/ri';
import { BsPersonBadge } from 'react-icons/bs';
import client from '../api/client.js';

const TABS = [
  { id: 'queue', label: 'Seller Queue', icon: <RiUserStarLine size={15} /> },
  { id: 'users', label: 'Registered Users', icon: <FiUsers size={15} /> },
];

function StatCard({ icon, label, value, accent }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${accent ? 'var(--border-accent)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    }}>
      <div style={{
        width: 44, height: 44,
        borderRadius: 12,
        background: accent ? 'var(--accent-dim)' : 'var(--bg-elevated)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: accent ? 'var(--accent)' : 'var(--text-secondary)',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1.65rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
          {value}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </div>
      </div>
    </div>
  );
}

function RoleBadge({ role }) {
  const map = {
    super_admin: { label: 'Super Admin', cls: 'badge-yellow' },
    seller: { label: 'Seller', cls: 'badge-green' },
    buyer: { label: 'Buyer', cls: 'badge-gray' },
  };
  const { label, cls } = map[role] || { label: role, cls: 'badge-gray' };
  return <span className={`badge ${cls}`}>{label}</span>;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('queue');
  const [pendingSellers, setPendingSellers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState('');
  const [approving, setApproving] = useState({});
  const [revoking, setRevoking] = useState({});
  const [revokeConfirm, setRevokeConfirm] = useState(null);
  const [usersFetched, setUsersFetched] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  const fetchPending = async () => {
    setLoadingQueue(true);
    setError('');
    try {
      const res = await client.get('/admin/pending-sellers');
      setPendingSellers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load requests.');
    } finally {
      setLoadingQueue(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setError('');
    try {
      const res = await client.get('/admin/users');
      setAllUsers(res.data.users);
      setUserCount(res.data.count);
      setUsersFetched(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users.');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  useEffect(() => {
    if (activeTab === 'users' && !usersFetched) {
      fetchUsers();
    }
  }, [activeTab]);

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

  const handleRevokeSeller = async (id) => {
    setRevoking(prev => ({ ...prev, [id]: true }));
    try {
      await client.put(`/admin/revoke-seller/${id}`);
      setAllUsers(prev => prev.map(u => u._id === id
        ? { ...u, role: 'buyer', sellerRequestStatus: 'rejected' }
        : u
      ));
      setRevokeConfirm(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to revoke seller.');
    } finally {
      setRevoking(prev => ({ ...prev, [id]: false }));
    }
  };

  const filteredUsers = allUsers.filter(u => {
    const q = userSearch.toLowerCase();
    return !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q);
  });

  const sellers = allUsers.filter(u => u.role === 'seller').length;
  const buyers = allUsers.filter(u => u.role === 'buyer').length;

  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, rgba(245,197,24,0.08) 0%, transparent 60%)',
        border: '1px solid var(--border-accent)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'var(--accent-dim)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FiShield color="var(--accent)" size={18} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RiAdminLine color="var(--accent)" size={15} />
            Super Admin Control Panel
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            Manage sellers and view all registered users.
          </p>
        </div>
      </div>

      {activeTab === 'users' && usersFetched && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '0.85rem',
          marginBottom: '1.75rem',
        }}>
          <StatCard icon={<FiUsers size={20} />} label="Total Users" value={userCount} accent />
          <StatCard icon={<BsPersonBadge size={20} />} label="Sellers" value={sellers} />
          <StatCard icon={<FiUser size={20} />} label="Buyers" value={buyers} />
          <StatCard icon={<FiActivity size={20} />} label="Pending" value={pendingSellers.length} />
        </div>
      )}

      <div style={{
        display: 'flex',
        gap: '0.35rem',
        marginBottom: '1.5rem',
        background: 'var(--bg-elevated)',
        padding: '0.3rem',
        borderRadius: 'var(--radius)',
        width: 'fit-content',
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.45rem',
              padding: '0.55rem 1.1rem',
              borderRadius: 8,
              fontSize: '0.855rem', fontWeight: 700,
              border: 'none', cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeTab === tab.id ? 'var(--accent)' : 'transparent',
              color: activeTab === tab.id ? '#000' : 'var(--text-secondary)',
            }}
          >
            {tab.icon}
            {tab.label}
            {tab.id === 'queue' && pendingSellers.length > 0 && (
              <span style={{
                background: activeTab === 'queue' ? 'rgba(0,0,0,0.2)' : 'var(--accent)',
                color: activeTab === 'queue' ? '#000' : '#000',
                fontSize: '0.7rem', fontWeight: 900,
                padding: '0 0.45rem', borderRadius: 99,
                lineHeight: '1.6',
              }}>{pendingSellers.length}</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'queue' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {loadingQueue ? 'Loading...' : `${pendingSellers.length} application${pendingSellers.length !== 1 ? 's' : ''} pending`}
            </p>
            <button onClick={fetchPending} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}>
              <FiRefreshCw size={13} /> Refresh
            </button>
          </div>

          {loadingQueue ? (
            <div className="spinner" />
          ) : error ? (
            <p className="error-msg">{error}</p>
          ) : pendingSellers.length === 0 ? (
            <div className="empty-state">
              <FiCheckCircle size={44} style={{ margin: '0 auto 0.85rem', color: 'var(--success)' }} />
              <p style={{ fontWeight: 700 }}>All clear!</p>
              <p style={{ fontSize: '0.82rem', marginTop: '0.35rem' }}>No pending seller applications right now.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {pendingSellers.map(applicant => (
                <div key={applicant._id} className="admin-applicant-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flex: 1 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: 'var(--accent-dim)',
                      border: '1.5px solid var(--border-accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <FiUser color="var(--accent)" size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{applicant.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <FiMail size={11} /> {applicant.email}
                      </div>
                      {applicant.phoneNumber && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <FiPhone size={11} /> {applicant.phoneNumber}
                        </div>
                      )}
                    </div>
                    <span className="badge badge-yellow" style={{ flexShrink: 0 }}>Pending</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap', marginTop: '0.85rem' }}>
                    <button
                      onClick={() => handleAction(applicant._id, 'reject')}
                      disabled={!!approving[applicant._id]}
                      className="btn-danger"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.6rem' }}
                    >
                      <FiXCircle size={14} />
                      {approving[applicant._id] === 'reject' ? 'Rejecting...' : 'Reject'}
                    </button>
                    <button
                      onClick={() => handleAction(applicant._id, 'approve')}
                      disabled={!!approving[applicant._id]}
                      className="btn-primary"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.6rem' }}
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
      )}

      {activeTab === 'users' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
              <FiUser style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={14} />
              <input
                type="text"
                placeholder="Search by name, email, role..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.3rem', paddingTop: '0.55rem', paddingBottom: '0.55rem', fontSize: '0.85rem' }}
              />
            </div>
            <button
              onClick={() => { setUsersFetched(false); fetchUsers(); }}
              className="btn-ghost"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
            >
              <FiRefreshCw size={13} /> Refresh
            </button>
          </div>

          {loadingUsers ? (
            <div className="spinner" />
          ) : error ? (
            <p className="error-msg">{error}</p>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">
              <FiUsers size={44} style={{ margin: '0 auto 0.85rem' }} />
              <p style={{ fontWeight: 700 }}>No users found</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {filteredUsers.map(u => (
                <div key={u._id} className="admin-user-row">
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: u.role === 'super_admin' ? 'var(--accent-dim)' : u.role === 'seller' ? 'rgba(46,204,113,0.1)' : 'var(--bg-elevated)',
                    border: u.role === 'super_admin' ? '1.5px solid var(--border-accent)' : '1.5px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <FiUser
                      size={16}
                      color={u.role === 'super_admin' ? 'var(--accent)' : u.role === 'seller' ? 'var(--success)' : 'var(--text-muted)'}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {u.name}
                      <RoleBadge role={u.role} />
                    </div>
                    <div style={{ fontSize: '0.77rem', color: 'var(--text-muted)', marginTop: '0.15rem', display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <FiMail size={11} /> {u.email}
                      </span>
                      {u.phoneNumber && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <FiPhone size={11} /> {u.phoneNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0, flexWrap: 'wrap' }}>
                    {u.createdAt && (
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <FiCalendar size={11} />
                        {new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    )}
                    {u.role === 'seller' && (
                      <button
                        onClick={() => setRevokeConfirm(u)}
                        disabled={revoking[u._id]}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.35rem',
                          padding: '0.38rem 0.75rem',
                          background: 'rgba(231,76,60,0.08)',
                          border: '1px solid rgba(231,76,60,0.3)',
                          borderRadius: 8,
                          color: 'var(--danger)',
                          fontSize: '0.75rem', fontWeight: 700,
                          cursor: 'pointer', transition: 'all 0.15s',
                          whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(231,76,60,0.18)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(231,76,60,0.08)'}
                      >
                        <FiUserMinus size={13} />
                        Revoke
                      </button>
                    )}
                    {u.sellerRequestStatus && u.sellerRequestStatus !== 'none' && (
                      <span className={`badge ${u.sellerRequestStatus === 'approved' ? 'badge-green' : u.sellerRequestStatus === 'pending' ? 'badge-yellow' : 'badge-red'}`}>
                        {u.sellerRequestStatus}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {revokeConfirm && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 600,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          }}
          onClick={(e) => { if (e.target === e.currentTarget && !revoking[revokeConfirm._id]) setRevokeConfirm(null); }}
        >
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid rgba(231,76,60,0.3)',
            borderRadius: 20,
            padding: '2rem',
            width: '100%', maxWidth: 400,
            boxShadow: '0 16px 60px rgba(0,0,0,0.7)',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'rgba(231,76,60,0.12)',
              border: '1px solid rgba(231,76,60,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1.25rem',
            }}>
              <FiUserMinus size={22} color="var(--danger)" />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.5rem' }}>Revoke Seller Access</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '0.6rem' }}>
              You're about to demote <strong style={{ color: 'var(--text-primary)' }}>{revokeConfirm.name}</strong> from Seller to Buyer.
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
              Their listings will remain but they will lose the ability to add new ones. This action can be reversed by re-approving a seller application.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setRevokeConfirm(null)}
                disabled={revoking[revokeConfirm._id]}
                className="btn-ghost"
                style={{ flex: 1, padding: '0.75rem' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleRevokeSeller(revokeConfirm._id)}
                disabled={revoking[revokeConfirm._id]}
                style={{
                  flex: 2, padding: '0.75rem',
                  background: 'var(--danger)', color: '#fff',
                  border: 'none', borderRadius: 'var(--radius)',
                  fontWeight: 700, fontSize: '0.875rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '0.45rem',
                  opacity: revoking[revokeConfirm._id] ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                <FiUserMinus size={15} />
                {revoking[revokeConfirm._id] ? 'Revoking...' : 'Yes, Revoke Seller'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-applicant-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1.15rem 1.25rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .admin-applicant-card:hover {
          border-color: var(--border-accent);
          box-shadow: 0 2px 16px rgba(245,197,24,0.06);
        }
        .admin-user-row {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 0.9rem 1.15rem;
          display: flex;
          align-items: center;
          gap: 0.9rem;
          flex-wrap: wrap;
          transition: border-color 0.2s;
        }
        .admin-user-row:hover {
          border-color: var(--border-accent);
        }
      `}</style>
    </div>
  );
}
