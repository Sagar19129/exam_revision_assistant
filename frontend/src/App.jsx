/**
 * App.jsx
 * -------
 * Root component. Renders the two-column shell:
 *   <Sidebar>  — PDF upload
 *   <main>     — header + tabs + active tab panel
 *
 * When no PDFs are loaded (sessionId is null) it shows a landing screen
 * with feature preview cards and a prompt to upload first.
 */

import React from 'react'
import { AppProvider, useApp } from './context/AppContext'
import Sidebar       from './components/Sidebar'
import RevisionPlan  from './components/RevisionPlan'
import Flashcards    from './components/Flashcards'
import Quiz          from './components/Quiz'
import Chat          from './components/Chat'

/* ── Tab definitions ─────────────────────────────────────────────────────────── */
const TABS = [
  { id: 'plan',       label: '🗓️  Revision Plan' },
  { id: 'flashcards', label: '🃏  Flashcards'    },
  { id: 'quiz',       label: '📝  Quiz'           },
  { id: 'chat',       label: '💬  Chat'           },
]

const FEATURES = [
  { icon: '🗓️', title: 'Revision Plan',  desc: 'Get a day-by-day study plan based on your notes' },
  { icon: '🃏', title: 'Flashcards',     desc: 'Practice key ideas with question & answer cards' },
  { icon: '📝', title: 'Quiz',           desc: 'Test yourself with multiple-choice questions' },
  { icon: '💬', title: 'Chat',           desc: 'Ask questions about anything in your notes' },
]

/* ── Inner shell (needs AppContext) ────────────────────────────────────────────── */
function Shell() {
  const { sessionId, pdfNames, activeTab, setActiveTab } = useApp()
  const n = pdfNames.length

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-content">
        {/* Page header */}
        <div className="page-header">
          <h1>Exam Revision Assistant</h1>
          <p>Upload your notes or textbook PDFs, then use the tools below to study smarter.</p>
          <hr />
        </div>

        {/* ── No PDFs yet — landing state ──────────────────────────────────── */}
        {!sessionId ? (
          <>
            <div className="feature-grid">
              {FEATURES.map(f => (
                <div key={f.title} className="feature-card">
                  <div className="feature-card-icon">{f.icon}</div>
                  <div className="feature-card-title">{f.title}</div>
                  <div className="feature-card-desc">{f.desc}</div>
                </div>
              ))}
            </div>

            <div className="empty-state">
              <div className="empty-state-icon">👈</div>
              <div className="empty-state-title">Upload your PDFs to get started</div>
              <p className="empty-state-body">
                Add your lecture notes, textbook chapters, or revision guides using the sidebar on the left,
                then click <strong style={{ color: '#6366f1' }}>Process PDFs</strong> to unlock all features.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Status badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
              <span className="badge badge-green">
                ✓ &nbsp;{n} file{n !== 1 ? 's' : ''} loaded
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Choose a tab below to start studying.
              </span>
            </div>

            {/* Tabs */}
            <div className="tabs" role="tablist">
              {TABS.map(t => (
                <button
                  key={t.id}
                  className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
                  role="tab"
                  aria-selected={activeTab === t.id}
                  onClick={() => setActiveTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab panels */}
            {activeTab === 'plan'       && <RevisionPlan />}
            {activeTab === 'flashcards' && <Flashcards  />}
            {activeTab === 'quiz'       && <Quiz        />}
            {activeTab === 'chat'       && <Chat        />}
          </>
        )}
      </main>
    </div>
  )
}

/* ── Root export ─────────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
