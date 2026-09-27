import React, { useEffect, useState } from 'react';
import { Loader2, Sparkles, CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';

interface LoadingStateProps {
  onCancel?: () => void;
}

const STEPS = [
  { label: 'Tokenizing input notes & analyzing domain concepts...', duration: 900 },
  { label: 'Synthesizing foundational definitions & high-yield takeaways...', duration: 1200 },
  { label: 'Formulating 3D active-recall flashcards with hints...', duration: 1100 },
  { label: 'Generating self-grading quiz with distractor explanations...', duration: 1000 },
  { label: 'Executing defensive schema validation & payload verification...', duration: 800 },
];

const STUDY_TIPS = [
  'Active recall (testing yourself) produces up to 50% better long-term retention than passive reading.',
  'Re-testing only your incorrect answers closes knowledge gaps 3x faster.',
  'Explaining a concept in simple terms (Feynman Technique) exposes hidden blind spots.',
  'Spaced repetition schedules reviews right before you are about to forget a concept.',
];

export const LoadingState: React.FC<LoadingStateProps> = ({ onCancel }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    // Cycle through steps
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1200);

    // Cycle through study tips
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % STUDY_TIPS.length);
    }, 4000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(tipInterval);
    };
  }, []);

  const progressPercent = Math.min(
    100,
    Math.round(((currentStepIndex + 1) / STEPS.length) * 100)
  );

  return (
    <div className="w-full max-w-2xl mx-auto my-8 glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl animate-fade-in text-center space-y-6">
      {/* Top spinner */}
      <div className="relative inline-flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
        <div className="absolute inset-0 rounded-full border border-indigo-500/30 animate-ping opacity-25" />
      </div>

      {/* Main heading */}
      <div className="space-y-1.5">
        <h2 className="text-xl font-display font-bold text-white tracking-tight">
          Generating Structured Study Module
        </h2>
        <p className="text-xs text-slate-400">
          Enforcing strict JSON schema & active recall components
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Processing pipeline</span>
          <span className="font-semibold text-indigo-400">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="text-left space-y-2.5 max-w-md mx-auto pt-2">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          return (
            <div
              key={idx}
              className={`flex items-center space-x-2.5 text-xs transition-opacity duration-300 ${
                isDone
                  ? 'text-emerald-400'
                  : isCurrent
                  ? 'text-indigo-300 font-medium'
                  : 'text-slate-600 opacity-60'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
              )}
              <span className="truncate">{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* Did You Know Box */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-left flex items-start space-x-3">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider mb-0.5">
            Study Science Tip:
          </span>
          <p className="text-xs text-slate-400 italic">
            "{STUDY_TIPS[tipIndex]}"
          </p>
        </div>
      </div>

      {/* Cancel action */}
      {onCancel && (
        <div className="pt-2">
          <button
            onClick={onCancel}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Cancel request</span>
          </button>
        </div>
      )}
    </div>
  );
};
