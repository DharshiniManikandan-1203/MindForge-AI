import React, { useState } from 'react';
import { Wand2, RefreshCw, Plus, Sparkles, Send } from 'lucide-react';

interface RefinementInputProps {
  onRefine: (instruction: string) => void;
  isRefining: boolean;
}

const QUICK_PROMPTS = [
  'Add 3 advanced cards on edge cases',
  'Simplify explanations for beginners',
  'Add 2 more quiz questions on real-world scenarios',
  'Add practical code or clinical examples',
];

export const RefinementInput: React.FC<RefinementInputProps> = ({
  onRefine,
  isRefining,
}) => {
  const [instruction, setInstruction] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim() || isRefining) return;
    onRefine(instruction.trim());
    setInstruction('');
  };

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3 max-w-3xl mx-auto">
      <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-300">
        <Wand2 className="w-4 h-4 text-indigo-400" />
        <span>Refinement Loop: Direct the AI to adjust or expand this deck</span>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="e.g. 'Add 3 more cards on pitfalls', 'Make explanations simpler'..."
          disabled={isRefining}
          className="flex-1 bg-slate-900 text-slate-100 placeholder-slate-500 text-xs rounded-xl px-3.5 py-2.5 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={isRefining || !instruction.trim()}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {isRefining ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>{isRefining ? 'Updating...' : 'Refine Deck'}</span>
        </button>
      </form>

      {/* Quick suggestions */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">
          Quick suggestions:
        </span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setInstruction(prompt)}
            disabled={isRefining}
            className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-900/90 text-slate-400 hover:text-indigo-300 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            + {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};
