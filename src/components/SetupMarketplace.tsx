import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Clock,
  User,
  Download,
  Check,
  ChevronDown,
  ArrowUpDown,
  Filter,
  Sparkles,
  PlusCircle,
  Copy,
  CheckCheck,
  Car,
  BadgeCheck,
  ShieldCheck,
  Layers,
  Calendar,
  Share2,
  FileDown,
  X,
  LogIn,
  LogOut,
  Tag,
  Gauge,
  Flame,
  Camera,
  AlertCircle,
  Eye,
  FileImage,
  Maximize2,
  Grid,
  FileSpreadsheet,
  Trash2,
  Bookmark,
  BookmarkCheck,
  Heart,
  MessageSquare,
  MessageCircle,
  Star,
  Edit3,
} from 'lucide-react';
import {
  CarSetup,
  Track,
  SimGame,
  UserAccount,
  SetupTuningScreenshot,
  F1SetupPageCategory,
  SetupComment,
  CommentTag,
} from '../types';
import { TRACKS, SIM_GAMES } from '../data/mockData';
import { INITIAL_COMMENTS } from '../data/mockComments';
import { StarRating } from './StarRating';
import { SetupDiscussion } from './SetupDiscussion';
import { SubmitSetupModal } from './SubmitSetupModal';
import { CreatorProfileModal } from './CreatorProfileModal';
import { downloadSetupAsImage } from '../utils/setupImageExport';
import { normalizeSimString } from '../utils/motorsportNomenclature';
import { getTrackFlagEmoji } from '../utils/trackFlags';

interface SetupMarketplaceProps {
  setups: CarSetup[];
  activeGame: SimGame;
  onGameChange: (game: SimGame) => void;
  activeTrackId: string;
  onTrackChange: (trackId: string) => void;
  currentUser: UserAccount | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  onDownloadSetup: (setup: CarSetup) => void;
  onRateSetup: (setupId: string, rating: number) => void;
  onAddSetup: (newSetup: CarSetup) => void;
  onUpdateSetup?: (updatedSetup: CarSetup) => void;
  onDeleteSetup?: (setupId: string) => void;
  isExternalSubmitOpen?: boolean;
  onCloseExternalSubmit?: () => void;
  favoriteIds?: string[];
  onToggleFavorite?: (setupId: string) => void;
  activeViewMode?: 'all' | 'favorites' | 'my-setups';
  onViewModeChange?: (mode: 'all' | 'favorites' | 'my-setups') => void;
}

export const SetupMarketplace: React.FC<SetupMarketplaceProps> = ({
  setups,
  activeGame,
  onGameChange,
  activeTrackId,
  onTrackChange,
  currentUser,
  onOpenAuth,
  onLogout,
  onDownloadSetup,
  onRateSetup,
  onAddSetup,
  onUpdateSetup,
  onDeleteSetup,
  isExternalSubmitOpen,
  onCloseExternalSubmit,
  favoriteIds,
  onToggleFavorite,
  activeViewMode = 'all',
  onViewModeChange,
}) => {
  // Favorites State with local persistence fallback
  const [localFavorites, setLocalFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('sim_marketplace_favorites');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Could not read saved favorites', e);
    }
    return [];
  });

  const favoritesList = favoriteIds !== undefined ? favoriteIds : localFavorites;

  const handleToggleFav = (setupId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(setupId);
    } else {
      setLocalFavorites((prev) => {
        const isFav = prev.includes(setupId);
        const updated = isFav ? prev.filter((id) => id !== setupId) : [...prev, setupId];
        try {
          localStorage.setItem('sim_marketplace_favorites', JSON.stringify(updated));
        } catch (err) {
          console.warn('Could not persist favorites', err);
        }
        return updated;
      });
    }
  };

  // Filter States
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>(activeGame.id);
  const [selectedTrackFilter, setSelectedTrackFilter] = useState<string>(activeTrackId || 'all');
  const [selectedDeviceFilter, setSelectedDeviceFilter] = useState<'All' | 'Wheel' | 'Gamepad' | 'Keyboard'>('All');
  const [selectedCondition, setSelectedCondition] = useState<'All' | 'Dry' | 'Wet'>('All');
  const [selectedType, setSelectedType] = useState<'All' | 'Qualifying' | 'Race' | 'Time Trial'>('All');
  const [selectedDownforce, setSelectedDownforce] = useState<'All' | 'Low' | 'Medium' | 'High'>('All');
  const [selectedVerificationFilter, setSelectedVerificationFilter] = useState<'All' | 'Verified' | 'Pending'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'laptime' | 'newest'>('rating');
  const [viewMode, setViewMode] = useState<'all' | 'favorites' | 'my-setups'>(activeViewMode);
  const [favoritesOnlyFilter, setFavoritesOnlyFilter] = useState<boolean>(false);

  // Sync with activeViewMode from header
  React.useEffect(() => {
    if (activeViewMode) {
      setViewMode(activeViewMode);
    }
  }, [activeViewMode]);

  const handleSetViewMode = (mode: 'all' | 'favorites' | 'my-setups') => {
    setViewMode(mode);
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  // Sync with activeGame when updated from overlay tabs or process detector
  React.useEffect(() => {
    setSelectedGameFilter(activeGame.id);
  }, [activeGame.id]);

  // Sync with activeTrackId when updated from in-game telemetry or overlay selector
  React.useEffect(() => {
    if (activeTrackId) {
      setSelectedTrackFilter(activeTrackId);
    }
  }, [activeTrackId]);

  // Modals & Inspection Viewers
  const [selectedCreatorUsername, setSelectedCreatorUsername] = useState<string | null>(null);
  const [inspectingSetup, setInspectingSetup] = useState<CarSetup | null>(null);
  const [inspectingModalTab, setInspectingModalTab] = useState<'specs' | 'discussion'>('specs');
  const [selectedScreenshotTab, setSelectedScreenshotTab] = useState<string>('all');
  const [fullscreenScreenshot, setFullscreenScreenshot] = useState<SetupTuningScreenshot | null>(null);
  const [viewingProofSetup, setViewingProofSetup] = useState<CarSetup | null>(null);
  const [ratingModalSetup, setRatingModalSetup] = useState<CarSetup | null>(null);
  const [setupToDelete, setSetupToDelete] = useState<CarSetup | null>(null);
  const [userSelectedStars, setUserSelectedStars] = useState(5);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [editingSetup, setEditingSetup] = useState<CarSetup | null>(null);

  React.useEffect(() => {
    if (isExternalSubmitOpen) {
      setIsSubmitModalOpen(true);
    }
  }, [isExternalSubmitOpen]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadedId, setDownloadedId] = useState<string | null>(null);
  const [isExportingId, setIsExportingId] = useState<string | null>(null);
  const [exportedImagePreview, setExportedImagePreview] = useState<{ setup: CarSetup; imageUrl: string } | null>(null);
  const [newlySubmittedId, setNewlySubmittedId] = useState<string | null>(null);

  // Setup Comments state with localStorage persistence
  const [comments, setComments] = useState<SetupComment[]>(() => {
    try {
      const stored = localStorage.getItem('sim_marketplace_comments');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read saved comments', e);
    }
    return INITIAL_COMMENTS;
  });

  const getCommentCount = (setupId: string): number => {
    const list = comments.filter((c) => c.setupId === setupId);
    let total = 0;
    const countTree = (arr: SetupComment[]) => {
      arr.forEach((item) => {
        total += 1;
        if (item.replies && item.replies.length > 0) {
          countTree(item.replies);
        }
      });
    };
    countTree(list);
    return total;
  };

  const handleAddComment = (setupId: string, content: string, tag: CommentTag, parentId?: string | null) => {
    setComments((prev) => {
      let updated: SetupComment[];

      const newEntry: SetupComment = {
        id: (parentId ? 'reply-' : 'comm-') + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        setupId,
        parentId: parentId || null,
        authorUsername: currentUser?.username || 'SimRacer_' + Math.floor(100 + Math.random() * 900),
        authorBadge: currentUser?.badge || 'Community',
        authorAvatar: currentUser?.avatar,
        content,
        createdAt: new Date().toISOString(),
        likes: 0,
        userLiked: false,
        tag: tag || 'Feedback',
        replies: [],
      };

      if (!parentId) {
        updated = [newEntry, ...prev];
      } else {
        const insertReply = (list: SetupComment[]): SetupComment[] => {
          return list.map((item) => {
            if (item.id === parentId) {
              return {
                ...item,
                replies: [...(item.replies || []), newEntry],
              };
            }
            if (item.replies && item.replies.length > 0) {
              return {
                ...item,
                replies: insertReply(item.replies),
              };
            }
            return item;
          });
        };
        updated = insertReply(prev);
      }

      try {
        localStorage.setItem('sim_marketplace_comments', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not persist comments', e);
      }

      return updated;
    });
  };

  const handleLikeComment = (setupId: string, commentId: string) => {
    setComments((prev) => {
      const toggleLike = (list: SetupComment[]): SetupComment[] => {
        return list.map((item) => {
          if (item.id === commentId) {
            const isLiked = !item.userLiked;
            return {
              ...item,
              userLiked: isLiked,
              likes: isLiked ? item.likes + 1 : Math.max(0, item.likes - 1),
            };
          }
          if (item.replies && item.replies.length > 0) {
            return {
              ...item,
              replies: toggleLike(item.replies),
            };
          }
          return item;
        });
      };

      const updated = toggleLike(prev);
      try {
        localStorage.setItem('sim_marketplace_comments', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not persist liked comments', e);
      }
      return updated;
    });
  };

  // Sync selectedGameFilter with activeGame
  const handleSelectGame = (game: SimGame) => {
    setSelectedGameFilter(game.id);
    onGameChange(game);
    if (selectedTrackFilter !== 'all' && game.activeTracks && !game.activeTracks.includes(selectedTrackFilter)) {
      setSelectedTrackFilter('all');
    }
  };

  // Dynamically collect tracks for the selected game (including custom submitted tracks)
  const availableTracks = useMemo(() => {
    const list: { id: string; name: string; country?: string }[] = [];
    const addedIds = new Set<string>();

    if (selectedGameFilter !== 'all') {
      const game = SIM_GAMES.find((g) => g.id === selectedGameFilter);
      if (game && game.activeTracks && game.activeTracks.length > 0) {
        game.activeTracks.forEach((tid) => {
          if (TRACKS[tid]) {
            list.push({ id: tid, name: TRACKS[tid].name, country: TRACKS[tid].country });
            addedIds.add(tid);
          }
        });
      }
    } else {
      Object.values(TRACKS).forEach((t) => {
        list.push({ id: t.id, name: t.name, country: t.country });
        addedIds.add(t.id);
      });
    }

    // Add any custom tracks from setups
    setups.forEach((s) => {
      if (selectedGameFilter === 'all' || s.gameId.toLowerCase() === selectedGameFilter.toLowerCase()) {
        if (!addedIds.has(s.trackId)) {
          list.push({
            id: s.trackId,
            name: s.customTrackName || TRACKS[s.trackId]?.name || s.trackId,
            country: 'Custom',
          });
          addedIds.add(s.trackId);
        }
      }
    });

    return list;
  }, [selectedGameFilter, setups]);

  // Filtered and sorted setups with fuzzy matching on custom tracks & cars
  const filteredSetups = useMemo(() => {
    return setups
      .filter((setup) => {
        // Game filter
        if (selectedGameFilter !== 'all' && setup.gameId.toLowerCase() !== selectedGameFilter.toLowerCase()) {
          return false;
        }

        // View Mode: Favorites or My Setups
        if (viewMode === 'favorites' || favoritesOnlyFilter) {
          if (!favoritesList.includes(setup.id)) {
            return false;
          }
        }

        if (viewMode === 'my-setups') {
          if (!currentUser) return false;
          if (setup.creatorUsername.toLowerCase() !== currentUser.username.toLowerCase()) {
            return false;
          }
        }

        // Track filter
        if (selectedTrackFilter !== 'all' && setup.trackId.toLowerCase() !== selectedTrackFilter.toLowerCase()) {
          return false;
        }

        // Input Device filter (Wheel, Gamepad, Keyboard)
        if (selectedDeviceFilter !== 'All') {
          const currentDev = (setup.inputDevice || 'Wheel').toLowerCase();
          const targetDev = selectedDeviceFilter.toLowerCase();
          if (targetDev === 'wheel' && (!currentDev.includes('wheel') || currentDev.includes('gamepad'))) {
            return false;
          } else if (targetDev === 'gamepad' && !currentDev.includes('gamepad') && !currentDev.includes('controller')) {
            return false;
          } else if (targetDev === 'keyboard' && !currentDev.includes('keyboard')) {
            return false;
          } else if (!currentDev.includes(targetDev)) {
            return false;
          }
        }

        // Condition filter
        if (selectedCondition !== 'All' && setup.condition !== selectedCondition) {
          return false;
        }

        // Type filter
        if (selectedType !== 'All' && setup.type !== selectedType) {
          return false;
        }

        // Downforce filter
        if (selectedDownforce !== 'All' && setup.downforceLevel !== selectedDownforce) {
          return false;
        }

        // Verification Status Filter
        if (selectedVerificationFilter === 'Verified') {
          if (setup.verificationStatus !== 'verified' && !setup.isProofVerified) {
            return false;
          }
        } else if (selectedVerificationFilter === 'Pending') {
          if (setup.verificationStatus === 'verified' || (setup.isProofVerified && setup.verificationStatus !== 'pending')) {
            return false;
          }
        }

        // Search query (with fuzzy normalization)
        if (searchQuery.trim()) {
          const rawQ = searchQuery.trim().toLowerCase();
          const normQ = normalizeSimString(searchQuery);

          const trackName = (TRACKS[setup.trackId]?.name || setup.customTrackName || '').toLowerCase();
          const normTrack = normalizeSimString(trackName);

          const carName = setup.carName.toLowerCase();
          const normCar = normalizeSimString(carName);

          const title = setup.title.toLowerCase();
          const normTitle = normalizeSimString(title);

          const creator = setup.creatorUsername.toLowerCase();
          const notes = setup.notes.toLowerCase();

          const matches =
            title.includes(rawQ) ||
            normTitle.includes(normQ) ||
            creator.includes(rawQ) ||
            carName.includes(rawQ) ||
            normCar.includes(normQ) ||
            trackName.includes(rawQ) ||
            normTrack.includes(normQ) ||
            notes.includes(rawQ);

          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Newly submitted takes priority at top
        if (a.id === newlySubmittedId) return -1;
        if (b.id === newlySubmittedId) return 1;

        if (sortBy === 'rating') {
          return b.averageRating - a.averageRating;
        }
        if (sortBy === 'laptime') {
          return a.lapTimeSeconds - b.lapTimeSeconds;
        }
        if (sortBy === 'downloads') {
          return b.downloads - a.downloads;
        }
        if (sortBy === 'newest') {
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        }
        return 0;
      });
  }, [
    setups,
    selectedGameFilter,
    selectedTrackFilter,
    selectedCondition,
    selectedType,
    selectedDownforce,
    searchQuery,
    sortBy,
    viewMode,
    favoritesOnlyFilter,
    favoritesList,
    selectedDeviceFilter,
    currentUser,
    newlySubmittedId,
  ]);

  // Copy setup specs sheet to clipboard
  const handleCopySetup = (setup: CarSetup, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const trackInfo = TRACKS[setup.trackId]?.name || setup.customTrackName || setup.trackId.toUpperCase();
    const gameInfo = SIM_GAMES.find((g) => g.id === setup.gameId)?.name || setup.gameId.toUpperCase();

    let screenshotInfo = '';
    if (setup.setupScreenshots && setup.setupScreenshots.length > 0) {
      screenshotInfo = `\n[VISUAL IN-GAME SETUP SHEETS (${setup.setupScreenshots.length} PAGES ATTACHED)]\n` +
        setup.setupScreenshots.map((s) => `• ${s.category}: ${s.title} ${s.notes ? `(${s.notes})` : ''}`).join('\n') + '\n';
    }

    const formattedText = `=========================================
${setup.title.toUpperCase()}
=========================================
Game: ${gameInfo}
Track: ${trackInfo}
Car: ${setup.carName}
Session Type: ${setup.type} | Condition: ${setup.condition}
Downforce Level: ${setup.downforceLevel}
Creator: @${setup.creatorUsername} (${setup.creatorBadge || 'Community'})
Best Recorded Lap: ${setup.bestLapTime}
Community Rating: ${setup.averageRating}/5.0 (${setup.ratingCount} reviews)
${screenshotInfo}
[AERODYNAMICS]
Front Wing: ${setup.specs.frontWing}
Rear Wing: ${setup.specs.rearWing}

[TRANSMISSION / DIFFERENTIAL]
Diff On-Throttle: ${setup.specs.diffOnThrottle}%
Diff Off-Throttle: ${setup.specs.diffOffThrottle}%

[SUSPENSION GEOMETRY]
Front Camber: ${setup.specs.frontCamber}°
Rear Camber: ${setup.specs.rearCamber}°
Front Toe: ${setup.specs.frontToe}°
Rear Toe: ${setup.specs.rearToe}°

[SUSPENSION & ANTI-ROLL]
Front Suspension: ${setup.specs.frontSuspension}
Rear Suspension: ${setup.specs.rearSuspension}
Front Anti-Roll Bar: ${setup.specs.frontAntiRollBar}
Rear Anti-Roll Bar: ${setup.specs.rearAntiRollBar}
Front Ride Height: ${setup.specs.frontRideHeight}
Rear Ride Height: ${setup.specs.rearRideHeight}

[BRAKES]
Brake Pressure: ${setup.specs.brakePressure}%
Front Brake Bias: ${setup.specs.brakeBias}%

[TYRE PRESSURES]
Front Left: ${setup.specs.flPressure} psi | Front Right: ${setup.specs.frPressure} psi
Rear Left: ${setup.specs.rlPressure} psi | Rear Right: ${setup.specs.rrPressure} psi

Notes & Advice:
${setup.notes}
=========================================
Exported from DDLSetupMarket (ddlsetupmarket.com)`;

    navigator.clipboard.writeText(formattedText);
    setCopiedId(setup.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  // Export setup as clean graphical setup sheet image (PNG)
  const handleDownloadFile = async (setup: CarSetup, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsExportingId(setup.id);
    onDownloadSetup(setup);

    const trackName = TRACKS[setup.trackId]?.name || setup.customTrackName || setup.trackId.toUpperCase();
    const gameName = SIM_GAMES.find((g) => g.id === setup.gameId)?.name || setup.gameId.toUpperCase();

    try {
      const dataUrl = await downloadSetupAsImage(setup, trackName, gameName);
      setDownloadedId(setup.id);
      setExportedImagePreview({ setup, imageUrl: dataUrl });
      setTimeout(() => {
        setDownloadedId(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to export sheet image:', err);
    } finally {
      setIsExportingId(null);
    }
  };

  // Keep inspectingSetup updated when ratings or setups change
  React.useEffect(() => {
    if (inspectingSetup) {
      const refreshed = setups.find((s) => s.id === inspectingSetup.id);
      if (
        refreshed &&
        (refreshed.averageRating !== inspectingSetup.averageRating ||
          refreshed.ratingCount !== inspectingSetup.ratingCount ||
          refreshed.userRating !== inspectingSetup.userRating ||
          refreshed.verificationStatus !== inspectingSetup.verificationStatus)
      ) {
        setInspectingSetup(refreshed);
      }
    }
  }, [setups, inspectingSetup]);

  const handleOpenRate = (setup: CarSetup, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRatingModalSetup(setup);
    setUserSelectedStars(setup.userRating || 5);
  };

  const handleConfirmRating = () => {
    if (ratingModalSetup) {
      onRateSetup(ratingModalSetup.id, userSelectedStars);
      if (inspectingSetup && inspectingSetup.id === ratingModalSetup.id) {
        const newCount = inspectingSetup.ratingCount + 1;
        const newAvg = Number(
          ((inspectingSetup.averageRating * inspectingSetup.ratingCount + userSelectedStars) / newCount).toFixed(1)
        );
        setInspectingSetup({
          ...inspectingSetup,
          averageRating: newAvg,
          ratingCount: newCount,
          userRating: userSelectedStars,
        });
      }
      setRatingModalSetup(null);
    }
  };

  const handleSetupSubmitted = (newSetup: CarSetup) => {
    onAddSetup(newSetup);
    setNewlySubmittedId(newSetup.id);
    setInspectingSetup(newSetup);
    setEditingSetup(null);
  };

  const handleOpenEdit = (setup: CarSetup, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setEditingSetup(setup);
    setIsSubmitModalOpen(true);
  };

  const handleSetupUpdated = (updatedSetup: CarSetup) => {
    if (onUpdateSetup) {
      onUpdateSetup(updatedSetup);
    }
    if (inspectingSetup && inspectingSetup.id === updatedSetup.id) {
      setInspectingSetup(updatedSetup);
    }
    setNewlySubmittedId(updatedSetup.id);
    setEditingSetup(null);
  };

  // Creator Ownership Verification
  const isSetupCreator = (setup: CarSetup): boolean => {
    if (!setup) return false;
    // 0. Admin / Founder override
    if (
      currentUser &&
      (currentUser.badge === 'Admin / Founder' ||
        (currentUser as any).role === 'admin' ||
        currentUser.username.toLowerCase() === 'admin')
    ) {
      return true;
    }
    // 1. Matched via signed-in user's username
    if (currentUser && currentUser.username.trim().toLowerCase() === setup.creatorUsername.trim().toLowerCase()) {
      return true;
    }
    // 2. Setup submitted in current browser session
    if (setup.isUserSubmitted) {
      return true;
    }
    // 3. Stored in creator setup ID registry in localStorage
    try {
      const raw = localStorage.getItem('sim_marketplace_my_setup_ids');
      if (raw) {
        const ids: string[] = JSON.parse(raw);
        if (Array.isArray(ids) && ids.includes(setup.id)) {
          return true;
        }
      }
    } catch (e) {
      // ignore
    }
    return false;
  };

  // Delete Setup Handlers
  const handleDeleteClick = (setup: CarSetup, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setSetupToDelete(setup);
  };

  const handleConfirmDelete = () => {
    if (!setupToDelete) return;
    const idToDelete = setupToDelete.id;

    if (onDeleteSetup) {
      onDeleteSetup(idToDelete);
    }

    if (inspectingSetup?.id === idToDelete) {
      setInspectingSetup(null);
    }

    setSetupToDelete(null);
  };

  // Helper for displaying human track names with country flag emoji
  const getDisplayTrackName = (setup: CarSetup) => {
    const rawName = TRACKS[setup.trackId]?.name || setup.customTrackName || setup.trackId.toUpperCase();
    const flag = getTrackFlagEmoji(setup.trackId, TRACKS[setup.trackId]?.country || setup.customTrackName);
    return `${flag} ${rawName}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4 py-4 text-slate-100 font-sans" id="setup-marketplace-root">
      {/* Top Banner / Marketplace Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-20 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-red-400" />
                <span>DDLSetupMarket • {activeGame.name} Setups</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1">
                <span>{activeGame.id === 'f1_24' ? '2024 Ground-Effect Physics' : activeGame.id === 'f1_25' ? '2025 FIA Technical Regulations' : '2026 Active Aerodynamics Physics'}</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
              DDLSetupMarket — {activeGame.name} Car Setups
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Explore, compare, and download verified esports and community setups for {activeGame.name} on DDLSetupMarket. Complete with telemetry proof and in-game calibration sheets.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 p-1.5 pl-3 rounded-xl">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-6 h-6 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-[11px]">
                    {currentUser.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-slate-200 block truncate max-w-[100px]">
                      @{currentUser.username}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 flex items-center gap-1.5 transition-colors shadow cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-sky-400" />
                <span>Sign In / Register</span>
              </button>
            )}

            <button
              type="button"
              id="open-submit-setup-modal-btn"
              onClick={() => {
                setEditingSetup(null);
                setIsSubmitModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all transform hover:scale-[1.02] cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit Setup</span>
            </button>
          </div>
        </div>

        {/* F1 Game Selection Tabs (F1 25 and F1 26) */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
              Active Game:
            </span>
            {SIM_GAMES.map((game) => {
              const isSelected = selectedGameFilter === game.id;
              return (
                <button
                  key={game.id}
                  type="button"
                  onClick={() => handleSelectGame(game)}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 whitespace-nowrap transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white border-red-500 shadow-md shadow-red-600/30'
                      : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-sm">{game.icon}</span>
                  <span>{game.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                    isSelected ? 'bg-red-800/60 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {game.id === 'f1_24' ? '2024 Regs' : game.id === 'f1_25' ? '2025 Regs' : '2026 Active Aero'}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span>Selected Circuit:</span>
            <strong className="text-white font-bold flex items-center gap-1">
              <span>{getTrackFlagEmoji(selectedTrackFilter, TRACKS[selectedTrackFilter]?.country)}</span>
              <span>{TRACKS[selectedTrackFilter]?.name?.split('(')[0] || (selectedTrackFilter === 'all' ? 'All F1 Circuits' : selectedTrackFilter)}</span>
            </strong>
          </div>
        </div>

        {/* Current Track Quick Selector Carousel */}
        <div className="mt-3 pt-3 border-t border-slate-800/60">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-bold flex items-center gap-1.5 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-red-500" />
              <span>Select F1 Grand Prix Circuit ({selectedGameFilter === 'f1_24' ? 'F1® 24' : selectedGameFilter === 'f1_26' ? 'F1® 26' : 'F1® 25'}):</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedTrackFilter('all');
                onTrackChange('all');
              }}
              className={`text-xs font-bold px-2.5 py-0.5 rounded-lg transition-colors cursor-pointer border ${
                selectedTrackFilter === 'all'
                  ? 'bg-red-600 text-white border-red-500 shadow-sm'
                  : 'text-slate-400 hover:text-white border-slate-800 hover:border-slate-700'
              }`}
            >
              All Circuits
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            {availableTracks.map((track) => {
              const isCurrent = selectedTrackFilter.toLowerCase() === track.id.toLowerCase();
              const flag = getTrackFlagEmoji(track.id, track.country || TRACKS[track.id]?.country);
              const trackSetupsCount = setups.filter(
                (s) =>
                  s.trackId.toLowerCase() === track.id.toLowerCase() &&
                  (selectedGameFilter === 'all' || s.gameId.toLowerCase() === selectedGameFilter.toLowerCase())
              ).length;

              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => {
                    setSelectedTrackFilter(track.id);
                    onTrackChange(track.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap flex items-center gap-1.5 transition-all border cursor-pointer ${
                    isCurrent
                      ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white border-red-400 shadow-md shadow-red-600/30 ring-1 ring-red-400/50'
                      : 'bg-slate-950/80 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-sm">{flag}</span>
                  <span>{track.name.split('(')[0].trim()}</span>
                  {trackSetupsCount > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isCurrent ? 'bg-red-950/80 text-red-100 border border-red-400/40' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {trackSetupsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* F1 BROADCAST CIRCUIT INFO BANNER (When track is selected) */}
          {selectedTrackFilter !== 'all' && TRACKS[selectedTrackFilter] && (
            <div className="mt-3 p-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-l-4 border-l-red-600 border border-slate-800 rounded-xl relative overflow-hidden shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-3">
                <span className="text-3xl sm:text-4xl drop-shadow-md">
                  {getTrackFlagEmoji(selectedTrackFilter, TRACKS[selectedTrackFilter].country)}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-red-400 bg-red-500/15 px-2 py-0.5 rounded border border-red-500/30">
                      Official Grand Prix Circuit
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {TRACKS[selectedTrackFilter].country}
                    </span>
                  </div>
                  <h2 className="text-sm sm:text-base font-black text-white tracking-tight mt-0.5">
                    {TRACKS[selectedTrackFilter].name}
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-lg text-center">
                  <span className="text-[9px] text-slate-400 block font-sans uppercase font-bold">Length</span>
                  <span className="text-slate-100 font-bold">{TRACKS[selectedTrackFilter].lengthKm}</span>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-lg text-center">
                  <span className="text-[9px] text-slate-400 block font-sans uppercase font-bold">Turns</span>
                  <span className="text-slate-100 font-bold">{TRACKS[selectedTrackFilter].turnCount} Corners</span>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-lg text-center">
                  <span className="text-[9px] text-slate-400 block font-sans uppercase font-bold">F1 Lap Record</span>
                  <span className="text-emerald-400 font-bold">{TRACKS[selectedTrackFilter].lapRecord}</span>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-lg text-center">
                  <span className="text-[9px] text-slate-400 block font-sans uppercase font-bold">Record Holder</span>
                  <span className="text-sky-300 font-bold truncate block">{TRACKS[selectedTrackFilter].recordHolder}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Free-typing Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="marketplace-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by setup title, author, track name, or driving notes..."
              className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Track Filter */}
          <div className="md:col-span-3">
            <select
              id="marketplace-track-filter"
              value={selectedTrackFilter}
              onChange={(e) => setSelectedTrackFilter(e.target.value)}
              className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-semibold focus:outline-none focus:border-sky-500"
            >
              <option value="all">🏁 All F1 Circuits ({availableTracks.length})</option>
              {availableTracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {getTrackFlagEmoji(t.id, t.country || TRACKS[t.id]?.country)} {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Clean Input Device Filter: Wheel, Gamepad, Keyboard */}
          <div className="md:col-span-2">
            <select
              id="marketplace-device-filter"
              value={selectedDeviceFilter}
              onChange={(e) => setSelectedDeviceFilter(e.target.value as any)}
              className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-semibold focus:outline-none focus:border-sky-500"
            >
              <option value="All">🎮 All Controllers</option>
              <option value="Wheel">🏎️ Wheel / Direct Drive</option>
              <option value="Gamepad">🎮 Gamepad / Controller</option>
              <option value="Keyboard">⌨️ Keyboard</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div className="md:col-span-2">
            <select
              id="marketplace-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-semibold focus:outline-none focus:border-sky-500"
            >
              <option value="rating">⭐ Highest Rated</option>
              <option value="laptime">⚡ Fastest Lap Time</option>
              <option value="newest">🕒 Recently Added</option>
            </select>
          </div>
        </div>

        {/* Secondary Quick Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Condition Filters */}
            <span className="text-[11px] text-slate-500 font-bold uppercase mr-1">Track Condition:</span>
            {(['All', 'Dry', 'Wet'] as const).map((cond) => (
              <button
                key={cond}
                type="button"
                onClick={() => setSelectedCondition(cond)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  selectedCondition === cond
                    ? cond === 'Dry'
                      ? 'bg-amber-500 text-slate-950'
                      : cond === 'Wet'
                      ? 'bg-sky-500 text-slate-950'
                      : 'bg-slate-700 text-white'
                    : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cond === 'Dry' ? '☀️ Dry Weather' : cond === 'Wet' ? '🌧️ Wet Weather' : 'All'}
              </button>
            ))}

            {/* Session Type */}
            <span className="text-[11px] text-slate-500 font-bold uppercase ml-2 mr-1">Setup Type:</span>
            {(['All', 'Qualifying', 'Race', 'Time Trial'] as const).map((typ) => (
              <button
                key={typ}
                type="button"
                onClick={() => setSelectedType(typ)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedType === typ
                    ? 'bg-sky-600 text-white font-bold'
                    : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {typ === 'Qualifying' ? 'Qualifying' : typ === 'Race' ? 'Race Pace' : typ === 'Time Trial' ? 'Time Trial' : 'All'}
              </button>
            ))}

            {/* Verification Status */}
            <span className="text-[11px] text-slate-500 font-bold uppercase ml-2 mr-1">Verification:</span>
            {(['All', 'Verified', 'Pending'] as const).map((ver) => (
              <button
                key={ver}
                type="button"
                onClick={() => setSelectedVerificationFilter(ver)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  selectedVerificationFilter === ver
                    ? ver === 'Verified'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : ver === 'Pending'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-700 text-white'
                    : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {ver === 'Verified' ? (
                  <>
                    <ShieldCheck className="w-3 h-3 text-slate-950" />
                    <span>Admin Verified</span>
                  </>
                ) : ver === 'Pending' ? (
                  <>
                    <Clock className="w-3 h-3 text-slate-950" />
                    <span>Pending</span>
                  </>
                ) : (
                  'All'
                )}
              </button>
            ))}
          </div>

          {/* Quick Filter Toggles */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Saved Favorites Quick Toggle */}
            <button
              type="button"
              id="favorites-quick-filter-btn"
              onClick={() => {
                if (viewMode === 'favorites') {
                  handleSetViewMode('all');
                } else {
                  handleSetViewMode('favorites');
                }
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border cursor-pointer ${
                viewMode === 'favorites'
                  ? 'bg-amber-500/25 text-amber-300 border-amber-500/60 shadow-sm'
                  : 'bg-slate-950/70 text-slate-400 hover:text-amber-300 border-slate-800'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${viewMode === 'favorites' ? 'fill-amber-400 text-amber-400' : 'text-amber-400'}`} />
              <span>Favorites ({favoritesList.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* SETUP CARDS GRID */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 flex-wrap gap-2">
          <span>
            Showing <strong className="text-white">{filteredSetups.length}</strong> {viewMode === 'favorites' ? 'saved favorite' : ''} setups
          </span>
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              id="viewmode-all-btn"
              onClick={() => handleSetViewMode('all')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                viewMode === 'all' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Setups
            </button>
            <button
              type="button"
              id="viewmode-favorites-btn"
              onClick={() => handleSetViewMode('favorites')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'favorites' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${viewMode === 'favorites' ? 'fill-slate-950' : 'text-amber-400'}`} />
              <span>Saved Favorites ({favoritesList.length})</span>
            </button>
            {currentUser && (
              <button
                type="button"
                id="viewmode-mysetups-btn"
                onClick={() => handleSetViewMode('my-setups')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  viewMode === 'my-setups' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                My Setups ({setups.filter((s) => s.creatorUsername.toLowerCase() === currentUser.username.toLowerCase()).length})
              </button>
            )}
          </div>
        </div>

        {filteredSetups.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            {viewMode === 'favorites' ? (
              <>
                <Bookmark className="w-12 h-12 text-amber-400/60 mx-auto" />
                <h3 className="text-base font-bold text-white">No Saved Favorites Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Click the bookmark button on any setup card to save your favorite esports tunes and access them here instantly.
                </p>
                <button
                  type="button"
                  id="browse-all-setups-btn"
                  onClick={() => handleSetViewMode('all')}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white shadow-lg cursor-pointer"
                >
                  Browse All Setups
                </button>
              </>
            ) : (
              <>
                <Car className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No Setups Found</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Try adjusting your search keywords, track circuit, weather condition, or controller filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGameFilter('all');
                    setSelectedTrackFilter('all');
                    setSelectedCondition('All');
                    setSelectedDeviceFilter('All');
                    setSearchQuery('');
                    handleSetViewMode('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-sky-400 hover:text-sky-300 cursor-pointer"
                >
                  Reset Filters
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSetups.map((setup) => {
              const gameObj = SIM_GAMES.find((g) => g.id === setup.gameId);
              const trackDisplayName = getDisplayTrackName(setup);
              const isCopied = copiedId === setup.id;
              const hasVisualScreenshots = Boolean(setup.setupScreenshots && setup.setupScreenshots.length > 0);
              const isFavorited = favoritesList.includes(setup.id);

              return (
                <div
                  key={setup.id}
                  className={`bg-slate-900/90 border rounded-2xl p-4 transition-all duration-200 space-y-3.5 relative flex flex-col justify-between hover:border-slate-700 shadow-md ${
                    setup.id === newlySubmittedId
                      ? 'ring-2 ring-sky-500 border-sky-500/80 bg-slate-900'
                      : isFavorited
                      ? 'border-amber-500/40 bg-slate-900/95 shadow-amber-950/20'
                      : 'border-slate-800/90 hover:shadow-xl'
                  }`}
                >
                  {/* Card Header: Track, Game, Badges & Bookmark Action */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-sky-300 flex items-center gap-1 truncate border border-slate-700/60">
                        <span>{gameObj?.icon || '🏎️'}</span>
                        <span className="truncate">{gameObj?.name || setup.gameId.toUpperCase()}</span>
                      </span>

                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {/* Input Device Badge */}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700/60 flex items-center gap-1">
                          <span>{setup.inputDevice === 'Gamepad' ? '🎮' : setup.inputDevice === 'Keyboard' ? '⌨️' : '🏎️'}</span>
                          <span>
                            {setup.inputDevice === 'Gamepad'
                              ? 'Gamepad'
                              : setup.inputDevice === 'Keyboard'
                              ? 'Keyboard'
                              : 'Wheel'}
                          </span>
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            setup.condition === 'Dry'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                          }`}
                        >
                          {setup.condition === 'Dry' ? '☀️ Dry' : '🌧️ Wet'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60">
                          {setup.type === 'Qualifying'
                            ? 'Qualifying'
                            : setup.type === 'Race'
                            ? 'Race Pace'
                            : 'Time Trial'}
                        </span>

                        {/* Bookmark / Favorite Toggle Button */}
                        <button
                          type="button"
                          id={`bookmark-btn-${setup.id}`}
                          onClick={(e) => handleToggleFav(setup.id, e)}
                          className={`p-1 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                            isFavorited
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 hover:bg-amber-500/30'
                              : 'bg-slate-800/90 text-slate-400 hover:text-amber-400 hover:bg-slate-750 border-slate-700/60'
                          }`}
                          title={isFavorited ? 'Remove from Saved Favorites' : 'Save to Favorites'}
                        >
                          <Bookmark
                            className={`w-3.5 h-3.5 transition-transform ${
                              isFavorited ? 'fill-amber-400 text-amber-400 scale-110' : ''
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Title & Car */}
                    <div>
                      <h3
                        className="font-bold text-sm sm:text-base text-white hover:text-sky-300 transition-colors cursor-pointer line-clamp-1"
                        onClick={() => setInspectingSetup(setup)}
                      >
                        {setup.title}
                      </h3>
                      <div className="flex items-center justify-between gap-1 text-xs text-slate-400 mt-0.5">
                        <span className="text-slate-300 font-semibold truncate">{trackDisplayName}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700/60 font-semibold text-[10px]">
                          F1 Car
                        </span>
                      </div>
                    </div>

                    {/* Proof & Verification Status Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {setup.verificationStatus === 'verified' || setup.isProofVerified ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingProofSetup(setup);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 text-[10px] font-black hover:bg-emerald-500/25 transition-all shadow-sm shadow-emerald-500/20 cursor-pointer animate-pulse"
                          title="Admin Verified - In-Game Telemetry & Lap Proof Validated"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 fill-emerald-500/20" />
                          <span>Admin Verified</span>
                        </button>
                      ) : setup.verificationStatus === 'pending' || (setup.isUserSubmitted && !setup.isProofVerified) ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (setup.proofScreenshot) {
                              setViewingProofSetup(setup);
                            } else {
                              setInspectingSetup(setup);
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold hover:bg-amber-500/25 transition-colors cursor-pointer"
                          title="Pending Admin Verification Review"
                        >
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>Pending Verification</span>
                        </button>
                      ) : setup.verificationStatus === 'rejected' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                          <AlertCircle className="w-3 h-3 text-rose-400" />
                          <span>Verification Rejected</span>
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 text-xs">
                    <div className="flex flex-col justify-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        <User className="w-3 h-3 text-sky-400" />
                        Author
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCreatorUsername(setup.creatorUsername);
                        }}
                        className="flex items-center gap-1.5 mt-0.5 text-left group/author cursor-pointer"
                        title={`View @${setup.creatorUsername}'s Creator Profile`}
                      >
                        <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex-shrink-0">
                          <img
                            src={
                              setup.creatorUsername.toLowerCase() === 'ddlsetup'
                                ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                                : (setup.creatorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(setup.creatorUsername)}`)
                            }
                            alt={setup.creatorUsername}
                            className="w-4 h-4 rounded-full object-cover bg-slate-950"
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-sky-400 group-hover/author:text-sky-300 group-hover/author:underline text-xs truncate block">
                            @{setup.creatorUsername}
                          </span>
                        </div>
                      </button>
                      {setup.creatorBadge && (
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded inline-flex items-center gap-1 mt-0.5 w-fit ${
                            setup.creatorBadge === 'Admin / Founder'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20'
                              : 'text-sky-400 bg-slate-800'
                          }`}
                        >
                          {setup.creatorBadge === 'Admin / Founder' && (
                            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                          )}
                          <span>{setup.creatorBadge}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col justify-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        Best Lap
                      </span>
                      <span className="font-mono font-bold text-emerald-400 text-xs mt-0.5">
                        {setup.bestLapTime}
                      </span>
                      <span className="text-[9px] text-slate-400">{setup.downforceLevel} Wing</span>
                    </div>
                  </div>

                  {/* Rating, Reviews & Quick Rate */}
                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950/80 border border-slate-800/90 text-xs">
                    {/* Star Rating Display & Quick Rate */}
                    <div
                      className="flex items-center gap-1.5 cursor-pointer group/rate"
                      onClick={(e) => handleOpenRate(setup, e)}
                      title="Click to rate this setup (1 to 5 stars)"
                    >
                      <StarRating
                        rating={setup.averageRating}
                        totalRatings={setup.ratingCount}
                        size="sm"
                        interactive={false}
                        showValue={true}
                      />
                      <button
                        type="button"
                        onClick={(e) => handleOpenRate(setup, e)}
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                          setup.userRating
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-800/80 text-slate-300 hover:text-amber-400 hover:bg-slate-750'
                        }`}
                      >
                        {setup.userRating ? `Rated ${setup.userRating}★` : '+ Rate'}
                      </button>
                    </div>

                    {/* Comments / Discussion Counter */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectingSetup(setup);
                        setInspectingModalTab('discussion');
                      }}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-sky-300 border border-slate-800 hover:border-sky-500/40 text-[11px] font-semibold transition-all cursor-pointer group/disc"
                      title="Open Community Discussion & Comments"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-sky-400 group-hover/disc:scale-110 transition-transform" />
                      <span>{getCommentCount(setup.id)}</span>
                      <span className="text-slate-400 font-normal">reviews</span>
                    </button>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={(e) => handleCopySetup(setup, e)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 border cursor-pointer ${
                        isCopied
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border-slate-700'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy Setup</span>
                        </>
                      )}
                    </button>

                    {/* Community Discussion Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectingSetup(setup);
                        setInspectingModalTab('discussion');
                      }}
                      className="text-xs px-2.5 py-1.5 rounded-lg font-medium text-slate-300 hover:text-sky-300 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="View or write comments and tuning discussion"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-sky-400" />
                      <span>Discuss ({getCommentCount(setup.id)})</span>
                    </button>

                    {/* Creator / Admin Actions: Edit & Delete Buttons */}
                    {isSetupCreator(setup) && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          id={`edit-setup-btn-${setup.id}`}
                          onClick={(e) => handleOpenEdit(setup, e)}
                          className="text-xs px-2.5 py-1.5 text-amber-300 hover:text-amber-100 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg font-medium transition-colors flex items-center gap-1 cursor-pointer"
                          title="Edit setup parameters, lap time, wing angles, or notes"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          id={`delete-setup-btn-${setup.id}`}
                          onClick={(e) => handleDeleteClick(setup, e)}
                          className="text-xs px-2 py-1.5 text-rose-400 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg font-medium transition-colors flex items-center gap-1 cursor-pointer"
                          title="Delete Setup"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setInspectingSetup(setup);
                        setInspectingModalTab('specs');
                      }}
                      className="text-xs px-3 py-1.5 text-white bg-sky-600 hover:bg-sky-500 rounded-lg font-bold transition-all shadow flex items-center gap-1 cursor-pointer ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SETUP INSPECTION MODAL (WITH COACH DAVE ACADEMY VISUAL SCREENSHOT VIEWER) */}
      {inspectingSetup && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
          onClick={() => setInspectingSetup(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl space-y-4 text-slate-100 max-h-[94vh] flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
            id="inspect-setup-dialog"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    {SIM_GAMES.find((g) => g.id === inspectingSetup.gameId)?.name || inspectingSetup.gameId.toUpperCase()}
                  </span>
                  <span className="text-xs font-bold text-slate-300">
                    {getDisplayTrackName(inspectingSetup)}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-xl font-black text-white tracking-tight">
                    {inspectingSetup.title}
                  </h2>
                  {inspectingSetup.verificationStatus === 'verified' || inspectingSetup.isProofVerified ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shadow-sm shadow-emerald-500/20 animate-pulse">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 fill-emerald-500/20" />
                      Admin Verified
                    </span>
                  ) : inspectingSetup.verificationStatus === 'pending' || (inspectingSetup.isUserSubmitted && !inspectingSetup.isProofVerified) ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      Pending Verification
                    </span>
                  ) : inspectingSetup.verificationStatus === 'rejected' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                      Verification Rejected
                    </span>
                  ) : null}
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                  <span>Vehicle: <strong className="text-slate-200">F1 Car</strong></span>
                  <span>•</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span>Author:</span>
                    <button
                      type="button"
                      onClick={() => setSelectedCreatorUsername(inspectingSetup.creatorUsername)}
                      className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-bold hover:underline cursor-pointer"
                      title={`View @${inspectingSetup.creatorUsername}'s Creator Profile`}
                    >
                      <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex-shrink-0">
                        <img
                          src={
                            inspectingSetup.creatorUsername.toLowerCase() === 'ddlsetup'
                              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                              : (inspectingSetup.creatorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(inspectingSetup.creatorUsername)}`)
                          }
                          alt={inspectingSetup.creatorUsername}
                          className="w-4 h-4 rounded-full bg-slate-950 object-cover"
                        />
                      </div>
                      <span>@{inspectingSetup.creatorUsername}</span>
                    </button>
                    {inspectingSetup.creatorBadge && (
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded inline-flex items-center gap-1 ${
                          inspectingSetup.creatorBadge === 'Admin / Founder'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20'
                            : 'text-sky-400 bg-slate-800'
                        }`}
                      >
                        {inspectingSetup.creatorBadge === 'Admin / Founder' && (
                          <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                        )}
                        <span>{inspectingSetup.creatorBadge}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Bookmark Button in Inspect Header */}
                <button
                  type="button"
                  id="inspect-header-bookmark-btn"
                  onClick={() => handleToggleFav(inspectingSetup.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                    favoritesList.includes(inspectingSetup.id)
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                      : 'bg-slate-800 text-slate-300 hover:text-amber-400 border-slate-700 hover:border-slate-600'
                  }`}
                  title={favoritesList.includes(inspectingSetup.id) ? 'Remove from Saved Favorites' : 'Save to Favorites'}
                >
                  <Bookmark
                    className={`w-3.5 h-3.5 ${
                      favoritesList.includes(inspectingSetup.id) ? 'fill-amber-400 text-amber-400' : ''
                    }`}
                  />
                  <span>{favoritesList.includes(inspectingSetup.id) ? 'Saved' : 'Bookmark'}</span>
                </button>

                {isSetupCreator(inspectingSetup) && (
                  <button
                    type="button"
                    id="inspect-header-delete-btn"
                    onClick={() => handleDeleteClick(inspectingSetup)}
                    className="px-2.5 py-1 text-rose-400 hover:text-rose-200 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Delete Setup"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setInspectingSetup(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Metrics Header */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs flex-shrink-0">
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Best Lap</div>
                <div className="font-mono font-bold text-emerald-400 text-sm mt-0.5">
                  {inspectingSetup.bestLapTime}
                </div>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Condition &amp; Type</div>
                <div className="text-xs font-semibold text-slate-200 mt-0.5 truncate">
                  {inspectingSetup.condition === 'Dry' ? 'Dry Weather' : 'Wet Weather'} • {inspectingSetup.type}
                </div>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Aero Downforce</div>
                <div className="text-xs font-semibold text-slate-200 mt-0.5">
                  {inspectingSetup.downforceLevel} Wing
                </div>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Input Device</div>
                <div className="text-xs font-semibold text-slate-200 mt-0.5 truncate">
                  {inspectingSetup.inputDevice || 'Wheel'}
                </div>
              </div>
              <div className="col-span-2 sm:col-span-1 bg-slate-950/70 p-2 rounded-xl border border-slate-800 flex items-center justify-between sm:flex-col sm:items-start gap-1">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Rating &amp; Reviews</div>
                  <div className="mt-0.5">
                    <StarRating
                      rating={inspectingSetup.averageRating}
                      totalRatings={inspectingSetup.ratingCount}
                      size="sm"
                      interactive={false}
                      showValue={true}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenRate(inspectingSetup)}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-1 shadow-sm cursor-pointer transition-all"
                >
                  <Star className="w-3 h-3 fill-slate-950" />
                  <span>{inspectingSetup.userRating ? `Rated ${inspectingSetup.userRating}★` : 'Rate'}</span>
                </button>
              </div>
            </div>

            {/* Modal Navigation Tabs: Specs vs Discussion */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setInspectingModalTab('specs')}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border ${
                  inspectingModalTab === 'specs'
                    ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-600/20'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-750'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Tuning Parameters &amp; Specs</span>
              </button>

              <button
                type="button"
                onClick={() => setInspectingModalTab('discussion')}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border ${
                  inspectingModalTab === 'discussion'
                    ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-600/20'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-750'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                <span>Community Discussion &amp; Reviews</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    inspectingModalTab === 'discussion' ? 'bg-sky-700 text-white' : 'bg-slate-800 text-sky-300'
                  }`}
                >
                  {getCommentCount(inspectingSetup.id)}
                </span>
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
              {inspectingModalTab === 'discussion' ? (
                <div className="space-y-4 py-1">
                  <SetupDiscussion
                    setup={inspectingSetup}
                    comments={comments}
                    currentUser={currentUser}
                    onOpenAuth={onOpenAuth}
                    onAddComment={handleAddComment}
                    onLikeComment={handleLikeComment}
                    onSelectCreator={(authorUsername) => {
                      setInspectingSetup(null);
                      setSelectedCreatorUsername(authorUsername);
                    }}
                  />
                </div>
              ) : (
                <div className="space-y-4">

                  {/* Lap Time Verification Proof */}
                  {inspectingSetup.isProofVerified && inspectingSetup.proofScreenshot && (
                    <div className="p-3.5 bg-slate-950/80 rounded-xl border border-emerald-500/40 space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wide">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>Verified Lap Time Telemetry</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                          ✓ Verified Lap
                        </span>
                      </div>

                      <div
                        className="relative rounded-xl overflow-hidden border border-slate-700 bg-black/60 group cursor-pointer max-h-52 flex items-center justify-center"
                        onClick={() => setViewingProofSetup(inspectingSetup)}
                        title="Click to inspect telemetry proof"
                      >
                        <img
                          src={inspectingSetup.proofScreenshot}
                          alt={`Lap proof for ${inspectingSetup.title}`}
                          className="w-full h-auto max-h-52 object-contain group-hover:scale-[1.01] transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="px-3 py-1.5 rounded-lg bg-sky-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg">
                            <Camera className="w-3.5 h-3.5" />
                            <span>Enlarge Telemetry Proof</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Numerical Setup Sliders Breakdown */}
                  <div className="space-y-3">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Car Setup Tuning Parameters
                    </div>

                    {/* 1. Aerodynamics */}
                    <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                      <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider mb-2 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span>1. Aerodynamics</span>
                          <span className="text-[10px] text-slate-500 font-normal normal-case">(Wings: 0 - 50)</span>
                        </div>
                        <span className="text-slate-400 text-[10px] font-mono">
                          Wing Balance Ratio: {inspectingSetup.specs.frontWing} / {inspectingSetup.specs.rearWing}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 font-mono">
                        <div className="bg-slate-900 p-2 rounded-lg flex justify-between">
                          <span className="text-slate-400">Front Wing Aero:</span>
                          <span className="text-white font-bold">{inspectingSetup.specs.frontWing}</span>
                        </div>
                        <div className="bg-slate-900 p-2 rounded-lg flex justify-between">
                          <span className="text-slate-400">Rear Wing Aero:</span>
                          <span className="text-white font-bold">{inspectingSetup.specs.rearWing}</span>
                        </div>
                      </div>
                    </div>

                    {/* 2. Transmission / Differential */}
                    <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                      <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider mb-2 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span>2. Transmission</span>
                          <span className="text-[10px] text-slate-500 font-normal normal-case">(Diff: 10% - 100%)</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 font-mono">
                        <div className="bg-slate-900 p-2 rounded-lg flex justify-between">
                          <span className="text-slate-400">Differential On-Throttle:</span>
                          <span className="text-white font-bold">{inspectingSetup.specs.diffOnThrottle}%</span>
                        </div>
                        <div className="bg-slate-900 p-2 rounded-lg flex justify-between">
                          <span className="text-slate-400">Differential Off-Throttle:</span>
                          <span className="text-white font-bold">{inspectingSetup.specs.diffOffThrottle}%</span>
                        </div>
                      </div>
                    </div>

                    {/* 3. Suspension Geometry */}
                    <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                      <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider mb-2 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span>3. Suspension Geometry</span>
                          <span className="text-[10px] text-slate-500 font-normal normal-case">(Camber &amp; Toe Angles)</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                        <div className="bg-slate-900 p-2 rounded-lg">
                          <div className="text-[10px] text-slate-400">Front Camber</div>
                          <div className="text-white font-bold">{inspectingSetup.specs.frontCamber}°</div>
                        </div>
                        <div className="bg-slate-900 p-2 rounded-lg">
                          <div className="text-[10px] text-slate-400">Rear Camber</div>
                          <div className="text-white font-bold">{inspectingSetup.specs.rearCamber}°</div>
                        </div>
                        <div className="bg-slate-900 p-2 rounded-lg">
                          <div className="text-[10px] text-slate-400">Front Toe-Out</div>
                          <div className="text-white font-bold">{inspectingSetup.specs.frontToe}°</div>
                        </div>
                        <div className="bg-slate-900 p-2 rounded-lg">
                          <div className="text-[10px] text-slate-400">Rear Toe-In</div>
                          <div className="text-white font-bold">{inspectingSetup.specs.rearToe}°</div>
                        </div>
                      </div>
                    </div>

                    {/* 4. Suspension, Anti-Roll Bars & Ride Height */}
                    <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                      <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider mb-2 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span>4. Suspension &amp; Anti-Roll Bars</span>
                          <span className="text-[10px] text-slate-500 font-normal normal-case">(Springs 1-41, ARBs 1-21, Ride Height 10-60)</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono">
                        <div className="bg-slate-900 p-2 rounded-lg">
                          <div className="text-[10px] text-slate-400">Front Suspension</div>
                          <div className="text-white font-bold">{inspectingSetup.specs.frontSuspension}</div>
                        </div>
                        <div className="bg-slate-900 p-2 rounded-lg">
                          <div className="text-[10px] text-slate-400">Rear Suspension</div>
                          <div className="text-white font-bold">{inspectingSetup.specs.rearSuspension}</div>
                        </div>
                        <div className="bg-slate-900 p-2 rounded-lg">
                          <div className="text-[10px] text-slate-400">Front Anti-Roll Bar</div>
                          <div className="text-white font-bold">{inspectingSetup.specs.frontAntiRollBar}</div>
                        </div>
                        <div className="bg-slate-900 p-2 rounded-lg">
                          <div className="text-[10px] text-slate-400">Rear Anti-Roll Bar</div>
                          <div className="text-white font-bold">{inspectingSetup.specs.rearAntiRollBar}</div>
                        </div>
                        <div className="bg-slate-900 p-2 rounded-lg">
                          <div className="text-[10px] text-slate-400">Front Ride Height</div>
                          <div className="text-white font-bold">{inspectingSetup.specs.frontRideHeight}</div>
                        </div>
                        <div className="bg-slate-900 p-2 rounded-lg">
                          <div className="text-[10px] text-slate-400">Rear Ride Height</div>
                          <div className="text-white font-bold">{inspectingSetup.specs.rearRideHeight}</div>
                        </div>
                      </div>
                    </div>

                    {/* 5. Brakes */}
                    <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                      <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider mb-2 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span>5. Brakes</span>
                          <span className="text-[10px] text-slate-500 font-normal normal-case">(Pressure 80-100%, Bias 50-70%)</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 font-mono">
                        <div className="bg-slate-900 p-2 rounded-lg flex justify-between">
                          <span className="text-slate-400">Brake Pressure:</span>
                          <span className="text-white font-bold">{inspectingSetup.specs.brakePressure}%</span>
                        </div>
                        <div className="bg-slate-900 p-2 rounded-lg flex justify-between">
                          <span className="text-slate-400">Front Brake Bias:</span>
                          <span className="text-white font-bold">{inspectingSetup.specs.brakeBias}%</span>
                        </div>
                      </div>
                    </div>

                    {/* 6. Tyre Pressures */}
                    <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                      <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider mb-2 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span>6. Tyre Pressures</span>
                          <span className="text-[10px] text-slate-500 font-normal normal-case">(20.0 - 30.0 PSI)</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 font-mono">
                        <div className="bg-slate-900 p-2 rounded-lg flex justify-between">
                          <span className="text-slate-400">Front Left Tyre:</span>
                          <span className="text-white font-bold">{inspectingSetup.specs.flPressure} psi</span>
                        </div>
                        <div className="bg-slate-900 p-2 rounded-lg flex justify-between">
                          <span className="text-slate-400">Front Right Tyre:</span>
                          <span className="text-white font-bold">{inspectingSetup.specs.frPressure} psi</span>
                        </div>
                        <div className="bg-slate-900 p-2 rounded-lg flex justify-between">
                          <span className="text-slate-400">Rear Left Tyre:</span>
                          <span className="text-white font-bold">{inspectingSetup.specs.rlPressure} psi</span>
                        </div>
                        <div className="bg-slate-900 p-2 rounded-lg flex justify-between">
                          <span className="text-slate-400">Rear Right Tyre:</span>
                          <span className="text-white font-bold">{inspectingSetup.specs.rrPressure} psi</span>
                        </div>
                      </div>
                    </div>

                    {/* Creator Notes */}
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-slate-300">
                      <span className="font-bold text-slate-400 block mb-1">Creator Driving Notes:</span>
                      <p className="italic">{inspectingSetup.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex justify-between items-center gap-2 pt-3 border-t border-slate-800 flex-shrink-0 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="inspect-copy-btn"
                  onClick={() => handleCopySetup(inspectingSetup)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedId === inspectingSetup.id ? (
                    <>
                      <CheckCheck className="w-4 h-4 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-400" />
                      <span>Copy Setup</span>
                    </>
                  )}
                </button>

                {/* Bookmark Button in Modal Footer */}
                <button
                  type="button"
                  id="inspect-footer-bookmark-btn"
                  onClick={() => handleToggleFav(inspectingSetup.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                    favoritesList.includes(inspectingSetup.id)
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                      : 'bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-amber-400 border-slate-700'
                  }`}
                  title={favoritesList.includes(inspectingSetup.id) ? 'Remove from Saved Favorites' : 'Save to Favorites'}
                >
                  <Bookmark
                    className={`w-4 h-4 ${
                      favoritesList.includes(inspectingSetup.id) ? 'fill-amber-400 text-amber-400' : 'text-amber-400'
                    }`}
                  />
                  <span>{favoritesList.includes(inspectingSetup.id) ? 'Saved Favorite' : 'Save Favorite'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {isSetupCreator(inspectingSetup) && (
                  <>
                    <button
                      type="button"
                      id="inspect-footer-edit-btn"
                      onClick={() => handleOpenEdit(inspectingSetup)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-300 hover:text-white bg-amber-500/15 hover:bg-amber-600/80 border border-amber-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Edit this setup"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Setup</span>
                    </button>
                    <button
                      type="button"
                      id="inspect-footer-delete-btn"
                      onClick={() => handleDeleteClick(inspectingSetup)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/15 hover:bg-rose-600/80 border border-rose-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setInspectingSetup(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  id="inspect-export-btn"
                  onClick={() => handleDownloadFile(inspectingSetup)}
                  disabled={isExportingId === inspectingSetup.id}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 flex items-center gap-1.5 shadow-md shadow-sky-600/30 transition-colors disabled:opacity-75 cursor-pointer"
                >
                  {isExportingId === inspectingSetup.id ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Exporting Image...</span>
                    </>
                  ) : downloadedId === inspectingSetup.id ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Exported</span>
                    </>
                  ) : (
                    <>
                      <FileImage className="w-4 h-4" />
                      <span>Export Setup Sheet (PNG)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN SCREENSHOT LIGHTBOX MODAL */}
      {fullscreenScreenshot && (
        <div
          className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setFullscreenScreenshot(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white text-sm">{fullscreenScreenshot.title}</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                  {fullscreenScreenshot.category}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFullscreenScreenshot(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-800 bg-black max-h-[75vh] flex items-center justify-center">
              <img
                src={fullscreenScreenshot.imageUrl}
                alt={fullscreenScreenshot.title}
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>

            {fullscreenScreenshot.notes && (
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 italic">
                "{fullscreenScreenshot.notes}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* VERIFIED LAP PROOF LIGHTBOX */}
      {viewingProofSetup && viewingProofSetup.proofScreenshot && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setViewingProofSetup(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-5 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Verified Lap Time Telemetry</span>
                </div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {viewingProofSetup.title} • <span className="font-mono text-emerald-400">{viewingProofSetup.bestLapTime}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingProofSetup(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-800 bg-black max-h-[70vh] flex items-center justify-center">
              <img
                src={viewingProofSetup.proofScreenshot}
                alt="Lap Proof Screenshot"
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT / EDIT SETUP MODAL */}
      <SubmitSetupModal
        activeGameId={selectedGameFilter !== 'all' ? selectedGameFilter : activeGame.id}
        defaultTrackId={activeTrackId}
        currentUser={currentUser}
        isOpen={isSubmitModalOpen}
        setupToEdit={editingSetup}
        onUpdate={handleSetupUpdated}
        onClose={() => {
          setIsSubmitModalOpen(false);
          setEditingSetup(null);
          if (onCloseExternalSubmit) onCloseExternalSubmit();
        }}
        onSubmit={handleSetupSubmitted}
      />

      {/* RATE SETUP MODAL */}
      {ratingModalSetup && (
        <div
          className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setRatingModalSetup(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 text-slate-100"
            onClick={(e) => e.stopPropagation()}
            id="rate-setup-dialog"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <h3 className="font-bold text-base text-white">Rate &amp; Review Setup</h3>
              </div>
              <button
                type="button"
                onClick={() => setRatingModalSetup(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="font-bold text-slate-100 line-clamp-1">{ratingModalSetup.title}</div>
              <div className="text-slate-400 flex items-center gap-2">
                <span className="font-semibold text-slate-300">{getDisplayTrackName(ratingModalSetup)}</span>
                <span>•</span>
                <span className="font-mono text-emerald-400 font-bold">{ratingModalSetup.bestLapTime}</span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-1">
                <span>Current Score:</span>
                {ratingModalSetup.ratingCount > 0 ? (
                  <>
                    <span className="text-amber-400 font-bold">{ratingModalSetup.averageRating.toFixed(1)} / 5</span>
                    <span className="text-slate-500">({ratingModalSetup.ratingCount} {ratingModalSetup.ratingCount === 1 ? 'review' : 'reviews'})</span>
                  </>
                ) : (
                  <span className="text-slate-400 italic">No reviews yet (Be the first to rate!)</span>
                )}
              </div>
            </div>

            <div className="text-center py-2 space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Select Your Rating:
              </span>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserSelectedStars(star)}
                    className="p-1.5 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= userSelectedStars
                          ? 'fill-amber-400 text-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                          : 'fill-slate-800 text-slate-700 hover:text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="text-xs font-bold text-amber-300 min-h-[20px]">
                {userSelectedStars === 5 && '🌟 5 Stars — Esports Elite Pace & Maximum Stability'}
                {userSelectedStars === 4 && '⚡ 4 Stars — Great Handling & Fast Lap Times'}
                {userSelectedStars === 3 && '👍 3 Stars — Solid Baseline Setup'}
                {userSelectedStars === 2 && '⚠️ 2 Stars — Understeer or Kerb Instability'}
                {userSelectedStars === 1 && '❌ 1 Star — Needs Major Rework'}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setRatingModalSetup(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-submit-rating-btn"
                onClick={handleConfirmRating}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Star className="w-3.5 h-3.5 fill-slate-950" />
                <span>Submit {userSelectedStars}★ Review</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR DELETING SETUP */}
      {setupToDelete && (
        <div
          className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setSetupToDelete(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 text-slate-100"
            onClick={(e) => e.stopPropagation()}
            id="delete-setup-confirmation-dialog"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Delete Setup</h3>
                <p className="text-xs text-slate-400">Are you sure you want to permanently delete this setup?</p>
              </div>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="font-bold text-slate-100 line-clamp-1">{setupToDelete.title}</div>
              <div className="text-slate-400 flex items-center gap-2">
                <span className="font-semibold text-slate-300">{getDisplayTrackName(setupToDelete)}</span>
                <span>•</span>
                <span className="font-mono text-emerald-400 font-bold">{setupToDelete.bestLapTime}</span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <span>Author:</span>
                <span className="text-sky-400 font-semibold">@{setupToDelete.creatorUsername}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              This action cannot be undone. The setup, its telemetry data, and associated ratings will be permanently removed from the public marketplace.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSetupToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-setup-btn"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATOR PROFILE & USER SETUP HISTORY MODAL */}
      {selectedCreatorUsername && (
        <CreatorProfileModal
          username={selectedCreatorUsername}
          isOpen={!!selectedCreatorUsername}
          onClose={() => setSelectedCreatorUsername(null)}
          allSetups={setups}
          favoritesList={favoritesList}
          onToggleFavorite={handleToggleFav}
          onInspectSetup={(setupToInspect) => {
            setSelectedCreatorUsername(null);
            setInspectingSetup(setupToInspect);
          }}
          onDeleteSetup={onDeleteSetup}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};
