import React, { useState } from 'react';
import axios from 'axios';

function JobAnalyze({ resumeId }) {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const inputStyle = {
    display: 'block', width: '100%', padding: '12px 16px',
    border: '1px solid var(--border)', borderRadius: '6px',
    fontSize: '14px', fontFamily: 'DM Sans', marginBottom: '12px',
    background: 'var(--white)', outline: 'none',
    transition: 'border-color 0.2s',
  };

  const handleAnalyze = async () => {
    if (!resumeId) { setError('Upload a resume first.'); return; }
    setLoading(true); setError(null);
    try {
      const jobRes = await axios.post(
  `${process.env.REACT_APP_API_URL}/jobs/add`,
  { title, company, description }
);

const analyzeRes = await axios.post(
  `${process.env.REACT_APP_API_URL}/jobs/analyze`,
  { resume_id: resumeId, job_id: jobRes.data.id }
);
      setResult(analyzeRes.data);
    } catch { setError('Analysis failed.'); }
    finally { setLoading(false); }
  };

  const scoreColor = result?.match_score >= 70 ? '#27ae60' : result?.match_score >= 50 ? '#f39c12' : '#e74c3c';

  return (
    <div className="page">
      <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '12px' }}>Step 02</p>
      <h1 style={{ fontFamily: 'Playfair Display', fontSize: '48px', fontWeight: 900, lineHeight: 1.1, marginBottom: '8px' }}>
        Analyze Job<br />Match
      </h1>
      <p style={{ color: 'var(--gray)', marginBottom: '48px', fontSize: '15px' }}>Paste a job description and get an AI-powered match analysis.</p>

      {!resumeId && (
        <div style={{ padding: '14px 20px', background: '#fff8e1', borderRadius: '6px', marginBottom: '24px', fontSize: '14px' }}>
          ⚠️ No resume loaded — go to Upload Resume first.
        </div>
      )}

      <input placeholder="Job Title" value={title} onChange={e => setTitle(e.target.value)} style={inputStyle}
        onFocus={e => e.target.style.borderColor = 'var(--black)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'} />

      <input placeholder="Company (optional)" value={company} onChange={e => setCompany(e.target.value)} style={inputStyle}
        onFocus={e => e.target.style.borderColor = 'var(--black)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'} />

      <textarea placeholder="Paste full job description here..." value={description}
        onChange={e => setDescription(e.target.value)} rows={8}
        style={{ ...inputStyle, resize: 'vertical' }}
        onFocus={e => e.target.style.borderColor = 'var(--black)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'} />

      <button onClick={handleAnalyze} disabled={loading || !description}
        style={{
          padding: '14px 32px',
          background: loading || !description ? 'var(--border)' : 'var(--black)',
          color: loading || !description ? 'var(--gray)' : 'var(--white)',
          border: 'none', borderRadius: '6px',
          cursor: loading || !description ? 'not-allowed' : 'pointer',
          fontSize: '14px', fontWeight: 500, fontFamily: 'DM Sans',
        }}>
        {loading ? 'Analyzing... (10-15s)' : 'Analyze Match'}
      </button>

      {error && <p style={{ color: 'var(--accent)', marginTop: '16px', fontSize: '14px' }}>{error}</p>}

      {result && (
        <div style={{ marginTop: '48px' }}>
          {/* Score */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '48px', paddingBottom: '32px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontFamily: 'Playfair Display', fontSize: '80px', fontWeight: 900, color: scoreColor, lineHeight: 1 }}>
              {result.match_score}
            </span>
            <div>
              <p style={{ fontSize: '13px', color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '2px' }}>Match Score</p>
              <p style={{ fontSize: '14px', fontWeight: 500, marginTop: '4px' }}>
                {result.match_score >= 70 ? 'Strong match' : result.match_score >= 50 ? 'Moderate match' : 'Needs work'}
              </p>
            </div>
          </div>

          {/* Sections */}
          {[
            { label: 'Skill Gaps', items: result.skill_gaps, accent: 'var(--accent)' },
            { label: 'Strong Points', items: result.strong_points, accent: '#27ae60' },
            { label: 'Rewritten Bullets', items: result.rewritten_bullets, accent: '#2c3e50' },
          ].map(section => (
            <div key={section.label} style={{ marginBottom: '36px' }}>
              <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '16px' }}>{section.label}</p>
              {section.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '12px', alignItems: 'flex-start' }}>
                  <span style={{ width: '3px', minHeight: '20px', background: section.accent, borderRadius: '2px', marginTop: '2px', flexShrink: 0 }} />
                  <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#2a2a2a' }}>{item}</p>
                </div>
              ))}
            </div>
          ))}

          {/* Summary */}
          <div style={{ padding: '24px', background: 'var(--light-gray)', borderRadius: '8px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '12px' }}>Summary</p>
            <p style={{ fontSize: '15px', lineHeight: 1.8, color: '#2a2a2a' }}>{result.summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobAnalyze;