import React, { useState } from 'react';
import { useManual } from '../context/ManualContext';
import './HotspotEditorModal.css';
import './ImageSessionModal.css';

const ImageSessionModal = ({ isOpen, onClose, onSessionCreated }) => {
  const { addPictureSession } = useManual();
  const [sessionTitle, setSessionTitle] = useState('');
  const [mapId, setMapId] = useState('');
  const [imageSourceType, setImageSourceType] = useState('upload'); // 'upload' | 'url'
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [altText, setAltText] = useState('');

  if (!isOpen) return null;

  const handleTitleChange = (val) => {
    setSessionTitle(val);
    if (!mapId || mapId.startsWith('map-') || mapId === '') {
      setMapId(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-map');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalImageUrl = imageSourceType === 'upload' ? imagePreview : imageUrl;
    if (!finalImageUrl) {
      alert('Please upload an image or provide a valid image URL.');
      return;
    }
    const cleanMapId = (mapId || 'custom-session-' + Date.now()).toLowerCase().replace(/[^a-z0-9-]/g, '-');
    addPictureSession(cleanMapId, sessionTitle || 'New Picture Session', finalImageUrl, altText);
    
    if (onSessionCreated) {
      onSessionCreated(cleanMapId);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content session-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon">🖼️</span>
            <h3>Add New Picture Session / Screenshot</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Picture Session Title</label>
            <input 
              type="text" 
              placeholder="e.g. Order Processing Screen, WMS Dashboard" 
              value={sessionTitle} 
              onChange={(e) => handleTitleChange(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Session Identifier (Map ID)</label>
            <input 
              type="text" 
              placeholder="e.g. order-processing-map" 
              value={mapId} 
              onChange={(e) => setMapId(e.target.value)} 
              required 
            />
            <span className="form-hint">Used in markdown as: ```interactive-map {mapId}```</span>
          </div>

          <div className="form-group">
            <label>Image Source</label>
            <div className="source-tabs">
              <button 
                type="button" 
                className={`source-tab ${imageSourceType === 'upload' ? 'active' : ''}`}
                onClick={() => setImageSourceType('upload')}
              >
                📁 Upload Local Image File
              </button>
              <button 
                type="button" 
                className={`source-tab ${imageSourceType === 'url' ? 'active' : ''}`}
                onClick={() => setImageSourceType('url')}
              >
                🔗 Image URL
              </button>
            </div>
          </div>

          {imageSourceType === 'upload' ? (
            <div className="form-group">
              <label className="upload-dropzone">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  style={{ display: 'none' }} 
                />
                {imagePreview ? (
                  <div className="upload-preview-wrap">
                    <img src={imagePreview} alt="Upload Preview" className="upload-img-preview" />
                    <span className="change-img-text">Click to choose another image</span>
                  </div>
                ) : (
                  <div className="dropzone-placeholder">
                    <span className="dropzone-icon">📸</span>
                    <p className="dropzone-title">Click to browse or drop screenshot image</p>
                    <p className="dropzone-subtitle">Supports PNG, JPG, WebP, SVG</p>
                  </div>
                )}
              </label>
            </div>
          ) : (
            <div className="form-group">
              <label>Image URL</label>
              <input 
                type="url" 
                placeholder="https://your-domain.com/screenshot.png" 
                value={imageUrl} 
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImagePreview(e.target.value);
                }} 
                required 
              />
              {imageUrl && (
                <div className="url-preview-wrap">
                  <img src={imageUrl} alt="Preview" className="upload-img-preview" onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label>Accessibility Alt Description</label>
            <input 
              type="text" 
              placeholder="e.g. Screenshot of the backoffice order list table" 
              value={altText} 
              onChange={(e) => setAltText(e.target.value)} 
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Create Picture Session</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImageSessionModal;
