import { useState, useEffect } from 'react';
import { FiZap, FiSearch } from 'react-icons/fi';
import { BsController } from 'react-icons/bs';
import client from '../api/client.js';
import AccountCard from '../components/AccountCard.jsx';

const FILTERS = ['All', 'Free Fire', 'CODM', 'Other'];

export default function MarketplacePage() {
  const [listings, setListings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await client.get('/market/catalog');
        setListings(res.data);
        setFiltered(res.data);
      } catch {
        setError('Unable to load listings. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  useEffect(() => {
    let result = listings;
    if (activeFilter !== 'All') {
      result = result.filter(l => l.gameType === activeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.gameType.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [activeFilter, search, listings]);

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <FiZap color="var(--accent)" size={20} />
          <h1 style={{ fontWeight: 900, fontSize: '1.7rem', letterSpacing: '-0.03em' }}>
            Gaming Account Marketplace
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Browse premium verified gaming accounts. Contact sellers directly via WhatsApp.
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: 999,
                fontSize: '0.82rem',
                fontWeight: 600,
                border: activeFilter === f ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
                background: activeFilter === f ? 'var(--accent-dim)' : 'transparent',
                color: activeFilter === f ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: 220 }}>
          <FiSearch style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={15} />
          <input
            type="text"
            placeholder="Search listings..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.4rem', paddingTop: '0.55rem', paddingBottom: '0.55rem' }}
          />
        </div>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : error ? (
        <div className="empty-state">
          <p style={{ color: 'var(--danger)' }}>{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <BsController size={48} style={{ margin: '0 auto 0.85rem' }} />
          <p style={{ fontWeight: 700, fontSize: '1rem' }}>
            {listings.length === 0 ? 'No listings yet' : 'No results found'}
          </p>
          <p style={{ fontSize: '0.83rem', marginTop: '0.35rem' }}>
            {listings.length === 0
              ? 'Be the first to list a gaming account on Blaq Store.'
              : 'Try a different filter or search term.'}
          </p>
        </div>
      ) : (
        <>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.1rem' }}>
            {filtered.length} listing{filtered.length !== 1 ? 's' : ''} found
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
            gap: '1.25rem',
          }}>
            {filtered.map(listing => (
              <AccountCard key={listing._id} listing={listing} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
