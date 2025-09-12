# app/services/vector_store_service.py

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# -----------------------------
# Embeddings model
# -----------------------------
embeddings_model = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")

# -----------------------------
# Vector store creation
# -----------------------------
def create_vector_store_from_text(
    content: str,
    doc_id: str,
    persist_dir: str = "./chroma_db"
) -> Chroma:
    """
    Split text into chunks and create persistent Chroma vector store with metadata.

    Args:
        content (str): The full text content of the document.
        doc_id (str): Unique document identifier.
        persist_dir (str): Directory to store Chroma DB.

    Returns:
        Chroma: Persistent vector store instance.
    """
    try:
        vectordb = Chroma(
            persist_directory=persist_dir,
            embedding_function=embeddings_model
        )
    except Exception as e:
        logger.error(f"Failed to initialize Chroma DB: {e}")
        raise

    # Check for duplicates
    try:
        existing_ids = [m["doc_id"] for m in vectordb.get()['metadatas']]
        if doc_id in existing_ids:
            logger.info(f"Document '{doc_id}' already exists in DB. Skipping embedding.")
            return vectordb
    except Exception:
        # Empty DB
        pass

    # Split text into chunks
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=200, chunk_overlap=50)
    chunks = text_splitter.split_text(content)

    # Add chunks to vector store with metadata
    vectordb.add_texts(
        texts=chunks,
        metadatas=[{"doc_id": doc_id} for _ in chunks]
    )
    vectordb.persist()
    logger.info(f"Document '{doc_id}' processed with {len(chunks)} chunks.")
    return vectordb
