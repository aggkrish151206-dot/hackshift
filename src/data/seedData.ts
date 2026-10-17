import { Challenge, Submission, User } from '../types';

export const SEED_USERS: User[] = [
  {
    id: 'user_founder_1',
    name: 'Alex Chen',
    email: 'alex@hyperscale.ai',
    role: 'founder',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    company: 'HyperScale AI',
    companyRole: 'Founding Engineer & CTO',
    skills: ['Distributed Systems', 'Python', 'C++', 'LLM Infrastructure', 'Kubernetes'],
    bio: 'Building next-gen model inference acceleration. Looking for builders with proof of execution rather than credentials.',
  },
  {
    id: 'user_founder_2',
    name: 'Sarah Jenkins',
    email: 'sarah@kineticlabs.io',
    role: 'founder',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    company: 'Kinetic Labs',
    companyRole: 'Head of Engineering',
    skills: ['TypeScript', 'Go', 'Event Sourcing', 'PostgreSQL', 'High-Frequency FinTech'],
    bio: 'Building low-latency financial infrastructure for internet startups.',
  },
  {
    id: 'user_candidate_1',
    name: 'Jordan Taylor',
    email: 'jordan.taylor@builds.dev',
    role: 'candidate',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    college: 'Self-Taught / Community College Alum',
    bio: 'Obsessed with high-performance networking, TypeScript internals, and systems programming. Built 3 production open-source tools with 1,200+ GitHub stars.',
    githubUrl: 'https://github.com/jordantaylor',
    githubUsername: 'jordantaylor',
    isOnboarded: true,
    portfolioUrl: 'https://jordantaylor.dev',
    skills: ['TypeScript', 'Node.js', 'React', 'Rust', 'WebSockets', 'Tailwind CSS', 'Docker'],
  },
  {
    id: 'user_candidate_2',
    name: 'Priya Sharma',
    email: 'priya.s@engineer.io',
    role: 'candidate',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    college: 'State Polytechnic Institute',
    bio: 'AI researcher and prompt-caching specialist. Enjoys squeezing latency out of transformer pipelines.',
    githubUrl: 'https://github.com/priyasharma-ai',
    portfolioUrl: 'https://priyasharma.me',
    skills: ['Python', 'PyTorch', 'Vector Databases', 'FastAPI', 'Redis', 'LangChain'],
  },
  {
    id: 'user_candidate_3',
    name: 'Marcus Vance',
    email: 'marcus.vance@growthlab.co',
    role: 'candidate',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    college: 'Non-Traditional Career Switcher',
    bio: 'Former financial analyst turned growth engineer. Bridges data pipelines with interactive product telemetry.',
    githubUrl: 'https://github.com/marcusvance',
    portfolioUrl: 'https://marcusgrowth.dev',
    skills: ['SQL', 'Product Analytics', 'TypeScript', 'Next.js', 'Mixpanel API', 'PostHog'],
  },
  {
    id: 'user_candidate_4',
    name: 'Elena Rostova',
    email: 'elena.rostova@devs.net',
    role: 'candidate',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    college: 'Self-Taught / Bootcamp Graduate',
    bio: 'Frontend craftsman focused on design systems, micro-interactions, and accessibility.',
    githubUrl: 'https://github.com/elenarostova',
    portfolioUrl: 'https://elenarostova.design',
    skills: ['React', 'CSS Architecture', 'Figma', 'TypeScript', 'Motion', 'Vite'],
  },
];

export const SEED_CHALLENGES: Challenge[] = [
  {
    id: 'chal_ws_streamer',
    founderId: 'user_founder_2',
    startupName: 'Kinetic Labs',
    startupLogo: '⚡',
    title: 'High-Throughput Real-Time WebSocket Event Streamer',
    roleCategory: 'Full-stack Web',
    difficulty: 'Intermediate',
    deadline: '2026-10-25',
    bountyAmount: 850,
    description: `We are scaling our financial event dissemination engine. We need a lightweight client/server WebSocket multiplexer capable of streaming 20,000 synthetic market updates per second without dropping frames, with backpressure handling and heartbeat auto-reconnect.`,
    deliverables: [
      'Client-side connection manager with exponential backoff & jitter reconnection',
      'Batching & debounce buffer queue for UI frame-rate stability (60fps)',
      'Synthetic high-frequency event generator simulation code',
      'Architecture writeup explaining memory overhead & benchmark results',
    ],
    requiredSkills: ['TypeScript', 'WebSockets', 'React', 'Event Buffering', 'Performance Optimization'],
    rubric: [
      { id: 'correctness', name: 'Correctness and Task Completion', weight: 30, description: 'Reconnection logic, message sequencing, backpressure compliance.' },
      { id: 'problem_solving', name: 'Problem-solving and Reasoning', weight: 25, description: 'Mitigation of UI thread blocking under burst traffic.' },
      { id: 'usability', name: 'Quality and Usability', weight: 20, description: 'Clean API surface, observable connection states, error UX.' },
      { id: 'creativity', name: 'Creativity and Originality', weight: 15, description: 'Clever batching strategies or Web Worker offloading.' },
      { id: 'explanation', name: 'Explanation and Clarity', weight: 10, description: 'Concise, lucid breakdown of architectural trade-offs.' },
    ],
    createdAt: '2026-10-14T10:00:00.000Z',
  },
  {
    id: 'chal_prompt_cache',
    founderId: 'user_founder_1',
    startupName: 'HyperScale AI',
    startupLogo: '◈',
    title: 'LLM Prompt Cache & Semantic Token Deduplicator',
    roleCategory: 'AI Engineering',
    difficulty: 'Advanced',
    deadline: '2026-10-28',
    bountyAmount: 1200,
    description: `Foundational models bill heavily for repeated context prefixes in agentic workflows. Build an in-memory semantic token cache layer that hashes prompt prefix chunks, performs near-duplicate matching with cosine similarity thresholding, and avoids redundant model inference invocations.`,
    deliverables: [
      'Prefix chunking algorithm and LRU cache storage layer',
      'Semantic embedding distance comparator with configurable similarity threshold (e.g. 0.94)',
      'Benchmarking script comparing token consumption with and without cache',
      'Technical defense notes on cache invalidation strategy for mutable system prompts',
    ],
    requiredSkills: ['Python / TypeScript', 'Vector Search / Embeddings', 'LRU Caching', 'LLM API Integration'],
    rubric: [
      { id: 'correctness', name: 'Correctness and Task Completion', weight: 30, description: 'Accurate prefix matching and hit-rate fidelity.' },
      { id: 'problem_solving', name: 'Problem-solving and Reasoning', weight: 25, description: 'Cache invalidation trade-offs and memory boundaries.' },
      { id: 'usability', name: 'Quality and Usability', weight: 20, description: 'Developer ergonomics and drop-in proxy compatibility.' },
      { id: 'creativity', name: 'Creativity and Originality', weight: 15, description: 'Novel tiered exact-then-semantic lookup hierarchy.' },
      { id: 'explanation', name: 'Explanation and Clarity', weight: 10, description: 'Clarity of mathematical and algorithmic explanation.' },
    ],
    createdAt: '2026-10-15T09:30:00.000Z',
  },
  {
    id: 'chal_growth_funnel',
    founderId: 'user_founder_1',
    startupName: 'HyperScale AI',
    startupLogo: '◈',
    title: 'Self-Serve Onboarding Activation & Drop-off Diagnostic',
    roleCategory: 'Product Growth',
    difficulty: 'Intermediate',
    deadline: '2026-10-30',
    bountyAmount: 650,
    description: `Our developer sandbox has an 18% activation drop-off between API key generation and first successful request. Design and build a telemetry instrumentation plan, interactive diagnostic dashboard, and automated in-app troubleshooting assistant to lift developer activation.`,
    deliverables: [
      'Funnel telemetry event schema (Signup -> Org Create -> Key Gen -> First Curl)',
      'Interactive drop-off visualization with error classification breakdown',
      'Inline diagnostic widget that detects failed requests and provides instant curl fixes',
      'Growth hypothesis document detailing predicted lift and test methodology',
    ],
    requiredSkills: ['Product Analytics', 'TypeScript', 'Telemetry Instrumentation', 'UX Design', 'SQL'],
    rubric: [
      { id: 'correctness', name: 'Correctness and Task Completion', weight: 30, description: 'Comprehensive funnel stages and error code taxonomy.' },
      { id: 'problem_solving', name: 'Problem-solving and Reasoning', weight: 25, description: 'Depth of root cause identification for developer friction.' },
      { id: 'usability', name: 'Quality and Usability', weight: 20, description: 'Intuitiveness and clarity of the diagnostic dashboard.' },
      { id: 'creativity', name: 'Creativity and Originality', weight: 15, description: 'Proactive error detection and auto-copy curl fixes.' },
      { id: 'explanation', name: 'Explanation and Clarity', weight: 10, description: 'Rigor of hypotheses and experiment design.' },
    ],
    createdAt: '2026-10-16T14:15:00.000Z',
  },
];

export const SEED_SUBMISSIONS: Submission[] = [
  {
    id: 'sub_1042',
    challengeId: 'chal_ws_streamer',
    candidateId: 'user_candidate_1',
    anonymousId: 'BP-1042',
    submittedAt: '2026-10-16T18:42:00.000Z',
    status: 'Shortlisted',
    isRevealed: false,
    solutionText: `// Core Connection Multiplexer & Backpressure Ring Buffer
export class HighFrequencyStreamClient {
  private ws: WebSocket | null = null;
  private ringBuffer: MarketEvent[] = new Array(8192);
  private writePointer = 0;
  private readPointer = 0;
  private backoffAttempts = 0;
  private animFrameId: number | null = null;

  constructor(private url: string, private onFlush: (batch: MarketEvent[]) => void) {}

  public connect(): void {
    this.ws = new WebSocket(this.url);
    this.ws.binaryType = 'arraybuffer';

    this.ws.onopen = () => {
      this.backoffAttempts = 0;
      this.startRenderBatchLoop();
    };

    this.ws.onmessage = (event) => {
      // Decode binary payload using Float64/Uint32 TypedArray view
      const decoded = this.fastDecodeBinary(event.data);
      this.pushToRing(decoded);
    };

    this.ws.onclose = () => this.handleReconnect();
  }

  private pushToRing(item: MarketEvent): void {
    this.ringBuffer[this.writePointer & 8191] = item;
    this.writePointer++;
  }

  private startRenderBatchLoop(): void {
    const loop = () => {
      if (this.readPointer < this.writePointer) {
        const batch: MarketEvent[] = [];
        // Max 500 items per 16.6ms animation frame to prevent DOM jank
        const count = Math.min(500, this.writePointer - this.readPointer);
        for (let i = 0; i < count; i++) {
          batch.push(this.ringBuffer[this.readPointer & 8191]);
          this.readPointer++;
        }
        this.onFlush(batch);
      }
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private handleReconnect(): void {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    const delay = Math.min(10000, 200 * Math.pow(2, this.backoffAttempts) + (Math.random() * 150));
    this.backoffAttempts++;
    setTimeout(() => this.connect(), delay);
  }
}`,
    projectUrl: 'https://hf-stream-demo.blindproof.dev',
    repoUrl: 'https://github.com/anonymous-builder/ws-multiplexer-ring',
    approachExplanation: `Key architectural considerations:
1. Garbage Collection (GC) pressure is the #1 cause of frame-drops at 20k msgs/sec. I pre-allocated an 8,192-element ring buffer and read directly via bitwise masks (& 8191), eliminating object allocation churn.
2. Binary TypedArray decoding: Instead of parsing stringified JSON on every packet, payload uses packed binary headers saving 64% bandwidth.
3. UI Decoupling: Network intake runs continuously, while consumption syncs directly to the display refresh via requestAnimationFrame with a capped 500-event batch ceiling per tick.`,
    evaluation: {
      overall_score: 94,
      criteria_scores: [
        {
          name: 'Correctness and Task Completion',
          weight: 30,
          score: 96,
          comment: 'Complete ring buffer implementation, exponential backoff with random jitter, and binary payload decoding.',
          evidence_quote: 'ringBuffer[this.writePointer & 8191] = item with requestAnimationFrame throttling',
        },
        {
          name: 'Problem-solving and Reasoning',
          weight: 25,
          score: 95,
          comment: 'Identified garbage collection churn as the primary bottleneck and solved it via zero-allocation memory reuse.',
          evidence_quote: 'Pre-allocated 8,192-element ring buffer eliminating object allocation churn',
        },
        {
          name: 'Quality and Usability',
          weight: 20,
          score: 92,
          comment: 'Clean clean lifecycle management (cleanup on disconnect, clear event handlers, modular callback surface).',
          evidence_quote: 'cancelAnimationFrame clean teardown and configurable flush callback',
        },
        {
          name: 'Creativity and Originality',
          weight: 15,
          score: 94,
          comment: 'Using bitwise index wrapping (& 8191) and rAF batch ceiling is exceptionally production-grade for high frequency applications.',
          evidence_quote: 'this.ringBuffer[this.readPointer & 8191] bitwise power-of-two wrap',
        },
        {
          name: 'Explanation and Clarity',
          weight: 10,
          score: 92,
          comment: 'Lucid, concise explanation linking memory constraints directly to observable frame stability.',
          evidence_quote: 'Network intake runs continuously, while consumption syncs directly to display refresh',
        },
      ],
      evidence: [
        'Implemented circular ring buffer with bitwise masking to avoid array resizing.',
        'Structured exponential backoff with full jitter to avoid reconnect thundering herd.',
        'Tested with synthetic 20,000 evt/s load harness.',
        'Provided live running demonstration URL and GitHub repository.',
      ],
      strengths: [
        'Exceptional awareness of browser runtime performance constraints (GC pauses, event loop starvation).',
        'Production-quality reconnection logic that protects both client memory and backend servers.',
        'Pragmatic batch ceiling ensuring UI responsiveness never degrades below 60fps.',
      ],
      improvements: [
        'Consider delegating WebSocket binary deserialization to a Web Worker via SharedArrayBuffer to leave main thread 100% idle.',
        'Add Prometheus/OpenTelemetry metrics export for packet latency percentiles (p50, p99).',
      ],
      requirement_coverage: [
        { requirement: 'Client connection manager with backoff', status: 'met', notes: 'Exponential backoff with randomized jitter implemented.' },
        { requirement: 'Batching & debounce queue for UI stability', status: 'met', notes: 'Capped rAF ring buffer consumer loop implemented.' },
        { requirement: 'Synthetic event generator harness', status: 'met', notes: 'Provided in repository artifacts.' },
        { requirement: 'Architecture writeup & memory benchmarks', status: 'met', notes: 'Comprehensive notes on GC avoidance and bitwise math.' },
      ],
      defense_questions: [
        'If the WebSocket connection produces 40,000 events/second (2x current buffer ceiling) for 15 seconds, what is your buffer overwrite strategy?',
        'Why did you choose a fixed-size ring buffer over an unbounded linked list or Web Worker OffscreenCanvas rendering?',
        'How does your jitter formula prevent client synchronization storms across 5,000 concurrently disconnected clients?',
      ],
      confidence: 'high',
      limitations: 'Code demonstrated in browser runtime. Server load test harness evaluated through static benchmarks.',
      evaluatedAt: '2026-10-16T18:45:10.000Z',
      evaluationSource: 'Live Gemini API (gemini-3.8-flash)',
      isDemoFallback: false,
    },
    defenseResponses: [
      {
        questionIndex: 0,
        question: 'If the WebSocket connection produces 40,000 events/second for 15 seconds, what is your buffer overwrite strategy?',
        answer: 'The write pointer continues advancing, overwriting the oldest stale ticks while triggering an observable "drop" metric. In financial streaming, an up-to-date book price is significantly more valuable than playing back stale quotes from 10 seconds ago.',
        answeredAt: '2026-10-16T19:10:00.000Z',
      },
    ],
  },
  {
    id: 'sub_2187',
    challengeId: 'chal_prompt_cache',
    candidateId: 'user_candidate_2',
    anonymousId: 'BP-2187',
    submittedAt: '2026-10-15T21:15:00.000Z',
    status: 'Evaluated',
    isRevealed: false,
    solutionText: `# Two-Tier Hierarchical Prompt Cache Engine
import hashlib
from typing import Optional, Tuple
import numpy as np

class PromptSemanticCache:
    def __init__(self, exact_capacity=10000, semantic_capacity=1000, threshold=0.93):
        self.exact_cache = {}  # sha256(prefix) -> response
        self.semantic_embeddings = []  # List of (embedding_vector, response)
        self.threshold = threshold
        self.exact_capacity = exact_capacity
        self.semantic_capacity = semantic_capacity

    def hash_exact(self, text: str) -> str:
        return hashlib.sha256(text.strip().encode('utf-8')).hexdigest()

    def query(self, prefix: str, embedding: Optional[np.ndarray] = None) -> Tuple[bool, Optional[str], float]:
        # Fast Path: O(1) Exact Match
        exact_key = self.hash_exact(prefix)
        if exact_key in self.exact_cache:
            return True, self.exact_cache[exact_key], 1.0

        # Slow Path: Vector Cosine Similarity
        if embedding is not None and len(self.semantic_embeddings) > 0:
            similarities = [np.dot(embedding, v) / (np.linalg.norm(embedding) * np.linalg.norm(v)) for v, _ in self.semantic_embeddings]
            best_idx = int(np.argmax(similarities))
            if similarities[best_idx] >= self.threshold:
                return True, self.semantic_embeddings[best_idx][1], float(similarities[best_idx])

        return False, None, 0.0`,
    projectUrl: 'https://promptcache.sub2187.dev',
    repoUrl: 'https://github.com/anonymous-builder/hierarchical-prompt-cache',
    approachExplanation: `Separated the caching problem into two tiers:
1. Exact Prefix Hashing: 85% of repeated agent interactions (e.g. system instructions, tool declarations) are byte-for-byte identical. An in-memory SHA256 map provides sub-millisecond lookups with zero GPU/embedding overhead.
2. Approximate Vector Similarity: For parameterized prompts, we compute cosine distance with a strict 0.93 cutoff to avoid hallucinated semantic drift.`,
    evaluation: {
      overall_score: 88,
      criteria_scores: [
        {
          name: 'Correctness and Task Completion',
          weight: 30,
          score: 90,
          comment: 'Two-tier lookup architecture implemented accurately with fallback cosine computation.',
          evidence_quote: 'Fast Path: O(1) Exact Match followed by vector cosine similarity',
        },
        {
          name: 'Problem-solving and Reasoning',
          weight: 25,
          score: 89,
          comment: 'Very sensible trade-off prioritizing O(1) exact hash lookup before executing expensive embedding comparisons.',
          evidence_quote: '85% of repeated agent interactions are byte-for-byte identical',
        },
        {
          name: 'Quality and Usability',
          weight: 20,
          score: 86,
          comment: 'Code is clean and typed. Semantic search is linear scan; for large capacities, an HNSW index would be preferred.',
          evidence_quote: 'similarities = [np.dot(embedding, v) / ...] linear array comprehension',
        },
        {
          name: 'Creativity and Originality',
          weight: 15,
          score: 87,
          comment: 'Hierarchical fast-path approach demonstrates practical systems engineering thinking.',
          evidence_quote: 'Exact prefix hashing paired with approximate vector threshold',
        },
        {
          name: 'Explanation and Clarity',
          weight: 10,
          score: 88,
          comment: 'Thorough explanation of why vector search alone is an anti-pattern for pure exact prefixes.',
          evidence_quote: 'Zero GPU/embedding overhead for identical tool declarations',
        },
      ],
      evidence: [
        'Implemented dual-path cache with exact SHA256 and cosine similarity.',
        'Included configurable semantic thresholding to prevent cache contamination.',
        'Provided benchmark suite comparing token costs across 500 simulated agent turns.',
      ],
      strengths: [
        'Pragmatic tiered architecture avoiding unnecessary vector lookups.',
        'Clear mathematical formulation of cosine normalization.',
      ],
      improvements: [
        'Replace linear list dot-product search with an index like FAISS or USearch for scale > 5,000 vectors.',
        'Implement TTL or LRU eviction for semantic cache list to prevent memory leak.',
      ],
      requirement_coverage: [
        { requirement: 'Prefix chunking and LRU storage', status: 'met', notes: 'Implemented exact hash and vector store.' },
        { requirement: 'Semantic embedding comparator', status: 'met', notes: 'Cosine similarity with threshold.' },
        { requirement: 'Benchmarking script', status: 'met', notes: 'Included in repository.' },
        { requirement: 'Defense notes on invalidation', status: 'partial', notes: 'System prompt invalidation mentioned but lacks automated hook.' },
      ],
      defense_questions: [
        'How do you guarantee that a 0.93 cosine similarity hit does not introduce subtle semantic divergence in safety-critical agent tools?',
        'At 50,000 cached prompts, your list comprehension linear search will take ~40ms. How would you redesign the index to stay under 2ms?',
        'If a startup updates its system prompt version, how does your cache invalidate all downstream child completions without flushing unrelated entries?',
      ],
      confidence: 'high',
      limitations: 'Vector search evaluated using Python numpy mock; persistent disk serialization not tested.',
      evaluatedAt: '2026-10-15T21:20:00.000Z',
      evaluationSource: 'Live Gemini API (gemini-3.8-flash)',
      isDemoFallback: false,
    },
  },
  {
    id: 'sub_3304',
    challengeId: 'chal_growth_funnel',
    candidateId: 'user_candidate_3',
    anonymousId: 'BP-3304',
    submittedAt: '2026-10-16T12:00:00.000Z',
    status: 'Evaluated',
    isRevealed: false,
    solutionText: `// Developer Activation Diagnostic Spec & Telemetry Plan
export interface FunnelDiagnosticEvent {
  event_name: 'sandbox_signup' | 'org_created' | 'api_key_generated' | 'first_request_attempt' | 'first_request_success';
  user_id: string;
  error_code?: 'AUTH_EXPIRED' | 'MISSING_BEARER_PREFIX' | 'INVALID_MODEL_ALIAS' | 'CORS_PREFLIGHT_FAIL';
  raw_error_message?: string;
  client_sdk: 'python' | 'node' | 'curl' | 'postman';
  latency_ms: number;
  timestamp: string;
}

// In-app "Fix My Request" Auto-Detective component
export function DiagnosticBanner({ lastFailedEvent }: { lastFailedEvent: FunnelDiagnosticEvent }) {
  const fixSuggestion = getQuickFix(lastFailedEvent.error_code);
  return (
    <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-950/20 text-rose-200">
      <div className="font-semibold text-sm">We detected your last curl failed: {lastFailedEvent.error_code}</div>
      <p className="text-xs mt-1 text-slate-300">{fixSuggestion.explanation}</p>
      <pre className="mt-2 p-2 bg-slate-900 rounded font-mono text-xs overflow-x-auto text-emerald-400">
        {fixSuggestion.correctedCommand}
      </pre>
    </div>
  );
}`,
    projectUrl: 'https://activation-dashboard.dev',
    repoUrl: 'https://github.com/anonymous-builder/developer-onboarding-diagnostic',
    approachExplanation: `Root cause analysis of the 18% drop-off revealed that 64% of failures were trivial syntax errors: omitting 'Bearer ' before the raw secret, or copy-pasting an un-aliased model string from legacy docs. Instead of sending emails hours later, the app detects errors within 500ms of backend rejection and shows an interactive fix right inside the dashboard.`,
    evaluation: {
      overall_score: 83,
      criteria_scores: [
        {
          name: 'Correctness and Task Completion',
          weight: 30,
          score: 85,
          comment: 'Event schema covers full lifecycle with explicit error classification taxonomy.',
          evidence_quote: 'error_code taxonomy including AUTH_EXPIRED and MISSING_BEARER_PREFIX',
        },
        {
          name: 'Problem-solving and Reasoning',
          weight: 25,
          score: 86,
          comment: 'Pinpointed exact developer friction points (syntax errors in curl) and targeted instant UI feedback.',
          evidence_quote: 'Root cause analysis revealed 64% of failures were trivial syntax errors',
        },
        {
          name: 'Quality and Usability',
          weight: 20,
          score: 82,
          comment: 'Diagnostic banner component is practical and user-centric with copyable remediation snippets.',
          evidence_quote: 'In-app Fix My Request auto-detective banner with corrected command',
        },
        {
          name: 'Creativity and Originality',
          weight: 15,
          score: 80,
          comment: 'Inline real-time assistance rather than post-hoc email drip campaigns is highly effective.',
          evidence_quote: 'Detects errors within 500ms of backend rejection and shows interactive fix',
        },
        {
          name: 'Explanation and Clarity',
          weight: 10,
          score: 82,
          comment: 'Data-driven rationale supported by concrete user journey considerations.',
          evidence_quote: 'Omitting Bearer before secret or copy-pasting un-aliased model string',
        },
      ],
      evidence: [
        'Structured TypeScript event telemetry schema.',
        'React inline diagnostic component with auto-correct curl suggestion.',
        'Statistical breakdown of developer drop-off categories.',
      ],
      strengths: [
        'Strong product intuition focused on immediate developer feedback loops.',
        'Practical error code mapping that targets the highest-frequency failure modes.',
      ],
      improvements: [
        'Include an A/B test power calculation to estimate sample size needed to prove statistical significance of the lift.',
        'Add a webhook or CLI proxy for local terminal error interception.',
      ],
      requirement_coverage: [
        { requirement: 'Funnel telemetry event schema', status: 'met', notes: 'Complete TypeScript schema.' },
        { requirement: 'Drop-off visualization & classification', status: 'met', notes: 'Error classification taxonomy detailed.' },
        { requirement: 'Inline diagnostic auto-fix widget', status: 'met', notes: 'Working React component provided.' },
        { requirement: 'Growth hypothesis document', status: 'partial', notes: 'Stated hypothesis but lacking sample size power calculation.' },
      ],
      defense_questions: [
        'How does your telemetry avoid capturing sensitive customer payload data when logging failed curl error strings?',
        'If an enterprise customer runs in an air-gapped VPC where in-app WebSocket telemetry is blocked, how does your diagnostic fallback work?',
        'What threshold of failure rate would trigger a founder alert versus just an automated in-app tooltip?',
      ],
      confidence: 'medium',
      limitations: 'Dashboard metrics evaluated via component code; live warehouse streaming was simulated.',
      evaluatedAt: '2026-10-16T12:05:00.000Z',
      evaluationSource: 'Live Gemini API (gemini-3.8-flash)',
      isDemoFallback: false,
    },
  },
  {
    id: 'sub_4091',
    challengeId: 'chal_ws_streamer',
    candidateId: 'user_candidate_4',
    anonymousId: 'BP-4091',
    submittedAt: '2026-10-16T14:10:00.000Z',
    status: 'Evaluated',
    isRevealed: false,
    solutionText: `// Basic WebSocket Client with Array Append
export function useLiveMarketStream(url: string) {
  const [data, setData] = React.useState<any[]>([]);

  React.useEffect(() => {
    const ws = new WebSocket(url);
    ws.onmessage = (e) => {
      const parsed = JSON.parse(e.data);
      setData((prev) => [...prev, parsed]); // Simple state append
    };
    return () => ws.close();
  }, [url]);

  return data;
}`,
    projectUrl: '',
    repoUrl: 'https://github.com/anonymous-builder/basic-ws-client',
    approachExplanation: `Built a standard React hook that attaches to the WebSocket URL and sets state whenever a message comes in. It is clean and readable.`,
    evaluation: {
      overall_score: 64,
      criteria_scores: [
        {
          name: 'Correctness and Task Completion',
          weight: 30,
          score: 62,
          comment: 'Missing backpressure, reconnection logic, or batching. Will crash browser under 20k msgs/sec.',
          evidence_quote: 'setData((prev) => [...prev, parsed]) continuous state array spread',
        },
        {
          name: 'Problem-solving and Reasoning',
          weight: 25,
          score: 60,
          comment: 'Did not address the high-throughput constraints specified in the challenge brief.',
          evidence_quote: 'Simple state append without queue or memory bounds',
        },
        {
          name: 'Quality and Usability',
          weight: 20,
          score: 70,
          comment: 'Hook is clean and idiomatic React, but unsuitable for high frequency streaming.',
          evidence_quote: 'Standard useEffect cleanup function ws.close()',
        },
        {
          name: 'Creativity and Originality',
          weight: 15,
          score: 65,
          comment: 'Standard tutorial pattern without optimizations.',
          evidence_quote: 'Standard React hook that attaches to WebSocket',
        },
        {
          name: 'Explanation and Clarity',
          weight: 10,
          score: 68,
          comment: 'Brief explanation, but lacks analysis of performance trade-offs.',
          evidence_quote: 'It is clean and readable',
        },
      ],
      evidence: [
        'React hook with native WebSocket connection.',
        'Array append on every message event without throttling.',
        'No reconnect backoff algorithm implemented.',
      ],
      strengths: [
        'Clear, readable React component structure.',
        'Appropriate useEffect cleanup preventing connection leaks on unmount.',
      ],
      improvements: [
        'Must introduce message batching (e.g. throttle to 60fps) to prevent React re-render lockups.',
        'Must implement exponential reconnect backoff with jitter.',
        'Avoid JSON.parse on every single message at 20,000/sec; consider binary encoding.',
      ],
      requirement_coverage: [
        { requirement: 'Client connection manager with backoff', status: 'missed', notes: 'No reconnect or backoff implemented.' },
        { requirement: 'Batching & debounce queue for UI stability', status: 'missed', notes: 'Direct setState per message causes UI lockup.' },
        { requirement: 'Synthetic event generator harness', status: 'partial', notes: 'Basic mock loop provided.' },
        { requirement: 'Architecture writeup & memory benchmarks', status: 'missed', notes: 'No memory benchmarks provided.' },
      ],
      defense_questions: [
        'What happens to the browser tab memory and frame rate when 20,000 JSON messages arrive in a single second with this hook?',
        'How would you refactor setData to prevent triggering 20,000 re-renders per second?',
        'If the WebSocket server restarts, how does your client recover without requiring the user to manually refresh the page?',
      ],
      confidence: 'high',
      limitations: 'Static review of code demonstrates critical performance flaws under specified load.',
      evaluatedAt: '2026-10-16T14:15:00.000Z',
      evaluationSource: 'Live Gemini API (gemini-3.8-flash)',
      isDemoFallback: false,
    },
  },
  {
    id: 'sub_5520',
    challengeId: 'chal_prompt_cache',
    candidateId: 'user_candidate_1',
    anonymousId: 'BP-5520',
    submittedAt: '2026-10-17T06:30:00.000Z',
    status: 'Submitted',
    isRevealed: false,
    solutionText: `// High-Performance Rust/WASM Prompt Cache Module
// Compiles to WebAssembly for edge and browser worker execution
use std::collections::HashMap;

pub struct EdgePromptCache {
    exact_index: HashMap<u64, Vec<u8>>,
    capacity: usize,
}

impl EdgePromptCache {
    pub fn new(capacity: usize) -> Self {
        Self {
            exact_index: HashMap::with_capacity(capacity),
            capacity,
        }
    }

    pub fn lookup(&self, hash: u64) -> Option<&Vec<u8>> {
        self.exact_index.get(&hash)
    }

    pub fn insert(&mut self, hash: u64, value: Vec<u8>) {
        if self.exact_index.len() >= self.capacity {
            // FIFO fallback eviction
            if let Some(first_key) = self.exact_index.keys().next().copied() {
                self.exact_index.remove(&first_key);
            }
        }
        self.exact_index.insert(hash, value);
    }
}`,
    projectUrl: 'https://wasm-cache-test.dev',
    repoUrl: 'https://github.com/anonymous-builder/wasm-edge-cache',
    approachExplanation: `Compiled Rust to WebAssembly to achieve deterministic memory usage and sub-0.1ms cache lookups at the Cloudflare / Vercel Edge without triggering cold-start GC pauses.`,
    evaluation: {
      overall_score: 91,
      criteria_scores: [
        {
          name: 'Correctness and Task Completion',
          weight: 30,
          score: 93,
          comment: 'Wasm compilation ensures zero-overhead memory safety and predictable execution time.',
          evidence_quote: 'HashMap::with_capacity(capacity) with FIFO eviction',
        },
        {
          name: 'Problem-solving and Reasoning',
          weight: 25,
          score: 90,
          comment: 'Chose WebAssembly at edge nodes to avoid V8 isolate cold-start overhead.',
          evidence_quote: 'Compiled Rust to WebAssembly to achieve sub-0.1ms cache lookups',
        },
        {
          name: 'Quality and Usability',
          weight: 20,
          score: 91,
          comment: 'Idiomatic Rust memory management without unsafe blocks.',
          evidence_quote: 'pub struct EdgePromptCache with clean interface',
        },
        {
          name: 'Creativity and Originality',
          weight: 15,
          score: 92,
          comment: 'Cross-compilation strategy represents advanced systems architecture thinking.',
          evidence_quote: 'Edge and browser worker execution via WebAssembly',
        },
        {
          name: 'Explanation and Clarity',
          weight: 10,
          score: 89,
          comment: 'Succinct and clear technical justification.',
          evidence_quote: 'Deterministic memory usage without cold-start GC pauses',
        },
      ],
      evidence: [
        'Deterministic execution time verified under WebAssembly sandbox.',
        'Compiled size under 48KB.',
      ],
      strengths: [
        'Sub-millisecond lookup latency profile.',
        'Safe memory boundaries without JavaScript garbage collection pauses.',
      ],
      improvements: [
        'Replace FIFO eviction with LRU counter or two-queue cache algorithm for better hit ratio.',
      ],
      requirement_coverage: [
        { requirement: 'Prefix chunking algorithm & cache storage', status: 'met', notes: 'Hash index implemented.' },
        { requirement: 'Semantic embedding distance comparator', status: 'partial', notes: 'Exact match implemented, vector fallback in progress.' },
        { requirement: 'Benchmarking script', status: 'met', notes: 'Provided in test harness.' },
        { requirement: 'Cache invalidation strategy defense', status: 'met', notes: 'Documented in RFC notes.' },
      ],
      defense_questions: [
        'How do you bridge high-frequency vector embeddings across the JS-to-Wasm memory boundary without serialization overhead?',
        'What is your memory eviction policy when edge worker memory reaches 128MB?',
      ],
      confidence: 'high',
      limitations: 'Vector similarity step requires SIMD instructions enabled on target edge runtime.',
      evaluatedAt: '2026-10-17T07:15:00.000Z',
      evaluationSource: 'Live Gemini API (gemini-3.8-flash)',
      isDemoFallback: false,
    },
    defenseResponses: [
      {
        questionIndex: 0,
        question: 'How do you bridge high-frequency vector embeddings across the JS-to-Wasm memory boundary without serialization overhead?',
        answer: 'By allocating a SharedArrayBuffer once on initialization and passing raw memory offsets into Wasm memory rather than copying buffers over the bridge.',
        answeredAt: '2026-10-17T08:00:00.000Z',
      },
    ],
  },
  {
    id: 'sub_3890',
    challengeId: 'chal_ws_streamer',
    candidateId: 'user_candidate_3',
    anonymousId: 'BP-3890',
    submittedAt: '2026-10-16T22:15:00.000Z',
    status: 'Evaluated',
    isRevealed: false,
    solutionText: `// Dedicated Web Worker with SharedArrayBuffer Atomic Dissemination
// Offloads all WebSocket parsing and binary unpacking from UI main thread
export class WorkerStreamMultiplexer {
  private worker: Worker;
  private sharedBuffer: SharedArrayBuffer;
  private syncInt32: Int32Array;

  constructor(workerUrl: string) {
    this.sharedBuffer = new SharedArrayBuffer(1024 * 64); // 64KB shared atomic queue
    this.syncInt32 = new Int32Array(this.sharedBuffer);
    this.worker = new Worker(workerUrl);
    this.worker.postMessage({ type: 'INIT', buffer: this.sharedBuffer });
  }

  public subscribe(onBatch: (ticks: any[]) => void): void {
    // Polls shared buffer via Atomics.wait / rAF loop
    let lastReadIndex = 0;
    const poll = () => {
      const currentHead = Atomics.load(this.syncInt32, 0);
      if (currentHead > lastReadIndex) {
        // Read batch directly from shared memory with zero serialization overhead
        onBatch([{ tickId: currentHead, ts: Date.now() }]);
        lastReadIndex = currentHead;
      }
      requestAnimationFrame(poll);
    };
    requestAnimationFrame(poll);
  }
}`,
    projectUrl: 'https://worker-stream.blindproof.dev',
    repoUrl: 'https://github.com/anonymous-builder/worker-stream-multiplexer',
    approachExplanation: `Moved WebSocket connection and JSON/binary parsing into a dedicated Web Worker. Main thread accesses ticks via SharedArrayBuffer with Atomics synchronization, guaranteeing main thread stays at a locked 60fps even under 50,000 evt/s bursts.`,
    evaluation: {
      overall_score: 91,
      criteria_scores: [
        {
          name: 'Correctness and Task Completion',
          weight: 30,
          score: 90,
          comment: 'Complete Web Worker decoupling with SharedArrayBuffer communication.',
          evidence_quote: 'SharedArrayBuffer(1024 * 64) with Atomics synchronization',
        },
        {
          name: 'Problem-solving and Reasoning',
          weight: 25,
          score: 94,
          comment: 'Brilliant insight to isolate network I/O completely off the UI thread.',
          evidence_quote: 'Guarantees main thread stays at locked 60fps even under 50k evt/s',
        },
        {
          name: 'Quality and Usability',
          weight: 20,
          score: 88,
          comment: 'Clean API surface, though requires COOP/COEP headers for SharedArrayBuffer.',
          evidence_quote: 'this.worker.postMessage({ type: "INIT", buffer: this.sharedBuffer })',
        },
        {
          name: 'Creativity and Originality',
          weight: 15,
          score: 95,
          comment: 'One of the few submissions utilizing browser Atomics for financial streaming.',
          evidence_quote: 'Atomics.load(this.syncInt32, 0) zero serialization overhead',
        },
        {
          name: 'Explanation and Clarity',
          weight: 10,
          score: 90,
          comment: 'Very sharp architectural reasoning.',
          evidence_quote: 'Main thread accesses ticks via SharedArrayBuffer with Atomics',
        },
      ],
      evidence: [
        'Zero main-thread blocking under synthetic 50,000 evt/s load harness.',
        'Production grade Web Worker architecture.',
      ],
      strengths: [
        'Total UI frame isolation.',
        'Zero-copy memory sharing via SharedArrayBuffer.',
      ],
      improvements: [
        'Include fallback for older iOS browsers where SharedArrayBuffer is disabled.',
      ],
      requirement_coverage: [
        { requirement: 'Client connection manager with backoff', status: 'met', notes: 'Implemented in Worker.' },
        { requirement: 'Batching & debounce queue for UI stability', status: 'met', notes: 'Atomic queue implemented.' },
        { requirement: 'Synthetic event generator harness', status: 'met', notes: 'Provided in repo.' },
        { requirement: 'Architecture writeup & memory benchmarks', status: 'met', notes: 'Documented.' },
      ],
      defense_questions: [
        'What cross-origin isolation headers (COOP/COEP) are mandatory to enable SharedArrayBuffer in production?',
        'How do you handle memory wrap-around when the shared 64KB ring buffer fills up faster than the main thread can drain it?',
      ],
      confidence: 'high',
      limitations: 'Requires modern browser runtime with Cross-Origin Isolation enabled.',
      evaluatedAt: '2026-10-16T22:30:00.000Z',
      evaluationSource: 'Live Gemini API (gemini-3.8-flash)',
      isDemoFallback: false,
    },
    defenseResponses: [
      {
        questionIndex: 0,
        question: 'What cross-origin isolation headers (COOP/COEP) are mandatory to enable SharedArrayBuffer in production?',
        answer: 'CrossOrigin-Opener-Policy: same-origin and CrossOrigin-Embedder-Policy: require-corp. These are set via vercel.json or Cloudflare workers.',
        answeredAt: '2026-10-16T23:00:00.000Z',
      },
    ],
  },
];

// Helper to ensure all seed submissions have enterprise telemetry
export const ENRICHED_SEED_SUBMISSIONS: Submission[] = SEED_SUBMISSIONS.map((sub, idx) => {
  const hash = `sha256:${(idx + 1) * 3141592653589793}a8f9c${sub.anonymousId.replace('-', '')}`;
  return {
    ...sub,
    anonymityAudit: sub.anonymityAudit || {
      piiRedactedCount: 3,
      hashProof: hash.slice(0, 48),
      sanitizedTimestamp: sub.submittedAt,
      checks: [
        'Candidate name, email, and social handles stripped',
        'Prestige university / educational pedigree blinded',
        'Gender, age, and demographic markers zeroed',
        'Cryptographic hash verification passed prior to Gemini evaluation',
      ],
    },
    codeMetrics: sub.codeMetrics || {
      cyclomaticComplexity: (sub.evaluation?.overall_score || 70) >= 90 ? 'A (Low Risk)' : (sub.evaluation?.overall_score || 70) >= 75 ? 'B (Moderate)' : 'C (High Complexity)',
      linesOfCode: sub.solutionText.split('\n').length + 42,
      originalityScore: (sub.evaluation?.overall_score || 70) >= 90 ? 98 : (sub.evaluation?.overall_score || 70) >= 75 ? 89 : 68,
      testCoverage: (sub.evaluation?.overall_score || 70) >= 90 ? '94%' : '78%',
    },
    stageHistory: sub.stageHistory || [
      { stage: 'Submitted', timestamp: sub.submittedAt },
      ...(sub.evaluation ? [{ stage: 'Evaluated' as const, timestamp: sub.evaluation.evaluatedAt }] : []),
      ...(sub.status === 'Shortlisted' ? [{ stage: 'Shortlisted' as const, timestamp: new Date(new Date(sub.submittedAt).getTime() + 3600000).toISOString(), note: 'Shortlisted based on exceptional task performance' }] : []),
    ],
  };
});

