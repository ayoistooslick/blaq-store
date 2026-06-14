import { useState } from 'react';
import { FiMessageCircle, FiTag, FiEdit2, FiTrash2, FiCheckCircle, FiMaximize2 } from 'react-icons/fi';
import { BsController } from 'react-icons/bs';
import ImageLightbox from './ImageLightbox.jsx';

const GAME_COLORS = {
  'Free Fire': '#ff6b35',
  'CODM': '#4fc3f7',
  'Other': '#a78bfa',
};

export default function AccountCard({ listing, sellerMode = false, onMarkSold, onEdit, onDelete }) {
  const { gameType, title, description, price, images, seller, status } = listing;
  const isSold = status === 'sold';
  const accentColor = GAME_COLORS[gameType] || 'var(--accent)';
  const [imgError, setImgError] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [imgHover, setImgHover] = useState(false);

  const hasImages = images && images.length > 0 && !imgError;

  const handleContact = () => {
    if (!seller?.phoneNumber) return;
    const phone = seller.phoneNumber.replace(/\D/g, '');
    const text = encodeURIComponent(
      `Hello! I'm interested in your ${gameType} account listed on Blaq Store — "${title}" for ₦${Number(price).toLocaleString()}. Is it still available?`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const openLightbox = (e) => {
    e.stopPropagation();
    if (!hasImages) return;
    setLightboxIndex(0);
    setLightboxOpen(true);
  };

  return (
    <>
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--border-accent)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.35)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {isSold && (
          <div className="sold-overlay">
            <span className="sold-tag">SOLD</span>
          </div>
        )}

        <div
          style={{
            height: 180,
            background: 'var(--bg-elevated)',
            position: 'relative',
            overflow: 'hidden',
            flexShrink: 0,
            cursor: hasImages ? 'zoom-in' : 'default',
          }}
          onMouseEnter={() => setImgHover(true)}
          onMouseLeave={() => setImgHover(false)}
          onClick={openLightbox}
        >
          {hasImages ? (
            <>
              <img
                src={images[0]}
                alt={title}
                onError={() => setImgError(true)}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  transition: 'transform 0.35s ease',
                  transform: imgHover ? 'scale(1.04)' : 'scale(1)',
                }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0)',
                transition: 'background 0.25s',
                ...(imgHover ? { background: 'rgba(0,0,0,0.28)' } : {}),
              }} />
              {imgHover && (
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  pointerEvents: 'none',
                }}>
                  <div style={{
                    background: 'rgba(0,0,0,0.65)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 10,
                    padding: '0.5rem 0.85rem',
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    color: '#fff', fontSize: '0.78rem', fontWeight: 600,
                  }}>
                    <FiMaximize2 size={13} />
                    View full image
                  </div>
                </div>
              )}
              {images.length > 1 && (
                <div style={{
                  position: 'absolute', bottom: 8, right: 8,
                  background: 'rgba(0,0,0,0.65)',
                  borderRadius: 999,
                  padding: '0.15rem 0.5rem',
                  fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)',
                  letterSpacing: '0.04em',
                }}>
                  1 / {images.length}
                </div>
              )}
            </>
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '0.5rem', color: 'var(--text-muted)',
            }}>
              <BsController size={36} />
              <span style={{ fontSize: '0.75rem' }}>No image</span>
            </div>
          )}

          <div style={{
            position: 'absolute', top: 10, left: 10,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(6px)',
            border: `1px solid ${accentColor}44`,
            color: accentColor,
            padding: '0.2rem 0.6rem',
            borderRadius: 999,
            fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em',
          }}>
            {gameType}
          </div>

          {sellerMode && (
            <div style={{
              position: 'absolute', top: 10, right: 10,
              display: 'flex', gap: '0.3rem',
            }}
            onClick={e => e.stopPropagation()}>
              <button
                onClick={() => onEdit && onEdit(listing)}
                title="Edit listing"
                style={{
                  background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
                  border: '1px solid var(--border)', borderRadius: 8,
                  color: 'var(--accent)', padding: '0.35rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,197,24,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.75)'}
              >
                <FiEdit2 size={13} />
              </button>
              <button
                onClick={() => onDelete && onDelete(listing._id)}
                title="Delete listing"
                style={{
                  background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
                  border: '1px solid var(--border)', borderRadius: 8,
                  color: 'var(--danger)', padding: '0.35rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(231,76,60,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.75)'}
              >
                <FiTrash2 size={13} />
              </button>
            </div>
          )}
        </div>

        <div style={{ padding: '1rem 1.1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.97rem', lineHeight: 1.3, color: 'var(--text-primary)' }}>
            {title}
          </h3>
          <p style={{
            fontSize: '0.82rem', color: 'var(--text-secondary)',
            lineHeight: 1.55, flex: 1,
            display: '-webkit-box', WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {description}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.15rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FiTag size={13} color="var(--accent)" />
              <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--accent)' }}>
                ₦{Number(price).toLocaleString()}
              </span>
            </div>
            {isSold && <span className="badge badge-red" style={{ fontSize: '0.65rem' }}>Sold</span>}
          </div>

          {seller && !sellerMode && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <FiMessageCircle size={11} />
              Seller: {seller.name}
            </div>
          )}

          <div style={{ marginTop: '0.4rem' }}>
            {sellerMode ? (
              !isSold ? (
                <button
                  onClick={() => onMarkSold && onMarkSold(listing._id)}
                  className="btn-outline"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                >
                  <FiCheckCircle size={14} />
                  Mark as Sold
                </button>
              ) : (
                <div style={{
                  textAlign: 'center', padding: '0.6rem',
                  fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em',
                  color: 'var(--text-muted)', background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius)',
                }}>
                  SOLD — No longer active
                </div>
              )
            ) : (
              <button
                onClick={handleContact}
                disabled={isSold}
                className="btn-primary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                <FiMessageCircle size={15} />
                {isSold ? 'No longer available' : 'Contact Now'}
              </button>
            )}
          </div>
        </div>
      </div>

      {lightboxOpen && hasImages && (
        <ImageLightbox
          images={images}
          currentIndex={lightboxIndex}
          onChangeIndex={setLightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
