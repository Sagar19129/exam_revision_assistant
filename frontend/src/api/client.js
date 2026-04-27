/**
 * api/client.js
 * -------------
 * Centralised API functions for talking to the Flask backend.
 * All requests go to /api/* — Vite proxies them to http://localhost:8000
 * during development, and Flask serves them directly in production.
 */

const BASE = '/api'

/** Generic fetch wrapper with error handling. */
async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Server error ${res.status}`)
  }
  return data
}

// ── Endpoints ──────────────────────────────────────────────────────────────────

/**
 * Upload one or more PDF files.
 * @param {File[]} files
 * @returns {{ session_id, pdf_names, chunks_indexed }}
 */
export async function uploadPDFs(files) {
  const form = new FormData()
  files.forEach(f => form.append('files', f))
  return request('/upload', { method: 'POST', body: form })
}

/**
 * Generate a revision plan.
 * @param {string} sessionId
 * @param {string} examDateInfo
 * @returns {{ plan: string }}
 */
export async function getRevisionPlan(sessionId, examDateInfo = '') {
  return request('/revision-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      exam_date_info: examDateInfo || 'No specific date provided',
    }),
  })
}

/**
 * Generate flashcards.
 * @param {string} sessionId
 * @param {string} topic
 * @param {number} numCards
 * @returns {{ flashcards: Array<{ question, answer }> }}
 */
export async function getFlashcards(sessionId, topic = '', numCards = 10) {
  return request('/flashcards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, topic, num_cards: numCards }),
  })
}

/**
 * Generate quiz questions.
 * @param {string} sessionId
 * @param {string} topic
 * @param {number} numQuestions
 * @returns {{ questions: Array<{ question, options, answer, explanation }> }}
 */
export async function getQuiz(sessionId, topic = '', numQuestions = 5) {
  return request('/quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, topic, num_questions: numQuestions }),
  })
}

/**
 * Send a chat message grounded in the uploaded PDFs.
 * @param {string} sessionId
 * @param {string} message
 * @param {Array<{role:string, content:string}>} history
 * @returns {{ reply: string }}
 */
export async function sendChat(sessionId, message, history = []) {
  return request('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, message, history }),
  })
}
