from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from app.models.token_model import tokens_db
from app.config import CLIENT_ID, CLIENT_SECRET

def get_credentials(user_key="user"):
    """Return refresh-token safe Credentials object."""
    if user_key not in tokens_db:
        return None
    token_info = tokens_db[user_key]
    creds = Credentials(
        token=token_info["token"],
        refresh_token=token_info.get("refresh_token"),
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        token_uri="https://oauth2.googleapis.com/token"
    )
    return creds

def list_docs(user_key="user", page_size=10):
    creds = get_credentials(user_key)
    if not creds:
        return None
    service = build("drive", "v3", credentials=creds)
    results = service.files().list(
        q="mimeType='application/vnd.google-apps.document'",
        pageSize=page_size,
        fields="files(id, name)"
    ).execute()
    return results.get("files", [])

def get_doc_content(doc_id, user_key="user"):
    creds = get_credentials(user_key)
    if not creds:
        return None
    service = build("docs", "v1", credentials=creds)
    doc = service.documents().get(documentId=doc_id).execute()

    content = ""
    for element in doc.get("body", {}).get("content", []):
        paragraph = element.get("paragraph")
        if paragraph:
            for elem in paragraph.get("elements", []):
                text_run = elem.get("textRun")
                if text_run:
                    content += text_run.get("content", "")
    return content
