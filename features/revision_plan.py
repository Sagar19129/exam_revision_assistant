from rag.retriever import get_relevant_context
from features.model_config import get_client, MODEL

PROMPT = """You are a friendly study assistant. Based ONLY on the study material below, create a clear revision plan.

--- STUDY MATERIAL ---
{context}
----------------------

Additional info: {exam_date_info}

Structure your response as:
1. Overview of key topics
2. A day-by-day or week-by-week revision schedule
3. Study tips tailored to these topics

Keep the tone friendly and easy to follow.
"""

def generate_revision_plan(vector_store, exam_date_info: str = "") -> str:
    context = get_relevant_context(vector_store, "main topics, chapters, concepts", k=3)
    prompt = PROMPT.format(context=context, exam_date_info=exam_date_info or "No specific date provided")
    client = get_client()
    return client.models.generate_content(model=MODEL, contents=prompt).text
