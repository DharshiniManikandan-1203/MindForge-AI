import {
  StudySet,
  Flashcard,
  QuizQuestion,
  KeyConcept,
  ApiError
} from '../types/result';

export interface ValidationSuccess {
  isValid: true;
  data: StudySet;
  warnings?: string[];
}

export interface ValidationFailure {
  isValid: false;
  error: ApiError;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

/**
 * Validates and sanitizes raw untrusted data returned by the backend or LLM.
 * Performs deep structural inspection of arrays, nested objects, and types.
 */
export function validateStudySet(raw: unknown): ValidationResult {
  const warnings: string[] = [];

  // Check 1: Must be a non-null object
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {
      isValid: false,
      error: {
        type: 'INVALID_SCHEMA',
        message: 'The AI model response was not a structured JSON object.',
        details: `Expected object, received ${Array.isArray(raw) ? 'array' : typeof raw}`,
        canRetry: true,
      },
    };
  }

  const obj = raw as Record<string, any>;

  // Check 2: Top-level fields
  const topic = typeof obj.topic === 'string' && obj.topic.trim().length > 0
    ? obj.topic.trim()
    : 'Untitled Study Session';

  const summary = typeof obj.summary === 'string' && obj.summary.trim().length > 0
    ? obj.summary.trim()
    : 'No summary provided by the model.';

  const validDifficulties = ['beginner', 'intermediate', 'advanced'];
  const difficulty = validDifficulties.includes(obj.difficulty)
    ? obj.difficulty
    : 'intermediate';

  const estimatedMinutes = typeof obj.estimatedMinutes === 'number' && obj.estimatedMinutes > 0
    ? obj.estimatedMinutes
    : 10;

  // Check 3: Cards array validation
  if (!Array.isArray(obj.cards) || obj.cards.length === 0) {
    return {
      isValid: false,
      error: {
        type: 'INVALID_SCHEMA',
        message: 'The model response is missing the flashcards collection.',
        details: 'Expected "cards" to be a non-empty array of flashcard objects.',
        canRetry: true,
      },
    };
  }

  const validatedCards: Flashcard[] = [];
  for (let i = 0; i < obj.cards.length; i++) {
    const item = obj.cards[i];
    if (!item || typeof item !== 'object') {
      warnings.push(`Skipped invalid card item at index ${i}`);
      continue;
    }

    const question = typeof item.question === 'string' ? item.question.trim() : '';
    const answer = typeof item.answer === 'string' ? item.answer.trim() : '';

    if (!question || !answer) {
      warnings.push(`Card ${i + 1} was missing either question or answer and was skipped.`);
      continue;
    }

    validatedCards.push({
      id: typeof item.id === 'string' && item.id.length > 0 ? item.id : `card-${i + 1}-${Date.now()}`,
      question,
      answer,
      hint: typeof item.hint === 'string' ? item.hint.trim() : undefined,
      category: typeof item.category === 'string' ? item.category.trim() : 'General',
    });
  }

  if (validatedCards.length === 0) {
    return {
      isValid: false,
      error: {
        type: 'INVALID_SCHEMA',
        message: 'No valid flashcards could be parsed from the model output.',
        details: 'Each card must contain non-empty "question" and "answer" strings.',
        canRetry: true,
      },
    };
  }

  // Check 4: Quiz array validation
  const validatedQuiz: QuizQuestion[] = [];
  if (Array.isArray(obj.quiz)) {
    for (let i = 0; i < obj.quiz.length; i++) {
      const q = obj.quiz[i];
      if (!q || typeof q !== 'object') continue;

      const question = typeof q.question === 'string' ? q.question.trim() : '';
      if (!question) continue;

      // Validate options array
      let options: string[] = [];
      if (Array.isArray(q.options)) {
        options = q.options
          .map((opt: any) => (typeof opt === 'string' ? opt.trim() : String(opt || '')))
          .filter((opt: string) => opt.length > 0);
      }

      if (options.length < 2) {
        warnings.push(`Quiz question "${question.slice(0, 30)}..." had fewer than 2 valid options; skipped.`);
        continue;
      }

      // Validate correctIndex
      let correctIndex = typeof q.correctIndex === 'number' ? Math.floor(q.correctIndex) : 0;
      if (correctIndex < 0 || correctIndex >= options.length) {
        warnings.push(`Quiz question ${i + 1} had out-of-range correctIndex (${q.correctIndex}); normalized to 0.`);
        correctIndex = 0;
      }

      // Randomize option positions (Fisher-Yates) so the correct answer is mixed across A, B, C, and D
      const correctAnswerText = options[correctIndex];
      const shuffledOptions = [...options];
      for (let j = shuffledOptions.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [shuffledOptions[j], shuffledOptions[k]] = [shuffledOptions[k], shuffledOptions[j]];
      }
      const newCorrectIndex = shuffledOptions.indexOf(correctAnswerText);

      const explanation = typeof q.explanation === 'string' && q.explanation.trim().length > 0
        ? q.explanation.trim()
        : `The correct answer is "${correctAnswerText}" based on the study material.`;

      validatedQuiz.push({
        id: typeof q.id === 'string' && q.id.length > 0 ? q.id : `quiz-${i + 1}-${Date.now()}`,
        question,
        options: shuffledOptions,
        correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
        explanation,
        conceptTag: typeof q.conceptTag === 'string' ? q.conceptTag.trim() : undefined,
      });
    }
  }

  // Check 5: Key Concepts validation
  const validatedConcepts: KeyConcept[] = [];
  if (Array.isArray(obj.keyConcepts)) {
    for (let i = 0; i < obj.keyConcepts.length; i++) {
      const c = obj.keyConcepts[i];
      if (!c || typeof c !== 'object') continue;

      const term = typeof c.term === 'string' ? c.term.trim() : '';
      const definition = typeof c.definition === 'string' ? c.definition.trim() : '';

      if (!term || !definition) continue;

      const validImp = ['high', 'medium', 'foundational'];
      const importance = validImp.includes(c.importance) ? c.importance : 'medium';

      validatedConcepts.push({
        id: typeof c.id === 'string' && c.id.length > 0 ? c.id : `concept-${i + 1}`,
        term,
        definition,
        importance: importance as any,
        example: typeof c.example === 'string' ? c.example.trim() : undefined,
      });
    }
  }

  const cleanStudySet: StudySet = {
    topic,
    summary,
    difficulty: difficulty as any,
    estimatedMinutes,
    keyConcepts: validatedConcepts,
    cards: validatedCards,
    quiz: validatedQuiz,
    generatedAt: new Date().toISOString(),
  };

  return {
    isValid: true,
    data: cleanStudySet,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Defensive JSON parse function that handles raw strings from the API,
 * stripped fences, or unexpected primitives.
 */
export function parseAndValidateRaw(rawJsonText: string): ValidationResult {
  if (!rawJsonText || typeof rawJsonText !== 'string' || rawJsonText.trim().length === 0) {
    return {
      isValid: false,
      error: {
        type: 'EMPTY_RESPONSE',
        message: 'Received an empty response from the server.',
        details: 'The backend proxy returned an empty payload.',
        canRetry: true,
      },
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJsonText);
  } catch (err: any) {
    return {
      isValid: false,
      error: {
        type: 'MALFORMED_JSON',
        message: 'The model returned malformed or unparseable JSON.',
        details: err.message || 'JSON.parse syntax error',
        rawResponse: rawJsonText.slice(0, 500),
        canRetry: true,
      },
    };
  }

  return validateStudySet(parsed);
}
