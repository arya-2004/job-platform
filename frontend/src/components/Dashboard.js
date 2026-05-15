import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/tracker/applications`)
      .then(res => { setApplications(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const statusConfig = {
    applied:   { color: '#3498db', label: 'Applied' },
    interview: { color: '#f39c12', label: 'Interview' },
    offer:     { color: '#27ae60', label: 'Offer' },
    rejected:  { color: '#e74c3c', label: 'Rejected' },
  };

  if (loading) return <p style={{ color: 'var(--gray)' }}>Loading...</p>;

  return (
    <div className="page">
      <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '12px' }}>Overview</p>
      <h1 style={{ fontFamily: 'Playfair Display', fontSize: '48px', fontWeight: 900, lineHeight: 1.1, marginBottom: '8px' }}>
        Your Applications
      </h1>
      <p style={{ color: 'var(--gray)', marginBottom: '48px', fontSize: '15px' }}>{applications.length} total tracked</p>

      {applications.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '8px' }}>
          <p style={{ fontFamily: 'Playfair Display', fontSize: '24px', marginBottom: '8px' }}>Nothing here yet</p>
          <p style={{ color: 'var(--gray)', fontSize: '14px' }}>Upload a resume and analyze a job to get started.</p>
        </div>
      ) : (
        applications.map(app => (
          <div key={app.application_id} style={{
            padding: '24px 28px', marginBottom: '12px',
            border: '1px solid var(--border)', borderRadius: '8px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            transition: 'box-shadow 0.2s',
          }}
            onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)'}
            onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <div>
              <p style={{ fontWeight: 500, fontSize: '16px', marginBottom: '4px' }}>
                {app.job_title} {app.company ? <span style={{ color: 'var(--gray)', fontWeight: 400 }}>@ {app.company}</span> : ''}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--gray)' }}>{app.resume_filename}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '28px', fontFamily: 'Playfair Display', fontWeight: 700,
                  color: app.match_score >= 70 ? '#27ae60' : app.match_score >= 50 ? '#f39c12' : '#e74c3c' }}>
                  {app.match_score}%
                </p>
              </div>
              <span style={{
                padding: '4px 14px', borderRadius: '20px', fontSize: '11px',
                letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 500,
                background: statusConfig[app.status]?.color || '#ccc',
                color: 'white'
              }}>{statusConfig[app.status]?.label || app.status}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Dashboard;