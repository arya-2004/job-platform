import React, { useState, useEffect } from 'react';
import axios from 'axios';

function StatusUpdate() {
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/tracker/applications`)
      .then(res => setApplications(res.data));
  }, []);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      axios.patch(
  `${process.env.REACT_APP_API_URL}/tracker/applications/${applicationId}/status`,
  { status: newStatus }
);
      setApplications(prev => prev.map(app =>
        app.application_id === applicationId ? { ...app, status: newStatus } : app
      ));
      setMessage('Updated');
      setTimeout(() => setMessage(''), 2000);
    } catch { setMessage('Failed'); }
  };

  const statusColors = { applied: '#3498db', interview: '#f39c12', offer: '#27ae60', rejected: '#e74c3c' };

  return (
    <div className="page">
      <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '12px' }}>Step 03</p>
      <h1 style={{ fontFamily: 'Playfair Display', fontSize: '48px', fontWeight: 900, lineHeight: 1.1, marginBottom: '8px' }}>
        Track Status
      </h1>
      <p style={{ color: 'var(--gray)', marginBottom: '48px', fontSize: '15px' }}>Update where you are in each application process.</p>

      {message && (
        <div style={{ padding: '10px 16px', background: '#d5f5e3', borderRadius: '6px', marginBottom: '24px', fontSize: '13px', color: '#27ae60' }}>
          ✓ {message}
        </div>
      )}

      {applications.map(app => (
        <div key={app.application_id} style={{
          padding: '20px 24px', marginBottom: '10px',
          border: '1px solid var(--border)', borderRadius: '8px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderLeft: `3px solid ${statusColors[app.status] || '#ccc'}`
        }}>
          <div>
            <p style={{ fontWeight: 500, marginBottom: '2px' }}>{app.job_title}
              {app.company && <span style={{ color: 'var(--gray)', fontWeight: 400 }}> @ {app.company}</span>}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--gray)' }}>Match: {app.match_score}%</p>
          </div>
          <select value={app.status} onChange={e => handleStatusChange(app.application_id, e.target.value)}
            style={{
              padding: '8px 14px', borderRadius: '6px', border: '1px solid var(--border)',
              fontSize: '13px', fontFamily: 'DM Sans', cursor: 'pointer',
              background: 'var(--white)', outline: 'none'
            }}>
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      ))}
    </div>
  );
}

export default StatusUpdate;