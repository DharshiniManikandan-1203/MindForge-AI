export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type ConceptImportance = 'high' | 'medium' | 'foundational';

export interface KeyConcept {
  id: string;
  term: string;
  definition: string;
  importance: ConceptImportance;
  example?: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  hint?: string;
  category?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  conceptTag?: string;
}

export interface StudySet {
  topic: string;
  summary: string;
  difficulty: DifficultyLevel;
  estimatedMinutes: number;
  keyConcepts: KeyConcept[];
  cards: Flashcard[];
  quiz: QuizQuestion[];
  generatedAt?: string;
}

export type CardMasteryStatus = 'unseen' | 'learning' | 'mastered';

export interface CardProgress {
  [cardId: string]: {
    status: CardMasteryStatus;
    starred: boolean;
    reviewsCount: number;
  };
}

export interface QuizAttempt {
  answers: { [questionId: string]: number };
  submitted: boolean;
  score: number;
  total: number;
  completedAt?: string;
  retestQuestionIds?: string[];
}

export interface SavedSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  data: StudySet;
  masteryCount: number;
  totalCards: number;
  quizHighScore?: number;
}

export type ErrorType =
  | 'MALFORMED_JSON'
  | 'INVALID_SCHEMA'
  | 'EMPTY_RESPONSE'
  | 'NETWORK_ERROR'
  | 'RATE_LIMITED'
  | 'API_KEY_MISSING'
  | 'SERVER_ERROR'
  | 'TIMEOUT';

export interface ApiError {
  type: ErrorType;
  message: string;
  details?: string;
  rawResponse?: string;
  canRetry: boolean;
}

export interface GenerateOptions {
  difficulty?: DifficultyLevel;
  focus?: 'comprehensive' | 'flashcards' | 'quiz' | 'quick-review';
  cardCount?: number;
  quizCount?: number;
}

export interface GenerationProgress {
  stage: 'idle' | 'sending' | 'synthesizing' | 'validating' | 'done';
  message: string;
  percent: number;
}
