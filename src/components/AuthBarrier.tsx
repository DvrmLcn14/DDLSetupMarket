import React, { useState } from 'react';
import { Lock, LogIn, UserPlus, ShieldCheck, KeyRound, Sparkles, Flag, Gauge, Star } from 'lucide-react';
import { UserAccount } from '../types';

interface AuthBarrierProps {
  onLoginSuccess: (user: UserAccount) => void;
  initialMode?: 'login' | 'register';
  activeGameName: string;
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
    bio: 'Virtual qualifying and race engineer.',
    createdAt: '2026-02-01',
  },
  {
    username: 'TrackMaster99',
    password: 'password123',
    badge: 'Community',
    bio: 'Passionate sim racer sharing high downforce setups.',
    createdAt: '2026-03-10',
  },
];

export const AuthBarrier: React.FC<AuthBarrierProps> = ({
  onLoginSuccess,
  initialMode = 'login',
  activeGameName,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [badge, setBadge] = useState<'Community' | 'Pro' | 'Esports' | 'Verified'>('Community');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Retrieve stored accounts from localStorage
  const getStoredUsers = (): UserAccount[] => {
    try {
      const stored = localStorage.getItem('sim_marketplace_users');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsername = username.trim().replace(/^@/, '');
    if (!cleanUsername) {
      setErrorMessage('Please enter your driver username.');
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
        setErrorMessage('Driver account not found. Try one of the demo accounts or register below.');
        return;
      }

      if (found.password && found.password !== password) {
        setErrorMessage('Incorrect password. Please verify your credentials.');
        return;
      }

      onLoginSuccess(found);
    } else {
      // Register Mode
      const exists = currentUsers.some(
        (u) => u.username.toLowerCase() === cleanUsername.toLowerCase()
      );

      if (exists) {
        setErrorMessage('This username is already registered. Please choose another.');
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
    }
  };

  return (
    <div className="w-full flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl w-full bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 backdrop-blur-md relative overflow-hidden">
        {/* Decorative Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />

        {/* Header & Lock Shield */}
        <div className="text-center space-y-2 pt-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-600/15 border border-red-500/30 text-red-400 mb-1 shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider">
              Mandatory Authentication
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold">
              {activeGameName}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Sign In to Unlock Setup Marketplace
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Authentication is required to view setup lists, inspect aerodynamic and differential sheets, access verified best lap times, and submit custom setups.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-950/70 border border-slate-800/80 rounded-xl text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center text-red-400">
              <Flag className="w-4 h-4" />
            </div>
            <div className="text-[11px] font-bold text-slate-200">F1 25 & 26 Specs</div>
            <div className="text-[10px] text-slate-400">Official circuits</div>
          </div>
          <div className="space-y-1 border-x border-slate-800/80 px-2">
            <div className="flex items-center justify-center text-amber-400">
              <Gauge className="w-4 h-4" />
            </div>
            <div className="text-[11px] font-bold text-slate-200">Best Lap Times</div>
            <div className="text-[10px] text-slate-400">Verified telemetries</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center text-yellow-400">
              <Star className="w-4 h-4" />
            </div>
            <div className="text-[11px] font-bold text-slate-200">Star Ratings</div>
            <div className="text-[10px] text-slate-400">Community reviewed</div>
          </div>
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-bold">
          <button
            type="button"
            id="auth-barrier-login-tab"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'login'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            id="auth-barrier-register-tab"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'register'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Validation Error Message */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Driver Username</label>
            <input
              id="barrier-username-input"
              type="text"
              placeholder="e.g. ApexRacer"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Password</label>
            <input
              id="barrier-password-input"
              type="password"
              placeholder="Enter password (at least 4 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Driver Profile Badge</label>
              <div className="grid grid-cols-2 gap-2">
                {(['Community', 'Pro', 'Esports', 'Verified'] as const).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBadge(b)}
                    className={`py-2 px-3 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                      badge === b
                        ? 'border-red-500 bg-red-950/40 text-white font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{b}</span>
                    {badge === b && <ShieldCheck className="w-3.5 h-3.5 text-red-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            id="barrier-submit-btn"
            className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            {mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In & Unlock Marketplace</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Account & Enter</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Logins for Instant Testing */}
        <div className="pt-4 border-t border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Instant Test Driver Profiles (1-Click Access):</span>
            </span>
            <span className="text-[10px] text-slate-400">Click to enter</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {DEFAULT_USERS.map((user) => (
              <button
                key={user.username}
                type="button"
                id={`barrier-quick-login-${user.username.toLowerCase()}-btn`}
                onClick={() => handleQuickDemo(user)}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-left transition-all flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <div className="text-xs font-bold text-red-300 group-hover:text-red-200">
                    @{user.username}
                  </div>
                  <div className="text-[10px] text-slate-400">{user.badge} Driver</div>
                </div>
                <KeyRound className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
