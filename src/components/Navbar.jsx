import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { FiShoppingBag, FiUser, FiLogOut, FiLogIn, FiMenu, FiX, FiChevronDown } from 'react-icons/fi';
import { RiStore2Fill, RiDashboardLine } from 'react-icons/ri';

function UserAvatar({ user, size = 28 }) {
  const initials = (user.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        style={{
          width: size, height: size, borderRadius: '50%', objectFit: 'cover',
          border: '1.5px solid var(--border-accent)',
        }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--accent-dim)',
      border: '1.5px solid var(--border-accent)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 800, color: 'var(--accent)',
    }}>
      {initials}
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef(null);
  const profileRef = useRef(null);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setProfileOpen(false);
    navigate('/auth');
  };
  const close = () => setMenuOpen(false);
  useEffect(() => { close(); setProfileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) close();
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const isActive = (p) => location.pathname === p;
  const roleLabel = user?.role === 'super_admin' ? 'Admin' : user?.role === 'seller' ? 'Seller' : 'Buyer';
  const roleBadgeColor = user?.role === 'super_admin' ? 'var(--accent)' : user?.role === 'seller' ? 'var(--success)' : 'var(--text-muted)';

  return (
    <header style={{
      background: 'rgba(17,17,17,0.96)',
      backdropFilter: 'blur(14px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 200,
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem',
        height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to={user ? '/' : '/auth'} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RiStore2Fill size={18} color="#000" />
          </div>
          <span style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.03em' }}>
            BLAQ<span style={{ color: 'var(--accent)' }}>STORE</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {user && (
            <>
              <Link to="/" style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.5rem 0.9rem', borderRadius: 'var(--radius)',
                fontSize: '0.875rem', fontWeight: 600,
                color: isActive('/') ? 'var(--accent)' : 'var(--text-secondary)',
                background: isActive('/') ? 'var(--accent-dim)' : 'transparent',
                border: isActive('/') ? '1px solid var(--border-accent)' : '1px solid transparent',
                transition: 'all 0.2s',
              }}>
                <FiShoppingBag size={15} /> Market
              </Link>

              <div ref={profileRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setProfileOpen(o => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.4rem 0.75rem 0.4rem 0.45rem',
                    borderRadius: 'var(--radius)',
                    background: profileOpen || isActive('/dashboard') ? 'var(--accent-dim)' : 'transparent',
                    border: profileOpen || isActive('/dashboard') ? '1px solid var(--border-accent)' : '1px solid transparent',
                    color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s',
                    fontSize: '0.875rem', fontWeight: 600,
                  }}
                >
                  <UserAvatar user={user} size={28} />
                  <span style={{ maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name?.split(' ')[0] || 'Account'}
                  </span>
                  <FiChevronDown size={13} style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: profileOpen ? 'rotate(180deg)' : 'none' }} />
                </button>

                {profileOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)', padding: '0.5rem',
                    minWidth: 210, boxShadow: '0 8px 32px rgba(0,0,0,0.55)', zIndex: 300,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', marginBottom: '0.25rem' }}>
                      <UserAvatar user={user} size={38} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{user.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.05rem', wordBreak: 'break-all' }}>{user.email}</div>
                        <span style={{
                          display: 'inline-block', marginTop: '0.35rem',
                          fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase',
                          letterSpacing: '0.07em', color: roleBadgeColor,
                          background: `${roleBadgeColor}1a`, padding: '0.1rem 0.45rem', borderRadius: 99,
                        }}>
                          {roleLabel}
                        </span>
                      </div>
                    </div>
                    <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.3rem 0' }} />
                    <Link
                      to="/dashboard"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0.85rem', borderRadius: 8, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <RiDashboardLine size={15} color="var(--text-muted)" /> Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        padding: '0.65rem 0.85rem', borderRadius: 8,
                        fontSize: '0.875rem', fontWeight: 600,
                        color: 'var(--danger)', background: 'transparent', border: 'none',
                        cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(231,76,60,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <FiLogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {!user && (
            <Link to="/auth" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.25rem' }}>
              <FiLogIn size={15} /> Sign In
            </Link>
          )}
        </nav>

        {/* Hamburger */}
        <button
          className="hamburger-btn"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
          style={{
            display: 'none', background: 'var(--bg-elevated)',
            border: '1px solid var(--border)', color: 'var(--text-primary)',
            padding: '0.5rem', cursor: 'pointer', borderRadius: 'var(--radius)',
          }}
        >
          {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          style={{
            position: 'absolute', top: 64, left: 0, right: 0,
            background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)',
            padding: '0.85rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column',
            gap: '0.35rem', boxShadow: '0 12px 40px rgba(0,0,0,0.6)', zIndex: 200,
          }}
        >
          {user && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.85rem 0.9rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', marginBottom: '0.5rem' }}>
                <UserAvatar user={user} size={44} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user.name}</div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '0.05rem' }}>{user.email}</div>
                  <span style={{
                    display: 'inline-block', marginTop: '0.35rem',
                    fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase',
                    letterSpacing: '0.07em', color: roleBadgeColor,
                    background: `${roleBadgeColor}1a`, padding: '0.1rem 0.45rem', borderRadius: 99,
                  }}>
                    {roleLabel}
                  </span>
                </div>
              </div>
              <Link to="/" onClick={close} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.85rem 1rem', borderRadius: 'var(--radius)', fontSize: '0.95rem', fontWeight: 600, color: isActive('/') ? 'var(--accent)' : 'var(--text-primary)', background: isActive('/') ? 'var(--accent-dim)' : 'transparent' }}>
                <FiShoppingBag size={17} /> Market
              </Link>
              <Link to="/dashboard" onClick={close} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.85rem 1rem', borderRadius: 'var(--radius)', fontSize: '0.95rem', fontWeight: 600, color: isActive('/dashboard') ? 'var(--accent)' : 'var(--text-primary)', background: isActive('/dashboard') ? 'var(--accent-dim)' : 'transparent' }}>
                <RiDashboardLine size={17} /> Dashboard
              </Link>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.35rem 0' }} />
              <button
                onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.85rem 1rem', borderRadius: 'var(--radius)', fontSize: '0.95rem', fontWeight: 600, background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', width: '100%', textAlign: 'left' }}
              >
                <FiLogOut size={17} /> Sign Out
              </button>
            </>
          )}
          {!user && (
            <Link to="/auth" onClick={close} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.9rem', borderRadius: 'var(--radius)', background: 'var(--accent)', color: '#000', fontWeight: 700, fontSize: '0.95rem' }}>
              <FiLogIn size={17} /> Sign In
            </Link>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
