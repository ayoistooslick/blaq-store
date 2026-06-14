import { useAuth } from '../context/AuthContext.jsx';
import { FiShield, FiStar, FiUser } from 'react-icons/fi';
import BuyerDashboard from '../components/BuyerDashboard.jsx';
import SellerDashboard from '../components/SellerDashboard.jsx';
import AdminDashboard from '../components/AdminDashboard.jsx';

const ROLE_CONFIG = {
  super_admin: {
    label: 'Super Admin',
    icon: <FiShield size={14} />,
    cls: 'badge-yellow',
    desc: 'Full platform control — review and approve sellers.',
  },
  seller: {
    label: 'Seller',
    icon: <FiStar size={14} />,
    cls: 'badge-green',
    desc: 'List your accounts and manage your active inventory.',
  },
  buyer: {
    label: 'Buyer',
    icon: <FiUser size={14} />,
    cls: 'badge-gray',
    desc: 'Browse listings and apply to become a seller.',
  },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role || 'buyer';
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.buyer;

  return (
    <div className="page-container">
      <div style={{
        marginBottom: '2rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: '1.6rem', letterSpacing: '-0.03em', marginBottom: '0.35rem' }}>
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {config.desc}
          </p>
        </div>
        <span className={`badge ${config.cls}`} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', padding: '0.3rem 0.8rem' }}>
          {config.icon} {config.label}
        </span>
      </div>

      {role === 'super_admin' && <AdminDashboard />}
      {role === 'seller' && <SellerDashboard />}
      {role === 'buyer' && <BuyerDashboard />}
    </div>
  );
}
