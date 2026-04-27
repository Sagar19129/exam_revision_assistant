/**
 * components/Quiz.jsx
 * -------------------
 * Tab 3: Generate MCQ questions, let the user answer, then score and explain.
 */

import React, { useState } from 'react'
import { getQuiz } from '../api/client'
import { useApp } from '../context/AppContext'

const Q_OPTIONS = [3, 5, 8, 10]

export default function Quiz() {
  const { sessionId, quiz, setQuiz } = useApp()

  const [topic, setTopic]         = useState('')
  const [numQ, setNumQ]           = useState(5)
  const [answers, setAnswers]     = useState({})       // index -> chosen option string
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [openExp, setOpenExp]     = useState({})       // index -> boolean (explanation visible)

  /* ── generate ──────────────────────────────────────────────────────────── */
  async function handleGenerate() {
    setLoading(true)
    setError('')
    setQuiz([])
    setAnswers({})
    setSubmitted(false)
    setOpenExp({})
    try {
      const data = await getQuiz(sessionId, topic, numQ)
      setQuiz(data.questions || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /* ── select answer ─────────────────────────────────────────────────────── */
  function selectAnswer(qIndex, option) {
    if (submitted) return   // lock after submit
    setAnswers(prev => ({ ...prev, [qIndex]: option }))
  }

  /* ── submit ────────────────────────────────────────────────────────────── */
  function handleSubmit() {
    if (Object.keys(answers).length === 0) {
      setError('Please answer at least one question before submitting.')
      return
    }
    setError('')
    setSubmitted(true)
  }

  /* ── helpers ───────────────────────────────────────────────────────────── */
  function getCorrectOption(q) {
    const label = q.answer.trim().toUpperCase()
    return q.options.find(o => o.trim().toUpperCase().startsWith(label)) || ''
  }

  function isCorrect(q, i) {
    return submitted && answers[i] === getCorrectOption(q)
  }

  const score = submitted
    ? quiz.filter((q, i) => isCorrect(q, i)).length
    : 0

  const pct = quiz.length ? Math.round((score / quiz.length) * 100) : 0

  /* ── option class ──────────────────────────────────────────────────────── */
  function optionClass(q, i, opt) {
    const correct = getCorrectOption(q)
    if (!submitted) return answers[i] === opt ? 'quiz-option selected' : 'quiz-option'
    if (opt === correct)      return 'quiz-option correct'
    if (opt === answers[i])   return 'quiz-option wrong'
    return 'quiz-option'
  }

  /* ── score colour ──────────────────────────────────────────────────────── */
  function scoreStyle() {
    if (pct === 100) return { color: '#4ade80' }
    if (pct >= 80)   return { color: '#a78bfa' }
    if (pct >= 60)   return { color: '#60a5fa' }
    return { color: '#f59e0b' }
  }

  function scoreMsg() {
    if (pct === 100) return '🎉 Perfect score — outstanding!'
    if (pct >= 80)   return '🌟 Excellent — almost there!'
    if (pct >= 60)   return '👍 Good effort — keep revising!'
    return '📖 Review your notes and try again.'
  }

  /* ── render ─────────────────────────────────────────────────────────────── */
  return (
    <div>
      {/* Section header */}
      <div className="section-header">
        <div className="section-header-row">
          <span className="section-header-icon">📝</span>
          <span className="section-header-title">Quiz Generator</span>
        </div>
        <p className="section-header-sub">
          Test yourself with multiple-choice questions generated from your study material.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 16 }}>
        <div className="form-group" style={{ flex: '1 1 260px', marginBottom: 0 }}>
          <label className="form-label">Focus topic (optional)</label>
          <input
            className="form-input"
            placeholder="e.g.  Thermodynamics  ·  World War II  ·  Leave blank for all topics"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !loading && handleGenerate()}
          />
        </div>
        <div className="form-group" style={{ width: 140, marginBottom: 0 }}>
          <label className="form-label"># Questions</label>
          <select
            className="form-select"
            value={numQ}
            onChange={e => setNumQ(Number(e.target.value))}
          >
            {Q_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <button
          className="btn btn-primary"
          style={{ marginBottom: 0 }}
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? '⏳ Generating…' : '📝 Generate Quiz'}
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
          <span>Preparing your quiz…</span>
        </div>
      )}

      {/* Questions */}
      {!loading && quiz.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            <span className="badge badge-blue">📝 {quiz.length} questions</span>
            {!submitted && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Select one answer per question, then submit.
              </span>
            )}
          </div>

          {quiz.map((q, i) => (
            <div key={i} className="quiz-question-card">
              <div className="quiz-q-label">Question {i + 1} of {quiz.length}</div>
              <div className="quiz-q-text">{q.question}</div>

              <div className="quiz-options">
                {q.options.map(opt => (
                  <button
                    key={opt}
                    className={optionClass(q, i, opt)}
                    onClick={() => selectAnswer(i, opt)}
                    disabled={submitted}
                  >
                    {/* Show tick/cross icon after submit */}
                    {submitted && opt === getCorrectOption(q) && <span>✅</span>}
                    {submitted && opt === answers[i] && opt !== getCorrectOption(q) && <span>❌</span>}
                    {opt}
                  </button>
                ))}
              </div>

              {/* Explanation (shown after submit) */}
              {submitted && (
                <div style={{ marginTop: 10 }}>
                  <button
                    className="explanation-toggle"
                    onClick={() => setOpenExp(prev => ({ ...prev, [i]: !prev[i] }))}
                  >
                    {openExp[i] ? '▾' : '▸'} 💡 {openExp[i] ? 'Hide' : 'See'} explanation
                  </button>
                  {openExp[i] && (
                    <div className="explanation-box">{q.explanation}</div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Submit button */}
          {!submitted && (
            <button
              className="btn btn-success"
              style={{ marginTop: 8 }}
              onClick={handleSubmit}
            >
              ✅ Submit Answers
            </button>
          )}

          {/* Score card */}
          {submitted && (
            <div className="result-card">
              <div style={{ fontSize: '2.6rem', marginBottom: 10 }}>
                {pct === 100 ? '🎉' : pct >= 80 ? '🌟' : pct >= 60 ? '👍' : '📖'}
              </div>
              <div className="result-score" style={scoreStyle()}>
                {score} / {quiz.length}
              </div>
              <div className="result-msg">{pct}% &nbsp;·&nbsp; {scoreMsg()}</div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
