import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage, type PropertyFilters } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertPropertySchema, insertSavedPropertySchema, insertSearchHistorySchema } from "@shared/schema";

interface AuthenticatedRequest extends Request {
  user?: {
    claims: {
      sub: string;
      email?: string;
      first_name?: string;
      last_name?: string;
      profile_image_url?: string;
    };
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Property routes
  app.get('/api/properties', async (req, res) => {
    try {
      const {
        search,
        minPrice,
        maxPrice,
        propertyTypes,
        amenities,
        maxDistance,
        university,
        bedrooms,
        bathrooms,
        limit = 20,
        offset = 0
      } = req.query;

      const filters: PropertyFilters = {};

      if (search) filters.search = search as string;
      if (minPrice) filters.minPrice = parseInt(minPrice as string) * 100; // Convert to cents
      if (maxPrice) filters.maxPrice = parseInt(maxPrice as string) * 100; // Convert to cents
      if (propertyTypes) {
        filters.propertyTypes = Array.isArray(propertyTypes) 
          ? propertyTypes as string[] 
          : [propertyTypes as string];
      }
      if (amenities) {
        filters.amenities = Array.isArray(amenities) 
          ? amenities as string[] 
          : [amenities as string];
      }
      if (maxDistance) filters.maxDistance = parseFloat(maxDistance as string);
      if (university) filters.university = university as string;
      if (bedrooms) filters.bedrooms = parseInt(bedrooms as string);
      if (bathrooms) filters.bathrooms = parseFloat(bathrooms as string);

      const properties = await storage.getProperties(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      // Convert price from cents to dollars for frontend
      const propertiesWithPrice = properties.map(property => ({
        ...property,
        price: property.price / 100
      }));

      res.json(propertiesWithPrice);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get('/api/properties/:id', async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getProperty(propertyId);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Convert price from cents to dollars
      const propertyWithPrice = {
        ...property,
        price: property.price / 100
      };

      res.json(propertyWithPrice);
    } catch (error) {
      console.error("Error fetching property:", error);
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  // Saved properties routes (protected)
  app.get('/api/saved-properties', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const savedProperties = await storage.getSavedProperties(userId);
      
      // Convert prices from cents to dollars
      const savedPropertiesWithPrice = savedProperties.map(saved => ({
        ...saved,
        property: {
          ...saved.property,
          price: saved.property.price / 100
        }
      }));

      res.json(savedPropertiesWithPrice);
    } catch (error) {
      console.error("Error fetching saved properties:", error);
      res.status(500).json({ message: "Failed to fetch saved properties" });
    }
  });

  app.post('/api/saved-properties', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const { propertyId } = req.body;

      const validatedData = insertSavedPropertySchema.parse({
        userId,
        propertyId: parseInt(propertyId)
      });

      // Check if already saved
      const isAlreadySaved = await storage.isPropertySaved(userId, validatedData.propertyId);
      if (isAlreadySaved) {
        return res.status(400).json({ message: "Property already saved" });
      }

      const savedProperty = await storage.saveProperty(validatedData);
      res.status(201).json(savedProperty);
    } catch (error) {
      console.error("Error saving property:", error);
      res.status(500).json({ message: "Failed to save property" });
    }
  });

  app.delete('/api/saved-properties/:propertyId', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const propertyId = parseInt(req.params.propertyId);

      const success = await storage.unsaveProperty(userId, propertyId);
      
      if (!success) {
        return res.status(404).json({ message: "Saved property not found" });
      }

      res.json({ message: "Property unsaved successfully" });
    } catch (error) {
      console.error("Error unsaving property:", error);
      res.status(500).json({ message: "Failed to unsave property" });
    }
  });

  app.get('/api/saved-properties/:propertyId/status', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const propertyId = parseInt(req.params.propertyId);

      const isSaved = await storage.isPropertySaved(userId, propertyId);
      res.json({ isSaved });
    } catch (error) {
      console.error("Error checking saved status:", error);
      res.status(500).json({ message: "Failed to check saved status" });
    }
  });

  // Search history routes (protected)
  app.post('/api/search-history', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const { searchQuery, filters } = req.body;

      const validatedData = insertSearchHistorySchema.parse({
        userId,
        searchQuery,
        filters
      });

      const searchHistory = await storage.addSearchHistory(validatedData);
      res.status(201).json(searchHistory);
    } catch (error) {
      console.error("Error adding search history:", error);
      res.status(500).json({ message: "Failed to add search history" });
    }
  });

  app.get('/api/search-history', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;

      const searchHistory = await storage.getSearchHistory(userId, limit);
      res.json(searchHistory);
    } catch (error) {
      console.error("Error fetching search history:", error);
      res.status(500).json({ message: "Failed to fetch search history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
