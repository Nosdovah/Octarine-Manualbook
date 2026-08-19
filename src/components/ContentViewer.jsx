import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useManual } from '../context/ManualContext';
import InteractiveImageMap from './InteractiveImageMap';
import ImageSessionModal from './ImageSessionModal';
import './ContentViewer.css';

// Helper: Parse markdown string into structured text and image sections
const parseMarkdownToSections = (markdown) => {
  if (!markdown || !markdown.trim()) {
    return [{ id: 'sec-1', type: 'text', content: '' }];
  }

  const regex = /```interactive-map\s*([\w-]+)\s*```/g;
  const sections = [];
  let lastIndex = 0;
  let match;
  let counter = 0;

  while ((match = regex.exec(markdown)) !== null) {
    const textBefore = markdown.substring(lastIndex, match.index).trim();
    if (textBefore) {
      sections.push({
        id: `sec-txt-${++counter}`,
        type: 'text',
        content: textBefore
      });
    }
    sections.push({
      id: `sec-img-${++counter}`,
      type: 'image',
      mapId: match[1].trim()
    });
    lastIndex = regex.lastIndex;
  }

  const remainingText = markdown.substring(lastIndex).trim();
  if (remainingText || sections.length === 0) {
    sections.push({
      id: `sec-txt-${++counter}`,
      type: 'text',
      content: remainingText
    });
  }

  return sections;
};

// Helper: Serialize sections back to markdown string
const sectionsToMarkdown = (sections) => {
  return sections
    .map((sec) => {
      if (sec.type === 'text') {
        return sec.content ? sec.content.trim() : '';
      } else if (sec.type === 'image') {
        return `\`\`\`interactive-map\n${sec.mapId}\n\`\`\``;
      }
      return '';
    })
    .filter(Boolean)
    .join('\n\n');
};

const ContentViewer = ({ slug }) => {
  const { 
    pagesContent, 
    updatePageContent, 
    mapConfigs, 
    isEditMode,
    isSidebarOpen,
    insertLocalImageSession,
    showNotification 
  } = useManual();

  const currentSlug = slug || 'introduction';
  const content = pagesContent[currentSlug] || `# Page Not Found\n\nThe requested guide content for \`${currentSlug}\` does not exist yet.`;

  const [editorText, setEditorText] = useState(content);
  const [sections, setSections] = useState(() => parseMarkdownToSections(content));
  const [formTab, setFormTab] = useState('sections'); // 'sections' | 'raw'
  const [editorLayout, setEditorLayout] = useState('split'); // 'split' | 'edit-only' | 'preview-only'
  const [editorSplitRatio, setEditorSplitRatio] = useState(50); // percentage
  const [selectedMapToInsert, setSelectedMapToInsert] = useState('');
  const [isDragOverEditor, setIsDragOverEditor] = useState(false);
  const [editingModalMapId, setEditingModalMapId] = useState(null);
  const [draggedSectionIndex, setDraggedSectionIndex] = useState(null);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync state when page changes
  useEffect(() => {
    setEditorText(content);
    setSections(parseMarkdownToSections(content));
  }, [currentSlug, content]);

  // Synchronize state changes from raw textarea
  const handleRawTextChange = (e) => {
    const val = e.target.value;
    setEditorText(val);
    setSections(parseMarkdownToSections(val));
    updatePageContent(currentSlug, val);
  };

  // Synchronize state changes from sections
  const updateSectionsAndContent = (newSections) => {
    setSections(newSections);
    const md = sectionsToMarkdown(newSections);
    setEditorText(md);
    updatePageContent(currentSlug, md);
  };

  // Section: Update Text
  const handleSectionTextChange = (id, newContent) => {
    const updated = sections.map(sec => sec.id === id ? { ...sec, content: newContent } : sec);
    updateSectionsAndContent(updated);
  };

  // Section: Move Section Up
  const moveSectionUp = (index) => {
    if (index <= 0) return;
    const updated = [...sections];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    updateSectionsAndContent(updated);
    showNotification('Moved section up');
  };

  // Section: Move Section Down
  const moveSectionDown = (index) => {
    if (index >= sections.length - 1) return;
    const updated = [...sections];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    updateSectionsAndContent(updated);
    showNotification('Moved section down');
  };

  // Section: Delete Section
  const deleteSection = (index) => {
    if (sections.length <= 1) {
      updateSectionsAndContent([{ id: 'sec-1', type: 'text', content: '' }]);
      return;
    }
    const updated = sections.filter((_, idx) => idx !== index);
    updateSectionsAndContent(updated);
    showNotification('Removed section');
  };

  // Section: Insert Text at position
  const insertTextSectionAt = (index) => {
    const newSec = { id: 'sec-txt-' + Date.now(), type: 'text', content: '## New Section Heading\n\nEnter explanation text here...' };
    const updated = [...sections];
    updated.splice(index + 1, 0, newSec);
    updateSectionsAndContent(updated);
    showNotification('Added text section');
  };

  // Section: Insert Image at position
  const insertImageSectionAt = (index, mapId) => {
    const targetMapId = mapId || selectedMapToInsert;
    if (!targetMapId) {
      alert('Please select an existing picture session or upload a local image file.');
      return;
    }
    const newSec = { id: 'sec-img-' + Date.now(), type: 'image', mapId: targetMapId };
    const updated = [...sections];
    updated.splice(index + 1, 0, newSec);
    updateSectionsAndContent(updated);
    showNotification('Inserted image section: ' + targetMapId);
  };

  // Insert snippet in raw textarea
  const insertSnippet = (before, after = '') => {
    if (formTab === 'sections') {
      // In sections mode, append or prepend to active or last text section
      const lastTextIdx = sections.map((s, i) => s.type === 'text' ? i : -1).filter(i => i >= 0).pop();
      if (lastTextIdx !== undefined && lastTextIdx >= 0) {
        const updated = [...sections];
        updated[lastTextIdx] = {
          ...updated[lastTextIdx],
          content: updated[lastTextIdx].content + '\n\n' + before + after
        };
        updateSectionsAndContent(updated);
        return;
      }
    }

    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = editorText.substring(start, end);
    const replacement = before + selected + after;
    const newText = editorText.substring(0, start) + replacement + editorText.substring(end);
    setEditorText(newText);
    setSections(parseMarkdownToSections(newText));
    updatePageContent(currentSlug, newText);
    
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 50);
  };

  // Direct local file upload from machine
  const handleLocalImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const newMapId = await insertLocalImageSession(file, currentSlug);
        if (newMapId) {
          setSections(parseMarkdownToSections(pagesContent[currentSlug] || ''));
        }
      } catch (err) {
        alert('Failed to upload image: ' + err.message);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Drag & Drop reordering of sections
  const handleSectionDragStart = (e, index) => {
    setDraggedSectionIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSectionDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleSectionDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedSectionIndex === null || draggedSectionIndex === targetIndex) return;
    const updated = [...sections];
    const [moved] = updated.splice(draggedSectionIndex, 1);
    updated.splice(targetIndex, 0, moved);
    updateSectionsAndContent(updated);
    setDraggedSectionIndex(null);
    showNotification('Reordered section');
  };

  return (
    <div className={`content-viewer ${isSidebarOpen ? 'with-sidebar' : 'full-width'} ${isEditMode ? 'mode-editing' : ''}`}>
      {/* Visual Editor Toolbar when in Edit Mode */}
      {isEditMode && (
        <div className="content-editor-bar">
          <div className="editor-tools-group">
            <button type="button" className="tool-btn" onClick={() => insertSnippet('## ')} title="Heading 2">H2</button>
            <button type="button" className="tool-btn" onClick={() => insertSnippet('### ')} title="Heading 3">H3</button>
            <button type="button" className="tool-btn font-bold" onClick={() => insertSnippet('**', '**')} title="Bold">B</button>
            <button type="button" className="tool-btn font-italic" onClick={() => insertSnippet('*', '*')} title="Italic">I</button>
            <button type="button" className="tool-btn" onClick={() => insertSnippet('- ')} title="Bullet List">List</button>
            <button type="button" className="tool-btn" onClick={() => insertSnippet('1. ')} title="Numbered List">1. List</button>
            <button type="button" className="tool-btn" onClick={() => insertSnippet('> [!IMPORTANT]\n> ')} title="Important Alert">Alert</button>
            <button type="button" className="tool-btn" onClick={() => insertSnippet('> [!TIP]\n> ')} title="Tip Callout">Tip</button>
          </div>

          {/* Local File Upload & Session Insertion */}
          <div className="editor-insert-map-group">
            <button 
              type="button" 
              className="btn-upload-local-file" 
              onClick={() => fileInputRef.current?.click()}
              title="Upload an image file directly from your local computer"
            >
              📁 Upload Local Image
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={handleLocalImageSelect} 
              style={{ display: 'none' }} 
            />

            <select 
              value={selectedMapToInsert} 
              onChange={(e) => setSelectedMapToInsert(e.target.value)}
              className="map-picker-select"
            >
              <option value="">-- Choose Picture Session --</option>
              {Object.entries(mapConfigs).map(([mId, mConf]) => (
                <option key={mId} value={mId}>{mConf.title || mId}</option>
              ))}
            </select>
            <button 
              type="button" 
              className="btn-insert-session" 
              onClick={() => insertImageSectionAt(sections.length - 1, selectedMapToInsert)}
            >
              + Insert Section
            </button>
          </div>

          {/* Layout Controls & Width Split Slider */}
          <div className="editor-layout-controls">
            {editorLayout === 'split' && (
              <div className="split-slider-container">
                <span className="split-label">Form: {editorSplitRatio}%</span>
                <input 
                  type="range" 
                  min="25" 
                  max="85" 
                  value={editorSplitRatio} 
                  onChange={(e) => setEditorSplitRatio(Number(e.target.value))}
                  className="split-slider-input"
                  title="Slide left or right to adjust editor vs preview width"
                />
              </div>
            )}

            <div className="editor-layout-group">
              <button 
                type="button" 
                className={`layout-btn ${editorLayout === 'split' ? 'active' : ''}`}
                onClick={() => setEditorLayout('split')}
                title="Side-by-side Editor and Live Preview"
              >
                Split
              </button>
              <button 
                type="button" 
                className={`layout-btn ${editorLayout === 'edit-only' ? 'active' : ''}`}
                onClick={() => setEditorLayout('edit-only')}
                title="Editor only"
              >
                Form Only
              </button>
              <button 
                type="button" 
                className={`layout-btn ${editorLayout === 'preview-only' ? 'active' : ''}`}
                onClick={() => setEditorLayout('preview-only')}
                title="Preview only"
              >
                Preview Only
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Body Grid */}
      <div 
        className={`content-body-grid layout-${editorLayout} ${isEditMode ? 'grid-editing' : ''}`}
        style={
          isEditMode && editorLayout === 'split' 
            ? { gridTemplateColumns: `${editorSplitRatio}% calc(100% - ${editorSplitRatio}% - 20px)` }
            : {}
        }
      >
        {/* Editor Pane (Only in Edit Mode) */}
        {isEditMode && editorLayout !== 'preview-only' && (
          <div className="editor-pane">
            <div className="pane-header">
              <div className="pane-tabs-group">
                <button 
                  type="button" 
                  className={`tab-switch-btn ${formTab === 'sections' ? 'active' : ''}`}
                  onClick={() => setFormTab('sections')}
                  title="Modular Visual Sections with Image drag & move"
                >
                  🧩 Visual Sections Flow
                </button>
                <button 
                  type="button" 
                  className={`tab-switch-btn ${formTab === 'raw' ? 'active' : ''}`}
                  onClick={() => setFormTab('raw')}
                  title="Raw Markdown Source Editor"
                >
                  📝 Raw Markdown
                </button>
              </div>

              <div className="pane-presets">
                <button type="button" className="preset-btn" onClick={() => setEditorSplitRatio(35)}>35%</button>
                <button type="button" className="preset-btn" onClick={() => setEditorSplitRatio(50)}>50%</button>
                <button type="button" className="preset-btn" onClick={() => setEditorSplitRatio(70)}>70%</button>
                <button type="button" className="preset-btn" onClick={() => setEditorSplitRatio(85)}>85%</button>
              </div>
            </div>

            {/* TAB 1: MODULAR VISUAL SECTIONS (IMAGE SECTIONS MOVE UP/DOWN SEAMLESSLY) */}
            {formTab === 'sections' ? (
              <div className="sections-flow-container">
                <div className="sections-intro-tip">
                  <span>💡 <strong>Modular Sections:</strong> Move images up or down between text paragraphs effortlessly with ⬆️/⬇️ or drag the handle.</span>
                </div>

                <div className="sections-list">
                  {sections.map((section, idx) => {
                    const isFirst = idx === 0;
                    const isLast = idx === sections.length - 1;

                    if (section.type === 'image') {
                      const conf = mapConfigs[section.mapId] || {};
                      return (
                        <div 
                          key={section.id} 
                          className="section-card image-section-card"
                          draggable
                          onDragStart={(e) => handleSectionDragStart(e, idx)}
                          onDragOver={(e) => handleSectionDragOver(e, idx)}
                          onDrop={(e) => handleSectionDrop(e, idx)}
                        >
                          <div className="section-card-header">
                            <div className="section-card-title-wrap">
                              <span className="section-drag-handle" title="Drag to move section">⋮⋮</span>
                              <span className="section-type-badge image-badge">🖼️ Picture Section</span>
                              <span className="image-session-name" title={conf.title || section.mapId}>
                                {conf.title || section.mapId}
                              </span>
                            </div>

                            <div className="section-action-btns">
                              <button 
                                type="button" 
                                className="sec-btn" 
                                disabled={isFirst}
                                onClick={() => moveSectionUp(idx)}
                                title="Move image section above previous text"
                              >
                                ⬆️ Move Up
                              </button>
                              <button 
                                type="button" 
                                className="sec-btn" 
                                disabled={isLast}
                                onClick={() => moveSectionDown(idx)}
                                title="Move image section below next text"
                              >
                                ⬇️ Move Down
                              </button>
                              <button 
                                type="button" 
                                className="sec-btn" 
                                onClick={() => setEditingModalMapId(section.mapId)}
                                title="Edit title or replace image"
                              >
                                ✏️ Edit
                              </button>
                              <button 
                                type="button" 
                                className="sec-btn sec-btn-delete" 
                                onClick={() => deleteSection(idx)}
                                title="Remove this image section from page"
                              >
                                🗑️ Remove
                              </button>
                            </div>
                          </div>

                          <div className="image-section-body">
                            {conf.imageUrl && (
                              <div className="image-sec-thumbnail-wrap">
                                <img src={conf.imageUrl} alt={conf.altText || conf.title} className="image-sec-thumbnail" />
                              </div>
                            )}
                            <div className="image-sec-info">
                              <span className="image-sec-hotspot-count">
                                📍 <strong>{conf.hotspots?.length || 0}</strong> interactive step dots configured
                              </span>
                              <span className="image-sec-hint">
                                Rendered dynamically in live preview on the right.
                              </span>
                            </div>
                          </div>

                          {/* Quick insertion strip after this card */}
                          <div className="section-insert-strip">
                            <button 
                              type="button" 
                              className="insert-strip-btn"
                              onClick={() => insertTextSectionAt(idx)}
                            >
                              + Add Paragraph Below
                            </button>
                          </div>
                        </div>
                      );
                    }

                    // TEXT SECTION
                    return (
                      <div 
                        key={section.id} 
                        className="section-card text-section-card"
                        draggable
                        onDragStart={(e) => handleSectionDragStart(e, idx)}
                        onDragOver={(e) => handleSectionDragOver(e, idx)}
                        onDrop={(e) => handleSectionDrop(e, idx)}
                      >
                        <div className="section-card-header">
                          <div className="section-card-title-wrap">
                            <span className="section-drag-handle" title="Drag to move section">⋮⋮</span>
                            <span className="section-type-badge text-badge">📝 Text Section</span>
                            <span className="section-char-count">{section.content.length} chars</span>
                          </div>

                          <div className="section-action-btns">
                            <button 
                              type="button" 
                              className="sec-btn" 
                              disabled={isFirst}
                              onClick={() => moveSectionUp(idx)}
                              title="Move text section up"
                            >
                              ⬆️ Up
                            </button>
                            <button 
                              type="button" 
                              className="sec-btn" 
                              disabled={isLast}
                              onClick={() => moveSectionDown(idx)}
                              title="Move text section down"
                            >
                              ⬇️ Down
                            </button>
                            <button 
                              type="button" 
                              className="sec-btn sec-btn-delete" 
                              onClick={() => deleteSection(idx)}
                              title="Delete text block"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        <div className="text-section-body">
                          <textarea
                            className="section-textarea"
                            value={section.content}
                            onChange={(e) => handleSectionTextChange(section.id, e.target.value)}
                            placeholder="Write headings, markdown, or step instructions for this section..."
                            rows={Math.max(4, Math.min(18, (section.content.match(/\n/g) || []).length + 3))}
                          />
                        </div>

                        {/* Quick insertion strip after this card */}
                        <div className="section-insert-strip">
                          <button 
                            type="button" 
                            className="insert-strip-btn"
                            onClick={() => insertTextSectionAt(idx)}
                          >
                            + Add Paragraph Below
                          </button>
                          {selectedMapToInsert && (
                            <button 
                              type="button" 
                              className="insert-strip-btn insert-img-btn"
                              onClick={() => insertImageSectionAt(idx, selectedMapToInsert)}
                            >
                              + Insert "{mapConfigs[selectedMapToInsert]?.title || selectedMapToInsert}" Here
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* TAB 2: RAW MARKDOWN TEXTAREA */
              <div className="textarea-wrapper">
                <textarea
                  ref={textareaRef}
                  className="content-textarea"
                  value={editorText}
                  onChange={handleRawTextChange}
                  placeholder="Write your manual content, markdown headers, and insert interactive picture sessions here..."
                  spellCheck="false"
                />
              </div>
            )}
          </div>
        )}

        {/* Live Preview / Rendered Markdown Pane */}
        {(!isEditMode || editorLayout !== 'edit-only') && (
          <div className="preview-pane">
            {isEditMode && (
              <div className="pane-header preview-header">
                <span className="pane-title">Live Rendered Preview</span>
                <span className="pane-hint">Real-time dynamic display</span>
              </div>
            )}
            
            <div className="content-inner markdown-body animate-fade-in">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-([\w-]+)/.exec(className || '');
                    if (!inline && match && match[1] === 'interactive-map') {
                      return <InteractiveImageMap id={String(children).replace(/\n$/, '')} />;
                    }
                    return <code className={className} {...props}>{children}</code>;
                  }
                }}
              >
                {editorText}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Picture Session Editor Modal */}
      {editingModalMapId && (
        <ImageSessionModal 
          isOpen={Boolean(editingModalMapId)}
          editingMapId={editingModalMapId}
          onClose={() => setEditingModalMapId(null)}
        />
      )}
    </div>
  );
};

export default ContentViewer;
