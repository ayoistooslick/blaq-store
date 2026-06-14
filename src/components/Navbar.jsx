import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { FiShoppingBag, FiUser, FiLogOut, FiLogIn, FiMenu, FiX } from 'react-icons/fi';
import { RiStore2Fill } from 'react-icons/ri';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const close = () => setMenuOpen(false);

  useEffect(() => {
    close();
  }, [location.pathname]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) close();
    };
    if (menuOpen) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [menuOpen]);

  const navLinkStyle = (path) => ({
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.5rem 0.9rem', borderRadius: 'var(--radius)',
    fontSize: '0.875rem', fontWeight: 600,
    color: location.pathname === path ? 'var(--accent)' : 'var(--text-secondary)',
    background: location.pathname === path ? 'var(--accent-dim)' : 'transparent',
    transition: 'all 0.2s',
  });

  const mobileNavLinkStyle = (path) => ({
    display: 'flex', alignItems: 'center', gap: '0.65rem',
    padding: '0.85rem 1.1rem', borderRadius: 'var(--radius)',
    fontSize: '0.95rem', fontWeight: 600,
    color: location.pathname === path ? 'var(--accent)' : 'var(--text-primary)',
    background: location.pathname === path ? 'var(--accent-dim)' : 'transparent',
    width: '100%',
  });

  return (
    <header style={{
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 200,
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 1.5rem',
        height: 62,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <RiStore2Fill style={{ fontSize: '1.5rem', color: 'var(--accent)' }} />
          <span style={{ fontWeight: 900, fontSize: '1.15rem', letterSpacing: '-0.02em' }}>
            BLAQ<span style={{ color: 'var(--accent)' }}>STORE</span>
          </span>
        </Link>

        <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link to="/" style={navLinkStyle('/')}>
            <FiShoppingBag size={15} />
            Market
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" style={navLinkStyle('/dashboard')}>
                <FiUser size={15} />
                Dashboard
              </Link>
              <button onClick={handleLogout} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <FiLogOut size={15} />
                Logout
              </button>
            </>
          ) : (
            <Link to="/auth" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FiLogIn size={15} />
              Sign In
            </Link>
          )}
        </nav>

        <button
          className="hamburger-btn"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            padding: '0.5rem',
            cursor: 'pointer',
            borderRadius: 'var(--radius)',
          }}
        >
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            top: 62,
            left: 0,
            right: 0,
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border)',
            padding: '0.75rem 1.25rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            zIndex: 200,
          }}
        >
          <Link to="/" style={mobileNavLinkStyle('/')} onClick={close}>
            <FiShoppingBag size={17} />
            Market
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" style={mobileNavLinkStyle('/dashboard')} onClick={close}>
                <FiUser size={17} />
                Dashboard
              </Link>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.35rem 0' }} />
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.65rem',
                  padding: '0.85rem 1.1rem', borderRadius: 'var(--radius)',
                  fontSize: '0.95rem', fontWeight: 600,
                  background: 'transparent', border: 'none',
                  color: 'var(--danger)', cursor: 'pointer', width: '100%', textAlign: 'left',
                }}
              >
                <FiLogOut size={17} />
                Logout
              </button>
            </>
          ) : (
            <Link to="/auth" onClick={close} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              padding: '0.85rem', borderRadius: 'var(--radius)',
              background: 'var(--accent)', color: '#000', fontWeight: 700,
              fontSize: '0.95rem', marginTop: '0.25rem',
            }}>
              <FiLogIn size={17} />
              Sign In
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
