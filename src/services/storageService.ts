import { supabase } from '../lib/supabase'

export interface UploadResult {
  url: string | null
  error: string | null
}

class StorageService {
  // Upload property image
  async uploadPropertyImage(file: File, propertyId: string): Promise<UploadResult> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return { url: null, error: 'User not authenticated' }
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${user.id}/${propertyId}/${fileName}`

      const { data, error } = await supabase.storage
        .from('property-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        return { url: null, error: error.message }
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath)

      return { url: urlData.publicUrl, error: null }
    } catch (error) {
      console.error('Error uploading property image:', error)
      return { url: null, error: 'An unexpected error occurred' }
    }
  }

  // Upload blog image
  async uploadBlogImage(file: File, blogId: string): Promise<UploadResult> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return { url: null, error: 'User not authenticated' }
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${user.id}/${blogId}/${fileName}`

      const { data, error } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        return { url: null, error: error.message }
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath)

      return { url: urlData.publicUrl, error: null }
    } catch (error) {
      console.error('Error uploading blog image:', error)
      return { url: null, error: 'An unexpected error occurred' }
    }
  }

  // Upload avatar
  async uploadAvatar(file: File): Promise<UploadResult> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return { url: null, error: 'User not authenticated' }
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `avatar-${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Allow overwriting existing avatar
        })

      if (error) {
        return { url: null, error: error.message }
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      return { url: urlData.publicUrl, error: null }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      return { url: null, error: 'An unexpected error occurred' }
    }
  }

  // Delete property image
  async deletePropertyImage(imageUrl: string): Promise<{ error: string | null }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return { error: 'User not authenticated' }
      }

      // Extract file path from URL
      const urlParts = imageUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const propertyId = urlParts[urlParts.length - 2]
      const filePath = `${user.id}/${propertyId}/${fileName}`

      const { error } = await supabase.storage
        .from('property-images')
        .remove([filePath])

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      console.error('Error deleting property image:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  // Delete blog image
  async deleteBlogImage(imageUrl: string): Promise<{ error: string | null }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return { error: 'User not authenticated' }
      }

      // Extract file path from URL
      const urlParts = imageUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const blogId = urlParts[urlParts.length - 2]
      const filePath = `${user.id}/${blogId}/${fileName}`

      const { error } = await supabase.storage
        .from('blog-images')
        .remove([filePath])

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      console.error('Error deleting blog image:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  // Delete avatar
  async deleteAvatar(): Promise<{ error: string | null }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return { error: 'User not authenticated' }
      }

      // List all files in user's avatar folder
      const { data: files, error: listError } = await supabase.storage
        .from('avatars')
        .list(user.id)

      if (listError) {
        return { error: listError.message }
      }

      if (files && files.length > 0) {
        const filePaths = files.map(file => `${user.id}/${file.name}`)
        
        const { error } = await supabase.storage
          .from('avatars')
          .remove(filePaths)

        if (error) {
          return { error: error.message }
        }
      }

      return { error: null }
    } catch (error) {
      console.error('Error deleting avatar:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  // Get file size in MB
  getFileSizeInMB(file: File): number {
    return file.size / (1024 * 1024)
  }

  // Validate image file
  validateImageFile(file: File, maxSizeMB: number = 5): { isValid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Please upload a valid image file (JPEG, PNG, or WebP)' }
    }

    // Check file size
    const fileSizeMB = this.getFileSizeInMB(file)
    if (fileSizeMB > maxSizeMB) {
      return { isValid: false, error: `File size must be less than ${maxSizeMB}MB` }
    }

    return { isValid: true }
  }

  // Compress image before upload
  async compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        // Set canvas dimensions
        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              resolve(file)
            }
          },
          file.type,
          quality
        )
      }

      img.src = URL.createObjectURL(file)
    })
  }
}

export const storageService = new StorageService()
