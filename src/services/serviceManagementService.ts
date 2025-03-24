import { supabase } from '../lib/supabase';
import { NailService, NailServiceFormData } from '../types/NailService';
import { createClient } from '@supabase/supabase-js';

// Create a properly typed Supabase client
const typedSupabase = supabase as ReturnType<typeof createClient>;

// Define the database service type to match the Supabase structure
interface DatabaseService {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  category: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  translations?: {
    de?: {
      name: string;
      description: string;
    };
    es?: {
      name: string;
      description: string;
    };
  };
}

export const serviceManagementService = {
  /**
   * Transform database service to frontend model
   */
  transformDatabaseToService(dbService: DatabaseService): NailService {
    return {
      id: dbService.id,
      name: dbService.name,
      description: dbService.description || '',
      durationMinutes: dbService.duration,
      price: dbService.price,
      isActive: dbService.is_active,
      category: dbService.category || 'Other',
      image: dbService.image_url || undefined,
      translations: dbService.translations
    };
  },

  /**
   * Transform frontend model to database service
   */
  transformServiceToDatabase(service: NailServiceFormData, id?: string): Partial<DatabaseService> {
    // Create the base database object
    const dbService: Partial<DatabaseService> = {
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.durationMinutes,
      category: service.category,
      image_url: service.image || null,
      is_active: service.isActive,
      updated_at: new Date().toISOString()
    };

    // If this is a new service, add created_at timestamp
    if (!id) {
      dbService.created_at = new Date().toISOString();
    }

    // Add translations if provided
    if (service.nameDE || service.descriptionDE || service.nameES || service.descriptionES) {
      const translations: Record<string, { name: string; description: string }> = {};
      
      if (service.nameDE || service.descriptionDE) {
        translations.de = {
          name: service.nameDE || service.name,
          description: service.descriptionDE || service.description
        };
      }
      
      if (service.nameES || service.descriptionES) {
        translations.es = {
          name: service.nameES || service.name,
          description: service.descriptionES || service.description
        };
      }
      
      dbService.translations = translations;
    }

    return dbService;
  },

  /**
   * Get all services
   */
  async getAllServices(): Promise<NailService[]> {
    try {
      const { data, error } = await typedSupabase
        .from('services')
        .select('*')
        .order('name');

      if (error) throw error;
      
      // First convert to unknown, then to our expected type for safety
      const typedData = data ? (data as unknown) as DatabaseService[] : [];
      return typedData.map(service => this.transformDatabaseToService(service));
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },

  /**
   * Get only active services
   */
  async getActiveServices(): Promise<NailService[]> {
    try {
      const { data, error } = await typedSupabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      
      // First convert to unknown, then to our expected type for safety
      const typedData = data ? (data as unknown) as DatabaseService[] : [];
      return typedData.map(service => this.transformDatabaseToService(service));
    } catch (error) {
      console.error('Error fetching active services:', error);
      throw error;
    }
  },

  /**
   * Get a service by ID
   */
  async getServiceById(id: string): Promise<NailService | null> {
    try {
      const { data, error } = await typedSupabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // First convert to unknown, then to our expected type for safety
      return data ? this.transformDatabaseToService((data as unknown) as DatabaseService) : null;
    } catch (error) {
      console.error(`Error fetching service with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new service
   */
  async createService(service: NailServiceFormData): Promise<NailService> {
    try {
      const dbService = this.transformServiceToDatabase(service);
      
      const { data, error } = await typedSupabase
        .from('services')
        .insert([dbService])
        .select()
        .single();

      if (error) throw error;
      
      // First convert to unknown, then to our expected type for safety
      return this.transformDatabaseToService((data as unknown) as DatabaseService);
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  },

  /**
   * Update an existing service
   */
  async updateService(id: string, service: NailServiceFormData): Promise<NailService> {
    try {
      const dbService = this.transformServiceToDatabase(service, id);
      
      const { data, error } = await typedSupabase
        .from('services')
        .update(dbService)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // First convert to unknown, then to our expected type for safety
      return this.transformDatabaseToService((data as unknown) as DatabaseService);
    } catch (error) {
      console.error(`Error updating service with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a service
   */
  async deleteService(id: string): Promise<void> {
    try {
      const { error } = await typedSupabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error(`Error deleting service with ID ${id}:`, error);
      throw error;
    }
  }
};
