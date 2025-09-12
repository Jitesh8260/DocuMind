# app/workflows/query_docs_runnable.py
from dotenv import load_dotenv
import os
import logging
from pathlib import Path
from typing import List, Tuple, Optional

from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEndpoint, ChatHuggingFace, HuggingFaceEmbeddings
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableParallel, RunnablePassthrough, RunnableLambda
from langchain_core.output_parsers import StrOutputParser
from langchain.schema import AIMessage

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

HF_TOKEN = os.getenv("HF_TOKEN")
HF_MODEL = os.getenv("HF_MODEL", "openai/gpt-oss-120b")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")

# -----------------------------
# Embeddings
# -----------------------------
embedding_model = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)

# -----------------------------
# Chroma DB
# -----------------------------
vectordb = None
try:
    persist_path = Path(PERSIST_DIR)
    if persist_path.exists() and any(persist_path.iterdir()):
        vectordb = Chroma(persist_directory=PERSIST_DIR, embedding_function=embedding_model)
        logger.info(f"Chroma DB loaded from {PERSIST_DIR}")
    else:
        logger.warning(f"No existing data in {PERSIST_DIR}")
except Exception as e:
    logger.error(f"Failed to initialize Chroma DB: {e}")

# -----------------------------
# HuggingFace Endpoint LLM
# -----------------------------
llm_endpoint = HuggingFaceEndpoint(
    model=HF_MODEL,
    task="text-generation",
    huggingfacehub_api_token=HF_TOKEN,
    max_new_tokens=512
)
chat_model = ChatHuggingFace(llm=llm_endpoint)

# -----------------------------
# Prompt
# -----------------------------
prompt = PromptTemplate(
    template="""
You are a helpful assistant.
Answer ONLY from the provided context.
If the context is insufficient, at first you say 'I don't know'.
Then say "This is the answer from my knowledge base".
Then answer without referring to the context provided above.

{context}
Question: {question}
""",
    input_variables=['context', 'question']
)
parser = StrOutputParser()

# -----------------------------
# Helpers
# -----------------------------
def format_docs(retrieved_docs):
    return "\n\n".join(doc.page_content for doc in retrieved_docs)

# -----------------------------
# Main query function using Runnable style
# -----------------------------
def ask_doc_runnable(question: str, selected_doc_ids: Optional[List[str]] = None) -> Tuple[str, List[str]]:
    if not question.strip():
        return "Please provide a valid question.", []

    if vectordb is None:
        ans_msg = chat_model.invoke(question)
        answer = ans_msg.content if isinstance(ans_msg, AIMessage) else str(ans_msg)
        return answer, []

    # Vector DB search
    search_kwargs = {"k": 3}
    if selected_doc_ids:
        search_kwargs["filter"] = {"doc_id": {"$in": selected_doc_ids}}

    docs = vectordb.similarity_search(question, **search_kwargs)
    if not docs:
        ans_msg = chat_model.invoke(question)
        answer = ans_msg.content if isinstance(ans_msg, AIMessage) else str(ans_msg)
        return answer, []

    sources = [d.page_content[:200] + "..." if len(d.page_content) > 200 else d.page_content for d in docs]

    # RunnableParallel style chain
    parallel_chain = RunnableParallel({
        'context': RunnableLambda(lambda _: format_docs(docs)),  # Chroma search already done
        'question': RunnablePassthrough()
    })

    main_chain = parallel_chain | prompt | chat_model | parser

    answer = main_chain.invoke(question)
    return answer, sources

# -----------------------------
# Health check
# -----------------------------
def health_check() -> dict:
    status = {"llm_api": False, "embedding_api": False, "vectordb": vectordb is not None, "hf_token": bool(HF_TOKEN)}
    try:
        resp = chat_model.invoke("Hello")
        resp_text = resp.content if isinstance(resp, AIMessage) else str(resp)
        status["llm_api"] = bool(resp_text)
    except Exception as e:
        logger.error(f"LLM health check failed: {e}")
    try:
        emb = embedding_model.embed_query("test")
        status["embedding_api"] = bool(emb)
    except Exception as e:
        logger.error(f"Embedding health check failed: {e}")
    return status

# -----------------------------
# Quick test
# -----------------------------
if __name__ == "__main__":
    print("Health check:", health_check())
    ans, src = ask_doc_runnable("What is a binary search?", None)
    print("Answer:", ans)
    print("Sources:", src)
