import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Sliders, RotateCcw, Check, Sparkles, AlertCircle } from 'lucide-react';
import { Challenge, CriterionWeight } from '../types';

interface RubricRecalibratorModalProps {
  challenge: Challenge;
  onClose: () => void;
}

export const RubricRecalibratorModal: React.FC<RubricRecalibratorModalProps> = ({ challenge, onClose }) => {
  const { recalibrateChallengeRubric, submissions } = useApp();
  const [weights, setWeights] = useState<CriterionWeight[]>(() =>
    challenge.rubric.map((r) => ({ ...r }))
  );

  const totalWeight = weights.reduce((sum, r) => sum + r.weight, 0);

  const handleWeightChange = (index: number, newWeight: number) => {
    const clamped = Math.max(0, Math.min(100, newWeight));
    setWeights((prev) => prev.map((w, i) => (i === index ? { ...w, weight: clamped } : w)));
  };

  const handleNormalize = () => {
    if (weights.length === 0) return;
    const currentSum = weights.reduce((sum, w) => sum + w.weight, 0) || 1;
    let distributedSum = 0;
    const normalized = weights.map((w, idx) => {
      if (idx === weights.length - 1) {
        return { ...w, weight: Math.max(0, 100 - distributedSum) };
      }
      const proportional = Math.round((w.weight / currentSum) * 100);
      distributedSum += proportional;
      return { ...w, weight: proportional };
    });
    setWeights(normalized);
  };

  const handleReset = () => {
    // Standard default distribution
    const defaultWeights = [30, 25, 20, 15, 10];
    setWeights((prev) =>
      prev.map((w, i) => ({ ...w, weight: defaultWeights[i % defaultWeights.length] || 20 }))
    );
  };

  const handleSave = () => {
    recalibrateChallengeRubric(challenge.id, weights);
    onClose();
  };

  // Preview of live scores with new weights
  const challengeSubs = submissions.filter((s) => s.challengeId === challenge.id && s.evaluation);

  const previewRankings = challengeSubs
    .map((sub) => {
      if (!sub.evaluation) return { id: sub.id, anonymousId: sub.anonymousId, oldScore: 0, newScore: 0, delta: 0 };
      const oldScore = sub.evaluation.overall_score;

      const calcTotalWeight = totalWeight || 100;
      let weightedSum = 0;
      sub.evaluation.criteria_scores.forEach((cs) => {
        const matching = weights.find(
          (w) => w.name.toLowerCase() === cs.name.toLowerCase() || (cs.criterion_id && w.id === cs.criterion_id)
        );
        const wVal = matching ? matching.weight : cs.weight;
        weightedSum += cs.score * wVal;
      });
      const newScore = Math.min(100, Math.max(0, Math.round(weightedSum / calcTotalWeight)));

      return {
        id: sub.id,
        anonymousId: sub.anonymousId,
        oldScore,
        newScore,
        delta: newScore - oldScore,
      };
    })
    .sort((a, b) => b.newScore - a.newScore);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-white/10 text-emerald-300 border border-white/10">
                <Sliders className="w-3 h-3" /> Rubric Calibration Engine
              </span>
            </div>
            <h2 className="font-display text-base font-bold text-white mt-1">
              Calibrate Evaluation Weights: {challenge.title}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Adjust dimension importance to re-weight candidate evaluations in real time.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sliders Body */}
        <div className="p-6 space-y-6 text-xs text-slate-700 max-h-[70vh] overflow-y-auto">
          {/* Weight Total Counter Bar */}
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium">Total Dimension Weight:</span>
              <span
                className={`font-mono text-sm font-bold px-2 py-0.5 rounded ${
                  totalWeight === 100
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {totalWeight}%
              </span>
              {totalWeight !== 100 && (
                <span className="text-amber-700 text-[11px] flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Must equal 100%
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {totalWeight !== 100 && (
                <button
                  onClick={handleNormalize}
                  className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded transition-colors"
                >
                  Auto-Normalize to 100%
                </button>
              )}
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-medium"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
          </div>

          {/* Sliders list */}
          <div className="space-y-4">
            {weights.map((w, idx) => (
              <div key={idx} className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-900 text-xs">{w.name}</span>
                    {w.description && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{w.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={w.weight}
                      onChange={(e) => handleWeightChange(idx, parseInt(e.target.value) || 0)}
                      className="w-14 px-2 py-1 text-right font-mono font-bold text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-slate-800"
                    />
                    <span className="font-mono text-slate-400 font-medium">%</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={0}
                  max={100}
                  value={w.weight}
                  onChange={(e) => handleWeightChange(idx, parseInt(e.target.value) || 0)}
                  className="w-full accent-slate-900 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
              </div>
            ))}
          </div>

          {/* Real-Time Impact Simulation on Leaderboard */}
          {previewRankings.length > 0 && (
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Real-Time Re-ranking Preview</span>
                </h4>
                <span className="text-[11px] text-slate-400">Predicted candidate rank shifts</span>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 bg-white">
                {previewRankings.map((cand, rIdx) => (
                  <div key={cand.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-400 w-4">#{rIdx + 1}</span>
                      <span className="font-mono font-semibold text-slate-900">{cand.anonymousId}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">
                        {cand.oldScore} <span className="text-slate-300">→</span>{' '}
                        <strong className="text-slate-900 font-mono">{cand.newScore}/100</strong>
                      </span>
                      {cand.delta !== 0 && (
                        <span
                          className={`font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                            cand.delta > 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {cand.delta > 0 ? `+${cand.delta}` : cand.delta}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500">
            {totalWeight === 100
              ? 'Weights balanced correctly at 100%.'
              : 'Please ensure dimension weights sum to exactly 100%.'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={totalWeight !== 100}
              className={`px-4 py-1.5 font-semibold text-white rounded transition-colors inline-flex items-center gap-1.5 ${
                totalWeight === 100
                  ? 'bg-slate-900 hover:bg-slate-800 cursor-pointer'
                  : 'bg-slate-400 cursor-not-allowed opacity-60'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply & Re-rank</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
