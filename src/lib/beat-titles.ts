// This file contains API client functions for beat title operations
import axios from "axios";

// Cache for genres and beat titles to reduce API calls
let genresCache: string[] | null = null;
let titlesCacheByGenre: Record<string, string[]> = {};

// Get all available genres from API
export async function getGenres(): Promise<string[]> {
  if (genresCache !== null) {
    return genresCache;
  }

  try {
    const response = await axios.get<string[]>("/api/genres");
    genresCache = response.data;
    return response.data;
  } catch (error) {
    console.error("Error fetching genres:", error);
    // Fallback default genres if API fails
    return [
      "Hip-Hop", "Trap", "R&B", "Drill", "Boom Bap", 
      "Lo-Fi", "Jersey Club", "Afrobeats", "Reggaeton"
    ];
  }
}

// Get real beat titles for a specific genre from API
export async function getBeatTitlesByGenre(genre: string): Promise<string[]> {
  if (titlesCacheByGenre[genre]) {
    return titlesCacheByGenre[genre];
  }

  try {
    const response = await axios.get<string[]>(`/api/beat-titles/${encodeURIComponent(genre)}`);
    titlesCacheByGenre[genre] = response.data;
    return response.data;
  } catch (error) {
    console.error(`Error fetching beat titles for genre ${genre}:`, error);
    return [];
  }
}

// Generate a random title for a specific genre
export async function generateRandomTitleForGenre(genre: string): Promise<string> {
  try {
    const response = await axios.get<{title: string, genre: string}>(`/api/generate/${encodeURIComponent(genre)}`);
    return response.data.title;
  } catch (error) {
    console.error(`Error generating random title for genre ${genre}:`, error);
    
    // Fallback to local generation if API fails
    const titles = await getBeatTitlesByGenre(genre);
    if (titles.length > 0) {
      const randomIndex = Math.floor(Math.random() * titles.length);
      return titles[randomIndex];
    }
    
    return "Unable to generate a title at this time";
  }
}

// Rephrase a beat title using OpenAI API
export async function rephraseBeatTitle(title: string, genre: string): Promise<string> {
  try {
    const response = await axios.post<{original: string, rephrased: string, genre: string}>(
      "/api/rephrase",
      { title, genre }
    );
    
    return response.data.rephrased;
  } catch (error) {
    console.error("Error rephrasing title:", error);
    
    // Fallback to original title if the API fails
    return title;
  }
}
