# 🧠 ET AI Concierge — Agentic Financial Intelligence Platform

<div align="center">

![ET AI Concierge](https://img.shields.io/badge/ET_AI_Concierge-v2.0.0-orange?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyek0xMSAxN3YtNkg5bDMtNCAzIDRoLTJ2NmgtMnoiLz48L3N2Zz4=)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql)
![Google Gemini](https://img.shields.io/badge/Gemini-AI-4285F4?style=for-the-badge&logo=google)
![LangGraph](https://img.shields.io/badge/LangGraph-Orchestration-6D28D9?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker)

**A production-grade, multi-agent AI financial concierge built for the Economic Times ecosystem.**  
Delivers hyper-personalized investment guidance, contextual cross-selling, and proactive nudges   powered by Google Gemini + LangGraph orchestration.

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [AI Agent System](#-ai-agent-system)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Contributing](#-contributing)

---

## 🔭 Overview

The **ET AI Concierge** is a full-stack, agentic AI platform that acts as a personal financial advisor embedded within the Economic Times (ET) digital ecosystem. It analyzes a user's 10-point financial profile — including income, risk appetite, investment goals, behavioral traits, and product readiness — to deliver:

- **Contextual chat** powered by a LangGraph multi-agent pipeline and Google Gemini
- **Proactive nudges** triggered by reading engagement (31-second rule) and behavioral signals
- **Personalized product recommendations** (Mutual Funds, IPOs, ET Prime, F&O courses, etc.)
- **Financial Health Score** with actionable improvement roadmaps
- **Gamification & Milestones** to drive daily engagement
- **Vernacular support** with voice input in regional languages
- **Real-time market data** for IPOs, equities, and portfolio tracking

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     React Frontend (Vite)                │
│  Landing · Dashboard · Chat · IPO · Courses · Markets   │
└───────────────────────┬─────────────────────────────────┘
                        │ REST / JSON
┌───────────────────────▼─────────────────────────────────┐
│               FastAPI Backend (Python 3.11)              │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │         LangGraph Agent Orchestration            │    │
│  │  Intent Classifier → Specialist Agents           │    │
│  │  (Portfolio · IPO · Health · Cross-sell · RAG)  │    │
│  └───────────┬─────────────────┬───────────────────┘    │
│              │                 │                         │
│  ┌───────────▼──┐  ┌───────────▼──────────────────┐    │
│  │  PostgreSQL  │  │  ChromaDB (Vector Store/RAG)  │    │
│  │   (Main DB) │  │     Financial Embeddings        │    │
│  └─────────────┘  └──────────────────────────────── ┘   │
│              │                                           │
│  ┌───────────▼──┐  ┌──────────────────┐                 │
│  │    Redis     │  │  Google Gemini   │                 │
│  │  (Sessions/  │  │  (LLM Backbone)  │                 │
│  │    Cache)    │  └──────────────────┘                 │
│  └─────────────┘                                         │
└─────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 🤖 Agentic AI Engine
- **LangGraph Orchestration** — stateful multi-agent graph with intent-based routing
- **Specialist Agents** — dedicated agents for portfolio, IPO, health score, cross-sell, and RAG
- **Contextual Cross-Sell Agent** — pitches relevant ET products based on user's financial persona
- **31-Second Engagement Trigger** — proactively surfaces the AI Concierge after sustained reading
- **Click-to-Chat Inquiry** — any article/product click opens a personalized concierge pitch

### 👤 10-Point Deep User Profiling
- Monthly income bracket, spending patterns, existing investments
- Risk appetite, financial goals, time horizon
- Behavioral archetypes (Trader/Investor/Learner/Saver)
- Product readiness scores per financial category
- Persona segmentation (Conservative Saver → Aggressive Trader)

### 📊 Financial Health Score
- Dynamic 0–100 score computed from 10 financial vectors
- Sub-scores: Savings Rate, Debt Management, Investment Diversity, Emergency Fund, Goal Alignment
- Actionable improvement plans with product tie-ins

### 🎯 Nudge Engine
- Real-time behavioral nudge API with priority queue
- Trigger types: content engagement, portfolio idle, market opportunity, goal drift
- Redis-backed polling with configurable intervals

### 💎 ET Product Cross-Sell Suite
- ET Prime subscription upsell with blurred paywall preview
- Masterclass course recommendations with video previews
- F&O readiness gating with educational nudges
- IPO GMP tracker with application guidance

### 🎮 Gamification
- Milestone celebrations with animated confetti
- XP points for daily logins, article reads, and AI interactions
- Streak tracking and leaderboard integration

### 🌐 Vernacular / Voice Input
- Voice mic component with regional language support
- Transcription via browser Web Speech API + backend fallback

### 📈 Analytics Dashboard
- Agent execution logs, intent distribution, conversion funnels
- Prometheus-ready metrics endpoint (`/metrics`)
- Optional Grafana dashboards via Docker Compose monitoring profile

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Zustand, React Router v7, Lucide Icons |
| **Styling** | Tailwind CSS v3, custom CSS animations |
| **Backend** | FastAPI, Uvicorn, Python 3.11+ |
| **AI / LLM** | Google Gemini 1.5 Flash, LangGraph, LangChain |
| **Vector DB** | ChromaDB (RAG financial knowledge base) |
| **Database** | PostgreSQL 15 (SQLAlchemy ORM + Alembic migrations) |
| **Cache** | Redis 7 (session store, nudge queue) |
| **Auth** | JWT (python-jose), bcrypt password hashing |
| **Observability** | Prometheus, Grafana (optional monitoring profile) |
| **Containerisation** | Docker, Docker Compose |
| **CI/CD** | GitHub Actions |

---

## 📁 Project Structure

```
ET1/
├── .github/
│   └── workflows/
│       ├── ci.yml              # Lint + test on every PR
│       └── cd.yml              # Deploy on merge to main
│
├── backend/
│   ├── src/
│   │   ├── main.py             # FastAPI app entry point
│   │   ├── agents/             # LangGraph multi-agent system
│   │   │   ├── agent_state.py
│   │   │   ├── base_agent.py
│   │   │   ├── graph.py        # LangGraph workflow definition
│   │   │   ├── intent_classifier.py
│   │   │   ├── specialist_agents.py
│   │   │   └── contextual_cross_sell_agent.py
│   │   ├── api/routes/         # All FastAPI routers
│   │   ├── models/             # SQLAlchemy ORM models
│   │   ├── services/           # Business logic layer
│   │   ├── orchestration/      # Agent orchestration manager
│   │   ├── analytics/          # Analytics dashboard API
│   │   ├── middleware/         # Event tracking middleware
│   │   ├── rag/                # ChromaDB retrieval pipeline
│   │   ├── tools/              # LangGraph agent tools
│   │   └── jobs/               # Background schedulers
│   ├── migrations/             # Alembic DB migrations
│   ├── scripts/                # DB setup & migration utilities
│   ├── tests/                  # Pytest test suite
│   ├── .env.example            # Required env vars template
│   ├── requirements.txt        # Python dependencies
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── pages/              # Route-level page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── MasterclassPage.jsx
│   │   │   ├── IPOPage.jsx
│   │   │   ├── MarketsPage.jsx
│   │   │   ├── NewsPage.jsx
│   │   │   ├── ETPrimePage.jsx
│   │   │   ├── FinancialServicesPage.jsx
│   │   │   └── LandingPage.jsx
│   │   ├── components/         # Reusable UI components
│   │   │   ├── chat/           # AI chat widget
│   │   │   ├── crosssell/      # BlurredPaywall, upsell cards
│   │   │   ├── gamification/   # MilestoneCelebration
│   │   │   ├── healthscore/    # FinancialHealthScore
│   │   │   ├── nudge/          # NudgeToast, engagement triggers
│   │   │   ├── onboarding/     # 10-point profiling wizard
│   │   │   └── vernacular/     # VoiceInputMic
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # Axios API client layer
│   │   ├── store/              # Zustand global state
│   │   └── utils/              # Shared utilities
│   ├── .env.example
│   ├── package.json
│   └── Dockerfile
│
├── database/
│   ├── init.sql                # Base schema (Phase 1)
│   ├── phase2_migration.sql    # Multi-agent & RAG tables
│   └── seed_products.sql       # ET product catalogue seed data
│
├── docker-compose.yml          # Full-stack compose (+ monitoring profile)
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recommended — runs everything)
- **Or** for local dev: Python 3.11+, Node.js 20+, PostgreSQL 15, Redis 7

---

### Option A — Docker Compose (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/et-ai-concierge.git
cd et-ai-concierge

# 2. Copy and fill in environment variables
cp backend/.env.example backend/.env
# Edit backend/.env — at minimum set GEMINI_API_KEY and JWT_SECRET_KEY

# 3. Launch the full stack
docker compose up --build

# 4. Open in browser
# Frontend → http://localhost:3000
# Backend API docs → http://localhost:8000/docs
# ChromaDB → http://localhost:8001
```

> To also start Prometheus + Grafana monitoring:
> ```bash
> docker compose --profile monitoring up
> ```

---

### Option B — Local Development

#### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your credentials

# Run database migrations (requires running PostgreSQL)
python scripts/setup_db.py

# Start the server
uvicorn src.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit VITE_API_BASE_URL if needed (default: http://localhost:8000)

# Start dev server
npm run dev
# → http://localhost:5173
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `REDIS_URL` | ✅ | Redis connection string |
| `JWT_SECRET_KEY` | ✅ | Secret key for JWT signing (use a long random string) |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key |
| `CORS_ORIGINS` | ✅ | Comma-separated allowed frontend origins |
| `ENVIRONMENT` | ❌ | `development` or `production` (default: `development`) |
| `LOG_LEVEL` | ❌ | Python log level (default: `INFO`) |
| `CHROMA_HOST` | ❌ | ChromaDB host (default: `localhost`) |
| `CHROMA_PORT` | ❌ | ChromaDB port (default: `8001`) |
| `USE_AGENT_ORCHESTRATION` | ❌ | Enable LangGraph agent mode (default: `false`) |
| `USE_RAG_NAVIGATION` | ❌ | Enable ChromaDB RAG (default: `false`) |
| `ENABLE_JOURNEY_SYSTEM` | ❌ | Enable user journey tracking (default: `true`) |
| `LANGFUSE_PUBLIC_KEY` | ❌ | Langfuse observability (optional) |
| `LANGFUSE_SECRET_KEY` | ❌ | Langfuse observability (optional) |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | ✅ | Backend API base URL (e.g. `http://localhost:8000`) |

---

## 📡 API Reference

Interactive API docs are available at `http://localhost:8000/docs` when the backend is running.

### Key Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Authenticate and receive JWT |
| `GET` | `/profile/me` | Get current user profile + onboarding status |
| `PUT` | `/profile/update` | Update 10-point financial profile |
| `POST` | `/chat/message` | Send a message to the rule-based concierge |
| `POST` | `/chat/agent-message` | Send a message to the LangGraph agentic pipeline |
| `GET` | `/nudges/active` | Fetch active nudges for the current user |
| `POST` | `/crosssell/recommendations` | Get personalized product recommendations |
| `GET` | `/health-score/me` | Get user's financial health score breakdown |
| `GET` | `/gamification/stats` | Get XP, streak, and milestone data |
| `GET` | `/feed/personalized` | Get user's personalized content feed |
| `GET` | `/ipo/list` | List upcoming and live IPOs |
| `GET` | `/markets/overview` | Market overview data |
| `GET` | `/analytics/dashboard` | Agent analytics dashboard data |
| `GET` | `/health` | Health check + feature flag status |

---

## 🗄 Database Schema

The database is initialized from three layered SQL files:

1. **`database/init.sql`** — Core tables: `users`, `user_profiles`, `products`, `user_events`, `chat_messages`
2. **`database/phase2_migration.sql`** — Agent tables: `agent_executions`, `user_journeys`, `rag_documents`, `nudge_queue`
3. **`database/seed_products.sql`** — Seeds ET product catalogue (Mutual Funds, IPOs, ET Prime, Courses)

---

## 🤖 AI Agent System

### LangGraph Pipeline

```
User Message
     │
     ▼
Intent Classifier (Gemini)
     │
     ├──► Portfolio Agent        (portfolio analytics, SIP advice)
     ├──► IPO Agent              (IPO GMP, subscription status)
     ├──► Financial Health Agent (health score analysis)
     ├──► Cross-Sell Agent       (product recommendations)
     └──► RAG Agent              (knowledge base Q&A)
     │
     ▼
Response + Follow-up Nudge
```

### Agent Tools

Each specialist agent has access to database-backed tools:
- `get_user_portfolio` — fetch user's investment holdings
- `get_product_readiness_score` — per-product eligibility from profile
- `get_financial_health_score` — compute live health score
- `get_active_ipos` — real-time IPO data
- `search_knowledge_base` — ChromaDB RAG retrieval
- `create_nudge` — schedule a follow-up nudge

### Enabling Agent Mode

Set in `backend/.env`:
```env
USE_AGENT_ORCHESTRATION=true
USE_RAG_NAVIGATION=true
```

---

## ⚙️ CI/CD Pipeline

### CI (`ci.yml`) — runs on every PR
- Python lint (ruff) + type check
- Backend unit tests (`pytest`)
- Frontend lint (`eslint`)

### CD (`cd.yml`) — runs on merge to `main`
- Docker image build
- Deploy to configured target environment

---

## 📦 Running Tests

```bash
# Backend tests
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
pytest tests/ -v

# Frontend lint
cd frontend
npm run lint
```

---

## 🤝 Contributing

1. **Fork** the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and write tests where applicable
4. Run tests and lint to ensure quality
5. Open a **Pull Request** describing your changes

---

## 📄 License

This project is proprietary and confidential. All rights reserved.

---

<div align="center">
Built with ❤️ for the Economic Times AI Innovation initiative
</div>
