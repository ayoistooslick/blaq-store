import { useState, useCallback } from 'react';
import { FiPlus, FiUpload, FiLink, FiX } from 'react-icons/fi';
import client from '../api/client.js';
import ImageCropper from './ImageCropper.jsx';
import { readFileAsDataUrl } from '../utils/cropUtils.js';

const GAME_TYPES = ['Free Fire', 'CODM', 'Other'];

export default function AddListingForm({ onSuccess, initialData = null, editMode = false }) {
  const [form, setForm] = useState({
    gameType: initialData?.gameType || 'Free Fire',
    title: initialData?.title || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
  });
  const [imageMode, setImageMode] = useState('url');

  const [urlInputs, setUrlInputs] = useState(
    initialData?.images?.length ? initialData.images : ['']
  );

  const [cropQueue, setCropQueue] = useState([]);
  const [croppedFiles, setCroppedFiles] = useState([]);
  const [croppedPreviews, setCroppedPreviews] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleFilePick = async (e) => {
    const picked = Array.from(e.target.files).slice(0, 5 - croppedFiles.length);
    if (!picked.length) return;
    const queue = await Promise.all(
      picked.map(async (file) => ({
        file,
        dataUrl: await readFileAsDataUrl(file),
      }))
    );
    setCropQueue(queue);
    e.target.value = '';
  };

  const handleCropConfirm = useCallback((croppedFile) => {
    setCroppedFiles(prev => [...prev, croppedFile]);
    setCroppedPreviews(prev => [...prev, URL.createObjectURL(croppedFile)]);
    setCropQueue(prev => prev.slice(1));
  }, []);

  const handleCropSkip = useCallback(() => {
    setCropQueue(prev => {
      if (!prev.length) return prev;
      const { file } = prev[0];
      setCroppedFiles(cf => [...cf, file]);
      setCroppedPreviews(cp => [...cp, URL.createObjectURL(file)]);
      return prev.slice(1);
    });
  }, []);

  const removeCropped = (i) => {
    setCroppedFiles(prev => prev.filter((_, idx) => idx !== i));
    setCroppedPreviews(prev => {
      URL.revokeObjectURL(prev[i]);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const addUrlInput = () => {
    if (urlInputs.length < 5) setUrlInputs(u => [...u, '']);
  };
  const updateUrl = (i, val) => setUrlInputs(u => u.map((v, idx) => idx === i ? val : v));
  const removeUrl = (i) => setUrlInputs(u => u.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.price) {
      return setError('Please fill in all required fields.');
    }
    if (Number(form.price) <= 0) return setError('Price must be a positive number.');

    setLoading(true);
    setError('');
    try {
      if (imageMode === 'upload') {
        const data = new FormData();
        data.append('gameType', form.gameType);
        data.append('title', form.title);
        data.append('description', form.description);
        data.append('price', form.price);
        croppedFiles.forEach(f => data.append('images', f));

        if (editMode && initialData?._id) {
          await client.put(`/market/listing/${initialData._id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } else {
          await client.post('/market/list-account', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
      } else {
        const cleanUrls = urlInputs.filter(u => u.trim());
        const payload = {
          gameType: form.gameType,
          title: form.title,
          description: form.description,
          price: form.price,
          imageUrls: JSON.stringify(cleanUrls),
        };
        if (editMode && initialData?._id) {
          await client.put(`/market/listing/${initialData._id}`, payload);
        } else {
          await client.post('/market/list-account', payload);
        }
      }

      setSuccess(editMode ? 'Listing updated!' : 'Account listed successfully!');
      if (!editMode) {
        setForm({ gameType: 'Free Fire', title: '', description: '', price: '' });
        setCroppedFiles([]);
        setCroppedPreviews([]);
        setUrlInputs(['']);
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const currentCrop = cropQueue[0] ?? null;

  return (
    <>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem',
        maxWidth: editMode ? '100%' : 560,
      }}>
        {!editMode && (
          <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiPlus color="var(--accent)" />
            List a New Account
          </h3>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div className="form-group">
            <label>Game Type *</label>
            <select name="gameType" value={form.gameType} onChange={handleChange} className="form-input">
              {GAME_TYPES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Account Title *</label>
            <input
              type="text" name="title" value={form.title} onChange={handleChange}
              className="form-input" placeholder="e.g. FF Diamond Account Level 80"
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description" value={form.description} onChange={handleChange}
              className="form-input" rows={4}
              placeholder="Describe what's included: rank, skins, characters, etc."
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label>Price (₦) *</label>
            <input
              type="number" name="price" value={form.price} onChange={handleChange}
              className="form-input" placeholder="e.g. 15000" min="1"
            />
          </div>

          <div className="form-group">
            <label>Account Images (up to 5)</label>
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem' }}>
              {[
                { id: 'url', label: 'Paste URL', icon: <FiLink size={13} /> },
                { id: 'upload', label: 'Upload & Crop', icon: <FiUpload size={13} /> },
              ].map(opt => (
                <button
                  key={opt.id} type="button"
                  onClick={() => setImageMode(opt.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    padding: '0.4rem 0.85rem', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontSize: '0.78rem', fontWeight: 600,
                    background: imageMode === opt.id ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                    color: imageMode === opt.id ? 'var(--accent)' : 'var(--text-secondary)',
                    outline: imageMode === opt.id ? '1.5px solid var(--accent)' : '1.5px solid transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>

            {imageMode === 'url' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {urlInputs.map((url, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <input
                      type="url" value={url}
                      onChange={e => updateUrl(i, e.target.value)}
                      className="form-input"
                      placeholder="https://example.com/image.jpg"
                      style={{ flex: 1 }}
                    />
                    {urlInputs.length > 1 && (
                      <button type="button" onClick={() => removeUrl(i)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.4rem', borderRadius: 6, flexShrink: 0 }}>
                        <FiX size={15} />
                      </button>
                    )}
                  </div>
                ))}
                {urlInputs.length < 5 && (
                  <button type="button" onClick={addUrlInput}
                    style={{
                      background: 'transparent', border: '1.5px dashed var(--border)',
                      color: 'var(--text-muted)', borderRadius: 'var(--radius)',
                      padding: '0.5rem', fontSize: '0.8rem', cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                    + Add another image URL
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {croppedPreviews.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                    {croppedPreviews.map((src, i) => (
                      <div key={i} style={{ position: 'relative', width: 72, height: 72, borderRadius: 8, overflow: 'hidden', border: '1.5px solid var(--accent)', flexShrink: 0 }}>
                        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button" onClick={() => removeCropped(i)}
                          style={{
                            position: 'absolute', top: 2, right: 2,
                            background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%',
                            width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: '#fff', padding: 0,
                          }}
                        >
                          <FiX size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {croppedFiles.length < 5 && (
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    background: 'var(--bg-elevated)', border: '1.5px dashed var(--border)',
                    borderRadius: 'var(--radius)', padding: '0.85rem 1rem',
                    cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.875rem',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                    <FiUpload color="var(--accent)" />
                    {croppedFiles.length > 0
                      ? `Add more images (${croppedFiles.length}/5 ready)`
                      : 'Click to select images — crop before upload'}
                    <input
                      type="file" accept="image/*" multiple
                      onChange={handleFilePick}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}

                {croppedFiles.length > 0 && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>
                    {croppedFiles.length} image{croppedFiles.length > 1 ? 's' : ''} ready to upload
                  </p>
                )}
              </div>
            )}
          </div>

          {error && <p className="error-msg">{error}</p>}
          {success && <p style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600 }}>{success}</p>}

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading
              ? (editMode ? 'Saving...' : 'Publishing...')
              : (editMode ? 'Save Changes' : 'Publish Listing')}
          </button>
        </form>
      </div>

      {currentCrop && (
        <ImageCropper
          imageSrc={currentCrop.dataUrl}
          fileName={currentCrop.file.name}
          imageIndex={croppedFiles.length}
          totalImages={croppedFiles.length + cropQueue.length}
          onConfirm={handleCropConfirm}
          onSkip={handleCropSkip}
        />
      )}
    </>
  );
}
