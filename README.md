# MindForge AI — Interactive Study & Active-Recall Assistant

> **Flam Frontend Internship Assignment**  
> **Author**: Dharshini Manikandan  
> **GitHub**: [@DharshiniManikandan-1203](https://github.com/DharshiniManikandan-1203)  
> **Repository**: [flam-frontend-assignment](https://github.com/DharshiniManikandan-1203/flam-frontend-assignment)

[![Live Frontend](https://img.shields.io/badge/Frontend-Vercel_Deployment-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://flam-frontend-assignment.vercel.app)
[![Live Backend](https://img.shields.io/badge/Backend_API-Render_Service-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://flam-frontend-assignment-yfwt.onrender.com)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.8_Flash-8E75FF?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

---

## 🔗 Live Access & Deployment Links

| Resource | Service / Platform | Direct URL | Status |
| :--- | :--- | :--- | :--- |
| **Frontend Application** | Vercel | [https://flam-frontend-assignment.vercel.app](https://flam-frontend-assignment.vercel.app) | 🟢 Live / Deployed |
| **Backend API Proxy** | Render | [https://flam-frontend-assignment-yfwt.onrender.com](https://flam-frontend-assignment-yfwt.onrender.com) | 🟢 Online / Active |
| **Health Check Endpoint** | Render Web Service | [https://flam-frontend-assignment-yfwt.onrender.com/api/health](https://flam-frontend-assignment-yfwt.onrender.com/api/health) | 🟢 200 OK |
| **Source Repository** | GitHub | [https://github.com/DharshiniManikandan-1203/flam-frontend-assignment](https://github.com/DharshiniManikandan-1203/flam-frontend-assignment) | 🟢 Public |

---

## 📌 Executive Overview

**MindForge AI** is an intelligent, structured educational study tool designed to transform unstructured notes, articles, and curriculum topics into active-recall learning suites. 

Rather than standard conversational chat interfaces, MindForge AI focuses on **deterministic structured JSON extraction** to drive interactive UI components:

1. **3D Active-Recall Flashcard Deck**: Interactive flip cards with session mastery tracking, keyboard shortcuts, shuffling, and status filters.
2. **Self-Grading Quiz Engine with Re-Test Loop**: 4-option multiple-choice quizzes featuring randomized answer distribution, instant answer rationales, score streaks, letter grading, and an exclusive **"Re-Test Wrong Answers"** mode.
3. **Key Concept Taxonomy**: High-yield terminology cards categorized by importance level with instant clipboard integration.
4. **Follow-Up Refinement Engine**: Live conversational refinement loop allowing students to dynamically expand or adjust generated study sets without losing context.
5. **Session Management & Export**: Local persistence with full study set export in **JSON** and formatted **Markdown (.md)** study guides.

---

## 🏛️ Architectural Highlights

```
┌─────────────────────────────────────────────────────────────┐
│                       Client (Vite / React 18)              │
│  - Tabbed Dashboard (Flashcards / Quiz / Concepts)          │
│  - Defensive Runtime Validator (validateResult.ts)          │
│  - Stale Response Guard (useRef Sequence ID)                │
│  - AbortController Timeout Management                       │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               Backend Proxy (Express / Node.js)             │
│  - Secure API Key Isolation (Never exposed to client)       │
│  - Dynamic Model Cascade (Gemini 3.8 / 3.6 / 3.7 Flash)     │
│  - JSON Schema Enforcement & Output Sanitization            │
│  - Automated 429 Rate-Limit Interception                    │
└──────────────────────────────┬──────────────────────────────┘
                               │ Google Generative AI SDK
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Google Gemini AI Cloud                   │
│  - Strict JSON Mode (responseMimeType: application/json)   │
└─────────────────────────────────────────────────────────────┘
```

### 1. Zero API Key Exposure
All LLM orchestration happens on the dedicated Express backend proxy (`server/generate.ts`). Client bundles never contain sensitive API keys or credentials.

### 2. Strict Defensive Validation Boundary
LLM outputs are sanitized and validated through a runtime schema validator before reaching React state. Missing attributes, malformed questions, or invalid option lengths are safely normalized without UI crashes.

### 3. Asynchronous Stale Response Guard
An incremental sequence identifier (`useRef(0)`) tags each request. If a user triggers a new generation while a previous request is in-flight, slower stale responses are safely discarded upon resolution.

### 4. Automated Answer Randomization
Quiz questions undergo algorithmic option shuffling (Fisher-Yates) during ingestion, ensuring correct answers are evenly distributed across all choices (`A`, `B`, `C`, `D`).

---

## 🚀 Quick Start & Local Development

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Gemini API Key**: Obtainable from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone & Install

```bash
git clone https://github.com/DharshiniManikandan-1203/flam-frontend-assignment.git
cd flam-frontend-assignment
npm install
```

### 2. Configure Environment

Create a `.env` file in the project root:

```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Launch Development Server

```bash
npm start
```

This concurrently starts:
- **Frontend (Vite)**: [http://localhost:5173](http://localhost:5173)
- **Backend Proxy (Express)**: [http://localhost:3001](http://localhost:3001)

---

## 📂 Project Structure

```
flam-frontend-assignment/
├── server/
│   └── generate.ts            # Express proxy: holds Gemini API key, handles /api/generate & /api/refine
├── src/
│   ├── components/
│   │   ├── Header.tsx          # Brand header, live Gemini status indicator, and saved session access
│   │   ├── PromptInput.tsx     # Topic input, preset curriculum topics, and difficulty controls
│   │   ├── ResultView.tsx      # Core tabbed interface for Flashcards, Quiz, Concepts, and Meta
│   │   ├── FlashcardDeck.tsx   # 3D CSS flip cards, mastery rating (Know It / Still Learning), shortcuts
│   │   ├── QuizView.tsx        # Interactive quiz, rationale expanders, confetti, and Re-Test loop
│   │   ├── KeyConceptsView.tsx # High-yield concept cards with importance badges and clipboard copy
│   │   ├── RefinementInput.tsx # Follow-up prompt loop for iterative study set updates
│   │   ├── SessionHistory.tsx  # LocalStorage persistence with JSON and Markdown export
│   │   ├── ShortcutsModal.tsx  # Keyboard shortcuts modal dialog (? key)
│   │   ├── LoadingState.tsx    # Multi-stage animated pipeline with cancel action
│   │   └── ErrorState.tsx      # Granular error state with debug inspector and retry action
│   ├── lib/
│   │   ├── api.ts              # API client with AbortController and timeout guards
│   │   └── validateResult.ts   # Defensive validation, sanitization, and quiz option randomization
│   ├── types/
│   │   └── result.ts           # TypeScript type definitions for StudySet, Cards, Quiz, and Errors
│   ├── App.tsx                 # Root component: state management and stale response guard
│   ├── main.tsx                # React application entry point
│   └── index.css               # Tailwind directives and custom 3D card CSS transformations
├── .env.example                # Example environment configuration template
├── package.json                # Project dependencies and operational scripts
├── tailwind.config.js          # Tailwind design tokens, typography, and animation configurations
├── tsconfig.json               # TypeScript configuration
└── vercel.json                 # Vercel deployment routing configuration
```

---

## 📋 Data Contract & Schema Specification

The backend proxy enforces a strict JSON contract with Google Gemini AI:

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
    correctIndex: number; // 0 to 3 (randomized)
    explanation: string;
    conceptTag?: string;
  }>;
}
```

---

## 🛡️ Error Handling & Defensive Resilience

| Failure Mode | Defensive Strategy | UI Behavior |
| :--- | :--- | :--- |
| **Malformed JSON** | Backend cleaning layer + client `try/catch` guard | Renders `MALFORMED_JSON` error state with raw payload inspector and 1-click retry. |
| **Schema Mismatch** | `validateStudySet()` defensive type and bounds checking | Automatically repairs minor anomalies; halts corrupted schemas with clean diagnostic messaging. |
| **Upstream Timeout** | 35-second client timeout enforced via `AbortController` | Displays `TIMEOUT` notification with manual abort and retry controls. |
| **Quota / Rate Limits (429)** | Automated rate-limit interception across fallback models | Displays `RATE_LIMITED` badge with retry cooldown recommendation. |
| **Stale Async Race Condition** | `useRef(0)` incrementing sequence IDs | Safely drops slower out-of-order responses when subsequent generations are requested. |

---

## ⌨️ Keyboard Shortcuts

| Key | Action | Scope |
| :--- | :--- | :--- |
| `Space` / `Enter` | Flip active flashcard | Flashcards Tab |
| `←` / `→` or `H` / `L` | Previous / Next flashcard | Flashcards Tab |
| `1` | Mark as "Still Learning" | Flashcards Tab |
| `2` | Mark as "Know It" | Flashcards Tab |
| `S` | Toggle star / bookmark on active card | Flashcards Tab |
| `?` | Open Keyboard Shortcuts Modal | Global |

---

## 🌐 Production Deployment

### Backend (Render Web Service)
- **Repository**: Connected to GitHub repository (`main` branch)
- **Build Command**: `npm install`
- **Start Command**: `npm run start:server`
- **Environment Variables**: `GEMINI_API_KEY` configured in Render Environment Settings

### Frontend (Vercel)
- **Framework Preset**: Vite
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**: `VITE_API_BASE_URL` set to Render backend service URL

---

## 👤 Author & Acknowledgements

- **Author**: Dharshini Manikandan
- **Role**: Frontend Engineering Intern Candidate
- **Assignment**: Flam Frontend Internship Assignment — *AI-Powered Interactive Tool*
- **License**: MIT License
