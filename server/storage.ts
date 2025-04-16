import { Favorite, InsertFavorite, BeatTitle, InsertBeatTitle, DEFAULT_METADATA } from "@shared/schema";
import { fetchGenres, fetchBeatTitles } from "./services/beatstars";
import { rephraseBeatTitle as aiRephraseBeatTitle } from "./services/openai";

// Backup static data for when API requests fail
const backupBeatTitlesData: Record<string, string[]> = {
  "Hip-Hop": [
    "Midnight Thunder", 
    "Urban Echoes", 
    "City Lights", 
    "Soul Progression", 
    "Breakbeat Journey",
    "Concrete Jungle",
    "Subway Cypher",
    "Block Party",
    "Classic Vibes",
    "Boom Bap Boulevard"
  ],
  "Trap": [
    "Neon Dreams", 
    "Dark Ambition", 
    "808 Waves", 
    "Purple Haze", 
    "Future Vision",
    "Drip Season",
    "Flexin'",
    "Money Talk",
    "Trap House",
    "Late Night"
  ],
  "R&B": [
    "Velvet Mood", 
    "Smooth Sensation", 
    "Slow Burn", 
    "Passion Flow", 
    "Summer Nights",
    "Midnight Confessions",
    "Pillow Talk",
    "Love Letters",
    "Silky Smooth",
    "Afterhours"
  ],
  "Drill": [
    "Cold Streets", 
    "Night Shift", 
    "Dark Corner", 
    "East Side Story", 
    "London Fog",
    "Slide Through",
    "No Hook",
    "Pressure",
    "Block Heat",
    "Opps"
  ],
  "Boom Bap": [
    "Vinyl Days", 
    "Dusty Samples", 
    "Brooklyn Nights", 
    "Jazz Infusion", 
    "Classic Cuts",
    "Golden Era",
    "Sampler Heaven",
    "Neck Snapper",
    "Breakbeat Bliss",
    "SP1200"
  ],
  "Lo-Fi": [
    "Rainy Window", 
    "Tape Hiss", 
    "Old Memories", 
    "Bedroom Beats", 
    "Autumn Leaves",
    "Coffee Shop",
    "Vinyl Crackle",
    "Late Nights",
    "Chill Study",
    "Jazz Samples"
  ],
  "Jersey Club": [
    "Dance Energy", 
    "Club Essentials", 
    "Bounce Back", 
    "Night Moves", 
    "Party Starter",
    "Bed Squeak",
    "Newark Nights",
    "Kick Pattern",
    "Dance Battle",
    "Club Heat"
  ],
  "Afrobeats": [
    "Lagos Nights",
    "Afro Fusion",
    "Tribal Drums",
    "Sunset Dance",
    "African Rhythm",
    "Summer Vibes",
    "Beach Party",
    "Palm Wine",
    "Island Groove",
    "Diaspora"
  ],
  "Reggaeton": [
    "Latino Heat",
    "Tropical Waves",
    "Dembow Rhythm",
    "Island Dreams",
    "Club Caliente",
    "Noche Loca",
    "Playa Vida",
    "Fiesta Nights",
    "Caribbean Flow",
    "Summer Flex"
  ]
};

// Interface for storage operations
export interface IStorage {
  getGenres(): Promise<string[]>;
  getBeatTitlesByGenre(genre: string): Promise<string[]>;
  generateRandomTitle(genre: string): Promise<string>;
  rephraseBeatTitle(title: string, genre: string): Promise<string>;
  getAllFavorites(): Favorite[];
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(id: number): boolean;
}

// In-memory storage implementation with BeatStars API integration
export class MemStorage implements IStorage {
  private favorites: Map<number, Favorite>;
  private nextFavoriteId: number;
  private cachedGenres: string[] | null = null;
  private cachedTitles: Record<string, string[]> = {};
  private genresFetchTime: number = 0;
  private titlesFetchTime: Record<string, number> = {};

  constructor() {
    this.favorites = new Map();
    this.nextFavoriteId = 1;
  }

  async getGenres(): Promise<string[]> {
    // Check if we have cached genres that are less than 1 hour old
    const now = Date.now();
    const cacheExpired = now - this.genresFetchTime > 3600000; // 1 hour in milliseconds
    
    if (!this.cachedGenres || cacheExpired) {
      try {
        // Fetch genres from BeatStars
        const genres = await fetchGenres();
        if (genres && genres.length > 0) {
          this.cachedGenres = genres;
          this.genresFetchTime = now;
        } else {
          // Fall back to backup data if the API returns nothing
          this.cachedGenres = Object.keys(backupBeatTitlesData);
        }
      } catch (error) {
        console.error('Error fetching genres:', error);
        // Fall back to backup data on error
        this.cachedGenres = Object.keys(backupBeatTitlesData);
      }
    }
    
    return this.cachedGenres;
  }

  async getBeatTitlesByGenre(genre: string): Promise<string[]> {
    // Check if we have cached titles for this genre that are less than 1 hour old
    const now = Date.now();
    const cacheExpired = !this.titlesFetchTime[genre] || 
                          (now - this.titlesFetchTime[genre] > 3600000); // 1 hour in milliseconds
    
    if (!this.cachedTitles[genre] || cacheExpired) {
      try {
        // Fetch titles from BeatStars
        const titles = await fetchBeatTitles(genre);
        if (titles && titles.length > 0) {
          this.cachedTitles[genre] = titles;
          this.titlesFetchTime[genre] = now;
        } else {
          // Fall back to backup data if the API returns nothing
          this.cachedTitles[genre] = backupBeatTitlesData[genre] || [];
        }
      } catch (error) {
        console.error(`Error fetching titles for genre ${genre}:`, error);
        // Fall back to backup data on error
        this.cachedTitles[genre] = backupBeatTitlesData[genre] || [];
      }
    }
    
    return this.cachedTitles[genre];
  }

  async generateRandomTitle(genre: string): Promise<string> {
    const titles = await this.getBeatTitlesByGenre(genre);
    if (titles.length === 0) {
      return "No titles available for this genre";
    }
    
    const randomIndex = Math.floor(Math.random() * titles.length);
    return titles[randomIndex];
  }

  async rephraseBeatTitle(title: string, genre: string): Promise<string> {
    try {
      // Use OpenAI to rephrase the title
      return await aiRephraseBeatTitle(title, genre);
    } catch (error) {
      console.error('Error rephrasing title:', error);
      // Return original title if there's an error
      return title;
    }
  }

  getAllFavorites(): Favorite[] {
    return Array.from(this.favorites.values());
  }

  async addFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const id = this.nextFavoriteId++;
    const now = new Date();
    
    // Ensure metadata fields are not undefined (required by type)
    const favorite: Favorite = {
      ...insertFavorite,
      id,
      createdAt: now,
      key: insertFavorite.key || null,
      scale: insertFavorite.scale || null,
      bpm: insertFavorite.bpm || null,
      collaborator: insertFavorite.collaborator || null
    };
    
    this.favorites.set(id, favorite);
    return favorite;
  }

  removeFavorite(id: number): boolean {
    return this.favorites.delete(id);
  }
}

// Export singleton instance
export const storage = new MemStorage();
