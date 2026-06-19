import { useState, useRef } from 'react';
import { FiMessageCircle, FiTag, FiEdit2, FiTrash2, FiCheckCircle, FiMaximize2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { BsController } from 'react-icons/bs';
import ImageLightbox from './ImageLightbox.jsx';
import Twemoji from './Twemoji.jsx';

const GAME_COLORS = {
  'Free Fire': '#ff6b35',
  'CODM': '#4fc3f7',
  'Other': '#a78bfa',
};

const DESC_LIMIT = 120;

function ExpandableDesc({ text }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  const isLong = text.length > DESC_LIMIT;
  const shown = expanded || !isLong ? text : text.slice(0, DESC_LIMIT).trimEnd() + '…';
  return (
    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>
      <Twemoji text={shown} />
      {isLong && (
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(v => !v); }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--accent)', fontWeight: 700, fontSize: '0.78rem',
            padding: '0 0 0 0.3rem', display: 'inline',
          }}
        >
          {expanded ? ' See less' : ' See more'}
        </button>
      )}
    </p>
  );
}

export default function AccountCard({ listing, sellerMode = false, onMarkSold, onEdit, onDelete }) {
  const { gameType, title, description, price, images, seller, status } = listing;
  const isSold = status === 'sold';
  const accentColor = GAME_COLORS[gameType] || 'var(--accent)';

  const [imgError, setImgError] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);
  const [imgHover, setImgHover] = useState(false);
  const touchStartX = useRef(null);

  const hasImages = images && images.length > 0 && !imgError;
  const total = hasImages ? images.length : 0;

  const goNext = (e) => {
    e.stopPropagation();
    setCurrentImg(i => (i + 1) % total);
  };
  const goPrev = (e) => {
    e.stopPropagation();
    setCurrentImg(i => (i - 1 + total) % total);
  };

  const handleContact = () => {
    if (!seller?.phoneNumber) return;
    const phone = seller.phoneNumber.replace(/\D/g, '');
    const text = encodeURIComponent(
      `Hello! I'm interested in your ${gameType} account listed on Blaq Store — "${title}" for ₦${Number(price).toLocaleString()}. Is it still available?`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const openLightbox = () => {
    if (!hasImages) return;
    setLightboxOpen(true);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || total <= 1) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      dx < 0
        ? setCurrentImg(i => (i + 1) % total)
        : setCurrentImg(i => (i - 1 + total) % total);
    }
    touchStartX.current = null;
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

        {/* Image section */}
        <div
          style={{
            height: 190,
            background: 'var(--bg-elevated)',
            position: 'relative',
            overflow: 'hidden',
            flexShrink: 0,
            cursor: hasImages ? 'zoom-in' : 'default',
            userSelect: 'none',
          }}
          onMouseEnter={() => setImgHover(true)}
          onMouseLeave={() => setImgHover(false)}
          onClick={openLightbox}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {hasImages ? (
            <>
              <img
                key={currentImg}
                src={images[currentImg]}
                alt={title}
                onError={() => setImgError(true)}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  transition: 'transform 0.35s ease, opacity 0.2s ease',
                  transform: imgHover ? 'scale(1.04)' : 'scale(1)',
                }}
              />

              {/* Dark overlay on hover */}
              <div style={{
                position: 'absolute', inset: 0,
                background: imgHover ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0)',
                transition: 'background 0.25s',
                pointerEvents: 'none',
              }} />

              {/* Expand hint on hover */}
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
                    padding: '0.45rem 0.8rem',
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    color: '#fff', fontSize: '0.75rem', fontWeight: 600,
                  }}>
                    <FiMaximize2 size={12} /> View full
                  </div>
                </div>
              )}

              {/* Prev / Next arrows for multi-image */}
              {total > 1 && imgHover && (
                <>
                  <button
                    onClick={goPrev}
                    style={{
                      position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                      zIndex: 3,
                      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '50%', width: 32, height: 32,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#fff',
                    }}
                  >
                    <FiChevronLeft size={16} />
                  </button>
                  <button
                    onClick={goNext}
                    style={{
                      position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                      zIndex: 3,
                      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '50%', width: 32, height: 32,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#fff',
                    }}
                  >
                    <FiChevronRight size={16} />
                  </button>
                </>
              )}

              {/* Dot indicators */}
              {total > 1 && (
                <div style={{
                  position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
                  display: 'flex', gap: '0.3rem', alignItems: 'center',
                  zIndex: 3,
                }}>
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setCurrentImg(i); }}
                      style={{
                        width: i === currentImg ? 16 : 6,
                        height: 6, borderRadius: 999,
                        background: i === currentImg ? 'var(--accent)' : 'rgba(255,255,255,0.45)',
                        border: 'none', padding: 0, cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: i === currentImg ? '0 0 6px rgba(245,197,24,0.6)' : 'none',
                      }}
                    />
                  ))}
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

          {/* Game type badge */}
          <div style={{
            position: 'absolute', top: 10, left: 10,
            background: 'rgba(0,0,0,0.78)',
            backdropFilter: 'blur(6px)',
            border: `1px solid ${accentColor}44`,
            color: accentColor,
            padding: '0.2rem 0.6rem',
            borderRadius: 999,
            fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em',
            zIndex: 2,
          }}>
            {gameType}
          </div>

          {/* Seller mode action buttons */}
          {sellerMode && (
            <div
              style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: '0.3rem', zIndex: 4 }}
              onClick={e => e.stopPropagation()}
            >
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
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,197,24,0.25)'}
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
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(231,76,60,0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.75)'}
              >
                <FiTrash2 size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Card body */}
        <div style={{ padding: '1rem 1.1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.97rem', lineHeight: 1.3, color: 'var(--text-primary)' }}>
            <Twemoji text={title} />
          </h3>

          <ExpandableDesc text={description} />

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
              {seller.avatar ? (
                <img src={seller.avatar} alt={seller.name} style={{ width: 16, height: 16, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <FiMessageCircle size={11} />
              )}
              <Twemoji text={`Seller: ${seller.name}`} />
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
          currentIndex={currentImg}
          onChangeIndex={setCurrentImg}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
