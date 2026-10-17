import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Clock, Check, Eye, Coins, AlertCircle, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

export const ChallengeDetail: React.FC = () => {
  const {
    selectedChallengeId,
    getChallengeById,
    submissions,
    currentUser,
    submitSolution,
    evaluateSubmission,
    isEvaluating,
    evaluationError,
    navigateTo,
    creditsBalance,
    isChallengeUnlocked,
    unlockChallengeTask,
  } = useApp();

  const challenge = getChallengeById(selectedChallengeId || '');

  // Form state
  const [solutionText, setSolutionText] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [approachExplanation, setApproachExplanation] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Credit Confirmation & Unlock state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [creditNotice, setCreditNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!challenge) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
        Challenge not found.
        <button
          onClick={() => navigateTo('catalog')}
          className="ml-2 text-slate-900 underline"
        >
          Return to challenges
        </button>
      </div>
    );
  }

  const userSub = currentUser
    ? submissions.find(
        (s) => s.challengeId === challenge.id && s.candidateId === currentUser.id
      )
    : undefined;

  const handleFillSample = () => {
    if (challenge.roleCategory === 'Full-stack Web') {
      setSolutionText(`// Resilient WebSocket Client with Ring Buffer Batching
export class ResilientStreamClient {
  private socket: WebSocket | null = null;
  private queue: MarketTick[] = [];
  private isProcessing = false;

  constructor(private endpoint: string, private onBatch: (ticks: MarketTick[]) => void) {}

  public connect(): void {
    this.socket = new WebSocket(this.endpoint);
    this.socket.binaryType = 'arraybuffer';
    this.socket.onmessage = (msg) => {
      const tick = this.deserializeBinary(msg.data);
      this.queue.push(tick);
      if (!this.isProcessing) {
        this.scheduleFlush();
      }
    };
  }

  private scheduleFlush(): void {
    this.isProcessing = true;
    requestAnimationFrame(() => {
      const batch = this.queue.splice(0, 400); // bounded batch to keep main thread under 16ms
      this.onBatch(batch);
      this.isProcessing = false;
      if (this.queue.length > 0) this.scheduleFlush();
    });
  }
}`);
      setProjectUrl('https://hf-stream-demo.blindproof.dev');
      setRepoUrl('https://github.com/my-profile/resilient-stream');
      setApproachExplanation(`To prevent frame drops during 20k tick/sec spikes:
1. Messages are queued in-memory.
2. An rAF scheduler flushes bounded batches of 400 events max per 60fps frame.
3. Used binary deserialization to reduce packet payload overhead.`);
    } else if (challenge.roleCategory === 'AI Engineering') {
      setSolutionText(`// Two-Tier Prompt Cache with Exact Hash & Vector Fallback
import hashlib

class TokenPromptCache:
    def __init__(self, sim_threshold: float = 0.94):
        self.exact_map = {}
        self.sim_threshold = sim_threshold

    def get_exact_hash(self, text: str) -> str:
        return hashlib.sha256(text.strip().encode()).hexdigest()

    def query(self, prefix: str):
        key = self.get_exact_hash(prefix)
        if key in self.exact_map:
            return True, self.exact_map[key], 1.0
        return False, None, 0.0`);
      setProjectUrl('https://prompt-cache-live.dev');
      setRepoUrl('https://github.com/my-profile/token-prompt-cache');
      setApproachExplanation(`Designed a two-tier cache: O(1) exact SHA256 lookup first for system instructions, followed by cosine similarity threshold (0.94) for prompt bodies.`);
    } else {
      setSolutionText(`// Telemetry Diagnostic & In-App Auto-Remediation Component
export const DiagnosticInspector = ({ errorPayload }: { errorPayload: ApiError }) => {
  const suggestedFix = analyzeError(errorPayload.code);
  return (
    <div className="border border-slate-200 bg-slate-50 p-3 rounded">
      <div className="font-mono text-xs text-rose-700">{errorPayload.code}</div>
      <div className="text-slate-700 text-xs mt-1">{suggestedFix.tip}</div>
      <code className="text-slate-800 text-xs block mt-1">{suggestedFix.correctedCurl}</code>
    </div>
  );
};`);
      setProjectUrl('https://growth-diagnostic.dev');
      setRepoUrl('https://github.com/my-profile/diagnostic-telemetry');
      setApproachExplanation(`Replaced lagging email notifications with real-time in-app curl auto-detection. When backend receives a 401 or 400 from sandbox keys, the user gets an instant corrected command.`);
    }
  };

  const handleStartTask = async () => {
    if (isUnlocking) return;
    setIsUnlocking(true);
    setCreditNotice(null);

    try {
      const result = await unlockChallengeTask(challenge.id);
      if (result.success) {
        setCreditNotice({
          type: 'success',
          message: `${result.message} Remaining balance: ${result.balance} Credits.`,
        });
        setShowConfirmModal(false);
      } else {
        setCreditNotice({
          type: 'error',
          message: result.message || 'Insufficient credits. Purchase more credits to continue.',
        });
      }
    } catch (err: any) {
      setCreditNotice({
        type: 'error',
        message: err.message || 'Failed to unlock task.',
      });
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solutionText || solutionText.trim().length < 20) {
      setSubmitError('Please enter a detailed solution snippet or code (min 20 characters).');
      return;
    }
    if (!approachExplanation || approachExplanation.trim().length < 15) {
      setSubmitError('Please describe your approach and technical rationale.');
      return;
    }

    setSubmitError(null);
    try {
      await submitSolution(challenge.id, {
        solutionText,
        projectUrl: projectUrl || undefined,
        repoUrl: repoUrl || undefined,
        approachExplanation,
      });

      setSolutionText('');
      setProjectUrl('');
      setRepoUrl('');
      setApproachExplanation('');
    } catch (err: any) {
      setSubmitError(err.message || 'Submission failed.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigateTo('catalog')}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to all challenges
        </button>
      </div>

      {/* Header */}
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-900">{challenge.startupName}</span>
          <span>·</span>
          <span>{challenge.roleCategory}</span>
          <span>·</span>
          <span>{challenge.difficulty}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
            <Coins className="w-3 h-3 text-amber-500" />
            <span>Cost: 100 Credits</span>
          </span>
          {(isChallengeUnlocked(challenge.id) || !!userSub) && (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Unlocked</span>
            </span>
          )}
          <span>·</span>
          <span>Deadline: {challenge.deadline}</span>
          {challenge.bountyAmount && (
            <>
              <span>·</span>
              <span className="font-mono font-medium text-slate-900">${challenge.bountyAmount} proposed bounty</span>
            </>
          )}
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
          {challenge.title}
        </h1>
      </div>

      {/* Problem Statement */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
          Task Description
        </h2>
        <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line p-4 rounded-lg bg-slate-50 border border-slate-200">
          {challenge.description}
        </div>
      </section>

      {/* Deliverables */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
          Expected Deliverables
        </h2>
        <ul className="space-y-2 text-xs text-slate-700">
          {challenge.deliverables.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="font-mono text-slate-400 font-semibold">{idx + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Evaluation Rubric */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
          Evaluation Rubric
        </h2>
        <div className="border border-slate-200 rounded-lg divide-y divide-slate-200 text-xs">
          {challenge.rubric.map((r) => (
            <div key={r.id} className="p-3 flex items-center justify-between gap-4">
              <div>
                <span className="font-medium text-slate-900">{r.name}</span>
                {r.description && <div className="text-slate-500 text-[11px] mt-0.5">{r.description}</div>}
              </div>
              <div className="font-mono font-semibold text-slate-700 shrink-0">
                {r.weight}%
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Notice Banner */}
      {creditNotice && (
        <div
          className={`p-3.5 rounded-lg flex items-start gap-2.5 text-xs ${
            creditNotice.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {creditNotice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 font-medium">{creditNotice.message}</div>
          <button
            onClick={() => setCreditNotice(null)}
            className="text-slate-400 hover:text-slate-600 text-xs ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Submission Section */}
      <section className="border-t border-slate-200 pt-8 space-y-4">
        {userSub ? (
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-900">Your Submission</span>
              <span className="font-mono text-slate-700 font-bold px-1.5 py-0.5 bg-white border border-slate-200 rounded">
                {userSub.anonymousId}
              </span>
            </div>

            <div className="text-xs text-slate-600">
              Submitted on {new Date(userSub.submittedAt).toLocaleDateString()} · Status: <strong className="text-slate-900">{userSub.status}</strong>
            </div>

            {userSub.evaluation ? (
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                <span>AI Score: <strong className="font-mono font-bold text-slate-900">{userSub.evaluation.overall_score}/100</strong></span>
                <button
                  onClick={() => navigateTo('candidate-dashboard')}
                  className="px-3 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
                >
                  View Feedback & Defense
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500">Awaiting AI evaluation...</span>
                <button
                  onClick={() => evaluateSubmission(userSub.id)}
                  disabled={isEvaluating}
                  className="px-3 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors disabled:opacity-50"
                >
                  {isEvaluating ? 'Evaluating...' : 'Run Gemini Evaluation'}
                </button>
              </div>
            )}
          </div>
        ) : !isChallengeUnlocked(challenge.id) ? (
          /* Locked State - Prompt user to confirm start for 100 credits */
          <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/80 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-md bg-amber-100 text-amber-800">
                    <Coins className="w-4 h-4 text-amber-700" />
                  </span>
                  <h3 className="font-display font-bold text-base text-slate-900">
                    Task Unlocking Required
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                  Starting this challenge costs <strong className="font-mono text-slate-900">100 credits</strong>. Once unlocked, you have unlimited attempts, can refresh the page without re-deduction, and can submit your solution for blinded AI evaluation.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs shrink-0 sm:text-right">
                <div className="text-slate-500">Your Current Balance:</div>
                <div className="font-mono font-bold text-base text-slate-900 mt-0.5 flex items-center sm:justify-end gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  <span>{creditsBalance} Credits</span>
                </div>
              </div>
            </div>

            {creditsBalance < 100 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
                <div className="flex items-start gap-2.5 text-xs text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold">Insufficient credits.</strong> You have {creditsBalance} credits, but this task requires 100 credits. Purchase more credits to continue.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigateTo('credits')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors inline-flex items-center gap-1.5"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>Go to Credits Page</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs inline-flex items-center justify-center gap-2"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>Start Task (Cost: 100 Credits)</span>
                </button>
                <span className="text-[11px] text-slate-500">
                  You will confirm the 100-credit deduction before anything is charged.
                </span>
              </div>
            )}
          </div>
        ) : (
          /* Unlocked State - Workspace & Submission Form */
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg text-xs">
              <div className="flex items-center gap-2 text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-medium">
                  Challenge unlocked · You have full access to submit your work
                </span>
              </div>
              <div className="text-slate-600 font-mono text-[11px]">
                Available Balance: <strong className="text-slate-900">{creditsBalance} Credits</strong>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
                Submit Your Work
              </h2>
              <button
                type="button"
                onClick={handleFillSample}
                className="text-xs text-slate-600 hover:text-slate-900 underline"
              >
                Fill sample solution (Demo)
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Your submission will be evaluated anonymously under a neutral identifier (BP-XXXX). Personal information is hidden from founders.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {submitError && (
                <div className="p-3 rounded bg-rose-50 border border-rose-200 text-rose-700">
                  {submitError}
                </div>
              )}

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Code / Solution Implementation *
                </label>
                <textarea
                  required
                  rows={8}
                  value={solutionText}
                  onChange={(e) => setSolutionText(e.target.value)}
                  placeholder="Paste your implementation code or architecture writeup..."
                  className="w-full p-2.5 font-mono text-xs bg-white border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-600 leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Approach & Technical Decisions *
                </label>
                <textarea
                  required
                  rows={3}
                  value={approachExplanation}
                  onChange={(e) => setApproachExplanation(e.target.value)}
                  placeholder="Explain why you designed it this way, edge cases handled, and trade-offs considered..."
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Live Demo URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={projectUrl}
                    onChange={(e) => setProjectUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2 text-xs bg-white border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-600"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Repository URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full p-2 text-xs bg-white border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isEvaluating}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors disabled:opacity-50"
              >
                {isEvaluating ? 'Evaluating with Gemini 3.8 Flash...' : 'Submit & Run AI Evaluation'}
              </button>
            </form>
          </div>
        )}
      </section>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-slate-900">
              <span className="p-1.5 rounded-md bg-amber-100 text-amber-800">
                <Coins className="w-4 h-4 text-amber-700" />
              </span>
              <h3 className="font-display font-bold text-base">
                Confirm Task Unlock
              </h3>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p>
                Start this task for <strong className="font-mono text-slate-900">100 credits</strong>?
              </p>
              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between text-slate-500">
                  <span>Current Balance:</span>
                  <span>{creditsBalance} credits</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>Task Unlock Cost:</span>
                  <span>-100 credits</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1">
                  <span>Remaining Balance:</span>
                  <span>{creditsBalance - 100} credits</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                This charge is applied once. Refreshing or reopening this task will never charge you again.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isUnlocking}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartTask}
                disabled={isUnlocking}
                className="flex-1 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors disabled:opacity-50"
              >
                {isUnlocking ? 'Unlocking...' : 'Confirm & Start'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
