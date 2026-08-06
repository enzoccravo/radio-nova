import { fetchAdSlots } from '../lib/supabase.js';

// Cache for ad slots to avoid fetching on every page navigation
let cachedSlots = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get all ad slots (with caching).
 */
export async function getAdSlots() {
  const now = Date.now();
  if (cachedSlots && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedSlots;
  }

  try {
    cachedSlots = await fetchAdSlots();
    cacheTimestamp = now;
  } catch (err) {
    console.warn('Failed to fetch ad slots:', err.message);
    cachedSlots = [];
  }

  return cachedSlots;
}

/**
 * Get a single ad slot by ID.
 */
export async function getAdSlot(slotId) {
  const slots = await getAdSlots();
  return slots.find(s => s.id === slotId) || null;
}

/**
 * Render the content of an ad slot.
 * Returns HTML string — either the ad content or an empty string if inactive.
 */
export function renderAdContent(slot) {
  if (!slot || !slot.active) return '';

  if (slot.mode === 'html' && slot.html_code) {
    return slot.html_code;
  }

  if (slot.mode === 'image' && slot.image_url) {
    const img = `<img src="${slot.image_url}" alt="Anuncio" style="width: 100%; height: 100%; object-fit: cover; display: block;" />`;
    if (slot.link_url) {
      return `<a href="${slot.link_url}" target="_blank" rel="noopener noreferrer" style="display: block; width: 100%; height: 100%;">${img}</a>`;
    }
    return img;
  }

  return '';
}

/**
 * Invalidate the cache (call after admin saves changes).
 */
export function invalidateAdCache() {
  cachedSlots = null;
  cacheTimestamp = 0;
}
