import React, { useState } from 'react';
import axios from 'axios';

function JobSearch({ resumeId }) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('India');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [tracking, setTracking] = useState({});

  const handleSearch = async () => {
    if (!resumeId) { setError('Upload a resume first.'); return; }
    setLoading(true); setError(null); setResults(null);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/scraper/search`,
        { resume_id: resumeId, query, location }
      );
      setResults(res.data);
    } catch { setError('Search failed. Check backend is running.'); }
    finally { setLoading(false); }
  };

  const handleTrack = async (job) => {
    try {
      const jobRes = await axios.post(
        `${process.env.REACT_APP_API_URL}/jobs/add`,
        { title: job.job_title, company: job.company, description: job.summary }
      );
      await axios.post(
        `${process.env.REACT_APP_API_URL}/jobs/analyze`,
        { resume_id: resumeId, job_id: jobRes.data.id }
      );
      setTracking(prev => ({ ...prev, [job.job_title + job.company]: true }));
    } catch { alert('Failed to track job.'); }
  };

  const scoreColor = (score) =>
    score >= 70 ? '#27ae60' : score >= 50 ? '#f39c12' : '#e74c3c';

  const inputStyle = {
    display: 'block', width: '100%', padding: '12px 16px',
    border: '1px solid var(--border)', borderRadius: '6px',
    fontSize: '14px', fontFamily: 'DM Sans', marginBottom: '12px',
    background: 'var(--white)', outline: 'none',
  };

  return (
    <div className="page">
      <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '12px' }}>Live Jobs</p>
      <h1 style={{ fontFamily: 'Playfair Display', fontSize: '48px', fontWeight: 900, lineHeight: 1.1, marginBottom: '8px' }}>
        Find Matching<br />Jobs
      </h1>
      <p style={{ color: 'var(--gray)', marginBottom: '48px', fontSize: '15px' }}>
        Real jobs fetched and ranked by AI match score against your resume.
      </p>

      {!resumeId && (
        <div style={{ padding: '14px 20px', background: '#fff8e1', borderRadius: '6px', marginBottom: '24px', fontSize: '14px' }}>
          ⚠️ Upload a resume first.
        </div>
      )}

      <input placeholder="Job title e.g. Data Analyst, Python Developer"
        value={query} onChange={e => setQuery(e.target.value)} style={inputStyle} />
      <input placeholder="Location e.g. India, Bangalore, Remote"
        value={location} onChange={e => setLocation(e.target.value)} style={inputStyle} />

      <button onClick={handleSearch} disabled={loading || !query}
        style={{
          padding: '14px 32px',
          background: loading || !query ? 'var(--border)' : 'var(--black)',
          color: loading || !query ? 'var(--gray)' : 'var(--white)',
          border: 'none', borderRadius: '6px',
          cursor: loading || !query ? 'not-allowed' : 'pointer',
          fontSize: '14px', fontWeight: 500, fontFamily: 'DM Sans',
        }}>
        {loading ? 'Fetching & analyzing jobs... (30-60s)' : 'Search Jobs'}
      </button>

      {error && <p style={{ color: 'var(--accent)', marginTop: '16px', fontSize: '14px' }}>{error}</p>}

      {results && (
        <div style={{ marginTop: '48px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '24px' }}>
            {results.total_found} jobs found · ranked by match
          </p>

          {results.jobs.map((job, i) => (
            <div key={i} style={{
              padding: '24px 28px', marginBottom: '16px',
              border: '1px solid var(--border)', borderRadius: '8px',
              borderLeft: `4px solid ${scoreColor(job.match_score)}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>{job.job_title}</p>
                  <p style={{ fontSize: '13px', color: 'var(--gray)' }}>{job.company} · {job.location}</p>
                  <p style={{ fontSize: '11px', color: 'var(--gray)', marginTop: '4px' }}>{job.employment_type} · {job.date_posted?.slice(0, 10)}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '20px' }}>
                  <p style={{ fontFamily: 'Playfair Display', fontSize: '36px', fontWeight: 900, color: scoreColor(job.match_score), lineHeight: 1 }}>
                    {job.match_score}%
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--gray)' }}>match</p>
                </div>
              </div>

              <p style={{ fontSize: '13px', lineHeight: 1.7, color: '#2a2a2a', marginBottom: '16px' }}>{job.summary}</p>

              {job.skill_gaps?.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '8px' }}>Skill Gaps</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {job.skill_gaps.map((gap, j) => (
                      <span key={j} style={{
                        padding: '4px 12px', background: '#fdedec',
                        borderRadius: '20px', fontSize: '12px', color: 'var(--accent)'
                      }}>{gap}</span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <a href={job.apply_link} target="_blank" rel="noreferrer"
                  style={{
                    padding: '8px 20px', background: 'var(--black)', color: 'var(--white)',
                    borderRadius: '6px', fontSize: '13px', textDecoration: 'none', fontWeight: 500
                  }}>
                  Apply →
                </a>
                <button
                  onClick={() => handleTrack(job)}
                  disabled={tracking[job.job_title + job.company]}
                  style={{
                    padding: '8px 20px',
                    background: tracking[job.job_title + job.company] ? 'var(--light-gray)' : 'transparent',
                    color: tracking[job.job_title + job.company] ? 'var(--gray)' : 'var(--black)',
                    border: '1px solid var(--border)', borderRadius: '6px',
                    fontSize: '13px', cursor: 'pointer', fontFamily: 'DM Sans'
                  }}>
                  {tracking[job.job_title + job.company] ? '✓ Tracked' : 'Track This'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default JobSearch;