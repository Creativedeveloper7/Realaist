import { supabase } from '../lib/supabase'

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
    try {
      let query = supabase
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
        .order('created_at', { ascending: false })

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
      console.error('Error fetching properties:', error)
      return { properties: [], error: 'An unexpected error occurred' }
    }
  }

  // Get property by ID
  async getPropertyById(id: string): Promise<{ property: Property | null; error: string | null }> {
    try {
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
        .eq('id', id)
        .single()

      if (error) {
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
      return { property: null, error: 'An unexpected error occurred' }
    }
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
