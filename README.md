#  Exam Revision Assistant

A GenAI-powered study tool built with **RAG (Retrieval-Augmented Generation)**, **React + Vite** frontend, **Flask** API, and **Google Gemini**. Upload your PDFs and instantly get a revision plan, flashcards, a quiz, or chat with your notes — all grounded in your own study material.

---

##  Architecture

```
┌─────────────────────────────────────────────────────────┐
│  React + Vite  (frontend/)                              │
│  HTML · CSS · JavaScript  — runs on :5173 (dev)         │
│  or served statically from Flask in production          │
└────────────────────┬────────────────────────────────────┘
                     │  REST  /api/*
┌────────────────────▼────────────────────────────────────┐
│  Flask  api.py  — Backend HTTP bridge  (:8000)          │
├─────────────────────────────────────────────────────────┤
│  rag/           LangChain · ChromaDB · Gemini Embed     │
│  features/      Gemini Flash (Revision/Cards/Quiz/Chat) │
└─────────────────────────────────────────────────────────┘
```

---

##  Quick Start

### 1 — Backend Setup (Python)

```bash
# Install dependencies
pip install -r requirements.txt

# Configure your Gemini API key in .env
echo "GOOGLE_API_KEY=your_key_here" > .env

# Start the Flask server
python api.py          # → http://localhost:8000
```

### 2 — Frontend Setup (React)

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev            # → http://localhost:5173
```

> [!TIP]
> Vite is pre-configured to proxy `/api/*` requests to the Flask server at `:8000`.

---

##  Features

| Feature | Description |
|---|---|
|  **Revision Plan** | A personalized study schedule based on your uploaded notes. |
|  **Flashcards** | Active-recall cards with hidden answers to test your memory. |
|  **Quiz** | Multiple-choice questions with instant scoring and explanations. |
|  **AI Chat** | Ask questions about your notes and get grounded answers instantly. |

---

##  Project Structure

```
Exam_Revision_Assistant/
├── api.py                     # Flask Backend API
├── rag/
│   ├── pdf_processor.py       # PDF extraction & chunking
│   ├── vector_store.py        # ChromaDB + Gemini Embeddings
│   └── retriever.py           # Similarity search logic
├── features/
│   ├── revision_plan.py       # Study plan generator
│   ├── flashcards.py          # Q&A pair generator
│   ├── quiz.py                # MCQ generator
│   └── chat.py                # RAG-based chat logic
├── frontend/                  # React + Vite Application
└── requirements.txt           # Python dependencies
```

---

##  How It Works (RAG Pipeline)

1. **Upload**: PDFs are uploaded and split into optimized text chunks using `pdf_processor.py`.
2. **Indexing**: Chunks are converted into vector embeddings using `gemini-embedding-001` and stored in a local **ChromaDB**.
3. **Retrieval**: When you request a plan or ask a question, the system finds the most relevant parts of your notes using `retriever.py`.
4. **Generation**: The retrieved context is sent to **Gemini Flash** to generate accurate, grounded study aids.

---

##  Requirements

*   **Python 3.10+**
*   **Node.js 18+**
*   **Google Gemini API Key** (Get one at [Google AI Studio](https://aistudio.google.com/app/apikey))

---

##  Privacy

Your study materials are processed in-memory and stored locally in the `./chroma_db/` folder. Data is only sent to the Google Gemini API for the purpose of generating embeddings and responses; it is never stored permanently on external servers by this application.
