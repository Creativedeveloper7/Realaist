import { supabase } from '../lib/supabase'
import { offPlanProjects, completedProjects } from '../data/projects'
import { apiCacheService } from './apiCacheService'

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
    updatedAt: new Date().toISOString()
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
    updatedAt: new Date().toISOString()
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
    updatedAt: new Date().toISOString()
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
    updatedAt: new Date().toISOString()
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
    updatedAt: new Date().toISOString()
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
    updatedAt: new Date().toISOString()
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
  updatedAt: new Date().toISOString()
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
  }
  createdAt: string
  updatedAt: string
}

export interface CreatePropertyData {
  title: string
  description: string
  price: number
  location: string
  propertyType: string
  bedrooms?: number
  bathrooms?: number
  squareFeet?: number
  images?: string[]
  status?: 'active' | 'sold' | 'pending' | 'draft'
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
  // Get all properties with optional filters
  async getProperties(filters?: PropertyFilters): Promise<{ properties: Property[]; error: string | null }> {
    // Create cache key based on filters
    const cacheKey = `properties-${JSON.stringify(filters || {})}`;
    
    return apiCacheService.get(
      cacheKey,
      async () => {
        try {
          let query = supabase
            .from('properties')
            .select(`
              id,
              title,
              description,
              price,
              location,
              property_type,
              bedrooms,
              bathrooms,
              square_feet,
              images,
              status,
              developer_id,
              created_at,
              updated_at,
              developer:profiles!properties_developer_id_fkey(
                id,
                first_name,
                last_name,
                company_name,
                phone
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

          const { data, error } = await query

          if (error) {
            console.error('Error fetching properties:', error)
            // Return fallback data when database is unavailable
            console.log('Using fallback properties due to database error')
            return { properties: ALL_FALLBACK_PROPERTIES, error: null }
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
            developer: item.developer ? {
              id: item.developer.id,
              firstName: item.developer.first_name,
              lastName: item.developer.last_name,
              companyName: item.developer.company_name,
              phone: item.developer.phone
            } : undefined,
            createdAt: item.created_at,
            updatedAt: item.updated_at
          }))

          return { properties, error: null }
        } catch (error) {
          console.error('Error fetching properties:', error)
          // Return fallback data when there's a network error
          console.log('Using fallback properties due to network error')
          return { properties: ALL_FALLBACK_PROPERTIES, error: null }
        }
      },
      { ttl: 5 * 60 * 1000 } // Cache for 5 minutes
    );
  }

  // Get property by ID
  async getPropertyById(id: string): Promise<{ property: Property | null; error: string | null }> {
    const cacheKey = `property-${id}`;
    
    return apiCacheService.get(
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
              location,
              property_type,
              bedrooms,
              bathrooms,
              square_feet,
              images,
              status,
              developer_id,
              created_at,
              updated_at,
              developer:profiles!properties_developer_id_fkey(
                id,
                first_name,
                last_name,
                company_name,
                phone
              )
            `)
            .eq('id', id)
            .single()

          if (error) {
            console.error('Error fetching property by ID:', error)
            // Try to find in fallback data
            const fallbackProperty = ALL_FALLBACK_PROPERTIES.find(p => p.id === id)
            if (fallbackProperty) {
              console.log('Found property in fallback data')
              return { property: fallbackProperty, error: null }
            }
            return { property: null, error: error.message }
          }

          const property: Property = {
            id: data.id,
            title: data.title,
            description: data.description,
            price: data.price,
            location: data.location,
            propertyType: data.property_type,
            bedrooms: data.bedrooms,
            bathrooms: data.bathrooms,
            squareFeet: data.square_feet,
            images: data.images || [],
            status: data.status,
            developerId: data.developer_id,
            developer: data.developer ? {
              id: data.developer.id,
              firstName: data.developer.first_name,
              lastName: data.developer.last_name,
              companyName: data.developer.company_name,
              phone: data.developer.phone
            } : undefined,
            createdAt: data.created_at,
            updatedAt: data.updated_at
          }

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

      const { data: propertyData, error } = await supabase
        .from('properties')
        .insert({
          title: data.title,
          description: data.description,
          price: data.price,
          location: data.location,
          property_type: data.propertyType,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          square_feet: data.squareFeet,
          images: data.images || [],
          status: data.status || 'draft',
          developer_id: user.id
        })
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
        developer: propertyData.developer ? {
          id: propertyData.developer.id,
          firstName: propertyData.developer.first_name,
          lastName: propertyData.developer.last_name,
          companyName: propertyData.developer.company_name,
          phone: propertyData.developer.phone
        } : undefined,
        createdAt: propertyData.created_at,
        updatedAt: propertyData.updated_at
      }

      return { property, error: null }
    } catch (error) {
      console.error('Error creating property:', error)
      return { property: null, error: 'An unexpected error occurred' }
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
      if (data.location) updateData.location = data.location
      if (data.propertyType) updateData.property_type = data.propertyType
      if (data.bedrooms !== undefined) updateData.bedrooms = data.bedrooms
      if (data.bathrooms !== undefined) updateData.bathrooms = data.bathrooms
      if (data.squareFeet !== undefined) updateData.square_feet = data.squareFeet
      if (data.images) updateData.images = data.images
      if (data.status) updateData.status = data.status

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
        developer: propertyData.developer ? {
          id: propertyData.developer.id,
          firstName: propertyData.developer.first_name,
          lastName: propertyData.developer.last_name,
          companyName: propertyData.developer.company_name,
          phone: propertyData.developer.phone
        } : undefined,
        createdAt: propertyData.created_at,
        updatedAt: propertyData.updated_at
      }

      return { property, error: null }
    } catch (error) {
      console.error('Error updating property:', error)
      return { property: null, error: 'An unexpected error occurred' }
    }
  }

  // Delete property
  async deleteProperty(id: string): Promise<{ error: string | null }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return { error: 'User not authenticated' }
      }

      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)
        .eq('developer_id', user.id) // Ensure user owns the property

      if (error) {
        return { error: error.message }
      }

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
        return { properties: [], error: error.message }
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
        developer: item.developer ? {
          id: item.developer.id,
          firstName: item.developer.first_name,
          lastName: item.developer.last_name,
          companyName: item.developer.company_name,
          phone: item.developer.phone
        } : undefined,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }))

      return { properties, error: null }
    } catch (error) {
      console.error('Error fetching developer properties:', error)
      return { properties: [], error: 'An unexpected error occurred' }
    }
  }
}

export const propertiesService = new PropertiesService()
