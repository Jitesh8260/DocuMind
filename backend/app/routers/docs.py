from fastapi import APIRouter
from typing import List
from app.services.google_service import list_docs, get_doc_content
from app.workflows.process_docs import process_user_docs, process_single_doc

router = APIRouter()

# --------------------------
# List Google Docs
# --------------------------
@router.get("/docx")
def get_docs():
    files = list_docs()
    if not files:
        return {"error": "User not authenticated"}
    return {"docs": files}

# --------------------------
# Get content of a single doc
# --------------------------
@router.get("/docs/{doc_id}")
def get_doc(doc_id: str):
    content = get_doc_content(doc_id)
    if not content:
        return {"error": "User not authenticated"}
    return {"doc_id": doc_id, "content": content}

# --------------------------
# Process multiple selected docs
# --------------------------
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

# --------------------------
# Process single doc
# --------------------------
@router.post("/process_doc/{doc_id}")
def process_doc_route(doc_id: str):
    result = process_single_doc(doc_id)
    return {
        "message": f"Doc {doc_id} processed",
        "result": result
    }
