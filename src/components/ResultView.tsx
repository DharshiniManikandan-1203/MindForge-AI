import React, { useState } from 'react';
import {
  Layers,
  Award,
  BookOpen,
  Sparkles,
  RotateCcw,
  Clock,
  Gauge,
  Bookmark,
  Share2,
  Check,
  Download,
  Info
} from 'lucide-react';
import { StudySet, CardProgress, CardMasteryStatus } from '../types/result';
import { FlashcardDeck } from './FlashcardDeck';
import { QuizView } from './QuizView';
import { KeyConceptsView } from './KeyConceptsView';
import { RefinementInput } from './RefinementInput';

interface ResultViewProps {
  studySet: StudySet;
  onReset: () => void;
  onRefine: (instruction: string) => void;
  isRefining: boolean;
  onSaveSession: () => void;
  isSaved: boolean;
}

type TabType = 'flashcards' | 'quiz' | 'concepts' | 'overview';

export const ResultView: React.FC<ResultViewProps> = ({
  studySet,
  onReset,
  onRefine,
  isRefining,
  onSaveSession,
  isSaved,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('flashcards');

  // Local card mastery progress
  const [cardProgress, setCardProgress] = useState<CardProgress>(() => {
    const initial: CardProgress = {};
    studySet.cards.forEach((card: any) => {
      initial[card.id] = { status: 'unseen', starred: false, reviewsCount: 0 };
    });
    return initial;
  });

  const handleUpdateCardProgress = (cardId: string, status: CardMasteryStatus) => {
    setCardProgress((prev: CardProgress) => ({
      ...prev,
      [cardId]: {
        ...(prev[cardId] || { starred: false, reviewsCount: 0 }),
        status,
        reviewsCount: (prev[cardId]?.reviewsCount || 0) + 1,
      },
    }));
  };

  const handleToggleStar = (cardId: string) => {
    setCardProgress((prev: CardProgress) => ({
      ...prev,
      [cardId]: {
        ...(prev[cardId] || { status: 'unseen', reviewsCount: 0 }),
        starred: !prev[cardId]?.starred,
      },
    }));
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'advanced':
        return {
          label: 'Advanced',
          color: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
        };
      case 'beginner':
        return {
          label: 'Beginner',
          color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
        };
      case 'intermediate':
      default:
        return {
          label: 'Intermediate',
          color: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
        };
    }
  };

  const diffBadge = getDifficultyBadge(studySet.difficulty);

  const TABS = [
    {
      id: 'flashcards',
      label: 'Flashcards',
      count: studySet.cards.length,
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: 'quiz',
      label: 'Practice Quiz',
      count: studySet.quiz.length,
      icon: <Award className="w-4 h-4" />,
    },
    {
      id: 'concepts',
      label: 'Key Concepts',
      count: studySet.keyConcepts.length,
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'overview',
      label: 'Overview & Summary',
      icon: <Info className="w-4 h-4" />,
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Top Banner & Topic Header */}
      <div className="glass-panel rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${diffBadge.color}`}
              >
                {diffBadge.label}
              </span>
              <span className="flex items-center space-x-1 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>~{studySet.estimatedMinutes} min study time</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
              {studySet.topic}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              {studySet.summary}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2 self-start md:self-center">
            <button
              onClick={onSaveSession}
              disabled={isSaved}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isSaved
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent shadow-md shadow-indigo-600/20'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save Deck</span>
                </>
              )}
            </button>

            <button
              onClick={onReset}
              className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
              <span>New Notes</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === tab.id
                      ? 'bg-indigo-900/80 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="pt-2">
        {activeTab === 'flashcards' && (
          <FlashcardDeck
            cards={studySet.cards}
            progress={cardProgress}
            onUpdateProgress={handleUpdateCardProgress}
            onToggleStar={handleToggleStar}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizView
            questions={studySet.quiz}
            topic={studySet.topic}
          />
        )}

        {activeTab === 'concepts' && (
          <KeyConceptsView
            concepts={studySet.keyConcepts}
            topic={studySet.topic}
          />
        )}

        {activeTab === 'overview' && (
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 max-w-3xl mx-auto">
            <h2 className="font-display font-bold text-lg text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>Study Module Breakdown</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Cards</span>
                <p className="text-2xl font-bold text-white mt-1">{studySet.cards.length}</p>
                <span className="text-xs text-indigo-400">Active Recall Prompts</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Quiz Items</span>
                <p className="text-2xl font-bold text-white mt-1">{studySet.quiz.length}</p>
                <span className="text-xs text-indigo-400">With Explanations</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Key Terms</span>
                <p className="text-2xl font-bold text-white mt-1">{studySet.keyConcepts.length}</p>
                <span className="text-xs text-indigo-400">Foundational Concepts</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <h3 className="font-semibold text-white">Recommended Study Routine:</h3>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                <li>Review the <strong>Key Concepts</strong> tab to anchor core terminology.</li>
                <li>Work through the <strong>Flashcards Deck</strong>, testing your recall before flipping.</li>
                <li>Mark cards as <em>Know It</em> or <em>Still Learning</em> to isolate weak spots.</li>
                <li>Take the <strong>Practice Quiz</strong> to evaluate retention under test conditions.</li>
                <li>Use the <strong>Re-Test Loop</strong> on missed questions to solidify understanding.</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Refinement Loop (Stretch Goal) */}
      <div className="pt-4">
        <RefinementInput onRefine={onRefine} isRefining={isRefining} />
      </div>
    </div>
  );
};
