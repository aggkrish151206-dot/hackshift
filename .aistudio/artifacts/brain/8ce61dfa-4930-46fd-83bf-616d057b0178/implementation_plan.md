# BlindProof — AI-Powered Proof-of-Work Startup Hiring Platform

BlindProof connects high-growth startups with talent through real-world micro-challenges, evaluating submissions anonymously using Gemini AI with verifiable rubrics, short defense rounds, and gated profile reveals.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and user experience decisions have been established based on your clarifications:
> - **AI Evaluation Engine**: Strictly live Gemini API analysis using `gemini-3.8-flash` on the server with structured JSON schema enforcement, real-time error propagation, and an explicitly labeled demo fallback option for network resilience.
> - **Primary Challenge Tracks**: Featured tracks prioritize Full-stack Web, AI Engineering, and Product Growth tasks with pre-seeded real-world challenge briefs and candidate submissions.
> - **Authentication & Persona Flow**: Standard authentication modal with pre-filled sample credentials for both Founder and Candidate personas, with instant state persistence and a 1-click "Reset Demo Data" control.

- **Blind Identity Anonymization**: Enforced strictly at the data layer using neutral identifiers (e.g., `BP-1042`), stripping all candidate names, colleges, links, and avatar photos from founders until explicit post-shortlisting reveal.
- **Evaluation Rubric Customization**: Founders can customize weights across Correctness (30%), Reasoning (25%), Usability (20%), Creativity (15%), and Explanation (10%).

---

## 1. Overview & Core Concept

- **What It Does**: BlindProof re-engineers startup technical hiring by replacing resume credentialism with blinded proof of work. Founders publish focused engineering and product challenges with structured rubrics and optional bounties. Candidates submit code, architectures, and explanations. Gemini AI evaluates submissions against transparent criteria, providing evidence citations, strengths, improvement areas, requirement coverage, and 3 defense questions. Founders compare candidates on an anonymous leaderboard and only unlock personal profiles after shortlisting.
- **Target Audience / Persona**:
  - *Startup Founders & Tech Leads*: Need to hire capable problem solvers quickly without sifting through bloated resumes or prestigious college filters.
  - *Students, Self-Taught Builders, & Junior-to-Senior Engineers*: Want fair opportunities to prove their abilities on real tasks without background bias.
- **Key Value**: “Prove Your Skills. Not Your Background.” Complete meritocracy backed by verifiable evidence and AI-assisted decision support.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Visitor Landing & Credibility**:
   - Clean top navigation with wordmark, core links, and role sign-in triggers.
   - Hero section featuring the core thesis, dual CTAs ("Explore Challenges" & "Post Challenge"), and live anonymous metric highlights.
   - Interactive 3-step proof-of-work workflow explanation (Challenge $\to$ Blind AI Rubric $\to$ Defense & Reveal).
   - Live sample anonymous leaderboard preview demonstrating candidate anonymization (`BP-4091`, `BP-8812`) and evidence inspectability.
   - Transparent AI disclaimer explaining decision-support guardrails.

2. **Authentication & Persona Selection**:
   - Clean credentials modal supporting sign-in, sign-up, and 1-click pre-filled demo accounts:
     - Founder: *Alex Chen (Founding Engineer, HyperScale AI)*
     - Candidate: *Jordan Taylor (Self-taught Full-Stack Builder)*
   - Dynamic role-based navigation and persistent session state.

3. **Candidate Experience**:
   - Discovery catalog with search and filters (role, track, difficulty, bounty reward).
   - Detailed challenge view with expected deliverables, evaluation rubric weights, and submission requirements.
   - Rich submission form: code/solution text editor, live project URL, repository link, and structured approach explanation.
   - Live evaluation progress indicator with direct server-side Gemini API call.
   - Candidate submission dashboard: tracking submission status (Submitted, Evaluated, Shortlisted), criterion breakdown scores, actionable feedback, and defense questions.

4. **Founder Experience**:
   - Challenge manager: view active challenges, submission counts, pending reviews, and shortlisted talent.
   - Challenge creation wizard: role title, problem statement, required deliverables, difficulty, optional bounty, and customizable rubric weights.
   - Anonymous Leaderboard: ranked candidate submissions showing anonymous IDs, composite scores, criterion bars, confidence indicators, and review statuses.
   - Deep Evaluation Drawer / Modal:
     - Criterion-by-criterion evidence quotes extracted directly from candidate work.
     - Strengths, weaknesses, and requirement coverage matrices.
     - 3 generated technical defense questions to test deep understanding.
     - Candidate's original submission viewer.
   - Shortlisting & Identity Reveal Action:
     - Shortlisting unlocks the "Reveal Profile" action with an intentional confirmation dialog.
     - Once revealed, candidate name, background, portfolio, and contact info are displayed.

### Visual Identity & Theme

- **Aesthetic Direction**: Deep tech SaaS interface inspired by high-density developer consoles and modern venture tooling.
- **Color Palette**:
  - Dominant Canvas (60%): Deep obsidian slate (`#090D16` and `#0E1322`).
  - Structural Surfaces (30%): Elevated card slate (`#141B2D`), hairline borders (`rgba(255, 255, 255, 0.08)`), and muted text (`#94A3B8`).
  - High-Intent Accents (10%): Electric indigo (`#6366F1`) and crisp cyan (`#06B6D4`) for primary CTAs, active states, and score meters.
  - Semantic Indicators: Emerald (`#10B981`) for high score/shortlisted, Amber (`#F59E0B`) for evaluation pending/medium, Rose (`#F43F5E`) for rejected/missed requirements.
- **Typography & Hierarchy**:
  - Display & Headings: `Plus Jakarta Sans` with balanced line wraps and tight tracking.
  - Body & Form Controls: `DM Sans` / `Plus Jakarta Sans` for scannable UI copy.
  - Metrics, Scores & IDs: Monospace `tabular-nums` (`font-mono`) for alignment across leaderboards.
- **Anti-Slop Discipline**:
  - Zero decorative pill badges on static metadata; clean typography with `·` separators.
  - No fake latency tickers, no pulsing green decorative dots, and no thick asymmetric left borders.
  - Single-line navigation and interactive controls (`whitespace-nowrap shrink-0`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Server-Side Gemini 3.8 Flash with JSON Schema**
  - *Chosen Approach*: Execute `@google/genai` calls strictly on the Node.js server via Express API endpoint (`/api/evaluate`) using `gemini-3.8-flash` and structured `responseSchema`.
  - *Why*: Eliminates client-side API key exposure, guarantees JSON schema compliance, and provides fast, cost-effective, high-reasoning evaluations for 24-hour hackathon operations.
  - *Alternatives Considered*: Client-side SDK (rejected due to security and key exposure risks); Gemini 4 Argon (requires paid key setup flow).

- **Decision 2: Blind Data Layer Enforcement**
  - *Chosen Approach*: The application state architecture strictly separates anonymous candidate submissions from profile identities. Founders only receive anonymous candidate tokens (`BP-XXXX`) and task work. The unmasking transformation occurs only when a candidate's status transitions to `Shortlisted` and the founder activates `Reveal Profile`.
  - *Why*: Prevents unconscious bias and client-side inspection vulnerabilities where candidate data might leak in DevTools.
  - *Alternatives Considered*: Client-only CSS masking (rejected because inspection exposes student credentials).

- **Decision 3: Local Storage Persistence with Seed Reset**
  - *Chosen Approach*: Persistent browser storage with comprehensive initial seed data (2 startups, 3 comprehensive challenges across full-stack, AI, and growth, 5 evaluated candidate submissions, 1 shortlisted candidate) paired with an explicit "Reset Demo Data" action.
  - *Why*: Enables seamless offline/online testing for hackathon judges, instant role swapping, and deterministic repeatability.
  - *Alternatives Considered*: Pure in-memory state (rejected because page refreshes erase user-created challenges and submissions).

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                              BLINDPROOF UI                             │
│                                                                        │
│  ┌───────────────────────┐  ┌───────────────────┐  ┌────────────────┐  │
│  │   Candidate Portal    │  │  Founder Console  │  │  Auth & Demo   │  │
│  │  - Challenge Catalog  │  │ - Challenge Maker │  │  - Credential  │  │
│  │  - Task Submission   │  │ - Anonymous Board │  │    Switcher    │  │
│  │  - Feedback & Defense │  │ - Evidence Drawer │  │  - Reset Seed  │  │
│  │  - Profile History    │  │ - Reveal Profile  │  │                │  │
│  └───────────┬───────────┘  └─────────┬─────────┘  └───────┬────────┘  │
│              │                        │                    │           │
│              ▼                        ▼                    ▼           │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │               BlindProof Core Store (State Engine)             │   │
│   │   - Challenges  - Submissions  - Rubrics  - Candidate Profiles │   │
│   │   - Anonymization Masking Engine  - Persistence Sync           │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
└───────────────────────────────────┼────────────────────────────────────┘
                                    │ POST /api/evaluate
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        NODE / EXPRESS BACKEND                          │
│                                                                        │
│   ┌──────────────────────┐              ┌──────────────────────────┐   │
│   │  /api/evaluate       │              │  @google/genai SDK       │   │
│   │  - Anonymize prompt  │─────────────▶│  - Model: gemini-3.8-flash│  │
│   │  - Validate rubric   │              │  - Structured JSON schema│   │
│   │  - Format payload    │◀─────────────│  - System instruction    │   │
│   └──────────────────────┘              └──────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Model Entities

- `User`: `id`, `name`, `email`, `role` (`'founder' | 'candidate'`), `avatar`, `company`, `bio`, `college`, `portfolioLinks`
- `Challenge`: `id`, `founderId`, `startupName`, `startupLogo`, `title`, `roleCategory` (`'Full-stack' | 'AI Engineering' | 'Growth'`), `difficulty` (`'Beginner' | 'Intermediate' | 'Advanced'`), `deadline`, `bountyAmount` (optional), `description`, `deliverables` (string[]), `requiredSkills` (string[]), `rubric` (CriterionWeight[])
- `Submission`: `id`, `challengeId`, `candidateId`, `anonymousId` (e.g. `BP-2041`), `submittedAt`, `solutionText`, `projectUrl`, `repoUrl`, `approachExplanation`, `status` (`'Submitted' | 'Evaluated' | 'Shortlisted' | 'Rejected'`), `isRevealed`: boolean, `evaluation`: EvaluationResult | null
- `EvaluationResult`: `overallScore` (0-100), `criteriaScores` (name, score, maxScore, comment), `evidence` (string[]), `strengths` (string[]), `improvements` (string[]), `requirementCoverage` ({ requirement: string, status: 'met' | 'partial' | 'missed' }[]), `defenseQuestions` (string[]), `confidence` ('low' | 'medium' | 'high'), `limitations` (string)
