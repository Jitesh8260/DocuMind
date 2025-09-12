# app/workflows/process_docs.py

from typing import Optional, List
from app.services.google_service import get_doc_content, list_docs
from app.services.vector_store_service import create_vector_store_from_text
from langchain.text_splitter import RecursiveCharacterTextSplitter
import logging

logger = logging.getLogger(__name__)


# -----------------------------
# Process multiple selected docs
# -----------------------------
def process_user_docs(selected_doc_ids: Optional[List[str]] = None):
    """
    Fetch selected docs from Google Drive, create vector store, and persist.
    
    Args:
        selected_doc_ids (List[str], optional): List of Google Doc IDs to process. 
            If None, all docs are processed.
    
    Returns:
        dict: Summary of processed docs
    """
    docs = list_docs()
    if not docs:
        logger.warning("No documents found in Google Drive.")
        return {"message": "No documents found"}

    # Filter only selected docs if provided
    if selected_doc_ids:
        docs = [d for d in docs if d["id"] in selected_doc_ids]

    processed_docs = []
    for doc in docs:
        logger.info(f"Processing document: {doc['name']} ({doc['id']})")
        content = get_doc_content(doc["id"])
        if content:
            # Create/Update Chroma vector store
            vectordb = create_vector_store_from_text(content, doc["id"])
            
            # Count chunks
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=200, chunk_overlap=50)
            chunks = text_splitter.split_text(content)

            processed_docs.append({
                "doc_id": doc["id"],
                "name": doc["name"],
                "chunks": len(chunks)
            })
        else:
            logger.warning(f"Document {doc['name']} is empty. Skipping.")

    logger.info("✅ All selected docs processed and stored in Chroma.")
    return {
        "message": "Selected docs processed and stored in Chroma ✅",
        "processed_docs": processed_docs
    }


# -----------------------------
# Process single document
# -----------------------------
def process_single_doc(doc_id: str):
    """
    Fetch ONE doc by ID, create vector store, and persist.

    Args:
        doc_id (str): Google Doc ID

    Returns:
        dict: Processing result
    """
    content = get_doc_content(doc_id)
    if not content:
        logger.error(f"Document {doc_id} not found or empty.")
        return {"error": f"Document {doc_id} not found or empty"}

    # Create/Update Chroma vector store
    vectordb = create_vector_store_from_text(content, doc_id)

    # Count chunks
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=200, chunk_overlap=50)
    chunks = text_splitter.split_text(content)

    logger.info(f"✅ Document {doc_id} processed and stored in Chroma with {len(chunks)} chunks.")
    return {
        "message": f"Document {doc_id} processed and stored in Chroma ✅",
        "doc_id": doc_id,
        "chunks": len(chunks)
    }
