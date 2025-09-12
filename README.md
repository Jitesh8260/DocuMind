# 📘 DocuMind

**DocuMind** is a Retrieval-Augmented Generation (RAG) powered chatbot with Google Docs integration.  
It enables users to sign in with their Google account, fetch and add Google Docs into a knowledge base (KB), and interact with a chatbot that retrieves relevant context from those documents to answer queries.

---

## ✨ Features

- 🔑 **Google Authentication (OAuth 2.0)**  
  Users can securely log in with their Google account.

- 📄 **Google Docs Integration**  
  View all documents in your account and select which ones to add to the chatbot’s KB.

- 🤖 **RAG-powered Chatbot**  
  - Retrieves relevant document chunks.  
  - Generates accurate answers based on the user’s Docs.  
  - Falls back to general knowledge if the answer is not found in Docs.

- 🗂 **Knowledge Base Management**  
  - Add or remove Docs from KB.  
  - Query multiple documents at once.  
  - Skip duplicate documents automatically.

- 📝 **Summarization (Bonus)**  
  Ability to generate summaries of selected documents using LLM.

- 🌐 **Frontend UI**  
  Clean React + Tailwind interface with a live chat panel.

---

## 🛠️ Tech Stack

### Backend
- **Python**  
- [FastAPI](https://fastapi.tiangolo.com/) – API framework  
- [ChromaDB](https://www.trychroma.com/) – Vector database  
- [LangChain](https://www.langchain.com/) – RAG pipeline  
- Hugging Face Inference API – Embedding + LLMs

### Frontend
- **React (JavaScript)**  
- **TailwindCSS** – styling  
- Chat panel UI for interactive experience

---

## 📚 RAG Pipeline Flow

1. **User Query** → Sent to backend with selected KB Doc IDs.  
2. **Vector Retrieval** → Relevant chunks retrieved from ChromaDB.  
3. **LLM Response** → Hugging Face model generates an answer.  
4. **Fallback** → If KB has no relevant info, response is generated from general knowledge.  

---

## 🚀 Getting Started

### Prerequisites
- Python 3.12+  
- Node.js & npm  
- Google Cloud credentials (OAuth 2.0 Client ID & Secret)  
- Hugging Face API key

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate   # On Linux/Mac
venv\Scripts\activate      # On Windows

pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

---

## 📌 Assignment Requirements Checklist

- ✅ Google OAuth2.0 login  
- ✅ Fetch Google Docs  
- ✅ Select and add Docs to KB  
- ✅ RAG pipeline with embeddings + Hugging Face LLM  
- ✅ Explicit fallback when no KB answer  
- ✅ Interactive web-based chatbot UI  

**Bonus Implemented**  
- ✅ Summarization  
- ✅ Multi-document querying  

---

## 📦 Deployment
The project can be deployed on any cloud provider:  
- Backend → Render / Railway / GCP / AWS  
- Frontend → Vercel / Netlify  

---

## 📜 License
This project is for **CodeMate AI Campus Hiring Assignment**.  