import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vlflqhddhammqpkzkael.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsZmxxaGRkaGFtbXFwa3prYWVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4ODM5MTksImV4cCI6MjEwMTQ1OTkxOX0.SFm8QvtI-yQ0IN_qNV_9PeRy2vWmFEg5iGhC_EjZDQQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---- Auth helpers ----

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ---- Articles ----

/**
 * Fetch published articles, newest first.
 * @param {object} opts - { limit, offset, category, featured }
 */
export async function fetchArticles(opts = {}) {
  let query = supabase
    .from('articles')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (opts.category) query = query.eq('category', opts.category);
  if (opts.featured !== undefined) query = query.eq('featured', opts.featured);
  if (opts.limit) query = query.limit(opts.limit);
  if (opts.offset) query = query.range(opts.offset, opts.offset + (opts.limit || 20) - 1);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Fetch a single article by slug (published only for public).
 */
export async function fetchArticleBySlug(slug) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data || null;
}

// ---- Admin: Articles (all, including drafts) ----

export async function adminFetchArticles() {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function adminFetchArticleById(id) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function saveArticle(article) {
  if (article.id) {
    // Update existing
    const { data, error } = await supabase
      .from('articles')
      .update(article)
      .eq('id', article.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    // Insert new
    const { id, ...rest } = article; // remove undefined id
    const { data, error } = await supabase
      .from('articles')
      .insert(rest)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export async function deleteArticle(id) {
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function toggleFeatured(id, featured) {
  const { error } = await supabase
    .from('articles')
    .update({ featured })
    .eq('id', id);
  if (error) throw error;
}

export async function setMainFeatured(id) {
  // First, remove main featured from all
  await supabase
    .from('articles')
    .update({ is_main_featured: false })
    .neq('id', '00000000-0000-0000-0000-000000000000'); // update all
    
  // Then set it for this one, and ensure it's featured
  const { error } = await supabase
    .from('articles')
    .update({ is_main_featured: true, featured: true })
    .eq('id', id);
  if (error) throw error;
}

// ---- Categories ----

export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('label', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createCategory(slug, label) {
  const { data, error } = await supabase
    .from('categories')
    .insert({ slug, label })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ---- Ad Slots ----

/**
 * Fetch all ad slots (public, for front-end rendering).
 */
export async function fetchAdSlots() {
  const { data, error } = await supabase
    .from('ad_slots')
    .select('*');

  if (error) throw error;
  return data || [];
}

/**
 * Update an ad slot (authenticated, for admin).
 */
export async function updateAdSlot(id, updates) {
  const { data, error } = await supabase
    .from('ad_slots')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ---- Utility ----

/**
 * Generate a URL-friendly slug from a title.
 */
export function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9\s-]/g, '')    // remove special chars
    .replace(/\s+/g, '-')            // spaces → hyphens
    .replace(/-+/g, '-')             // collapse multiple hyphens
    .replace(/^-|-$/g, '')           // trim hyphens
    .slice(0, 80);                   // limit length
}
