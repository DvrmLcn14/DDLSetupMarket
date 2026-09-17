// Helper to generate crisp SVG data URLs representing in-game lap time confirmation screens
export function generateSampleProofImage(
  gameName: string,
  trackName: string,
  carName: string,
  lapTime: string,
  driverName: string
): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450" style="background:#090d16;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">
  <defs>
    <linearGradient id="bgGlow" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0e1726" />
      <stop offset="100%" stop-color="#050811" />
    </linearGradient>
    <linearGradient id="headerGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" stroke-width="0.5" opacity="0.3"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="800" height="450" fill="url(#bgGlow)" />
  <rect width="800" height="450" fill="url(#grid)" />

  <!-- Top In-Game Header Bar -->
  <rect x="0" y="0" width="800" height="48" fill="#0b1120" stroke="#1e293b" stroke-width="1" />
  <rect x="0" y="0" width="8" height="48" fill="url(#headerGrad)" />
  
  <text x="24" y="30" fill="#38bdf8" font-size="14" font-weight="bold" letter-spacing="2">OFFICIAL SESSION TIME TRIAL • LEADERBOARD</text>
  <text x="770" y="30" fill="#94a3b8" font-size="12" text-anchor="end">${gameName.toUpperCase()}</text>

  <!-- Track & Vehicle Header Block -->
  <rect x="24" y="68" width="752" height="64" rx="8" fill="#131d31" stroke="#1e293b" />
  <text x="44" y="94" fill="#94a3b8" font-size="11" font-weight="bold" letter-spacing="1">LOCATION &amp; VEHICLE</text>
  <text x="44" y="118" fill="#f8fafc" font-size="16" font-weight="bold">${trackName} • ${carName}</text>
  <text x="752" y="106" fill="#38bdf8" font-size="12" text-anchor="end">Driver: @${driverName}</text>

  <!-- Main Lap Time Display -->
  <rect x="24" y="148" width="752" height="150" rx="10" fill="#0f172a" stroke="#0284c7" stroke-width="1.5" />
  <rect x="24" y="148" width="752" height="4" fill="url(#headerGrad)" />
  
  <text x="50" y="184" fill="#94a3b8" font-size="11" font-weight="bold" letter-spacing="1.5">RECORDED BEST LAP TIME (VALIDATED)</text>
  <text x="50" y="254" fill="#10b981" font-size="56" font-weight="900" letter-spacing="2">${lapTime}</text>
  
  <!-- Sectors -->
  <g transform="translate(480, 185)">
    <rect x="0" y="0" width="85" height="48" rx="6" fill="#1e293b" />
    <text x="42" y="18" fill="#cbd5e1" font-size="9" text-anchor="middle">SECTOR 1</text>
    <text x="42" y="38" fill="#c084fc" font-size="13" font-weight="bold" text-anchor="middle">PURPLE</text>

    <rect x="95" y="0" width="85" height="48" rx="6" fill="#1e293b" />
    <text x="137" y="18" fill="#cbd5e1" font-size="9" text-anchor="middle">SECTOR 2</text>
    <text x="137" y="38" fill="#c084fc" font-size="13" font-weight="bold" text-anchor="middle">PURPLE</text>

    <rect x="190" y="0" width="85" height="48" rx="6" fill="#1e293b" />
    <text x="232" y="18" fill="#cbd5e1" font-size="9" text-anchor="middle">SECTOR 3</text>
    <text x="232" y="38" fill="#34d399" font-size="13" font-weight="bold" text-anchor="middle">GREEN</text>
  </g>

  <!-- Telemetry & Track Limits Verification Stamp -->
  <g transform="translate(24, 318)">
    <rect width="752" height="96" rx="8" fill="#091322" stroke="#10b981" stroke-width="1.2" stroke-dasharray="4,4" />
    <circle cx="48" cy="48" r="22" fill="#10b981" fill-opacity="0.15" stroke="#10b981" stroke-width="1.5" />
    <path d="M 40 48 L 46 54 L 57 42" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />

    <text x="86" y="42" fill="#10b981" font-size="14" font-weight="bold" letter-spacing="1">TRACK LIMITS &amp; TELEMETRY VERIFIED</text>
    <text x="86" y="64" fill="#94a3b8" font-size="11">Lap completed without invalidation or off-track penalties. Validated session export.</text>
    
    <text x="730" y="52" fill="#64748b" font-size="11" text-anchor="end">Hash: #SIM-VERIFIED-LAP</text>
  </g>
</svg>
`.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// Preset samples for easy one-click testing in creation form
export const SAMPLE_PROOFS = [
  {
    id: 'f1_25_spa',
    label: 'F1 25 • Spa-Francorchamps (1:42.118)',
    game: 'F1 25',
    track: 'Spa-Francorchamps',
    car: 'Scuderia Ferrari SF-25',
    lapTime: '1:42.118',
    driver: 'BremboBrakeKing',
  },
  {
    id: 'iracing_monza',
    label: 'iRacing • Monza GP (1:19.420)',
    game: 'iRacing',
    track: 'Monza',
    car: 'Dallara iR-01',
    lapTime: '1:19.420',
    driver: 'SimApex_Racer',
  },
  {
    id: 'acc_silverstone',
    label: 'ACC • Silverstone GP (1:24.303)',
    game: 'Assetto Corsa Competizione',
    track: 'Silverstone',
    car: 'Ferrari 296 GT3',
    lapTime: '1:24.303',
    driver: 'GT3_Champion',
  },
];
