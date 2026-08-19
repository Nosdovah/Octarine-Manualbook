import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useManual } from '../context/ManualContext';
import NewPageModal from './NewPageModal';
import './Sidebar.css';

const Sidebar = () => {
  const { 
    docsStructure, 
    isEditMode, 
    addCategory, 
    renameCategory, 
    deleteCategory, 
    renamePage, 
    deletePage 
  } = useManual();

  const [newPageModalCatId, setNewPageModalCatId] = useState(null);

  const handleAddCategoryPrompt = () => {
    const title = window.prompt('Enter new category name:');
    if (title && title.trim()) {
      addCategory(title.trim());
    }
  };

  const handleRenameCat = (catId, currentTitle) => {
    const newTitle = window.prompt('Rename category:', currentTitle);
    if (newTitle && newTitle.trim()) {
      renameCategory(catId, newTitle.trim());
    }
  };

  const handleDeleteCat = (catId, title) => {
    if (window.confirm(`Delete category "${title}" and all its pages?`)) {
      deleteCategory(catId);
    }
  };

  const handleRenamePg = (pageId, currentTitle) => {
    const newTitle = window.prompt('Rename page title:', currentTitle);
    if (newTitle && newTitle.trim()) {
      renamePage(pageId, newTitle.trim());
    }
  };

  const handleDeletePg = (catId, pageId, slug, title) => {
    if (window.confirm(`Delete page "${title}"?`)) {
      deletePage(catId, pageId, slug);
    }
  };

  return (
    <>
      <aside className={`sidebar ${isEditMode ? 'sidebar-editing' : ''}`}>
        <div className="sidebar-inner">
          <div className="sidebar-header-row">
            <h3 className="sidebar-title">Documentation</h3>
            {isEditMode && (
              <button 
                type="button" 
                className="btn-sidebar-add-cat"
                onClick={handleAddCategoryPrompt}
                title="Add a new navigation category"
              >
                + Category
              </button>
            )}
          </div>

          <nav className="sidebar-nav">
            {docsStructure.map((category) => (
              <div key={category.id} className="nav-group">
                <div className="nav-group-header">
                  <h4 className="nav-group-title">{category.title}</h4>
                  {isEditMode && (
                    <div className="cat-edit-actions">
                      <button 
                        type="button" 
                        className="cat-action-icon"
                        onClick={() => handleRenameCat(category.id, category.title)}
                        title="Rename Category"
                      >
                        ✏️
                      </button>
                      <button 
                        type="button" 
                        className="cat-action-icon"
                        onClick={() => setNewPageModalCatId(category.id)}
                        title="Add Page to this Category"
                      >
                        ➕
                      </button>
                      <button 
                        type="button" 
                        className="cat-action-icon"
                        onClick={() => handleDeleteCat(category.id, category.title)}
                        title="Delete Category"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>

                <ul className="nav-group-list">
                  {category.items.map((item) => (
                    <li key={item.id} className="nav-item-row">
                      <NavLink 
                        to={`/manual/${item.slug}`}
                        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                      >
                        <span className="nav-link-text">{item.title}</span>
                      </NavLink>
                      {isEditMode && (
                        <div className="page-edit-actions">
                          <button 
                            type="button" 
                            className="page-action-icon"
                            onClick={(e) => { e.preventDefault(); handleRenamePg(item.id, item.title); }}
                            title="Rename page title"
                          >
                            ✏️
                          </button>
                          <button 
                            type="button" 
                            className="page-action-icon"
                            onClick={(e) => { e.preventDefault(); handleDeletePg(category.id, item.id, item.slug, item.title); }}
                            title="Delete page"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </li>
                  ))}

                  {isEditMode && (
                    <li className="add-page-placeholder">
                      <button 
                        type="button" 
                        className="btn-add-page-inline"
                        onClick={() => setNewPageModalCatId(category.id)}
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
