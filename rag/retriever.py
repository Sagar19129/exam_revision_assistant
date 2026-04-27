from langchain_chroma import Chroma

def get_relevant_context(vector_store: Chroma, query: str, k: int = 6) -> str:
    docs = vector_store.similarity_search(query, k=k)
    return "\n\n".join(doc.page_content for doc in docs)
