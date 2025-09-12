import React, { useState, useEffect } from "react";
import { Bot, ArrowRight, Shield, Sparkles } from 'lucide-react';
import * as api from "../services/api";

export default function Login({ setAuthed }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleLogin = () => {
    // Redirect user to Google OAuth login
    api.login(); 
    // user login ke baad backend se redirect ho jaayega dashboard pe
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden flex items-center justify-center">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
        
        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Login Container */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo and Brand */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Bot className="w-9 h-9 text-white" />
            </div>
            <span className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Documind
            </span>
          </div>
          
          {/* Floating Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-4 animate-fade-in">
            <Sparkles className="w-4 h-4 text-yellow-400 mr-2" />
            <span className="text-sm text-gray-300">AI-Powered Document Intelligence</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-gray-300 text-lg">
              Access your intelligent document assistant
            </p>
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
              <Shield className="w-4 h-4 text-green-400 mr-2" />
              <span className="text-sm text-green-300">Secure OAuth 2.0</span>
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="group relative w-full px-8 py-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-xl font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 mb-6"
          >
            <span className="relative z-10 flex items-center justify-center">
              <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Login with Google
              <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
          </button>

          {/* Features Preview */}
          <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/10">
            <div className="text-center">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Bot className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-xs text-gray-400">Smart AI Chat</span>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Shield className="w-4 h-4 text-pink-400" />
              </div>
              <span className="text-xs text-gray-400">Secure Access</span>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-gray-400 text-sm mt-8">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        .animate-fade-in { animation: fade-in 1s ease-out; }
        .animate-float { animation: float linear infinite; }
      `}</style>
    </div>
  );
}