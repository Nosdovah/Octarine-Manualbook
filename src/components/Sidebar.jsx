import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useManual } from '../context/ManualContext';
import NewPageModal from './NewPageModal';
import './Sidebar.css';

const Sidebar = () => {
  const { 
    docsStructure, 
    isEditMode, 
    isSidebarOpen, 
    toggleSidebar,
    addCategory, 
    renameCategory, 
    deleteCategory, 
    addPage,
    renamePage, 
    deletePage 
  } = useManual();

  const navigate = useNavigate();

  // Inline editing states
  const [editingCatId, setEditingCatId] = useState(null);
  const [catTitleInput, setCatTitleInput] = useState('');

  const [editingPageId, setEditingPageId] = useState(null);
  const [pageTitleInput, setPageTitleInput] = useState('');

  const [deletingCatId, setDeletingCatId] = useState(null);
  const [deletingPageId, setDeletingPageId] = useState(null);

  const [addingCatMode, setAddingCatMode] = useState(false);
  const [newCatTitleInput, setNewCatTitleInput] = useState('');

  const [addingPageCatId, setAddingPageCatId] = useState(null);
  const [newPageTitleInput, setNewPageTitleInput] = useState('');

  const [newPageModalCatId, setNewPageModalCatId] = useState(null);

  // Focus helper
  const editInputRef = useRef(null);
  useEffect(() => {
    if (editingCatId || editingPageId || addingCatMode || addingPageCatId) {
      setTimeout(() => {
        editInputRef.current?.focus();
        editInputRef.current?.select();
      }, 50);
    }
  }, [editingCatId, editingPageId, addingCatMode, addingPageCatId]);

  // Category Actions
  const handleStartRenameCat = (e, cat) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingCatId(cat.id);
    setCatTitleInput(cat.title);
    setDeletingCatId(null);
  };

  const handleSaveRenameCat = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (editingCatId && catTitleInput.trim()) {
      renameCategory(editingCatId, catTitleInput.trim());
    }
    setEditingCatId(null);
    setCatTitleInput('');
  };

  const handleCancelRenameCat = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setEditingCatId(null);
    setCatTitleInput('');
  };

  const handleConfirmDeleteCat = (e, catId) => {
    e.preventDefault();
    e.stopPropagation();
    deleteCategory(catId);
    setDeletingCatId(null);
  };

  const handleCreateCategory = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (newCatTitleInput.trim()) {
      addCategory(newCatTitleInput.trim());
      setNewCatTitleInput('');
      setAddingCatMode(false);
    }
  };

  // Page Actions
  const handleStartRenamePage = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingPageId(item.id);
    setPageTitleInput(item.title);
    setDeletingPageId(null);
  };

  const handleSaveRenamePage = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (editingPageId && pageTitleInput.trim()) {
      renamePage(editingPageId, pageTitleInput.trim());
    }
    setEditingPageId(null);
    setPageTitleInput('');
  };

  const handleCancelRenamePage = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setEditingPageId(null);
    setPageTitleInput('');
  };

  const handleConfirmDeletePage = (e, catId, pageId, slug) => {
    e.preventDefault();
    e.stopPropagation();
    deletePage(catId, pageId, slug);
    setDeletingPageId(null);
  };

  const handleQuickAddPage = (e, catId) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (newPageTitleInput.trim()) {
      const generatedSlug = newPageTitleInput.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const createdSlug = addPage(catId, newPageTitleInput.trim(), generatedSlug);
      setAddingPageCatId(null);
      setNewPageTitleInput('');
      navigate(`/manual/${createdSlug}`);
    }
  };

  return (
    <>
      {/* Floating Toggle button to show sidebar when collapsed */}
      {!isSidebarOpen && (
        <button 
          type="button" 
          className="btn-sidebar-open-floating"
          onClick={toggleSidebar}
          title="Show Sidebar Menu"
          aria-label="Show Sidebar Navigation"
        >
          <span>▶</span>
          <span>Show Menu</span>
        </button>
      )}

      <aside className={`sidebar ${!isSidebarOpen ? 'sidebar-hidden' : ''} ${isEditMode ? 'sidebar-editing' : ''}`}>
        <div className="sidebar-inner">
          <div className="sidebar-header-row">
            <div className="sidebar-header-top">
              <h3 className="sidebar-title">Documentation</h3>
              <button 
                type="button" 
                className="btn-sidebar-toggle-hide"
                onClick={toggleSidebar}
                title="Hide Sidebar Navigation"
                aria-label="Hide Sidebar"
              >
                <span>◀</span>
                <span>Hide</span>
              </button>
            </div>
            
            {isEditMode && (
              <div className="sidebar-header-edit-bar">
                {!addingCatMode ? (
                  <button 
                    type="button" 
                    className="btn-sidebar-add-cat"
                    onClick={() => { setAddingCatMode(true); setNewCatTitleInput(''); }}
                    title="Add a new navigation category"
                  >
                    + Add Category
                  </button>
                ) : (
                  <form onSubmit={handleCreateCategory} className="sidebar-inline-form">
                    <input
                      ref={editInputRef}
                      type="text"
                      className="sidebar-inline-input"
                      placeholder="Category Title..."
                      value={newCatTitleInput}
                      onChange={(e) => setNewCatTitleInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Escape') setAddingCatMode(false); }}
                    />
                    <div className="inline-form-actions">
                      <button type="submit" className="btn-inline-save" title="Save Category">✓</button>
                      <button type="button" className="btn-inline-cancel" onClick={() => setAddingCatMode(false)} title="Cancel">✕</button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          <nav className="sidebar-nav">
            {docsStructure.map((category) => (
              <div key={category.id} className="nav-group">
                {/* Category Header or Inline Edit */}
                {editingCatId === category.id ? (
                  <form onSubmit={handleSaveRenameCat} className="sidebar-inline-form mb-2">
                    <input
                      ref={editInputRef}
                      type="text"
                      className="sidebar-inline-input"
                      value={catTitleInput}
                      onChange={(e) => setCatTitleInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Escape') handleCancelRenameCat(e); }}
                    />
                    <div className="inline-form-actions">
                      <button type="submit" className="btn-inline-save" title="Save">✓</button>
                      <button type="button" className="btn-inline-cancel" onClick={handleCancelRenameCat} title="Cancel">✕</button>
                    </div>
                  </form>
                ) : deletingCatId === category.id ? (
                  <div className="inline-confirm-box">
                    <span className="confirm-text">Delete "{category.title}"?</span>
                    <div className="confirm-btns">
                      <button 
                        type="button" 
                        className="btn-confirm-delete" 
                        onClick={(e) => handleConfirmDeleteCat(e, category.id)}
                      >
                        Delete
                      </button>
                      <button 
                        type="button" 
                        className="btn-confirm-cancel" 
                        onClick={() => setDeletingCatId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="nav-group-header">
                    <h4 className="nav-group-title" title={category.title}>{category.title}</h4>
                    {isEditMode && (
                      <div className="cat-edit-actions">
                        <button 
                          type="button" 
                          className="cat-action-icon"
                          onClick={(e) => handleStartRenameCat(e, category)}
                          title="Rename Category"
                        >
                          ✏️
                        </button>
                        <button 
                          type="button" 
                          className="cat-action-icon"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setAddingPageCatId(category.id);
                            setNewPageTitleInput('');
                          }}
                          title="Add Page to this Category"
                        >
                          ➕
                        </button>
                        <button 
                          type="button" 
                          className="cat-action-icon delete-icon"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDeletingCatId(category.id);
                          }}
                          title="Delete Category"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <ul className="nav-group-list">
                  {category.items.map((item) => (
                    <li key={item.id} className="nav-item-row">
                      {editingPageId === item.id ? (
                        <form onSubmit={handleSaveRenamePage} className="sidebar-inline-form w-100">
                          <input
                            ref={editInputRef}
                            type="text"
                            className="sidebar-inline-input"
                            value={pageTitleInput}
                            onChange={(e) => setPageTitleInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Escape') handleCancelRenamePage(e); }}
                          />
                          <div className="inline-form-actions">
                            <button type="submit" className="btn-inline-save" title="Save Title">✓</button>
                            <button type="button" className="btn-inline-cancel" onClick={handleCancelRenamePage} title="Cancel">✕</button>
                          </div>
                        </form>
                      ) : deletingPageId === item.id ? (
                        <div className="inline-confirm-box w-100">
                          <span className="confirm-text">Delete "{item.title}"?</span>
                          <div className="confirm-btns">
                            <button 
                              type="button" 
                              className="btn-confirm-delete" 
                              onClick={(e) => handleConfirmDeletePage(e, category.id, item.id, item.slug)}
                            >
                              Delete
                            </button>
                            <button 
                              type="button" 
                              className="btn-confirm-cancel" 
                              onClick={() => setDeletingPageId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <NavLink 
                            to={`/manual/${item.slug}`}
                            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                          >
                            <span className="nav-link-text" title={item.title}>{item.title}</span>
                          </NavLink>
                          {isEditMode && (
                            <div className="page-edit-actions">
                              <button 
                                type="button" 
                                className="page-action-icon"
                                onClick={(e) => handleStartRenamePage(e, item)}
                                title="Rename page title"
                              >
                                ✏️
                              </button>
                              <button 
                                type="button" 
                                className="page-action-icon delete-icon"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setDeletingPageId(item.id);
                                }}
                                title="Delete page"
                              >
                                🗑️
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </li>
                  ))}

                  {/* Inline Add Page Input when active */}
                  {isEditMode && addingPageCatId === category.id && (
                    <li className="nav-item-row">
                      <form onSubmit={(e) => handleQuickAddPage(e, category.id)} className="sidebar-inline-form w-100">
                        <input
                          ref={editInputRef}
                          type="text"
                          className="sidebar-inline-input"
                          placeholder="New Page Title..."
                          value={newPageTitleInput}
                          onChange={(e) => setNewPageTitleInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Escape') setAddingPageCatId(null); }}
                        />
                        <div className="inline-form-actions">
                          <button type="submit" className="btn-inline-save" title="Create Page">✓</button>
                          <button type="button" className="btn-inline-cancel" onClick={() => setAddingPageCatId(null)} title="Cancel">✕</button>
                        </div>
                      </form>
                    </li>
                  )}

                  {isEditMode && addingPageCatId !== category.id && (
                    <li className="add-page-placeholder">
                      <button 
                        type="button" 
                        className="btn-add-page-inline"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setAddingPageCatId(category.id);
                          setNewPageTitleInput('');
                        }}
                      >
                        + Add Page to {category.title}
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* New Page Modal */}
      {newPageModalCatId && (
        <NewPageModal 
          isOpen={!!newPageModalCatId}
          defaultCategoryId={newPageModalCatId}
          onClose={() => setNewPageModalCatId(null)}
        />
      )}
    </>
  );
};

export default Sidebar;
