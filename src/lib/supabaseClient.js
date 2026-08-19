/**
 * Optional Supabase Client Adapter for Octarine Manualbook
 * 
 * To connect to Supabase:
 * 1. Run `npm install @supabase/supabase-js`
 * 2. Add your project credentials in `.env.local`:
 *    VITE_SUPABASE_URL=https://your-project.supabase.co
 *    VITE_SUPABASE_ANON_KEY=eyJhbGci...
 */

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const fetchAllManualDataFromSupabase = async () => {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    // Dynamic import if installed
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const [headerRes, linksRes, catsRes, pagesRes, mapsRes, hotspotsRes] = await Promise.all([
      supabase.from('header_settings').select('*').single(),
      supabase.from('top_nav_links').select('*').order('sort_order', { ascending: true }),
      supabase.from('doc_categories').select('*').order('sort_order', { ascending: true }),
      supabase.from('doc_pages').select('*').order('sort_order', { ascending: true }),
      supabase.from('interactive_maps').select('*'),
      supabase.from('map_hotspots').select('*').order('sort_order', { ascending: true })
    ]);

    // Format into application structure
    const docsStructure = (catsRes.data || []).map(cat => ({
      id: cat.id,
      title: cat.title,
      items: (pagesRes.data || [])
        .filter(p => p.category_id === cat.id)
        .map(p => ({ id: p.id, title: p.title, slug: p.slug }))
    }));

    const pagesContent = {};
    (pagesRes.data || []).forEach(p => {
      pagesContent[p.slug] = p.content;
    });

    const mapConfigs = {};
    (mapsRes.data || []).forEach(m => {
      mapConfigs[m.id] = {
        title: m.title,
        imageUrl: m.image_url,
        altText: m.alt_text,
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
