/**
 * components/Sidebar.jsx
 * ----------------------
 * Left sidebar: PDF drop zone, upload button, loaded-file list.
 */

import React, { useRef, useState } from 'react'
import { uploadPDFs } from '../api/client'
import { useApp } from '../context/AppContext'

export default function Sidebar() {
  const { setSessionId, setPdfNames, pdfNames, sessionId, setRevisionPlan, setFlashcards, setQuiz, setChatHistory } = useApp()

  const [files, setFiles]         = useState([])   // staged (not yet uploaded)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')
  const [dragOver, setDragOver]   = useState(false)

  const inputRef = useRef(null)

  /* ── file selection ────────────────────────────────────────────────────── */
  function addFiles(newFiles) {
    const pdfs = Array.from(newFiles).filter(f => f.name.toLowerCase().endsWith('.pdf'))
    if (pdfs.length !== newFiles.length) {
      setError('Only PDF files are accepted.')
    } else {
      setError('')
    }
    setFiles(prev => {
      // deduplicate by name
      const names = new Set(prev.map(f => f.name))
      return [...prev, ...pdfs.filter(f => !names.has(f.name))]
    })
    setSuccess('')
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    addFiles(e.dataTransfer.files)
  }

  function handleInputChange(e) {
    addFiles(e.target.files)
    e.target.value = ''   // allow re-selecting the same file
  }

  function removeStaged(name) {
    setFiles(prev => prev.filter(f => f.name !== name))
    setError('')
  }

  /* ── upload ────────────────────────────────────────────────────────────── */
  async function handleUpload() {
    if (!files.length) { setError('Select at least one PDF first.'); return }
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const data = await uploadPDFs(files)
      setSessionId(data.session_id)
      setPdfNames(data.pdf_names)
      // Clear all previously generated content for new PDFs
      setRevisionPlan('')
      setFlashcards([])
      setQuiz([])
      setChatHistory([])
      setFiles([])
      setSuccess(`✅ ${data.pdf_names.length} file${data.pdf_names.length !== 1 ? 's' : ''} processed successfully.`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /* ── render ─────────────────────────────────────────────────────────────── */
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">📚</div>
        <div className="sidebar-logo-text">
          <div className="title">Exam Revision</div>
          <div className="title">Assistant</div>
        </div>
      </div>

      {/* Upload section */}
      <div className="sidebar-section" style={{ flex: 1 }}>
        <div className="sidebar-label" style={{ marginTop: 20 }}>📂 Study Material</div>

        {/* Drop zone */}
        <div
          className={`dropzone ${dragOver ? 'drag-over' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            multiple
            onChange={handleInputChange}
          />
          <span className="dropzone-icon">📄</span>
          <strong>Click or drag &amp; drop</strong>
          <br />PDF files here
        </div>

        {/* Staged files (not yet uploaded) */}
        {files.map(f => (
          <div key={f.name} className="file-pill">
            <span>📄</span>
            <span style={{ flex: 1 }}>{f.name}</span>
            <button
              onClick={() => removeStaged(f.name)}
              style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: '0.9rem', lineHeight: 1, padding: 0 }}
              title="Remove"
            >✕</button>
          </div>
        ))}

        {/* Errors / success */}
        {error   && <p style={{ color: 'var(--accent-red)',   fontSize: '0.78rem', marginTop: 6 }}>{error}</p>}
        {success && <p style={{ color: '#4ade80', fontSize: '0.78rem', marginTop: 6 }}>{success}</p>}

        {/* Upload button */}
        <button
          className="btn btn-primary btn-full"
          style={{ marginTop: 12 }}
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? '⏳ Processing…' : 'Process PDFs'}
        </button>

        {/* Already-loaded files */}
        {pdfNames.length > 0 && (
          <>
            <div className="sidebar-label" style={{ marginTop: 24 }}>📄 Loaded Files</div>
            {pdfNames.map(name => (
              <div key={name} className="file-pill">
                <span>📄</span>
                <span>{name}</span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Footer note */}
      <div style={{
        padding: '14px 20px',
        borderTop: '1px solid var(--border)',
        fontSize: '0.65rem',
        color: 'var(--text-faint)',
        textAlign: 'center',
        lineHeight: 1.6,
      }}>
        🔒 Files are processed in memory only
      </div>
    </aside>
  )
}
