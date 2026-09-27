import React from 'react';
import { Sparkles, BookOpen, Clock, Command, Bookmark, CheckCircle2, AlertCircle } from 'lucide-react';

interface HeaderProps {
  onOpenShortcuts: () => void;
  onOpenSessions: () => void;
  savedCount: number;
  serverStatus: {
    status: string;
    llmConfigured: boolean;
    provider: string;
  };
}

export const Header: React.FC<HeaderProps> = ({
  onOpenShortcuts,
  onOpenSessions,
  savedCount,
  serverStatus,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-display font-bold text-lg text-white tracking-tight">
                MindForge <span className="text-indigo-400">AI</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Interactive Study Tool
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Structured Active-Recall & Quiz Engine
            </p>
          </div>
        </div>

        {/* Right Status & Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Gemini AI Live Status Pill */}
          <div
            className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs border bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
            title="Connected to Google Gemini 3.6 Flash"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium">Gemini 3.6 Flash</span>
          </div>

          {/* Shortcuts button */}
          <button
            onClick={onOpenShortcuts}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-colors shadow-sm"
            title="Keyboard Shortcuts"
          >
            <Command className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Shortcuts</span>
            <kbd className="hidden sm:inline-block px-1 py-0.2 bg-slate-900 border border-slate-700 rounded text-[10px] text-slate-400">
              ?
            </kbd>
          </button>

          {/* Saved Sessions button */}
          <button
            onClick={onOpenSessions}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-200 hover:text-white bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/30 transition-colors relative"
          >
            <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
            <span>Saved Decks</span>
            {savedCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold leading-none text-white bg-indigo-600 rounded-full">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
