import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useManual } from '../context/ManualContext';
import InteractiveImageMap from './InteractiveImageMap';
import './ContentViewer.css';

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
  const [editorLayout, setEditorLayout] = useState('split'); // 'split' | 'edit-only' | 'preview-only'
  const [editorSplitRatio, setEditorSplitRatio] = useState(50); // percentage (20 to 85)
  const [selectedMapToInsert, setSelectedMapToInsert] = useState('');
  const [isDragOverEditor, setIsDragOverEditor] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync state when page changes
  useEffect(() => {
    setEditorText(content);
  }, [currentSlug, content]);

  const handleTextChange = (e) => {
    const val = e.target.value;
    setEditorText(val);
    updatePageContent(currentSlug, val);
  };

  const insertSnippet = (before, after = '') => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = editorText.substring(start, end);
    const replacement = before + selected + after;
    const newText = editorText.substring(0, start) + replacement + editorText.substring(end);
    setEditorText(newText);
    updatePageContent(currentSlug, newText);
    
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 50);
  };

  const handleInsertMap = (mapIdToUse = null) => {
    const targetId = mapIdToUse || selectedMapToInsert;
    if (!targetId) {
      alert('Please choose an interactive picture session from the dropdown first.');
      return;
    }
    const snippet = `\n\n\`\`\`interactive-map\n${targetId}\n\`\`\`\n\n`;
    insertSnippet(snippet);
    showNotification(`Inserted picture session: ${targetId}`);
  };

  // Direct local file upload from machine
  const handleLocalImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const cursor = textareaRef.current ? textareaRef.current.selectionStart : null;
        await insertLocalImageSession(file, currentSlug, cursor);
      } catch (err) {
        alert('Failed to upload image: ' + err.message);
      }
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Drag-and-drop local image file over editor
  const handleEditorDragOver = (e) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverEditor(true);
  };

  const handleEditorDragLeave = (e) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverEditor(false);
  };

  const handleEditorDrop = async (e) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverEditor(false);

    // 1. If dropping a local image file from computer
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const cursor = textareaRef.current ? textareaRef.current.selectionStart : null;
        await insertLocalImageSession(file, currentSlug, cursor);
        return;
      }
    }

    // 2. If dragging a picture session chip
    const droppedMapId = e.dataTransfer.getData('text/plain');
    if (droppedMapId && mapConfigs[droppedMapId]) {
      handleInsertMap(droppedMapId);
    }
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
            <button type="button" className="tool-btn" onClick={() => insertSnippet('| Feature | Detail |\n| :--- | :--- |\n| Item 1 | Value 1 |\n')} title="Table">Table</button>
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
              <option value="">-- Insert Existing Picture --</option>
              {Object.entries(mapConfigs).map(([mId, mConf]) => (
                <option key={mId} value={mId}>{mConf.title || mId}</option>
              ))}
            </select>
            <button 
              type="button" 
              className="btn-insert-session" 
              onClick={() => handleInsertMap()}
            >
              + Insert Picture
            </button>
          </div>

          {/* Layout Controls & Width Split Slider */}
          <div className="editor-layout-controls">
            {editorLayout === 'split' && (
              <div className="split-slider-container">
                <span className="split-label">Form: {editorSplitRatio}%</span>
                <input 
                  type="range" 
                  min="20" 
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
                Editor Only
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
          <div 
            className={`editor-pane ${isDragOverEditor ? 'editor-pane-dragover' : ''}`}
            onDragOver={handleEditorDragOver}
            onDragLeave={handleEditorDragLeave}
            onDrop={handleEditorDrop}
          >
            <div className="pane-header">
              <span className="pane-title">Markdown & Content Body Form</span>
              <div className="pane-presets">
                <button type="button" className="preset-btn" onClick={() => setEditorSplitRatio(35)}>35%</button>
                <button type="button" className="preset-btn" onClick={() => setEditorSplitRatio(50)}>50%</button>
                <button type="button" className="preset-btn" onClick={() => setEditorSplitRatio(70)}>70%</button>
                <button type="button" className="preset-btn" onClick={() => setEditorSplitRatio(85)}>85%</button>
              </div>
            </div>

            {/* Quick Draggable Session Chips */}
            <div className="session-chips-bar">
              <span className="chips-title">Drag & Drop Images:</span>
              <div className="chips-scroll">
                {Object.entries(mapConfigs).map(([mId, mConf]) => (
                  <div
                    key={mId}
                    className="session-chip"
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', mId)}
                    onClick={() => handleInsertMap(mId)}
                    title="Drag into editor or click to insert between text"
                  >
                    🖼️ {mConf.title || mId}
                  </div>
                ))}
              </div>
            </div>

            <div className="textarea-wrapper">
              <textarea
                ref={textareaRef}
                className="content-textarea"
                value={editorText}
                onChange={handleTextChange}
                placeholder="Write your manual content, markdown headers, and drop local images directly between text..."
                spellCheck="false"
              />
              {isDragOverEditor && (
                <div className="drag-drop-overlay">
                  <div className="drop-badge">📸 Drop local image file here to insert seamlessly</div>
                </div>
              )}
            </div>
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
    </div>
  );
};

export default ContentViewer;
