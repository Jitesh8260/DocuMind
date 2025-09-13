from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse, JSONResponse
from app.config import create_flow
from app.models.token_model import tokens_db
import logging

router = APIRouter()
logger = logging.getLogger("uvicorn")  # Render logs me dikhega

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

    logger.info(f"🔑 Login started. State={state}")
    logger.info(f"➡️ Redirecting to Google: {authorization_url}")

    return RedirectResponse(authorization_url)


@router.get("/callback")
def callback(request: Request):
    logger.info(f"🔥 Callback hit! Full URL: {request.url}")
    logger.info(f"📦 Session data before state check: {request.session}")

    state = request.session.get("state")
    if not state:
        logger.warning("⚠️ Missing state in session")
        return JSONResponse({"error": "Missing state in session"}, status_code=400)

    flow = create_flow()
    flow.fetch_token(authorization_response=str(request.url))
    credentials = flow.credentials
    logger.info("✅ Token successfully fetched from Google")

    # ✅ Save tokens in memory (temp)
    tokens_db["user"] = {
        "token": credentials.token,
        "refresh_token": credentials.refresh_token,
        "id_token": credentials.id_token,
    }
    logger.info(f"🔒 Tokens saved in tokens_db: {list(tokens_db['user'].keys())}")

    # ✅ Fetch user info from Google
    session = flow.authorized_session()
    user_info = session.get("https://www.googleapis.com/oauth2/v2/userinfo").json()
    tokens_db["user_info"] = user_info
    logger.info(f"👤 User info: {user_info}")

    # ✅ Save user info in session
    request.session["user"] = user_info

    logger.info("🎯 Redirecting user to frontend dashboard")
    return RedirectResponse(url="https://docu-mind-two.vercel.app/dashboard")


@router.get("/me")
async def me(request: Request):
    user = request.session.get("user")
    logger.info(f"👀 /me called. Session user: {user}")
    if not user:
        return JSONResponse({"authenticated": False}, status_code=401)
    return {"authenticated": True, "user": user}
