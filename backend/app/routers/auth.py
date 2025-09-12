from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse, JSONResponse
from app.config import create_flow
from app.models.token_model import tokens_db

router = APIRouter()


@router.get("/login")
def login(request: Request):
    flow = create_flow()
    authorization_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent"
    )

    # ✅ Save OAuth state in session
    request.session["state"] = state
    return RedirectResponse(authorization_url)


@router.get("/callback")
def callback(request: Request):
    state = request.session.get("state")
    if not state:
        return JSONResponse({"error": "Missing state in session"}, status_code=400)

    flow = create_flow()
    flow.fetch_token(authorization_response=str(request.url))
    credentials = flow.credentials

    # ✅ Save tokens in memory (temp)
    tokens_db["user"] = {
        "token": credentials.token,
        "refresh_token": credentials.refresh_token,
        "id_token": credentials.id_token,
    }

    # ✅ Fetch user info from Google
    session = flow.authorized_session()
    user_info = session.get("https://www.googleapis.com/oauth2/v2/userinfo").json()
    tokens_db["user_info"] = user_info

    # ✅ Save user info in session
    request.session["user"] = user_info

    return RedirectResponse(url="https://docu-mind-two.vercel.app/dashboard")


@router.get("/me")
async def me(request: Request):
    user = request.session.get("user")
    if not user:
        return JSONResponse({"authenticated": False}, status_code=401)
    return {"authenticated": True, "user": user}
