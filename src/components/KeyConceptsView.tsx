import React, { useState } from 'react';
import { BookOpen, Sparkles, Copy, Check, Lightbulb, Tag } from 'lucide-react';
import { KeyConcept } from '../types/result';

interface KeyConceptsViewProps {
  concepts: KeyConcept[];
  topic: string;
}

export const KeyConceptsView: React.FC<KeyConceptsViewProps> = ({ concepts, topic }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (concept: KeyConcept) => {
    const text = `${concept.term}: ${concept.definition}${
      concept.example ? ` (Example: ${concept.example})` : ''
    }`;
    navigator.clipboard.writeText(text);
    setCopiedId(concept.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case 'foundational':
        return {
          label: 'Foundational',
          color: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
        };
      case 'high':
        return {
          label: 'High Yield',
          color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
        };
      case 'medium':
      default:
        return {
          label: 'Key Concept',
          color: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
        };
    }
  };

  if (!concepts || concepts.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 glass-panel rounded-2xl">
        No key concepts extracted for this study set.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-base text-white flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Core Definitions & Takeaways</span>
          </h2>
          <p className="text-xs text-slate-400">
            {concepts.length} structured concepts extracted from your study notes
          </p>
        </div>
      </div>

      {/* Concept Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {concepts.map((concept) => {
          const badge = getImportanceBadge(concept.importance);
          const isCopied = copiedId === concept.id;

          return (
            <div
              key={concept.id}
              className="glass-panel rounded-2xl p-5 border border-slate-800/90 hover:border-indigo-500/40 transition-all duration-200 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                  <button
                    onClick={() => handleCopy(concept)}
                    className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
                    title="Copy concept to clipboard"
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <h3 className="font-display font-bold text-base text-white group-hover:text-indigo-300 transition-colors">
                  {concept.term}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {concept.definition}
                </p>
              </div>

              {concept.example && (
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 space-y-1">
                  <div className="flex items-center space-x-1.5 text-[10px] uppercase font-bold text-indigo-400">
                    <Lightbulb className="w-3 h-3" />
                    <span>Real-World Context:</span>
                  </div>
                  <p className="italic text-slate-300">{concept.example}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
