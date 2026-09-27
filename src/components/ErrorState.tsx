import React, { useState } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  Code,
  FileCode,
  WifiOff,
  Clock,
  Key,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { ApiError } from '../types/result';

interface ErrorStateProps {
  error: ApiError;
  onRetry: () => void;
  onReset: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  onReset,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getErrorBadge = () => {
    switch (error.type) {
      case 'MALFORMED_JSON':
        return {
          icon: <FileCode className="w-6 h-6 text-rose-400" />,
          title: 'Malformed AI Output (JSON Syntax Error)',
          badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          suggestion:
            'The LLM produced broken JSON formatting or interrupted mid-stream. We caught this before rendering to protect your UI.',
        };
      case 'INVALID_SCHEMA':
        return {
          icon: <ShieldAlert className="w-6 h-6 text-amber-400" />,
          title: 'Schema Validation Mismatch',
          badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          suggestion:
            'The AI response is missing required fields (like questions, options, or flashcards). Our strict runtime validator safely intercepted it.',
        };
      case 'EMPTY_RESPONSE':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
          title: 'Empty Response Received',
          badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          suggestion:
            'The AI model generated 0 bytes or an empty string. Try providing more detailed study notes.',
        };
      case 'TIMEOUT':
        return {
          icon: <Clock className="w-6 h-6 text-orange-400" />,
          title: 'Request Timed Out',
          badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
          suggestion:
            'The backend or AI provider took longer than 35 seconds to respond. Server might be under heavy load.',
        };
      case 'RATE_LIMITED':
        return {
          icon: <Clock className="w-6 h-6 text-purple-400" />,
          title: 'Provider Rate Limit Reached',
          badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          suggestion:
            'The API quota for this key was exceeded. Wait 15 seconds or use the demo fallback.',
        };
      case 'API_KEY_MISSING':
        return {
          icon: <Key className="w-6 h-6 text-cyan-400" />,
          title: 'API Key Configuration Required',
          badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          suggestion:
            'Add GEMINI_API_KEY to your .env file or load a pre-built offline study set.',
        };
      case 'SERVER_ERROR':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-rose-400" />,
          title: 'AI Generation Error',
          badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          suggestion:
            'The AI generation engine encountered a temporary issue. Click Retry Generation to request generation again.',
        };
      case 'NETWORK_ERROR':
      default:
        return {
          icon: <WifiOff className="w-6 h-6 text-rose-400" />,
          title: 'Backend Proxy Unreachable',
          badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          suggestion:
            'Could not establish connection with Express backend. Ensure the server is running and accessible.',
        };
    }
  };

  const info = getErrorBadge();

  return (
    <div className="w-full max-w-2xl mx-auto my-8 glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center border border-slate-700/80 shadow-inner shrink-0">
          {info.icon}
        </div>

        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${info.badgeColor}`}>
              {error.type}
            </span>
          </div>
          <h2 className="text-xl font-display font-bold text-white tracking-tight">
            {info.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            {error.message}
          </p>
        </div>
      </div>

      {/* Helpful explanation box */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed">
        <span className="font-semibold text-slate-100 block mb-1">
          Defensive Recovery Guidance:
        </span>
        {info.suggestion}
      </div>

      {/* Technical details toggle (for debugging & evaluators) */}
      {(error.details || error.rawResponse) && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Code className="w-3.5 h-3.5 text-indigo-400" />
            <span>{showDetails ? 'Hide raw debug payload' : 'Inspect raw error payload'}</span>
            {showDetails ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showDetails && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48 scrollbar-thin">
              {error.details && (
                <div className="mb-2">
                  <span className="text-slate-500 uppercase tracking-wider block text-[10px]">Error Details:</span>
                  <pre className="whitespace-pre-wrap">{error.details}</pre>
                </div>
              )}
              {error.rawResponse && (
                <div>
                  <span className="text-slate-500 uppercase tracking-wider block text-[10px]">Raw Response Snippet:</span>
                  <pre className="whitespace-pre-wrap text-amber-300/90">{error.rawResponse}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
        <button
          onClick={onReset}
          className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 transition-colors"
        >
          Edit Notes
        </button>

        <div className="flex items-center space-x-2.5">
          {error.canRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Generation</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
