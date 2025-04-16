import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBeatTitleSchema, insertFavoriteSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all genres
  app.get("/api/genres", async (_req, res) => {
    try {
      const genres = await storage.getGenres();
      res.json(genres);
    } catch (error) {
      console.error("Error fetching genres:", error);
      res.status(500).json({ error: "Failed to fetch genres" });
    }
  });

  // Get beat titles by genre
  app.get("/api/beat-titles/:genre", async (req, res) => {
    try {
      const { genre } = req.params;
      const titles = await storage.getBeatTitlesByGenre(genre);
      res.json(titles);
    } catch (error) {
      console.error(`Error fetching titles for genre ${req.params.genre}:`, error);
      res.status(500).json({ error: "Failed to fetch beat titles" });
    }
  });

  // Generate a random beat title for a specific genre
  app.get("/api/generate/:genre", async (req, res) => {
    try {
      const { genre } = req.params;
      const title = await storage.generateRandomTitle(genre);
      res.json({ title, genre });
    } catch (error) {
      console.error(`Error generating title for genre ${req.params.genre}:`, error);
      res.status(500).json({ error: "Failed to generate beat title" });
    }
  });

  // Rephrase a beat title
  app.post("/api/rephrase", async (req, res) => {
    try {
      const { title, genre } = req.body;
      
      if (!title || typeof title !== 'string') {
        return res.status(400).json({ error: "Title is required" });
      }
      
      if (!genre || typeof genre !== 'string') {
        return res.status(400).json({ error: "Genre is required" });
      }
      
      const rephrasedTitle = await storage.rephraseBeatTitle(title, genre);
      res.json({ original: title, rephrased: rephrasedTitle, genre });
    } catch (error) {
      console.error("Error rephrasing title:", error);
      res.status(500).json({ error: "Failed to rephrase beat title" });
    }
  });

  // Get favorites (in a real app, this would be user-specific)
  app.get("/api/favorites", (_req, res) => {
    const favorites = storage.getAllFavorites();
    res.json(favorites);
  });

  // Add a favorite
  app.post("/api/favorites", async (req, res) => {
    try {
      const parsedData = insertFavoriteSchema.parse(req.body);
      const favorite = await storage.addFavorite(parsedData);
      res.status(201).json(favorite);
    } catch (error) {
      res.status(400).json({ error: "Invalid favorite data" });
    }
  });

  // Delete a favorite
  app.delete("/api/favorites/:id", (req, res) => {
    const { id } = req.params;
    const success = storage.removeFavorite(parseInt(id));
    if (success) {
      res.status(204).end();
    } else {
      res.status(404).json({ error: "Favorite not found" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
