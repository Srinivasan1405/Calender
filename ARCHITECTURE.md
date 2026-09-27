# 🏗️ RoutineRise — Architecture Guide

> *A full-stack habit tracking app with 3 themes, XP gamification, and AI assistant*

---

## 🧭 Project Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ROUTINERISE ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────┐          ┌──────────────────────────────┐  │
│  │   REACT FRONTEND    │          │     EXPRESS BACKEND           │  │
│  │   (localhost:3000)  │  HTTP    │     (localhost:5000)          │  │
│  │                     │ ◄─────► │                               │  │
│  │  ┌───────────────┐  │  REST   │  ┌────────────┐ ┌─────────┐  │  │
│  │  │  Pages        │  │  JSON   │  │  Routes    │ │ Models  │  │  │
│  │  │  Components   │  │         │  │  Middleware │ │ (Mongo) │  │  │
│  │  │  Context      │  │         │  └────────────┘ └─────────┘  │  │
│  │  │  Utils        │  │         │                               │  │
│  │  └───────────────┘  │         └──────────────────────────────┘  │
│  └─────────────────────┘                                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 (Create React App) |
| **Styling** | Tailwind CSS + Custom CSS Variables |
| **Charts** | Recharts (line, bar, pie, heatmap) |
| **Backend** | Node.js + Express |
| **Database** | MongoDB (Mongoose ODM) |
| **Auth** | JWT (JSON Web Tokens) |
| **Icons** | SVG + Emoji |

---

## 📁 Folder Structure

```
📦 client/                           # React Frontend
 ┣ 📂 src/
 ┃ ┣ 📂 context/
 ┃ ┃ ┣ 📜 AuthContext.js            # Login state, user data
 ┃ ┃ ┗ 📜 ThemeContext.js            # Dark/Light/Eye-Protector toggle
 ┃ ┣ 📂 components/
 ┃ ┃ ┣ 📜 Layout.js                 # Navbar + sidebar + footer wrapper
 ┃ ┃ ┣ 📜 AIAssistant.js            # Floating FAQ chatbot
 ┃ ┃ ┣ 📜 TodayNotes.js             # Daily reflection widget
 ┃ ┃ ┗ 📜 GrammarSuggestions.js     # Real-time grammar hints
 ┃ ┣ 📂 pages/
 ┃ ┃ ┣ 📜 Login.js / Register.js    # Auth pages
 ┃ ┃ ┣ 📜 Dashboard.js              # Home — today's overview
 ┃ ┃ ┣ 📜 RoutineTracker.js         # Daily habit checklist
 ┃ ┃ ┣ 📜 FocusMode.js              # Pomodoro timer
 ┃ ┃ ┣ 📜 CalendarPlanner.js        # Monthly event calendar
 ┃ ┃ ┣ 📜 Goals.js                  # Monthly/yearly goals
 ┃ ┃ ┣ 📜 Analytics.js              # Charts & heatmap
 ┃ ┃ ┣ 📜 Insights.js               # AI suggestions & predictions
 ┃ ┃ ┗ 📜 Profile.js                # User details + feedback form
 ┃ ┣ 📂 utils/
 ┃ ┃ ┣ 📜 api.js                    # Axios client (all endpoints)
 ┃ ┃ ┣ 📜 helpers.js                # Status icons, date utils
 ┃ ┃ ┣ 📜 grammarCheck.js           # English grammar rules
 ┃ ┃ ┗ 📜 goalSuggestions.js        # Pre-built goal ideas
 ┃ ┗ 📜 index.css                   # CSS variables + utility classes
 ┣ 📜 package.json
 ┗ 📜 tailwind.config.js

📦 server/                           # Express Backend
 ┣ 📂 src/
 ┃ ┣ 📜 index.js                    # Server entry point
 ┃ ┣ 📂 middleware/
 ┃ ┃ ┗ 📜 auth.js                   # JWT verification middleware
 ┃ ┣ 📂 models/
 ┃ ┃ ┣ 📜 User.js                   # name, email, password, routine
 ┃ ┃ ┣ 📜 Task.js                   # date, timeSlot, taskName, status
 ┃ ┃ ┣ 📜 Goal.js                   # title, type, progress, deadline
 ┃ ┃ ┣ 📜 Note.js                   # date, content, mood
 ┃ ┃ ┣ 📜 Event.js                  # date, title, category, time
 ┃ ┃ ┣ 📜 FocusSession.js           # type, duration, date
 ┃ ┃ ┣ 📜 DailyStats.js             # successRate, stats cache
 ┃ ┃ ┣ 📜 UserStats.js              # XP, level, streaks, badges
 ┃ ┃ ┗ 📜 Category.js               # label, color, icon
 ┃ ┣ 📂 routes/
 ┃ ┃ ┣ 📜 auth.js                   # login / register / me
 ┃ ┃ ┣ 📜 tasks.js                  # CRUD + single + bulk + template
 ┃ ┃ ┣ 📜 notes.js                  # get / create
 ┃ ┃ ┣ 📜 goals.js                  # CRUD + bulk create
 ┃ ┃ ┣ 📜 performance.js            # daily/weekly stats + heatmap
 ┃ ┃ ┣ 📜 gamification.js           # XP, level, badges, streaks
 ┃ ┃ ┣ 📜 focus.js                  # start/end session + today
 ┃ ┃ ┣ 📜 insights.js               # suggestions + predictions
 ┃ ┃ ┣ 📜 events.js                 # CRUD + search + monthly
 ┃ ┃ ┣ 📜 categories.js             # CRUD
 ┃ ┃ ┗ 📜 export.js                 # CSV export
 ┃ ┗ 📜 seed.js                     # Demo data generator
 ┣ 📜 .env                          # MONGO_URI, JWT_SECRET
 ┗ 📜 package.json
```

---

## 🔁 Data Flow

```
USER BROWSER                    REACT APP                     EXPRESS API                    MONGODB
    │                              │                              │                             │
    │  ── Login/Register ──►       │  POST /api/auth/login        │                             │
    │                              │ ───────────────────────►     │  ── find/create user ──►    │
    │                              │                              │  ◄──── user + token ────    │
    │  ◄── JWT Token ──────────    │  ◄──── { token, user } ──   │                             │
    │                              │                              │                             │
    │  ── Load Dashboard ────►     │  GET /api/tasks/:date        │                             │
    │                              │  ───────────────────────►    │  ── find tasks ────────►    │
    │                              │  ───── GET /api/goals ──►    │  ── find goals ────────►    │
    │                              │  ───── GET /api/stats ──►    │  ── aggregate stats ───►    │
    │                              │  ◄── { tasks, goals, stats } │                             │
    │  ◄── Rendered UI ────────    │  ◄───────────────────────    │                             │
    │                              │                              │                             │
    │  ── Complete Task ─────►     │  PUT /api/tasks/:id          │                             │
    │                              │  ───────────────────────►    │  ── update + XP calc ──►    │
    │                              │  ◄── { updated task, XP } ─  │                             │
```

---

## 🎨 Theme System (3 Themes)

```
┌──────────────────────────────────────────────────────────────────┐
│                        THEME ENGINE                               │
│  localStorage.getItem('theme') → sets data-theme on <html>       │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  🌙 DARK (default)         ☀️ LIGHT          👁️ EYE PROTECTOR    │
│  ┌──────────────────┐    ┌────────────────┐  ┌────────────────┐   │
│  │ bg: #07070d      │    │ bg: #fff7ed    │  │ bg: #1a1410    │   │
│  │ card: #13132b    │    │ card: #ffffff   │  │ card: #2a231e  │   │
│  │ text: #f1f5f9    │    │ text: #1c1917   │  │ text: #e8d5c4  │   │
│  │ accent: PURPLE   │    │ accent: ORANGE  │  │ accent: TEAL   │   │
│  │ vibe: futuristic │    │ vibe: warm      │  │ vibe: natural  │   │
│  └──────────────────┘    └────────────────┘  └────────────────┘   │
│                                                                   │
│  All colors controlled via CSS variables in index.css             │
│  Tailwind classes use .text-themed-primary / .bg-themed-elevated  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📄 Page Flow (Routing)

```
                    ┌──────────────┐
                    │   /login     │  ◄── Public (unauthenticated)
                    │  /register   │
                    └──────┬───────┘
                           │  Login success
                           ▼
                    ┌──────────────┐
                    │   /dashboard │  ◄── Private (requires JWT)
                    ├──────────────┤
                    │  /routine    │  Daily habits
                    ├──────────────┤
                    │  /focus      │  Pomodoro timer
                    ├──────────────┤
                    │  /calendar   │  Event planner
                    ├──────────────┤
                    │  /goals      │  Monthly/Yearly goals
                    ├──────────────┤
                    │  /analytics  │  Charts & heatmap
                    ├──────────────┤
                    │  /insights   │  AI suggestions
                    ├──────────────┤
                    │  /profile    │  User details + feedback
                    └──────────────┘
```

---

## ✅ Task Status Cycle

```
   ┌─────────────────────────────────────────────────────┐
   │                    STATUS SYSTEM                      │
   │                                                     │
   │   ○ not_started  (gray circle)                      │
   │        │                                            │
   │        ▼                                            │
   │   ⟳ in_progress   (blue, pulse)                     │
   │        │                                            │
   │        ▼                                            │
   │   ✓ completed     (green, strikethrough) ──► +10 XP │
   │        │                                            │
   │        ▼                                            │
   │   ✕ incomplete    (red)                             │
   │        │                                            │
   │        ▼                                            │
   │   ○ not_started  (back to start)                    │
   └─────────────────────────────────────────────────────┘
```

---

## 🤖 AI Assistant (FAQ Bot)

```
┌──────────────────────────────────────────────────┐
│                 AI ASSISTANT                       │
│  Floating chat button (bottom-right)              │
├──────────────────────────────────────────────────┤
│                                                   │
│  User: "How do habits work?"                      │
│                                                   │
│  Bot: matches keyword "habit" in FAQ_RESPONSES    │
│       → returns pre-written answer                │
│                                                   │
│  Keys: habits, goals, focus, calendar,            │
│        analytics, insights, streak, xp,           │
│        theme, template, default                   │
│                                                   │
│  No LLM API — pure client-side rule matching       │
│  Supports **bold** markdown rendering              │
│  Shows improvement tips when chat is closed        │
└──────────────────────────────────────────────────┘
```

---

## 📊 Gamification System

```
┌──────────────────────────────────────────────────┐
│                 GAMIFICATION                       │
├──────────────────────────────────────────────────┤
│                                                   │
│  ✅ Complete a task        → +10 XP               │
│  🌅 Complete before noon  → +5 XP (early bird)   │
│  🎯 Complete focus session → +XP based on minutes │
│  🔥 Daily streak          → multiplies XP         │
│  🏆 Achieve level up      → unlocks badges        │
│                                                   │
│  Level progression:                               │
│    Level 1  = 0 XP           Level 5  = 500 XP    │
│    Level 2  = 100 XP         Level 10 = 2000 XP   │
│    Level 3  = 200 XP         etc.                 │
└──────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

```
┌──────────┐         ┌──────────┐         ┌─────────┐
│  USER    │         │  CLIENT  │         │  SERVER │
└────┬─────┘         └────┬─────┘         └────┬────┘
     │                    │                    │
     │  Login/Register    │  POST /api/auth    │
     │──────────────────► │ ─────────────────► │
     │                    │                    │──► Validate
     │                    │                    │──► Generate JWT
     │                    │  { token, user }   │
     │                    │ ◄───────────────── │
     │  ◄── Store token   │                    │
     │       in localStorage                   │
     │                    │                    │
     │  Navigate to page  │  GET /api/*        │
     │──────────────────► │ ─────────────────► │──► auth middleware
     │                    │                    │    verifies JWT
     │                    │  { data }          │
     │                    │ ◄───────────────── │
     │  ◄── See data      │                    │
```

---

## 🧠 Key Design Decisions

| Decision | Why |
|----------|-----|
| **CSS Variables for theming** | 3 themes without rewriting components — just swap variable values |
| **Inline task editing** | No modal popup — click to edit directly in the list (faster UX) |
| **Client-side AI Assistant** | No API costs, instant responses, works offline |
| **4-status task system** | More nuanced than binary done/not-done; supports in-progress tracking |
| **JWT in localStorage** | Simple, works for SPAs (no cookies/CSRF issues) |
| **MongoDB over SQL** | Flexible schema for routine templates, easy prototyping |

---

## 🔌 API Endpoints Quick Reference

```
POST   /api/auth/register         Create account
POST   /api/auth/login            Login
GET    /api/auth/me               Get current user

GET    /api/tasks/:date           Get tasks for date
POST   /api/tasks/single          Create one task
PUT    /api/tasks/:id             Update task
DELETE /api/tasks/:id             Delete task

GET    /api/goals                 Get all goals
POST   /api/goals                 Create goal
POST   /api/goals/bulk            Create many goals at once
PUT    /api/goals/:id             Update goal

GET    /api/performance/stats     Overall stats
GET    /api/performance/daily     Daily breakdown
GET    /api/performance/heatmap   90-day heatmap

GET    /api/gamification/stats    XP, level, badges, streaks
POST   /api/gamification/task-completed    Award XP

POST   /api/focus/start           Start pomodoro
PUT    /api/focus/:id/end         End session

GET    /api/insights/daily        Smart suggestions
GET    /api/insights/predictions  Future predictions

GET    /api/events/month/:year/:month    Get month events
POST   /api/events                Create event
```

---

## 🚀 How to Run

```bash
# Terminal 1 — Backend
cd server
cp .env.example .env        # Set MONGO_URI and JWT_SECRET
npm install
npm run dev                 # Runs on port 5000

# Terminal 2 — Frontend
cd client
npm install
npm start                   # Runs on port 3000
```

---

## 🔮 Future Possibilities

- [ ] LLM integration for real AI chat (OpenAI / Claude API)
- [ ] Push notifications for habit reminders
- [ ] Social features — follow friends, share streaks
- [ ] Progressive Web App (offline support)
- [ ] Mobile app (React Native)
- [ ] Dark/light/eye-protector auto-schedule based on time of day
