/**
 * Sim Racing Nomenclature & Intelligent Auto-Correction Engine
 * 
 * Provides official motorsport nomenclatures, alias mapping, typo detection,
 * and fuzzy Levenshtein/token matching for Sim Racing Tracks and Car Models.
 */

export interface CorrectionResult {
  original: string;
  corrected: string;
  wasCorrected: boolean;
  confidence: number; // 0.0 to 1.0
  trackId?: string;
  category?: string;
  manufacturer?: string;
}

export interface OfficialTrackEntry {
  id: string;
  officialName: string;
  shortName: string;
  aliases: string[];
  country: string;
  games: string[];
}

export interface OfficialCarEntry {
  officialName: string;
  shortName: string;
  manufacturer: string;
  category: 'F1' | 'GT3' | 'GT4' | 'Hypercar' | 'LMP2' | 'GTE' | 'Touring / Cup' | 'Open Wheel' | 'Road / Sport';
  aliases: string[];
  games: string[];
}

// -----------------------------------------------------------------------------
// 1. OFFICIAL TRACKS CATALOG & TYPO MAP
// -----------------------------------------------------------------------------
export const OFFICIAL_TRACKS_CATALOG: OfficialTrackEntry[] = [
  // F1 Calendar & Famous Grand Prix Tracks
  {
    id: 'spa',
    officialName: 'Circuit de Spa-Francorchamps',
    shortName: 'Spa-Francorchamps',
    country: 'Belgium',
    aliases: ['spa', 'spaa', 'spa francorchamps', 'spa-francorchamps', 'spa francochamps', 'francorchamps', 'spa gp', 'circuit de spa'],
    games: ['f1_25', 'f1_26', 'acc', 'iracing', 'ac', 'lmu', 'ams2'],
  },
  {
    id: 'monza',
    officialName: 'Autodromo Nazionale Monza',
    shortName: 'Monza',
    country: 'Italy',
    aliases: ['monza', 'monzza', 'autodromo monza', 'autodromo nazionale di monza', 'monza gp', 'temple of speed'],
    games: ['f1_25', 'f1_26', 'acc', 'iracing', 'ac', 'lmu', 'ams2'],
  },
  {
    id: 'silverstone',
    officialName: 'Silverstone Circuit',
    shortName: 'Silverstone',
    country: 'United Kingdom',
    aliases: ['silverstone', 'silverston', 'silver stone', 'silverstone gp', 'silverstone circuit', 'silverstone international'],
    games: ['f1_25', 'f1_26', 'acc', 'iracing', 'ac', 'lmu', 'ams2'],
  },
  {
    id: 'nurburgring_nordschleife',
    officialName: 'Nürburgring Nordschleife',
    shortName: 'Nordschleife',
    country: 'Germany',
    aliases: ['nordschleife', 'nurburgring', 'nuerburgring', 'nurburg', 'green hell', 'nords', 'nurburgring nordschleife', 'nurburgring 24h', 'nurburgring endurance'],
    games: ['acc', 'iracing', 'ac', 'ams2'],
  },
  {
    id: 'nurburgring_gp',
    officialName: 'Nürburgring GP Strecke',
    shortName: 'Nürburgring GP',
    country: 'Germany',
    aliases: ['nurburgring gp', 'nuerburgring gp', 'nurburgring grand prix', 'nurburg gp'],
    games: ['acc', 'iracing', 'ac', 'ams2'],
  },
  {
    id: 'lemans',
    officialName: 'Circuit de la Sarthe (Le Mans 24h)',
    shortName: 'Le Mans (La Sarthe)',
    country: 'France',
    aliases: ['le mans', 'lemans', 'la sarthe', 'circuit de la sarthe', '24h le mans', 'le mans 24', 'sarthe'],
    games: ['lmu', 'iracing', 'ac', 'ams2'],
  },
  {
    id: 'bathurst',
    officialName: 'Mount Panorama Circuit (Bathurst)',
    shortName: 'Mount Panorama (Bathurst)',
    country: 'Australia',
    aliases: ['bathurst', 'mount panorama', 'mt panorama', 'mount pannorama', 'mount panorama circuit', 'bathurst 12h'],
    games: ['acc', 'iracing', 'ac', 'ams2'],
  },
  {
    id: 'suzuka',
    officialName: 'Suzuka International Racing Course',
    shortName: 'Suzuka',
    country: 'Japan',
    aliases: ['suzuka', 'suzzuka', 'suzuka circuit', 'suzuka international', 'suzuka gp'],
    games: ['f1_25', 'f1_26', 'acc', 'iracing', 'ac', 'ams2'],
  },
  {
    id: 'monaco',
    officialName: 'Circuit de Monaco',
    shortName: 'Monaco (Monte Carlo)',
    country: 'Monaco',
    aliases: ['monaco', 'monte carlo', 'montecarlo', 'circuit de monaco', 'monaco gp'],
    games: ['f1_25', 'f1_26', 'ac', 'ams2'],
  },
  {
    id: 'redbullring',
    officialName: 'Red Bull Ring (Spielberg)',
    shortName: 'Red Bull Ring',
    country: 'Austria',
    aliases: ['red bull ring', 'redbull ring', 'redbullring', 'spielberg', 'a1 ring', 'oesterreichring', 'red bull ring spielberg'],
    games: ['f1_25', 'f1_26', 'acc', 'iracing', 'ac', 'ams2'],
  },
  {
    id: 'zandvoort',
    officialName: 'Circuit Zandvoort',
    shortName: 'Zandvoort',
    country: 'Netherlands',
    aliases: ['zandvoort', 'zandvort', 'zandvord', 'circuit zandvoort', 'zandvoort gp', 'dutch gp'],
    games: ['f1_25', 'f1_26', 'acc', 'iracing', 'ac', 'ams2'],
  },
  {
    id: 'interlagos',
    officialName: 'Autódromo José Carlos Pace (Interlagos)',
    shortName: 'Interlagos (São Paulo)',
    country: 'Brazil',
    aliases: ['interlagos', 'inter lagos', 'sao paulo', 'são paulo', 'jose carlos pace', 'autodromo interlagos', 'interlagos gp'],
    games: ['f1_25', 'f1_26', 'iracing', 'ac', 'ams2'],
  },
  {
    id: 'cota',
    officialName: 'Circuit of the Americas (Austin COTA)',
    shortName: 'COTA (Austin)',
    country: 'United States',
    aliases: ['cota', 'austin', 'circuit of the americas', 'austin f1', 'austin cota', 'americas', 'circuit of americas'],
    games: ['f1_25', 'f1_26', 'acc', 'iracing', 'ac', 'ams2'],
  },
  {
    id: 'imola',
    officialName: 'Autodromo Enzo e Dino Ferrari (Imola)',
    shortName: 'Imola',
    country: 'Italy',
    aliases: ['imola', 'autodromo di imola', 'enzo e dino ferrari', 'imola gp', 'autodromo enzo e dino ferrari'],
    games: ['f1_25', 'f1_26', 'acc', 'iracing', 'ac', 'lmu', 'ams2'],
  },
  {
    id: 'catalunya',
    officialName: 'Circuit de Barcelona-Catalunya',
    shortName: 'Barcelona-Catalunya',
    country: 'Spain',
    aliases: ['catalunya', 'barcelona', 'montmelo', 'montmeló', 'circuit de catalunya', 'circuit de barcelona', 'barcelona catalunya', 'spanish gp'],
    games: ['f1_25', 'f1_26', 'acc', 'iracing', 'ac', 'ams2'],
  },
  {
    id: 'hungaroring',
    officialName: 'Hungaroring (Budapest)',
    shortName: 'Hungaroring',
    country: 'Hungary',
    aliases: ['hungaroring', 'hungaro ring', 'hungary', 'budapest', 'hungaroring gp', 'mogyorod'],
    games: ['f1_25', 'f1_26', 'acc', 'iracing', 'ac', 'ams2'],
  },
  {
    id: 'canada',
    officialName: 'Circuit Gilles Villeneuve (Montreal)',
    shortName: 'Montreal (Gilles Villeneuve)',
    country: 'Canada',
    aliases: ['canada', 'montreal', 'gilles villeneuve', 'circuit gilles villeneuve', 'circuit montreal', 'canadian gp'],
    games: ['f1_25', 'f1_26', 'iracing', 'ac', 'ams2'],
  },
  {
    id: 'bahrain',
    officialName: 'Bahrain International Circuit (Sakhir)',
    shortName: 'Bahrain (Sakhir)',
    country: 'Bahrain',
    aliases: ['bahrain', 'sakhir', 'bahrain international', 'bahrain international circuit', 'sakhir gp'],
    games: ['f1_25', 'f1_26', 'lmu', 'iracing', 'ac', 'ams2'],
  },
  {
    id: 'jeddah',
    officialName: 'Jeddah Corniche Circuit',
    shortName: 'Jeddah',
    country: 'Saudi Arabia',
    aliases: ['jeddah', 'jedah', 'jeddah corniche', 'jeddah corniche circuit', 'saudi gp'],
    games: ['f1_25', 'f1_26', 'ac', 'ams2'],
  },
  {
    id: 'shanghai',
    officialName: 'Shanghai International Circuit',
    shortName: 'Shanghai',
    country: 'China',
    aliases: ['shanghai', 'shanghi', 'shanghai international', 'shanghai circuit', 'chinese gp'],
    games: ['f1_25', 'f1_26', 'iracing', 'ac', 'ams2'],
  },
  {
    id: 'miami',
    officialName: 'Miami International Autodrome',
    shortName: 'Miami Autodrome',
    country: 'United States',
    aliases: ['miami', 'miami gp', 'miami autodrome', 'hard rock stadium circuit'],
    games: ['f1_25', 'f1_26', 'ac'],
  },
  {
    id: 'baku',
    officialName: 'Baku City Circuit',
    shortName: 'Baku City Circuit',
    country: 'Azerbaijan',
    aliases: ['baku', 'azerbaijan', 'baku street circuit', 'baku city circuit', 'baku gp'],
    games: ['f1_25', 'f1_26', 'ac'],
  },
  {
    id: 'singapore',
    officialName: 'Marina Bay Street Circuit (Singapore)',
    shortName: 'Marina Bay (Singapore)',
    country: 'Singapore',
    aliases: ['singapore', 'marina bay', 'marina bay street circuit', 'singapore gp'],
    games: ['f1_25', 'f1_26', 'ac', 'ams2'],
  },
  {
    id: 'mexico',
    officialName: 'Autódromo Hermanos Rodríguez (Mexico City)',
    shortName: 'Mexico City (Hermanos Rodríguez)',
    country: 'Mexico',
    aliases: ['mexico', 'mexico city', 'hermanos rodriguez', 'autodromo hermanos rodriguez', 'mexican gp'],
    games: ['f1_25', 'f1_26', 'ac', 'ams2'],
  },
  {
    id: 'lasvegas',
    officialName: 'Las Vegas Strip Circuit',
    shortName: 'Las Vegas Strip',
    country: 'United States',
    aliases: ['las vegas', 'vegas', 'las vegas strip', 'vegas gp', 'las vegas strip circuit'],
    games: ['f1_25', 'f1_26', 'ac'],
  },
  {
    id: 'losail',
    officialName: 'Lusail International Circuit (Qatar)',
    shortName: 'Lusail (Qatar)',
    country: 'Qatar',
    aliases: ['losail', 'lusail', 'qatar', 'lusail international circuit', 'qatar gp'],
    games: ['f1_25', 'f1_26', 'lmu', 'ac'],
  },
  {
    id: 'abudhabi',
    officialName: 'Yas Marina Circuit (Abu Dhabi)',
    shortName: 'Yas Marina (Abu Dhabi)',
    country: 'United Arab Emirates',
    aliases: ['abu dhabi', 'abudhabi', 'yas marina', 'yas marina circuit', 'yas island', 'abu dabi'],
    games: ['f1_25', 'f1_26', 'ac', 'ams2'],
  },
  {
    id: 'melbourne',
    officialName: 'Albert Park Circuit (Melbourne)',
    shortName: 'Albert Park (Melbourne)',
    country: 'Australia',
    aliases: ['melbourne', 'albert park', 'albert park circuit', 'australian gp'],
    games: ['f1_25', 'f1_26', 'ac', 'ams2'],
  },
  // Famous North American / Endurance Tracks
  {
    id: 'lagunaseca',
    officialName: 'WeatherTech Raceway Laguna Seca',
    shortName: 'Laguna Seca',
    country: 'United States',
    aliases: ['laguna seca', 'lagunaseca', 'laguna', 'weathertech raceway laguna seca', 'corkscrew'],
    games: ['acc', 'iracing', 'ac', 'ams2'],
  },
  {
    id: 'sebring',
    officialName: 'Sebring International Raceway',
    shortName: 'Sebring Raceway',
    country: 'United States',
    aliases: ['sebring', 'sebring 12h', 'sebring international raceway', 'sebring international'],
    games: ['iracing', 'lmu', 'ac', 'ams2'],
  },
  {
    id: 'watkinsglen',
    officialName: 'Watkins Glen International',
    shortName: 'Watkins Glen',
    country: 'United States',
    aliases: ['watkins glen', 'watkins', 'the glen', 'watkins glenn', 'watkins glen international'],
    games: ['acc', 'iracing', 'ac', 'ams2'],
  },
  {
    id: 'roadamerica',
    officialName: 'Road America (Elkhart Lake)',
    shortName: 'Road America',
    country: 'United States',
    aliases: ['road america', 'elkhart lake', 'roadamerica'],
    games: ['acc', 'iracing', 'ac', 'ams2'],
  },
  {
    id: 'daytona',
    officialName: 'Daytona International Speedway (Road Course)',
    shortName: 'Daytona Road Course',
    country: 'United States',
    aliases: ['daytona', 'daytona road course', 'daytona 24h', 'daytona international speedway', 'daytona rc'],
    games: ['iracing', 'ac', 'ams2'],
  },
  {
    id: 'brandshatch',
    officialName: 'Brands Hatch (GP Circuit)',
    shortName: 'Brands Hatch GP',
    country: 'United Kingdom',
    aliases: ['brands hatch', 'brandshatch', 'brands', 'brands hatch gp', 'brands hatch indy'],
    games: ['acc', 'iracing', 'ac', 'ams2'],
  },
  {
    id: 'kyalami',
    officialName: 'Kyalami Grand Prix Circuit',
    shortName: 'Kyalami GP',
    country: 'South Africa',
    aliases: ['kyalami', 'kyalami grand prix circuit', 'kyalami gp', 'kyalami 9h'],
    games: ['acc', 'ac', 'ams2'],
  },
  {
    id: 'donington',
    officialName: 'Donington Park Circuit',
    shortName: 'Donington Park',
    country: 'United Kingdom',
    aliases: ['donington', 'donnington', 'donington park', 'donington park circuit', 'donington gp'],
    games: ['acc', 'iracing', 'ac', 'ams2'],
  },
  {
    id: 'paulricard',
    officialName: 'Circuit Paul Ricard (Le Castellet)',
    shortName: 'Paul Ricard',
    country: 'France',
    aliases: ['paul ricard', 'le castellet', 'paulricard', 'circuit paul ricard'],
    games: ['acc', 'ac', 'ams2'],
  },
  {
    id: 'misano',
    officialName: 'Misano World Circuit Marco Simoncelli',
    shortName: 'Misano Circuit',
    country: 'Italy',
    aliases: ['misano', 'misano world circuit', 'marco simoncelli', 'misano adriatico'],
    games: ['acc', 'iracing', 'ac', 'ams2'],
  },
  {
    id: 'zolder',
    officialName: 'Circuit Zolder',
    shortName: 'Circuit Zolder',
    country: 'Belgium',
    aliases: ['zolder', 'circuit zolder', 'circuit terlaemen'],
    games: ['acc', 'iracing', 'ac', 'ams2'],
  },
  {
    id: 'oultonpark',
    officialName: 'Oulton Park Circuit',
    shortName: 'Oulton Park',
    country: 'United Kingdom',
    aliases: ['oulton park', 'oulton', 'oultonpark', 'oulton park circuit'],
    games: ['acc', 'iracing', 'ac', 'ams2'],
  },
  {
    id: 'fuji',
    officialName: 'Fuji International Speedway',
    shortName: 'Fuji Speedway',
    country: 'Japan',
    aliases: ['fuji', 'fuji speedway', 'fuji international speedway', 'fuji gp'],
    games: ['lmu', 'iracing', 'ac', 'ams2'],
  },
  {
    id: 'interlagos_ams2',
    officialName: 'Autódromo de Interlagos Historic',
    shortName: 'Interlagos Classic',
    country: 'Brazil',
    aliases: ['interlagos classic', 'interlagos 1980', 'interlagos historic'],
    games: ['ams2', 'ac'],
  }
];

// -----------------------------------------------------------------------------
// 2. OFFICIAL CARS CATALOG & TYPO / ALIAS MAP
// -----------------------------------------------------------------------------
export const OFFICIAL_CARS_CATALOG: OfficialCarEntry[] = [
  // GT3 & GT4 Cars
  {
    officialName: 'Porsche 992 GT3 R',
    shortName: 'Porsche 992 GT3 R',
    manufacturer: 'Porsche',
    category: 'GT3',
    aliases: [
      'porsche 992 gt3 r',
      'porsceh 991 gtr',
      'porsceh 992',
      'porsche 992',
      'porsche 992 gt3',
      'porshe 992',
      'porche 992',
      'porsche gt3 r',
      '992 gt3 r',
      '992 gt3',
      'porsche gt3',
      'porsche 992 r',
    ],
    games: ['acc', 'iracing', 'ac', 'ams2'],
  },
  {
    officialName: 'Porsche 991.2 GT3 R',
    shortName: 'Porsche 991.2 GT3 R',
    manufacturer: 'Porsche',
    category: 'GT3',
    aliases: ['porsche 991.2 gt3 r', 'porsche 991 gt3 r', 'porsche 991 gt3', 'porsceh 991', '991.2 gt3 r', '991 gt3 r'],
    games: ['acc', 'iracing', 'ac'],
  },
  {
    officialName: 'Porsche 992 GT3 Cup',
    shortName: 'Porsche 992 Cup',
    manufacturer: 'Porsche',
    category: 'Touring / Cup',
    aliases: ['porsche cup', 'porsche 992 cup', 'porsche gt3 cup', '992 cup', '992 gt3 cup'],
    games: ['acc', 'iracing', 'ac', 'ams2'],
  },
  {
    officialName: 'Ferrari 296 GT3',
    shortName: 'Ferrari 296 GT3',
    manufacturer: 'Ferrari',
    category: 'GT3',
    aliases: [
      'ferrari 296 gt3',
      'ferari 296',
      'ferari 296 gt3',
      'ferrari 296',
      '296 gt3',
      'ferrari gt3',
      'ferrari 296 gtb gt3',
    ],
    games: ['acc', 'iracing', 'ac', 'ams2'],
  },
  {
    officialName: 'Ferrari 488 GT3 Evo 2020',
    shortName: 'Ferrari 488 GT3 Evo',
    manufacturer: 'Ferrari',
    category: 'GT3',
    aliases: ['ferrari 488 gt3 evo', 'ferrari 488', 'ferari 488', '488 gt3 evo', '488 gt3', 'ferrari 488 evo'],
    games: ['acc', 'iracing', 'ac'],
  },
  {
    officialName: 'Mercedes-AMG GT3 Evo',
    shortName: 'Mercedes-AMG GT3 Evo',
    manufacturer: 'Mercedes-AMG',
    category: 'GT3',
    aliases: [
      'mercedes-amg gt3 evo',
      'mercedes amg gt3 evo',
      'mercedes gt3 evo',
      'merc amg gt3',
      'amg gt3 evo',
      'amg gt3',
      'mercedes gt3',
      'merc gt3 evo',
      'mercedes-amg gt3',
    ],
    games: ['acc', 'iracing', 'ac', 'ams2'],
  },
  {
    officialName: 'McLaren 720S GT3 Evo',
    shortName: 'McLaren 720S GT3 Evo',
    manufacturer: 'McLaren',
    category: 'GT3',
    aliases: [
      'mclaren 720s gt3 evo',
      'maclaren 720s',
      'mclaren 720s',
      'mclaren 720',
      '720s gt3 evo',
      '720s gt3',
      'mclaren gt3 evo',
      'mclaren 720 gt3',
      'maclaren gt3',
    ],
    games: ['acc', 'iracing', 'ac', 'ams2'],
  },
  {
    officialName: 'BMW M4 GT3',
    shortName: 'BMW M4 GT3',
    manufacturer: 'BMW',
    category: 'GT3',
    aliases: [
      'bmw m4 gt3',
      'bmw m4',
      'bmw gt3',
      'm4 gt3',
      'bmw m4 gt3 evo',
      'bmw motorsport m4',
    ],
    games: ['acc', 'iracing', 'ac', 'ams2'],
  },
  {
    officialName: 'Audi R8 LMS GT3 Evo II',
    shortName: 'Audi R8 LMS Evo II',
    manufacturer: 'Audi',
    category: 'GT3',
    aliases: [
      'audi r8 lms gt3 evo ii',
      'audi r8 gt3 evo ii',
      'audi r8 lms evo 2',
      'audi r8 gt3',
      'audi r8',
      'r8 gt3 evo',
      'audi r8 lms evo',
      'audi gt3',
    ],
    games: ['acc', 'iracing', 'ac'],
  },
  {
    officialName: 'Aston Martin Vantage AMR GT3 Evo',
    shortName: 'Aston Martin Vantage GT3 Evo',
    manufacturer: 'Aston Martin',
    category: 'GT3',
    aliases: [
      'aston martin vantage amr gt3 evo',
      'aston martin vantage gt3',
      'aston martin vantage',
      'aston vantage gt3',
      'vantage gt3 evo',
      'vantage gt3',
      'aston gt3',
    ],
    games: ['acc', 'iracing', 'ac', 'ams2'],
  },
  {
    officialName: 'Lamborghini Huracán GT3 EVO2',
    shortName: 'Lamborghini Huracán EVO2',
    manufacturer: 'Lamborghini',
    category: 'GT3',
    aliases: [
      'lamborghini huracan gt3 evo2',
      'lamborghini huracan evo 2',
      'lambo huracan gt3 evo2',
      'lambo huracan',
      'lamborghini huracan',
      'huracan gt3 evo2',
      'huracan gt3',
      'lambo gt3',
    ],
    games: ['acc', 'iracing', 'ac'],
  },
  {
    officialName: 'Chevrolet Corvette Z06 GT3.R',
    shortName: 'Corvette Z06 GT3.R',
    manufacturer: 'Chevrolet',
    category: 'GT3',
    aliases: [
      'chevrolet corvette z06 gt3.r',
      'corvette z06 gt3.r',
      'corvette z06 gt3',
      'corvette gt3',
      'corvette z06',
      'vette z06 gt3',
      'corvette c8 gt3',
    ],
    games: ['iracing', 'ac', 'ams2', 'acc'],
  },
  {
    officialName: 'Ford Mustang GT3',
    shortName: 'Ford Mustang GT3',
    manufacturer: 'Ford',
    category: 'GT3',
    aliases: ['ford mustang gt3', 'mustang gt3', 'ford gt3', 'mustang gt3 race car'],
    games: ['acc', 'iracing', 'ac', 'ams2'],
  },

  // Hypercars & LMDh (Le Mans Ultimate & iRacing)
  {
    officialName: 'Ferrari 499P Hypercar',
    shortName: 'Ferrari 499P',
    manufacturer: 'Ferrari',
    category: 'Hypercar',
    aliases: ['ferrari 499p', '499p', 'ferrari hypercar', 'ferrari 499p lmdh', 'ferrari lmh'],
    games: ['lmu', 'ac'],
  },
  {
    officialName: 'Porsche 963 LMDh',
    shortName: 'Porsche 963 LMDh',
    manufacturer: 'Porsche',
    category: 'Hypercar',
    aliases: ['porsche 963', 'porsche 963 lmdh', 'porsceh 963', '963 lmdh', 'porsche hypercar'],
    games: ['lmu', 'iracing', 'ac'],
  },
  {
    officialName: 'BMW M Hybrid V8 LMDh',
    shortName: 'BMW M Hybrid V8',
    manufacturer: 'BMW',
    category: 'Hypercar',
    aliases: ['bmw m hybrid v8', 'bmw lmdh', 'bmw hybrid v8', 'm hybrid v8', 'bmw hypercar'],
    games: ['lmu', 'iracing', 'ac'],
  },
  {
    officialName: 'Cadillac V-Series.R LMDh',
    shortName: 'Cadillac V-Series.R',
    manufacturer: 'Cadillac',
    category: 'Hypercar',
    aliases: ['cadillac v-series.r', 'cadillac v series r', 'cadillac lmdh', 'cadillac hypercar', 'v-series.r'],
    games: ['lmu', 'iracing', 'ac'],
  },
  {
    officialName: 'Toyota GR010 Hybrid LMH',
    shortName: 'Toyota GR010 Hybrid',
    manufacturer: 'Toyota',
    category: 'Hypercar',
    aliases: ['toyota gr010 hybrid', 'toyota gr010', 'gr010', 'toyota hypercar', 'toyota gazoo gr010'],
    games: ['lmu', 'ac'],
  },
  {
    officialName: 'Peugeot 9X8 2024 LMH',
    shortName: 'Peugeot 9X8',
    manufacturer: 'Peugeot',
    category: 'Hypercar',
    aliases: ['peugeot 9x8', 'peugeot 9x8 2024', '9x8', 'peugeot hypercar'],
    games: ['lmu', 'ac'],
  },
  {
    officialName: 'Alpine A424 LMDh',
    shortName: 'Alpine A424',
    manufacturer: 'Alpine',
    category: 'Hypercar',
    aliases: ['alpine a424', 'alpine a424 lmdh', 'a424', 'alpine hypercar'],
    games: ['lmu', 'ac'],
  },
  {
    officialName: 'Oreca 07 LMP2 Gibson',
    shortName: 'Oreca 07 LMP2',
    manufacturer: 'Oreca',
    category: 'LMP2',
    aliases: ['oreca 07', 'oreca 07 lmp2', 'oreca lmp2', 'lmp2 oreca', 'oreca 07 gibson'],
    games: ['lmu', 'iracing', 'ac'],
  },

  // Formula 1 2025 & 2026 Cars
  {
    officialName: 'Scuderia Ferrari SF-25',
    shortName: 'Ferrari SF-25',
    manufacturer: 'Scuderia Ferrari',
    category: 'F1',
    aliases: ['ferrari sf-25', 'ferrari sf25', 'sf-25', 'sf25', 'ferari sf25', 'ferrari f1 2025', 'scuderia ferrari sf-25'],
    games: ['f1_25', 'f1_26', 'ac'],
  },
  {
    officialName: 'Oracle Red Bull Racing RB21',
    shortName: 'Red Bull RB21',
    manufacturer: 'Red Bull Racing',
    category: 'F1',
    aliases: ['red bull rb21', 'redbull rb21', 'rb21', 'red bull racing rb21', 'redbull 2025', 'rb-21'],
    games: ['f1_25', 'f1_26', 'ac'],
  },
  {
    officialName: 'McLaren MCL39',
    shortName: 'McLaren MCL39',
    manufacturer: 'McLaren F1 Team',
    category: 'F1',
    aliases: ['mclaren mcl39', 'maclaren mcl39', 'mcl39', 'mclaren 2025', 'mclaren f1 2025', 'mcl-39'],
    games: ['f1_25', 'f1_26', 'ac'],
  },
  {
    officialName: 'Mercedes-AMG F1 W16 E Performance',
    shortName: 'Mercedes-AMG W16',
    manufacturer: 'Mercedes-AMG F1',
    category: 'F1',
    aliases: ['mercedes w16', 'mercedes-amg w16', 'merc w16', 'w16', 'mercedes f1 2025', 'amg w16'],
    games: ['f1_25', 'f1_26', 'ac'],
  },
  {
    officialName: 'Aston Martin AMR25',
    shortName: 'Aston Martin AMR25',
    manufacturer: 'Aston Martin F1',
    category: 'F1',
    aliases: ['aston martin amr25', 'amr25', 'aston amr25', 'amr-25', 'aston f1 2025'],
    games: ['f1_25', 'f1_26', 'ac'],
  },
  {
    officialName: 'Alpine A525',
    shortName: 'Alpine A525',
    manufacturer: 'Alpine F1 Team',
    category: 'F1',
    aliases: ['alpine a525', 'a525', 'alpine f1 2025', 'a-525'],
    games: ['f1_25', 'f1_26', 'ac'],
  },
  {
    officialName: 'Williams Racing FW47',
    shortName: 'Williams FW47',
    manufacturer: 'Williams Racing',
    category: 'F1',
    aliases: ['williams fw47', 'fw47', 'williams f1 2025', 'fw-47'],
    games: ['f1_25', 'f1_26', 'ac'],
  },
  {
    officialName: 'Stake F1 Team Kick Sauber C45',
    shortName: 'Sauber C45',
    manufacturer: 'Sauber',
    category: 'F1',
    aliases: ['sauber c45', 'kick sauber c45', 'c45', 'stake f1 c45'],
    games: ['f1_25', 'f1_26', 'ac'],
  },
  {
    officialName: 'Visa Cash App RB F1 Team VCARB 02',
    shortName: 'Racing Bulls VCARB 02',
    manufacturer: 'Racing Bulls',
    category: 'F1',
    aliases: ['vcarb 02', 'racing bulls vcarb 02', 'vcarb02', 'alphatauri vcarb', 'rb vcarb 02'],
    games: ['f1_25', 'f1_26', 'ac'],
  },
  {
    officialName: 'MoneyGram Haas F1 Team VF-25',
    shortName: 'Haas VF-25',
    manufacturer: 'Haas F1 Team',
    category: 'F1',
    aliases: ['haas vf-25', 'haas vf25', 'vf-25', 'vf25', 'haas 2025'],
    games: ['f1_25', 'f1_26', 'ac'],
  },
  {
    officialName: 'Formula Next Gen 2026 Concept',
    shortName: 'F1 2026 Regs Chassis',
    manufacturer: 'FIA / F1',
    category: 'F1',
    aliases: ['f1 2026', '2026 f1 car', 'f1 2026 concept', 'formula 1 2026 chassis', 'f1-26'],
    games: ['f1_26', 'ac'],
  },

  // Open Wheel / Formula Grassroots
  {
    officialName: 'Super Formula Dallara SF23',
    shortName: 'Super Formula SF23',
    manufacturer: 'Dallara',
    category: 'Open Wheel',
    aliases: ['sf23', 'super formula sf23', 'super formula', 'dallara sf23'],
    games: ['iracing', 'ac', 'ams2'],
  },
  {
    officialName: 'Formula 4 Tatuus F4-T421',
    shortName: 'FIA Formula 4 (Tatuus)',
    manufacturer: 'Tatuus',
    category: 'Open Wheel',
    aliases: ['f4', 'formula 4', 'tatuus f4', 'f4-t421', 'iracing f4', 'fia f4'],
    games: ['iracing', 'ac', 'ams2'],
  },
  {
    officialName: 'Global Mazda MX-5 Cup',
    shortName: 'Mazda MX-5 Cup',
    manufacturer: 'Mazda',
    category: 'Touring / Cup',
    aliases: ['mazda mx-5', 'mazda mx5', 'mx-5 cup', 'mx5 cup', 'miata cup', 'mazda miata'],
    games: ['iracing', 'ac', 'ams2'],
  },
];

// -----------------------------------------------------------------------------
// 3. FUZZY MATCHING & LEVENSHTEIN DISTANCE
// -----------------------------------------------------------------------------

/**
 * Standard Levenshtein Distance algorithm to compute edit operations between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix = Array.from({ length: bn + 1 }, (_, i) => [i]);
  for (let j = 0; j <= an; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[bn][an];
}

/**
 * Normalize string for comparison: lowercase, remove non-alphanumeric (keep spaces and digits), single spacing
 */
export function normalizeSimString(input: string): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .normalize('NFD') // remove accents (e.g., Huracán -> Huracan, São Paulo -> Sao Paulo)
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Proper Title Casing for custom inputs that aren't recognized in the official catalog
 */
export function formatCustomTitleCase(input: string): string {
  if (!input) return '';
  const clean = input.trim().replace(/\s+/g, ' ');
  return clean
    .split(' ')
    .map((word) => {
      // Keep GT3, GT4, EVO, SF-25, F1, V8, LMDh, Cup, etc. properly uppercase/styled
      const lower = word.toLowerCase();
      if (lower === 'gt3' || lower === 'gt4' || lower === 'gt2' || lower === 'gte' || lower === 'gt') return word.toUpperCase();
      if (lower === 'evo' || lower === 'evo2' || lower === 'evoii') return 'Evo';
      if (lower === 'f1') return 'F1';
      if (lower === 'v8' || lower === 'v6' || lower === 'v10' || lower === 'v12') return word.toUpperCase();
      if (lower === 'lmdh' || lower === 'lmh' || lower === 'lmp2' || lower === 'lmp1') return word.toUpperCase();
      if (lower === 'gp') return 'GP';
      if (lower === 'bmw' || lower === 'amg' || lower === 'fia' || lower === 'cota') return word.toUpperCase();
      if (lower === 'rb21' || lower === 'rb20' || lower === 'sf25' || lower === 'sf-25' || lower === 'mcl39' || lower === 'w16') return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

// -----------------------------------------------------------------------------
// 4. INTELLIGENT TRACK AUTO-CORRECTOR
// -----------------------------------------------------------------------------
export function autoCorrectTrackName(userInput: string, targetGameId?: string): CorrectionResult {
  const original = userInput ? userInput.trim() : '';
  if (!original) {
    return {
      original: '',
      corrected: '',
      wasCorrected: false,
      confidence: 0,
    };
  }

  const normalizedInput = normalizeSimString(original);

  // 1. Direct match with aliases or official names
  for (const track of OFFICIAL_TRACKS_CATALOG) {
    const normOfficial = normalizeSimString(track.officialName);
    const normShort = normalizeSimString(track.shortName);

    if (normalizedInput === normOfficial || normalizedInput === normShort) {
      const wasCorrected = original !== track.officialName && original !== track.shortName;
      return {
        original,
        corrected: track.officialName,
        wasCorrected,
        confidence: 1.0,
        trackId: track.id,
      };
    }

    for (const alias of track.aliases) {
      if (normalizedInput === normalizeSimString(alias)) {
        return {
          original,
          corrected: track.officialName,
          wasCorrected: original.toLowerCase() !== track.officialName.toLowerCase(),
          confidence: 0.99,
          trackId: track.id,
        };
      }
    }
  }

  // 2. Substring / Token Inclusion match
  // e.g. "spa francorchamps wet setup", "spa hotlap", "silverstone 2026"
  for (const track of OFFICIAL_TRACKS_CATALOG) {
    for (const alias of track.aliases) {
      const normAlias = normalizeSimString(alias);
      if (normAlias.length >= 3 && (normalizedInput.includes(normAlias) || normAlias.includes(normalizedInput))) {
        return {
          original,
          corrected: track.officialName,
          wasCorrected: original !== track.officialName,
          confidence: 0.88,
          trackId: track.id,
        };
      }
    }
  }

  // 3. Fuzzy Levenshtein matching on all aliases & short names
  let bestMatch: OfficialTrackEntry | null = null;
  let highestSimilarity = 0;

  for (const track of OFFICIAL_TRACKS_CATALOG) {
    const candidates = [track.officialName, track.shortName, ...track.aliases];
    for (const candidate of candidates) {
      const normCandidate = normalizeSimString(candidate);
      const distance = levenshteinDistance(normalizedInput, normCandidate);
      const maxLen = Math.max(normalizedInput.length, normCandidate.length);
      const similarity = maxLen > 0 ? (maxLen - distance) / maxLen : 0;

      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestMatch = track;
      }
    }
  }

  // If fuzzy similarity exceeds threshold (>= 0.65 for typos like "porsceh" or "spaa" or "silverston")
  if (bestMatch && highestSimilarity >= 0.65) {
    return {
      original,
      corrected: bestMatch.officialName,
      wasCorrected: original !== bestMatch.officialName,
      confidence: highestSimilarity,
      trackId: bestMatch.id,
    };
  }

  // 4. If no official match found, format nicely in title case so user is free to submit any custom circuit
  const formattedCustom = formatCustomTitleCase(original);
  return {
    original,
    corrected: formattedCustom,
    wasCorrected: original !== formattedCustom,
    confidence: 0.5,
    trackId: 'custom_' + normalizeSimString(original).replace(/\s+/g, '_'),
  };
}

// -----------------------------------------------------------------------------
// 5. INTELLIGENT CAR AUTO-CORRECTOR
// -----------------------------------------------------------------------------
export function autoCorrectCarName(userInput: string, targetGameId?: string): CorrectionResult {
  const original = userInput ? userInput.trim() : '';
  if (!original) {
    return {
      original: '',
      corrected: '',
      wasCorrected: false,
      confidence: 0,
    };
  }

  const normalizedInput = normalizeSimString(original);

  // 1. Exact alias or official name match
  for (const car of OFFICIAL_CARS_CATALOG) {
    const normOfficial = normalizeSimString(car.officialName);
    const normShort = normalizeSimString(car.shortName);

    if (normalizedInput === normOfficial || normalizedInput === normShort) {
      return {
        original,
        corrected: car.officialName,
        wasCorrected: original !== car.officialName,
        confidence: 1.0,
        category: car.category,
        manufacturer: car.manufacturer,
      };
    }

    for (const alias of car.aliases) {
      if (normalizedInput === normalizeSimString(alias)) {
        return {
          original,
          corrected: car.officialName,
          wasCorrected: original !== car.officialName,
          confidence: 0.99,
          category: car.category,
          manufacturer: car.manufacturer,
        };
      }
    }
  }

  // 2. Specific High-Frequency Sim Racing Typo Heuristics
  // e.g. "porsceh 991 gtr" -> "Porsche 991.2 GT3 R"
  // "porsche 992" -> "Porsche 992 GT3 R"
  // "ferrari 296" -> "Ferrari 296 GT3"
  // "mclaren 720" -> "McLaren 720S GT3 Evo"
  // "amg gt3" -> "Mercedes-AMG GT3 Evo"
  if (normalizedInput.includes('porsceh') || normalizedInput.includes('porche') || normalizedInput.includes('porshe')) {
    if (normalizedInput.includes('991') || normalizedInput.includes('gtr')) {
      const car = OFFICIAL_CARS_CATALOG.find((c) => c.officialName.includes('991.2 GT3 R')) || OFFICIAL_CARS_CATALOG[0];
      return {
        original,
        corrected: car.officialName,
        wasCorrected: true,
        confidence: 0.95,
        category: car.category,
        manufacturer: car.manufacturer,
      };
    }
    if (normalizedInput.includes('992')) {
      const car = OFFICIAL_CARS_CATALOG.find((c) => c.officialName.includes('992 GT3 R')) || OFFICIAL_CARS_CATALOG[0];
      return {
        original,
        corrected: car.officialName,
        wasCorrected: true,
        confidence: 0.95,
        category: car.category,
        manufacturer: car.manufacturer,
      };
    }
  }

  // 3. Substring & Token Inclusion
  for (const car of OFFICIAL_CARS_CATALOG) {
    for (const alias of car.aliases) {
      const normAlias = normalizeSimString(alias);
      if (normAlias.length >= 4 && (normalizedInput.includes(normAlias) || normAlias.includes(normalizedInput))) {
        return {
          original,
          corrected: car.officialName,
          wasCorrected: original !== car.officialName,
          confidence: 0.88,
          category: car.category,
          manufacturer: car.manufacturer,
        };
      }
    }
  }

  // 4. Fuzzy Levenshtein Distance on all car catalog entries
  let bestCar: OfficialCarEntry | null = null;
  let highestSimilarity = 0;

  for (const car of OFFICIAL_CARS_CATALOG) {
    const candidates = [car.officialName, car.shortName, ...car.aliases];
    for (const candidate of candidates) {
      const normCandidate = normalizeSimString(candidate);
      const distance = levenshteinDistance(normalizedInput, normCandidate);
      const maxLen = Math.max(normalizedInput.length, normCandidate.length);
      const similarity = maxLen > 0 ? (maxLen - distance) / maxLen : 0;

      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestCar = car;
      }
    }
  }

  if (bestCar && highestSimilarity >= 0.60) {
    return {
      original,
      corrected: bestCar.officialName,
      wasCorrected: original !== bestCar.officialName,
      confidence: highestSimilarity,
      category: bestCar.category,
      manufacturer: bestCar.manufacturer,
    };
  }

  // 5. Custom car formatting with smart title case
  const formattedCustom = formatCustomTitleCase(original);
  return {
    original,
    corrected: formattedCustom,
    wasCorrected: original !== formattedCustom,
    confidence: 0.5,
  };
}

/**
 * Filter suggestions for autocomplete dropdowns as user types
 */
export function getTrackSuggestions(query: string, limit = 8): OfficialTrackEntry[] {
  if (!query || query.trim() === '') {
    return OFFICIAL_TRACKS_CATALOG.slice(0, limit);
  }
  const norm = normalizeSimString(query);
  const matches: { track: OfficialTrackEntry; score: number }[] = [];

  for (const track of OFFICIAL_TRACKS_CATALOG) {
    let score = 0;
    const normOff = normalizeSimString(track.officialName);
    const normShort = normalizeSimString(track.shortName);

    if (normOff.startsWith(norm) || normShort.startsWith(norm)) {
      score = 100;
    } else if (normOff.includes(norm) || normShort.includes(norm)) {
      score = 70;
    } else {
      for (const alias of track.aliases) {
        const normAlias = normalizeSimString(alias);
        if (normAlias.includes(norm)) {
          score = Math.max(score, 60);
        }
      }
    }

    if (score === 0) {
      const dist = levenshteinDistance(norm, normShort.slice(0, norm.length));
      if (dist <= 2 && norm.length >= 3) {
        score = 40;
      }
    }

    if (score > 0) {
      matches.push({ track, score });
    }
  }

  return matches.sort((a, b) => b.score - a.score).slice(0, limit).map((m) => m.track);
}

export function getCarSuggestions(query: string, limit = 8): OfficialCarEntry[] {
  if (!query || query.trim() === '') {
    return OFFICIAL_CARS_CATALOG.slice(0, limit);
  }
  const norm = normalizeSimString(query);
  const matches: { car: OfficialCarEntry; score: number }[] = [];

  for (const car of OFFICIAL_CARS_CATALOG) {
    let score = 0;
    const normOff = normalizeSimString(car.officialName);
    const normShort = normalizeSimString(car.shortName);
    const normMfr = normalizeSimString(car.manufacturer);

    if (normOff.startsWith(norm) || normShort.startsWith(norm) || normMfr.startsWith(norm)) {
      score = 100;
    } else if (normOff.includes(norm) || normShort.includes(norm)) {
      score = 70;
    } else {
      for (const alias of car.aliases) {
        const normAlias = normalizeSimString(alias);
        if (normAlias.includes(norm)) {
          score = Math.max(score, 60);
        }
      }
    }

    if (score === 0) {
      const dist = levenshteinDistance(norm, normShort.slice(0, norm.length));
      if (dist <= 2 && norm.length >= 3) {
        score = 40;
      }
    }

    if (score > 0) {
      matches.push({ car, score });
    }
  }

  return matches.sort((a, b) => b.score - a.score).slice(0, limit).map((m) => m.car);
}
