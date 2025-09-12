import React, { useEffect, useState } from "react";
import { Bot, LogOut, User, Settings } from 'lucide-react';
import DocsPanel from "./DocsPanel";
import ChatPanel from "./ChatPanel";
import * as api from "../services/api";

export default function Dashboard() {
  const [docs, setDocs] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [kbDocs, setKbDocs] = useState([]); // KB docs
  const [kbSelected, setKbSelected] = useState(new Set());
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    (async () => {
      setLoadingDocs(true);
      try {
        const docsList = await api.fetchDocs();
        setDocs(docsList);
      } catch (err) {
        console.error("Failed to load docs", err);
      } finally {
        setLoadingDocs(false);
      }
    })();
  }, []);

  // ---------- Available Docs ----------
  const onToggle = (id) => {
    const newSelected = new Set(selected);
    newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
    setSelected(newSelected);
  };
  const onSelectAll = () => setSelected(new Set(docs.map((d) => d.id)));
  const onClear = () => setSelected(new Set());

  const onAddToKB = async () => {
  if (selected.size === 0) return;
  setProcessing(true);
  try {
    const docsToAdd = docs.filter((d) => selected.has(d.id));

    // always active button, filter only backend call
    const newDocsForBackend = docsToAdd.filter((d) => !kbDocs.some((k) => k.id === d.id));

    // Update frontend KB immediately
    const newDocsForFrontend = docsToAdd.filter((d) => !kbDocs.some((k) => k.id === d.id));
    setKbDocs([...kbDocs, ...newDocsForFrontend]);

    // backend call only for new docs
    if (newDocsForBackend.length > 0) {
      await api.addDocsToKB(newDocsForBackend.map((d) => d.id));
      console.log("Processed new docs:", newDocsForBackend.map(d => d.name));
    }

    setSelected(new Set());
    alert("Docs added to KB ✅");
  } catch (err) {
    console.error(err);
    alert("Failed to add docs to KB");
  } finally {
    setProcessing(false);
  }
};

  const onSummarize = async (id) => {
    setProcessing(true);
    try {
      const res = await api.summarizeDoc(id);
      alert(res.message || "Doc summarized ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to summarize doc");
    } finally {
      setProcessing(false);
    }
  };

  // ---------- KB Docs ----------
  const onKbToggle = (id) => {
    const newSelected = new Set(kbSelected);
    newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
    setKbSelected(newSelected);
  };

  const onKbRemove = () => {
    if (kbSelected.size === 0) return;
    setKbDocs((prev) => prev.filter((d) => !kbSelected.has(d.id)));
    setKbSelected(new Set());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
        
        {/* Floating Particles */}
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-10 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Top Navigation */}
      <nav className="relative z-10 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Documind
              </span>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-gray-300 hover:text-white" />
              </button>
              <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <User className="w-5 h-5 text-gray-300 hover:text-white" />
              </button>
              <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <LogOut className="w-5 h-5 text-gray-300 hover:text-white" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Dashboard Content */}
      <div className="relative z-10 flex h-[calc(100vh-80px)] gap-6 p-6">
        {/* Available Docs Panel */}
        <div className="flex-1 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          <DocsPanel
            docs={docs}
            selected={selected}
            onToggle={onToggle}
            onSelectAll={onSelectAll}
            onClear={onClear}
            onAddToKB={onAddToKB}
            onSummarize={onSummarize}
            loading={loadingDocs || processing}
            title="Google Docs"
          />
        </div>

        {/* KB Docs Panel */}
        <div className="flex-1 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          <DocsPanel
            docs={kbDocs}
            selected={kbSelected}
            onToggle={onKbToggle}
            onSelectAll={() => setKbSelected(new Set(kbDocs.map((d) => d.id)))}
            onClear={() => setKbSelected(new Set())}
            onAddToKB={onKbRemove} // Remove button
            onSummarize={onSummarize}
            loading={processing}
            title="Knowledge Base"
            addButtonText="Remove from KB"
          />
        </div>

        {/* Chat Panel */}
        <div className="flex-1 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          <ChatPanel kbDocs={kbDocs} setKbDocs={setKbDocs} />
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(180deg); }
        }
        
        .animate-float { animation: float linear infinite; }
      `}</style>
    </div>
  );
}