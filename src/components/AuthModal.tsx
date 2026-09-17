import React, { useState } from 'react';
import { X, User, Lock, LogIn, UserPlus, ShieldCheck, KeyRound, Sparkles } from 'lucide-react';
import { UserAccount } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  initialMode?: 'login' | 'register';
}

const DEFAULT_USERS: UserAccount[] = [
  {
    username: 'ApexRacer',
    password: 'password123',
    badge: 'Pro',
    bio: 'Formula and GT3 time trial specialist.',
    createdAt: '2026-01-15',
  },
  {
    username: 'VerstappenSim',
    password: 'password123',
    badge: 'Esports',
    bio: 'Virtual endurance and qualifying engineer.',
    createdAt: '2026-02-01',
  },
  {
    username: 'TrackMaster99',
    password: 'password123',
    badge: 'Community',
    bio: 'Passionate sim racer sharing custom balanced setups.',
    createdAt: '2026-03-10',
  },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [badge, setBadge] = useState<'Community' | 'Pro' | 'Esports' | 'Verified'>('Community');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Retrieve stored accounts from localStorage
  const getStoredUsers = (): UserAccount[] => {
    try {
      const stored = localStorage.getItem('sim_marketplace_users');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Merge defaults with custom users
          const combined = [...DEFAULT_USERS];
          for (const u of parsed) {
            if (!combined.some((c) => c.username.toLowerCase() === u.username.toLowerCase())) {
              combined.push(u);
            }
          }
          return combined;
        }
      }
    } catch (e) {
      console.warn('Error reading stored users:', e);
    }
    return DEFAULT_USERS;
  };

  const handleQuickDemo = (demoUser: UserAccount) => {
    setUsername(demoUser.username);
    setPassword(demoUser.password || 'password123');
    setErrorMessage(null);
    onLoginSuccess(demoUser);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsername = username.trim().replace(/^@/, '');
    if (!cleanUsername) {
      setErrorMessage('Please enter a username.');
      return;
    }

    if (!password || password.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }

    const currentUsers = getStoredUsers();

    if (mode === 'login') {
      const found = currentUsers.find(
        (u) => u.username.toLowerCase() === cleanUsername.toLowerCase()
      );

      if (!found) {
        setErrorMessage('Username not found. Check your spelling or create an account.');
        return;
      }

      if (found.password && found.password !== password) {
        setErrorMessage('Incorrect password. Please try again.');
        return;
      }

      onLoginSuccess(found);
      onClose();
    } else {
      // Register Mode
      const exists = currentUsers.some(
        (u) => u.username.toLowerCase() === cleanUsername.toLowerCase()
      );

      if (exists) {
        setErrorMessage('This username is already taken. Please choose another.');
        return;
      }

      const newUser: UserAccount = {
        username: cleanUsername,
        password: password,
        badge: badge,
        createdAt: new Date().toISOString().split('T')[0],
      };

      try {
        const stored = localStorage.getItem('sim_marketplace_users');
        const list: UserAccount[] = stored ? JSON.parse(stored) : [];
        list.push(newUser);
        localStorage.setItem('sim_marketplace_users', JSON.stringify(list));
      } catch (err) {
        console.warn('Could not persist new user:', err);
      }

      onLoginSuccess(newUser);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-slate-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {mode === 'login' ? 'Sign In to Marketplace' : 'Create an Account'}
              </h3>
              <p className="text-xs text-slate-400">
                {mode === 'login'
                  ? 'Access your setups, submit new tunes, and rate others.'
                  : 'Join the sim racing setup community in seconds.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="auth-modal-close-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
          <button
            type="button"
            id="auth-mode-login-tab"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            id="auth-mode-register-tab"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register</span>
          </button>
        </div>

        {/* Validation Error Notice */}
        {errorMessage && (
          <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="auth-username-input"
                type="text"
                placeholder="e.g. ApexRacer"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="auth-password-input"
                type="password"
                placeholder="Enter password (minimum 4 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-slate-300 font-medium mb-1">Driver Profile Badge</label>
              <div className="grid grid-cols-2 gap-2">
                {(['Community', 'Pro', 'Esports', 'Verified'] as const).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBadge(b)}
                    className={`py-1.5 px-2.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
                      badge === b
                        ? 'border-sky-500 bg-sky-950/40 text-white font-semibold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{b}</span>
                    {badge === b && <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            id="auth-submit-btn"
            className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all shadow-md shadow-sky-600/30 flex items-center justify-center gap-2 mt-2"
          >
            {mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Logins */}
        <div className="pt-3 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Quick Demo Accounts (Instant Test):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {DEFAULT_USERS.slice(0, 2).map((user) => (
              <button
                key={user.username}
                type="button"
                id={`quick-login-${user.username.toLowerCase()}-btn`}
                onClick={() => handleQuickDemo(user)}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800/90 border border-slate-800 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-sky-300">@{user.username}</div>
                  <div className="text-[10px] text-slate-400">{user.badge} Driver</div>
                </div>
                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
