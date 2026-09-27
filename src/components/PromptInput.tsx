import React, { useState } from 'react';
import { Sparkles, BookOpen, Layers, HelpCircle, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { GenerateOptions, DifficultyLevel } from '../types/result';

interface PromptInputProps {
  onSubmit: (text: string, options: GenerateOptions) => void;
  isLoading: boolean;
}

const SAMPLE_PROMPTS = [
  {
    title: 'React Hooks & State',
    category: 'Computer Science',
    text: 'React hooks allow functional components to manage state and side effects. useState manages local component state. useEffect handles side effects like data fetching and subscriptions with dependency arrays. useMemo and useCallback optimize performance by memoizing values and functions. Custom hooks encapsulate reusable stateful logic.',
  },
  {
    title: 'Cellular Respiration & ATP',
    category: 'Biology',
    text: 'Cellular respiration is the metabolic process that converts biochemical energy from nutrients into ATP. It consists of Glycolysis (in cytoplasm, produces 2 ATP and NADH), the Krebs Cycle (in mitochondrial matrix, generates electron carriers), and the Electron Transport Chain with Oxidative Phosphorylation (produces ~30-32 ATP via ATP synthase).',
  },
  {
    title: 'Distributed Systems & CAP Theorem',
    category: 'Architecture',
    text: 'The CAP theorem states that a distributed data store can only provide two of three guarantees simultaneously: Consistency (every read receives the most recent write or an error), Availability (every request receives a non-error response), and Partition Tolerance (the system continues to operate despite dropped network messages).',
  },
  {
    title: 'Cognitive Psychology & Memory',
    category: 'Psychology',
    text: 'Human memory comprises sensory memory, short-term/working memory (limited capacity ~4-7 chunks), and long-term memory. Long-term memory divides into explicit (declarative: episodic and semantic) and implicit (procedural). Effective retention relies on active retrieval practice, spaced repetition, and elaborative encoding over passive rereading.',
  },
];

export const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, isLoading }) => {
  const [input, setInput] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [cardCount, setCardCount] = useState<number>(6);
  const [quizCount, setQuizCount] = useState<number>(5);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSubmit(input.trim(), {
      difficulty,
      cardCount,
      quizCount,
    });
  };

  const handleSelectSample = (sampleText: string) => {
    setInput(sampleText);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Intro hero banner */}
      <div className="text-center space-y-3 pt-4 pb-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>AI-Powered Active Learning</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-white">
          Transform Raw Notes into <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">Interactive Mastery Tools</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          Paste your study notes, lecture excerpts, or any topic. Our AI engine validates and structures the content into 3D flashcards, an interactive quiz, and concept takeaways.
        </p>
      </div>

      {/* Main Input Card */}
      <form
        onSubmit={handleSubmit}
        className="glass-panel rounded-2xl p-5 sm:p-7 border border-slate-800 shadow-2xl relative overflow-hidden"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="study-notes-input" className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Free-form Study Text / Topic Notes</span>
            </label>
            <span className="text-xs text-slate-400">
              {input.length} characters
            </span>
          </div>

          <div className="relative">
            <textarea
              id="study-notes-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste raw lecture notes, article excerpts, textbook chapters, or just a topic name (e.g. 'Quantum Computing Basics', 'Photosynthesis Steps', 'PostgreSQL Indexing')..."
              rows={5}
              disabled={isLoading}
              className="w-full bg-slate-900/90 text-slate-100 placeholder-slate-500 text-sm rounded-xl p-4 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition duration-150 resize-y disabled:opacity-50 font-normal leading-relaxed"
            />
          </div>

          {/* Quick Options Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
            <div className="flex items-center space-x-3">
              {/* Difficulty Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 font-medium">Difficulty:</span>
                <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-xs">
                  {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDifficulty(level)}
                      className={`px-2.5 py-1 rounded-md capitalize transition-all ${
                        difficulty === level
                          ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Advanced */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
              >
                {showAdvanced ? 'Hide options' : 'More options'}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed group active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Processing notes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-200 group-hover:rotate-12 transition-transform" />
                  <span>Generate Interactive Study Set</span>
                  <ArrowRight className="w-4 h-4 text-indigo-200 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </div>

          {/* Advanced options accordion */}
          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 animate-slide-up text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1.5 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Target Flashcards: {cardCount}</span>
                  </span>
                </label>
                <input
                  type="range"
                  min="4"
                  max="12"
                  step="1"
                  value={cardCount}
                  onChange={(e) => setCardCount(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1.5 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Quiz Questions: {quizCount}</span>
                  </span>
                </label>
                <input
                  type="range"
                  min="3"
                  max="8"
                  step="1"
                  value={quizCount}
                  onChange={(e) => setQuizCount(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Preset Topics Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Or try a sample topic to test instantly:</span>
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SAMPLE_PROMPTS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(sample.text)}
              className="text-left p-3.5 rounded-xl bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-150 group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                  {sample.title}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/50">
                  {sample.category}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {sample.text}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
