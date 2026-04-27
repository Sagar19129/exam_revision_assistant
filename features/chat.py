"""
chat.py
-------
Answers free-form user questions grounded in the uploaded PDF content.
Uses RAG: retrieves the most relevant chunks, then asks Gemini to answer
only from that context — so the answer is always tied to the study material.

Accepts an optional conversation history so the model can resolve follow-up
questions like "explain that further" correctly.
"""

from rag.retriever import get_relevant_context
from features.model_config import get_client, MODEL

# ── Prompt ─────────────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are a helpful study assistant. Answer the student's question
using ONLY the study material provided below. If the answer is not covered in the
material, say so honestly — do not make things up.

Keep answers clear, concise, and student-friendly. Use bullet points or short
paragraphs where appropriate.

--- STUDY MATERIAL ---
{context}
----------------------
"""

HISTORY_TEMPLATE = "Previous conversation:\n{history}\n\n"

USER_TEMPLATE = "Student question: {question}"


def answer_question(vector_store, question: str, history: list = None) -> str:
    """
    Retrieve relevant context from the vector store and answer the question.

    Args:
        vector_store : ChromaDB Chroma instance
        question     : The user's latest message
        history      : Optional list of {"role": "user"|"assistant", "content": str}

    Returns:
        A plain-text answer string from Gemini.
    """
    # Retrieve top-k relevant chunks for the question
    context = get_relevant_context(vector_store, query=question, k=4)

    # Build the prompt
    prompt_parts = [SYSTEM_PROMPT.format(context=context)]

    # Append recent conversation turns (last 6 messages) for follow-up awareness
    if history:
        recent = history[-6:]
        history_text = "\n".join(
            f"{'Student' if h['role'] == 'user' else 'Assistant'}: {h['content']}"
            for h in recent
        )
        prompt_parts.append(HISTORY_TEMPLATE.format(history=history_text))

    prompt_parts.append(USER_TEMPLATE.format(question=question))

    full_prompt = "\n".join(prompt_parts)

    client = get_client()
    response = client.models.generate_content(
        model=MODEL,
        contents=full_prompt,
    )
    return response.text
