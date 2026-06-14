import { useState, useEffect } from 'react';
import { FiGrid, FiPlusSquare, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';
import { BsController } from 'react-icons/bs';
import client from '../api/client.js';
import AccountCard from './AccountCard.jsx';
import AddListingForm from './AddListingForm.jsx';
import EditListingModal from './EditListingModal.jsx';

const TABS = [
  { id: 'listings', label: 'My Listings', icon: <FiGrid /> },
  { id: 'add', label: 'Add Account', icon: <FiPlusSquare /> },
];

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState('listings');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editTarget, setEditTarget] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const available = listings.filter(l => l.status === 'available');
  const sold = listings.filter(l => l.status === 'sold');

  const fetchMyListings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await client.get('/market/my-listings');
      setListings(res.data);
    } catch (err) {
      setError('Failed to load your listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  const handleMarkSold = async (id) => {
    try {
      await client.put(`/market/listing/${id}/sold`);
      setListings(prev => prev.map(l => l._id === id ? { ...l, status: 'sold' } : l));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark as sold.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await client.delete(`/market/listing/${deleteConfirm}`);
      setListings(prev => prev.filter(l => l._id !== deleteConfirm));
      setDeleteConfirm(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete listing.');
    } finally {
      setDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    fetchMyListings();
  };

  return (
    <div>
      <div style={{
        display: 'flex', gap: '0.4rem', marginBottom: '1.75rem',
        background: 'var(--bg-card)', padding: '0.35rem',
        borderRadius: 'var(--radius)', border: '1px solid var(--border)',
        width: 'fit-content',
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.55rem 1.1rem', borderRadius: 8,
              fontSize: '0.875rem', fontWeight: 600, border: 'none',
              background: activeTab === tab.id ? 'var(--accent)' : 'transparent',
              color: activeTab === tab.id ? '#000' : 'var(--text-secondary)',
              transition: 'all 0.2s', cursor: 'pointer',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'listings' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span style={{ fontWeight: 700, color: 'var(--success)' }}>{available.length}</span> active
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{sold.length}</span> sold
              </span>
            </div>
            <button onClick={fetchMyListings} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}>
              <FiRefreshCw size={13} /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="spinner" />
          ) : error ? (
            <p className="error-msg">{error}</p>
          ) : listings.length === 0 ? (
            <div className="empty-state">
              <BsController size={40} style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ fontWeight: 600 }}>No listings yet</p>
              <p style={{ fontSize: '0.82rem', marginTop: '0.35rem' }}>Switch to "Add Account" to list your first account.</p>
            </div>
          ) : (
            <>
              {available.length > 0 && (
                <>
                  <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.85rem' }}>
                    Active Listings
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: sold.length > 0 ? '2rem' : 0 }}>
                    {available.map(listing => (
                      <AccountCard
                        key={listing._id}
                        listing={listing}
                        sellerMode={true}
                        onMarkSold={handleMarkSold}
                        onEdit={setEditTarget}
                        onDelete={setDeleteConfirm}
                      />
                    ))}
                  </div>
                </>
              )}

              {sold.length > 0 && (
                <>
                  <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.85rem' }}>
                    Sold
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
                    {sold.map(listing => (
                      <AccountCard
                        key={listing._id}
                        listing={listing}
                        sellerMode={true}
                        onEdit={setEditTarget}
                        onDelete={setDeleteConfirm}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'add' && (
        <AddListingForm onSuccess={() => {
          setActiveTab('listings');
          fetchMyListings();
        }} />
      )}

      {editTarget && (
        <EditListingModal
          listing={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {deleteConfirm && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 500,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          }}
          onClick={(e) => { if (e.target === e.currentTarget && !deleting) setDeleteConfirm(null); }}
        >
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '2rem',
            width: '100%', maxWidth: 400,
            boxShadow: '0 8px 48px rgba(0,0,0,0.6)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: 'rgba(231,76,60,0.12)', borderRadius: '50%', padding: '0.6rem', display: 'flex' }}>
                <FiAlertTriangle size={20} color="var(--danger)" />
              </div>
              <h3 style={{ fontWeight: 800, fontSize: '1rem' }}>Delete Listing</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              This will permanently remove the listing. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="btn-danger"
                style={{ background: 'var(--danger)', color: '#fff', border: 'none' }}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
