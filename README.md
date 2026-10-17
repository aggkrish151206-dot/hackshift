# BlindProof ⚡
### AI Proof-of-Work Startup Hiring Platform
**HackShift 2026 — IIIT Delhi (Entrepreneurship Cell)**  
**Theme:** *Entrepreneurship & Employment: Connecting Talent, Ideas, and Opportunities*

Prove your skills, not your background. BlindProof is an AI-evaluated blind hiring platform connecting startups with talent through practical engineering challenges, verifiable evidence citations, and technical defense questioning.

---

## 💡 Core Features
- **Blind Candidate Evaluation**: Cryptographic anonymous IDs (`BP-8821`) ensure zero demographic, gender, or college pedigree bias.
- **Evidence-Based Technical Scoring**: Ingests candidate implementation code, architectural design decisions, and repository artifacts.
- **Live Gemini 3.8 Flash Integration**: High-speed rubric scoring and generation of 3 probing interview defense questions.
- **Stage-Resilient Offline Fallback**: Deterministic evaluation simulation guaranteeing 100% uptime during live pitches.

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Configure .env
GEMINI_API_KEY="your_api_key_here"
APP_URL="http://localhost:3000"
PORT=3000

# 3. Start full-stack dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
