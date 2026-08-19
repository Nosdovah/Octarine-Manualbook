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
    showNotification 
  } = useManual();

  const currentSlug = slug || 'introduction';
  const content = pagesContent[currentSlug] || `# Page Not Found\n\nThe requested guide content for \`${currentSlug}\` does not exist yet.`;

  const [editorText, setEditorText] = useState(content);
  const [editorLayout, setEditorLayout] = useState('split'); // 'split' | 'edit-only' | 'preview-only'
  const [selectedMapToInsert, setSelectedMapToInsert] = useState('');
  const textareaRef = useRef(null);

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

  const handleInsertMap = () => {
    if (!selectedMapToInsert) {
      alert('Please choose an interactive picture session from the dropdown first.');
      return;
    }
    const snippet = `\n\n\`\`\`interactive-map\n${selectedMapToInsert}\n\`\`\`\n\n`;
    insertSnippet(snippet);
    showNotification(`Inserted picture session: ${selectedMapToInsert}`);
  };

  return (
    <div className={`content-viewer ${isEditMode ? 'mode-editing' : ''}`}>
      {/* Visual Editor Toolbar when in Edit Mode */}
      {isEditMode && (
        <div className="content-editor-bar">
          <div className="editor-tools-group">
            <button type="button" className="tool-btn" onClick={() => insertSnippet('## ')} title="Heading 2">H2</button>
            <button type="button" className="tool-btn" onClick={() => insertSnippet('### ')} title="Heading 3">H3</button>
            <button type="button" className="tool-btn font-bold" onClick={() => insertSnippet('**', '**')} title="Bold">B</button>
            <button type="button" className="tool-btn font-italic" onClick={() => insertSnippet('*', '*')} title="Italic">I</button>
            <button type="button" className="tool-btn" onClick={() => insertSnippet('- ')} title="Bullet List">• List</button>
            <button type="button" className="tool-btn" onClick={() => insertSnippet('1. ')} title="Numbered List">1. List</button>
            <button type="button" className="tool-btn" onClick={() => insertSnippet('> [!IMPORTANT]\n> ')} title="Important Alert">⚠️ Alert</button>
            <button type="button" className="tool-btn" onClick={() => insertSnippet('> [!TIP]\n> ')} title="Tip Callout">💡 Tip</button>
            <button type="button" className="tool-btn" onClick={() => insertSnippet('| Feature | Detail |\n| :--- | :--- |\n| Item 1 | Value 1 |\n')} title="Table">📊 Table</button>
          </div>

          {/* Picture Session Insertion */}
          <div className="editor-insert-map-group">
            <select 
              value={selectedMapToInsert} 
              onChange={(e) => setSelectedMapToInsert(e.target.value)}
              className="map-picker-select"
            >
              <option value="">-- Insert Picture Session --</option>
              {Object.entries(mapConfigs).map(([mId, mConf]) => (
                <option key={mId} value={mId}>{mConf.title || mId}</option>
              ))}
            </select>
            <button 
              type="button" 
              className="btn-insert-session" 
              onClick={handleInsertMap}
            >
              + Insert Picture
            </button>
          </div>

          {/* Layout Controls */}
          <div className="editor-layout-group">
            <button 
              type="button" 
              className={`layout-btn ${editorLayout === 'split' ? 'active' : ''}`}
              onClick={() => setEditorLayout('split')}
              title="Side-by-side Editor and Live Preview"
            >
              Split View
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
      )}

      {/* Editor Body Grid */}
      <div className={`content-body-grid layout-${editorLayout} ${isEditMode ? 'grid-editing' : ''}`}>
        {/* Editor Pane (Only in Edit Mode) */}
        {isEditMode && editorLayout !== 'preview-only' && (
          <div className="editor-pane">
            <div className="pane-header">
              <span className="pane-title">📝 Markdown & Content Body Form</span>
              <span className="pane-hint">Live auto-saving to local storage</span>
            </div>
            <textarea
              ref={textareaRef}
              className="content-textarea"
              value={editorText}
              onChange={handleTextChange}
              placeholder="Write your manual content, markdown headers, and insert interactive picture sessions here..."
              spellCheck="false"
            />
          </div>
        )}

        {/* Live Preview / Rendered Markdown Pane */}
        {(!isEditMode || editorLayout !== 'edit-only') && (
          <div className="preview-pane">
            {isEditMode && (
              <div className="pane-header preview-header">
                <span className="pane-title">👁️ Live Rendered Preview</span>
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
