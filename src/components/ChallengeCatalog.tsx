import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search } from 'lucide-react';

export const ChallengeCatalog: React.FC = () => {
  const { challenges, submissions, currentUser, navigateTo } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const filteredChallenges = challenges.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.startupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTrack = selectedTrack === 'all' || c.roleCategory === selectedTrack;
    const matchesDifficulty = selectedDifficulty === 'all' || c.difficulty === selectedDifficulty;

    return matchesSearch && matchesTrack && matchesDifficulty;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Challenges</h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete practical micro-tasks to prove your competence directly to startup engineering leads.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pb-2 border-b border-slate-200">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search challenges, skills, or startups..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-600"
          />
        </div>

        {/* Simple Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
            className="px-2 py-1.5 bg-white border border-slate-300 rounded-md text-slate-700 text-xs focus:outline-none focus:border-slate-600"
          >
            <option value="all">All Tracks</option>
            <option value="Full-stack Web">Full-stack Web</option>
            <option value="AI Engineering">AI Engineering</option>
            <option value="Product Growth">Product Growth</option>
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-2 py-1.5 bg-white border border-slate-300 rounded-md text-slate-700 text-xs focus:outline-none focus:border-slate-600"
          >
            <option value="all">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Challenges List */}
      {filteredChallenges.length === 0 ? (
        <div className="p-8 text-center border border-slate-200 rounded-lg text-xs text-slate-500">
          No matching challenges found. Try clearing your search or filter criteria.
        </div>
      ) : (
        <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg bg-white overflow-hidden">
          {filteredChallenges.map((challenge) => {
            const userSub = currentUser
              ? submissions.find(
                  (s) => s.challengeId === challenge.id && s.candidateId === currentUser.id
                )
              : undefined;

            return (
              <div
                key={challenge.id}
                className="p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 max-w-2xl">
                  {/* Clean metadata line */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-800">{challenge.startupName}</span>
                    <span>·</span>
                    <span>{challenge.roleCategory}</span>
                    <span>·</span>
                    <span>{challenge.difficulty}</span>
                    {challenge.bountyAmount && (
                      <>
                        <span>·</span>
                        <span className="font-mono font-medium text-slate-900">${challenge.bountyAmount} proposed bounty</span>
                      </>
                    )}
                  </div>

                  <h3 className="font-display text-base font-bold text-slate-900">
                    {challenge.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {challenge.description}
                  </p>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {challenge.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[11px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                  <div className="text-[11px] text-slate-500">
                    Deadline: {challenge.deadline}
                  </div>

                  <button
                    onClick={() => navigateTo('challenge-detail', challenge.id)}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
                  >
                    {userSub ? 'View Submission' : 'View Task'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
