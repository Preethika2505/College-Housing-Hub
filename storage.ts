import {
  users,
  properties,
  savedProperties,
  searchHistory,
  type User,
  type UpsertUser,
  type Property,
  type InsertProperty,
  type SavedProperty,
  type InsertSavedProperty,
  type SearchHistory,
  type InsertSearchHistory,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, gte, lte, ilike, inArray, sql } from "drizzle-orm";

export interface PropertyFilters {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyTypes?: string[];
  amenities?: string[];
  maxDistance?: number;
  university?: string;
  bedrooms?: number;
  bathrooms?: number;
}

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Property operations
  getProperties(filters?: PropertyFilters, limit?: number, offset?: number): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>;

  // Saved properties operations
  getSavedProperties(userId: string): Promise<(SavedProperty & { property: Property })[]>;
  saveProperty(data: InsertSavedProperty): Promise<SavedProperty>;
  unsaveProperty(userId: string, propertyId: number): Promise<boolean>;
  isPropertySaved(userId: string, propertyId: number): Promise<boolean>;

  // Search history operations
  addSearchHistory(data: InsertSearchHistory): Promise<SearchHistory>;
  getSearchHistory(userId: string, limit?: number): Promise<SearchHistory[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Property operations
  async getProperties(filters?: PropertyFilters, limit = 20, offset = 0): Promise<Property[]> {
    let query = db.select().from(properties).where(eq(properties.available, true));

    // Apply filters
    const conditions = [eq(properties.available, true)];

    if (filters?.search) {
      conditions.push(
        sql`(${properties.title} ILIKE ${`%${filters.search}%`} OR ${properties.description} ILIKE ${`%${filters.search}%`} OR ${properties.address} ILIKE ${`%${filters.search}%`})`
      );
    }

    if (filters?.minPrice) {
      conditions.push(gte(properties.price, filters.minPrice));
    }

    if (filters?.maxPrice) {
      conditions.push(lte(properties.price, filters.maxPrice));
    }

    if (filters?.propertyTypes && filters.propertyTypes.length > 0) {
      conditions.push(inArray(properties.propertyType, filters.propertyTypes));
    }

    if (filters?.university) {
      conditions.push(eq(properties.university, filters.university));
    }

    if (filters?.bedrooms) {
      conditions.push(eq(properties.bedrooms, filters.bedrooms));
    }

    if (filters?.bathrooms) {
      conditions.push(gte(properties.bathrooms, filters.bathrooms.toString()));
    }

    if (filters?.maxDistance) {
      conditions.push(lte(properties.distanceToCampus, filters.maxDistance.toString()));
    }

    if (filters?.amenities && filters.amenities.length > 0) {
      for (const amenity of filters.amenities) {
        conditions.push(sql`${amenity} = ANY(${properties.amenities})`);
      }
    }

    const result = await db
      .select()
      .from(properties)
      .where(and(...conditions))
      .orderBy(asc(properties.price))
      .limit(limit)
      .offset(offset);

    return result;
  }

  async getProperty(id: number): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const [newProperty] = await db.insert(properties).values(property).returning();
    return newProperty;
  }

  async updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property | undefined> {
    const [updatedProperty] = await db
      .update(properties)
      .set({ ...property, updatedAt: new Date() })
      .where(eq(properties.id, id))
      .returning();
    return updatedProperty;
  }

  async deleteProperty(id: number): Promise<boolean> {
    const result = await db.delete(properties).where(eq(properties.id, id));
    return result.rowCount > 0;
  }

  // Saved properties operations
  async getSavedProperties(userId: string): Promise<(SavedProperty & { property: Property })[]> {
    const result = await db
      .select({
        id: savedProperties.id,
        userId: savedProperties.userId,
        propertyId: savedProperties.propertyId,
        createdAt: savedProperties.createdAt,
        property: properties,
      })
      .from(savedProperties)
      .innerJoin(properties, eq(savedProperties.propertyId, properties.id))
      .where(eq(savedProperties.userId, userId))
      .orderBy(desc(savedProperties.createdAt));

    return result;
  }

  async saveProperty(data: InsertSavedProperty): Promise<SavedProperty> {
    const [saved] = await db.insert(savedProperties).values(data).returning();
    return saved;
  }

  async unsaveProperty(userId: string, propertyId: number): Promise<boolean> {
    const result = await db
      .delete(savedProperties)
      .where(and(eq(savedProperties.userId, userId), eq(savedProperties.propertyId, propertyId)));
    return result.rowCount > 0;
  }

  async isPropertySaved(userId: string, propertyId: number): Promise<boolean> {
    const [saved] = await db
      .select()
      .from(savedProperties)
      .where(and(eq(savedProperties.userId, userId), eq(savedProperties.propertyId, propertyId)));
    return !!saved;
  }

  // Search history operations
  async addSearchHistory(data: InsertSearchHistory): Promise<SearchHistory> {
    const [history] = await db.insert(searchHistory).values(data).returning();
    return history;
  }

  async getSearchHistory(userId: string, limit = 10): Promise<SearchHistory[]> {
    return await db
      .select()
      .from(searchHistory)
      .where(eq(searchHistory.userId, userId))
      .orderBy(desc(searchHistory.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
