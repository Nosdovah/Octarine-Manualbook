import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useManual } from '../context/ManualContext';
import HotspotEditorModal from './HotspotEditorModal';
import ImageSessionModal from './ImageSessionModal';
import './InteractiveImageMap.css';

const InteractiveImageMap = ({ id }) => {
  const params = useParams();
  const currentSlug = params.slug || 'introduction';

  const { 
    mapConfigs, 
    isEditMode, 
    moveHotspot, 
    addHotspot, 
    updateHotspot, 
    deleteHotspot,
    movePictureSessionInMarkdown,
    deletePictureSessionFromPage,
    deletePictureSession
  } = useManual();

  const [activeHotspot, setActiveHotspot] = useState(null);
  const [editingHotspot, setEditingHotspot] = useState(null);
  const [isHotspotModalOpen, setIsHotspotModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  // Local state for smooth, flawless, zero-lag dragging
  const [draggingHotspotId, setDraggingHotspotId] = useState(null);
  const [liveCoords, setLiveCoords] = useState(null); // { x: number, y: number }

  const imageWrapperRef = useRef(null);
  const pointerDragRef = useRef(null);

  const configId = String(id).trim();
  const config = mapConfigs[configId];

  if (!config) {
    return (
      <div className="map-error">
        Session configuration not found for: <strong>{configId}</strong>
      </div>
    );
  }

  // Flawless Pointer-Capture Dragging
  const handlePointerDown = (e, hotspot) => {
    if (!isEditMode) return;
    e.stopPropagation();
    e.preventDefault();

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {
      // fallback
    }

    pointerDragRef.current = {
      hotspotId: hotspot.id,
      pointerId: e.pointerId,
      targetEl: e.currentTarget,
      startX: e.clientX,
      startY: e.clientY,
      initialX: hotspot.x,
      initialY: hotspot.y,
      currentX: hotspot.x,
      currentY: hotspot.y,
      hasMoved: false
    };

    setDraggingHotspotId(hotspot.id);
    setLiveCoords({ x: hotspot.x, y: hotspot.y });
  };

  const handlePointerMove = (e) => {
    if (!pointerDragRef.current || !imageWrapperRef.current) return;
    e.preventDefault();

    const rect = imageWrapperRef.current.getBoundingClientRect();
    const deltaPxX = e.clientX - pointerDragRef.current.startX;
    const deltaPxY = e.clientY - pointerDragRef.current.startY;

    if (Math.hypot(deltaPxX, deltaPxY) > 4) {
      pointerDragRef.current.hasMoved = true;
    }

    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.round(Math.max(1, Math.min(99, rawX)) * 10) / 10;
    const clampedY = Math.round(Math.max(1, Math.min(99, rawY)) * 10) / 10;

    pointerDragRef.current.currentX = clampedX;
    pointerDragRef.current.currentY = clampedY;

    // Instant zero-lag visual coordinate update
    setLiveCoords({ x: clampedX, y: clampedY });
  };

  const handlePointerUp = (e) => {
    if (!pointerDragRef.current) return;
    const { hotspotId, pointerId, targetEl, hasMoved, currentX, currentY } = pointerDragRef.current;

    try {
      if (targetEl) targetEl.releasePointerCapture(pointerId);
    } catch (err) {
      // fallback
    }

    if (hasMoved) {
      // Commit the finalized position once
      moveHotspot(configId, hotspotId, currentX, currentY);
    } else {
      // Was a simple click, open edit modal
      const hs = config.hotspots?.find(h => h.id === hotspotId);
      if (hs) {
        setEditingHotspot(hs);
        setIsHotspotModalOpen(true);
      }
    }

    pointerDragRef.current = null;
    setDraggingHotspotId(null);
    setLiveCoords(null);
  };

  // Canvas Click: in Edit Mode, clicking empty space creates a new hotspot
  const handleCanvasClick = (e) => {
    if (!isEditMode || !imageWrapperRef.current) return;
    if (e.target.closest('.hotspot')) return;

    const rect = imageWrapperRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;
    const x = Math.round(Math.max(2, Math.min(98, rawX)) * 10) / 10;
    const y = Math.round(Math.max(2, Math.min(98, rawY)) * 10) / 10;

    const badge = 'Step ' + ((config.hotspots?.length || 0) + 1);
    const newHsId = addHotspot(configId, {
      x,
      y,
      badge,
      title: 'New Interface Step',
      description: 'Describe this feature or input instruction here.',
      placement: y > 50 ? 'top' : 'bottom'
    });

    setEditingHotspot({
      id: newHsId,
      x,
      y,
      badge,
      title: 'New Interface Step',
      description: 'Describe this feature or input instruction here.',
      placement: y > 50 ? 'top' : 'bottom'
    });
    setIsHotspotModalOpen(true);
  };

  const handleHotspotClick = (hotspot) => {
    if (isEditMode) return;
    setActiveHotspot(activeHotspot?.id === hotspot.id ? null : hotspot);
  };

  const handleDeleteImage = () => {
    if (window.confirm(`Remove image "${config.title || configId}" from this page?`)) {
      deletePictureSessionFromPage(currentSlug, configId);
    }
  };

  return (
    <div className={`interactive-map-container ${isEditMode ? 'map-edit-active' : ''}`}>
      {/* Edit Mode Header Toolbar for Image Block */}
      {isEditMode && (
        <div className="studio-header">
          <div className="studio-title-group">
            <span className="studio-badge">🖼️ {config.title || 'Picture Session'}</span>
            <span className="studio-hint">Drag dots seamlessly • Click dot to edit</span>
          </div>

          <div className="studio-actions-group">
            <button 
              type="button" 
              className="studio-btn"
              onClick={() => movePictureSessionInMarkdown(currentSlug, configId, 'up')}
              title="Move image block up between paragraphs"
            >
              ⬆️ Up
            </button>

            <button 
              type="button" 
              className="studio-btn"
              onClick={() => movePictureSessionInMarkdown(currentSlug, configId, 'down')}
              title="Move image block down between paragraphs"
            >
              ⬇️ Down
            </button>

            <button 
              type="button" 
              className="studio-btn"
              onClick={() => setIsSessionModalOpen(true)}
              title="Edit image session title, alt text, or replace image"
            >
              ✏️ Edit
            </button>

            <button 
              type="button" 
              className="studio-btn btn-add-hs"
              onClick={() => {
                const newHsId = addHotspot(configId, {
                  x: 50,
                  y: 50,
                  badge: 'Step ' + ((config.hotspots?.length || 0) + 1),
                  title: 'New Step Title',
                  description: 'Enter description text here.',
                  placement: 'bottom'
                });
                setEditingHotspot({ 
                  id: newHsId, 
                  x: 50, 
                  y: 50, 
                  badge: 'Step ' + ((config.hotspots?.length || 0) + 1), 
                  title: 'New Step Title', 
                  description: 'Enter description text here.', 
                  placement: 'bottom' 
                });
                setIsHotspotModalOpen(true);
              }}
              title="Add a new step indicator dot to image"
            >
              ➕ Add Dot
            </button>

            <button 
              type="button" 
              className="studio-btn btn-delete-image"
              onClick={handleDeleteImage}
              title="Delete this image session from page"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      )}

      <div 
        className={`image-wrapper ${draggingHotspotId ? 'is-dragging-dot' : ''}`}
        ref={imageWrapperRef} 
        onClick={handleCanvasClick}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ cursor: isEditMode ? (draggingHotspotId ? 'grabbing' : 'crosshair') : 'default' }}
      >
        <img 
          src={config.imageUrl} 
          alt={config.altText || config.title} 
          className="map-image" 
          draggable={false}
        />
        
        {config.hotspots?.map((hotspot) => {
          const isDraggingThis = draggingHotspotId === hotspot.id;
          const displayX = isDraggingThis && liveCoords ? liveCoords.x : hotspot.x;
          const displayY = isDraggingThis && liveCoords ? liveCoords.y : hotspot.y;

          return (
            <div 
              key={hotspot.id}
              className={`hotspot ${activeHotspot?.id === hotspot.id ? 'active' : ''} ${isEditMode ? 'hotspot-draggable' : ''} ${isDraggingThis ? 'is-active-dragging' : ''}`}
              style={{ left: `${displayX}%`, top: `${displayY}%` }}
              onPointerDown={(e) => handlePointerDown(e, hotspot)}
              onClick={(e) => {
                e.stopPropagation();
                handleHotspotClick(hotspot);
              }}
              title={isEditMode ? `${hotspot.badge}: ${hotspot.title} (Drag smoothly to position, click to edit)` : hotspot.title}
            >
              <div className="hotspot-pulse"></div>
              <div className="hotspot-dot"></div>
              
              {isEditMode && (
                <span className="hotspot-mini-badge">
                  {isDraggingThis ? `${displayX}%, ${displayY}%` : (hotspot.badge || 'Dot')}
                </span>
              )}
              
              {/* View Mode Tooltip */}
              {!isEditMode && activeHotspot?.id === hotspot.id && (() => {
                const hAlign = displayX > 68 ? 'align-right' : displayX < 32 ? 'align-left' : 'align-center';
                const vPlacement = hotspot.placement || (displayY > 65 ? 'top' : 'bottom');
                return (
                  <div 
                    className={`hotspot-tooltip placement-${vPlacement} ${hAlign}`}
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
                );
              })()}
            </div>
          );
        })}
      </div>

      <div className="map-caption">
        <p>
          {isEditMode 
            ? 'Hotspot Studio Active: Drag dots smoothly to position. Click "Finalize & Lock" when done.' 
            : 'Interactive Guide: Click the highlighted hotspot dots to view step-by-step instructions.'}
        </p>
      </div>

      {/* Hotspot Editor Modal */}
      <HotspotEditorModal 
        isOpen={isHotspotModalOpen}
        hotspot={editingHotspot}
        onClose={() => {
          setIsHotspotModalOpen(false);
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

      {/* Picture Session Editor Modal */}
      <ImageSessionModal 
        isOpen={isSessionModalOpen}
        editingMapId={configId}
        onClose={() => setIsSessionModalOpen(false)}
      />
    </div>
  );
};

export default InteractiveImageMap;
