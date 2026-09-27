import React from 'react';
import {
  Bookmark,
  X,
  Clock,
  Layers,
  Award,
  Trash2,
  Download,
  FolderOpen,
  ArrowRight
} from 'lucide-react';
import { SavedSession, StudySet } from '../types/result';

interface SessionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: SavedSession[];
  onLoadSession: (session: SavedSession) => void;
  onDeleteSession: (id: string) => void;
  currentStudySet?: StudySet | null;
  onSaveCurrentSession?: () => void;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({
  isOpen,
  onClose,
  sessions,
  onLoadSession,
  onDeleteSession,
  currentStudySet,
  onSaveCurrentSession,
}) => {
  if (!isOpen) return null;

  const handleExportJSON = (session: SavedSession) => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(session.data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `study-set-${session.title.toLowerCase().replace(/\s+/g, '-')}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportMarkdown = (session: SavedSession) => {
    const set = session.data;
    let md = `# Study Set: ${set.topic}\n\n`;
    md += `> **Difficulty**: ${set.difficulty} | **Est. Time**: ${set.estimatedMinutes} mins\n\n`;
    md += `## Summary\n${set.summary}\n\n`;

    md += `## Key Concepts\n`;
    set.keyConcepts.forEach((c: any) => {
      md += `- **${c.term}** (${c.importance}): ${c.definition}\n`;
      if (c.example) md += `  - *Example*: ${c.example}\n`;
    });
    md += `\n## Flashcards\n`;
    set.cards.forEach((card: any, idx: number) => {
      md += `### ${idx + 1}. ${card.question}\n**Answer**: ${card.answer}\n`;
      if (card.hint) md += `*Hint*: ${card.hint}\n`;
      md += `\n`;
    });

    md += `## Quiz Questions\n`;
    set.quiz.forEach((q: any, idx: number) => {
      md += `### ${idx + 1}. ${q.question}\n`;
      q.options.forEach((opt: any, optIdx: number) => {
        md += `- [${optIdx === q.correctIndex ? 'x' : ' '}] ${String.fromCharCode(65 + optIdx)}. ${opt}\n`;
      });
      md += `\n*Explanation*: ${q.explanation}\n\n`;
    });

    const dataStr =
      'data:text/markdown;charset=utf-8,' + encodeURIComponent(md);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `study-set-${session.title.toLowerCase().replace(/\s+/g, '-')}.md`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl glass-panel rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-white">
                Saved Study Decks
              </h2>
              <p className="text-xs text-slate-400">
                {sessions.length} sessions stored in local storage
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Set Saver */}
        {currentStudySet && onSaveCurrentSession && (
          <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
            <div className="text-xs">
              <span className="font-semibold text-indigo-200 block">
                Current active deck: "{currentStudySet.topic}"
              </span>
              <span className="text-slate-400">
                {currentStudySet.cards.length} cards · {currentStudySet.quiz.length} quiz questions
              </span>
            </div>
            <button
              onClick={onSaveCurrentSession}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              Save Deck
            </button>
          </div>
        )}

        {/* List of Sessions */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {sessions.length === 0 ? (
            <div className="text-center py-10 space-y-2 text-slate-400">
              <FolderOpen className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs">No saved study decks yet.</p>
              <p className="text-[11px] text-slate-500">
                Generate a study set and click "Save Deck" to bookmark it for later review.
              </p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <h3 className="font-display font-bold text-sm text-white line-clamp-1">
                    {session.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Layers className="w-3 h-3 text-indigo-400" />
                      <span>{session.totalCards} cards</span>
                    </span>
                    {session.quizHighScore !== undefined && (
                      <span className="flex items-center space-x-1 text-emerald-400">
                        <Award className="w-3 h-3" />
                        <span>High score: {session.quizHighScore}%</span>
                      </span>
                    )}
                    <span className="flex items-center space-x-1 text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 self-end sm:self-center">
                  <button
                    onClick={() => handleExportJSON(session)}
                    className="p-2 rounded-xl text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                    title="Export JSON"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleExportMarkdown(session)}
                    className="p-2 rounded-xl text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                    title="Export Markdown"
                  >
                    <span className="text-[10px] font-mono font-bold">MD</span>
                  </button>

                  <button
                    onClick={() => onDeleteSession(session.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Delete session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      onLoadSession(session);
                      onClose();
                    }}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <span>Load</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
