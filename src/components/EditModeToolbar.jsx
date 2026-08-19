import React, { useRef, useState } from 'react';
import { useManual } from '../context/ManualContext';
import HeaderEditorModal from './HeaderEditorModal';
import ImageSessionModal from './ImageSessionModal';
import NewPageModal from './NewPageModal';
import './EditModeToolbar.css';

const EditModeToolbar = ({ currentSlug }) => {
  const { 
    isEditMode, 
    setIsEditMode, 
    statusMessage, 
    exportAllData, 
    importAllData, 
    resetToDefaults, 
    showNotification 
  } = useManual();

  const [isHeaderModalOpen, setIsHeaderModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isNewPageModalOpen, setIsNewPageModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target.result);
          importAllData(json);
        } catch (err) {
          alert('Invalid JSON configuration file: ' + err.message);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <>
      <aside aria-label="Editor controls" className={`edit-mode-dock ${isEditMode ? 'active-mode' : ''}`}>
        <div className="dock-container">
          {/* Mode Switcher */}
          <div className="mode-toggle-group">
            <button 
              className={`mode-btn ${!isEditMode ? 'selected' : ''}`}
              onClick={() => {
                setIsEditMode(false);
                showNotification('Locked in View Mode');
              }}
              title="Standard locked reading mode"
            >
              🔒 View Mode
            </button>
            <button 
              className={`mode-btn ${isEditMode ? 'selected edit-active' : ''}`}
              onClick={() => {
                setIsEditMode(true);
                showNotification('Edit Mode Enabled: Click and drag dots or edit page content!');
              }}
              title="Unlock visual editing & draggable hotspots"
            >
              ✏️ Edit Mode
            </button>
          </div>

          {/* Quick Actions in Edit Mode */}
          {isEditMode && (
            <div className="dock-actions animate-fade-in">
              <button 
                className="dock-action-btn"
                onClick={() => setIsNewPageModalOpen(true)}
                title="Create a new guide page"
              >
                📄 + Page
              </button>

              <button 
                className="dock-action-btn"
                onClick={() => setIsSessionModalOpen(true)}
                title="Upload screenshot or create interactive image session"
              >
                🖼️ + Picture Session
              </button>

              <button 
                className="dock-action-btn"
                onClick={() => setIsHeaderModalOpen(true)}
                title="Customize top navbar, logo, and announcement ticker"
              >
                🧭 Top Navbar
              </button>

              <div className="dock-divider"></div>

              <button 
                className="dock-action-btn btn-util"
                onClick={exportAllData}
                title="Export complete configuration as JSON backup"
              >
                💾 Export JSON
              </button>

              <button 
                className="dock-action-btn btn-util"
                onClick={() => fileInputRef.current?.click()}
                title="Import configuration from JSON file"
              >
                📥 Import
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                accept=".json" 
                onChange={handleImportFile} 
                style={{ display: 'none' }} 
              />

              <button 
                className="dock-action-btn btn-util danger-hover"
                onClick={resetToDefaults}
                title="Reset manual to initial defaults"
              >
                🔄 Reset
              </button>

              <button 
                className="dock-save-btn"
                onClick={() => {
                  setIsEditMode(false);
                  showNotification('All changes saved and locked!');
                }}
              >
                ✓ Finalize & Lock
              </button>
            </div>
          )}
        </div>

        {/* Global Toast / Status Notification */}
        {statusMessage && (
          <div className="dock-toast animate-fade-in">
            <span>✨ {statusMessage}</span>
          </div>
        )}
      </aside>

      {/* Modals */}
      <HeaderEditorModal 
        isOpen={isHeaderModalOpen} 
        onClose={() => setIsHeaderModalOpen(false)} 
      />

      <ImageSessionModal 
        isOpen={isSessionModalOpen} 
        onClose={() => setIsSessionModalOpen(false)} 
      />

      <NewPageModal 
        isOpen={isNewPageModalOpen} 
        onClose={() => setIsNewPageModalOpen(false)} 
      />
    </>
  );
};

export default EditModeToolbar;
