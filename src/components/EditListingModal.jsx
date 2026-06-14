import { FiX } from 'react-icons/fi';
import AddListingForm from './AddListingForm.jsx';

export default function EditListingModal({ listing, onClose, onSuccess }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: 560,
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 8px 48px rgba(0,0,0,0.6)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0,
          background: 'var(--bg-card)',
          zIndex: 1,
        }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.05rem' }}>Edit Listing</h3>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-elevated)', border: 'none', borderRadius: 8,
              color: 'var(--text-secondary)', padding: '0.4rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
          >
            <FiX size={18} />
          </button>
        </div>
        <div style={{ padding: '1.25rem 1.75rem 1.75rem' }}>
          <AddListingForm
            editMode={true}
            initialData={listing}
            onSuccess={() => { onSuccess(); onClose(); }}
          />
        </div>
      </div>
    </div>
  );
}
