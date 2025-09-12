# app/services/vector_store_service.py
import os
import logging
import hashlib
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings

logger = logging.getLogger(__name__)

# Load embeddings globally (only once)
embeddings_model = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")


def create_vector_store_from_text(
    content: str,
    doc_id: str,
    persist_dir: str = "./chroma_db"
) -> Chroma:
    """
    Split text into chunks and add to Chroma vector store with per-chunk unique IDs.
    Avoids duplicate ingestion of the same document.
    """

    # Ensure persistence directory exists
    os.makedirs(persist_dir, exist_ok=True)

    try:
        vectordb = Chroma(
            persist_directory=persist_dir,
            embedding_function=embeddings_model
        )
    except Exception as e:
        logger.error(f"Failed to initialize Chroma DB: {e}")
        raise

    # Generate stable hash for this document
    base_id = hashlib.md5(doc_id.encode()).hexdigest()[:8]

    # Split text into chunks
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=200, chunk_overlap=50)
    chunks = [c for c in text_splitter.split_text(content) if c.strip()]

    if not chunks:
        logger.warning(f"Document '{doc_id}' has no valid chunks, skipping.")
        return vectordb

    # Build unique chunk IDs
    chunk_ids = [f"{doc_id}_{base_id}_{i}" for i in range(len(chunks))]

    # Check if this document already exists
    try:
        existing = vectordb.get(ids=chunk_ids)
        if existing and existing["ids"]:
            logger.info(f"Document '{doc_id}' already exists in DB. Skipping embedding.")
            return vectordb
    except Exception as e:
        logger.debug(f"No existing chunks found for '{doc_id}': {e}")

    # Add chunks
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
