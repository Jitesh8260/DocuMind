# app/services/vector_store_service.py
import os
import logging
import hashlib
from pathlib import Path
from typing import Optional

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma

logger = logging.getLogger(__name__)

# -----------------------------
# Hugging Face embeddings (lazy-loaded)
# -----------------------------
HF_TOKEN = os.getenv("HF_TOKEN")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "sentence-transformers/paraphrase-MiniLM-L3-v2")

_embeddings_model = None  # lazy-loaded

def get_embeddings_model():
    global _embeddings_model
    if _embeddings_model is None:
        from langchain_huggingface import HuggingFaceEmbeddings
        _embeddings_model = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
        logger.info(f"Hugging Face embeddings model '{EMBEDDING_MODEL}' initialized.")
    return _embeddings_model

# -----------------------------
# Vector store (lazy-loaded)
# -----------------------------
_vectordb = None

def get_vectordb(persist_dir: str = "./chroma_db") -> Optional[Chroma]:
    global _vectordb
    if _vectordb is None:
        persist_path = Path(persist_dir)
        if persist_path.exists() and any(persist_path.iterdir()):
            _vectordb = Chroma(
                persist_directory=persist_dir,
                embedding_function=get_embeddings_model()
            )
            logger.info(f"Chroma DB loaded from {persist_dir}")
        else:
            logger.warning(f"No existing data in {persist_dir}")
    return _vectordb

# -----------------------------
# Create/update vector store from text
# -----------------------------
def create_vector_store_from_text(
    content: str,
    doc_id: str,
    persist_dir: str = "./chroma_db"
) -> Chroma:
    """
    Split text into chunks and add to Chroma vector store with unique per-chunk IDs.
    Follows lazy-loading embeddings pattern from query_docs.
    """
    # Ensure persistence directory exists
    Path(persist_dir).mkdir(parents=True, exist_ok=True)

    # Load embeddings
    embedding_fn = get_embeddings_model()

    # Initialize or get vectordb
    vectordb = get_vectordb(persist_dir)
    if vectordb is None:
        vectordb = Chroma(persist_directory=persist_dir, embedding_function=embedding_fn)

    # Hash for doc
    base_id = hashlib.md5(doc_id.encode()).hexdigest()[:8]

    # Split text
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=200, chunk_overlap=50)
    chunks = [c for c in text_splitter.split_text(content) if c.strip()]
    if not chunks:
        logger.warning(f"Document '{doc_id}' has no valid chunks, skipping.")
        return vectordb

    # Unique chunk IDs
    chunk_ids = [f"{doc_id}_{base_id}_{i}" for i in range(len(chunks))]

    # Skip if already exists
    try:
        existing = vectordb.get(ids=chunk_ids)
        if existing and existing["ids"]:
            logger.info(f"Document '{doc_id}' already exists in DB. Skipping embedding.")
            return vectordb
    except Exception as e:
        logger.debug(f"No existing chunks found for '{doc_id}': {e}")

    # Add texts
    try:
        vectordb.add_texts(
            texts=chunks,
            metadatas=[{"doc_id": doc_id} for _ in chunks],
            ids=chunk_ids
        )
        vectordb.persist()
    except Exception as e:
        logger.error(f"Failed to add texts for doc '{doc_id}': {e}")
        raise

    logger.info(f"✅ Document '{doc_id}' processed with {len(chunks)} chunks.")
    return vectordb
