/**
 * context/AppContext.jsx
 * ----------------------
 * Global application state shared between Sidebar and all tab panels:
 *   - sessionId      – backend session key returned after upload
 *   - pdfNames       – list of uploaded filenames
 *   - activeTab      – which tab is currently shown
 */

import React, { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [sessionId, setSessionId]   = useState(null)   // null = no PDFs loaded
  const [pdfNames, setPdfNames]     = useState([])
  const [activeTab, setActiveTab]   = useState('plan')  // 'plan' | 'flashcards' | 'quiz' | 'chat'

  // ─ Persistent state for generated content (survives tab switches) ─
  const [revisionPlan, setRevisionPlan] = useState('')
  const [flashcards, setFlashcards]     = useState([])
  const [quiz, setQuiz]                 = useState([])
  const [chatHistory, setChatHistory]   = useState([])

  const value = {
    // Session management
    sessionId, setSessionId,
    pdfNames, setPdfNames,
    activeTab, setActiveTab,
    // Generated content
    revisionPlan, setRevisionPlan,
    flashcards, setFlashcards,
    quiz, setQuiz,
    chatHistory, setChatHistory,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

/** Convenience hook. */
export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}
