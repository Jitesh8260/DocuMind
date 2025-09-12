from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from app.config import flow
from app.models.token_model import tokens_db

router = APIRouter()

@router.get("/login")
def login():
    authorization_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent"
    )
    return RedirectResponse(authorization_url)

@router.get("/callback")
def callback(request: Request):
    flow.fetch_token(authorization_response=str(request.url))
    credentials = flow.credentials

    tokens_db["user"] = {
        "token": credentials.token,
        "refresh_token": credentials.refresh_token,
        "id_token": credentials.id_token,
    }

    session = flow.authorized_session()
    user_info = session.get("https://www.googleapis.com/oauth2/v2/userinfo").json()

    return {
        "message": "Login successful ✅",
        "user": user_info,
        "tokens_saved": bool(tokens_db.get("user"))
    }
