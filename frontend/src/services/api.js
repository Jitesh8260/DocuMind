const BASE = "https://documind-bhr7.onrender.com";


// 1️⃣ Redirect user to Google login
export function login() {
  window.location.href = `${BASE}/auth/login`;
}

// 2️⃣ Check if user is authenticated
export async function checkAuth() {
  try {
    const res = await fetch(`${BASE}/auth/me`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Auth check failed");
    return await res.json();
  } catch (err) {
    console.error("Auth check failed", err);
    return { authenticated: false };
  }
}

// 3️⃣ Fetch Google Docs list
export async function fetchDocs() {
  try {
    const res = await fetch(`${BASE}/documents/docx`, {
      credentials: "include",
    });
    const data = await res.json();
    if (data.error) {
      console.error("Docs fetch error:", data.error);
      return [];
    }
    return data.docs || [];
  } catch (err) {
    console.error("Fetch docs failed", err);
    return [];
  }
}

// 4️⃣ Add selected docs to knowledge base
export async function addDocsToKB(ids) {
  try {
    const res = await fetch(`${BASE}/documents/process_docs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(ids),
    });
    return await res.json();
  } catch (err) {
    console.error("Add docs failed", err);
    return { success: false };
  }
}

// 5️⃣ Summarize / process a single doc
export async function summarizeDoc(id) {
  try {
    const res = await fetch(`${BASE}/documents/process_doc/${id}`, {
      method: "POST",
      credentials: "include",
    });
    return await res.json();
  } catch (err) {
    console.error("Summarize failed", err);
    return { success: false };
  }
}

// 6️⃣ Chat query (old / general)
export async function chat(query) {
  try {
    const res = await fetch(`${BASE}/query/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ query }),
    });
    return await res.json();
  } catch (err) {
    console.error("Chat failed", err);
    return { answer: null };
  }
}

// 7️⃣ Fetch single doc content
export async function fetchDocContent(doc_id) {
  try {
    const res = await fetch(`${BASE}/documents/docs/${doc_id}`, {
      credentials: "include",
    });
    const data = await res.json();
    if (data.error) {
      console.error("Doc fetch error:", data.error);
      return null;
    }
    return data;
  } catch (err) {
    console.error("Fetch doc failed", err);
    return null;
  }
}

// 8️⃣ Query KB Docs (updated to match ChatPanel)
export async function queryDocs(question, selectedDocIds = []) {
  try {
    const payload = {
      question: question || "",
      selected_doc_ids: Array.isArray(selectedDocIds) ? selectedDocIds : [],
    };

    const res = await fetch(`${BASE}/query/query_docs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("Query request failed:", res.status, res.statusText);
      throw new Error(`Query failed with status ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error("Query failed", err);
    return { answer: "Error", sources: [] };
  }
}
