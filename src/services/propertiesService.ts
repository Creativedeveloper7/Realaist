import { supabase } from '../lib/supabase'
import { offPlanProjects, completedProjects } from '../data/projects'
import { unifiedCacheService } from './unifiedCacheService'

// Helpers for local fallback persistence
function readLocalProperties(): Property[] {
  try {
    const raw = localStorage.getItem('local_properties')
    if (!raw) return []
    return JSON.parse(raw) as Property[]
  } catch {
    return []
  }
}

function writeLocalProperties(props: Property[]) {
  try {
    localStorage.setItem('local_properties', JSON.stringify(props))
  } catch {}
}

// Fallback data for when database is unavailable
const FALLBACK_PROPERTIES: Property[] = [
  {
    id: 'fallback-1',
    title: 'Luxury Apartment in Westlands',
    description: 'Beautiful 3-bedroom apartment with modern amenities and stunning city views. Located in the heart of Westlands with easy access to shopping centers, restaurants, and business districts.',
    price: 25000000,
    location: 'Westlands, Nairobi',
    propertyType: 'Apartment',
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1200,
    images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop'],
    status: 'active',
    developerId: 'fallback-dev-1',
    developer: {
      id: 'fallback-dev-1',
      firstName: 'John',
      lastName: 'Kamau',
      companyName: 'Kamau Properties Ltd',
      phone: '+254 712 345 678'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    amenities: ['Swimming Pool', 'Gym', '24/7 Security'],
    features: ['Air Conditioning', 'Internet', 'Parking']
  },
  {
    id: 'fallback-2',
    title: 'Modern Townhouse in Karen',
    description: 'Spacious 4-bedroom townhouse with garden and parking. Perfect for families looking for a quiet suburban lifestyle with modern conveniences.',
    price: 35000000,
    location: 'Karen, Nairobi',
    propertyType: 'Townhouse',
    bedrooms: 4,
    bathrooms: 3,
    squareFeet: 1800,
    images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop'],
    status: 'active',
    developerId: 'fallback-dev-2',
    developer: {
      id: 'fallback-dev-2',
      firstName: 'Mary',
      lastName: 'Wanjiku',
      companyName: 'Wanjiku Homes',
      phone: '+254 723 456 789'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    amenities: ['Garden', 'Parking', 'Security'],
    features: ['Internet', 'TV', 'Water Heater']
  },
  {
    id: 'fallback-3',
    title: 'Executive Villa in Runda',
    description: 'Luxurious 5-bedroom villa with swimming pool, garden, and security. Ideal for executives and high-net-worth individuals.',
    price: 45000000,
    location: 'Runda, Nairobi',
    propertyType: 'Villa',
    bedrooms: 5,
    bathrooms: 4,
    squareFeet: 2500,
    images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop'],
    status: 'active',
    developerId: 'fallback-dev-3',
    developer: {
      id: 'fallback-dev-3',
      firstName: 'David',
      lastName: 'Muthoni',
      companyName: 'Muthoni Estates',
      phone: '+254 734 567 890'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    amenities: ['Swimming Pool', 'Gym', 'Security'],
    features: ['Internet', 'TV', 'Water Heater']
  },
  {
    id: 'fallback-4',
    title: 'Studio Apartment in Kilimani',
    description: 'Modern studio apartment perfect for young professionals. Fully furnished with all amenities included.',
    price: 12000000,
    location: 'Kilimani, Nairobi',
    propertyType: 'Studio',
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 500,
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop'],
    status: 'active',
    developerId: 'fallback-dev-4',
    developer: {
      id: 'fallback-dev-4',
      firstName: 'Grace',
      lastName: 'Njeri',
      companyName: 'Njeri Developments',
      phone: '+254 745 678 901'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    amenities: ['Internet', 'TV', 'Water Heater'],
    features: ['Internet', 'TV', 'Water Heater']
  },
  {
    id: 'fallback-5',
    title: 'Penthouse in Upper Hill',
    description: 'Exclusive penthouse with panoramic city views. Features include private elevator, rooftop garden, and premium finishes.',
    price: 65000000,
    location: 'Upper Hill, Nairobi',
    propertyType: 'Penthouse',
    bedrooms: 4,
    bathrooms: 3,
    squareFeet: 3000,
    images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop'],
    status: 'active',
    developerId: 'fallback-dev-5',
    developer: {
      id: 'fallback-dev-5',
      firstName: 'Peter',
      lastName: 'Kinyua',
      companyName: 'Kinyua Properties',
      phone: '+254 756 789 012'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    amenities: ['Swimming Pool', 'Gym', 'Security'],
    features: ['Internet', 'TV', 'Water Heater']
  },
  {
    id: 'fallback-6',
    title: 'Family Home in Lavington',
    description: 'Charming 3-bedroom family home with large garden and parking for 2 cars. Close to schools and shopping centers.',
    price: 28000000,
    location: 'Lavington, Nairobi',
    propertyType: 'House',
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1500,
    images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop'],
    status: 'active',
    developerId: 'fallback-dev-6',
    developer: {
      id: 'fallback-dev-6',
      firstName: 'Sarah',
      lastName: 'Mwangi',
      companyName: 'Mwangi Homes',
      phone: '+254 767 890 123'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    amenities: ['Garden', 'Parking', 'Security'],
    features: ['Internet', 'TV', 'Water Heater']
  }
]

// Convert project data to Property format
const convertProjectToProperty = (project: any): Property => ({
  id: project.id,
  title: project.name,
  description: project.summary,
  price: parseInt(project.price.replace(/[^\d]/g, '')) * 1000000, // Convert to actual number
  location: project.location,
  propertyType: 'Apartment', // Default type
  bedrooms: parseInt(project.facts[0]) || 0,
  bathrooms: parseInt(project.facts[1]) || 0,
  squareFeet: parseInt(project.facts[2]?.replace(/[^\d]/g, '')) || 0,
  images: [project.hero, ...project.gallery],
  status: 'active',
  developerId: 'project-dev',
  developer: {
    id: 'project-dev',
    firstName: 'Project',
    lastName: 'Developer',
    companyName: 'Real Estate Projects Ltd',
    phone: '+254 700 000 000'
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  amenities: [], // No amenities in project data
  features: [] // No features in project data
})

// Combine fallback properties with project data and deduplicate by ID
const ALL_FALLBACK_PROPERTIES = [
  ...FALLBACK_PROPERTIES,
  ...offPlanProjects.map(convertProjectToProperty),
  ...completedProjects.map(convertProjectToProperty)
].filter((property, index, self) => 
  index === self.findIndex(p => p.id === property.id)
)

export interface Property {
  id: string
  title: string
  description: string
  price: number
  weekdayPrice?: number
  weekendPrice?: number
  location: string
  propertyType: string
  bedrooms?: number
  bathrooms?: number
  squareFeet?: number
  images: string[]
  status: 'active' | 'sold' | 'pending' | 'draft'
  developerId: string
  developer?: {
    id: string
    firstName: string
    lastName: string
    companyName?: string
    phone?: string
    logoUrl?: string
    website?: string
    instagram?: string
    x?: string
    facebook?: string
  }
  createdAt: string
  updatedAt: string
  /** Optional tour/video URL; used by "Watch Video" on short stay details */
  videoUrl?: string
  /** Optional coordinates for map pin and accurate location. */
  latitude?: number | null
  longitude?: number | null
  // UI-only metadata (kept locally for now when DB is unreachable)
  amenities?: string[]
  features?: string[]
}

export interface CreatePropertyData {
  title: string
  description: string
  price: number
  location: string
  propertyType: string
  weekdayPrice?: number
  weekendPrice?: number
  bedrooms?: number
  bathrooms?: number
  squareFeet?: number
  images?: string[]
  status?: 'active' | 'sold' | 'pending' | 'draft'
  videoUrl?: string
  /** Optional coordinates for accurate location / map. */
  latitude?: number | null
  longitude?: number | null
  // UI-only fields to persist locally on offline/timeout
  amenities?: string[]
  features?: string[]
}

export interface UpdatePropertyData extends Partial<CreatePropertyData> {
  id: string
}

export interface PropertyFilters {
  location?: string
  propertyType?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  bathrooms?: number
  status?: 'active' | 'sold' | 'pending' | 'draft'
  developerId?: string
}

class PropertiesService {
  // Helper method to clear all property-related caches
  private clearPropertyCaches(): void {
    // Clear all possible property cache keys
    const cacheKeys = [
      'properties-{}',
      'properties-{"status":"active"}',
      'properties-{"status":"sold"}',
      'properties-{"status":"pending"}',
      'properties-{"status":"draft"}',
    ];
    
    cacheKeys.forEach(key => {
      unifiedCacheService.clear(key);
    });
    
    // Also clear any cached individual properties
    // Note: This is a simple approach - in production you might want to track individual property keys
    console.log('🧹 PropertiesService: Cleared all property caches');
  }

  // Get all properties with optional filters
  async getProperties(filters?: PropertyFilters): Promise<{ properties: Property[]; error: string | null }> {
    // Create cache key based on filters - use consistent format
    const filterString = JSON.stringify(filters || {});
    const cacheKey = `properties-${filterString}`;
    
    return unifiedCacheService.get(
      cacheKey,
      async () => {
        try {
          console.log('PropertiesService: Starting database fetch...');
          
          // Add timeout to prevent hanging
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Database fetch timeout after 10 seconds')), 10000);
          });
          
          let query = supabase
            .from('properties')
            .select(`
              id,
              title,
              description,
              price,
              weekday_price,
              weekend_price,
              location,
              property_type,
              bedrooms,
              bathrooms,
              square_feet,
              images,
              status,
              video_url,
              latitude,
              longitude,
              developer_id,
              created_at,
              updated_at,
              amenities,
              features,
              developer:profiles!properties_developer_id_fkey(
                id,
                first_name,
                last_name,
                company_name,
                phone,
                website,
                instagram,
                x,
                facebook,
                logo_url
              )
            `)
            .order('created_at', { ascending: false })
            .limit(100)

          // Apply filters
          if (filters?.location) {
            query = query.ilike('location', `%${filters.location}%`)
          }
          if (filters?.propertyType) {
            query = query.eq('property_type', filters.propertyType)
          }
          if (filters?.minPrice) {
            query = query.gte('price', filters.minPrice)
          }
          if (filters?.maxPrice) {
            query = query.lte('price', filters.maxPrice)
          }
          if (filters?.bedrooms) {
            query = query.eq('bedrooms', filters.bedrooms)
          }
          if (filters?.bathrooms) {
            query = query.eq('bathrooms', filters.bathrooms)
          }
          if (filters?.status) {
            query = query.eq('status', filters.status)
          }
          if (filters?.developerId) {
            query = query.eq('developer_id', filters.developerId)
          }

          console.log('PropertiesService: Executing database query...');
          const { data, error } = await Promise.race([
            query,
            timeoutPromise
          ]);

          console.log('PropertiesService: Database query completed', { dataLength: data?.length, error: error?.message });

          if (error) {
            console.error('Error fetching properties:', error)
            // Only use fallback if it's a critical error, not just a network hiccup
            if (error.message.includes('JWT') || error.message.includes('permission') || error.message.includes('auth')) {
              console.log('Using fallback properties due to authentication error')
            const local = readLocalProperties()
            return { properties: [...local, ...ALL_FALLBACK_PROPERTIES], error: null }
            } else {
              // For other errors, return empty array and let the UI handle it
              console.log('Database error, returning empty properties array')
              const local = readLocalProperties()
              return { properties: local, error: error.message }
            }
          }

          const properties: Property[] = data.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            price: item.price,
            weekdayPrice: item.weekday_price || undefined,
            weekendPrice: item.weekend_price || undefined,
            location: item.location,
            propertyType: item.property_type,
            bedrooms: item.bedrooms,
            bathrooms: item.bathrooms,
            squareFeet: item.square_feet,
            images: item.images || [],
            status: item.status,
            developerId: item.developer_id,
            developer: item.developer && Array.isArray(item.developer) && item.developer.length > 0 ? (() => {
              // Helper to normalize social links (empty strings to undefined, add https:// to website)
              const normalizeSocialLink = (value: string | null | undefined, isWebsite = false): string | undefined => {
                if (!value || value.trim() === '') return undefined;
                const trimmed = value.trim();
                if (isWebsite && trimmed && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
                  return `https://${trimmed}`;
                }
                return trimmed;
              };
              const dev = item.developer[0];
              return {
                id: dev.id,
                firstName: dev.first_name,
                lastName: dev.last_name,
                companyName: dev.company_name,
                phone: dev.phone,
                logoUrl: normalizeSocialLink(dev.logo_url),
                website: normalizeSocialLink(dev.website, true),
                instagram: normalizeSocialLink(dev.instagram),
                x: normalizeSocialLink(dev.x),
                facebook: normalizeSocialLink(dev.facebook)
              };
            })() : undefined,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            videoUrl: item.video_url || undefined,
            latitude: item.latitude ?? undefined,
            longitude: item.longitude ?? undefined,
            amenities: item.amenities || [],
            features: item.features || []
          }))

          // Merge locally created properties as well
          const local = readLocalProperties()
          return { properties: [...local, ...properties], error: null }
        } catch (error) {
          console.error('Error fetching properties:', error)
          // Only use fallback for critical network errors, not temporary ones
          if (error instanceof Error && (
            error.message.includes('Failed to fetch') || 
            error.message.includes('NetworkError') ||
            error.message.includes('timeout')
          )) {
            console.log('Using fallback properties due to critical network error')
          const local = readLocalProperties()
          return { properties: [...local, ...ALL_FALLBACK_PROPERTIES], error: null }
          } else {
            // For other errors, return empty array
            console.log('Non-critical error, returning empty properties array')
            const local = readLocalProperties()
            return { properties: local, error: 'Failed to fetch properties' }
          }
        }
      },
      { ttl: 5 * 60 * 1000 } // Cache for 5 minutes
    );
  }

  // Get all properties directly from database (no caching) - matches Dashboard approach
  async getPropertiesDirect(filters?: PropertyFilters): Promise<{ properties: Property[]; error: string | null }> {
    try {
      console.log('PropertiesService: Starting direct database fetch...');
      
      let query = supabase
        .from('properties')
        .select(`
          *,
          developer:profiles!properties_developer_id_fkey(
            id,
            first_name,
            last_name,
            company_name,
            phone,
            website,
            instagram,
            x,
            facebook,
            logo_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      // Apply filters
      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`)
      }
      if (filters?.propertyType) {
        query = query.eq('property_type', filters.propertyType)
      }
      if (filters?.minPrice) {
        query = query.gte('price', filters.minPrice)
      }
      if (filters?.maxPrice) {
        query = query.lte('price', filters.maxPrice)
      }
      if (filters?.bedrooms) {
        query = query.eq('bedrooms', filters.bedrooms)
      }
      if (filters?.bathrooms) {
        query = query.eq('bathrooms', filters.bathrooms)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.developerId) {
        query = query.eq('developer_id', filters.developerId)
      }

      console.log('PropertiesService: Executing direct database query...');
      const { data, error } = await query;

      console.log('PropertiesService: Direct database query completed', { dataLength: data?.length, error: error?.message });

      if (error) {
        console.error('Error fetching properties directly:', error)
        const local = readLocalProperties()
        return { properties: local, error: error.message }
      }

      // Helper to normalize social links (empty strings to undefined, add https:// to website)
      const normalizeSocialLink = (value: string | null | undefined, isWebsite = false): string | undefined => {
        if (!value || value.trim() === '') return undefined;
        const trimmed = value.trim();
        if (isWebsite && trimmed && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
          return `https://${trimmed}`;
        }
        return trimmed;
      };

      const properties: Property[] = data.map(item => {
        // Handle developer data - it might be an array or object
        let developerData = undefined;
        if (item.developer) {
          if (Array.isArray(item.developer) && item.developer.length > 0) {
            // Array format (from join query)
            const dev = item.developer[0];
            developerData = {
              id: dev.id,
              firstName: dev.first_name,
              lastName: dev.last_name,
              companyName: dev.company_name,
              phone: dev.phone,
              logoUrl: normalizeSocialLink(dev.logo_url),
              website: normalizeSocialLink(dev.website, true),
              instagram: normalizeSocialLink(dev.instagram),
              x: normalizeSocialLink(dev.x),
              facebook: normalizeSocialLink(dev.facebook)
            };
          } else if (typeof item.developer === 'object' && item.developer.id) {
            // Object format (direct object)
            const dev = item.developer;
            developerData = {
              id: dev.id,
              firstName: dev.first_name,
              lastName: dev.last_name,
              companyName: dev.company_name,
              phone: dev.phone,
              logoUrl: normalizeSocialLink(dev.logo_url),
              website: normalizeSocialLink(dev.website, true),
              instagram: normalizeSocialLink(dev.instagram),
              x: normalizeSocialLink(dev.x),
              facebook: normalizeSocialLink(dev.facebook)
            };
          }
        }

        return {
          id: item.id,
          title: item.title,
          description: item.description,
          price: item.price,
          weekdayPrice: item.weekday_price || undefined,
          weekendPrice: item.weekend_price || undefined,
          location: item.location,
          propertyType: item.property_type,
          bedrooms: item.bedrooms,
          bathrooms: item.bathrooms,
          squareFeet: item.square_feet,
          images: item.images || [],
          status: item.status,
          developerId: item.developer_id,
          developer: developerData,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          videoUrl: item.video_url || undefined,
          amenities: item.amenities || [],
          features: item.features || []
        };
      })

      // Merge with locally created properties
      const local = readLocalProperties()
      return { properties: [...local, ...properties], error: null }
    } catch (error) {
      console.error('Error fetching properties directly:', error)
      const local = readLocalProperties()
      return { properties: local, error: 'An unexpected error occurred' }
    }
  }

  // Get property by ID
  async getPropertyById(id: string): Promise<{ property: Property | null; error: string | null }> {
    const cacheKey = `property-${id}`;
    
    return unifiedCacheService.get(
      cacheKey,
      async () => {
        try {
          const { data, error } = await supabase
            .from('properties')
            .select(`
              id,
              title,
              description,
              price,
              weekday_price,
              weekend_price,
              location,
              property_type,
              bedrooms,
              bathrooms,
              square_feet,
              images,
              status,
              video_url,
              latitude,
              longitude,
              developer_id,
              created_at,
              updated_at,
              amenities,
              features,
              developer:profiles!properties_developer_id_fkey(
                id,
                first_name,
                last_name,
                company_name,
                phone,
                website,
                instagram,
                x,
                facebook,
                logo_url
              )
            `)
            .eq('id', id)
            .single()

          if (error) {
            console.error('Error fetching property by ID:', error)
            return { property: null, error: error.message }
          }

          console.log('PropertiesService: getPropertyById - Raw developer data:', {
            developer: data.developer,
            isArray: Array.isArray(data.developer),
            length: data.developer?.length,
            phone: data.developer?.phone || data.developer?.[0]?.phone,
            developerKeys: data.developer ? Object.keys(data.developer) : null,
            developerValues: data.developer ? Object.values(data.developer) : null
          });

          // Helper to normalize social links (empty strings to undefined, add https:// to website)
          const normalizeSocialLink = (value: string | null | undefined, isWebsite = false): string | undefined => {
            if (!value || value.trim() === '') return undefined;
            const trimmed = value.trim();
            if (isWebsite && trimmed && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
              return `https://${trimmed}`;
            }
            return trimmed;
          };

          // Handle both array and object formats for developer data
          let developerData = null;
          if (data.developer) {
            if (Array.isArray(data.developer) && data.developer.length > 0) {
              // Array format (from properties list)
              const dev = data.developer[0];
              developerData = {
                id: dev.id,
                firstName: dev.first_name,
                lastName: dev.last_name,
                companyName: dev.company_name,
                phone: dev.phone,
                website: normalizeSocialLink(dev.website, true),
                instagram: normalizeSocialLink(dev.instagram),
                x: normalizeSocialLink(dev.x),
                facebook: normalizeSocialLink(dev.facebook),
                logoUrl: normalizeSocialLink(dev.logo_url)
              };
            } else if (typeof data.developer === 'object' && data.developer.id) {
              // Object format (from individual property fetch)
              const dev = data.developer;
              developerData = {
                id: dev.id,
                firstName: dev.first_name,
                lastName: dev.last_name,
                companyName: dev.company_name,
                phone: dev.phone,
                website: normalizeSocialLink(dev.website, true),
                instagram: normalizeSocialLink(dev.instagram),
                x: normalizeSocialLink(dev.x),
                facebook: normalizeSocialLink(dev.facebook),
                logoUrl: normalizeSocialLink(dev.logo_url)
              };
            }
          }

          const property: Property = {
            id: data.id,
            title: data.title,
            description: data.description,
            price: data.price,
            weekdayPrice: data.weekday_price || undefined,
            weekendPrice: data.weekend_price || undefined,
            location: data.location,
            propertyType: data.property_type,
            bedrooms: data.bedrooms,
            bathrooms: data.bathrooms,
            squareFeet: data.square_feet,
            images: data.images || [],
            status: data.status,
            developerId: data.developer_id,
            developer: developerData,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            videoUrl: data.video_url || undefined,
            latitude: data.latitude ?? undefined,
            longitude: data.longitude ?? undefined,
            amenities: data.amenities || [],
            features: data.features || []
          }

          console.log('PropertiesService: getPropertyById - Mapped property developer:', {
            developer: property.developer,
            phone: property.developer?.phone
          });

          return { property, error: null }
        } catch (error) {
          console.error('Error fetching property:', error)
          // Try to find in fallback data
          const fallbackProperty = ALL_FALLBACK_PROPERTIES.find(p => p.id === id)
          if (fallbackProperty) {
            console.log('Found property in fallback data after network error')
            return { property: fallbackProperty, error: null }
          }
          return { property: null, error: 'An unexpected error occurred' }
        }
      },
      { ttl: 10 * 60 * 1000 } // Cache for 10 minutes
    );
  }

  // Create new property
  async createProperty(data: CreatePropertyData): Promise<{ property: Property | null; error: string | null }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return { property: null, error: 'User not authenticated' }
      }

      const { data: inserted, error } = await supabase
        .from('properties')
        .insert({
          title: data.title,
          description: data.description,
          price: data.price,
          weekday_price: data.weekdayPrice,
          weekend_price: data.weekendPrice,
          location: data.location,
          property_type: data.propertyType,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          square_feet: data.squareFeet,
          images: data.images || [],
          status: data.status || 'active',
          developer_id: user.id,
          video_url: data.videoUrl || null,
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
          amenities: data.amenities || [],
          features: data.features || []
        })
        .select('*')
        .single()

      if (error || !inserted) {
        return { property: null, error: error?.message || 'Failed to create property' }
      }

      // Reuse existing mapping logic (with developer join and caching)
      const { property, error: fetchError } = await this.getPropertyById(inserted.id)
      if (fetchError) {
        return { property: null, error: fetchError }
      }

      // Invalidate caches
      this.clearPropertyCaches()

      return { property, error: null }
    } catch (error) {
      console.error('Error creating property:', error)
      // Offline/timeout fallback: create a local property so UI can continue
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const now = new Date().toISOString()
          const localProp: Property = {
            id: `fallback-${Date.now()}`,
            title: data.title,
            description: data.description,
            price: data.price,
            location: data.location,
            propertyType: data.propertyType,
            bedrooms: data.bedrooms,
            bathrooms: data.bathrooms,
            squareFeet: data.squareFeet,
            images: data.images || [],
            status: (data.status as any) || 'active',
            developerId: user.id,
            createdAt: now,
            updatedAt: now,
            amenities: data.amenities || [],
            features: data.features || []
          }
          const local = readLocalProperties()
          writeLocalProperties([localProp, ...local])
          // Invalidate caches so lists re-read and include local
          this.clearPropertyCaches()
          return { property: localProp, error: null }
        }
      } catch {}
      return { property: null, error: 'Network timeout while creating property' }
    }
  }

  // Update property
  async updateProperty(data: UpdatePropertyData): Promise<{ property: Property | null; error: string | null }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return { property: null, error: 'User not authenticated' }
      }

      const updateData: any = {}
      if (data.title) updateData.title = data.title
      if (data.description) updateData.description = data.description
      if (data.price) updateData.price = data.price
      if (data.weekdayPrice !== undefined) updateData.weekday_price = data.weekdayPrice
      if (data.weekendPrice !== undefined) updateData.weekend_price = data.weekendPrice
      if (data.location) updateData.location = data.location
      if (data.propertyType) updateData.property_type = data.propertyType
      if (data.bedrooms !== undefined) updateData.bedrooms = data.bedrooms
      if (data.bathrooms !== undefined) updateData.bathrooms = data.bathrooms
      if (data.squareFeet !== undefined) updateData.square_feet = data.squareFeet
      if (data.images) updateData.images = data.images
      if (data.status) updateData.status = data.status
      if (data.videoUrl !== undefined) updateData.video_url = data.videoUrl || null
      if (data.latitude !== undefined) updateData.latitude = data.latitude ?? null
      if (data.longitude !== undefined) updateData.longitude = data.longitude ?? null
      if (data.amenities) updateData.amenities = data.amenities
      if (data.features) updateData.features = data.features

      const { data: propertyData, error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', data.id)
        .eq('developer_id', user.id) // Ensure user owns the property
        .select(`
          *,
          developer:profiles!properties_developer_id_fkey(
            id,
            first_name,
            last_name,
            company_name,
            phone
          )
        `)
        .single()

      if (error) {
        return { property: null, error: error.message }
      }

      const property: Property = {
        id: propertyData.id,
        title: propertyData.title,
        description: propertyData.description,
        price: propertyData.price,
        location: propertyData.location,
        propertyType: propertyData.property_type,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        squareFeet: propertyData.square_feet,
        images: propertyData.images || [],
        status: propertyData.status,
        developerId: propertyData.developer_id,
        developer: propertyData.developer && Array.isArray(propertyData.developer) && propertyData.developer.length > 0 ? {
          id: propertyData.developer[0].id,
          firstName: propertyData.developer[0].first_name,
          lastName: propertyData.developer[0].last_name,
          companyName: propertyData.developer[0].company_name,
          phone: propertyData.developer[0].phone
        } : undefined,
        createdAt: propertyData.created_at,
        updatedAt: propertyData.updated_at,
        videoUrl: propertyData.video_url || undefined,
        latitude: propertyData.latitude ?? undefined,
        longitude: propertyData.longitude ?? undefined,
        amenities: propertyData.amenities || [],
        features: propertyData.features || []
      }

      // Invalidate caches
      this.clearPropertyCaches()

      return { property, error: null }
    } catch (error) {
      console.error('Error updating property:', error)
      return { property: null, error: 'An unexpected error occurred' }
    }
  }

  // Delete property
  async deleteProperty(id: string): Promise<{ error: string | null }> {
    try {
      // Use local session to avoid network call/CORS
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        console.error('deleteProperty: getSession error:', sessionError)
      }
      const sessionUser = sessionData?.session?.user || null
      
      // If this is a locally created fallback property, delete from local storage regardless of auth
      if (id.startsWith('fallback-')) {
        console.log('deleteProperty: removing local fallback', id)
        const local = readLocalProperties().filter(p => p.id !== id)
        writeLocalProperties(local)
        this.clearPropertyCaches()
        try { window.dispatchEvent(new CustomEvent('realaist:property-deleted', { detail: { id } })); } catch {}
        return { error: null }
      }

      if (!sessionUser) {
        console.error('deleteProperty: no session user present')
        return { error: 'User not authenticated' }
      }

      console.log('deleteProperty: attempting DB delete', { id, developerId: sessionUser.id })
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)
        .eq('developer_id', sessionUser.id) // Ensure user owns the property

      if (error) {
        console.error('deleteProperty: supabase error', error)
        return { error: error.message }
      }

      // Invalidate caches
      this.clearPropertyCaches()
      try { window.dispatchEvent(new CustomEvent('realaist:property-deleted', { detail: { id } })); } catch {}

      return { error: null }
    } catch (error) {
      console.error('Error deleting property:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  // Get developer's properties
  async getDeveloperProperties(developerId?: string): Promise<{ properties: Property[]; error: string | null }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return { properties: [], error: 'User not authenticated' }
      }

      const targetDeveloperId = developerId || user.id

      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          developer:profiles!properties_developer_id_fkey(
            id,
            first_name,
            last_name,
            company_name,
            phone
          )
        `)
        .eq('developer_id', targetDeveloperId)
        .order('created_at', { ascending: false })

      if (error) {
        // Merge with locally created properties for this developer
        const local = readLocalProperties().filter(p => p.developerId === targetDeveloperId)
        return { properties: local, error: error.message }
      }

      const properties: Property[] = data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        location: item.location,
        propertyType: item.property_type,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        squareFeet: item.square_feet,
        images: item.images || [],
        status: item.status,
        developerId: item.developer_id,
        developer: item.developer && Array.isArray(item.developer) && item.developer.length > 0 ? {
          id: item.developer[0].id,
          firstName: item.developer[0].first_name,
          lastName: item.developer[0].last_name,
          companyName: item.developer[0].company_name,
          phone: item.developer[0].phone
        } : undefined,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        videoUrl: item.video_url || undefined,
        latitude: item.latitude ?? undefined,
        longitude: item.longitude ?? undefined,
        amenities: item.amenities || [],
        features: item.features || []
      }))

      // Merge with locally created properties
      const local = readLocalProperties().filter(p => p.developerId === targetDeveloperId)
      return { properties: [...local, ...properties], error: null }
    } catch (error) {
      console.error('Error fetching developer properties:', error)
      const { data: { user } } = await supabase.auth.getUser()
      const local = user ? readLocalProperties().filter(p => p.developerId === user.id) : []
      return { properties: local, error: 'An unexpected error occurred' }
    }
  }
}

export const propertiesService = new PropertiesService()
