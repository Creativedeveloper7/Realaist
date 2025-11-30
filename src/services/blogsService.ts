import { supabase } from '../lib/supabase';

export interface BlogRecord {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  authorId: string;
  status: 'published' | 'draft' | 'archived';
  featuredImage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogData {
  title: string;
  excerpt: string;
  content: string;
  status: 'published' | 'draft' | 'archived';
  featuredImage?: string;
}

export interface UpdateBlogData extends Partial<CreateBlogData> {
  id: string;
}

class BlogsService {
  async getDeveloperBlogs(authorId?: string): Promise<{ blogs: BlogRecord[]; error: string | null }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { blogs: [], error: 'User not authenticated' };
      }

      const targetAuthorId = authorId || user.id;

      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('author_id', targetAuthorId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching blogs:', error);
        return { blogs: [], error: error.message };
      }

      const blogs: BlogRecord[] = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        excerpt: item.excerpt,
        content: item.content,
        authorId: item.author_id,
        status: item.status,
        featuredImage: item.featured_image,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      return { blogs, error: null };
    } catch (err) {
      console.error('Unexpected error fetching blogs:', err);
      return { blogs: [], error: 'An unexpected error occurred' };
    }
  }

  async createBlog(data: CreateBlogData): Promise<{ blog: BlogRecord | null; error: string | null }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { blog: null, error: 'User not authenticated' };
      }

      const { data: inserted, error } = await supabase
        .from('blogs')
        .insert({
          title: data.title,
          content: data.content,
          excerpt: data.excerpt,
          featured_image: data.featuredImage || null,
          author_id: user.id,
          status: data.status,
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error creating blog:', error);
        return { blog: null, error: error.message };
      }

      const blog: BlogRecord = {
        id: inserted.id,
        title: inserted.title,
        excerpt: inserted.excerpt,
        content: inserted.content,
        authorId: inserted.author_id,
        status: inserted.status,
        featuredImage: inserted.featured_image,
        createdAt: inserted.created_at,
        updatedAt: inserted.updated_at,
      };

      return { blog, error: null };
    } catch (err) {
      console.error('Unexpected error creating blog:', err);
      return { blog: null, error: 'An unexpected error occurred' };
    }
  }

  async updateBlog(data: UpdateBlogData): Promise<{ blog: BlogRecord | null; error: string | null }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { blog: null, error: 'User not authenticated' };
      }

      const update: any = {};
      if (data.title !== undefined) update.title = data.title;
      if (data.excerpt !== undefined) update.excerpt = data.excerpt;
      if (data.content !== undefined) update.content = data.content;
      if (data.status !== undefined) update.status = data.status;
      if (data.featuredImage !== undefined) update.featured_image = data.featuredImage;

      const { data: updated, error } = await supabase
        .from('blogs')
        .update(update)
        .eq('id', data.id)
        .eq('author_id', user.id)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating blog:', error);
        return { blog: null, error: error.message };
      }

      const blog: BlogRecord = {
        id: updated.id,
        title: updated.title,
        excerpt: updated.excerpt,
        content: updated.content,
        authorId: updated.author_id,
        status: updated.status,
        featuredImage: updated.featured_image,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      };

      return { blog, error: null };
    } catch (err) {
      console.error('Unexpected error updating blog:', err);
      return { blog: null, error: 'An unexpected error occurred' };
    }
  }

  async deleteBlog(id: string): Promise<{ error: string | null }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id)
        .eq('author_id', user.id);

      if (error) {
        console.error('Error deleting blog:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (err) {
      console.error('Unexpected error deleting blog:', err);
      return { error: 'An unexpected error occurred' };
    }
  }
}

export const blogsService = new BlogsService();
