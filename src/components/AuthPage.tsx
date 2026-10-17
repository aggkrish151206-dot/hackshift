import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { Eye, EyeOff, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Key, Info, HelpCircle } from 'lucide-react';

const GitHubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

export const AuthPage: React.FC = () => {
  const { login, signUp, resetPassword, demoLogin, loginWithGitHub, selectedRole, selectRole, navigateTo } = useApp();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>(selectedRole || 'candidate');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [githubConfigured, setGithubConfigured] = useState<boolean | null>(null);
  const [showJudgeDemo, setShowJudgeDemo] = useState(false);

  useEffect(() => {
    if (selectedRole) {
      setRole(selectedRole);
    }
  }, [selectedRole]);

  // Check if GitHub OAuth is configured on server
  useEffect(() => {
    let isMounted = true;
    fetch('/api/auth/github/url')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setGithubConfigured(Boolean(data.configured));
        }
      })
      .catch(() => {
        if (isMounted) setGithubConfigured(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for OAuth postMessage from popup window (AI Studio preview iframe friendly)
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }

      if (event.data?.type === 'GITHUB_OAUTH_SUCCESS') {
        setLoading(true);
        setError(null);
        const res = await loginWithGitHub(event.data.payload);
        setLoading(false);
        if (!res.success) {
          setError(res.error || 'Failed to authenticate via GitHub.');
        }
      } else if (event.data?.type === 'GITHUB_OAUTH_ERROR') {
        setError(event.data.error || 'GitHub authorization was cancelled or failed.');
        setLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [loginWithGitHub]);

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  // GitHub OAuth Login Trigger
  const handleContinueWithGitHub = async () => {
    setError(null);
    setSuccessNotice(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/github/url');
      const data = await res.json();

      if (!data.configured || !data.url) {
        setLoading(false);
        setShowSetupModal(true);
        return;
      }

      // Open OAuth provider URL directly in popup (required for AI Studio iframe environment)
      const width = 600;
      const height = 700;
      const left = Math.max(0, (window.innerWidth - width) / 2 + window.screenX);
      const top = Math.max(0, (window.innerHeight - height) / 2 + window.screenY);

      const authWindow = window.open(
        data.url,
        'github_oauth_popup',
        `width=${width},height=${height},top=${top},left=${left},status=no,resizable=yes`
      );

      if (!authWindow) {
        setLoading(false);
        setError('Popup was blocked by your browser. Please allow popups for this site to sign in with GitHub.');
      }
    } catch (err: any) {
      setLoading(false);
      setError('Unable to reach authentication server. Please check your network connection.');
    }
  };

  // Hackathon demo / fallback simulator for instant applicant access
  const handleSimulateGitHubLogin = async (isNew: boolean) => {
    setLoading(true);
    setError(null);
    setShowJudgeDemo(false);
    setShowSetupModal(false);

    if (isNew) {
      const candidateSuffix = '151206';
      await loginWithGitHub({
        githubId: `demo_${Date.now()}`,
        username: `applicant_${candidateSuffix}`,
        name: `Candidate ${candidateSuffix}`,
        email: `candidate.${candidateSuffix}@example.com`,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        bio: 'Full-stack software developer with passion for building clean systems.',
        githubUrl: `https://github.com/applicant_${candidateSuffix}`,
      });
    } else {
      await loginWithGitHub({
        githubId: '9841203',
        username: 'jordantaylor',
        name: 'Jordan Taylor',
        email: 'jordan.taylor@builds.dev',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        bio: 'Obsessed with high-performance networking, TypeScript internals, and systems programming.',
        githubUrl: 'https://github.com/jordantaylor',
      });
    }
    setLoading(false);
  };

  // Founder Login Handlers
  const handleFounderLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Invalid email or password.');
    }
  };

  const handleFounderSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await signUp(fullName.trim(), email.trim(), password, 'founder');
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Failed to create founder account.');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const res = await resetPassword(email.trim());
    setLoading(false);

    if (res.success) {
      setSuccessNotice('A password reset link has been dispatched to your email address.');
    } else {
      setError(res.error || 'Account not found with this email.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-6">
        {/* App Title & Tagline */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-slate-900 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
              BlindProof
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Prove Your Skills. Not Your Background.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white py-8 px-6 sm:px-8 border border-slate-200 rounded-lg shadow-xs space-y-6">
          {/* Top Bar: Back to role selection & Role indicator */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <button
              onClick={() => navigateTo('welcome')}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to role selection</span>
            </button>

            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {role === 'founder' ? 'Company Recruiter Mode' : 'Applicant Mode'}
            </span>
          </div>

          {/* Alerts */}
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {successNotice && (
            <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* APPLICANT AUTHENTICATION VIEW (GitHub OAuth Only)          */}
          {/* ========================================================= */}
          {role === 'candidate' && (
            <div className="space-y-6 py-2">
              <div className="text-center space-y-1">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Welcome to BlindProof
                </h2>
                <p className="text-xs text-slate-500">
                  Prove Your Skills. Not Your Background.
                </p>
              </div>

              {/* Status Notice if OAuth is not yet configured in environment */}
              {githubConfigured === false && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-amber-950">GitHub OAuth credentials pending</p>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      To connect real GitHub accounts, add your OAuth app credentials to your environment. For hackathon testing, click below to test the full applicant workflow immediately.
                    </p>
                    <div className="pt-1 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowSetupModal(true)}
                        className="text-[11px] font-semibold text-amber-900 underline hover:text-black"
                      >
                        View Setup Instructions
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSimulateGitHubLogin(true)}
                        className="text-[11px] font-semibold text-amber-900 underline hover:text-black"
                      >
                        Simulate GitHub Login
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Continue with GitHub Button */}
              <div className="space-y-4">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleContinueWithGitHub}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors flex items-center justify-center gap-2.5 disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <GitHubIcon className="w-4 h-4" />
                      <span>Continue with GitHub</span>
                    </>
                  )}
                </button>

                {/* Subtext required by specification */}
                <div className="text-center space-y-2 text-xs text-slate-500 pt-1">
                  <div>
                    Don't have a GitHub account?{' '}
                    <a
                      href="https://github.com/signup"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-slate-900 hover:underline inline-flex items-center gap-0.5"
                    >
                      Create one on GitHub.
                    </a>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    By continuing, you agree to our Terms and Privacy Policy.
                  </p>
                </div>
              </div>

              {/* Switch to Founder link */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Looking to hire talent?</span>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessNotice(null);
                    selectRole('founder');
                    setRole('founder');
                  }}
                  className="font-semibold text-slate-900 hover:underline"
                >
                  Company Recruiter sign in
                </button>
              </div>

              {/* Discreet Hackathon Judge Demo Access (Isolated per spec) */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setShowJudgeDemo(true)}
                  className="text-[11px] text-slate-400 hover:text-slate-600 underline transition-colors"
                >
                  Hackathon Judge & Demo Access
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* FOUNDER AUTHENTICATION VIEWS (Preserved in full)          */}
          {/* ========================================================= */}
          {role === 'founder' && mode === 'login' && (
            <form onSubmit={handleFounderLoginSubmit} className="space-y-4 text-xs">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Company Recruiter Sign In
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Enter your credentials to manage hiring challenges and submissions.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@hyperscale.ai"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-700"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-medium">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setSuccessNotice(null);
                      setMode('forgot');
                    }}
                    className="text-[11px] text-slate-500 hover:text-slate-900 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3 pr-9 py-2 text-xs bg-white border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In as Company Recruiter'}
              </button>

              <div className="pt-2 text-center text-xs text-slate-500">
                Don't have a recruiter account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessNotice(null);
                    setMode('signup');
                  }}
                  className="font-semibold text-slate-900 hover:underline"
                >
                  Sign up
                </button>
              </div>

              {/* Switch to Applicant */}
              <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
                Looking to solve challenges?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessNotice(null);
                    selectRole('candidate');
                    setRole('candidate');
                  }}
                  className="font-semibold text-slate-900 hover:underline"
                >
                  Applicant sign in
                </button>
              </div>

              {/* Founder 1-click Demo profile */}
              <div className="pt-3 border-t border-slate-100">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Company Recruiter 1-Click Demo
                </div>
                <button
                  type="button"
                  onClick={() => demoLogin('alex@hyperscale.ai', 'founder')}
                  className="w-full p-2.5 text-left rounded border border-slate-200 hover:border-slate-400 bg-slate-50 transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-slate-900 text-xs">Alex Chen</div>
                    <div className="text-[10px] text-slate-500">Founder & CTO · HyperScale AI</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </form>
          )}

          {/* Founder Sign Up Mode */}
          {role === 'founder' && mode === 'signup' && (
            <form onSubmit={handleFounderSignUpSubmit} className="space-y-4 text-xs">
              <div>
                <h2 className="text-base font-bold text-slate-900">Create Company Recruiter Account</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Sign up to post micro-challenges and discover verified talent.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Chen"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Work Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@startup.io"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Password (min 6 characters)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3 pr-9 py-2 text-xs bg-white border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3 pr-9 py-2 text-xs bg-white border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Company Recruiter Account'}
              </button>

              <div className="pt-2 text-center text-xs text-slate-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessNotice(null);
                    setMode('login');
                  }}
                  className="font-semibold text-slate-900 hover:underline"
                >
                  Log in
                </button>
              </div>
            </form>
          )}

          {/* Founder Forgot Password Mode */}
          {role === 'founder' && mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4 text-xs">
              <div>
                <h2 className="text-base font-bold text-slate-900">Reset Password</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Enter your email address to receive password reset instructions.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@hyperscale.ai"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-700"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
              </button>

              <div className="pt-2 text-center text-xs text-slate-500">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessNotice(null);
                    setMode('login');
                  }}
                  className="font-semibold text-slate-900 hover:underline"
                >
                  Back to recruiter sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* JUDGE DEMO FAST-TRACK MODAL (For 24h Hackathon Testing)    */}
      {/* ========================================================= */}
      {showJudgeDemo && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-900" />
                  <span>Hackathon Judge Demo Access</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Simulate GitHub OAuth authentication without needing credentials.
                </p>
              </div>
              <button
                onClick={() => setShowJudgeDemo(false)}
                className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <button
                type="button"
                onClick={() => handleSimulateGitHubLogin(true)}
                className="w-full p-3 text-left rounded border border-slate-200 hover:border-slate-800 bg-slate-50 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-900">New Applicant Profile</div>
                  <div className="text-[11px] text-slate-500">
                    Test the complete new applicant flow & onboarding screen
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => handleSimulateGitHubLogin(false)}
                className="w-full p-3 text-left rounded border border-slate-200 hover:border-slate-800 bg-slate-50 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-900">Existing Applicant (Jordan Taylor)</div>
                  <div className="text-[11px] text-slate-500">
                    Bypass onboarding and view submitted challenges & defense round
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowJudgeDemo(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* GITHUB OAUTH SETUP INSTRUCTIONS MODAL                      */}
      {/* ========================================================= */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <GitHubIcon className="w-4 h-4" />
                  <span>GitHub OAuth Setup Guide</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Required callback URLs to register in your GitHub Developer settings.
                </p>
              </div>
              <button
                onClick={() => setShowSetupModal(false)}
                className="text-slate-400 hover:text-slate-600 px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2">
              <p className="font-semibold text-slate-800">1. Create an OAuth App on GitHub:</p>
              <p className="text-slate-600">
                Go to <a href="https://github.com/settings/developers" target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium">github.com/settings/developers</a> &gt; <strong>OAuth Apps</strong> &gt; <strong>New OAuth App</strong>.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-semibold text-slate-800">2. Register Callback URLs:</p>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="p-2 bg-slate-100 border border-slate-200 rounded select-all break-all text-slate-800">
                  <div className="text-[10px] text-slate-500 font-sans mb-0.5">Development Callback URL:</div>
                  https://ais-dev-wfq7kismscnpuhcfyhifkc-290500969481.asia-east1.run.app/auth/github/callback
                </div>
                <div className="p-2 bg-slate-100 border border-slate-200 rounded select-all break-all text-slate-800">
                  <div className="text-[10px] text-slate-500 font-sans mb-0.5">Shared / Deployed Callback URL:</div>
                  https://ais-pre-wfq7kismscnpuhcfyhifkc-290500969481.asia-east1.run.app/auth/github/callback
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
              <p className="font-semibold text-slate-800">3. Set Environment Variables in AI Studio:</p>
              <div className="font-mono text-[11px] text-slate-700 space-y-0.5">
                <div>GITHUB_CLIENT_ID=&quot;your_client_id&quot;</div>
                <div>GITHUB_CLIENT_SECRET=&quot;your_client_secret&quot;</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleSimulateGitHubLogin(true)}
                className="text-xs font-semibold text-slate-900 hover:underline"
              >
                Or test flow with simulated GitHub account →
              </button>
              <button
                type="button"
                onClick={() => setShowSetupModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
