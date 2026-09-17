import React from 'react';
import {
  X,
  User,
  Star,
  Download,
  Bookmark,
  ExternalLink,
  Youtube,
  Tv,
  MessageSquare,
  Instagram,
  Twitter,
  Globe,
  SlidersHorizontal,
  Copy,
  CheckCheck,
  Trash2,
  ShieldCheck,
  Calendar,
  MapPin,
  Award,
} from 'lucide-react';
import { CarSetup, UserAccount } from '../types';
import { getCreatorProfile } from '../data/mockCreators';
import { TRACKS, SIM_GAMES } from '../data/mockData';
import { getTrackFlagEmoji } from '../utils/trackFlags';

interface CreatorProfileModalProps {
  creatorUsername: string;
  allSetups: CarSetup[];
  favoriteIds: string[];
  currentUser: UserAccount | null;
  onClose: () => void;
  onInspectSetup: (setup: CarSetup) => void;
  onToggleFavorite: (setupId: string) => void;
  onDeleteSetup?: (setupId: string) => void;
  onCopySetup?: (setup: CarSetup) => void;
}

export const CreatorProfileModal: React.FC<CreatorProfileModalProps> = ({
  creatorUsername,
  allSetups,
  favoriteIds,
  currentUser,
  onClose,
  onInspectSetup,
  onToggleFavorite,
  onDeleteSetup,
  onCopySetup,
}) => {
  const profile = getCreatorProfile(creatorUsername);

  // Filter all setups published by this creator
  const creatorSetups = allSetups.filter(
    (s) => s.creatorUsername.toLowerCase() === creatorUsername.toLowerCase()
  );

  // Compute creator statistics
  const totalDownloads = creatorSetups.reduce((acc, s) => acc + (s.downloads || 0), 0);
  const ratedSetups = creatorSetups.filter((s) => s.ratingCount > 0);
  const avgRating =
    ratedSetups.length > 0
      ? (
          ratedSetups.reduce((acc, s) => acc + (s.averageRating || 0), 0) / ratedSetups.length
        ).toFixed(1)
      : '0.0';

  // Input device preference
  const inputDeviceCounts = creatorSetups.reduce((acc, s) => {
    const dev = s.inputDevice || 'Wheel';
    acc[dev] = (acc[dev] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const preferredInputDevice =
    Object.entries(inputDeviceCounts).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] || 'Wheel';

  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Follow State (Instagram Style)
  const followStorageKey = `f1_creator_follow_${creatorUsername}`;
  const [isFollowing, setIsFollowing] = React.useState<boolean>(() => {
    return localStorage.getItem(followStorageKey) === 'true';
  });

  const baseFollowers = profile.followers || 1250;
  const followersCount = baseFollowers + (isFollowing ? 1 : 0);

  const handleToggleFollow = () => {
    const nextState = !isFollowing;
    setIsFollowing(nextState);
    localStorage.setItem(followStorageKey, String(nextState));
  };

  const handleCopy = (setup: CarSetup, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCopySetup) {
      onCopySetup(setup);
    } else {
      const text = `${setup.title} (${setup.gameId.toUpperCase()}) - Front Wing: ${setup.specs.frontWing}, Rear Wing: ${setup.specs.rearWing}, Diff On: ${setup.specs.diffOnThrottle}%`;
      navigator.clipboard.writeText(text);
    }
    setCopiedId(setup.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getTrackName = (setup: CarSetup) => {
    const raw = setup.customTrackName || TRACKS[setup.trackId]?.name || setup.trackId.toUpperCase();
    const flag = getTrackFlagEmoji(setup.trackId, TRACKS[setup.trackId]?.country || setup.customTrackName);
    return `${flag} ${raw}`;
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl space-y-5 text-slate-100 max-h-[94vh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
        id="creator-profile-dialog"
      >
        {/* Instagram Style Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 flex-shrink-0">
          <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
            {/* Creator Avatar with Instagram Story Gradient Ring */}
            <div className="relative flex-shrink-0">
              <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-xl">
                <img
                  src={
                    profile.avatar ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                      profile.username
                    )}`
                  }
                  alt={profile.username}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-slate-900 bg-slate-950"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 text-[10px] px-2 py-0.5 rounded-full bg-sky-600 text-white font-black uppercase tracking-tight shadow">
                {profile.badge}
              </span>
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                  @{profile.username}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-sky-400 border border-slate-700 flex items-center gap-1">
                  <Award className="w-3 h-3 text-sky-400" />
                  <span>{profile.badge} Creator</span>
                </span>
              </div>

              {/* Instagram Stats Row */}
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-300 pt-0.5 flex-wrap">
                <div>
                  <strong className="text-white font-black text-sm">{creatorSetups.length}</strong>{' '}
                  <span className="text-slate-400">setups</span>
                </div>
                <div>
                  <strong className="text-white font-black text-sm">{followersCount.toLocaleString()}</strong>{' '}
                  <span className="text-slate-400">followers</span>
                </div>
                <div>
                  <strong className="text-sky-400 font-black text-sm">{totalDownloads.toLocaleString()}</strong>{' '}
                  <span className="text-slate-400">downloads</span>
                </div>
                <div>
                  <strong className="text-amber-400 font-black text-sm">
                    {ratedSetups.length > 0 ? `${avgRating} ★` : 'No ratings'}
                  </strong>{' '}
                  <span className="text-slate-400">avg rating</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap pt-0.5">
                {profile.team && (
                  <span className="flex items-center gap-1 font-semibold text-slate-300">
                    <User className="w-3.5 h-3.5 text-sky-400" />
                    {profile.team}
                  </span>
                )}
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {profile.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Header Controls (Follow Toggle & Close) */}
          <div className="flex items-center gap-2.5 self-start sm:self-center">
            <button
              type="button"
              onClick={handleToggleFollow}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow cursor-pointer flex items-center gap-1.5 ${
                isFollowing
                  ? 'bg-slate-800 text-slate-200 hover:bg-rose-950/40 hover:text-rose-300 border border-slate-700 hover:border-rose-800'
                  : 'bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-black shadow-sky-500/20'
              }`}
            >
              {isFollowing ? (
                <>
                  <CheckCheck className="w-4 h-4 text-emerald-400" />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4" />
                  <span>+ Follow Creator</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              id="creator-profile-close-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Creator Bio & Social Channels */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3 flex-shrink-0">
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            {profile.bio}
          </p>

          {/* Social Links */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-900">
            <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase tracking-wider">
              Social Links:
            </span>

            {profile.socials.youtube && (
              <a
                href={profile.socials.youtube}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/60 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Youtube className="w-3.5 h-3.5 text-red-400" />
                <span>YouTube</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            )}

            {profile.socials.twitch && (
              <a
                href={profile.socials.twitch}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-purple-950/40 hover:bg-purple-900/60 text-purple-400 border border-purple-800/60 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Tv className="w-3.5 h-3.5 text-purple-400" />
                <span>Twitch</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            )}

            {profile.socials.discord && (
              <a
                href={profile.socials.discord}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-400 border border-indigo-800/60 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                <span>Discord</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            )}

            {profile.socials.instagram && (
              <a
                href={profile.socials.instagram}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-pink-950/40 hover:bg-pink-900/60 text-pink-400 border border-pink-800/60 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Instagram className="w-3.5 h-3.5 text-pink-400" />
                <span>Instagram</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            )}

            {profile.socials.twitter && (
              <a
                href={profile.socials.twitter}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-sky-950/40 hover:bg-sky-900/60 text-sky-400 border border-sky-800/60 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Twitter className="w-3.5 h-3.5 text-sky-400" />
                <span>X / Twitter</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            )}

            {profile.socials.website && (
              <a
                href={profile.socials.website}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/60 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Official Site</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            )}
          </div>
        </div>

        {/* Creator Performance Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 flex-shrink-0 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Total Setups
            </span>
            <div className="text-lg font-black text-white mt-0.5">{creatorSetups.length}</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-center gap-1">
              <Download className="w-3 h-3 text-sky-400" />
              Total Downloads
            </span>
            <div className="text-lg font-black text-sky-400 mt-0.5">
              {totalDownloads.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              Avg Rating
            </span>
            <div className="text-lg font-black text-amber-400 mt-0.5">{avgRating} / 5.0</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Preferred Device
            </span>
            <div className="text-sm font-extrabold text-slate-200 mt-1 truncate">
              {preferredInputDevice === 'Gamepad'
                ? '🎮 Gamepad'
                : preferredInputDevice === 'Keyboard'
                ? '⌨️ Keyboard'
                : '🏎️ Wheel'}
            </div>
          </div>
        </div>

        {/* Portfolio Section Header */}
        <div className="flex items-center justify-between pt-1">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <span>Published Setups Portfolio ({creatorSetups.length})</span>
          </h3>
          <span className="text-xs text-slate-400">
            Click any setup card to inspect parameters
          </span>
        </div>

        {/* Creator Portfolio Grid (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-[220px]">
          {creatorSetups.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 text-slate-400 space-y-2">
              <SlidersHorizontal className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-semibold">
                No setups currently published by @{creatorUsername}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {creatorSetups.map((setup) => {
                const gameObj = SIM_GAMES.find((g) => g.id === setup.gameId);
                const trackName = getTrackName(setup);
                const isFavorited = favoriteIds.includes(setup.id);
                const isCopied = copiedId === setup.id;

                return (
                  <div
                    key={setup.id}
                    className={`bg-slate-950/90 border rounded-xl p-3.5 space-y-3 transition-all duration-200 hover:border-slate-700 relative flex flex-col justify-between ${
                      isFavorited
                        ? 'border-amber-500/40 bg-slate-950'
                        : 'border-slate-800 hover:bg-slate-900/60'
                    }`}
                  >
                    {/* Header */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-sky-300 border border-slate-800 truncate">
                          {gameObj?.name || setup.gameId.toUpperCase()}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                            {setup.inputDevice || 'Wheel'}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFavorite(setup.id);
                            }}
                            className={`p-1 rounded-md border transition-colors cursor-pointer ${
                              isFavorited
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-amber-400'
                            }`}
                            title={
                              isFavorited ? 'Remove from Favorites' : 'Bookmark to Favorites'
                            }
                          >
                            <Bookmark
                              className={`w-3.5 h-3.5 ${
                                isFavorited ? 'fill-amber-400 text-amber-400' : ''
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      <h4
                        className="font-extrabold text-sm text-white hover:text-sky-300 transition-colors cursor-pointer line-clamp-1"
                        onClick={() => {
                          onInspectSetup(setup);
                          onClose();
                        }}
                      >
                        {setup.title}
                      </h4>

                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="text-slate-300 font-semibold truncate">{trackName}</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {setup.bestLapTime}
                        </span>
                      </div>
                    </div>

                    {/* Aero & Specs Summary Pill */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                      <div>
                        <span className="text-slate-400 text-[10px]">Wings:</span>{' '}
                        <span className="text-white font-bold">
                          {setup.specs.frontWing} / {setup.specs.rearWing}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">Diff On:</span>{' '}
                        <span className="text-white font-bold">
                          {setup.specs.diffOnThrottle}%
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-900">
                      <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {setup.ratingCount > 0 ? (
                          <>
                            <span>{setup.averageRating.toFixed(1)}</span>
                            <span className="text-slate-500 font-normal text-[10px]">
                              ({setup.ratingCount})
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-400 font-normal text-[10px]">
                            No ratings yet
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleCopy(setup, e)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1 cursor-pointer"
                          title="Copy Setup Specs"
                        >
                          {isCopied ? (
                            <>
                              <CheckCheck className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onInspectSetup(setup);
                            onClose();
                          }}
                          className="px-3 py-1 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1 cursor-pointer shadow"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          <span>View Specs</span>
                        </button>

                        {currentUser &&
                          currentUser.username.toLowerCase() ===
                            setup.creatorUsername.toLowerCase() &&
                          onDeleteSetup && (
                            <button
                              type="button"
                              onClick={() => onDeleteSetup(setup.id)}
                              className="p-1 rounded-lg text-rose-400 hover:text-white bg-rose-500/15 hover:bg-rose-600 border border-rose-500/30 cursor-pointer"
                              title="Delete Setup"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
