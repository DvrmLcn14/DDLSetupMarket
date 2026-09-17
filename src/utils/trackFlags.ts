export const TRACK_FLAGS: Record<string, string> = {
  bahrain: '🇧🇭',
  jeddah: '🇸🇦',
  melbourne: '🇦🇺',
  suzuka: '🇯🇵',
  shanghai: '🇨🇳',
  miami: '🇺🇸',
  imola: '🇮🇹',
  monaco: '🇲🇨',
  canada: '🇨🇦',
  catalunya: '🇪🇸',
  redbullring: '🇦🇹',
  silverstone: '🇬🇧',
  hungaroring: '🇭🇺',
  spa: '🇧🇪',
  zandvoort: '🇳🇱',
  monza: '🇮🇹',
  baku: '🇦🇿',
  singapore: '🇸🇬',
  austin: '🇺🇸',
  mexico: '🇲🇽',
  interlagos: '🇧🇷',
  lasvegas: '🇺🇸',
  losail: '🇶🇦',
  abudhabi: '🇦🇪',
};

export const COUNTRY_NAME_FLAGS: Record<string, string> = {
  bahrain: '🇧🇭',
  sakhir: '🇧🇭',
  'saudi arabia': '🇸🇦',
  jeddah: '🇸🇦',
  australia: '🇦🇺',
  melbourne: '🇦🇺',
  japan: '🇯🇵',
  suzuka: '🇯🇵',
  china: '🇨🇳',
  shanghai: '🇨🇳',
  'united states': '🇺🇸',
  usa: '🇺🇸',
  miami: '🇺🇸',
  austin: '🇺🇸',
  'las vegas': '🇺🇸',
  italy: '🇮🇹',
  imola: '🇮🇹',
  monza: '🇮🇹',
  monaco: '🇲🇨',
  canada: '🇨🇦',
  montreal: '🇨🇦',
  spain: '🇪🇸',
  catalunya: '🇪🇸',
  barcelona: '🇪🇸',
  austria: '🇦🇹',
  spielberg: '🇦🇹',
  'red bull ring': '🇦🇹',
  'united kingdom': '🇬🇧',
  uk: '🇬🇧',
  britain: '🇬🇧',
  silverstone: '🇬🇧',
  hungary: '🇭🇺',
  hungaroring: '🇭🇺',
  budapest: '🇭🇺',
  belgium: '🇧🇪',
  spa: '🇧🇪',
  netherlands: '🇳🇱',
  zandvoort: '🇳🇱',
  azerbaijan: '🇦🇿',
  baku: '🇦🇿',
  singapore: '🇸🇬',
  mexico: '🇲🇽',
  brazil: '🇧🇷',
  interlagos: '🇧🇷',
  qatar: '🇶🇦',
  lusail: '🇶🇦',
  losail: '🇶🇦',
  'united arab emirates': '🇦🇪',
  uae: '🇦🇪',
  'abu dhabi': '🇦🇪',
  germany: '🇩🇪',
  france: '🇫🇷',
};

export function getTrackFlagEmoji(trackId?: string, countryOrTrackName?: string): string {
  if (trackId && TRACK_FLAGS[trackId.toLowerCase()]) {
    return TRACK_FLAGS[trackId.toLowerCase()];
  }

  if (countryOrTrackName) {
    const lower = countryOrTrackName.toLowerCase();
    for (const [key, flag] of Object.entries(COUNTRY_NAME_FLAGS)) {
      if (lower.includes(key)) {
        return flag;
      }
    }
  }

  return '🏁';
}
