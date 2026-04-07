# Quizify: Quiz Web App

**Project:** A simple, interactive quiz game built for the web.  
**Tech Stack:** HTML, CSS, JavaScript (vanilla, no frameworks)  
**Context:** This is an agentic coding exercise — you are directing Claude Code to build features. All code is written by Claude, reviewed by you.

---

## Project Overview

Quizify is a quiz game that presents one question at a time with 4 answer buttons. Players answer within a time limit, earn points, and see a final score. The app tracks streaks and maintains a leaderboard of top 10 scores.

### Core Features (MVP)
- **Quiz Flow:** Display one question at a time with 4 answer options. Advance on click or timeout.
- **Scoring:** Track correct/incorrect answers. Display running total.
- **Timer:** 15-second countdown per question. Auto-skip on timeout.
- **Results Screen:** Show final score, accuracy %, and time taken.

### Gamification Features (Implemented)
- **Streak Bonus:** 2x points after 3 correct in a row, 3x after 5.
- **Leaderboard:** Save and display top 10 scores in localStorage.

---

## File Structure

```
homework/
├── index.html          (Main entry point, quiz UI)
├── styles.css          (All styling)
├── script.js           (All game logic)
├── data/               (Quiz data folder)
│   └── questions.json  (Array of quiz questions)
└── CLAUDE.md           (This file)
```

---

## Build & Run

```bash
# No build step required — it's vanilla HTML/CSS/JS
# Open index.html in a browser or run a local server:
python3 -m http.server 8000
# Then open http://localhost:8000
```

---

## Conventions & Patterns

### Data Structure: Questions
Quiz data is stored in `data/questions.json` as a JSON array of objects:
```json
[
  {
    "id": 1,
    "text": "What is the capital of France?",
    "options": ["London", "Berlin", "Paris", "Madrid"],
    "correct": 2,
    "difficulty": 1
  }
]
```
- `id`: Unique question identifier
- `text`: Question text
- `options`: Array of 4 answer options (strings)
- `correct`: Index of the correct answer (0-based)
- `difficulty`: Difficulty level (1 = easiest, 5 = hardest)

**Difficulty Ordering:** When the quiz starts, questions are shuffled within their difficulty level, ensuring easier questions appear earlier in the quiz.

### Game State
- Maintain a single global `game` object with: `currentQuestion`, `score`, `streak`, `answered`, `time`.
- Reset on new game.
- Save scores to localStorage under key `quizify_leaderboard`.

### Styling Approach
- Use CSS classes for states: `.correct`, `.wrong`, `.selected`, `.active`.
- Timer bar: use `width` animation with `transition: width 0.1s linear`.
- Responsive: works on mobile (max-width media query at 768px).

### No External Libraries
- No jQuery, React, Vue, or npm packages.
- Use vanilla DOM APIs: `querySelector`, `addEventListener`, `classList`.
- CSS only — no Bootstrap or Tailwind.

---

## NEVER List

- **Never add a build step** (webpack, vite, TypeScript) unless explicitly asked.
- **Never use external libraries or npm packages** — stick to vanilla HTML/CSS/JS.
- **Never hardcode player names or test data** — ask for requirements first.
- **Never add features not in the requirements** — if tempted, ask first.
- **Never commit without testing** — always verify in the browser before declaring done.
- **Never use inline styles** — all styling goes in `styles.css`.
- **Never break existing features** — when adding new features, ensure old ones still work.

---

## Development Workflow

1. **Feature Branch:** Create a branch for each feature (e.g., `feat/timer`, `feat/leaderboard`).
2. **Test in Browser:** After each feature, open the app and test manually.
3. **Code Review:** Review Claude's code for:
   - Correctness (does it work as intended?)
   - Readability (is it easy to understand?)
   - No console errors
4. **Commit:** One logical commit per feature with a clear message.
5. **Iterate:** Report bugs or desired changes back to Claude with specifics.

---

## Key Files & Their Roles

| File | Purpose |
|------|---------|
| `index.html` | DOM structure: quiz container, question display, answer buttons, timer bar, score display, leaderboard modal |
| `styles.css` | All visual styling, animations, and responsive layout |
| `script.js` | Game logic: state management, event handlers, scoring, timer, leaderboard |
| `data/questions.json` | Quiz question bank (loaded via fetch) |

---

## Feature Checklist

- [ ] Quiz flow (display > answer > advance > results)
- [ ] Scoring system (track correct, display running total)
- [ ] 15-second timer with countdown bar (auto-skip on timeout)
- [ ] Results screen (score, accuracy %, time taken)
- [ ] Streak bonus (2x after 3, 3x after 5)
- [ ] Leaderboard (top 10, saved in localStorage)
- [ ] Responsive design (mobile-friendly)
- [ ] No console errors
- [ ] Clean, readable code

---

## Notes for Claude Code

- Assume a modern browser (ES6+, fetch API, localStorage available).
- Use event delegation when many similar elements are involved.
- Keep functions small and single-purpose.
- Add comments only where logic is non-obvious.
- Test edge cases: zero questions, timeout on last question, tie scores on leaderboard.
