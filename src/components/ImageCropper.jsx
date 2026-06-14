import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { FiCheck, FiSkipForward, FiZoomIn, FiZoomOut } from 'react-icons/fi';
import { getCroppedBlob } from '../utils/cropUtils.js';

export default function ImageCropper({ imageSrc, fileName, imageIndex, totalImages, onConfirm, onSkip }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [applying, setApplying] = useState(false);

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setApplying(true);
    try {
      const file = await getCroppedBlob(imageSrc, croppedAreaPixels, fileName);
      onConfirm(file);
    } catch {
      onSkip();
    } finally {
      setApplying(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 600,
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 560,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: '0 12px 56px rgba(0,0,0,0.7)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{
          padding: '1rem 1.4rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>Crop Image</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Image {imageIndex + 1} of {totalImages} — drag to reposition, pinch or scroll to zoom
            </p>
          </div>
          <span style={{
            background: 'var(--accent-dim)', color: 'var(--accent)',
            borderRadius: 999, padding: '0.2rem 0.65rem',
            fontSize: '0.72rem', fontWeight: 700,
          }}>
            {fileName?.length > 20 ? fileName.slice(0, 18) + '…' : fileName}
          </span>
        </div>

        <div style={{ position: 'relative', height: 320, background: '#000' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={undefined}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: { background: '#0a0a0a' },
              cropAreaStyle: {
                border: '2px solid var(--accent)',
                color: 'rgba(245,197,24,0.25)',
              },
            }}
          />
        </div>

        <div style={{ padding: '0.85rem 1.4rem', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <FiZoomOut size={15} color="var(--text-muted)" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              style={{
                flex: 1,
                accentColor: 'var(--accent)',
                cursor: 'pointer',
                height: 4,
              }}
            />
            <FiZoomIn size={15} color="var(--text-muted)" />
          </div>
          <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onSkip}
              disabled={applying}
              className="btn-ghost"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem' }}
            >
              <FiSkipForward size={14} />
              Skip crop
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={applying}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem' }}
            >
              <FiCheck size={15} />
              {applying ? 'Applying…' : 'Apply Crop'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
