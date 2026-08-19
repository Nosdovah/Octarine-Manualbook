import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useManual } from '../context/ManualContext';
import './HotspotEditorModal.css';
import './HeaderEditorModal.css';

const HeaderEditorModal = ({ isOpen, onClose }) => {
  const { headerConfig, updateHeader } = useManual();
  const [logoText, setLogoText] = useState('');
  const [logoSubtext, setLogoSubtext] = useState('');
  const [marqueeText, setMarqueeText] = useState('');
  const [navLinks, setNavLinks] = useState([]);

  useEffect(() => {
    if (headerConfig) {
      setLogoText(headerConfig.logoText || 'Octarine.');
      setLogoSubtext(headerConfig.logoSubtext || 'Eau De Parfum');
      setMarqueeText(headerConfig.marqueeText || '');
      setNavLinks(headerConfig.navLinks || []);
    }
  }, [headerConfig]);

  if (!isOpen) return null;

  const handleAddLink = () => {
    const newLink = {
      id: 'nl-' + Date.now(),
      label: 'NEW LINK',
      url: 'https://octarine.co.id',
      isExternal: true
    };
    setNavLinks([...navLinks, newLink]);
  };

  const handleUpdateLink = (id, field, value) => {
    setNavLinks(navLinks.map(link => link.id === id ? { ...link, [field]: value } : link));
  };

  const handleDeleteLink = (id) => {
    setNavLinks(navLinks.filter(link => link.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateHeader({
      logoText,
      logoSubtext,
      marqueeText,
      navLinks
    });
    onClose();
  };

  const modalElement = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content header-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <h3>Edit Top Navbar & Header</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group flex-1">
              <label>Logo Brand Text</label>
              <input 
                type="text" 
                value={logoText} 
                onChange={(e) => setLogoText(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group flex-1">
              <label>Logo Subtitle</label>
              <input 
                type="text" 
                value={logoSubtext} 
                onChange={(e) => setLogoSubtext(e.target.value)} 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Scrolling Marquee Ticker Text</label>
            <textarea 
              value={marqueeText} 
              onChange={(e) => setMarqueeText(e.target.value)} 
              rows={2}
              placeholder="Announcement text separated by bullet dots..." 
              required 
            />
          </div>

          <div className="form-group">
            <div className="section-title-wrap">
              <label>Top Navigation Links ({navLinks.length})</label>
              <button type="button" className="btn-add-item" onClick={handleAddLink}>+ Add Nav Link</button>
            </div>

            <div className="nav-links-list">
              {navLinks.map((link) => (
                <div key={link.id} className="nav-link-row">
                  <input 
                    type="text" 
                    placeholder="Label (e.g. SHOP)" 
                    value={link.label} 
                    onChange={(e) => handleUpdateLink(link.id, 'label', e.target.value)} 
                    className="nav-label-input"
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="URL (e.g. https://... or /manual/...)" 
                    value={link.url} 
                    onChange={(e) => handleUpdateLink(link.id, 'url', e.target.value)} 
                    className="nav-url-input"
                    required
                  />
                  <label className="checkbox-wrap" title="Opens in new browser tab">
                    <input 
                      type="checkbox" 
                      checked={link.isExternal} 
                      onChange={(e) => handleUpdateLink(link.id, 'isExternal', e.target.checked)} 
                    />
                    <span>External</span>
                  </label>
                  <button 
                    type="button" 
                    className="btn-delete-link" 
                    onClick={() => handleDeleteLink(link.id)}
                    title="Remove link"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Apply & Save Header</button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalElement, document.body);
};

export default HeaderEditorModal;
