import React, { useState } from 'react';
import { SimGame, CarSetup, UserAccount, SupportedF1GameId, VerificationStatus, FloatingBannerConfig } from './types';
import { SIM_GAMES, INITIAL_SETUPS } from './data/mockData';
import { DEFAULT_FLOATING_BANNER_CONFIG } from './data/bannerConfig';
import { SetupMarketplace } from './components/SetupMarketplace';
import { AuthBarrier } from './components/AuthBarrier';
import { AuthModal } from './components/AuthModal';
import { DesktopHeader } from './components/DesktopHeader';
import { AdminVerificationPanel } from './components/AdminVerificationPanel';
import { FloatingBanner } from './components/FloatingBanner';
import { BannerConfigModal } from './components/BannerConfigModal';

export default function App() {
  // Active game selected in the marketplace (defaults to F1 25)
  const [activeGame, setActiveGame] = useState<SimGame>(SIM_GAMES[0]);
  const [activeTrackId, setActiveTrackId] = useState<string>('spa');
  const [activeViewMode, setActiveViewMode] = useState<'all' | 'favorites' | 'my-setups'>('all');

  // Favorites / Bookmarks state persisted in localStorage
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('sim_marketplace_favorites');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read saved favorites', e);
    }
    return [];
  });

  const handleToggleFavorite = (setupId: string) => {
    setFavoriteIds((prev) => {
      const isFav = prev.includes(setupId);
      const updated = isFav ? prev.filter((id) => id !== setupId) : [...prev, setupId];
      try {
        localStorage.setItem('sim_marketplace_favorites', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not persist favorites', e);
      }
      return updated;
    });
  };

  // Switch game tab instantly between F1 25 and F1 26
  const handleSelectGameById = (gameId: SupportedF1GameId) => {
    const matched = SIM_GAMES.find((g) => g.id === gameId);
    if (matched) {
      setActiveGame(matched);
    }
    setActiveViewMode('all');
  };

  // Switch to Favorites tab from header
  const handleSelectFavorites = () => {
    setActiveViewMode('favorites');
  };

  // Authentication state (Mandatory barrier when null)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const stored = localStorage.getItem('sim_marketplace_current_user');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not restore user session', e);
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isSubmitModalTriggered, setIsSubmitModalTriggered] = useState<boolean>(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(false);
  const [isBannerConfigOpen, setIsBannerConfigOpen] = useState<boolean>(false);

  // Floating Banner / Ad Box state persisted in localStorage
  const [bannerConfig, setBannerConfig] = useState<FloatingBannerConfig>(() => {
    try {
      const stored = localStorage.getItem('ddl_floating_banner_config');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read saved banner config', e);
    }
    return DEFAULT_FLOATING_BANNER_CONFIG;
  });

  const handleSaveBannerConfig = (updated: FloatingBannerConfig) => {
    setBannerConfig(updated);
    try {
      localStorage.setItem('ddl_floating_banner_config', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not persist banner config', e);
    }
  };

  // Setups state (seeded with initial community setups, merged with user-submitted ones and user ratings)
  const [setups, setSetups] = useState<CarSetup[]>(() => {
    let baseList = INITIAL_SETUPS;
    try {
      const stored = localStorage.getItem('sim_marketplace_custom_setups');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          baseList = [...parsed, ...INITIAL_SETUPS];
        }
      }
    } catch (e) {
      console.warn('Could not read saved setups', e);
    }

    try {
      const storedRatings = localStorage.getItem('sim_marketplace_user_ratings');
      if (storedRatings) {
        const parsedRatings = JSON.parse(storedRatings);
        baseList = baseList.map((s) => {
          if (parsedRatings[s.id]) {
            return {
              ...s,
              averageRating: parsedRatings[s.id].avg,
              ratingCount: parsedRatings[s.id].count,
              userRating: parsedRatings[s.id].rating,
            };
          }
          return s;
        });
      }
    } catch (e) {
      console.warn('Could not read saved ratings', e);
    }

    return baseList;
  });

  // Calculate pending verification submissions for admin badge
  const pendingAdminCount = setups.filter(
    (s) => s.verificationStatus === 'pending' || (!s.verificationStatus && s.isUserSubmitted && !s.isProofVerified)
  ).length;

  // Admin status update handler for verification workflow
  const handleUpdateSetupStatus = (
    setupId: string,
    status: VerificationStatus,
    notes?: string
  ) => {
    setSetups((prev) => {
      const updated = prev.map((s) => {
        if (s.id === setupId) {
          return {
            ...s,
            verificationStatus: status,
            isProofVerified: status === 'verified',
            verificationNotes: notes || s.verificationNotes,
          };
        }
        return s;
      });
      try {
        const userOnly = updated.filter((s) => s.isUserSubmitted);
        localStorage.setItem('sim_marketplace_custom_setups', JSON.stringify(userOnly));
      } catch (e) {
        console.warn('Could not persist setup verification status', e);
      }
      return updated;
    });
  };

  // Handle User Login
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    try {
      localStorage.setItem('sim_marketplace_current_user', JSON.stringify(user));
    } catch (e) {
      console.warn('Could not persist user session', e);
    }
  };

  // Handle User Logout
  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('sim_marketplace_current_user');
    } catch (e) {
      console.warn('Could not clear user session', e);
    }
  };

  // Handle Game change
  const handleGameChange = (game: SimGame) => {
    setActiveGame(game);
  };

  // Handle Track change
  const handleTrackChange = (trackId: string) => {
    setActiveTrackId(trackId);
  };

  // Handle adding a manual setup
  const handleAddSetup = (newSetup: CarSetup) => {
    setSetups((prev) => {
      const updated = [newSetup, ...prev];
      try {
        const userOnly = updated.filter((s) => s.isUserSubmitted);
        localStorage.setItem('sim_marketplace_custom_setups', JSON.stringify(userOnly));
      } catch (e) {
        console.warn('Could not persist custom setups', e);
      }
      return updated;
    });

    // Record setup ID in creator list
    try {
      const raw = localStorage.getItem('sim_marketplace_my_setup_ids');
      const ids: string[] = raw ? JSON.parse(raw) : [];
      if (!ids.includes(newSetup.id)) {
        ids.push(newSetup.id);
        localStorage.setItem('sim_marketplace_my_setup_ids', JSON.stringify(ids));
      }
    } catch (e) {
      console.warn('Could not record setup creator ID', e);
    }

    // Automatically switch game and track to match submitted setup
    const matchedGame = SIM_GAMES.find((g) => g.id === newSetup.gameId);
    if (matchedGame) {
      setActiveGame(matchedGame);
    }
    setActiveTrackId(newSetup.trackId);
  };

  // Handle updating / editing an existing setup
  const handleUpdateSetup = (updatedSetup: CarSetup) => {
    setSetups((prev) => {
      const updated = prev.map((s) => (s.id === updatedSetup.id ? updatedSetup : s));
      try {
        const userOnly = updated.filter((s) => s.isUserSubmitted);
        localStorage.setItem('sim_marketplace_custom_setups', JSON.stringify(userOnly));
      } catch (e) {
        console.warn('Could not persist custom setups after update', e);
      }
      return updated;
    });
  };

  // Handle deleting a setup created by the user
  const handleDeleteSetup = (setupId: string) => {
    setSetups((prev) => {
      const updated = prev.filter((s) => s.id !== setupId);
      try {
        const userOnly = updated.filter((s) => s.isUserSubmitted);
        localStorage.setItem('sim_marketplace_custom_setups', JSON.stringify(userOnly));
      } catch (e) {
        console.warn('Could not persist custom setups after deletion', e);
      }
      return updated;
    });

    try {
      const raw = localStorage.getItem('sim_marketplace_my_setup_ids');
      if (raw) {
        const ids = JSON.parse(raw);
        if (Array.isArray(ids)) {
          const filtered = ids.filter((id: string) => id !== setupId);
          localStorage.setItem('sim_marketplace_my_setup_ids', JSON.stringify(filtered));
        }
      }
    } catch (e) {
      console.warn('Could not update saved setup IDs', e);
    }
  };

  // Handle downloading / exporting setup
  const handleDownloadSetup = (setup: CarSetup) => {
    setSetups((prev) =>
      prev.map((s) => (s.id === setup.id ? { ...s, downloads: s.downloads + 1 } : s))
    );
  };

  // Handle rating a setup dynamically
  const handleRateSetup = (setupId: string, rating: number) => {
    setSetups((prev) => {
      const updated = prev.map((s) => {
        if (s.id === setupId) {
          const hadPreviousRating = Boolean(s.userRating);
          let newCount: number;
          let newAvg: number;

          if (hadPreviousRating && s.userRating) {
            // User is changing their existing rating
            const totalSum = s.averageRating * s.ratingCount - s.userRating + rating;
            newCount = s.ratingCount;
            newAvg = Number((totalSum / Math.max(1, newCount)).toFixed(1));
          } else {
            // New review submitted by user
            newCount = (s.ratingCount || 0) + 1;
            const currentSum = (s.averageRating || 0) * (s.ratingCount || 0);
            newAvg = Number(((currentSum + rating) / newCount).toFixed(1));
          }

          return {
            ...s,
            averageRating: newAvg,
            ratingCount: newCount,
            userRating: rating,
          };
        }
        return s;
      });

      try {
        const userRated: Record<string, { rating: number; count: number; avg: number }> = {};
        updated.forEach((s) => {
          if (s.userRating) {
            userRated[s.id] = { rating: s.userRating, count: s.ratingCount, avg: s.averageRating };
          }
        });
        localStorage.setItem('sim_marketplace_user_ratings', JSON.stringify(userRated));

        const userOnly = updated.filter((s) => s.isUserSubmitted);
        if (userOnly.length > 0) {
          localStorage.setItem('sim_marketplace_custom_setups', JSON.stringify(userOnly));
        }
      } catch (e) {
        console.warn('Could not persist ratings', e);
      }

      return updated;
    });
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Clean Top Navigation Bar with F1 25 / F1 26 / Favorites Tab Switcher */}
      <DesktopHeader
        activeGame={activeGame}
        onSelectGame={handleSelectGameById}
        currentUser={currentUser}
        onOpenAuth={(mode = 'login') => {
          setAuthModalMode(mode);
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onOpenSubmitModal={() => {
          setIsSubmitModalTriggered(true);
        }}
        favoritesCount={favoriteIds.length}
        isFavoritesActive={activeViewMode === 'favorites'}
        onSelectFavorites={handleSelectFavorites}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        pendingAdminCount={pendingAdminCount}
      />

      {/* Main Marketplace Area - Freely accessible without login barrier */}
      <main className="flex-1 flex flex-col bg-slate-950 relative overflow-x-hidden">
        <SetupMarketplace
          setups={setups}
          activeGame={activeGame}
          onGameChange={handleGameChange}
          activeTrackId={activeTrackId}
          onTrackChange={handleTrackChange}
          currentUser={currentUser}
          onOpenAuth={(mode = 'login') => {
            setAuthModalMode(mode);
            setIsAuthModalOpen(true);
          }}
          onLogout={handleLogout}
          onDownloadSetup={handleDownloadSetup}
          onRateSetup={handleRateSetup}
          onAddSetup={handleAddSetup}
          onUpdateSetup={handleUpdateSetup}
          onDeleteSetup={handleDeleteSetup}
          isExternalSubmitOpen={isSubmitModalTriggered}
          onCloseExternalSubmit={() => setIsSubmitModalTriggered(false)}
          favoriteIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
          activeViewMode={activeViewMode}
          onViewModeChange={setActiveViewMode}
        />
      </main>

      {/* Optional Auth Modal for account sign in / registration */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          initialMode={authModalMode}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={handleLogin}
        />
      )}

      {/* Admin Screenshot & Lap Time Verification Panel */}
      <AdminVerificationPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        setups={setups}
        onUpdateStatus={handleUpdateSetupStatus}
        onUpdateSetup={handleUpdateSetup}
        onDeleteSetup={handleDeleteSetup}
        onOpenBannerConfig={() => setIsBannerConfigOpen(true)}
      />

      {/* Floating Bottom-Right Ad / Discord Community Box */}
      <FloatingBanner
        config={bannerConfig}
        isAdmin={currentUser?.badge?.includes('Admin') || currentUser?.username?.toLowerCase().includes('admin') || currentUser?.username === 'DDLSetup'}
        onOpenSettings={() => setIsBannerConfigOpen(true)}
      />

      {/* Admin Banner Configuration Modal */}
      {isBannerConfigOpen && (
        <BannerConfigModal
          isOpen={isBannerConfigOpen}
          config={bannerConfig}
          onClose={() => setIsBannerConfigOpen(false)}
          onSaveConfig={handleSaveBannerConfig}
        />
      )}
    </div>
  );
}
