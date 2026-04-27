import os, re, tempfile
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

def load_and_split_pdfs(uploaded_files) -> list:
    all_chunks = []
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=400, chunk_overlap=50, separators=["\n\n", "\n", ".", " "])

    for f in uploaded_files:
        filename = getattr(f, "filename", None) or getattr(f, "name", "unknown.pdf")
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(f.read())
            tmp_path = tmp.name
        try:
            pages = PyPDFLoader(tmp_path).load()
            for doc in pages:
                doc.page_content = re.sub(r"\s+", " ", doc.page_content).strip()
                doc.metadata["source_filename"] = filename
            all_chunks.extend(splitter.split_documents(pages))
        finally:
            os.unlink(tmp_path)

    return all_chunks
