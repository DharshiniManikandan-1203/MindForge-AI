import React from 'react';
import { Command, X, ArrowLeft, ArrowRight, CornerDownLeft, Sparkles } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const SHORTCUTS = [
    { key: 'Space', desc: 'Flip active flashcard (Front ↔ Back)' },
    { key: '← / H', desc: 'Previous flashcard in deck' },
    { key: '→ / L', desc: 'Next flashcard in deck' },
    { key: '1', desc: 'Mark current card as "Still Learning"' },
    { key: '2', desc: 'Mark current card as "Mastered / Know It"' },
    { key: 'S', desc: 'Star / Unstar active card' },
    { key: 'Esc', desc: 'Close modals / drawers' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md glass-panel rounded-3xl border border-slate-800 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Command className="w-4 h-4 text-indigo-400" />
            <h3 className="font-display font-bold text-base text-white">
              Keyboard Shortcuts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          {SHORTCUTS.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs"
            >
              <span className="text-slate-300">{item.desc}</span>
              <kbd className="px-2 py-1 rounded-lg bg-slate-800 text-indigo-300 font-mono font-semibold border border-slate-700 shadow-sm text-[11px]">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
