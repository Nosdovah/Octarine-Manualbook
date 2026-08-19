import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import EditModeToolbar from './EditModeToolbar';

const Layout = ({ children }) => {
  return (
    <div className="app-container">
      <Header />
      <div className="main-content">
        <Sidebar />
        {children}
      </div>
      <EditModeToolbar />
    </div>
  );
};

export default Layout;
