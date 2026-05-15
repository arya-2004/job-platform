import React, { useState } from 'react';
import axios from 'axios';

function ResumeUpload({ setResumeId }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/resume/upload`,formData);
      setResult(response.data);
      setResumeId(response.data.id);
      localStorage.setItem('resumeId', response.data.id);
    } catch {
      setError('Upload failed. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '12px' }}>Step 01</p>
      <h1 style={{ fontFamily: 'Playfair Display', fontSize: '48px', fontWeight: 900, lineHeight: 1.1, marginBottom: '8px' }}>
        Upload Your<br />Resume
      </h1>
      <p style={{ color: 'var(--gray)', marginBottom: '48px', fontSize: '15px' }}>PDF format only. We extract and analyze your content.</p>

      {/* Upload box */}
      <label style={{
        display: 'block',
        border: '2px dashed var(--border)',
        borderRadius: '8px',
        padding: '48px',
        textAlign: 'center',
        cursor: 'pointer',
        marginBottom: '24px',
        transition: 'border-color 0.2s',
      }}
        onMouseOver={e => e.currentTarget.style.borderColor = 'var(--black)'}
        onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} style={{ display: 'none' }} />
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>📄</div>
        <p style={{ fontWeight: 500 }}>{file ? file.name : 'Click to select PDF'}</p>
        <p style={{ fontSize: '12px', color: 'var(--gray)', marginTop: '4px' }}>or drag and drop</p>
      </label>

      <button onClick={handleUpload} disabled={!file || loading}
        style={{
          padding: '14px 32px',
          background: !file || loading ? 'var(--border)' : 'var(--black)',
          color: !file || loading ? 'var(--gray)' : 'var(--white)',
          border: 'none', borderRadius: '6px', cursor: !file || loading ? 'not-allowed' : 'pointer',
          fontSize: '14px', fontWeight: 500, fontFamily: 'DM Sans',
          transition: 'all 0.2s',
        }}>
        {loading ? 'Extracting text...' : 'Upload Resume'}
      </button>

      {error && <p style={{ color: 'var(--accent)', marginTop: '16px', fontSize: '14px' }}>{error}</p>}

      {result && (
        <div style={{ marginTop: '32px', padding: '24px', background: 'var(--light-gray)', borderRadius: '8px', borderLeft: '3px solid var(--black)' }}>
          <p style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '8px' }}>Success</p>
          <p style={{ fontWeight: 500, marginBottom: '4px' }}>{result.filename}</p>
          <p style={{ fontSize: '12px', color: 'var(--gray)', marginBottom: '12px' }}>Resume ID: {result.id} — saved for analysis</p>
          <p style={{ fontSize: '13px', color: 'var(--gray)', fontStyle: 'italic', lineHeight: 1.6 }}>"{result.text_preview}..."</p>
        </div>
      )}
    </div>
  );
}

export default ResumeUpload;