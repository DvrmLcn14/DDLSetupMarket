import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  PlusCircle,
  Sparkles,
  Sliders,
  Check,
  User,
  Clock,
  Car,
  Gauge,
  HelpCircle,
  UploadCloud,
  ShieldCheck,
  Image as ImageIcon,
  AlertCircle,
  Trash2,
  Camera,
  ExternalLink,
  CheckCircle2,
  FileCheck,
  Layers,
  Flag,
  FileSpreadsheet,
  Edit3,
  Eye,
} from 'lucide-react';
import { CarSetup, F1SetupSpecs, Track, UserAccount, SetupTuningScreenshot, F1SetupPageCategory } from '../types';
import { TRACKS, SIM_GAMES } from '../data/mockData';
import { generateSampleProofImage, SAMPLE_PROOFS } from '../data/proofScreenshots';
import { registerOrUpdateCreatorProfile, getCreatorProfile } from '../data/mockCreators';
import { AutoCorrectInput } from './AutoCorrectInput';
import { autoCorrectTrackName, autoCorrectCarName, CorrectionResult } from '../utils/motorsportNomenclature';
import { getTrackFlagEmoji } from '../utils/trackFlags';

// Synthetic F1 In-Game Setup Page SVG Generator
function generateF1SetupPageSvg(
  carName: string,
  trackName: string,
  category: F1SetupPageCategory,
  notes?: string
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
    <rect width="800" height="500" fill="#0B1120"/>
    <rect x="20" y="20" width="760" height="460" rx="16" fill="#0F172A" stroke="#DC2626" stroke-width="2"/>
    <text x="50" y="70" font-family="system-ui, sans-serif" font-size="24" font-weight="bold" fill="#F8FAFC">EA SPORTS F1® SETUP SHEET</text>
    <text x="50" y="105" font-family="system-ui, sans-serif" font-size="16" font-weight="600" fill="#EF4444">${category.toUpperCase()}</text>
    <text x="50" y="145" font-family="system-ui, sans-serif" font-size="14" fill="#94A3B8">Circuit: <tspan fill="#FFFFFF" font-weight="bold">${trackName}</tspan></text>
    <text x="50" y="175" font-family="system-ui, sans-serif" font-size="14" fill="#94A3B8">Chassis: <tspan fill="#FFFFFF" font-weight="bold">${carName}</tspan></text>
    <line x1="50" y1="200" x2="750" y2="200" stroke="#334155" stroke-width="1"/>
    <rect x="50" y="220" width="330" height="90" rx="8" fill="#1E293B"/>
    <text x="70" y="250" font-family="system-ui, sans-serif" font-size="12" fill="#94A3B8">GEOMETRY / SUSPENSION SPEC</text>
    <text x="70" y="280" font-family="monospace" font-size="18" font-weight="bold" fill="#38BDF8">OPTIMIZED DOWNFORCE</text>
    <rect x="420" y="220" width="330" height="90" rx="8" fill="#1E293B"/>
    <text x="440" y="250" font-family="system-ui, sans-serif" font-size="12" fill="#94A3B8">SETUP STATUS</text>
    <text x="440" y="280" font-family="monospace" font-size="18" font-weight="bold" fill="#10B981">VERIFIED RACING SPEC</text>
    <text x="50" y="345" font-family="system-ui, sans-serif" font-size="12" fill="#64748B">Notes: ${notes ? notes.substring(0, 70) : 'Tuned for high responsiveness and stability'}</text>
    <text x="50" y="440" font-family="system-ui, sans-serif" font-size="11" fill="#475569">EA SPORTS F1® IN-GAME OVERLAY • COMMUNITY SETUP REPOSITORY</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function getF1SetupSamplePack(carName: string, trackName: string, notes?: string): SetupTuningScreenshot[] {
  const categories: F1SetupPageCategory[] = [
    'Aerodynamics',
    'Transmission & Differential',
    'Suspension Geometry',
    'Brakes & Tyres',
  ];
  return categories.map((cat, idx) => ({
    id: `f1-sheet-${idx + 1}-${Date.now()}`,
    category: cat,
    title: `${cat} Tuning Sheet`,
    imageUrl: generateF1SetupPageSvg(carName, trackName, cat, notes),
    fileName: `${cat.toLowerCase().replace(/[^a-z0-9]/g, '_')}_f1_setup.svg`,
    fileSize: '15 KB (F1 Setup)',
    uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    notes,
  }));
}

interface SubmitSetupModalProps {
  activeGameId: string;
  defaultTrackId: string;
  currentUser?: UserAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newSetup: CarSetup) => void;
  setupToEdit?: CarSetup | null;
  onUpdate?: (updatedSetup: CarSetup) => void;
}

export const SubmitSetupModal: React.FC<SubmitSetupModalProps> = ({
  activeGameId,
  defaultTrackId,
  currentUser,
  isOpen,
  onClose,
  onSubmit,
  setupToEdit,
  onUpdate,
}) => {
  // Form State
  const [gameId, setGameId] = useState<string>(activeGameId || 'f1_25');
  const [trackInput, setTrackInput] = useState<string>('');
  const [carInput, setCarInput] = useState<string>('F1 Car');
  const [trackId, setTrackId] = useState<string>(defaultTrackId || 'spa');
  const [condition, setCondition] = useState<'Dry' | 'Wet'>('Dry');
  const [setupType, setSetupType] = useState<'Qualifying' | 'Race' | 'Time Trial'>('Qualifying');
  const [title, setTitle] = useState<string>('');
  const [creatorUsername, setCreatorUsername] = useState<string>(currentUser?.username || '');
  const [creatorBio, setCreatorBio] = useState<string>('');
  const [instagramHandle, setInstagramHandle] = useState<string>('');
  const [youtubeUrl, setYoutubeUrl] = useState<string>('');
  const [discordUrl, setDiscordUrl] = useState<string>('');
  const [bestLapTime, setBestLapTime] = useState<string>('');
  const [inputDevice, setInputDevice] = useState<string>('Wheel');
  const [notes, setNotes] = useState<string>('');

  // F1 Game Setup Screenshots (Tuning Pages: Aerodynamics, Transmission, Suspension, Brakes)
  const [setupScreenshots, setSetupScreenshots] = useState<SetupTuningScreenshot[]>([]);
  const [activeScreenshotCategory, setActiveScreenshotCategory] = useState<F1SetupPageCategory>('Aerodynamics');
  const [screenshotNotes, setScreenshotNotes] = useState<string>('');
  const [showManualSliders, setShowManualSliders] = useState<boolean>(false);
  const [previewScreenshotModal, setPreviewScreenshotModal] = useState<SetupTuningScreenshot | null>(null);

  // Verification Proof State
  const [proofImage, setProofImage] = useState<string>('');
  const [proofFileName, setProofFileName] = useState<string>('');
  const [proofFileSize, setProofFileSize] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [previewProofModal, setPreviewProofModal] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const setupScreenshotsInputRef = useRef<HTMLInputElement | null>(null);

  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize track & car names based on selected game OR pre-fill existing setup when in edit mode
  useEffect(() => {
    if (!isOpen) return;

    if (setupToEdit) {
      setGameId(setupToEdit.gameId || 'f1_25');
      const initialTrack =
        setupToEdit.customTrackName ||
        (TRACKS[setupToEdit.trackId] ? TRACKS[setupToEdit.trackId].name : setupToEdit.trackId);
      setTrackInput(initialTrack);
      setTrackId(setupToEdit.trackId);
      setCarInput(setupToEdit.carName);
      setCondition(setupToEdit.condition === 'Intermediate' ? 'Wet' : setupToEdit.condition);
      setSetupType(setupToEdit.type);
      setTitle(setupToEdit.title);
      setCreatorUsername(setupToEdit.creatorUsername);
      setBestLapTime(setupToEdit.bestLapTime || '');
      setInputDevice(setupToEdit.inputDevice || 'Wheel');
      setNotes(setupToEdit.notes || '');
      setSpecs({ ...setupToEdit.specs });
      setSetupScreenshots(setupToEdit.setupScreenshots ? [...setupToEdit.setupScreenshots] : []);
      setProofImage(setupToEdit.proofScreenshot || '');
      setProofFileName(setupToEdit.proofScreenshot ? 'Current verification proof' : '');
      setProofFileSize('');
      setShowManualSliders(true); // Open sliders so user can easily adjust wings/diff/etc.

      // Load creator bio/socials if available
      const creatorProf = getCreatorProfile(setupToEdit.creatorUsername);
      if (creatorProf) {
        setCreatorBio(creatorProf.bio || '');
        setInstagramHandle(
          creatorProf.socials.instagram
            ? creatorProf.socials.instagram.replace('https://instagram.com/', '')
            : ''
        );
        setYoutubeUrl(creatorProf.socials.youtube || '');
        setDiscordUrl(creatorProf.socials.discord || '');
      }
      setValidationError(null);
    } else {
      if (currentUser?.username) {
        setCreatorUsername(currentUser.username);
      }
      if (activeGameId) {
        setGameId(activeGameId);
      }
      const initialTrack = TRACKS[defaultTrackId] ? TRACKS[defaultTrackId].name : 'Circuit de Spa-Francorchamps';
      setTrackInput(initialTrack);
      setTrackId(defaultTrackId || 'spa');

      const selectedGame = SIM_GAMES.find((g) => g.id === (activeGameId || 'f1_25'));
      if (selectedGame && selectedGame.cars.length > 0) {
        setCarInput(selectedGame.cars[0]);
      } else {
        setCarInput('Scuderia Ferrari SF-25');
      }
      setCondition('Dry');
      setSetupType('Qualifying');
      setTitle('');
      setCreatorBio('');
      setInstagramHandle('');
      setYoutubeUrl('');
      setDiscordUrl('');
      setBestLapTime('');
      setInputDevice('Wheel');
      setNotes('');
      setSpecs({
        frontWing: 20,
        rearWing: 16,
        diffOnThrottle: 55,
        diffOffThrottle: 50,
        frontCamber: -2.80,
        rearCamber: -1.10,
        frontToe: 0.05,
        rearToe: 0.20,
        frontSuspension: 26,
        rearSuspension: 22,
        frontAntiRollBar: 8,
        rearAntiRollBar: 4,
        frontRideHeight: 34,
        rearRideHeight: 55,
        brakePressure: 100,
        brakeBias: 55.0,
        flPressure: 24.5,
        frPressure: 24.5,
        rlPressure: 22.5,
        rrPressure: 22.5,
      });
      setSetupScreenshots([]);
      setProofImage('');
      setProofFileName('');
      setProofFileSize('');
      setShowManualSliders(false);
      setValidationError(null);
    }
  }, [isOpen, setupToEdit, activeGameId, defaultTrackId, currentUser]);

  // Is this game a non-F1 sim where visual setup screenshot pages are especially prevalent?
  const isNonF1Sim = useMemo(() => {
    return gameId !== 'f1_24' && gameId !== 'f1_25' && gameId !== 'f1_26';
  }, [gameId]);

  // Available preset tracks for the chosen game
  const availableTracks = useMemo(() => {
    const selectedGame = SIM_GAMES.find((g) => g.id === gameId);
    if (selectedGame && selectedGame.activeTracks && selectedGame.activeTracks.length > 0) {
      return selectedGame.activeTracks.map((tid) => TRACKS[tid]).filter(Boolean);
    }
    return Object.values(TRACKS).slice(0, 12);
  }, [gameId]);

  // Available preset cars for the chosen game
  const availableCars = useMemo(() => {
    const selectedGame = SIM_GAMES.find((g) => g.id === gameId);
    return selectedGame?.cars || ['Ferrari 296 GT3', 'Porsche 992 GT3 R', 'BMW M4 GT3'];
  }, [gameId]);

  // Setup Values (Defaults conforming to official F1 simulation specs)
  const [specs, setSpecs] = useState<F1SetupSpecs>({
    frontWing: 20,
    rearWing: 16,
    diffOnThrottle: 55,
    diffOffThrottle: 50,
    frontCamber: -2.80,
    rearCamber: -1.10,
    frontToe: 0.05,
    rearToe: 0.20,
    frontSuspension: 26,
    rearSuspension: 22,
    frontAntiRollBar: 8,
    rearAntiRollBar: 4,
    frontRideHeight: 34,
    rearRideHeight: 55,
    brakePressure: 100,
    brakeBias: 55.0,
    flPressure: 24.5,
    frPressure: 24.5,
    rlPressure: 22.5,
    rrPressure: 22.5,
  });

  if (!isOpen) return null;

  const handleSpecChange = (field: keyof F1SetupSpecs, value: number) => {
    setSpecs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Process uploaded image files for setup tuning pages
  const processTuningImageFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const categories: F1SetupPageCategory[] = [
      'Aerodynamics',
      'Transmission & Differential',
      'Suspension Geometry',
      'Brakes & Tyres',
      'General Setup Sheet',
    ];

    fileArray.forEach((file, index) => {
      if (!file.type.startsWith('image/')) {
        setValidationError('Invalid file type. Please upload image files (.png, .jpg, .jpeg, .webp, .svg).');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          const category =
            fileArray.length === 1
              ? activeScreenshotCategory
              : categories[index % categories.length];

          const sizeKb = file.size / 1024;
          const formattedSize = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb.toFixed(0)} KB`;

          const newScreenshot: SetupTuningScreenshot = {
            id: `screenshot-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            category: category,
            title: `${category} In-Game Setup Screen`,
            imageUrl: result,
            fileName: file.name,
            fileSize: formattedSize,
            uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            notes: screenshotNotes || undefined,
          };

          setSetupScreenshots((prev) => [...prev, newScreenshot]);
          setValidationError(null);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Process single image file for verification proof
  const processProofImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setValidationError('Invalid file type. Please upload an image screenshot (.png, .jpg, .jpeg, .webp, .svg).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setProofImage(result);
        setProofFileName(file.name);
        const sizeKb = file.size / 1024;
        setProofFileSize(sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb.toFixed(0)} KB`);
        setValidationError(null);
      }
    };
    reader.onerror = () => {
      setValidationError('Failed to read image file. Please try another screenshot.');
    };
    reader.readAsDataURL(file);
  };

  const handleProofDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processProofImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleProofDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleProofDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processProofImageFile(e.target.files[0]);
    }
  };

  // One-click generate full F1 In-Game Setup Pack (4 Pages)
  const handleLoadF1Pack = () => {
    const trackName = trackInput.trim() || 'Circuit de Spa-Francorchamps';
    const carName = carInput.trim() || 'Scuderia Ferrari SF-25';
    const samplePack = getF1SetupSamplePack(carName, trackName, notes);

    setSetupScreenshots(samplePack);
    // Also use the first page as proof if none exists
    if (!proofImage) {
      setProofImage(samplePack[0].imageUrl);
      setProofFileName('f1_setup_sheet_verified.svg');
      setProofFileSize('15 KB (F1 Verified)');
    }
    setValidationError(null);
  };

  // Add a single synthetic in-game setup page for the selected category
  const handleAddSampleCategoryPage = () => {
    const trackName = trackInput.trim() || 'Circuit';
    const carName = carInput.trim() || 'F1 25 / F1 26 Car';
    const svgUrl = generateF1SetupPageSvg(carName, trackName, activeScreenshotCategory, screenshotNotes || notes);

    const newPage: SetupTuningScreenshot = {
      id: `screenshot-${Date.now()}`,
      category: activeScreenshotCategory,
      title: `${activeScreenshotCategory} Tuning Page`,
      imageUrl: svgUrl,
      fileName: `${activeScreenshotCategory.toLowerCase().replace(/\s+/g, '_')}_setup.svg`,
      fileSize: '15 KB (Sim Capture)',
      uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notes: screenshotNotes || undefined,
    };

    setSetupScreenshots((prev) => [...prev, newPage]);
    setValidationError(null);
  };

  const handleRemoveScreenshot = (id: string) => {
    setSetupScreenshots((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdateScreenshotCategory = (id: string, newCategory: F1SetupPageCategory) => {
    setSetupScreenshots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, category: newCategory, title: `${newCategory} In-Game Setup Screen` } : s))
    );
  };

  const handleUpdateScreenshotNotes = (id: string, newNotes: string) => {
    setSetupScreenshots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, notes: newNotes } : s))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Basic Validation
    if (!creatorUsername.trim()) {
      setValidationError('Please enter your Creator Username.');
      return;
    }
    if (!bestLapTime.trim()) {
      setValidationError('Please enter your Best Lap Time (e.g. 1:42.340).');
      return;
    }
    if (!trackInput.trim()) {
      setValidationError('Please enter or select a Track / Circuit.');
      return;
    }
    if (!carInput.trim()) {
      setValidationError('Please enter or select a Car Model.');
      return;
    }

    // Run Auto-Correction & Normalization Layer on Track and Car
    const correctedTrack = autoCorrectTrackName(trackInput, gameId);
    const correctedCar = autoCorrectCarName(carInput, gameId);

    const finalTrackName = correctedTrack.corrected || trackInput.trim();
    const finalCarName = correctedCar.corrected || carInput.trim();
    const resolvedTrackId = correctedTrack.trackId || trackId || 'custom_track';

    // Proof (Optional): If proofImage is missing but setupScreenshots exist, use the first screenshot
    let finalProof = proofImage ? proofImage.trim() : '';
    if (!finalProof && setupScreenshots.length > 0) {
      finalProof = setupScreenshots[0].imageUrl;
    }

    const calculatedDownforce =
      specs.frontWing + specs.rearWing > 50
        ? 'High'
        : specs.frontWing + specs.rearWing > 25
        ? 'Medium'
        : 'Low';

    // Parse best lap time to seconds estimate
    let lapSeconds = 100;
    const parts = bestLapTime.split(':');
    if (parts.length === 2) {
      lapSeconds = parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
    }

    const hasPhotos = setupScreenshots.length > 0;
    const isEditMode = Boolean(setupToEdit);

    const targetId = setupToEdit ? setupToEdit.id : `setup-user-${Date.now()}`;
    const targetDateAdded = setupToEdit ? setupToEdit.dateAdded : new Date().toISOString().split('T')[0];
    const targetDownloads = setupToEdit ? setupToEdit.downloads : 0;
    const targetAvgRating = setupToEdit ? setupToEdit.averageRating : 0;
    const targetRatingCount = setupToEdit ? setupToEdit.ratingCount : 0;
    const targetUserRating = setupToEdit ? setupToEdit.userRating : undefined;
    const targetCreatorBadge = setupToEdit?.creatorBadge || currentUser?.badge || 'Community';
    const targetCreatorAvatar = setupToEdit?.creatorAvatar;

    // Lap time change check for verification status
    const isLapTimeChanged = setupToEdit && setupToEdit.bestLapTime !== bestLapTime.trim();
    const targetVerificationStatus = setupToEdit
      ? isLapTimeChanged
        ? 'pending'
        : setupToEdit.verificationStatus || 'pending'
      : 'pending';
    const targetIsProofVerified = setupToEdit
      ? isLapTimeChanged
        ? false
        : setupToEdit.isProofVerified || false
      : false;

    const finalSetup: CarSetup = {
      id: targetId,
      title:
        title.trim() ||
        (hasPhotos
          ? `${finalCarName} ${finalTrackName} Visual Setup Pack`
          : `${finalTrackName} ${specs.frontWing}/${specs.rearWing} Wing Setup`),
      gameId: gameId || activeGameId || 'f1_25',
      trackId: resolvedTrackId,
      customTrackName: finalTrackName,
      carName: finalCarName,
      creatorUsername: creatorUsername.trim().replace(/^@/, '') || setupToEdit?.creatorUsername || 'SimRacer',
      creatorBadge: targetCreatorBadge,
      creatorAvatar: targetCreatorAvatar,
      bestLapTime: bestLapTime.trim(),
      lapTimeSeconds: lapSeconds,
      averageRating: targetAvgRating,
      ratingCount: targetRatingCount,
      userRating: targetUserRating,
      condition: condition,
      type: setupType,
      downforceLevel: calculatedDownforce,
      dateAdded: targetDateAdded,
      downloads: targetDownloads,
      inputDevice: inputDevice.trim() || setupToEdit?.inputDevice || 'Direct Drive Wheel',
      notes:
        notes.trim() ||
        (hasPhotos
          ? `Visual in-game setup screenshots provided by @${creatorUsername}. Check attached tuning sheets for full tyre, damper, and mechanical parameters.`
          : `Submitted by @${creatorUsername}. Setup values with balanced aero and suspension geometry.`),
      specs: specs,
      isUserSubmitted: true,
      proofScreenshot: finalProof || undefined,
      isProofVerified: targetIsProofVerified,
      verificationStatus: targetVerificationStatus,
      verificationNotes: setupToEdit?.verificationNotes,
      proofTimestamp: finalProof
        ? (setupToEdit?.proofTimestamp ||
           new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC')
        : undefined,
      setupScreenshots: hasPhotos ? setupScreenshots : undefined,
    };

    // Save/Update Creator Profile & Social Links if provided
    const cleanedUsername = creatorUsername.trim().replace(/^@/, '');
    if (cleanedUsername) {
      registerOrUpdateCreatorProfile(cleanedUsername, {
        bio: creatorBio.trim() || undefined,
        socials: {
          instagram: instagramHandle.trim()
            ? instagramHandle.startsWith('http')
              ? instagramHandle.trim()
              : `https://instagram.com/${instagramHandle.trim().replace(/^@/, '')}`
            : undefined,
          youtube: youtubeUrl.trim() || undefined,
          discord: discordUrl.trim() || undefined,
        },
      });
    }

    if (isEditMode && onUpdate) {
      onUpdate(finalSetup);
    } else {
      onSubmit(finalSetup);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl space-y-5 text-slate-100 max-h-[94vh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
        id="submit-setup-dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              {setupToEdit ? (
                <>
                  <Edit3 className="w-5 h-5 text-amber-400" />
                  <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                    Edit Setup
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Editing Mode
                  </span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5 text-sky-400" />
                  <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                    Submit F1 Setup
                  </h2>
                </>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {setupToEdit
                ? 'Update setup parameters, lap time, wing angles, notes, or attachments'
                : 'Share your competitive in-game setup with the sim racing community'}
            </p>
          </div>
          <button
            type="button"
            id="close-submit-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Alert */}
        {validationError && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2 flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1 text-xs">
          {/* SECTION 1: SIMULATION GAME, TRACK & CAR (WITH AUTO-CORRECT) */}
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3.5">
            <div className="text-[11px] uppercase font-bold text-sky-400 tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-sky-400" />
                <span>1. Game, Track & Vehicle</span>
              </span>
            </div>

            {/* Simulation Game Selector */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Simulation Platform
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SIM_GAMES.map((game) => {
                  const isSelected = game.id === gameId;
                  return (
                    <button
                      key={game.id}
                      type="button"
                      onClick={() => setGameId(game.id)}
                      className={`px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all border flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-red-600/30 border-red-500 text-white shadow-sm ring-1 ring-red-500/50'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{game.icon}</span>
                        <span className="text-xs font-extrabold">{game.name}</span>
                      </div>
                      {isSelected && <span className="text-[10px] text-red-300 font-bold">Selected</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Track Input with Auto-Correction */}
            <div className="space-y-1.5">
              <AutoCorrectInput
                id="submit-setup-track-input"
                type="track"
                label="Track / Circuit"
                required
                value={trackInput}
                onChange={(val, result) => {
                  setTrackInput(val);
                  if (result?.trackId) {
                    setTrackId(result.trackId);
                  }
                }}
                placeholder="Search or enter circuit name (e.g. Spa-Francorchamps, Monza, Silverstone)..."
                gameId={gameId}
              />

              {/* Quick Circuit Chips (Full 24-Track F1 Calendar) */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                  <span>Official F1® Calendar Quick Select ({availableTracks.length} Circuits):</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
                  {availableTracks.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTrackInput(t.name);
                        setTrackId(t.id);
                      }}
                      className={`text-[10px] px-2.5 py-1 rounded-lg whitespace-nowrap transition-all border cursor-pointer flex items-center gap-1.5 ${
                        trackInput === t.name || trackId === t.id
                          ? 'bg-red-600 text-white border-red-400 font-bold shadow-sm'
                          : 'bg-slate-900 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs">{getTrackFlagEmoji(t.id, t.country)}</span>
                      <span>{t.name.split('(')[0].trim()}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Static Vehicle Tag (Strictly F1 Car) */}
            <div className="space-y-1.5">
              <label className="block text-slate-400 font-medium text-xs">
                Vehicle Specification
              </label>
              <div className="flex items-center justify-between p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-red-500 text-sm">🏎️</span>
                  <span className="text-xs font-bold text-white">F1 Car</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-600/20 text-red-300 border border-red-500/30 font-bold uppercase">
                    Official Spec
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Universal Formula 1 Chassis
                </span>
              </div>
            </div>

            {/* Condition & Session Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Track Condition
                </label>
                <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                  {(['Dry', 'Wet'] as const).map((cond) => (
                    <button
                      key={cond}
                      type="button"
                      id={`toggle-condition-${cond.toLowerCase()}`}
                      onClick={() => setCondition(cond)}
                      className={`flex-1 py-1 rounded-md font-bold transition-all text-xs cursor-pointer ${
                        condition === cond
                          ? cond === 'Dry'
                            ? 'bg-amber-500 text-slate-950 shadow'
                            : 'bg-sky-500 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cond === 'Dry' ? '☀️ Dry' : '🌧️ Wet'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Setup Type
                </label>
                <select
                  value={setupType}
                  onChange={(e) => setSetupType(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
                >
                  <option value="Qualifying">Qualifying (Q3 Max Attack)</option>
                  <option value="Race">Race (Stint Endurance Pace)</option>
                  <option value="Time Trial">Time Trial (Leaderboard)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: LAP TIME & CREATOR ATTRIBUTION */}
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
            <div className="text-[11px] uppercase font-bold text-sky-400 tracking-wider flex items-center gap-1.5">
              <span>2. Lap Time & Creator Attribution</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Creator's Username */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400 font-medium">
                    Creator Username <span className="text-rose-400">*</span>
                  </label>
                  {currentUser && (
                    <span className="text-[10px] text-sky-400 font-semibold">
                      @{currentUser.username}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">
                    @
                  </span>
                  <input
                    id="submit-creator-username-input"
                    type="text"
                    required
                    placeholder="e.g. ApexPredator_NL"
                    value={creatorUsername}
                    onChange={(e) => setCreatorUsername(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-6 pr-2.5 py-1.5 text-slate-100 font-medium focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Best Lap Time */}
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Best Lap Time <span className="text-rose-400">*</span>
                </label>
                <input
                  id="submit-best-lap-input"
                  type="text"
                  required
                  placeholder="e.g. 1:42.118"
                  value={bestLapTime}
                  onChange={(e) => setBestLapTime(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-emerald-400 font-mono font-bold focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Setup Title */}
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Setup Title (Optional)
                </label>
                <input
                  id="submit-setup-title-input"
                  type="text"
                  placeholder="e.g. Spa Low Drag Esports Q3"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-medium focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Input Hardware & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Input Hardware
                </label>
                <select
                  id="submit-input-device-select"
                  value={inputDevice}
                  onChange={(e) => setInputDevice(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
                >
                  <option value="Wheel">Wheel</option>
                  <option value="Gamepad">Gamepad</option>
                  <option value="Keyboard">Keyboard</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Tuning Advice & Creator Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Brake 5m early into Turn 1, smooth throttle application on exit..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-medium focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Creator Bio & Social Links (Optional) */}
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2.5">
              <span className="text-[11px] font-extrabold text-sky-400 uppercase tracking-wider block">
                Optional: Creator Portfolio & Social Media Links
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    placeholder="@yourhandle"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    YouTube Channel Link
                  </label>
                  <input
                    type="text"
                    placeholder="https://youtube.com/@channel"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Discord / Twitch
                  </label>
                  <input
                    type="text"
                    placeholder="Discord invite or Twitch link"
                    value={discordUrl}
                    onChange={(e) => setDiscordUrl(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1 text-xs">
                  Creator Tagline / Bio
                </label>
                <input
                  type="text"
                  placeholder="e.g. F1 Esports setup developer specializing in race pace stability and tyre management."
                  value={creatorBio}
                  onChange={(e) => setCreatorBio(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: LAP TIME VERIFICATION PROOF (OPTIONAL IMAGE UPLOAD) */}
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>4. Lap Time Verification Proof</span>
                <span className="text-[10px] font-normal text-slate-400 normal-case">(Optional)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-900 text-slate-400 border border-slate-800">
                Optional
              </span>
            </div>

            {proofImage ? (
              <div className="p-3 bg-slate-900 rounded-xl border border-emerald-500/40 flex items-center justify-between gap-3 shadow-inner">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-16 h-12 rounded-lg border border-slate-700 bg-black overflow-hidden flex-shrink-0 cursor-pointer group relative shadow"
                    onClick={() => setPreviewProofModal(true)}
                    title="Click to preview proof screenshot fullscreen"
                  >
                    <img
                      src={proofImage}
                      alt="Proof thumbnail"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                  <div className="truncate text-xs">
                    <div className="font-bold text-white truncate">{proofFileName || 'in_game_telemetry_proof.png'}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Screenshot Attached</span>
                      </span>
                      {proofFileSize && (
                        <span className="text-[10px] text-slate-400 font-mono">({proofFileSize})</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setPreviewProofModal(true)}
                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 font-semibold border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold border border-slate-700 transition-colors cursor-pointer"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProofImage('');
                      setProofFileName('');
                      setProofFileSize('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Remove screenshot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                id="proof-upload-dropzone"
                onDragOver={handleProofDragOver}
                onDragLeave={handleProofDragLeave}
                onDrop={handleProofDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 ${
                  isDragging
                    ? 'border-emerald-400 bg-emerald-500/10 scale-[0.99]'
                    : 'border-slate-700/80 bg-slate-900/60 hover:border-emerald-500/60 hover:bg-slate-900/90'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-500/10">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                    <span>Upload In-Game Lap Time Screenshot / Telemetry Proof</span>
                    <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Drag &amp; drop your screenshot here, or <span className="text-emerald-400 font-semibold underline">browse files</span>
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">
                    Optional: Upload HUD timing, leaderboard, or telemetry screenshot for admin verification, or submit without it.
                  </p>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProofFileChange}
            />
          </div>

          {/* SECTION 5: DETAILED NUMERICAL SLIDERS (COLLAPSIBLE IF PHOTOS ACTIVE) */}
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                <span>5. Detailed Numerical Sliders {setupScreenshots.length > 0 && '(Optional)'}</span>
              </div>
              {setupScreenshots.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowManualSliders(!showManualSliders)}
                  className="text-[11px] text-sky-400 hover:text-sky-300 font-bold underline cursor-pointer"
                >
                  {showManualSliders ? 'Hide Sliders' : 'Show Manual Sliders'}
                </button>
              )}
            </div>

            {(!setupScreenshots.length || showManualSliders) && (
              <div className="space-y-4 pt-1">
                {/* 1. Aerodynamics */}
                <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-sky-400">1. Aerodynamics (0 - 50)</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                        <span>Front Wing Aero:</span>
                        <span className="font-mono text-white font-bold">{specs.frontWing}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={specs.frontWing}
                        onChange={(e) => handleSpecChange('frontWing', Number(e.target.value))}
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                        <span>Rear Wing Aero:</span>
                        <span className="font-mono text-white font-bold">{specs.rearWing}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={specs.rearWing}
                        onChange={(e) => handleSpecChange('rearWing', Number(e.target.value))}
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Transmission / Differential */}
                <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-sky-400">2. Transmission / Differential (10% - 100%)</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                        <span>Diff On-Throttle:</span>
                        <span className="font-mono text-white font-bold">{specs.diffOnThrottle}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={specs.diffOnThrottle}
                        onChange={(e) => handleSpecChange('diffOnThrottle', Number(e.target.value))}
                        className="w-full accent-sky-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                        <span>Diff Off-Throttle:</span>
                        <span className="font-mono text-white font-bold">{specs.diffOffThrottle}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={specs.diffOffThrottle}
                        onChange={(e) => handleSpecChange('diffOffThrottle', Number(e.target.value))}
                        className="w-full accent-sky-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Suspension Geometry (Camber & Toe) */}
                <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-sky-400">3. Suspension Geometry (Front/Rear Camber & Toe)</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                        <span>Front Camber:</span>
                        <span className="font-mono text-white font-bold">{specs.frontCamber}°</span>
                      </div>
                      <input
                        type="range"
                        min="-3.50"
                        max="-2.50"
                        step="0.05"
                        value={specs.frontCamber}
                        onChange={(e) => handleSpecChange('frontCamber', Number(e.target.value))}
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                        <span>Rear Camber:</span>
                        <span className="font-mono text-white font-bold">{specs.rearCamber}°</span>
                      </div>
                      <input
                        type="range"
                        min="-2.20"
                        max="-0.70"
                        step="0.05"
                        value={specs.rearCamber}
                        onChange={(e) => handleSpecChange('rearCamber', Number(e.target.value))}
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                        <span>Front Toe-Out:</span>
                        <span className="font-mono text-white font-bold">{specs.frontToe}°</span>
                      </div>
                      <input
                        type="range"
                        min="0.00"
                        max="0.50"
                        step="0.01"
                        value={specs.frontToe}
                        onChange={(e) => handleSpecChange('frontToe', Number(e.target.value))}
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                        <span>Rear Toe-In:</span>
                        <span className="font-mono text-white font-bold">{specs.rearToe}°</span>
                      </div>
                      <input
                        type="range"
                        min="0.00"
                        max="0.50"
                        step="0.01"
                        value={specs.rearToe}
                        onChange={(e) => handleSpecChange('rearToe', Number(e.target.value))}
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Suspension & Anti-Roll Bars */}
                <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-sky-400">4. Suspension & Anti-Roll Bars (1 - 41 / 1 - 21)</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                        <span>Front Suspension:</span>
                        <span className="font-mono text-white font-bold">{specs.frontSuspension}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="41"
                        value={specs.frontSuspension}
                        onChange={(e) => handleSpecChange('frontSuspension', Number(e.target.value))}
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                        <span>Rear Suspension:</span>
                        <span className="font-mono text-white font-bold">{specs.rearSuspension}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="41"
                        value={specs.rearSuspension}
                        onChange={(e) => handleSpecChange('rearSuspension', Number(e.target.value))}
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                        <span>Front Anti-Roll Bar:</span>
                        <span className="font-mono text-white font-bold">{specs.frontAntiRollBar}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="21"
                        value={specs.frontAntiRollBar}
                        onChange={(e) => handleSpecChange('frontAntiRollBar', Number(e.target.value))}
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                        <span>Rear Anti-Roll Bar:</span>
                        <span className="font-mono text-white font-bold">{specs.rearAntiRollBar}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="21"
                        value={specs.rearAntiRollBar}
                        onChange={(e) => handleSpecChange('rearAntiRollBar', Number(e.target.value))}
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                        <span>Front Ride Height:</span>
                        <span className="font-mono text-white font-bold">{specs.frontRideHeight}</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="40"
                        value={specs.frontRideHeight}
                        onChange={(e) => handleSpecChange('frontRideHeight', Number(e.target.value))}
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                        <span>Rear Ride Height:</span>
                        <span className="font-mono text-white font-bold">{specs.rearRideHeight}</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="100"
                        value={specs.rearRideHeight}
                        onChange={(e) => handleSpecChange('rearRideHeight', Number(e.target.value))}
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Brakes */}
                <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-sky-400">5. Brakes (80% - 100% / 50% - 70%)</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                        <span>Brake Pressure:</span>
                        <span className="font-mono text-white font-bold">{specs.brakePressure}%</span>
                      </div>
                      <input
                        type="range"
                        min="80"
                        max="100"
                        value={specs.brakePressure}
                        onChange={(e) => handleSpecChange('brakePressure', Number(e.target.value))}
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                        <span>Front Brake Bias:</span>
                        <span className="font-mono text-white font-bold">{specs.brakeBias}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="70"
                        step="0.5"
                        value={specs.brakeBias}
                        onChange={(e) => handleSpecChange('brakeBias', Number(e.target.value))}
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* 6. Tyre Pressures (psi) */}
                <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-sky-400">6. Tyre Pressures (psi)</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                        <span>Front Left Tyre:</span>
                        <span className="font-mono text-white font-bold">{specs.flPressure} psi</span>
                      </div>
                      <input
                        type="range"
                        min="22.5"
                        max="29.5"
                        step="0.1"
                        value={specs.flPressure}
                        onChange={(e) => handleSpecChange('flPressure', Number(e.target.value))}
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                        <span>Front Right Tyre:</span>
                        <span className="font-mono text-white font-bold">{specs.frPressure} psi</span>
                      </div>
                      <input
                        type="range"
                        min="22.5"
                        max="29.5"
                        step="0.1"
                        value={specs.frPressure}
                        onChange={(e) => handleSpecChange('frPressure', Number(e.target.value))}
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                        <span>Rear Left Tyre:</span>
                        <span className="font-mono text-white font-bold">{specs.rlPressure} psi</span>
                      </div>
                      <input
                        type="range"
                        min="20.5"
                        max="26.5"
                        step="0.1"
                        value={specs.rlPressure}
                        onChange={(e) => handleSpecChange('rlPressure', Number(e.target.value))}
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                        <span>Rear Right Tyre:</span>
                        <span className="font-mono text-white font-bold">{specs.rrPressure} psi</span>
                      </div>
                      <input
                        type="range"
                        min="20.5"
                        max="26.5"
                        step="0.1"
                        value={specs.rrPressure}
                        onChange={(e) => handleSpecChange('rrPressure', Number(e.target.value))}
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SUBMIT / SAVE BUTTON */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-setup-action-btn"
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-lg flex items-center gap-1.5 cursor-pointer ${
                setupToEdit
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-amber-500/20'
                  : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/30'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{setupToEdit ? 'Save Changes' : 'Publish Setup'}</span>
            </button>
          </div>
        </form>

        {/* Lightbox Modal for Screenshot Preview */}
        {previewScreenshotModal && (
          <div
            className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setPreviewScreenshotModal(null)}
          >
            <div
              className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-4 space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-white text-sm">{previewScreenshotModal.title}</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                    {previewScreenshotModal.category}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewScreenshotModal(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="rounded-xl overflow-hidden border border-slate-800 bg-black max-h-[70vh] flex items-center justify-center">
                <img
                  src={previewScreenshotModal.imageUrl}
                  alt={previewScreenshotModal.title}
                  className="max-h-[70vh] w-auto object-contain"
                />
              </div>

              {previewScreenshotModal.notes && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 italic">
                  "{previewScreenshotModal.notes}"
                </div>
              )}
            </div>
          </div>
        )}

        {/* Proof Preview Modal */}
        {previewProofModal && proofImage && (
          <div
            className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setPreviewProofModal(false)}
          >
            <div
              className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-4 space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white text-sm">Lap Time Verification Screenshot</span>
                <button
                  type="button"
                  onClick={() => setPreviewProofModal(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-black max-h-[70vh] flex items-center justify-center">
                <img src={proofImage} alt="Verification proof" className="max-h-[70vh] w-auto object-contain" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
