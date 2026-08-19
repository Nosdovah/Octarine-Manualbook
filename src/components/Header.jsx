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
                ✏️ Edit Navbar
              </button>
            )}

            <button className="icon-btn" aria-label="Search">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
            <button className="icon-btn" aria-label="Account">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>
            <button className="icon-btn" aria-label="Wishlist">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
            <button className="icon-btn cart-btn" aria-label="Cart">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span className="cart-badge">0</span>
            </button>
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
