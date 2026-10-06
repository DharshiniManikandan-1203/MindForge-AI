# MindForge AI — Interactive Study & Active-Recall Assistant

> **Flam Frontend Internship Assignment**  
> **Author**: Dharshini Manikandan  
> **GitHub**: [@DharshiniManikandan-1203](https://github.com/DharshiniManikandan-1203)  
> **Repository**: [MindForge-AI](https://github.com/DharshiniManikandan-1203/MindForge-AI)

[![Live Frontend](https://img.shields.io/badge/Frontend-Vercel_Deployment-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://flam-frontend-assignment-two.vercel.app)
[![Live Backend](https://img.shields.io/badge/Backend_API-Render_Service-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://flam-frontend-assignment-yfwt.onrender.com)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.8_Flash-8E75FF?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

---

## 🔗 Live Access & Deployment Links

| Resource | Service / Platform | Direct URL | Status |
| :--- | :--- | :--- | :--- |
| **Frontend Application** | Vercel | [https://flam-frontend-assignment-two.vercel.app](https://flam-frontend-assignment-two.vercel.app) | 🟢 Live / Deployed |
| **Backend API Proxy** | Render | [https://flam-frontend-assignment-yfwt.onrender.com](https://flam-frontend-assignment-yfwt.onrender.com) | 🟢 Online / Active |
| **Health Check Endpoint** | Render Web Service | [https://flam-frontend-assignment-yfwt.onrender.com/api/health](https://flam-frontend-assignment-yfwt.onrender.com/api/health) | 🟢 200 OK |
| **Source Repository** | GitHub | [https://github.com/DharshiniManikandan-1203/flam-frontend-assignment](https://github.com/DharshiniManikandan-1203/flam-frontend-assignment) | 🟢 Public |

---

## 📌 Project Overview

**MindForge AI** is an intelligent, structured educational study tool designed to turn unstructured notes, textbook summaries, and complex topics into active-recall study sets.

Rather than building a standard conversational chat interface, this project focuses on **deterministic structured extraction** that directly drives rich, interactive UI components:

1. **3D Active-Recall Flashcards**: Realistic 3D card flips, session recall tracking (*Know It* vs *Still Learning*), card bookmarking, deck shuffling, and keyboard shortcuts.
2. **Interactive Quiz Engine & Re-Test Loop**: Multiple-choice quizzes with randomized option distribution, immediate feedback with rationale explanations, streak counters, letter grades (`A+` to `D`), celebratory confetti, and a targeted **"Re-Test Wrong Answers"** mode.
3. **Key Concepts Taxonomy**: High-yield terminology breakdown tagged by importance with 1-click clipboard copying.
4. **Iterative Refinement Loop**: Follow-up prompt engine to dynamically modify, expand, or simplify study sets without starting over.
5. **Session Persistence & Export**: LocalStorage session history with export to structured **JSON** and formatted **Markdown (.md)** study guides.

---

## 🚀 Setup & Installation

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Gemini API Key**: Obtain a free key from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/DharshiniManikandan-1203/flam-frontend-assignment.git
cd flam-frontend-assignment
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run Locally

```bash
npm start
```

---

## 📖 How to Use MindForge AI

1. **Generate a Study Set**:
   - Paste your study notes or choose a preset topic (e.g., *Photosynthesis*, *Quantum Computing*, *System Design*).
   - Adjust the difficulty slider (*Beginner*, *Intermediate*, *Advanced*) and focus preferences.
   - Click **"Generate Study Deck"**.

2. **Master Active Recall with 3D Flashcards**:
   - Click a card or press `Space` to flip between question and answer.
   - Use `1` to mark a card as *Still Learning* or `2` for *Know It*.
   - Filter cards by mastery status, star priority cards with `S`, or hit **Shuffle** to randomize the deck.

3. **Take Quizzes & Re-Test**:
   - Select an answer to get immediate visual feedback and detailed conceptual rationale.
   - Watch your streak counter and finish the quiz to view your score summary and letter grade.
   - Click **"Re-Test Wrong Answers"** to isolate and practice only the questions you missed.

4. **Review Key Concepts**:
   - Browse high-yield definitions and practical examples categorized by importance (*Foundational*, *Medium*, *High*).
   - Click the copy button to grab formatted notes for your personal docs.

5. **Refine Deck with Follow-up Prompts**:
   - Use the bottom refinement bar to request updates (e.g., *"Add 3 advanced cards on edge cases"* or *"Simplify the flashcard explanations"*).

6. **Save & Export**:
   - Access saved sessions via the top drawer.
   - Export any study deck as clean **JSON** or formatted **Markdown**.

---

## 🏛️ Architecture & Defensive Engineering

```
┌─────────────────────────────────────────────────────────────┐
│                       Client (Vite / React 18)              │
│  - Tabbed Dashboard (Flashcards / Quiz / Concepts)          │
│  - Defensive Runtime Validator (validateResult.ts)          │
│  - Stale Response Guard (useRef Sequence ID)                │
│  - AbortController Timeout Management (35s)                 │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               Backend Proxy (Express / Node.js)             │
│  - Secure API Key Isolation (Never exposed to client)       │
│  - Model Cascade (Gemini 3.8 / 3.6 / 3.7 / 3.5 Flash)       │
│  - JSON Schema Enforcement & Output Sanitization            │
│  - Rate-Limit Interception (HTTP 429)                       │
└──────────────────────────────┬──────────────────────────────┘
                               │ Google Generative AI SDK
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Google Gemini AI Cloud                   │
│  - Strict JSON Mode (responseMimeType: application/json)   │
└─────────────────────────────────────────────────────────────┘
```

### Key Technical Decisions:
- **Backend API Proxy (`server/generate.ts`)**: Keeps the Google Gemini API key strictly on the server, avoiding any exposure in client JavaScript bundles.
- **Defensive Validation Boundary (`src/lib/validateResult.ts`)**: Intercepts and validates the raw JSON response before feeding it to React components. Missing fields, broken IDs, or malformed arrays are normalized safely.
- **Fisher-Yates Option Shuffling**: Multiple-choice options are dynamically scrambled on ingestion so correct answers are naturally distributed across `A`, `B`, `C`, and `D`.
- **Stale Response Guard**: Uses an incrementing sequence ID (`useRef(0)`) to ensure that if a user submits a second query before the first finishes, slow out-of-order responses are safely discarded.

---

## 🛡️ Error Handling & Failure Resilience

| Scenario | Strategy & Handling | User Experience |
| :--- | :--- | :--- |
| **Malformed JSON** | Backend cleaning layer + frontend `try/catch` wrapper | Clear `MALFORMED_JSON` error banner with raw payload inspector and 1-click retry. |
| **Schema Mismatch** | `validateStudySet()` defensive bounds and shape verification | Repairs minor anomalies or halts cleanly with informative diagnostic feedback. |
| **Request Timeout** | 35-second client timeout enforced via `AbortController` | Displays `TIMEOUT` notification with manual abort and retry controls. |
| **Rate Limits (HTTP 429)** | Automated rate-limit detection across fallback models | Shows `RATE_LIMITED` badge with retry cooldown suggestion. |
| **Stale Async Race Condition** | `useRef(0)` incrementing sequence counter | Safely drops slower out-of-order responses when subsequent generations are requested. |

---

## ⌨️ Keyboard Shortcuts

| Key | Action | Scope |
| :--- | :--- | :--- |
| `Space` / `Enter` | Flip active flashcard | Flashcards Tab |
| `←` / `→` or `H` / `L` | Previous / Next flashcard | Flashcards Tab |
| `1` | Mark card as "Still Learning" | Flashcards Tab |
| `2` | Mark card as "Know It" | Flashcards Tab |
| `S` | Toggle star / bookmark on active card | Flashcards Tab |
| `?` | Open Keyboard Shortcuts Modal | Global |

---

## 🤖 AI-Usage Note

In accordance with the assignment guidelines, here is a transparent overview of how AI tools were utilized during development:

- **What AI was used for**:
  - Drafting initial system prompt instructions and refining the JSON schema format.
  - Generating sample test topics during development to test edge cases.
  - Quick syntax lookups for Tailwind CSS animation configurations and TypeScript utility types.

- **What was built from scratch**:
  - Entire React application architecture, custom hooks, and state management workflows.
  - Custom 3D perspective flip card animations and CSS transform hierarchy.
  - Defensive runtime validation engine (`validateResult.ts`) and Fisher-Yates quiz option randomizer.
  - Asynchronous stale-response race condition guard (`useRef(0)` sequence manager).
  - Multi-stage loading progress pipeline, error boundary states, and the targeted **Re-Test Wrong Answers** quiz loop.
  - Express backend proxy with multi-model fallback cascade.

---

## 🔮 Known Limitations & Roadmap

1. **Spaced Repetition Algorithm (SM-2)**: Current recall mastery tracks session-based status (*Know It* vs *Still Learning*). Integrating a full SuperMemo (SM-2) algorithm with calculated review intervals (1, 3, 7 days) would be a great future enhancement.
2. **Multi-Modal Diagrams**: Expanding flashcards to render visual concept diagrams or Mermaid charts directly from notes.
3. **Audio Pronunciation**: Integrating the Web Speech API to provide auditory flashcard prompts for language learners.
4. **Anki Deck Export**: Adding `.apkg` file format export alongside existing JSON and Markdown exports.

---

## ⏱️ Time Spent Breakdown

| Phase | Tasks & Activities | Time Spent |
| :--- | :--- | :--- |
| **Phase 1: Planning & Schema Design** | Requirements breakdown, structured JSON schema design, and domain modeling | ~45 mins |
| **Phase 2: Scaffolding & Backend Proxy** | Vite + React 18 setup, Tailwind theme tokens, Express proxy with Gemini integration | ~1 hr 15 mins |
| **Phase 3: Defensive Validation & Core State** | Schema validator (`validateResult.ts`), API client, timeout & stale-response guards | ~1 hr 30 mins |
| **Phase 4: 3D Flashcards & Recall Tracking** | CSS 3D flip deck, mastery state management, keyboard shortcuts, shuffle & filters | ~1 hr 45 mins |
| **Phase 5: Quiz Engine & Re-Test Loop** | Self-grading quiz, option randomizer, streak counter, score card, and **Re-Test loop** | ~1 hr 15 mins |
| **Phase 6: Polish, Persistence & Refinement** | Refinement prompt bar, LocalStorage session history, Markdown/JSON export, error states | ~1 hr 00 mins |
| **Phase 7: Testing, Deployment & Docs** | Render backend & Vercel frontend deployment, responsive mobile verification, README | ~45 mins |
| **Total** | **End-to-End Implementation & Verification** | **~8 hours 15 mins** |

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
- **Environment Variables**: `VITE_API_BASE_URL` set to Render backend service URL (`https://flam-frontend-assignment-yfwt.onrender.com`)

---

## 👤 Author & Acknowledgements

- **Author**: Dharshini Manikandan
- **Assignment**: Flam Frontend Internship Assignment — *AI-Powered Interactive Tool*
- **License**: MIT License
