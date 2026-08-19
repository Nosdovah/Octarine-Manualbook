import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useManual } from '../context/ManualContext';
import './HotspotEditorModal.css';

const NewPageModal = ({ isOpen, onClose, defaultCategoryId }) => {
  const { docsStructure, addPage, addCategory } = useManual();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState(defaultCategoryId || (docsStructure[0]?.id || ''));
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategoryTitle, setNewCategoryTitle] = useState('');

  if (!isOpen) return null;

  const handleTitleChange = (val) => {
    setTitle(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let targetCatId = categoryId;
    if (isNewCategory && newCategoryTitle.trim()) {
      addCategory(newCategoryTitle.trim());
      // we'll place it in the newly added or target
      targetCatId = 'cat-' + Date.now();
    }
    const createdSlug = addPage(targetCatId, title, slug);
    onClose();
    navigate(`/manual/${createdSlug}`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon">📄</span>
            <h3>Create New Guide Page</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Page Title</label>
            <input 
              type="text" 
              placeholder="e.g. Order Fulfillment Workflow" 
              value={title} 
              onChange={(e) => handleTitleChange(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Page URL Slug</label>
            <input 
              type="text" 
              placeholder="e.g. order-fulfillment" 
              value={slug} 
              onChange={(e) => setSlug(e.target.value)} 
              required 
            />
            <span className="form-hint">Route path: /manual/{slug}</span>
          </div>

          <div className="form-group">
            <label>Sidebar Category</label>
            {!isNewCategory ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <select 
                  value={categoryId} 
                  onChange={(e) => setCategoryId(e.target.value)}
                  style={{ flex: 1 }}
                >
                  {docsStructure.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.title}</option>
                  ))}
                </select>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setIsNewCategory(true)}
                  style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}
                >
                  + New Category
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder="New Category Title..." 
                  value={newCategoryTitle} 
                  onChange={(e) => setNewCategoryTitle(e.target.value)} 
                  style={{ flex: 1 }}
                  required 
                />
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setIsNewCategory(false)}
                  style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}
                >
                  Existing
                </button>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Create & Open Page</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPageModal;
