import React, { useState, useEffect, useCallback } from 'react';
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  HelpCircle,
  Star,
  Shuffle,
  Eye,
  Sparkles,
  Layers,
  Volume2,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Flashcard, CardProgress, CardMasteryStatus } from '../types/result';

interface FlashcardDeckProps {
  cards: Flashcard[];
  progress: CardProgress;
  onUpdateProgress: (cardId: string, status: CardMasteryStatus) => void;
  onToggleStar: (cardId: string) => void;
}

type FilterType = 'all' | 'unseen' | 'learning' | 'mastered' | 'starred';

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({
  cards,
  progress,
  onUpdateProgress,
  onToggleStar,
}) => {
  const [deck, setDeck] = useState<Flashcard[]>(cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Keep deck in sync when cards prop changes
  useEffect(() => {
    setDeck(cards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
  }, [cards]);

  // Filtered cards
  const filteredCards = deck.filter((card) => {
    const cardProg = progress[card.id] || { status: 'unseen', starred: false };
    if (activeFilter === 'mastered') return cardProg.status === 'mastered';
    if (activeFilter === 'learning') return cardProg.status === 'learning';
    if (activeFilter === 'unseen') return cardProg.status === 'unseen';
    if (activeFilter === 'starred') return cardProg.starred;
    return true;
  });

  // Ensure currentIndex stays within filtered range
  useEffect(() => {
    if (currentIndex >= filteredCards.length && filteredCards.length > 0) {
      setCurrentIndex(filteredCards.length - 1);
    }
  }, [filteredCards.length, currentIndex]);

  const currentCard = filteredCards[currentIndex];

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  }, [currentIndex, filteredCards.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  }, [currentIndex]);

  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
  };

  const handleMarkStatus = (status: CardMasteryStatus) => {
    if (!currentCard) return;
    onUpdateProgress(currentCard.id, status);

    // If marked mastered on last card, fire small celebration
    const allMastered = cards.every((c) =>
      c.id === currentCard.id ? status === 'mastered' : progress[c.id]?.status === 'mastered'
    );
    if (allMastered && status === 'mastered') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {}
    }

    // Auto advance to next card after marking
    if (currentIndex < filteredCards.length - 1) {
      setTimeout(() => {
        handleNext();
      }, 200);
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in textarea or input
      if (
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'INPUT'
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight' || e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft' || e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === '1') {
        handleMarkStatus('learning');
      } else if (e.key === '2') {
        handleMarkStatus('mastered');
      } else if (e.key === 's' || e.key === 'S') {
        if (currentCard) onToggleStar(currentCard.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, currentCard, onToggleStar]);

  // Calculate mastery statistics
  const masteredCount = cards.filter((c) => progress[c.id]?.status === 'mastered').length;
  const learningCount = cards.filter((c) => progress[c.id]?.status === 'learning').length;
  const starredCount = cards.filter((c) => progress[c.id]?.starred).length;
  const masteryPercentage = Math.round((masteredCount / (cards.length || 1)) * 100);

  if (!cards || cards.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 glass-panel rounded-2xl">
        No flashcards available in this study set.
      </div>
    );
  }

  const currentProg = currentCard ? progress[currentCard.id] : null;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Top Deck Stats & Filters Header */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-4">
        {/* Progress Bar & Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-display font-bold text-base text-white">
                Flashcard Mastery
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                {masteryPercentage}% Complete
              </span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-400">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{masteredCount} Mastered</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>{learningCount} Learning</span>
              </span>
              {starredCount > 0 && (
                <span className="flex items-center space-x-1 text-amber-300">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{starredCount} Starred</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleShuffle}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700/80 transition-colors border border-slate-700/60"
              title="Shuffle cards order"
            >
              <Shuffle className="w-3.5 h-3.5 text-indigo-400" />
              <span>Shuffle</span>
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${(masteredCount / cards.length) * 100}%` }}
          />
          <div
            className="h-full bg-amber-500 transition-all duration-300"
            style={{ width: `${(learningCount / cards.length) * 100}%` }}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs border-t border-slate-800/80">
          <span className="text-slate-400 mr-1 flex items-center space-x-1">
            <Filter className="w-3 h-3 text-slate-400" />
            <span>Filter:</span>
          </span>
          {[
            { id: 'all', label: `All (${cards.length})` },
            { id: 'learning', label: `Needs Review (${learningCount})` },
            { id: 'mastered', label: `Mastered (${masteredCount})` },
            { id: 'starred', label: `Starred (${starredCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveFilter(tab.id as FilterType);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeFilter === tab.id
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Flashcard Container */}
      {filteredCards.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-2xl border border-slate-800 space-y-3">
          <Sparkles className="w-8 h-8 text-indigo-400 mx-auto" />
          <h3 className="font-display font-semibold text-white">No cards match this filter</h3>
          <p className="text-xs text-slate-400">
            Switch filter to 'All' or review other cards.
          </p>
          <button
            onClick={() => setActiveFilter('all')}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Show All Cards
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Card Indicator & Star */}
          <div className="flex items-center justify-between px-2 text-xs text-slate-400">
            <span>
              Card <span className="font-bold text-white">{currentIndex + 1}</span> of{' '}
              <span className="font-bold text-white">{filteredCards.length}</span>
              {currentCard.category && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
                  {currentCard.category}
                </span>
              )}
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => currentCard && onToggleStar(currentCard.id)}
                className={`p-1.5 rounded-lg border transition-all ${
                  currentProg?.starred
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'border-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-800/60'
                }`}
                title={currentProg?.starred ? 'Unstar card' : 'Star card (S)'}
              >
                <Star
                  className={`w-4 h-4 ${currentProg?.starred ? 'fill-amber-400' : ''}`}
                />
              </button>
            </div>
          </div>

          {/* 3D Flipping Card */}
          <div
            onClick={handleFlip}
            className="perspective-1000 w-full min-h-[320px] sm:min-h-[360px] cursor-pointer select-none group"
          >
            <div
              className={`relative w-full h-full min-h-[320px] sm:min-h-[360px] rounded-3xl transition-transform duration-500 transform-style-3d ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* FRONT OF CARD (Question) */}
              <div className="absolute inset-0 w-full h-full rounded-3xl p-6 sm:p-8 glass-panel border border-slate-700/80 shadow-2xl flex flex-col justify-between backface-hidden bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400 flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Question / Concept</span>
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                    <RotateCcw className="w-3 h-3 text-slate-500 group-hover:rotate-180 transition-transform duration-500" />
                    <span>Click or Space to flip</span>
                  </span>
                </div>

                {/* Question Text */}
                <div className="my-auto py-4 text-center">
                  <p className="font-display font-semibold text-lg sm:text-2xl text-slate-100 leading-snug">
                    {currentCard.question}
                  </p>
                </div>

                {/* Bottom hint drawer */}
                <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                  {currentCard.hint ? (
                    showHint ? (
                      <div className="p-3 rounded-xl bg-indigo-950/70 border border-indigo-500/30 text-xs text-indigo-200 animate-fade-in flex items-start space-x-2">
                        <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold block text-[10px] uppercase text-indigo-300">
                            Hint:
                          </span>
                          <p>{currentCard.hint}</p>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowHint(true)}
                        className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-indigo-300 transition-colors"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Show Hint</span>
                      </button>
                    )
                  ) : (
                    <div />
                  )}
                </div>
              </div>

              {/* BACK OF CARD (Answer) */}
              <div className="absolute inset-0 w-full h-full rounded-3xl p-6 sm:p-8 glass-panel border border-indigo-500/40 shadow-2xl flex flex-col justify-between backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Answer & Detailed Explanation</span>
                  </span>
                  <span className="text-[11px] text-indigo-300/80">
                    Press Space to flip back
                  </span>
                </div>

                {/* Answer Content */}
                <div className="my-auto py-4">
                  <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                    {currentCard.answer}
                  </p>
                </div>

                <div className="text-center text-xs text-slate-400">
                  Rate your recall below to track your mastery
                </div>
              </div>
            </div>
          </div>

          {/* Controls & Mastery Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {/* Prev Button */}
            <div className="flex items-center justify-start">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev (←)</span>
              </button>
            </div>

            {/* Middle Mastery Actions */}
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => handleMarkStatus('learning')}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  currentProg?.status === 'learning'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 hover:bg-amber-950/40 text-amber-300 border-amber-500/30'
                }`}
                title="Mark as Still Learning (Key 1)"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Still Learning</span>
                <kbd className="hidden sm:inline-block px-1 bg-black/20 rounded text-[9px]">1</kbd>
              </button>

              <button
                onClick={() => handleMarkStatus('mastered')}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  currentProg?.status === 'mastered'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900 hover:bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                }`}
                title="Mark as Mastered (Key 2)"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Know It</span>
                <kbd className="hidden sm:inline-block px-1 bg-black/20 rounded text-[9px]">2</kbd>
              </button>
            </div>

            {/* Next Button */}
            <div className="flex items-center justify-end">
              <button
                onClick={handleNext}
                disabled={currentIndex >= filteredCards.length - 1}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-colors"
              >
                <span>Next (→)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
