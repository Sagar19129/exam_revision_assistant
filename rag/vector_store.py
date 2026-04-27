import os
from typing import List
from langchain_core.embeddings import Embeddings
from langchain_chroma import Chroma
from google import genai

class GeminiEmbeddings(Embeddings):
    def __init__(self):
        self.client = genai.Client(api_key=os.environ["GOOGLE_API_KEY"])
        self.model = "models/gemini-embedding-001"

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        try:
            return [self.client.models.embed_content(model=self.model, contents=t).embeddings[0].values for t in texts]
        except Exception as e:
            print(f"EMBEDDING ERROR: {e}")
            raise e

    def embed_query(self, text: str) -> List[float]:
        try:
            res = self.client.models.embed_content(model=self.model, contents=text)
            return res.embeddings[0].values
        except Exception as e:
            print(f"EMBEDDING QUERY ERROR: {e}")
            raise e



def build_vector_store(chunks: list) -> Chroma:
    return Chroma.from_documents(documents=chunks, embedding=GeminiEmbeddings(), collection_name="exam_revision", persist_directory="./chroma_db")
