import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Award,
  RotateCcw,
  Sparkles,
  Flame,
  ArrowRight,
  HelpCircle,
  Check,
  Zap,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion, QuizAttempt } from '../types/result';

interface QuizViewProps {
  questions: QuizQuestion[];
  topic: string;
  onSaveHighScore?: (score: number) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  questions,
  topic,
  onSaveHighScore,
}) => {
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>(questions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [isRetestMode, setIsRetestMode] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    setActiveQuestions(questions);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setIsRetestMode(false);
    setStreak(0);
    setMaxStreak(0);
    setIsFinished(false);
  }, [questions]);

  if (!activeQuestions || activeQuestions.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 glass-panel rounded-2xl">
        No quiz questions available for this module.
      </div>
    );
  }

  const currentQ = activeQuestions[currentIndex];
  const hasAnsweredCurrent = selectedAnswers[currentQ?.id] !== undefined;
  const currentSelection = selectedAnswers[currentQ?.id];
  const isCurrentCorrect = hasAnsweredCurrent && currentSelection === currentQ?.correctIndex;

  const handleSelectOption = (optionIndex: number) => {
    if (hasAnsweredCurrent || isFinished) return;

    const isCorrect = optionIndex === currentQ.correctIndex;
    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: optionIndex }));

    if (isCorrect) {
      setStreak((prev) => {
        const next = prev + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Quiz complete
      setIsFinished(true);
      const totalCorrect = Object.entries(selectedAnswers).filter(
        ([qId, ansIndex]) => {
          const q = activeQuestions.find((item) => item.id === qId);
          return q && q.correctIndex === ansIndex;
        }
      ).length;

      const percentage = Math.round((totalCorrect / activeQuestions.length) * 100);
      if (onSaveHighScore) {
        onSaveHighScore(percentage);
      }

      if (percentage >= 70) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}
      }
    }
  };

  // Re-test wrong answers mode
  const handleStartRetest = () => {
    const wrongQuestions = activeQuestions.filter((q) => {
      const selected = selectedAnswers[q.id];
      return selected === undefined || selected !== q.correctIndex;
    });

    if (wrongQuestions.length === 0) return;

    setActiveQuestions(wrongQuestions);
    setSelectedAnswers({});
    setCurrentIndex(0);
    setIsRetestMode(true);
    setIsFinished(false);
    setStreak(0);
  };

  const handleRestartFullQuiz = () => {
    setActiveQuestions(questions);
    setSelectedAnswers({});
    setCurrentIndex(0);
    setIsRetestMode(false);
    setIsFinished(false);
    setStreak(0);
  };

  // Calculate stats
  const answeredCount = Object.keys(selectedAnswers).length;
  const correctCount = Object.entries(selectedAnswers).filter(([qId, ansIndex]) => {
    const q = activeQuestions.find((item) => item.id === qId);
    return q && q.correctIndex === ansIndex;
  }).length;
  const incorrectQuestions = activeQuestions.filter((q) => {
    const ans = selectedAnswers[q.id];
    return ans !== undefined && ans !== q.correctIndex;
  });

  const finalScorePercent = Math.round((correctCount / activeQuestions.length) * 100);

  const getGrade = (score: number) => {
    if (score === 100) return { letter: 'A+', label: 'Perfect Mastery', color: 'text-emerald-400' };
    if (score >= 85) return { letter: 'A', label: 'Excellent Understanding', color: 'text-emerald-400' };
    if (score >= 70) return { letter: 'B', label: 'Solid Grasp', color: 'text-indigo-400' };
    if (score >= 50) return { letter: 'C', label: 'Needs Reinforcement', color: 'text-amber-400' };
    return { letter: 'D', label: 'Review Recommended', color: 'text-rose-400' };
  };

  // FINISHED / RESULTS SUMMARY SCREEN
  if (isFinished) {
    const grade = getGrade(finalScorePercent);
    return (
      <div className="w-full max-w-2xl mx-auto glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl animate-fade-in space-y-6 text-center">
        {/* Top Grade Circle */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-slate-900 border-2 border-indigo-500/40 flex flex-col items-center justify-center shadow-xl shadow-indigo-500/10">
            <span className={`text-4xl font-display font-extrabold ${grade.color}`}>
              {grade.letter}
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">
              {finalScorePercent}%
            </span>
          </div>
          {finalScorePercent >= 80 && (
            <div className="absolute -top-1 -right-1 p-1.5 rounded-full bg-amber-500 text-slate-950 shadow-md">
              <Award className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Title & Feedback */}
        <div className="space-y-1">
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">
            {isRetestMode ? 'Re-Test Complete!' : 'Quiz Completed!'}
          </h2>
          <p className="text-sm font-medium text-indigo-300">
            {grade.label}
          </p>
          <p className="text-xs text-slate-400">
            You scored <span className="text-white font-bold">{correctCount}</span> out of{' '}
            <span className="text-white font-bold">{activeQuestions.length}</span> questions
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-left text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Accuracy</span>
            <span className="text-base font-bold text-white">{finalScorePercent}%</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Max Streak</span>
            <span className="text-base font-bold text-amber-400 flex items-center space-x-1">
              <Flame className="w-4 h-4 fill-amber-400" />
              <span>{maxStreak}</span>
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Missed Items</span>
            <span className="text-base font-bold text-rose-400">{incorrectQuestions.length}</span>
          </div>
        </div>

        {/* Incorrect items breakdown if any */}
        {incorrectQuestions.length > 0 && (
          <div className="text-left space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Target className="w-3.5 h-3.5 text-rose-400" />
              <span>Knowledge Gaps ({incorrectQuestions.length}):</span>
            </h4>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {incorrectQuestions.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs space-y-1.5"
                >
                  <p className="font-medium text-slate-200">{item.question}</p>
                  <p className="text-[11px] text-emerald-300">
                    <span className="font-semibold text-emerald-400">Correct Answer: </span>
                    {item.options[item.correctIndex]}
                  </p>
                  <p className="text-[11px] text-slate-400 italic">{item.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-800">
          {incorrectQuestions.length > 0 && (
            <button
              onClick={handleStartRetest}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 transition-all active:scale-[0.98]"
            >
              <Target className="w-4 h-4" />
              <span>Re-Test {incorrectQuestions.length} Missed Question{incorrectQuestions.length > 1 ? 's' : ''}</span>
            </button>
          )}

          <button
            onClick={handleRestartFullQuiz}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-indigo-400" />
            <span>Retake Full Quiz</span>
          </button>
        </div>
      </div>
    );
  }

  // ACTIVE QUESTION SCREEN
  return (
    <div className="w-full max-w-3xl mx-auto space-y-5 animate-fade-in">
      {/* Top Quiz Header */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-display font-bold text-sm text-white">
                {isRetestMode ? 'Targeted Re-Test Mode' : 'Self-Assessment Quiz'}
              </span>
              {isRetestMode && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Focusing on Weak Areas
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Question {currentIndex + 1} of {activeQuestions.length}
            </p>
          </div>
        </div>

        {/* Streak & Score pill */}
        <div className="flex items-center space-x-3 text-xs">
          {streak > 1 && (
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold animate-pulse">
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{streak} Streak!</span>
            </div>
          )}

          <div className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            Score: <span className="text-white font-bold">{correctCount}</span> / {answeredCount}
          </div>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / activeQuestions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
        <div className="space-y-2">
          {currentQ.conceptTag && (
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-500/30">
              {currentQ.conceptTag}
            </span>
          )}
          <h3 className="font-display font-bold text-base sm:text-xl text-white leading-snug">
            {currentQ.question}
          </h3>
        </div>

        {/* 4 Options */}
        <div className="space-y-2.5">
          {currentQ.options.map((option: string, idx: number) => {
            const isSelected = currentSelection === idx;
            const isCorrectOption = idx === currentQ.correctIndex;

            let optionStyle =
              'bg-slate-900/90 hover:bg-slate-800/90 border-slate-800 text-slate-200';

            if (hasAnsweredCurrent) {
              if (isCorrectOption) {
                optionStyle =
                  'bg-emerald-950/70 border-emerald-500 text-emerald-100 shadow-lg shadow-emerald-500/10';
              } else if (isSelected && !isCorrectOption) {
                optionStyle =
                  'bg-rose-950/70 border-rose-500 text-rose-100 shadow-lg shadow-rose-500/10';
              } else {
                optionStyle = 'bg-slate-900/40 border-slate-800/40 text-slate-500 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(idx)}
                disabled={hasAnsweredCurrent}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-150 flex items-center justify-between group ${optionStyle} ${
                  !hasAnsweredCurrent ? 'hover:border-indigo-500/50 cursor-pointer active:scale-[0.99]' : 'cursor-default'
                }`}
              >
                <div className="flex items-center space-x-3.5 pr-2">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      hasAnsweredCurrent && isCorrectOption
                        ? 'bg-emerald-500 text-slate-950'
                        : hasAnsweredCurrent && isSelected
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-xs sm:text-sm font-normal leading-relaxed">
                    {option}
                  </span>
                </div>

                {hasAnsweredCurrent && (
                  <div className="shrink-0">
                    {isCorrectOption ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : isSelected ? (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    ) : null}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation Reveal after answering */}
        {hasAnsweredCurrent && (
          <div
            className={`p-4 rounded-2xl border animate-slide-up text-xs space-y-1.5 ${
              isCurrentCorrect
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                : 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200'
            }`}
          >
            <div className="flex items-center space-x-2 font-bold text-[11px] uppercase tracking-wider">
              {isCurrentCorrect ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Correct! Explanation:</span>
                </>
              ) : (
                <>
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span className="text-indigo-300">Learning Explanation:</span>
                </>
              )}
            </div>
            <p className="leading-relaxed text-slate-200">{currentQ.explanation}</p>
          </div>
        )}

        {/* Next Question Navigation */}
        {hasAnsweredCurrent && (
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleNextQuestion}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] group"
            >
              <span>
                {currentIndex < activeQuestions.length - 1
                  ? 'Next Question'
                  : 'View Quiz Summary'}
              </span>
              <ArrowRight className="w-4 h-4 text-indigo-200 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
