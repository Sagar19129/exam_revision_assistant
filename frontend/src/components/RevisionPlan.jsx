/**
 * components/RevisionPlan.jsx
 * ---------------------------
 * Tab 1: Generate and display a personalised revision plan.
 * Uses react-markdown to render the LLM's markdown output.
 */

import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { getRevisionPlan } from '../api/client'
import { useApp } from '../context/AppContext'

export default function RevisionPlan() {
  const { sessionId, revisionPlan, setRevisionPlan } = useApp()

  const [examDate, setExamDate] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  /* ── generate ──────────────────────────────────────────────────────────── */
  async function handleGenerate() {
    setLoading(true)
    setError('')
    setRevisionPlan('')
    try {
      const data = await getRevisionPlan(sessionId, examDate)
      setRevisionPlan(data.plan)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /* ── download ──────────────────────────────────────────────────────────── */
  function handleDownload() {
    const blob = new Blob([revisionPlan], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'revision_plan.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  /* ── render ─────────────────────────────────────────────────────────────── */
  return (
    <div>
      {/* Section header */}
      <div className="section-header">
        <div className="section-header-row">
          <span className="section-header-icon">🗓️</span>
          <span className="section-header-title">Revision Plan Generator</span>
        </div>
        <p className="section-header-sub">
          Get a personalised, topic-by-topic schedule built from your uploaded notes.
        </p>
      </div>

      {/* Exam date input */}
      <div className="form-group">
        <label className="form-label">When is your exam? (optional)</label>
        <input
          className="form-input"
          placeholder="e.g.  In 2 weeks  ·  On 15th May  ·  Tomorrow"
          value={examDate}
          onChange={e => setExamDate(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !loading && handleGenerate()}
        />
      </div>

      <button
        className="btn btn-primary"
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? '⏳ Generating…' : '🗓️ Generate Revision Plan'}
      </button>

      {/* Error */}
      {error && (
        <div className="alert alert-error" style={{ marginTop: 16 }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Loading spinner */}
      {loading && (
        <div className="spinner-wrapper">
          <div className="spinner" />
          <span>Building your personalised revision plan…</span>
        </div>
      )}

      {/* Output */}
      {revisionPlan && !loading && (
        <>
          <div className="plan-output" style={{ marginTop: 24 }}>
            <ReactMarkdown>{revisionPlan}</ReactMarkdown>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            style={{ marginTop: 14 }}
            onClick={handleDownload}
          >
            ⬇️ Download Revision Plan
          </button>
        </>
      )}
    </div>
  )
}
