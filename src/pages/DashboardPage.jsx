import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { FiShield, FiStar, FiUser, FiEdit2 } from 'react-icons/fi';
import { RiStore2Fill } from 'react-icons/ri';
import BuyerDashboard from '../components/BuyerDashboard.jsx';
import SellerDashboard from '../components/SellerDashboard.jsx';
import AdminDashboard from '../components/AdminDashboard.jsx';
import ProfileEditModal from '../components/ProfileEditModal.jsx';
import Twemoji from '../components/Twemoji.jsx';

const ROLE_CONFIG = {
  super_admin: { label: 'Super Admin', icon: <FiShield size={13} />, cls: 'badge-yellow', desc: 'Full platform control — review sellers, manage users.' },
  seller:      { label: 'Seller',      icon: <FiStar size={13} />,   cls: 'badge-green',  desc: 'List your accounts and manage your active inventory.' },
  buyer:       { label: 'Buyer',       icon: <FiUser size={13} />,   cls: 'badge-gray',   desc: 'Browse listings and apply to become a seller.' },
};

function Avatar({ user, size = 52 }) {
  const initials = (user.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const role = user.role;
  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        style={{
          width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
          border: role === 'super_admin' ? '2.5px solid var(--accent)' : role === 'seller' ? '2.5px solid var(--success)' : '2px solid var(--border)',
        }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: role === 'super_admin' ? 'var(--accent-dim)' : role === 'seller' ? 'rgba(46,204,113,0.1)' : 'var(--bg-elevated)',
      border: role === 'super_admin' ? '2px solid var(--border-accent)' : '2px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      fontSize: size * 0.3, fontWeight: 900,
      color: role === 'super_admin' ? 'var(--accent)' : role === 'seller' ? 'var(--success)' : 'var(--text-muted)',
    }}>
      {role === 'super_admin' ? <RiStore2Fill size={size * 0.4} color="var(--accent)" /> : initials}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const role = user?.role || 'buyer';
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.buyer;

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', flex: 1 }}>
            <Avatar user={user} size={56} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontWeight: 900, fontSize: '1.45rem', letterSpacing: '-0.03em' }}>
                  <Twemoji text={`Welcome back, ${user?.name?.split(' ')[0]} 👋`} />
                </h1>
                <span className={`badge ${config.cls}`} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem' }}>
                  {config.icon} {config.label}
                </span>
              </div>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {user?.email}
                {user?.phoneNumber && <span style={{ color: 'var(--text-muted)' }}> · {user.phoneNumber}</span>}
              </p>
            </div>
          </div>

          <button
            onClick={() => setEditOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.45rem',
              padding: '0.6rem 1.1rem',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <FiEdit2 size={14} /> Edit Profile
          </button>
        </div>

        {(role === 'seller' || role === 'buyer') && (
          <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginTop: '1rem' }}>{config.desc}</p>
        )}
      </div>

      {role === 'super_admin' && <AdminDashboard />}
      {role === 'seller'      && <SellerDashboard />}
      {role === 'buyer'       && <BuyerDashboard />}

      {editOpen && <ProfileEditModal onClose={() => setEditOpen(false)} />}
    </div>
  );
}
