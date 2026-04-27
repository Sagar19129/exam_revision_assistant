"""
flashcards.py
-------------
Generates flashcards (Q&A pairs) from PDF content.
Uses google-genai SDK directly (Python 3.14 compatible).
"""

from rag.retriever import get_relevant_context
from features.model_config import get_client, MODEL, parse_json_response

PROMPT_TEMPLATE = """
You are a helpful study assistant. Based ONLY on the study material below, generate {num_cards} flashcards.

--- STUDY MATERIAL ---
{context}
----------------------

Return the flashcards as a valid JSON array. Each item must have exactly two keys:
- "question": a clear, concise question
- "answer": a short but complete answer

Example:
[
  {{"question": "What is photosynthesis?", "answer": "The process by which plants convert sunlight into food using CO2 and water."}}
]

Return ONLY the JSON array. No extra text, no markdown fences.
"""


def generate_flashcards(vector_store, topic: str = "", num_cards: int = 10) -> list:
    query = topic if topic.strip() else "key concepts, definitions, important facts"
    context = get_relevant_context(vector_store, query=query, k=3)
    prompt = PROMPT_TEMPLATE.format(context=context, num_cards=num_cards)

    client = get_client()
    response = client.models.generate_content(model=MODEL, contents=prompt)
    cards = parse_json_response(response.text)
    return [c for c in cards if "question" in c and "answer" in c]
