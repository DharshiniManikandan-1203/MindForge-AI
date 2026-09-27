import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { PromptInput } from './components/PromptInput';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { ResultView } from './components/ResultView';
import { SessionHistory } from './components/SessionHistory';
import { ShortcutsModal } from './components/ShortcutsModal';
import {
  StudySet,
  ApiError,
  GenerateOptions,
  SavedSession,
} from './types/result';
import {
  generateStudySet,
  refineStudySet,
  checkBackendHealth,
} from './lib/api';

const SESSIONS_STORAGE_KEY = 'mindforge_saved_study_sessions_v1';

export const App: React.FC = () => {
  // Main state
  const [studySet, setStudySet] = useState<StudySet | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastInput, setLastInput] = useState<string>('');
  const [lastOptions, setLastOptions] = useState<GenerateOptions | undefined>();

  // Modals & Panels
  const [isSessionsOpen, setIsSessionsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>(() => {
    try {
      const stored = localStorage.getItem(SESSIONS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Server health status
  const [serverStatus, setServerStatus] = useState({
    status: 'checking',
    llmConfigured: false,
    provider: 'Connecting...',
  });

  // Race condition & cancellation guards
  const requestId = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check backend health on mount
  useEffect(() => {
    checkBackendHealth().then((res: { status: string; llmConfigured: boolean; provider: string }) => {
      setServerStatus(res);
    });
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(savedSessions));
    } catch (e) {
      console.error('Failed to persist study sessions', e);
    }
  }, [savedSessions]);

  // Global key listener for '?' to open shortcuts
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'INPUT'
      ) {
        return;
      }
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        setIsShortcutsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // Primary generate handler with defensive stale response guard
  const handleGenerate = async (input: string, options?: GenerateOptions) => {
    // Abort previous in-flight request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const currentReqId = ++requestId.current;
    setLastInput(input);
    setLastOptions(options);
    setIsLoading(true);
    setError(null);

    try {
      const result = await generateStudySet(input, options, controller.signal);

      // Stale response guard: ensure this request is still the newest one
      if (currentReqId !== requestId.current) {
        console.warn('Ignored stale request result (a newer request took precedence).');
        return;
      }

      setStudySet(result.studySet);
      setIsLoading(false);
    } catch (err: any) {
      if (currentReqId !== requestId.current) return;

      setIsLoading(false);
      if (err.name === 'AbortError' || err.apiError?.type === 'TIMEOUT') {
        if (err.name === 'AbortError') return; // User cancelled manually
      }

      setError(
        err.apiError || {
          type: 'SERVER_ERROR',
          message: err.message || 'An unexpected error occurred while generating study set.',
          canRetry: true,
        }
      );
    } finally {
      if (currentReqId === requestId.current) {
        abortControllerRef.current = null;
      }
    }
  };

  // Refine handler
  const handleRefine = async (instruction: string) => {
    if (!studySet) return;
    setIsRefining(true);

    try {
      const result = await refineStudySet(studySet, instruction);
      setStudySet(result.studySet);
    } catch (err: any) {
      alert(err.message || 'Failed to refine deck.');
    } finally {
      setIsRefining(false);
    }
  };

  // Cancel in-flight generation
  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  // Save current study set session
  const handleSaveCurrentSession = () => {
    if (!studySet) return;
    const existingIndex = savedSessions.findIndex((s) => s.data.topic === studySet.topic);
    const newSession: SavedSession = {
      id: `session-${Date.now()}`,
      title: studySet.topic,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: studySet,
      masteryCount: 0,
      totalCards: studySet.cards.length,
    };

    if (existingIndex >= 0) {
      const updated = [...savedSessions];
      updated[existingIndex] = newSession;
      setSavedSessions(updated);
    } else {
      setSavedSessions([newSession, ...savedSessions]);
    }
  };

  const isCurrentSaved = Boolean(
    studySet && savedSessions.some((s) => s.data.topic === studySet.topic)
  );

  const handleLoadSavedSession = (session: SavedSession) => {
    setStudySet(session.data);
    setError(null);
  };

  const handleDeleteSession = (id: string) => {
    setSavedSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleResetToInput = () => {
    setStudySet(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <Header
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenSessions={() => setIsSessionsOpen(true)}
        savedCount={savedSessions.length}
        serverStatus={serverStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center justify-center">
        {/* VIEW 1: Loading State */}
        {isLoading && (
          <LoadingState onCancel={handleCancelGeneration} />
        )}

        {/* VIEW 2: Error State */}
        {!isLoading && error && (
          <ErrorState
            error={error}
            onRetry={() => handleGenerate(lastInput, lastOptions)}
            onReset={handleResetToInput}
          />
        )}

        {/* VIEW 3: Success Study Assistant UI */}
        {!isLoading && !error && studySet && (
          <ResultView
            studySet={studySet}
            onReset={handleResetToInput}
            onRefine={handleRefine}
            isRefining={isRefining}
            onSaveSession={handleSaveCurrentSession}
            isSaved={isCurrentSaved}
          />
        )}

        {/* VIEW 4: Initial Input Form */}
        {!isLoading && !error && !studySet && (
          <PromptInput onSubmit={handleGenerate} isLoading={isLoading} />
        )}
      </main>

      {/* Saved Sessions Drawer/Modal */}
      <SessionHistory
        isOpen={isSessionsOpen}
        onClose={() => setIsSessionsOpen(false)}
        sessions={savedSessions}
        onLoadSession={handleLoadSavedSession}
        onDeleteSession={handleDeleteSession}
        currentStudySet={studySet}
        onSaveCurrentSession={handleSaveCurrentSession}
      />

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MindForge AI · Structured Data & Active Recall Tool</span>
          <span className="text-slate-600">Built for Flam Frontend Assignment · Clean React State Architecture</span>
        </div>
      </footer>
    </div>
  );
};
