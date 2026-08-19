import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const sanitizedUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  sanitizedUrl && 
  supabaseAnonKey && 
  sanitizedUrl !== 'https://your-project-ref.supabase.co' &&
  !sanitizedUrl.includes('your-project-ref')
);

export const supabase = isSupabaseConfigured 
  ? createClient(sanitizedUrl, supabaseAnonKey)
  : null;

/**
 * Fetch all manual configuration & content from Supabase
 */
export const fetchAllManualDataFromSupabase = async () => {
  if (!supabase) return null;

  try {
    const [headerRes, linksRes, catsRes, pagesRes, mapsRes, hotspotsRes] = await Promise.all([
      supabase.from('header_settings').select('*').limit(1).maybeSingle(),
      supabase.from('top_nav_links').select('*').order('sort_order', { ascending: true }),
      supabase.from('doc_categories').select('*').order('sort_order', { ascending: true }),
      supabase.from('doc_pages').select('*').order('sort_order', { ascending: true }),
      supabase.from('interactive_maps').select('*'),
      supabase.from('map_hotspots').select('*').order('sort_order', { ascending: true })
    ]);

    if (catsRes.error || pagesRes.error) {
      console.warn('Supabase fetch returned error:', catsRes.error || pagesRes.error);
      return null;
    }

    // Transform Categories & Pages
    const docsStructure = (catsRes.data || []).map(cat => ({
      id: cat.id,
      title: cat.title,
      items: (pagesRes.data || [])
        .filter(p => p.category_id === cat.id)
        .map(p => ({ id: p.id, title: p.title, slug: p.slug }))
    }));

    // Transform Content Map
    const pagesContent = {};
    (pagesRes.data || []).forEach(p => {
      pagesContent[p.slug] = p.content;
    });

    // Transform Interactive Maps & Hotspots
    const mapConfigs = {};
    (mapsRes.data || []).forEach(m => {
      mapConfigs[m.id] = {
        title: m.title,
        imageUrl: m.image_url,
        altText: m.alt_text || '',
        hotspots: (hotspotsRes.data || [])
          .filter(h => h.map_id === m.id)
          .map(h => ({
            id: h.id,
            badge: h.badge,
            title: h.title,
            description: h.description,
            x: Number(h.x_percent),
            y: Number(h.y_percent),
            placement: h.placement
          }))
      };
    });

    // Transform Header
    const headerConfig = {
      logoText: headerRes.data?.logo_text || 'Octarine.',
      logoSubtext: headerRes.data?.logo_subtext || 'Eau De Parfum',
      marqueeText: headerRes.data?.marquee_text || '',
      navLinks: (linksRes.data || []).map(l => ({
        id: l.id,
        label: l.label,
        url: l.url,
        isExternal: l.is_external
      }))
    };

    return {
      docsStructure,
      pagesContent,
      mapConfigs,
      headerConfig
    };
  } catch (err) {
    console.error('Supabase load error:', err);
    return null;
  }
};

/**
 * Sync updated page markdown content to Supabase
 */
export const syncPageContentToSupabase = async (slug, content) => {
  if (!supabase) return;
  try {
    await supabase
      .from('doc_pages')
      .update({ content })
      .eq('slug', slug);
  } catch (err) {
    console.error('Supabase syncPageContent error:', err);
  }
};

/**
 * Sync hotspot position / information to Supabase
 */
export const syncHotspotToSupabase = async (mapId, hotspot) => {
  if (!supabase) return;
  try {
    await supabase
      .from('map_hotspots')
      .upsert({
        id: hotspot.id,
        map_id: mapId,
        badge: hotspot.badge || 'Step',
        title: hotspot.title || 'Step Title',
        description: hotspot.description || '',
        x_percent: hotspot.x,
        y_percent: hotspot.y,
        placement: hotspot.placement || 'bottom'
      });
  } catch (err) {
    console.error('Supabase syncHotspot error:', err);
  }
};

/**
 * Delete a hotspot from Supabase
 */
export const deleteHotspotFromSupabase = async (hotspotId) => {
  if (!supabase) return;
  try {
    await supabase
      .from('map_hotspots')
      .delete()
      .eq('id', hotspotId);
  } catch (err) {
    console.error('Supabase deleteHotspot error:', err);
  }
};

/**
 * Sync header settings to Supabase
 */
export const syncHeaderToSupabase = async (headerConfig) => {
  if (!supabase) return;
  try {
    await supabase
      .from('header_settings')
      .upsert({
        id: 'default_header',
        logo_text: headerConfig.logoText,
        logo_subtext: headerConfig.logoSubtext,
        marquee_text: headerConfig.marqueeText
      });
  } catch (err) {
    console.error('Supabase syncHeader error:', err);
  }
};

/**
 * Sync Category to Supabase
 */
export const upsertCategoryToSupabase = async (category) => {
  if (!supabase) return;
  try {
    await supabase
      .from('doc_categories')
      .upsert({
        id: category.id,
        title: category.title,
        sort_order: category.sort_order || 0
      });
  } catch (err) {
    console.error('Supabase upsertCategory error:', err);
  }
};

export const deleteCategoryFromSupabase = async (categoryId) => {
  if (!supabase) return;
  try {
    await supabase.from('doc_categories').delete().eq('id', categoryId);
  } catch (err) {
    console.error('Supabase deleteCategory error:', err);
  }
};

/**
 * Sync Page Metadata to Supabase
 */
export const upsertPageToSupabase = async (page, categoryId, sortOrder) => {
  if (!supabase) return;
  try {
    await supabase
      .from('doc_pages')
      .upsert({
        id: page.id,
        category_id: categoryId,
        title: page.title,
        slug: page.slug,
        sort_order: sortOrder
      });
  } catch (err) {
    console.error('Supabase upsertPage error:', err);
  }
};

export const deletePageFromSupabase = async (pageId) => {
  if (!supabase) return;
  try {
    await supabase.from('doc_pages').delete().eq('id', pageId);
  } catch (err) {
    console.error('Supabase deletePage error:', err);
  }
};

/**
 * Sync Interactive Map (Picture Session) to Supabase
 */
export const upsertInteractiveMapToSupabase = async (mapId, mapData) => {
  if (!supabase) return;
  try {
    await supabase
      .from('interactive_maps')
      .upsert({
        id: mapId,
        title: mapData.title || '',
        image_url: mapData.imageUrl || '',
        alt_text: mapData.altText || ''
      });
  } catch (err) {
    console.error('Supabase upsertInteractiveMap error:', err);
  }
};

export const deleteInteractiveMapFromSupabase = async (mapId) => {
  if (!supabase) return;
  try {
    await supabase.from('interactive_maps').delete().eq('id', mapId);
  } catch (err) {
    console.error('Supabase deleteInteractiveMap error:', err);
  }
};
