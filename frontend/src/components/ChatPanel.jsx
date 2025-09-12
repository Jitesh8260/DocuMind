import React, { useState } from "react";
import { Send, MessageCircle, Bot, User, FileText, Sparkles } from 'lucide-react';
import * as api from "../services/api";

export default function ChatPanel({ kbDocs = [], setKbDocs }) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  // Send query to KB
  const handleSendQuery = async () => {
    if (!question.trim()) return;

    const kbDocIds = kbDocs.map((d) => d.id);
    if (kbDocIds.length === 0) {
      alert("No documents in KB to query.");
      return;
    }

    setLoading(true);
    try {
      console.log("Sending query with KB doc IDs:", kbDocIds);
      const response = await api.queryDocs(question, kbDocIds);

      setChatHistory((prev) => [
        ...prev,
        { question, answer: response.answer, sources: response.sources },
      ]);
      setQuestion("");
    } catch (err) {
      console.error("Failed to send query", err);
      alert("Error while querying KB");
    } finally {
      setLoading(false);
    }
  };

  // Frontend KB helpers (optional use inside ChatPanel)
  const addToKB = (docsToAdd) => {
    const newDocs = docsToAdd.filter((d) => !kbDocs.some((k) => k.id === d.id));
    if (newDocs.length === 0) return;

    setKbDocs([...kbDocs, ...newDocs]);
    api.addDocsToKB(newDocs.map((d) => d.id))
      .then((res) => console.log("Docs processed:", res))
      .catch((err) => console.error("Processing failed", err));
  };

  const removeFromKB = (docIdsToRemove) => {
    setKbDocs(kbDocs.filter((d) => !docIdsToRemove.includes(d.id)));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendQuery();
    }
  };

  return (
    <div className="flex flex-col h-full text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              AI Assistant
            </h3>
            <p className="text-sm text-gray-400">
              {kbDocs.length} documents in knowledge base
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-300">Active</span>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-white/5 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 border border-white/10">
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Ready to help!</h3>
            <p className="text-gray-400 max-w-md">
              Ask questions about your documents in the knowledge base. I'll provide intelligent answers with source references.
            </p>
          </div>
        ) : (
          chatHistory.map((c, idx) => (
            <div key={idx} className="space-y-4">
              {/* User Question */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl rounded-tl-sm p-4">
                    <p className="text-white">{c.question}</p>
                  </div>
                </div>
              </div>

              {/* AI Answer */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/20 rounded-2xl rounded-tl-sm p-4">
                    <p className="text-white mb-3">{c.answer}</p>
                    {c.sources?.length > 0 && (
                      <div className="flex items-start space-x-2 pt-3 border-t border-white/10">
                        <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Sources:</p>
                          <div className="flex flex-wrap gap-1">
                            {c.sources.map((source, sourceIdx) => (
                              <span 
                                key={sourceIdx}
                                className="inline-flex items-center px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300"
                              >
                                {source}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Loading indicator */}
        {loading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/20 rounded-2xl rounded-tl-sm p-4">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                  <span className="text-gray-400 text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-white/10">
        <div className="relative">
          <input
            type="text"
            className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 pr-14 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about your documents..."
            disabled={loading}
          />
          <button
            onClick={handleSendQuery}
            disabled={loading || !question.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all duration-200 group"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Send className="w-5 h-5 text-white group-hover:translate-x-0.5 transition-transform" />
            )}
          </button>
        </div>
        
        {kbDocs.length === 0 && (
          <div className="flex items-center justify-center mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <div className="w-4 h-4 text-yellow-400 mr-2">⚠️</div>
            <span className="text-sm text-yellow-300">
              Add documents to Knowledge Base to start chatting
            </span>
          </div>
        )}
      </div>
    </div>
  );
}