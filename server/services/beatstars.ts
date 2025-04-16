import axios from 'axios';
import * as cheerio from 'cheerio';

// Base URL for BeatStars
const BEATSTARS_URL = 'https://www.beatstars.com';

// Default set of genres (in case web scraping fails)
const DEFAULT_GENRES = [
  "Hip-Hop", "Trap", "R&B", "Drill", "Boom Bap", 
  "Lo-Fi", "Jersey Club", "Afrobeats", "Reggaeton",
  "Pop", "EDM", "Soul", "Dancehall", "House"
];

// Default titles by genre (as fallback)
const DEFAULT_TITLES: Record<string, string[]> = {
  "Hip-Hop": [
    "Midnight Thunder", "Urban Echoes", "City Lights", "Soul Progression", 
    "Breakbeat Journey", "Concrete Jungle", "Subway Cypher", "Block Party",
    "Classic Vibes", "Boom Bap Boulevard", "Street Corner", "Vinyl Days",
    "Flow State", "Word Play", "Rhythm Section"
  ],
  "Trap": [
    "Neon Dreams", "Dark Ambition", "808 Waves", "Purple Haze", 
    "Future Vision", "Drip Season", "Flexin'", "Money Talk",
    "Trap House", "Late Night", "On Sight", "Bass Cannon",
    "High Life", "Atlanta Nights", "Codeine Sunset"
  ],
  "R&B": [
    "Velvet Mood", "Smooth Sensation", "Slow Burn", "Passion Flow", 
    "Summer Nights", "Midnight Confessions", "Pillow Talk", "Love Letters",
    "Silky Smooth", "Afterhours", "Tender Touch", "Ocean Waves",
    "Bedroom Eyes", "Candlelight", "Soul Therapy"
  ],
  "Drill": [
    "Street Stories", "Dark Corner", "Night Shift", "Concrete Jungle",
    "Urban Warfare", "Cold Winter", "City Nights", "Block Heat",
    "Gang Activity", "Gritty City", "Street Life", "Hood Dreams",
    "Violent Thoughts", "Dark Alley", "Midnight Hustle"
  ],
  "Boom Bap": [
    "Golden Era", "Vinyl Days", "Turntable Dreams", "Break Beats",
    "Classic Samples", "90s Flavor", "DJ Premier", "Scratched Chorus",
    "Brooklyn Beats", "Jazzy Loops", "Dusty Fingers", "Sample Masters",
    "Hip-Hop Classics", "Turntable Legends", "Lyrical Playground"
  ],
  "Lo-Fi": [
    "Chill Study", "Coffee House", "Rainy Day", "Vinyl Crackle",
    "Late Night Session", "Bedroom Beats", "Sleepy Sunday", "Gentle Waves",
    "Urban Calm", "Soulful Memory", "Dusty Rhodes", "Cloudy Mind",
    "Lazy Afternoon", "Tape Cassette", "Old School Vibe"
  ],
  "Jersey Club": [
    "Dance Floor", "Club Heat", "Party Starter", "Night Vibes",
    "Bounce Back", "Club Energy", "Weekend Fun", "Dance Battle",
    "City Club", "Night Moves", "Beat Drop", "Urban Dance",
    "Rhythm Nation", "Club Anthem", "Dance Fever"
  ],
  "Afrobeats": [
    "Lagos Nights", "African Rhythm", "Tribal Fusion", "Sunset Dance",
    "Tropical Vibes", "Afro Wave", "Island Dreams", "Summer Heat",
    "Beach Party", "African Spirit", "Desert Gold", "Drum Circle",
    "Motherland", "Ancestral Beats", "Sunshine Rhythm"
  ],
  "Reggaeton": [
    "Latino Heat", "Club Caliente", "Playa Vida", "Island Dreams",
    "Tropical Nights", "Summer Vibes", "Latin Rhythm", "Beach Party",
    "Bailando", "Fiesta Nights", "Hot Summer", "Sunset Beach",
    "Caribbean Flow", "Ritmo Latino", "Dance Floor"
  ],
  "Pop": [
    "Radio Hit", "Summer Anthem", "Chart Topper", "Melody Maker",
    "Catchy Chorus", "Mainstream Magic", "Studio Sessions", "Pop Princess",
    "Viral Moment", "Hit Factory", "Earworm", "Dance Pop",
    "Pop Perfection", "Billboard Dreams", "Top 40"
  ],
  "EDM": [
    "Festival Nights", "Drop Zone", "Electric Sky", "Bass Nation",
    "Neon Lights", "Club Remix", "Rave Culture", "Synth Wave",
    "Digital Dreams", "Future Bass", "Laser Show", "Electronic Pulse",
    "Dance Floor", "Beat Drop", "Energy Surge"
  ]
};

/**
 * Sets a custom user agent to avoid being blocked by anti-scraping measures
 */
const axiosInstance = axios.create({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0'
  }
});

/**
 * Fetches all available genres from BeatStars
 */
export async function fetchGenres(): Promise<string[]> {
  try {
    // First, try to fetch the explore page
    const response = await axiosInstance.get(`${BEATSTARS_URL}/explore/beats`, { 
      timeout: 8000 // Set a timeout to avoid long wait times
    });
    
    if (!response.data) {
      console.log('No data returned from BeatStars, using default genres');
      return DEFAULT_GENRES;
    }
    
    const $ = cheerio.load(response.data);
    const genres: string[] = [];
    
    // Looking for genre filters with different selectors
    // First try: dropdown options
    $('select[name="genre"] option, select[class*="genre"] option').each((_: number, element: any) => {
      const genre = $(element).text().trim();
      if (genre && genre !== 'All Genres' && genre !== 'Select Genre' && genre !== 'All' && !genres.includes(genre)) {
        genres.push(genre);
      }
    });
    
    // Second try: filter items or tags
    if (genres.length === 0) {
      $('.genre-filter-item, .filter-item[data-type="genre"], [class*="genre"], [class*="tag"], [class*="filter"]').each((_: number, element: any) => {
        const genre = $(element).text().trim();
        if (genre && 
            !genre.includes('All Genre') && 
            !genre.includes('Filter') &&
            genre.length > 2 && genre.length < 20 &&
            !genres.includes(genre)) {
          genres.push(genre);
        }
      });
    }

    // Third try: look for any elements that might contain genre names
    if (genres.length === 0) {
      $('a, span, div, li').each((_: number, element: any) => {
        const text = $(element).text().trim();
        
        // Check if text looks like a music genre
        if (text && 
            DEFAULT_GENRES.some(g => text.includes(g)) && 
            text.length < 25 &&
            !genres.includes(text)) {
          genres.push(text);
        }
      });
    }

    // If we found genres, return them; otherwise, use defaults
    return genres.length > 0 ? genres : DEFAULT_GENRES;
  } catch (error) {
    console.error('Error fetching genres from BeatStars:', error);
    return DEFAULT_GENRES;
  }
}

/**
 * Fetches beat titles for a specific genre from BeatStars
 */
export async function fetchBeatTitles(genre: string, limit: number = 20): Promise<string[]> {
  try {
    // If we have default titles for this genre and it's a fallback situation, use them
    if (!genre || (DEFAULT_TITLES[genre] && Math.random() < 0.3)) {
      // 30% chance to use defaults to avoid overloading BeatStars with requests
      return DEFAULT_TITLES[genre] || DEFAULT_TITLES["Hip-Hop"] || [];
    }
    
    // Encode the genre for URL
    const encodedGenre = encodeURIComponent(genre);
    const url = `${BEATSTARS_URL}/explore/beats?genre=${encodedGenre}`;
    
    const response = await axiosInstance.get(url, { timeout: 8000 });
    if (!response.data) {
      console.log(`No data returned for genre ${genre}, using defaults if available`);
      return DEFAULT_TITLES[genre] || [];
    }
    
    const $ = cheerio.load(response.data);
    const titles: string[] = [];
    
    // More comprehensive selector targeting beat titles
    $('[class*="title"], h2, h3, h4, .beat-title, .track-title, .track-name, [class*="track"], [class*="song"], [class*="beat"]').each((_: number, element: any) => {
      let title = $(element).text().trim();
      
      // Only process if it looks like a beat title
      if (title && title.length > 3 && title.length < 100) {
        // Clean the title
        title = cleanBeatTitle(title);
        
        // Add if it's a valid title and not a duplicate
        if (title && title.length > 3 && !titles.includes(title)) {
          titles.push(title);
        }
      }
      
      // Stop after reaching the limit
      if (titles.length >= limit) {
        return false;
      }
    });
    
    // If we got no titles or very few, use defaults
    if (titles.length < 5) {
      return DEFAULT_TITLES[genre] || DEFAULT_TITLES["Hip-Hop"] || titles;
    }
    
    return titles;
  } catch (error) {
    console.error(`Error fetching beat titles for genre ${genre}:`, error);
    // Return defaults if available
    return DEFAULT_TITLES[genre] || DEFAULT_TITLES["Hip-Hop"] || [];
  }
}

/**
 * Cleans a beat title by removing common marketing phrases
 * Verbessert nach den spezifischen Anforderungen für die Extraktion reiner Beat-Titel
 */
function cleanBeatTitle(title: string): string {
  // Skip if title is empty
  if (!title) return "";
  
  // Erweiterte Liste von Marketingphrasen, die entfernt werden sollen
  const phrasesToRemove = [
    // Typische Marketing-Phrasen
    /free\s+type\s+beat/i,
    /type\s+beat/i,
    /free\s+beat/i,
    /\(free\)/i,
    /\[free\]/i,
    /instrumental/i,
    /prod\.\s+by.+/i,
    /produced\s+by.+/i,
    /lease this/i,
    /buy this/i,
    /\d+\s*(bpm|k)/i,  // Remove BPM or k (thousand) markers
    /\$\d+/i,          // Remove price markers
    /exclusive/i,
    /premium/i,
    /sale/i,
    /\d{4}/,           // Remove years
    
    // Zusätzliche Marketing-Elemente
    /inspired by/i,
    /like\s+/i,
    /similar to/i,
    /style\s+of/i,
    /for\s+/i,
    /royalty\s+free/i,
    /youtube/i,
    /listen now/i,
    /download now/i,
    /trending/i,
    /viral/i,
    /hot/i,
    /new/i,
    /best/i,
    /top/i,
    
    // Künstlerreferenzen entfernen
    /feat\./i,
    /ft\./i,
    /style/i,
    /vibes*/i,
    /inspired/i
  ];
  
  let cleanedTitle = title;
  
  // Entferne alle Marketing-Phrasen
  phrasesToRemove.forEach(phrase => {
    cleanedTitle = cleanedTitle.replace(phrase, '');
  });
  
  // Entferne Künstlerreferenzen im "Artist x Artist"-Format
  cleanedTitle = cleanedTitle.replace(/^.+\s+x\s+.+\s+(type\s+)?beat/i, '');
  cleanedTitle = cleanedTitle.replace(/\s+x\s+.+$/i, ''); // Entferne "x Artist" am Ende
  
  // Entferne Verweise auf Künstler in Klammern oder eckigen Klammern
  cleanedTitle = cleanedTitle.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '');
  
  // Entferne Anführungszeichen
  cleanedTitle = cleanedTitle.replace(/["']/g, '');
  
  // Entferne Sonderzeichen, die für SEO verwendet werden
  cleanedTitle = cleanedTitle.replace(/[*|"<>[\]{}`\\()#^~!@%&;:,.?]/g, '');
  
  // Bereinige Leerzeichen und trimme
  cleanedTitle = cleanedTitle.replace(/\s+/g, ' ').trim();
  
  // Entferne häufige Suffixe
  cleanedTitle = cleanedTitle.replace(/\s+(beat|loop|sample|track|audio|music|sound|theme|melody|rhythm)$/i, '');
  
  // Kapitalisiere für konsistente Anzeige (wird später in Kleinbuchstaben umgewandelt, wenn nötig)
  cleanedTitle = cleanedTitle.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
  
  // Überprüfe, ob nach der Reinigung noch ein sinnvoller Titel übrig bleibt
  if (cleanedTitle.length < 3 && title.length > 3) {
    // Wenn der Titel zu kurz wurde, versuche eine einfachere Reinigung
    cleanedTitle = title
      .replace(/type\s+beat/i, '')
      .replace(/\([^)]*\)/g, '')
      .replace(/\[[^\]]*\]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
      
    // Kapitalisiere den Ersatz-Titel
    if (cleanedTitle.length >= 3) {
      cleanedTitle = cleanedTitle.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    } else {
      // Wenn immer noch zu kurz, verwende einen Standardtitel basierend auf dem Genre
      return "Beat";
    }
  }
  
  return cleanedTitle;
}