import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useManual } from '../context/ManualContext';
import HeaderEditorModal from './HeaderEditorModal';
import './Header.css';

const Header = () => {
  const { headerConfig, isEditMode } = useManual();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    logoText = 'Octarine.',
    logoSubtext = 'Eau De Parfum',
    marqueeText = 'NEW ARRIVALS EVERY WEEK • EXCLUSIVE FRAGRANCE COLLECTIONS • CAPTIVATE WITH EVERY SPRAY • ',
    navLinks = []
  } = headerConfig || {};

  return (
    <>
      <header className={`octarine-header ${isEditMode ? 'header-editing' : ''}`}>
        <div className="header-container">
          <div className="logo-section">
            <Link to="/" className="logo-link">
              <span className="logo-text">{logoText}</span>
              {logoSubtext && <span className="logo-subtext-badge">{logoSubtext}</span>}
            </Link>
          </div>
          
          <nav className="main-nav">
            <ul className="nav-list">
              {navLinks.map((link) => (
                <li key={link.id} className={link.url === '/manual/introduction' || link.url === '/' ? 'active-nav' : ''}>
                  {link.isExternal ? (
                    <a href={link.url} target="_blank" rel="noreferrer">
                      {link.label}
                    </a>
                  ) : (
                    <Link to={link.url}>
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="icons-section">
            {isEditMode && (
              <button 
                type="button" 
                className="btn-edit-header-nav"
                onClick={() => setIsModalOpen(true)}
                title="Edit Navbar Links, Logo & Marquee"
              >
                Edit Navbar
              </button>
            )}
          </div>
        </div>
        
        <div className="marquee-container">
          <div className="marquee-content">
            <span>{marqueeText}</span>
            <span>{marqueeText}</span>
          </div>
        </div>
      </header>

      {/* Header Editor Modal */}
      <HeaderEditorModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default Header;
