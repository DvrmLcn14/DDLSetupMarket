import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Sparkles, Trophy, MessageSquare, Radio } from 'lucide-react';
import { FloatingBannerConfig } from '../types';

interface FloatingBannerProps {
  config: FloatingBannerConfig;
  onOpenSettings?: () => void;
  isAdmin?: boolean;
}

// Crisp official Discord SVG icon component
export const DiscordIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

export const FloatingBanner: React.FC<FloatingBannerProps> = ({
  config,
  onOpenSettings,
  isAdmin = false,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    try {
      const isDismissed = localStorage.getItem('ddl_floating_banner_dismissed');
      return isDismissed !== 'true';
    } catch {
      return true;
    }
  });

  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // If banner is disabled by config or closed by user, don't show full box
  if (!config.enabled) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem('ddl_floating_banner_dismissed', 'true');
    } catch (e) {
      console.warn('Could not persist banner dismissal', e);
    }
  };

  const handleReopen = () => {
    setIsVisible(true);
    setIsMinimized(false);
    try {
      localStorage.removeItem('ddl_floating_banner_dismissed');
    } catch (e) {
      console.warn('Could not reset banner dismissal', e);
    }
  };

  // Color theme mapping
  const themeMap = {
    indigo: {
      border: 'border-indigo-500/40 hover:border-indigo-500/70',
      glow: 'shadow-indigo-950/50 hover:shadow-indigo-600/20',
      badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      iconBg: 'bg-[#5865F2] text-white shadow-[#5865F2]/40',
      buttonBg: 'bg-[#5865F2] hover:bg-[#4752C4] text-white shadow-[#5865F2]/30',
      subtext: 'text-indigo-300',
    },
    red: {
      border: 'border-red-500/40 hover:border-red-500/70',
      glow: 'shadow-red-950/50 hover:shadow-red-600/20',
      badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
      iconBg: 'bg-red-600 text-white shadow-red-600/40',
      buttonBg: 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30',
      subtext: 'text-red-300',
    },
    emerald: {
      border: 'border-emerald-500/40 hover:border-emerald-500/70',
      glow: 'shadow-emerald-950/50 hover:shadow-emerald-600/20',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      iconBg: 'bg-emerald-600 text-white shadow-emerald-600/40',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30',
      subtext: 'text-emerald-300',
    },
    cyan: {
      border: 'border-cyan-500/40 hover:border-cyan-500/70',
      glow: 'shadow-cyan-950/50 hover:shadow-cyan-600/20',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      iconBg: 'bg-cyan-600 text-white shadow-cyan-600/40',
      buttonBg: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/30',
      subtext: 'text-cyan-300',
    },
    amber: {
      border: 'border-amber-500/40 hover:border-amber-500/70',
      glow: 'shadow-amber-950/50 hover:shadow-amber-600/20',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      iconBg: 'bg-amber-600 text-white shadow-amber-600/40',
      buttonBg: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30',
      subtext: 'text-amber-300',
    },
  };

  const currentTheme = themeMap[config.accentColor || 'indigo'] || themeMap.indigo;

  // If dismissed, show a discreet mini floating pill so users or admins can reopen it easily
  if (!isVisible) {
    return (
      <button
        type="button"
        id="reopen-discord-banner-btn"
        onClick={handleReopen}
        title="Open DDL Community Discord"
        className="fixed bottom-4 right-4 z-40 bg-slate-900/95 hover:bg-[#5865F2] text-slate-300 hover:text-white border border-slate-700 hover:border-transparent p-2.5 rounded-full shadow-xl transition-all duration-200 flex items-center gap-2 group cursor-pointer"
      >
        <DiscordIcon className="w-5 h-5 text-[#5865F2] group-hover:text-white transition-colors" />
        <span className="text-xs font-bold pr-1 hidden group-hover:inline-block transition-all">
          Join Discord
        </span>
      </button>
    );
  }

  return (
    <div
      id="floating-discord-banner"
      className={`fixed bottom-4 right-4 z-40 max-w-[360px] sm:max-w-[390px] w-[calc(100vw-2rem)] bg-slate-900/95 backdrop-blur-md rounded-2xl border ${currentTheme.border} ${currentTheme.glow} shadow-2xl transition-all duration-300 overflow-hidden animate-in fade-in slide-in-from-bottom-5`}
    >
      {/* Top Header Accent Line */}
      <div className="h-1 w-full bg-gradient-to-r from-[#5865F2] via-indigo-400 to-sky-400" />

      <div className="p-4 space-y-3">
        {/* Top bar: Badge, online status & Close button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {config.badgeText && (
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${currentTheme.badgeBg}`}
              >
                {config.badgeText}
              </span>
            )}
            {typeof config.onlineCount === 'number' && (
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-400 font-bold">{config.onlineCount}</span> online
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {isAdmin && onOpenSettings && (
              <button
                type="button"
                id="edit-banner-admin-btn"
                onClick={onOpenSettings}
                title="Edit Banner Config (Admin)"
                className="text-[10px] text-slate-400 hover:text-amber-400 bg-slate-800/80 hover:bg-slate-800 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
              >
                ⚙️ Config
              </button>
            )}
            <button
              type="button"
              id="close-floating-banner-btn"
              onClick={handleDismiss}
              title="Close Banner"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Section with Icon + Title + Body */}
        <div className="flex items-start gap-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-md ${currentTheme.iconBg}`}
          >
            {config.iconType === 'discord' && <DiscordIcon className="w-6 h-6" />}
            {config.iconType === 'sparkles' && <Sparkles className="w-6 h-6 text-white" />}
            {config.iconType === 'trophy' && <Trophy className="w-6 h-6 text-white" />}
            {config.iconType === 'custom' && config.customIconUrl && (
              <img
                src={config.customIconUrl}
                alt="Icon"
                className="w-6 h-6 rounded object-cover"
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5 truncate">
              <span>{config.title}</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mt-0.5 line-clamp-2">
              {config.description}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-1 flex items-center gap-2">
          <a
            id="join-floating-banner-btn"
            href={config.buttonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-black shadow-lg transition-all transform active:scale-95 cursor-pointer ${currentTheme.buttonBg}`}
          >
            <DiscordIcon className="w-4 h-4 shrink-0" />
            <span>{config.buttonText}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>
      </div>
    </div>
  );
};
