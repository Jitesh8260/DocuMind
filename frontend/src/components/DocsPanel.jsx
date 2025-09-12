import React, { useState } from "react";
import { FileText, Eye, EyeOff, Sparkles, CheckSquare, Square, Plus, Trash2, Loader2 } from 'lucide-react';
import * as api from "../services/api";

export default function DocsPanel({
  docs = [],
  selected = new Set(),
  onToggle = () => {},
  onSelectAll = () => {},
  onClear = () => {},
  onAddToKB = () => {},
  onSummarize = async () => {},
  loading = false,
  title = "Docs",
  hideAddButton = false,
  addButtonText = "Add to KB",
}) {
  const [summarizingId, setSummarizingId] = useState(null);
  const [viewingDocId, setViewingDocId] = useState(null);
  const [docContent, setDocContent] = useState({});

  const handleSummarize = async (id) => {
    setSummarizingId(id);
    await onSummarize(id);
    setSummarizingId(null);
  };

  const handleViewContent = async (id) => {
    if (viewingDocId === id) {
      setViewingDocId(null);
      return;
    }
    setViewingDocId(id);
    if (!docContent[id]) {
      try {
        const content = await api.fetchDocContent(id);
        setDocContent((prev) => ({
          ...prev,
          [id]: content?.content || "No content available",
        }));
      } catch (err) {
        console.error("Failed to fetch doc content", err);
        setDocContent((prev) => ({ ...prev, [id]: "Error loading content" }));
      }
    }
  };

  const isKnowledgeBase = title === "Knowledge Base";

  return (
    <div className="flex flex-col h-full text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 ${isKnowledgeBase ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'} rounded-xl flex items-center justify-center`}>
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              {title}
            </h3>
            <p className="text-sm text-gray-400">
              {docs.length} {docs.length === 1 ? 'document' : 'documents'}
            </p>
          </div>
        </div>
        {loading && (
          <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
            <span className="text-xs text-blue-300">Loading...</span>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      <div className="p-6 border-b border-white/10">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onSelectAll}
            disabled={loading || docs.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-sm text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Select All</span>
          </button>
          
          <button
            onClick={onClear}
            disabled={loading || docs.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-sm text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Square className="w-4 h-4" />
            <span>Clear</span>
          </button>
          
          {!hideAddButton && (
            <button
              onClick={onAddToKB}
              disabled={loading || selected.size === 0}
              className={`flex items-center space-x-2 px-4 py-2 ${
                isKnowledgeBase 
                  ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500' 
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500'
              } rounded-xl text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105`}
            >
              {isKnowledgeBase ? (
                <Trash2 className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>{addButtonText}</span>
            </button>
          )}
        </div>
        
        {selected.size > 0 && (
          <div className="mt-3 flex items-center space-x-2 px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">
              {selected.size} {selected.size === 1 ? 'document' : 'documents'} selected
            </span>
          </div>
        )}
      </div>

      {/* Documents List */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading documents...</p>
            </div>
          </div>
        ) : docs.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/5 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 border border-white/10 mx-auto">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-400 mb-2">No documents found</p>
              <p className="text-sm text-gray-500">
                {isKnowledgeBase ? "Add documents from Google Docs to get started" : "Try refreshing or check your Google Drive"}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {docs.map((d) => (
              <div
                key={d.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all group"
              >
                <div className="flex items-start space-x-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => onToggle(d.id)}
                    className="mt-1 flex-shrink-0"
                  >
                    <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition-all ${
                      selected.has(d.id) 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-500' 
                        : 'border-white/30 hover:border-white/50'
                    }`}>
                      {selected.has(d.id) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>

                  {/* Document Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white truncate">
                          {d.name || "Untitled Document"}
                        </h4>
                        <p className="text-xs text-gray-400 font-mono mt-1 truncate">
                          {d.id}
                        </p>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleSummarize(d.id)}
                          disabled={summarizingId === d.id || loading}
                          className="px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-xs text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-1"
                        >
                          {summarizingId === d.id ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3" />
                              <span>Summarize</span>
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleViewContent(d.id)}
                          className="px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-xs text-white hover:bg-white/20 transition-all flex items-center space-x-1"
                        >
                          {viewingDocId === d.id ? (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Hide</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>View</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document Content */}
                {viewingDocId === d.id && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="bg-black/20 backdrop-blur-sm border border-white/5 rounded-xl p-4 max-h-48 overflow-auto">
                      <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                        {docContent[d.id] || (
                          <div className="flex items-center space-x-2 text-gray-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Loading content...</span>
                          </div>
                        )}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}