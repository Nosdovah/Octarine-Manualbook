import React, { useState, useRef } from 'react';
import { useManual } from '../context/ManualContext';
import HotspotEditorModal from './HotspotEditorModal';
import './InteractiveImageMap.css';

const InteractiveImageMap = ({ id }) => {
  const { mapConfigs, isEditMode, moveHotspot, addHotspot, updateHotspot, deleteHotspot, showNotification } = useManual();
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [editingHotspot, setEditingHotspot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const imageWrapperRef = useRef(null);
  const dragInfoRef = useRef(null);

  const configId = String(id).trim();
  const config = mapConfigs[configId];

  if (!config) {
    return (
      <div className="map-error">
        Session configuration not found for: <strong>{configId}</strong>
      </div>
    );
  }

  // Handle Dragging in Edit Mode
  const handleMouseDown = (e, hotspot) => {
    if (!isEditMode) return;
    e.stopPropagation();
    
    dragInfoRef.current = {
      hotspotId: hotspot.id,
      startX: e.clientX,
      startY: e.clientY,
      initialX: hotspot.x,
      initialY: hotspot.y,
      hasMoved: false
    };

    const handleMouseMove = (moveEvent) => {
      if (!dragInfoRef.current || !imageWrapperRef.current) return;
      const rect = imageWrapperRef.current.getBoundingClientRect();
      const deltaX = moveEvent.clientX - dragInfoRef.current.startX;
      const deltaY = moveEvent.clientY - dragInfoRef.current.startY;

      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        dragInfoRef.current.hasMoved = true;
      }

      const rawX = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      const rawY = ((moveEvent.clientY - rect.top) / rect.height) * 100;

      const clampedX = Math.max(2, Math.min(98, rawX));
      const clampedY = Math.max(2, Math.min(98, rawY));

      moveHotspot(configId, dragInfoRef.current.hotspotId, clampedX, clampedY);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      if (dragInfoRef.current && !dragInfoRef.current.hasMoved) {
        // Was a simple click, open edit modal
        setEditingHotspot(hotspot);
        setIsModalOpen(true);
      }
      dragInfoRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Canvas Click: in Edit Mode, clicking empty space creates a new hotspot
  const handleCanvasClick = (e) => {
    if (!isEditMode || !imageWrapperRef.current) return;
    
    // Ignore if click was on a hotspot
    if (e.target.closest('.hotspot')) return;

    const rect = imageWrapperRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;
    const x = Math.max(2, Math.min(98, rawX));
    const y = Math.max(2, Math.min(98, rawY));

    const newHsId = addHotspot(configId, {
      x,
      y,
      badge: 'Step ' + ((config.hotspots?.length || 0) + 1),
      title: 'New Interface Step',
      description: 'Describe this feature or input instruction here.',
      placement: y > 50 ? 'top' : 'bottom'
    });

    const created = {
      id: newHsId,
      x,
      y,
      badge: 'Step ' + ((config.hotspots?.length || 0) + 1),
      title: 'New Interface Step',
      description: 'Describe this feature or input instruction here.',
      placement: y > 50 ? 'top' : 'bottom'
    };

    setEditingHotspot(created);
    setIsModalOpen(true);
  };

  const handleHotspotClick = (hotspot) => {
    if (isEditMode) return; // In edit mode, mousedown/mouseup handles editing
    setActiveHotspot(activeHotspot?.id === hotspot.id ? null : hotspot);
  };

  return (
    <div className={`interactive-map-container ${isEditMode ? 'map-edit-active' : ''}`}>
      {isEditMode && (
        <div className="map-studio-toolbar">
          <div className="studio-info">
            <span className="studio-badge">Hotspot Studio</span>
            <span className="studio-tip">Click image to add dot • Drag dots to reposition • Click dot to edit info</span>
          </div>
          <button 
            type="button" 
            className="btn-add-hs"
            onClick={() => {
              const newHsId = addHotspot(configId, {
                x: 50,
                y: 50,
                badge: 'Step ' + ((config.hotspots?.length || 0) + 1),
                title: 'New Step Title',
                description: 'Enter description text here.',
                placement: 'bottom'
              });
              setEditingHotspot({ id: newHsId, x: 50, y: 50, badge: 'Step ' + ((config.hotspots?.length || 0) + 1), title: 'New Step Title', description: 'Enter description text here.', placement: 'bottom' });
              setIsModalOpen(true);
            }}
          >
            + Add Step Dot
          </button>
        </div>
      )}

      <div 
        className="image-wrapper" 
        ref={imageWrapperRef} 
        onClick={handleCanvasClick}
        style={{ cursor: isEditMode ? 'crosshair' : 'default' }}
      >
        <img src={config.imageUrl} alt={config.altText || config.title} className="map-image" />
        
        {config.hotspots?.map((hotspot) => (
          <div 
            key={hotspot.id}
            className={`hotspot ${activeHotspot?.id === hotspot.id ? 'active' : ''} ${isEditMode ? 'hotspot-draggable' : ''}`}
            style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
            onMouseDown={(e) => handleMouseDown(e, hotspot)}
            onClick={(e) => {
              e.stopPropagation();
              handleHotspotClick(hotspot);
            }}
            title={isEditMode ? `${hotspot.badge}: ${hotspot.title} (Drag to move, click to edit)` : hotspot.title}
          >
            <div className="hotspot-pulse"></div>
            <div className="hotspot-dot"></div>
            
            {isEditMode && (
              <span className="hotspot-mini-badge">{hotspot.badge || '📍'}</span>
            )}
            
            {/* View Mode Tooltip */}
            {!isEditMode && activeHotspot?.id === hotspot.id && (
              <div 
                className={`hotspot-tooltip placement-${hotspot.placement || 'bottom'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="tooltip-header">
                  <span className="tooltip-badge">{hotspot.badge || 'Step Info'}</span>
                  <button 
                    className="close-tooltip" 
                    onClick={(e) => { e.stopPropagation(); setActiveHotspot(null); }}
                    aria-label="Close tooltip"
                  >
                    &times;
                  </button>
                </div>
                <h4>{hotspot.title}</h4>
                <p>{hotspot.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="map-caption">
        <span className="map-caption-icon">💡</span>
        <p>
          {isEditMode 
            ? 'Hotspot Studio Active: Changes are automatically saved. Click "Save & Lock" when done.' 
            : 'Interactive Guide: Click the highlighted hotspot dots to view step-by-step instructions.'}
        </p>
      </div>

      {/* Hotspot Editor Modal */}
      <HotspotEditorModal 
        isOpen={isModalOpen}
        hotspot={editingHotspot}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHotspot(null);
        }}
        onSave={(updatedFields) => {
          if (editingHotspot) {
            updateHotspot(configId, editingHotspot.id, updatedFields);
          }
        }}
        onDelete={(hotspotId) => {
          deleteHotspot(configId, hotspotId);
        }}
      />
    </div>
  );
};

export default InteractiveImageMap;
