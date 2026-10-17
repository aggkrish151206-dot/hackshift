import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChallengeDifficulty, ChallengeTrack, CriterionWeight } from '../types';
import { X, Plus, Trash2 } from 'lucide-react';

interface CreateChallengeModalProps {
  onClose: () => void;
}

export const CreateChallengeModal: React.FC<CreateChallengeModalProps> = ({ onClose }) => {
  const { createChallenge, navigateTo } = useApp();

  const [title, setTitle] = useState('');
  const [roleCategory, setRoleCategory] = useState<ChallengeTrack>('Full-stack Web');
  const [difficulty, setDifficulty] = useState<ChallengeDifficulty>('Intermediate');
  const [deadline, setDeadline] = useState('2026-10-31');
  const [bountyAmount, setBountyAmount] = useState<number | undefined>(750);
  const [description, setDescription] = useState('');
  const [deliverables, setDeliverables] = useState<string[]>([
    'Modular core implementation code',
    'Edge test case harness',
    'Architecture & trade-off rationale writeup',
  ]);
  const [newDeliverable, setNewDeliverable] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('TypeScript, React, Node.js');
  const [error, setError] = useState<string | null>(null);

  const [rubric, setRubric] = useState<CriterionWeight[]>([
    { id: 'correctness', name: 'Correctness and Task Completion', weight: 30 },
    { id: 'problem_solving', name: 'Problem-solving and Reasoning', weight: 25 },
    { id: 'usability', name: 'Quality and Usability', weight: 20 },
    { id: 'creativity', name: 'Creativity and Originality', weight: 15 },
    { id: 'explanation', name: 'Explanation and Clarity', weight: 10 },
  ]);

  const totalWeight = rubric.reduce((acc, r) => acc + r.weight, 0);

  const handleAddDeliverable = () => {
    if (!newDeliverable.trim()) return;
    setDeliverables([...deliverables, newDeliverable.trim()]);
    setNewDeliverable('');
  };

  const handleRemoveDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const handleWeightChange = (id: string, newWeight: number) => {
    setRubric(rubric.map((r) => (r.id === id ? { ...r, weight: Math.max(0, Math.min(100, newWeight)) } : r)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Challenge title is required.');
      return;
    }
    if (!description.trim() || description.length < 30) {
      setError('Please provide a descriptive task specification (minimum 30 characters).');
      return;
    }
    if (deliverables.length === 0) {
      setError('Please specify at least one expected deliverable.');
      return;
    }
    if (totalWeight !== 100) {
      setError(`Rubric weights must sum to exactly 100% (currently ${totalWeight}%).`);
      return;
    }

    const skills = requiredSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const created = createChallenge({
      title,
      roleCategory,
      difficulty,
      deadline,
      bountyAmount: bountyAmount && bountyAmount > 0 ? Number(bountyAmount) : undefined,
      description,
      deliverables,
      requiredSkills: skills.length > 0 ? skills : ['TypeScript'],
      rubric,
      startupName: 'HyperScale AI',
      startupLogo: '◈',
    });

    onClose();
    navigateTo('founder-dashboard', created.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white border border-slate-300 rounded-lg p-6 shadow-xl text-slate-900 my-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Post a Challenge
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Define the task, deliverables, and rubric for anonymous evaluation.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-800 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Challenge Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Build an In-Memory LRU Cache with TTL"
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Track</label>
              <select
                value={roleCategory}
                onChange={(e) => setRoleCategory(e.target.value as ChallengeTrack)}
                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-slate-900 text-xs focus:outline-none focus:border-slate-600"
              >
                <option value="Full-stack Web">Full-stack Web</option>
                <option value="AI Engineering">AI Engineering</option>
                <option value="Product Growth">Product Growth</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as ChallengeDifficulty)}
                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-slate-900 text-xs focus:outline-none focus:border-slate-600"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Proposed Bounty ($)</label>
              <input
                type="number"
                min="0"
                step="50"
                value={bountyAmount || ''}
                onChange={(e) => setBountyAmount(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="750"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Task Specification *</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what the candidate needs to build and constraints..."
              className="w-full p-2.5 bg-white border border-slate-300 rounded text-slate-900 text-xs focus:outline-none focus:border-slate-600"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Expected Deliverables *</label>
            <div className="space-y-1.5 mb-2">
              {deliverables.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-1.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-800 truncate">{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDeliverable(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newDeliverable}
                onChange={(e) => setNewDeliverable(e.target.value)}
                placeholder="Add another deliverable item..."
                className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-600"
              />
              <button
                type="button"
                onClick={handleAddDeliverable}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-medium"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Required Skills (comma separated)</label>
            <input
              type="text"
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              placeholder="TypeScript, React, Docker"
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-900 text-xs focus:outline-none focus:border-slate-600"
            />
          </div>

          {/* Rubric Weights */}
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-900">Rubric Weights</span>
              <span className={`font-mono font-bold ${totalWeight === 100 ? 'text-emerald-700' : 'text-rose-700'}`}>
                Total: {totalWeight}%
              </span>
            </div>

            <div className="space-y-1.5">
              {rubric.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 p-1.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-700 truncate">{r.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="range"
                      min="5"
                      max="60"
                      step="5"
                      value={r.weight}
                      onChange={(e) => handleWeightChange(r.id, Number(e.target.value))}
                      className="w-20 cursor-pointer"
                    />
                    <span className="font-mono text-xs w-8 text-right font-medium">{r.weight}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
            >
              Publish Challenge
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
