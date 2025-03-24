import { supabase, isProduction } from '../lib/supabase';
import { NailDesign } from '../components/NailCatalog';
import { handleSupabaseError } from '../lib/supabase';
import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

// Define interfaces for the database models
interface NailDesignRecord {
  id: string;
  name: string;
  description: string | null;
  image_url: string;
  fallback_image_url: string | null;
  price: number;
  category: string;
  popular: boolean;
  is_active: boolean;
  nail_design_translations?: NailDesignTranslationRecord[];
}

interface NailDesignTranslationRecord {
  id?: string;
  nail_design_id?: string;
  language: string;
  name: string;
  description: string | null;
}

export interface NailDesignTranslation {
  language: string;
  name: string;
  description: string;
}

// Type guard to check if Supabase client is available and properly initialized
const isSupabaseAvailable = (): boolean => {
  return typeof supabase === 'object' && supabase !== null && typeof supabase.from === 'function';
};

// Helper to cast supabase to its proper type when we know it's available
const getTypedSupabase = (): SupabaseClient<Database> => {
  return supabase as unknown as SupabaseClient<Database>;
};

export const fetchNailDesigns = async (category?: string, limit?: number, language = 'en'): Promise<NailDesign[]> => {
  try {
    if (!isSupabaseAvailable()) {
      console.error('Supabase client not properly initialized');
      return [];
    }

    // In development mode with mock client, return some fake data for testing
    if (!isProduction() && !isSupabaseAvailable()) {
      return getFakeDevelopmentDesigns(category, limit, language);
    }

    let data: NailDesignRecord[] | null = null;
    let error: PostgrestError | null = null;

    try {
      const db = getTypedSupabase();
      const query = db.from('nail_designs').select(`
        id,
        name,
        description,
        image_url,
        fallback_image_url,
        price,
        category,
        popular,
        nail_design_translations (
          name,
          description,
          language
        )
      `);

      // Apply filters
      const activeQuery = query.eq('is_active', true);
      
      // Apply category filter if specified
      const filteredByCategory = category && category !== 'all' 
        ? activeQuery.eq('category', category) 
        : activeQuery;
      
      // Apply limit if specified
      const finalQuery = limit && limit > 0 
        ? filteredByCategory.limit(limit) 
        : filteredByCategory;
      
      const result = await finalQuery;
      data = result.data as NailDesignRecord[] | null;
      error = result.error;
    } catch (supabaseError) {
      console.error('Error in Supabase query:', supabaseError);
      return [];
    }

    if (error) {
      console.error('Error fetching nail designs:', error.message);
      return [];
    }

    if (!data || !Array.isArray(data)) {
      return [];
    }

    // Transform the data to include translations
    return data.map((design: NailDesignRecord) => {
      const translations = design.nail_design_translations || [];
      const translation = translations.find(
        (t: NailDesignTranslationRecord) => t.language === language
      );

      return {
        id: design.id,
        name: translation?.name || design.name,
        description: translation?.description || design.description || '',
        imageUrl: design.image_url,
        fallbackImageUrl: design.fallback_image_url || '',
        price: design.price,
        category: design.category,
        popular: design.popular
      };
    });
  } catch (error) {
    console.error('Error in fetchNailDesigns:', error);
    return [];
  }
};

export const createNailDesign = async (
  design: Omit<NailDesign, 'id'>, 
  translations?: NailDesignTranslation[]
): Promise<{ success: boolean; error?: string; id?: string }> => {
  try {
    if (!isSupabaseAvailable()) {
      return { success: false, error: 'Supabase client not properly initialized' };
    }

    // In development mode with mock client, return fake success
    if (!isProduction() && !isSupabaseAvailable()) {
      return { success: true, id: `dev-${Date.now()}` };
    }

    try {
      const db = getTypedSupabase();
      
      // Insert the main design
      const result = await db
        .from('nail_designs')
        .insert([{
          name: design.name,
          description: design.description,
          image_url: design.imageUrl,
          fallback_image_url: design.fallbackImageUrl,
          price: design.price,
          category: design.category,
          popular: design.popular
        }])
        .select();

      if (result.error) {
        return { success: false, error: result.error.message };
      }

      if (!result.data || result.data.length === 0) {
        return { success: false, error: 'No data returned after insert' };
      }

      const newDesignId = result.data[0].id;

      // If translations are provided, insert them as well
      if (translations && translations.length > 0) {
        const translationData = translations.map(translation => ({
          nail_design_id: newDesignId,
          language: translation.language,
          name: translation.name,
          description: translation.description
        }));

        const translationResult = await db
          .from('nail_design_translations')
          .insert(translationData);

        if (translationResult.error) {
          console.error('Error adding translations:', translationResult.error.message);
        }
      }

      return { success: true, id: newDesignId };
    } catch (supabaseError) {
      return { success: false, error: handleSupabaseError(supabaseError) };
    }
  } catch (error) {
    return { success: false, error: handleSupabaseError(error) };
  }
};

export const updateNailDesign = async (
  id: string,
  design: Partial<NailDesign>,
  translations?: NailDesignTranslation[]
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!isSupabaseAvailable()) {
      return { success: false, error: 'Supabase client not properly initialized' };
    }

    // In development mode with mock client, return fake success
    if (!isProduction() && !isSupabaseAvailable()) {
      return { success: true };
    }

    try {
      const db = getTypedSupabase();
      
      // Update the main design
      const updateData: Record<string, string | number | boolean | Date | null> = {};
      if (design.name) updateData.name = design.name;
      if (design.description !== undefined) updateData.description = design.description;
      if (design.imageUrl) updateData.image_url = design.imageUrl;
      if (design.fallbackImageUrl !== undefined) updateData.fallback_image_url = design.fallbackImageUrl;
      if (design.price !== undefined) updateData.price = design.price;
      if (design.category) updateData.category = design.category;
      if (design.popular !== undefined) updateData.popular = design.popular;
      updateData.updated_at = new Date();

      const result = await db
        .from('nail_designs')
        .update(updateData)
        .eq('id', id);

      if (result.error) {
        return { success: false, error: result.error.message };
      }

      // If translations are provided, update them
      if (translations && translations.length > 0) {
        for (const translation of translations) {
          // Check if the translation already exists
          const existingResult = await db
            .from('nail_design_translations')
            .select('id')
            .eq('nail_design_id', id)
            .eq('language', translation.language);

          if (existingResult.error) {
            console.error(`Error checking for existing translation:`, existingResult.error.message);
            continue;
          }

          const existingTranslation = existingResult.data && existingResult.data.length > 0 
            ? existingResult.data[0] 
            : null;

          if (existingTranslation) {
            // Update existing translation
            const updateResult = await db
              .from('nail_design_translations')
              .update({
                name: translation.name,
                description: translation.description,
                updated_at: new Date()
              })
              .eq('id', existingTranslation.id);

            if (updateResult.error) {
              console.error(`Error updating ${translation.language} translation:`, updateResult.error.message);
            }
          } else {
            // Insert new translation
            const insertResult = await db
              .from('nail_design_translations')
              .insert({
                nail_design_id: id,
                language: translation.language,
                name: translation.name,
                description: translation.description
              });

            if (insertResult.error) {
              console.error(`Error adding ${translation.language} translation:`, insertResult.error.message);
            }
          }
        }
      }

      return { success: true };
    } catch (supabaseError) {
      return { success: false, error: handleSupabaseError(supabaseError) };
    }
  } catch (error) {
    return { success: false, error: handleSupabaseError(error) };
  }
};

export const deleteNailDesign = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!isSupabaseAvailable()) {
      return { success: false, error: 'Supabase client not properly initialized' };
    }

    // In development mode with mock client, return fake success
    if (!isProduction() && !isSupabaseAvailable()) {
      return { success: true };
    }

    try {
      const db = getTypedSupabase();
      
      // Deleting the design will automatically delete its translations due to CASCADE
      const result = await db
        .from('nail_designs')
        .delete()
        .eq('id', id);

      if (result.error) {
        return { success: false, error: result.error.message };
      }

      return { success: true };
    } catch (supabaseError) {
      return { success: false, error: handleSupabaseError(supabaseError) };
    }
  } catch (error) {
    return { success: false, error: handleSupabaseError(error) };
  }
};

// Helper function to provide fake data for development when Supabase is not available
const getFakeDevelopmentDesigns = (category?: string, limit?: number, language = 'en'): NailDesign[] => {
  const sampleDesigns: NailDesign[] = [
    {
      id: 'dev-1',
      name: language === 'de' ? 'Klassische Französische Maniküre' : 
            language === 'es' ? 'Manicura Francesa Clásica' : 
            'Classic French Manicure',
      description: language === 'de' ? 'Zeitlose und elegante französische Spitzen, die zu jedem Anlass passen.' : 
                   language === 'es' ? 'Puntas francesas atemporales y elegantes que se adaptan a cualquier ocasión.' : 
                   'Timeless and elegant french tips that suit any occasion.',
      imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&auto=format&fit=crop&q=80',
      fallbackImageUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&auto=format&fit=crop&q=80',
      price: 35,
      category: 'manicure',
      popular: true
    },
    {
      id: 'dev-2',
      name: language === 'de' ? 'Gel-Lack in Vollfarbe' : 
            language === 'es' ? 'Esmalte de Gel de Color Completo' : 
            'Gel Polish Full Color',
      description: language === 'de' ? 'Langanhaltender Gel-Lack in der Farbe Ihrer Wahl.' : 
                   language === 'es' ? 'Esmalte de gel de larga duración en el color de su elección.' : 
                   'Long-lasting gel polish in the color of your choice.',
      imageUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&auto=format&fit=crop&q=80',
      price: 40,
      category: 'gelPolish',
      popular: true
    },
    {
      id: 'dev-3',
      name: language === 'de' ? 'Acryl-Verlängerungen' : 
            language === 'es' ? 'Extensiones Acrílicas' : 
            'Acrylic Extensions',
      description: language === 'de' ? 'Komplettes Set von Acryl-Verlängerungen für zusätzliche Länge und Stärke.' : 
                   language === 'es' ? 'Juego completo de extensiones acrílicas para mayor longitud y resistencia.' : 
                   'Full set of acrylic extensions for added length and strength.',
      imageUrl: 'https://images.unsplash.com/photo-1604902396830-aca29e19b2b3?w=400&auto=format&fit=crop&q=80',
      price: 55,
      category: 'acrylicExtensions',
      popular: false
    },
    {
      id: 'dev-4',
      name: language === 'de' ? 'Nagelkunst-Design' : 
            language === 'es' ? 'Diseño de Arte de Uñas' : 
            'Nail Art Design',
      description: language === 'de' ? 'Benutzerdefinierte Nagelkunst-Designs, die von unseren qualifizierten Technikern erstellt wurden.' : 
                   language === 'es' ? 'Diseños de arte de uñas personalizados creados por nuestros técnicos calificados.' : 
                   'Custom nail art designs created by our skilled technicians.',
      imageUrl: 'https://images.unsplash.com/photo-1607779097040-28d8a56e32b0?w=400&auto=format&fit=crop&q=80',
      price: 45,
      category: 'nailArt',
      popular: true
    },
    {
      id: 'dev-5',
      name: language === 'de' ? 'Spa-Pediküre' : 
            language === 'es' ? 'Pedicura de Spa' : 
            'Spa Pedicure',
      description: language === 'de' ? 'Entspannende Pediküre mit Peeling, Massage und Politur.' : 
                   language === 'es' ? 'Pedicura relajante con exfoliación, masaje y pulido.' : 
                   'Relaxing pedicure with exfoliation, massage, and polish.',
      imageUrl: 'https://images.unsplash.com/photo-1582291652525-cde3dbd88162?w=400&auto=format&fit=crop&q=80',
      price: 50,
      category: 'pedicure',
      popular: true
    },
    {
      id: 'dev-6',
      name: language === 'de' ? 'Marmor-Nagelkunst' : 
            language === 'es' ? 'Arte de Uñas de Mármol' : 
            'Marble Nail Art',
      description: language === 'de' ? 'Eleganter Marmoreffekt, der mit spezialisierten Techniken erstellt wurde.' : 
                   language === 'es' ? 'Elegante efecto de mármol creado con técnicas especializadas.' : 
                   'Elegant marble effect created with specialized techniques.',
      imageUrl: 'https://images.unsplash.com/photo-1604902396830-aca29e19b2b3?w=400&auto=format&fit=crop&q=80',
      price: 60,
      category: 'nailArt',
      popular: false
    },
  ];
  
  let filteredDesigns = sampleDesigns;
  
  // Filter by category if specified
  if (category && category !== 'all') {
    filteredDesigns = sampleDesigns.filter(design => design.category === category);
  }
  
  // Apply limit if specified
  if (limit && limit > 0) {
    filteredDesigns = filteredDesigns.slice(0, limit);
  }

  return filteredDesigns;
};
