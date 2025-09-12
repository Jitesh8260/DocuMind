from fastapi import FastAPI
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, docs, query_routes

load_dotenv()

app = FastAPI(title="DocuMind Backend 🚀")

# CORS (frontend integration)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ya frontend URL
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with prefixes and tags
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(docs.router, prefix="/docs", tags=["Docs Management"])
app.include_router(query_routes.router, prefix="/query", tags=["Query Docs"])

@app.get("/")
def root():
    return {"message": "DocuMind Backend is running 🚀"}
