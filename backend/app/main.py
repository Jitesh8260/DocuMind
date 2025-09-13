from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.routers import auth, docs, query_routes

app = FastAPI(title="DocuMind Backend 🚀")

# ✅ CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",         # local dev
        "https://docu-mind-two.vercel.app"  # production frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Session Middleware with cross-site cookie
app.add_middleware(
    SessionMiddleware,
    secret_key="super-secret-session-key",
    same_site="none",   # cross-site cookies ke liye
    https_only=False    # local dev ke liye (render me https hota hi hai)
)

# ✅ Routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
print("🔐 Auth routes registered at /auth")

app.include_router(docs.router, prefix="/documents", tags=["Docs Management"])
print("📄 Docs routes registered at /documents")

app.include_router(query_routes.router, prefix="/query", tags=["Query Docs"])
print("🤖 Query routes registered at /query")


# ✅ Root endpoints
@app.get("/")
def root():
    return {"message": "DocuMind Backend is running 🚀"}

@app.head("/")
def head_root():
    return {"message": "Everything is fine"}
