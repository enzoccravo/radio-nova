/**
 * News data fetcher — connects to Supabase.
 * Replaces the old static news.js module.
 * Includes in-memory cache for SPA navigation performance.
 */
import { fetchArticles, fetchArticleBySlug, fetchCategories } from '../lib/supabase.js';

// Simple in-memory cache
let cachedArticles = null;
let cachedCategories = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 1000; // 1 minute

/**
 * Get all published articles (cached) with category labels.
 */
export async function getArticles() {
  const now = Date.now();
  if (cachedArticles && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedArticles;
  }

  const [articles, categories] = await Promise.all([
    fetchArticles(),
    cachedCategories ? Promise.resolve(cachedCategories) : fetchCategories()
  ]);
  
  cachedCategories = categories;

  // Map category label to each article
  cachedArticles = articles.map(article => {
    const cat = categories.find(c => c.slug === article.category);
    return {
      ...article,
      category_label: cat ? cat.label : article.category
    };
  });

  cacheTimestamp = now;
  return cachedArticles;
}

/**
 * Get a single article by slug.
 */
export async function getArticleBySlug(slug) {
  // Try cache first
  if (cachedArticles) {
    const cached = cachedArticles.find(a => a.slug === slug);
    if (cached) return cached;
  }

  return await fetchArticleBySlug(slug);
}

/**
 * Get articles by category.
 */
export async function getArticlesByCategory(category) {
  const all = await getArticles();
  return all.filter(a => a.category === category);
}

/**
 * Invalidate cache (e.g., after admin edits).
 */
export function invalidateCache() {
  cachedArticles = null;
  cacheTimestamp = 0;
}
