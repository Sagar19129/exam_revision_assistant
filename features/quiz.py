"""
quiz.py
-------
Generates MCQ quiz questions from PDF content.
Uses google-genai SDK directly (Python 3.14 compatible).
"""

from rag.retriever import get_relevant_context
from features.model_config import get_client, MODEL, parse_json_response

PROMPT_TEMPLATE = """
You are a helpful exam preparation assistant. Based ONLY on the study material below, generate {num_questions} multiple-choice questions.

--- STUDY MATERIAL ---
{context}
----------------------

Return the questions as a valid JSON array. Each item must have exactly these keys:
- "question": the question text
- "options": a list of exactly 4 strings, each starting with the label e.g. "A) Paris"
- "answer": the correct option label only, e.g. "A"
- "explanation": a brief explanation of why the answer is correct

Example:
[
  {{
    "question": "What is the capital of France?",
    "options": ["A) London", "B) Berlin", "C) Paris", "D) Madrid"],
    "answer": "C",
    "explanation": "Paris is the capital and largest city of France."
  }}
]

Return ONLY the JSON array. No extra text, no markdown fences.
"""


def generate_quiz(vector_store, topic: str = "", num_questions: int = 5) -> list:
    query = topic if topic.strip() else "important concepts, facts, definitions"
    context = get_relevant_context(vector_store, query=query, k=3)
    prompt = PROMPT_TEMPLATE.format(context=context, num_questions=num_questions)

    client = get_client()
    response = client.models.generate_content(model=MODEL, contents=prompt)
    questions = parse_json_response(response.text)
    return [
        q for q in questions
        if all(k in q for k in ("question", "options", "answer", "explanation"))
    ]

