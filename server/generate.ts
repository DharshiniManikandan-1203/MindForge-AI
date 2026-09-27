import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root or src directory
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'src', '.env') });
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
dotenv.config({ path: path.resolve(__dirname, '..', 'src', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

const JSON_SCHEMA_INSTRUCTION = `
You are an expert educational AI. Analyze the user's input notes/topic and generate a structured interactive study set.
You MUST return a single, strictly valid JSON object matching this exact specification with NO markdown fences, NO backticks, NO preamble, and NO conversational text:

{
  "topic": "Short concise title representing the subject",
  "summary": "2-3 sentence clear, high-yield overview of what is covered",
  "difficulty": "beginner" | "intermediate" | "advanced",
  "estimatedMinutes": 10,
  "keyConcepts": [
    {
      "id": "concept-1",
      "term": "Key Concept Term",
      "definition": "Clear, precise explanation",
      "importance": "high" | "medium" | "foundational",
      "example": "Practical real-world analogy or example"
    }
  ],
  "cards": [
    {
      "id": "card-1",
      "question": "Front of card question or prompt",
      "answer": "Back of card comprehensive explanation/answer",
      "hint": "Short subtle hint if the student gets stuck",
      "category": "Sub-topic or taxonomy tag"
    }
  ],
  "quiz": [
    {
      "id": "quiz-1",
      "question": "Concept check multiple-choice question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why Option A is correct and why the other choices are misleading",
      "conceptTag": "Related concept term"
    }
  ]
}

Rules:
1. Generate between 5 to 10 high-quality flashcards.
2. Generate between 4 to 8 multiple-choice quiz questions.
3. Every quiz question MUST have exactly 4 options, and 'correctIndex' MUST be randomized and evenly distributed across 0, 1, 2, and 3 (so the correct answer is NOT always Option B or in the same position).
4. Generate 3 to 6 key concepts.
5. All IDs must be unique strings (e.g. "card-1", "quiz-1", "concept-1").
6. Output ONLY raw JSON. No \`\`\`json or \`\`\` wrapper.
`;

// Clean JSON text (removes markdown backticks and trailing prose if any)
function cleanJsonOutput(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/i, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

// Root welcome endpoint
app.get('/', (_req: Request, res: Response) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const hasGeminiKey = Boolean(geminiKey && geminiKey !== 'your_gemini_api_key_here' && geminiKey.trim().length > 10);

  res.json({
    name: 'MindForge AI — Backend Proxy API',
    status: 'online',
    llmConfigured: hasGeminiKey,
    model: 'Google Gemini 3.6 Flash',
    endpoints: {
      health: '/api/health',
      generate: 'POST /api/generate',
      refine: 'POST /api/refine'
    }
  });
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const hasGeminiKey = Boolean(geminiKey && geminiKey !== 'your_gemini_api_key_here' && geminiKey.trim().length > 10);

  res.json({
    status: 'ok',
    llmConfigured: hasGeminiKey,
    provider: hasGeminiKey ? 'Google Gemini 3.6 Flash' : 'API Key Required in .env',
    version: '1.0.0'
  });
});

// Primary generation endpoint with Gemini AI
app.post('/api/generate', async (req: Request, res: Response) => {
  const { input, options } = req.body;

  if (!input || typeof input !== 'string' || input.trim().length === 0) {
    return res.status(400).json({
      error: 'EMPTY_INPUT',
      message: 'Input text is required. Please provide notes, topics, or study material.'
    });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey || geminiKey === 'your_gemini_api_key_here' || geminiKey.trim().length < 10) {
    return res.status(401).json({
      error: 'API_KEY_MISSING',
      message: 'GEMINI_API_KEY is not configured in .env. Please add your Gemini key.'
    });
  }

  const modelsToTry = [
    'gemini-3.8-flash',
    'gemini-3.6-flash',
    'gemini-3.7-flash',
    'gemini-3.5-flash'
  ];

  let lastError: any = null;
  let isRateLimited = false;

  for (const modelName of modelsToTry) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        }
      });

      const userPrompt = `
Study Material / Notes:
${input.trim()}

Configuration:
- Target Difficulty: ${options?.difficulty || 'intermediate'}
- Requested Focus: ${options?.focus || 'comprehensive'}
- Card Count: ${options?.cardCount || 6}
- Quiz Question Count: ${options?.quizCount || 5}

Generate the structured JSON study set now.`;

      const result = await model.generateContent([
        { text: JSON_SCHEMA_INSTRUCTION },
        { text: userPrompt }
      ]);

      const responseText = result.response.text();
      if (!responseText || responseText.trim().length === 0) {
        throw new Error('Received empty response from Gemini model');
      }

      const cleaned = cleanJsonOutput(responseText);
      const parsed = JSON.parse(cleaned);

      return res.json({
        success: true,
        data: parsed,
        modelUsed: modelName
      });
    } catch (err: any) {
      lastError = err;
      const errMsg = err.message || '';
      if (errMsg.includes('429') || errMsg.includes('Quota exceeded') || errMsg.includes('Too Many Requests')) {
        isRateLimited = true;
      }
      console.warn(`[Gemini] Attempt with model '${modelName}' failed:`, errMsg);
      // Wait 1 second before trying the next model to avoid rapid burst
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.error('[Gemini] All model attempts failed:', lastError);

  if (isRateLimited) {
    return res.status(429).json({
      error: 'RATE_LIMITED',
      message: 'Gemini API free tier rate limit reached. Please wait a few seconds and try again.',
      details: lastError?.message || lastError?.toString()
    });
  }

  return res.status(500).json({
    error: 'SERVER_ERROR',
    message: lastError?.message || 'Failed to generate study materials via Gemini AI.',
    details: lastError?.toString()
  });
});

// Refinement endpoint (edit existing study set with follow-up instruction)
app.post('/api/refine', async (req: Request, res: Response) => {
  const { currentStudySet, instruction } = req.body;

  if (!currentStudySet || !instruction) {
    return res.status(400).json({
      error: 'INVALID_REQUEST',
      message: 'Both currentStudySet and instruction are required for refinement.'
    });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey || geminiKey === 'your_gemini_api_key_here' || geminiKey.trim().length < 10) {
    return res.status(401).json({
      error: 'API_KEY_MISSING',
      message: 'GEMINI_API_KEY is not configured in .env.'
    });
  }

  const modelsToTry = [
    'gemini-3.8-flash',
    'gemini-3.6-flash',
    'gemini-3.7-flash',
    'gemini-3.5-flash'
  ];

  let lastError: any = null;
  let isRateLimited = false;

  for (const modelName of modelsToTry) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        }
      });

      const refinePrompt = `
You are updating an existing study set based on user refinement instructions.
Original Study Set (JSON):
${JSON.stringify(currentStudySet)}

User Refinement Request:
"${instruction}"

Output the updated study set in the EXACT same JSON schema. Maintain existing items where appropriate, update, or add new cards/quiz items according to the instruction. Output JSON only.`;

      const result = await model.generateContent([
        { text: JSON_SCHEMA_INSTRUCTION },
        { text: refinePrompt }
      ]);

      const cleaned = cleanJsonOutput(result.response.text());
      const parsed = JSON.parse(cleaned);

      return res.json({
        success: true,
        data: parsed,
        modelUsed: modelName
      });
    } catch (err: any) {
      lastError = err;
      const errMsg = err.message || '';
      if (errMsg.includes('429') || errMsg.includes('Quota exceeded') || errMsg.includes('Too Many Requests')) {
        isRateLimited = true;
      }
      console.warn(`[Gemini Refine] Model '${modelName}' failed:`, errMsg);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.error('[Gemini Refine] All model attempts failed:', lastError);

  if (isRateLimited) {
    return res.status(429).json({
      error: 'RATE_LIMITED',
      message: 'Gemini API free tier rate limit reached. Please wait a few seconds and try again.',
      details: lastError?.message || lastError?.toString()
    });
  }

  return res.status(500).json({
    error: 'SERVER_ERROR',
    message: lastError?.message || 'Failed to refine study set via Gemini AI.'
  });
});

app.listen(PORT, () => {
  console.log(`[MindForge Server] Express backend proxy running at http://localhost:${PORT}`);
});
