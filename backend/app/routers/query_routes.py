# app/routers/query_routes.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import logging

# Runnable-style query function
from app.workflows.query_docs import ask_doc_runnable, health_check

logger = logging.getLogger(__name__)
router = APIRouter()

# -----------------------------
# Request/Response Models
# -----------------------------
class QueryRequest(BaseModel):
    question: str
    selected_doc_ids: Optional[List[str]] = None

class QueryResponse(BaseModel):
    question: str
    answer: str
    sources: List[str]
    status: str = "success"

class HealthResponse(BaseModel):
    llm_api: bool
    embedding_api: bool
    vectordb: bool
    hf_token: bool

# -----------------------------
# Query endpoint
# -----------------------------
@router.post("/query_docs", response_model=QueryResponse)
async def query_documents(request: QueryRequest):
    try:
        answer, sources = ask_doc_runnable(
            question=request.question.strip(),
            selected_doc_ids=request.selected_doc_ids
        )
        # AIMessage handling done inside ask_doc_runnable
        status = "success" if answer and not str(answer).startswith("Error:") else "partial_error"
        return QueryResponse(
            question=request.question,
            answer=answer,
            sources=sources,
            status=status
        )
    except Exception as e:
        logger.exception(f"Query error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process query")

# -----------------------------
# Health check
# -----------------------------
@router.get("/health", response_model=HealthResponse)
async def check_health():
    try:
        health = health_check()
        return HealthResponse(
            llm_api=health.get("llm_api", False),
            embedding_api=health.get("embedding_api", False),
            vectordb=health.get("vectordb", False),
            hf_token=health.get("hf_token", False)
        )
    except Exception as e:
        logger.exception(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail="Health check failed")

# -----------------------------
# Optional: Google Docs processing endpoints
# -----------------------------
from app.services.google_service import list_docs, get_doc_content
from app.workflows.process_docs import process_user_docs, process_single_doc

# List Google Docs
@router.get("/docx")
def get_docs():
    files = list_docs()
    if not files:
        return {"error": "User not authenticated or no docs found"}
    return {"docs": files}

# Get content of a single doc
@router.get("/docs/{doc_id}")
def get_doc(doc_id: str):
    content = get_doc_content(doc_id)
    if not content:
        return {"error": "Document not found or empty"}
    return {"doc_id": doc_id, "content": content}

# Process multiple selected docs
@router.post("/process_docs")
def process_docs_route(selected_doc_ids: List[str]):
    """
    selected_doc_ids: List of Google Doc IDs from frontend
    Only these docs will be embedded into Chroma DB.
    """
    processed_docs = process_user_docs(selected_doc_ids)
    return {
        "message": "Selected docs processed and stored in Chroma ✅",
        "processed_docs": processed_docs
    }

# Process single doc
@router.post("/process_doc/{doc_id}")
def process_doc_route(doc_id: str):
    result = process_single_doc(doc_id)
    return {
        "message": f"Doc {doc_id} processed",
        "result": result
    }
