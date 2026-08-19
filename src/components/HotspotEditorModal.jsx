import React, { useState, useEffect } from 'react';
import './HotspotEditorModal.css';

const HotspotEditorModal = ({ isOpen, onClose, hotspot, onSave, onDelete }) => {
  const [badge, setBadge] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [placement, setPlacement] = useState('bottom');

  useEffect(() => {
    if (hotspot) {
      setBadge(hotspot.badge || '');
      setTitle(hotspot.title || '');
      setDescription(hotspot.description || '');
      setPlacement(hotspot.placement || 'bottom');
    }
  }, [hotspot]);

  if (!isOpen || !hotspot) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      badge,
      title,
      description,
      placement
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content hotspot-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <h3>Edit Step Dot Info</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Step Badge / Label</label>
            <input 
              type="text" 
              value={badge} 
              onChange={(e) => setBadge(e.target.value)} 
              placeholder="e.g. Step 1, Email, Action, Warning" 
              required 
            />
            <span className="form-hint">Displayed inside the badge tag in the tooltip</span>
          </div>

          <div className="form-group">
            <label>Title Text</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g. 2. Email Address Field" 
              required 
            />
          </div>

          <div className="form-group">
            <label>Description Text</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Explain the function, behavior, or input requirement for this element..." 
              rows={4}
              required 
            />
          </div>

          <div className="form-group">
            <label>Tooltip Placement</label>
            <div className="placement-selector">
              {['top', 'bottom'].map((p) => (
                <button
                  type="button"
                  key={p}
                  className={`placement-btn ${placement === p ? 'active' : ''}`}
                  onClick={() => setPlacement(p)}
                >
                  {p === 'top' ? 'Above Dot' : 'Below Dot'}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn-danger" 
              onClick={() => {
                if (window.confirm('Delete this step dot?')) {
                  onDelete(hotspot.id);
                  onClose();
                }
              }}
            >
              Delete Dot
            </button>
            <div className="action-right">
              <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary">Save Step Info</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HotspotEditorModal;
