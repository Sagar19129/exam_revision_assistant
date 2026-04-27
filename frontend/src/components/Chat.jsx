/**
 * components/Chat.jsx
 * -------------------
 * Tab 4: Conversational Q&A grounded in the uploaded PDFs.
 * Messages are rendered in a scrollable chat bubble layout.
 * Conversation history is sent to the backend for follow-up awareness.
 */

import React, { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { sendChat } from '../api/client'
import { useApp } from '../context/AppContext'

export default function Chat() {
  const { sessionId, chatHistory, setChatHistory } = useApp()

  // input: current text being typed
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  /* Auto-scroll to the latest message */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, loading])

  /* ── send message ──────────────────────────────────────────────────────── */
  async function handleSend() {
    const msg = input.trim()
    if (!msg || loading) return

    const userMsg = { role: 'user', content: msg }
    setChatHistory(prev => [...prev, userMsg])
    setInput('')
    setError('')
    setLoading(true)

    try {
      const data = await sendChat(sessionId, msg, [...chatHistory, userMsg])
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setError(err.message)
      // Remove the optimistic user message on error
      setChatHistory(prev => prev.slice(0, -1))
      setInput(msg)
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleClear() {
    setChatHistory([])
    setError('')
    inputRef.current?.focus()
  }

  /* ── render ─────────────────────────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '72vh', minHeight: 400 }}>

      {/* Section header */}
      <div className="section-header">
        <div className="section-header-row">
          <span className="section-header-icon">💬</span>
          <span className="section-header-title">Chat with your PDFs</span>
          {chatHistory.length > 0 && (
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginLeft: 'auto' }}
              onClick={handleClear}
            >
              🗑️ Clear
            </button>
          )}
        </div>
        <p className="section-header-sub">
          Ask any question about your uploaded study material — answers are grounded in your PDFs.
        </p>
      </div>

      {/* Message list */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '4px 0 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        {/* Empty state */}
        {chatHistory.length === 0 && !loading && (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            color: 'var(--text-faint)',
            padding: '40px 0',
          }}>
            <span style={{ fontSize: '2.4rem' }}>💬</span>
            <p style={{ fontSize: '0.88rem', textAlign: 'center', maxWidth: 320, lineHeight: 1.6 }}>
              Ask anything about your uploaded notes — e.g.<br />
              <em style={{ color: 'var(--text-muted)' }}>"Summarise the key concepts"</em><br />
              <em style={{ color: 'var(--text-muted)' }}>"What is covered in chapter 3?"</em><br />
              <em style={{ color: 'var(--text-muted)' }}>"Explain Newton's second law"</em>
            </p>
          </div>
        )}

        {/* Conversation bubbles */}
        {chatHistory.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            {/* Avatar */}
            {msg.role === 'assistant' && (
              <div style={{
                width: 30, height: 30,
                background: 'var(--grad-accent)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.9rem', flexShrink: 0, marginRight: 8, marginTop: 2,
              }}>📚</div>
            )}

            <div style={{
              maxWidth: '75%',
              padding: '12px 16px',
              borderRadius: msg.role === 'user'
                ? '16px 16px 4px 16px'
                : '16px 16px 16px 4px',
              background: msg.role === 'user'
                ? 'var(--grad-accent)'
                : 'var(--bg-surface)',
              border: msg.role === 'user'
                ? 'none'
                : '1px solid var(--border)',
              color: msg.role === 'user' ? '#fff' : 'var(--text-secondary)',
              fontSize: '0.9rem',
              lineHeight: 1.65,
              boxShadow: msg.role === 'user'
                ? 'var(--shadow-accent)'
                : 'none',
            }}>
              {msg.role === 'user'
                ? <span>{msg.content}</span>
                : (
                  /* Render assistant markdown */
                  <div className="chat-md">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )
              }
            </div>

            {/* User avatar */}
            {msg.role === 'user' && (
              <div style={{
                width: 30, height: 30,
                background: '#1e3050',
                border: '1px solid var(--border-light)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem', flexShrink: 0, marginLeft: 8, marginTop: 2,
              }}>🧑</div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 30, height: 30,
              background: 'var(--grad-accent)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem', flexShrink: 0,
            }}>📚</div>
            <div style={{
              padding: '12px 18px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px 16px 16px 4px',
              display: 'flex', gap: 5, alignItems: 'center',
            }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: 7, height: 7,
                  borderRadius: '50%',
                  background: 'var(--text-muted)',
                  display: 'inline-block',
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="alert alert-error">
            <span>⚠️</span><span>{error}</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{
        display: 'flex',
        gap: 10,
        padding: '14px 0 0',
        borderTop: '1px solid var(--border)',
        alignItems: 'flex-end',
      }}>
        <textarea
          ref={inputRef}
          className="form-input"
          style={{
            flex: 1,
            resize: 'none',
            minHeight: 44,
            maxHeight: 120,
            lineHeight: 1.5,
            paddingTop: 10,
            paddingBottom: 10,
          }}
          placeholder="Ask anything about your PDFs… (Enter to send, Shift+Enter for new line)"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={loading}
        />
        <button
          className="btn btn-primary"
          style={{ height: 44, padding: '0 20px', flexShrink: 0 }}
          onClick={handleSend}
          disabled={loading || !input.trim()}
        >
          {loading ? '⏳' : '➤ Send'}
        </button>
      </div>

      {/* Bounce animation */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-6px); opacity: 1; }
        }
        .chat-md p   { margin-bottom: 0.5em; }
        .chat-md ul,
        .chat-md ol  { padding-left: 1.3em; margin-bottom: 0.5em; }
        .chat-md li  { margin-bottom: 2px; }
        .chat-md h1,
        .chat-md h2,
        .chat-md h3  { color: var(--text-primary); font-weight: 700; margin: 0.6em 0 0.3em; }
        .chat-md strong { color: var(--text-primary); }
        .chat-md code { background: var(--bg-raised); padding: 1px 5px; border-radius: 4px; font-size: 0.85em; }
      `}</style>
    </div>
  )
}
