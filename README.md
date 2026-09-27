# MindForge AI — Interactive Study & Active-Recall Assistant

> **Flam Frontend Internship Assignment**  
> An AI-powered interactive study tool that transforms unstructured notes and raw topics into structured, interactive active-recall flashcards, self-grading quizzes, and key concepts.

[![React](https://img.shields.io/badge/React-18.3-61dafb.svg?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg?style=flat&logo=vite)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000.svg?style=flat&logo=express)](https://expressjs.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

---

## Table of Contents
1. [Core Philosophy (Why It's Not a Chatbot)](#core-philosophy)
2. [Quick Start & Setup](#quick-start--setup)
3. [Architecture & Project Structure](#architecture--project-structure)
4. [Structured JSON Schema](#structured-json-schema)
5. [Defensive Parsing & Failure Mode Handling](#defensive-parsing--failure-mode-handling)
6. [Interactive Features & Stretch Goals](#interactive-features--stretch-goals)
7. [AI Usage Note](#ai-usage-note)
8. [Known Limitations & Future Roadmap](#known-limitations--future-roadmap)
9. [Time Spent Breakdown](#time-spent-breakdown)

---

## 1. Core Philosophy

The primary objective is to demonstrate how to convert **unpredictable AI outputs into a robust, high-polish, interactive UI** rather than a standard conversational chat box.

- **Strict Structured Outputs**: The LLM is constrained to return a well-defined JSON schema representing a `StudySet` containing flashcards, quiz questions with distractor explanations, and foundational concepts.
- **Defensive Boundary**: Raw model responses never touch React state directly. They pass through a dedicated validation and sanitization layer (`validateResult.ts`).
- **Secure Backend Proxy**: Frontend calls an internal Node/Express proxy (`/api/generate`), keeping all API keys securely off the client bundle.
- **Offline Intelligent Demo Mode**: If no Gemini API key is configured in `.env`, the application automatically falls back to an internal structured generator so the entire interactive UI can be evaluated immediately with zero setup friction.

---

## 2. Quick Start & Setup

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### Installation & Launch

```bash
# 1. Clone repository
git clone https://github.com/DharshiniManikandan-1203/flam-frontend-assignment.git
cd flam-frontend-assignment

# 2. Install dependencies
npm install


# 3. Start both Backend Server and Vite Dev Server concurrently
npm start
# or: npm run dev
```

The application will be accessible at:
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend Proxy**: [http://localhost:3001](http://localhost:3001)

### 🌐 Deployment Guide (Render + Vercel)

#### 1. Deploy Backend to Render (Web Service)
1. Go to [Render Dashboard](https://dashboard.render.com/) -> **New** -> **Web Service**.
2. Connect this GitHub repository.
3. Configure the service:
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start:server`
   - **Environment Variable**: `GEMINI_API_KEY` = your Gemini key.
4. Once deployed, copy your Render backend URL (e.g. `https://your-backend.onrender.com`).

#### 2. Deploy Frontend to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/) -> **Add New** -> **Project**.
2. Import this GitHub repository.
3. Set Environment Variable in Vercel settings:
   - `VITE_API_BASE_URL` = `https://your-backend.onrender.com`
4. Click **Deploy**. Vercel will build and host the interactive frontend!

---

## 3. Architecture & Project Structure

```
flam-frontend-assignment/
├── server/
│   └── generate.ts          # Express proxy: holds API key, invokes Gemini, enforces JSON schema
├── src/
│   ├── components/
│   │   ├── Header.tsx        # App bar with provider status, saved decks drawer, shortcuts trigger
│   │   ├── PromptInput.tsx   # Free-form text input with presets and difficulty controls
│   │   ├── ResultView.tsx    # Tabbed dashboard routing parsed data to interactive modules
│   │   ├── FlashcardDeck.tsx # 3D flipping cards with mastery tracking, filtering, and shuffle
│   │   ├── QuizView.tsx      # Interactive quiz with instant feedback, streak, and re-test loop
│   │   ├── KeyConceptsView.tsx # Structured concept cards with importance tags and clipboard copy
│   │   ├── RefinementInput.tsx # Follow-up prompt loop to adjust or expand the active deck
│   │   ├── SessionHistory.tsx # LocalStorage session manager with JSON/Markdown export
│   │   ├── ShortcutsModal.tsx # Keyboard navigation guide (? trigger)
│   │   ├── LoadingState.tsx  # Multi-stage pipeline progress indicator with cancel action
│   │   └── ErrorState.tsx    # Granular error state with debug inspector and retry actions
│   ├── lib/
│   │   ├── api.ts            # Frontend API client with AbortController and timeout guards
│   │   └── validateResult.ts # Defensive shape validation and schema sanitization
│   ├── types/
│   │   └── result.ts         # TypeScript interfaces for StudySet, Cards, Quiz, and Errors
│   ├── App.tsx               # Root component: state orchestration and stale response guard
│   ├── main.tsx              # React DOM entry point
│   └── index.css             # Tailwind styling and 3D card perspective classes
├── .env                      # Environment variables 
├── package.json              # Project scripts and dependencies
├── tailwind.config.js        # Theme tokens, fonts, and animation keyframes
└── tsconfig.json             # TypeScript configuration
```

---

## 4. Structured JSON Schema

The AI is strictly prompted to return a single JSON object conforming to the following TypeScript model:

```typescript
export interface StudySet {
  topic: string;
  summary: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  keyConcepts: Array<{
    id: string;
    term: string;
    definition: string;
    importance: 'high' | 'medium' | 'foundational';
    example?: string;
  }>;
  cards: Array<{
    id: string;
    question: string;
    answer: string;
    hint?: string;
    category?: string;
  }>;
  quiz: Array<{
    id: string;
    question: string;
    options: string[]; // exactly 4 choices
    correctIndex: number; // 0 to 3
    explanation: string;
    conceptTag?: string;
  }>;
}
```

---

## 5. Defensive Parsing & Failure Mode Handling

Most real-world AI features fail because developers assume the model will always return valid JSON in the exact expected structure. MindForge AI implements layered defensive guards:

| Failure Scenario | How MindForge AI Handles It |
| :--- | :--- |
| **Malformed JSON** | `JSON.parse` is wrapped in `try/catch`. On failure, the UI renders `ErrorState` with the `MALFORMED_JSON` badge, offers a 1-click retry, and provides an optional raw payload viewer for debugging. |
| **Missing Fields / Invalid Schema** | `validateStudySet()` validates every field, normalizes missing IDs, filters malformed questions (e.g. fewer than 2 options), and bounds `correctIndex` to valid ranges. If critical collections (`cards`) are absent, routes to `INVALID_SCHEMA` error state. |
| **Empty / 0-byte Output** | Caught on both backend and frontend as `EMPTY_RESPONSE` before attempting to parse. |
| **Slow / Hanging Responses** | Enforced 35-second client timeout via `AbortController` and `fetchWithTimeout`. Shows multi-stage animated loading screen with a manual "Cancel" button. |
| **Network / Server Outage** | Displays a clear `NETWORK_ERROR` banner with instructions to ensure the backend proxy is running on port 3001. |
| **Rate Limits (HTTP 429)** | Catches quota errors cleanly, displaying a cooldown suggestion and a button to switch to the offline verified sample engine. |
| **Stale Response Race Condition** | Protects against asynchronous race conditions using an incrementing `useRef(0)` sequence ID. If a user submits a second query while a first is still in flight, the slower first response is safely discarded upon resolution. |

```typescript
// Stale Response Guard Implementation (src/App.tsx)
const requestId = useRef(0);

const handleGenerate = async (input: string) => {
  const currentReqId = ++requestId.current;
  const result = await generateStudySet(input);
  
  // Ignore if a newer request was dispatched in the meantime
  if (currentReqId !== requestId.current) return;
  
  setStudySet(result.studySet);
};
```

---

## 6. Interactive Features & Stretch Goals

### 1. 3D Active-Recall Flashcards
- **Realistic 3D Flip**: Click or press `Space` to flip between question and answer with smooth CSS 3D perspective transforms.
- **Recall Mastery**: Rate recall as *Know It* (Green) or *Still Learning* (Amber) with instant keyboard hotkeys (`1` and `2`).
- **Deck Controls**: Shuffle deck order, bookmark/star cards (`S`), and filter cards by mastery status.
- **Keyboard Navigation**: `←` / `→` or `H` / `L` to step through the deck.

### 2. Interactive Self-Grading Quiz & Re-Test Loop
- **Instant Feedback**: Selecting an option highlights correct (Emerald) and incorrect (Rose) answers immediately.
- **Detailed Rationale**: Expands explanation for each option.
- **Streak & Grade Tracker**: Tracks consecutive correct answers and computes final letter grade (`A+` to `D`) with celebratory confetti.
- **Targeted Re-Test Loop**: "Re-Test Wrong Answers" mode extracts only the questions you missed into a focused re-take session.

### 3. Refinement Loop (Stretch Goal #3)
- Users can provide follow-up instructions (e.g. *"Add 3 advanced cards on edge cases"*, *"Simplify definitions"*) to iteratively expand the deck without starting from scratch.

### 4. Session Persistence & Export (Stretch Goal #4)
- Decks are saved to `localStorage` with mastery statistics.
- Export full study sets to structured **JSON** or formatted **Markdown (MD)** study guides with one click.

---

## 7. AI Usage Note

In accordance with the assignment guidelines:
- **AI Tooling Used**: Generative AI assistants were utilized for initial prompt drafting, schema structuring, and rapid syntax lookup.
- **Original Code & Architecture**: All component architectures, state workflows, 3D flip card CSS, defensive validation logic, stale response guards, and error state transitions were designed and implemented specifically for this project.

---

## 8. Known Limitations & Future Roadmap

1. **Spaced Repetition Algorithm**: Current mastery tracks session-based status (*Know It* vs *Still Learning*). A full SuperMemo (SM-2) algorithm calculating next review intervals (1 day, 3 days, 7 days) would be a natural next step.
2. **Multi-Modal Diagrams**: Adding AI-generated Mermaid diagram support for complex workflows or architecture notes.
3. **Audio Pronunciation**: Integrating Web Speech API for auditory flashcard prompts.

---

## 9. Time Spent Breakdown

| Phase | Activity | Time Spent |
| :--- | :--- | :--- |
| **Phase 1** | Requirements analysis, structured JSON schema design, and domain modeling | ~45 mins |
| **Phase 2** | Project scaffolding (Vite, React 18, TypeScript, TailwindCSS) & backend Express proxy | ~1 hr 15 mins |
| **Phase 3** | Defensive validator (`validateResult.ts`), API client, timeout & stale response guards | ~1 hr 30 mins |
| **Phase 4** | 3D Flashcard Deck with mastery tracking, filtering, keyboard shortcuts, and shuffle | ~1 hr 45 mins |
| **Phase 5** | Interactive Quiz component with instant explanations, streak counter, and **Re-Test loop** | ~1 hr 15 mins |
| **Phase 6** | Granular error states, loading pipelines, session persistence (LocalStorage), and polish | ~1 hr 00 mins |
| **Phase 7** | Testing failure scenarios, responsive mobile checks, documentation, and demo verification | ~45 mins |
| **Total** | **End-to-End Build & Validation** | **~7 hours 45 mins** |

---

## License & Author

Created by **Dharshini Manikandan** for the **Flam Frontend Internship Assignment**.
Licensed under the [MIT License](LICENSE).
