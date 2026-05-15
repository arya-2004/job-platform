import React, { useState } from 'react';
import ResumeUpload from './components/ResumeUpload';
import JobAnalyze from './components/JobAnalyze';
import Dashboard from './components/Dashboard';
import StatusUpdate from './components/StatusUpdate';
import './App.css';

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [resumeId, setResumeId] = useState(() => {
  const saved = localStorage.getItem('resumeId');
  return saved ? parseInt(saved) : null;
});

  const renderPage = () => {
    switch(activePage) {
      case 'upload': return <ResumeUpload setResumeId={setResumeId} />;
      case 'analyze': return <JobAnalyze resumeId={resumeId} />;
      case 'status': return <StatusUpdate />;
      default: return <Dashboard />;
    }
  };

  const navItems = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'upload', label: 'Upload Resume' },
    { key: 'analyze', label: 'Analyze Job' },
    { key: 'status', label: 'Track Status' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--white)' }}>

      {/* Top header bar */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        padding: '0 60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
        position: 'sticky',
        top: 0,
        background: 'var(--white)',
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{
            fontFamily: 'Playfair Display',
            fontSize: '22px',
            fontWeight: 900,
            letterSpacing: '-0.5px'
          }}>JobLens</span>
          <span style={{ fontSize: '11px', color: 'var(--gray)', letterSpacing: '2px', textTransform: 'uppercase' }}>AI</span>
        </div>

        <nav style={{ display: 'flex', gap: '4px' }}>
          {navItems.map(item => (
            <button key={item.key} onClick={() => setActivePage(item.key)}
              style={{
                padding: '6px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
                fontFamily: 'DM Sans',
                fontWeight: activePage === item.key ? 500 : 400,
                background: activePage === item.key ? 'var(--black)' : 'transparent',
                color: activePage === item.key ? 'var(--white)' : 'var(--gray)',
                transition: 'all 0.2s ease',
              }}>
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Page content */}
      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '60px 20px' }}>
        {renderPage()}
      </main>
    </div>
  );
}

export default App;