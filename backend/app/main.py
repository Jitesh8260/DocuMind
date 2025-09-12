from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.routers import auth, docs, query_routes

app = FastAPI(title="DocuMind Backend 🚀")

# ✅ CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # frontend ka exact URL
    allow_credentials=True,                   
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ SessionMiddleware with cross-site cookie
app.add_middleware(
    SessionMiddleware,
    secret_key="super-secret-session-key",
    same_site="none",  # cross-site cookies ke liye
    https_only=False   # local dev ke liye
)

# Routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(docs.router, prefix="/docs", tags=["Docs Management"])
app.include_router(query_routes.router, prefix="/query", tags=["Query Docs"])

@app.get("/")
def root():
    return {"message": "DocuMind Backend is running 🚀"}
