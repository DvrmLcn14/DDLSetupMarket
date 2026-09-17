import React from 'react';
import { Plus, LogOut, Bookmark, ShieldCheck } from 'lucide-react';
import { SupportedF1GameId, SimGame, UserAccount } from '../types';

interface DesktopHeaderProps {
  activeGame: SimGame;
  onSelectGame: (gameId: SupportedF1GameId) => void;
  currentUser: UserAccount | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  onOpenSubmitModal: () => void;
  favoritesCount?: number;
  isFavoritesActive?: boolean;
  onSelectFavorites?: () => void;
  onOpenAdminPanel?: () => void;
  pendingAdminCount?: number;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  activeGame,
  onSelectGame,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenSubmitModal,
  favoritesCount = 0,
  isFavoritesActive = false,
  onSelectFavorites,
  onOpenAdminPanel,
  pendingAdminCount = 0,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30 select-none shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center font-black text-white text-xs tracking-tighter shadow-sm shadow-red-600/40 border border-red-500/30">
              DDL
            </div>
            <div>
              <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white leading-tight flex items-center gap-1.5">
                <span>DDLSetupMarket</span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                Official F1 24, F1 25 &amp; F1 26 Setup Marketplace
              </p>
            </div>
          </div>
        </div>

        {/* Clean Game & Favorites Selection Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner">
            {/* F1 24 Tab */}
            <button
              type="button"
              id="game-tab-f1-24"
              onClick={() => onSelectGame('f1_24')}
              className={`px-3.5 sm:px-4 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                !isFavoritesActive && activeGame.id === 'f1_24'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>🏎️</span>
              <span>F1® 24 Setups</span>
            </button>

            {/* F1 25 Tab */}
            <button
              type="button"
              id="game-tab-f1-25"
              onClick={() => onSelectGame('f1_25')}
              className={`px-3.5 sm:px-4 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                !isFavoritesActive && activeGame.id === 'f1_25'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>⚡</span>
              <span>F1® 25 Setups</span>
            </button>

            {/* F1 26 Tab */}
            <button
              type="button"
              id="game-tab-f1-26"
              onClick={() => onSelectGame('f1_26')}
              className={`px-3.5 sm:px-4 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                !isFavoritesActive && activeGame.id === 'f1_26'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>🚀</span>
              <span>F1® 26 Setups</span>
            </button>

            {/* Favorites Tab */}
            {onSelectFavorites && (
              <button
                type="button"
                id="header-tab-favorites"
                onClick={onSelectFavorites}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ml-0.5 ${
                  isFavoritesActive
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/60'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isFavoritesActive ? 'fill-slate-950 text-slate-950' : 'text-amber-400'}`} />
                <span>Favorites</span>
                {favoritesCount > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isFavoritesActive
                        ? 'bg-slate-950 text-amber-300'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {favoritesCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right Actions: Submit F1 Setup, Admin Review & Account */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin Verification Review Button */}
          {onOpenAdminPanel && (
            <button
              type="button"
              id="header-admin-panel-btn"
              onClick={onOpenAdminPanel}
              className="px-3 py-1.5 rounded-xl bg-sky-950 hover:bg-sky-900 border border-sky-500/40 text-sky-300 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-950/40 transition-all cursor-pointer relative"
              title="Admin Screenshot & Lap Time Verification Panel"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Admin Review</span>
              {pendingAdminCount > 0 ? (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 shadow-sm animate-pulse">
                  {pendingAdminCount}
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300">
                  Panel
                </span>
              )}
            </button>
          )}

          {/* Submit F1 Setup Button */}
          <button
            type="button"
            id="header-submit-setup-btn"
            onClick={onOpenSubmitModal}
            className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-red-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Submit Setup</span>
          </button>

          {/* User Account / Sign In */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div className="w-5 h-5 rounded-full bg-red-600/30 border border-red-500/40 flex items-center justify-center text-[10px] font-bold text-red-300">
                  {currentUser.username.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-slate-200 max-w-[110px] truncate">
                  {currentUser.username}
                </span>
                <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400 font-mono">
                  {currentUser.badge}
                </span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                id="header-login-btn"
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-white hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
