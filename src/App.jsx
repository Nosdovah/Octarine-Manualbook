import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ManualProvider } from './context/ManualContext';
import Manual from './pages/Manual';
import './App.css';

function App() {
  return (
    <ManualProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/manual/introduction" replace />} />
          <Route path="/manual" element={<Navigate to="/manual/introduction" replace />} />
          <Route path="/manual/:slug" element={<Manual />} />
        </Routes>
      </BrowserRouter>
    </ManualProvider>
  );
}

export default App;
