export interface F1SetupSpecs {
  // Aerodynamics (0 - 50)
  frontWing: number;
  rearWing: number;
  // Transmission / Differential (10% - 100%)
  diffOnThrottle: number; // 10% - 100%
  diffOffThrottle: number; // 10% - 100%
  // Suspension Geometry
  frontCamber: number; // -3.50° to -2.50°
  rearCamber: number; // -2.20° to -0.70°
  frontToe: number; // 0.00° to 0.50°
  rearToe: number; // 0.00° to 0.50°
  // Suspension & Anti-Roll
  frontSuspension: number; // 1 - 41
  rearSuspension: number; // 1 - 41
  frontAntiRollBar: number; // 1 - 21
  rearAntiRollBar: number; // 1 - 21
  frontRideHeight: number; // 10 - 40
  rearRideHeight: number; // 40 - 100
  // Brakes
  brakePressure: number; // 80% - 100%
  brakeBias: number; // 50% - 70%
  // Tyres (PSI)
  flPressure: number; // 22.5 - 29.5 psi
  frPressure: number; // 22.5 - 29.5 psi
  rlPressure: number; // 20.5 - 26.5 psi
  rrPressure: number; // 20.5 - 26.5 psi
}

export type InputDeviceType = 'Wheel' | 'Gamepad' | 'Keyboard';
export type VerificationStatus = 'verified' | 'pending' | 'rejected';

export interface CarSetup {
  id: string;
  title: string;
  gameId: string;
  trackId: string;
  carName: string;
  creatorUsername: string;
  creatorBadge?: 'Pro' | 'Verified' | 'Esports' | 'Community' | 'Admin / Founder' | string;
  creatorAvatar?: string;
  bestLapTime: string;
  lapTimeSeconds: number;
  averageRating: number;
  ratingCount: number;
  userRating?: number;
  condition: 'Dry' | 'Wet' | 'Intermediate';
  type: 'Qualifying' | 'Race' | 'Time Trial';
  downforceLevel: 'Low' | 'Medium' | 'High';
  dateAdded: string;
  downloads: number;
  notes: string;
  specs: F1SetupSpecs;
  inputDevice?: InputDeviceType | string;
  isUserSubmitted?: boolean;
  proofScreenshot?: string;
  isProofVerified?: boolean;
  verificationStatus?: VerificationStatus;
  verificationNotes?: string;
  proofTimestamp?: string;
  setupScreenshots?: SetupTuningScreenshot[];
  customTrackName?: string;
}

export type F1SetupPageCategory =
  | 'Aerodynamics'
  | 'Transmission & Differential'
  | 'Suspension Geometry'
  | 'Brakes & Tyres'
  | 'General Setup Sheet';

export interface SetupTuningScreenshot {
  id: string;
  category: F1SetupPageCategory;
  title: string;
  imageUrl: string;
  fileName?: string;
  fileSize?: string;
  uploadedAt?: string;
  notes?: string;
}

export interface SimGame {
  id: string;
  name: string;
  icon: string;
  genre: string;
  description: string;
  activeTracks: string[];
  cars: string[];
  backdropUrl: string;
}

export interface Track {
  id: string;
  name: string;
  country: string;
  flagEmoji?: string;
  lengthKm: string;
  turnCount: number;
  lapRecord: string;
  recordHolder: string;
}

export interface CreatorSocials {
  youtube?: string;
  twitch?: string;
  discord?: string;
  instagram?: string;
  twitter?: string;
  website?: string;
}

export interface CreatorProfile {
  username: string;
  badge: 'Community' | 'Pro' | 'Esports' | 'Verified' | 'Admin / Founder' | string;
  avatar?: string;
  bio: string;
  socials: CreatorSocials;
  joinedDate: string;
  location?: string;
  team?: string;
  followers?: number;
}

export interface UserAccount {
  username: string;
  password?: string;
  badge: 'Community' | 'Pro' | 'Esports' | 'Verified' | 'Admin / Founder' | string;
  avatar?: string;
  bio?: string;
  createdAt: string;
}

export type CommentTag = 'Tuning Tip' | 'Question' | 'Feedback' | 'Lap Time' | 'General';

export type SupportedF1GameId = 'f1_24' | 'f1_25' | 'f1_26';

export interface SetupComment {
  id: string;
  setupId: string;
  parentId?: string | null;
  authorUsername: string;
  authorBadge?: 'Pro' | 'Verified' | 'Esports' | 'Community' | 'Admin / Founder' | string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  likes: number;
  userLiked?: boolean;
  tag?: CommentTag;
  isPinned?: boolean;
  replies?: SetupComment[];
}

export interface FloatingBannerConfig {
  enabled: boolean;
  title: string;
  highlightText?: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  badgeText?: string;
  onlineCount?: number;
  iconType: 'discord' | 'custom' | 'sparkles' | 'trophy';
  customIconUrl?: string;
  accentColor?: 'indigo' | 'red' | 'emerald' | 'cyan' | 'amber';
}
