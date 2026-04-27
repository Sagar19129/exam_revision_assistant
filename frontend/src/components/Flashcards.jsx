/**
 * components/Flashcards.jsx
 * -------------------------
 * Tab 2: Generate and flip through flashcard Q&A pairs.
 * Each card hides the answer until the user clicks "Reveal".
 */

import React, { useState } from 'react'
import { getFlashcards } from '../api/client'
import { useApp } from '../context/AppContext'

/* Card count options */
const CARD_OPTIONS = [5, 10, 15, 20]

export default function Flashcards() {
  const { sessionId, flashcards, setFlashcards } = useApp()

  const [topic, setTopic]       = useState('')
  const [numCards, setNumCards] = useState(10)
  const [revealed, setRevealed] = useState({})  // index -> boolean
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  /* ── generate ──────────────────────────────────────────────────────────── */
  async function handleGenerate() {
    setLoading(true)
    setError('')
    setFlashcards([])
    setRevealed({})
    try {
      const data = await getFlashcards(sessionId, topic, numCards)
      setFlashcards(data.flashcards || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /* ── toggle reveal ─────────────────────────────────────────────────────── */
  function toggleReveal(index) {
    setRevealed(prev => ({ ...prev, [index]: !prev[index] }))
  }

  const total = flashcards.length
  const done  = Object.values(revealed).filter(Boolean).length

  /* ── render ─────────────────────────────────────────────────────────────── */
  return (
    <div>
      {/* Section header */}
      <div className="section-header">
        <div className="section-header-row">
          <span className="section-header-icon">🃏</span>
          <span className="section-header-title">Flashcard Generator</span>
        </div>
        <p className="section-header-sub">
          Active-recall study — try to remember the answer before revealing the back of each card.
        </p>
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 16 }}>
        <div className="form-group" style={{ flex: '1 1 260px', marginBottom: 0 }}>
          <label className="form-label">Focus topic (optional)</label>
          <input
            className="form-input"
            placeholder="e.g.  Newton's Laws  ·  Cell Biology  ·  Leave blank for all topics"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !loading && handleGenerate()}
          />
        </div>
        <div className="form-group" style={{ width: 110, marginBottom: 0 }}>
          <label className="form-label"># Cards</label>
          <select
            className="form-select"
            value={numCards}
            onChange={e => setNumCards(Number(e.target.value))}
          >
            {CARD_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <button
          className="btn btn-primary"
          style={{ marginBottom: 0 }}
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? '⏳ Generating…' : '🃏 Generate Flashcards'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error">
          <span>⚠️</span><span>{error}</span>
        </div>
      )}

      {/* Spinner */}
      {loading && (
        <div className="spinner-wrapper">
          <div className="spinner" />
          <span>Creating your flashcards…</span>
        </div>
      )}

      {/* Progress */}
      {!loading && total > 0 && (
        <>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            <span className="badge badge-blue">🃏 {total} cards</span>
            <span className="badge badge-green">✅ {done} reviewed</span>
            <span className="badge badge-blue">🔒 {total - done} remaining</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
          </div>
        </>
      )}

      {/* Cards */}
      {!loading && flashcards.map((card, i) => {
        const isRevealed = !!revealed[i]
        return (
          <div key={i} className="flashcard">
            {/* Front */}
            <div className="flashcard-front">
              <div className="flashcard-chip">CARD {i + 1} / {total} &nbsp;·&nbsp; FRONT</div>
              <div className="flashcard-question">{card.question}</div>
            </div>

            {/* Back */}
            {isRevealed ? (
              <div className="flashcard-back-revealed">
                <div className="flashcard-answer-chip">BACK &nbsp;·&nbsp; ANSWER</div>
                <div className="flashcard-answer">{card.answer}</div>
              </div>
            ) : (
              <div className="flashcard-back-hidden">
                🔒 &nbsp;Think of the answer, then reveal below
              </div>
            )}

            {/* Toggle button */}
            <div className="flashcard-actions">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => toggleReveal(i)}
              >
                {isRevealed ? '🙈 Hide Answer' : '👁️ Reveal Answer'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
