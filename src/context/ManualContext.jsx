import React, { createContext, useContext, useState, useEffect } from 'react';
import adminLoginImg from '../assets/admin-login.png';
import { parseMarkdownToSections, sectionsToMarkdown } from '../utils/markdownSections';
import { 
  fetchAllManualDataFromSupabase, 
  isSupabaseConfigured,
  syncPageContentToSupabase,
  syncHotspotToSupabase,
  deleteHotspotFromSupabase,
  syncHeaderToSupabase,
  upsertCategoryToSupabase,
  deleteCategoryFromSupabase,
  upsertPageToSupabase,
  deletePageFromSupabase,
  upsertInteractiveMapToSupabase,
  deleteInteractiveMapFromSupabase
} from '../lib/supabaseClient';

const ManualContext = createContext();

const STORAGE_KEYS = {
  DOCS_STRUCTURE: 'octarine_docs_structure',
  PAGES_CONTENT: 'octarine_pages_content',
  MAP_CONFIGS: 'octarine_map_configs',
  HEADER_CONFIG: 'octarine_header_config',
  SIDEBAR_OPEN: 'octarine_sidebar_open'
};

const DEFAULT_DOCS_STRUCTURE = [
  {
    id: 'cat-getting-started',
    title: 'Getting Started',
    items: [
      { id: 'page-intro', title: 'Introduction', slug: 'introduction' },
      { id: 'page-interactive-demo', title: 'Interactive Storefront Guide', slug: 'interactive-demo' },
      { id: 'page-about', title: 'About Octarine', slug: 'about-octarine' }
    ]
  },
  {
    id: 'cat-admin-portal',
    title: 'Admin Portal',
    items: [
      { id: 'page-admin-login', title: 'Admin Login Guide', slug: 'admin-login' },
      { id: 'page-sales-dashboard', title: 'Sales Dashboard', slug: 'sales-dashboard' }
    ]
  },
  {
    id: 'cat-products-guides',
    title: 'Products & Guides',
    items: [
      { id: 'page-fragrance-notes', title: 'Fragrance Notes', slug: 'fragrance-notes' },
      { id: 'page-choosing-scent', title: 'Choosing Your Scent', slug: 'choosing-scent' },
      { id: 'page-product-care', title: 'Product Care', slug: 'product-care' }
    ]
  },
  {
    id: 'cat-shopping-support',
    title: 'Shopping & Support',
    items: [
      { id: 'page-how-to-order', title: 'How to Order', slug: 'how-to-order' },
      { id: 'page-shipping', title: 'Shipping Policy', slug: 'shipping' },
      { id: 'page-returns', title: 'Returns & Refunds', slug: 'returns' },
      { id: 'page-faqs', title: 'FAQs', slug: 'faqs' }
    ]
  }
];

const DEFAULT_HEADER_CONFIG = {
  logoText: 'Octarine.',
  logoSubtext: 'Eau De Parfum',
  marqueeText: 'NEW ARRIVALS EVERY WEEK • EXCLUSIVE FRAGRANCE COLLECTIONS • CAPTIVATE WITH EVERY SPRAY • DISCOVER YOUR SCENT • AUTHENTIC DESIGNER PERFUMES • ENDLESS POSSIBILITIES AWAIT • ',
  navLinks: [
    { id: 'nl-shop', label: 'SHOP', url: 'https://octarine.co.id/shop', isExternal: true },
    { id: 'nl-collections', label: 'COLLECTIONS', url: 'https://octarine.co.id/collections', isExternal: true },
    { id: 'nl-promo', label: 'PROMO', url: 'https://octarine.co.id/promo', isExternal: true },
    { id: 'nl-about', label: 'ABOUT', url: 'https://octarine.co.id/about', isExternal: true },
    { id: 'nl-blog', label: 'BLOG', url: 'https://octarine.co.id/blog', isExternal: true },
    { id: 'nl-manual', label: 'MANUAL', url: '/manual/introduction', isExternal: false }
  ]
};

const DEFAULT_MAP_CONFIGS = {
  'home-page-map': {
    title: 'Octarine Storefront Overview',
    imageUrl: 'https://placehold.co/1200x800/e0e0e0/333333?text=Octarine+Storefront+Overview',
    altText: 'Octarine Homepage',
    hotspots: [
      {
        id: 'hs-shop',
        x: 45,
        y: 8,
        badge: 'Navigation',
        placement: 'bottom',
        title: 'Shop Navigation',
        description: 'Directs users to the main product catalog where they can filter by fragrance notes and category.'
      },
      {
        id: 'hs-cart',
        x: 85,
        y: 8,
        badge: 'Cart',
        placement: 'bottom',
        title: 'Shopping Cart',
        description: 'Displays the number of items currently in the cart. Hovering opens the mini-cart dropdown.'
      },
      {
        id: 'hs-hero',
        x: 50,
        y: 75,
        badge: 'Action',
        placement: 'top',
        title: 'Discover Now Button',
        description: 'Primary Call to Action (CTA) leading directly to the featured perfume collection.'
      }
    ]
  },
  'admin-login-map': {
    title: 'Octarine Admin Login Screen',
    imageUrl: adminLoginImg,
    altText: 'Octarine Admin Portal Login Screen',
    hotspots: [
      {
        id: 'hs-url',
        x: 24.5,
        y: 3.2,
        badge: 'Step 1',
        placement: 'bottom',
        title: '1. Administrative URL',
        description: 'Access the backoffice login portal at https://octarine.co.id/admin/login. Ensure HTTPS encryption is active.'
      },
      {
        id: 'hs-brand',
        x: 50.0,
        y: 26.0,
        badge: 'Portal',
        placement: 'bottom',
        title: 'Octarine Admin Gateway',
        description: 'Official centralized administrative gateway for managing orders, products, inventory, and promotions.'
      },
      {
        id: 'hs-email',
        x: 43.8,
        y: 52.5,
        badge: 'Step 2',
        placement: 'top',
        title: '2. Email Address Field',
        description: 'Input your registered administrator credentials (e.g., admin@octarine.co.id). Make sure to avoid trailing spaces.'
      },
      {
        id: 'hs-password',
        x: 55.5,
        y: 62.5,
        badge: 'Step 3',
        placement: 'top',
        title: '3. Password Field & Visibility Toggle',
        description: 'Input your secret administrative password. Click the eye icon on the right to toggle password masking.'
      },
      {
        id: 'hs-signin',
        x: 50.0,
        y: 70.5,
        badge: 'Step 4',
        placement: 'bottom',
        title: '4. Sign In Action Button',
        description: 'Click "Sign in" (or press Enter) to authenticate and proceed directly to the Octarine Admin Management Dashboard.'
      }
    ]
  },
  'sales-dashboard-1': {
    title: 'Sales Dashboard - Top Metrics & Daily Orders',
    imageUrl: 'https://placehold.co/1200x600/f8fafc/334155?text=Please+Upload+Sales+Dashboard+Section+1+Image',
    altText: 'Sales Dashboard Top Metrics',
    hotspots: [
      {
        id: 'hs-sd1-metrics',
        x: 30,
        y: 20,
        badge: 'Metrics',
        placement: 'bottom',
        title: 'High-Level Metrics',
        description: 'Displays the unique customers, total order count, total GMV, and Average Order Value (AOV) for the selected date range.'
      },
      {
        id: 'hs-sd1-table',
        x: 50,
        y: 50,
        badge: 'Table',
        placement: 'bottom',
        title: 'Case Breakdown Table',
        description: 'Details order count and GMV specifically isolated by Order Cases (A: Cancelled/Unpaid, B: Delivered, C: Paid & Cancelled).'
      }
    ]
  },
  'sales-dashboard-2': {
    title: 'Sales Dashboard - Volume & Product Trends',
    imageUrl: 'https://placehold.co/1200x600/f8fafc/334155?text=Please+Upload+Sales+Dashboard+Section+2+Image',
    altText: 'Sales Dashboard Volume Trends',
    hotspots: [
      {
        id: 'hs-sd2-gmv',
        x: 50,
        y: 25,
        badge: 'Trends',
        placement: 'bottom',
        title: 'Daily GMV Trend Line',
        description: 'Visualizes the fluctuation of Gross Merchandise Value on a daily basis, split by case types.'
      },
      {
        id: 'hs-sd2-bottles',
        x: 50,
        y: 75,
        badge: 'Products',
        placement: 'top',
        title: 'Bottle Size Distribution',
        description: 'Breaks down the absolute volume of products sold by bottle size (2ml, 20ml, 50ml), helping manage inventory levels.'
      }
    ]
  }
};

const DEFAULT_PAGES_CONTENT = {
  'introduction': `# Welcome to Octarine

Discover your scent with Octarine — a premium local perfume crafted with world-class aromas. This interactive manual is designed to guide you through our collections, help you choose your perfect fragrance, and provide information on our services.

## Authentic Designer Perfumes

Octarine is committed to bringing you the finest natural ingredients. We explore the globe to learn where and how these are harvested, ensuring that every spray captivates and elevates your presence.

### What You'll Find Here

- **Getting Started:** Learn about our story and mission.
- **Admin Portal:** Step-by-step guides for backoffice store operations and authentication.
- **Products & Guides:** Dive into our fragrance notes and discover tips on choosing the scent that defines you.
- **Shopping & Support:** Everything you need to know about ordering, shipping, and returns.

> "Captivate with every spray. Endless possibilities await."

Ready to begin your journey? Choose a topic from the sidebar or switch to **Edit Mode** to customize this guide.`,

  'interactive-demo': `# Interactive Webcommerce Guide

Welcome to the interactive guide for the **Octarine** webcommerce platform. Here, we break down the key features of both the customer-facing storefront and the administrative backoffice interface.

---

## 1. Storefront Overview

This interactive map illustrates the primary components of the public homepage, including top navigation, shopping cart access, and the central hero call-to-action.

\`\`\`interactive-map
home-page-map
\`\`\`

---

## 2. Administrator Portal & Authentication

For authorized staff and store managers, the administration portal provides access to inventory, orders, and system settings.

\`\`\`interactive-map
admin-login-map
\`\`\`

> [!TIP]
> For a full, dedicated walkthrough of the administrative credentials input and security best practices, visit the [Admin Login Guide](/manual/admin-login).`,

  'admin-login': `# Admin Portal Login Guide

The **Octarine Admin Portal** is the centralized management gateway for authorized administrators, store managers, and fulfillment teams. It provides full control over catalog inventory, order processing, customer analytics, and marketing promotions.

---

## Interactive Admin Login Overview

Click on any of the pulsing indicator dots below to explore the login interface and understand each input field and action. You can also toggle **Edit Mode** to drag and reposition these dots or add new ones.

\`\`\`interactive-map
admin-login-map
\`\`\`

---

## Authentication Procedure

To sign in to the Octarine backoffice, follow the standard authentication workflow:

### Step 1: Navigate to the Admin Portal
- Open a modern, secure web browser (Google Chrome, Microsoft Edge, Firefox, or Safari).
- Navigate to the administrative login endpoint: **\`https://octarine.co.id/admin/login\`**.
- Verify that your connection is secured with an active SSL certificate (indicated by the lock icon in your browser's address bar).

### Step 2: Input Your Administrator Credentials

1. **Email Address Field**:
   - Click into the **Email** text box.
   - Enter your registered administrator or staff email address (e.g., \`admin@octarine.co.id\` or \`staff.name@octarine.co.id\`).
   - *Note: Ensure there are no accidental spaces before or after the email address.*

2. **Password Field**:
   - Click into the **Password** text box.
   - Enter your secret account password.
   - **Show/Hide Toggle**: Click the **Eye icon** on the right side of the password box to reveal the plaintext password and verify that you haven't made a typing mistake before submitting.

### Step 3: Submit and Access the Dashboard
- Click the **Sign in** button or press **\`Enter\`** on your keyboard.
- Once authenticated, the system will redirect you to the **Octarine Management Dashboard** (\`/admin/dashboard\`).

---

## Security & Credential Best Practices

> [!IMPORTANT]
> **Strict Confidentiality Required**
> - Administrative credentials provide high-privilege access to customer personal information and store financial data.
> - **Never** share passwords across team members or over unencrypted messaging platforms.
> - Always use a distinct, high-entropy password managed by an enterprise password manager.

> [!TIP]
> **Session Security**
> - For compliance and security reasons, administrator sessions automatically expire after 60 minutes of inactivity.
> - Always log out manually when stepping away from your workstation by clicking **Logout** in the dashboard profile menu.

---

## Troubleshooting Common Issues

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **"Invalid credentials"** | Incorrect email or password entered. | Double-check caps lock and click the eye icon to verify password spelling. |
| **"Too many failed attempts"** | Rate limiting activated after consecutive failed attempts. | Wait 5 minutes for the security cooldown or contact the Lead DevOps engineer. |
| **"Unauthorized access"** | Account lacks administrative permissions. | Ensure you are signing in with an account granted the \`Store Admin\` or \`Manager\` role. |
| **Session Expired** | Automatic timeout due to inactivity. | Refresh the page and re-enter your login credentials. |`,

  'sales-dashboard': `# Sales Dashboard Guide

The **Sales Dashboard** provides real-time analytics and insights into Octarine's daily performance, order volumes, and customer behavior.

---

## Section 1: Top Metrics & Daily Orders

This section covers the core performance indicators and the daily order volume breakdown by case type.

\`\`\`interactive-map
sales-dashboard-1
\`\`\`

**Key Metrics Explained:**
- **Unique Customers**: The sum of daily distinct customers making a purchase.
- **Total Order**: The cumulative count of all orders (Case A + B + C).
- **Total Value (GMV)**: Gross Merchandise Value across all orders.
- **AOV (Average Order Value)**: Total Value divided by Total Orders, indicating the average spend per customer.

**Cases A / B / C Range Totals**:
This table breaks down performance by order status:
- **Case A - UNPAID - CANCEL**: Orders that were placed but cancelled or left unpaid.
- **Case B - PAID & DELIVERED**: Successfully completed and delivered orders.
- **Case C - PAID - CANCEL**: Orders paid but subsequently cancelled.

---

## Section 2: GMV Trends & Product Volumes

This section provides a deeper dive into revenue trends and product size preferences.

\`\`\`interactive-map
sales-dashboard-2
\`\`\`

**Daily GMV per case**:
A line chart visualizing the Gross Merchandise Value trend over the selected date range.

**Bottle Sizes (Keseluruhan)**:
A consolidated bar chart showing the distribution of bottle sizes sold (e.g., 2ml discovery size, 20ml, 50ml). 
The individual Case A, B, and C charts below it break down this volume metric by the specific order statuses.`,

  'about-octarine': `# About Octarine

**Octarinē Eau De Parfum** is a luxury fragrance house dedicated to the art of olfactive elegance. We craft evocative, timeless perfumes by combining world-class ingredients with artisanal perfumery traditions.

---

## Our Story & Philosophy

Born from a passion for captivating scents and sensory storytelling, Octarine creates fragrances that make unforgettable impressions. Every bottle is a harmonious symphony of top, heart, and base notes formulated to evolve beautifully throughout the day.

### Core Values
- **Artisanal Craftsmanship**: High-concentration Eau De Parfum blends created for longevity and sillage.
- **Ethical Sourcing**: Ethically harvested botanicals and cruelty-free essential oils.
- **Accessible Luxury**: Providing world-class fragrance experiences directly to scent enthusiasts.

---

> "Captivate with every spray. Endless possibilities await."`,

  'fragrance-notes': `# Fragrance Notes & Families

Understanding fragrance architecture helps you appreciate how your perfume develops from the first spray to the dry-down hours later.

---

## The Olfactory Pyramid

1. **Top Notes (Head Notes)**:
   - The initial scent impression perceived immediately upon application.
   - Typically fresh, bright, and citrusy (e.g., Bergamot, Mandarin, Pink Pepper).
   - Lasts: 15 to 30 minutes.

2. **Heart Notes (Middle Notes)**:
   - The true character and body of the fragrance that emerges after top notes fade.
   - Typically floral, spicy, or aromatic (e.g., Jasmine, Lavender, Nutmeg, Rose).
   - Lasts: 2 to 4 hours.

3. **Base Notes (Dry-Down)**:
   - The lingering foundation providing depth and longevity.
   - Typically warm, woody, and rich (e.g., Sandalwood, Amber, Vanilla, Musk).
   - Lasts: 6 to 12+ hours.`,

  'choosing-scent': `# Choosing Your Scent

Selecting a signature fragrance is a personal journey. Here are expert recommendations to guide you:

---

## 1. Match Scent to Occasion & Climate

- **Daytime & Office**: Crisp citrus, clean aquatic, or subtle floral accords that remain polite and refreshing.
- **Evening & Special Events**: Rich oriental, warm amber, and smoky oud accords that project confidence and elegance.
- **Warm Weather**: Lighter Eau De Parfum with botanical and sparkling citrus notes.
- **Cool Weather**: Gourmand, vanilla, leather, and wood notes that project warm, cozy sillage.

---

## 2. Test On Skin, Not Just Paper
Perfumes react uniquely with your skin chemistry and natural body heat. Always allow the scent to develop for at least 30 minutes before judging the final dry-down profile.`,

  'product-care': `# Product Care & Longevity

To preserve the delicate aroma molecules and ensure maximum longevity of your Octarine Eau De Parfum, follow these care instructions:

---

## Optimal Storage Guidelines
1. **Avoid Direct Sunlight**: UV rays break down aromatic compounds and cause oxidation.
2. **Maintain Stable Temperature**: Store bottles in a cool, dry place between 15°C and 22°C (avoid high humidity bathrooms).
3. **Keep Caps Firmly Closed**: Prevents evaporation and unwanted exposure to oxygen.

---

## Application Tips for Extended Sillage
- **Moisturize First**: Fragrance adheres significantly better to hydrated skin. Apply an unscented lotion before spraying.
- **Spray Pulse Points**: Wrist, neck, behind the ears, and inside elbows.
- **Do Not Rub Wrists**: Rubbing causes friction that breaks down top notes prematurely. Simply spray and let dry naturally.`,

  'how-to-order': `# How to Order

Placing an order on the Octarine webstore is simple and seamless. Follow these steps:

---

## Step-by-Step Checkout Process

1. **Browse Collections**: Explore our fragrances via the **[SHOP](https://octarine.co.id/shop)** or **[COLLECTIONS](https://octarine.co.id/collections)** pages.
2. **Select Volume & Quantity**: Choose your preferred size (30ml / 50ml / 100ml) and click **Add to Cart**.
3. **Review Cart**: Click the shopping bag icon in the top right to verify your chosen scents and apply any promotional coupon codes.
4. **Enter Shipping Details**: Fill in recipient information, delivery address, and select your preferred courier.
5. **Complete Secure Payment**: Choose from QRIS, Virtual Accounts (BCA, Mandiri, BRI, BNI), Credit Cards, or E-Wallets.
6. **Order Confirmation**: Once confirmed, you will receive an email and WhatsApp notification with your real-time tracking number.`,

  'shipping': `# Shipping Policy

Octarine provides nationwide shipping with premium shockproof packaging to ensure your perfumes arrive in pristine condition.

---

## Delivery Options & Estimated Time

| Service | Estimated Time | Coverage |
| :--- | :--- | :--- |
| **Instant / Same-Day Delivery** | 2 - 4 hours | Jabodetabek Area |
| **Regular Express (JNE / SiCepat / J&T)** | 1 - 3 business days | Java & Bali |
| **Nationwide Standard** | 3 - 6 business days | Outer Islands |

---

## Tracking Your Package
Once your parcel is dispatched from our fulfillment warehouse, an automated tracking URL will be sent to your registered email and phone number.`,

  'returns': `# Returns & Refunds

Customer satisfaction is paramount. If your order arrives damaged, defective, or incorrect, our concierge team is here to assist.

---

## Return Eligibility
- **Reporting Window**: Claims must be reported within **48 hours** of package delivery.
- **Condition**: Items must be in original packaging with intact seals, unless reporting a verified atomizer defect or transit breakage.
- **Unboxing Video**: An unedited unboxing video is required to process claims promptly.

---

## How to Initiate a Return
Contact our Customer Support via official WhatsApp or email \`support@octarine.co.id\` with your Order ID and unboxing documentation.`,

  'faqs': `# Frequently Asked Questions (FAQs)

Find quick answers to common questions about Octarine fragrances and services.

---

### 1. How long does Octarine Eau De Parfum last?
Our fragrances have a high oil concentration (20-25%) that typically lasts **8 to 12 hours** on skin and even longer on clothing fabrics.

### 2. Are Octarine perfumes unisex?
Most of our creations are thoughtfully crafted to be gender-neutral, allowing the wearer's skin chemistry to bring out the unique balance of notes.

### 3. How can I test scents before purchasing a full bottle?
We offer the **Discovery Discovery Set**, which includes 5x 2ml sample atomizers of our bestsellers.

### 4. How do I access the Admin Portal?
Authorized personnel can log in at **[Admin Login Guide](/manual/admin-login)** using verified staff credentials.`
};

export const ManualProvider = ({ children }) => {
  const [docsStructure, setDocsStructure] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DOCS_STRUCTURE);
      if (saved) {
        let parsed = JSON.parse(saved);
        const adminPortal = parsed.find(c => c.id === 'cat-admin-portal');
        if (adminPortal && !adminPortal.items.find(i => i.slug === 'sales-dashboard')) {
          adminPortal.items.push({ id: 'page-sales-dashboard', title: 'Sales Dashboard', slug: 'sales-dashboard' });
        }
        return parsed;
      }
      return DEFAULT_DOCS_STRUCTURE;
    } catch {
      return DEFAULT_DOCS_STRUCTURE;
    }
  });

  const [pagesContent, setPagesContent] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PAGES_CONTENT);
      if (saved) {
        let parsed = JSON.parse(saved);
        if (!parsed['sales-dashboard']) {
          parsed['sales-dashboard'] = DEFAULT_PAGES_CONTENT['sales-dashboard'];
        }
        return parsed;
      }
      return DEFAULT_PAGES_CONTENT;
    } catch {
      return DEFAULT_PAGES_CONTENT;
    }
  });

  const [mapConfigs, setMapConfigs] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MAP_CONFIGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed['admin-login-map']) {
          parsed['admin-login-map'].imageUrl = adminLoginImg;
          if (!parsed['admin-login-map'].customUserModified) {
            parsed['admin-login-map'].hotspots = DEFAULT_MAP_CONFIGS['admin-login-map'].hotspots;
          }
        }
        if (!parsed['sales-dashboard-1']) {
          parsed['sales-dashboard-1'] = DEFAULT_MAP_CONFIGS['sales-dashboard-1'];
        }
        if (!parsed['sales-dashboard-2']) {
          parsed['sales-dashboard-2'] = DEFAULT_MAP_CONFIGS['sales-dashboard-2'];
        }
        return parsed;
      }
      return DEFAULT_MAP_CONFIGS;
    } catch {
      return DEFAULT_MAP_CONFIGS;
    }
  });

  const [headerConfig, setHeaderConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HEADER_CONFIG);
      return saved ? JSON.parse(saved) : DEFAULT_HEADER_CONFIG;
    } catch {
      return DEFAULT_HEADER_CONFIG;
    }
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SIDEBAR_OPEN);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(isSupabaseConfigured);

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEYS.SIDEBAR_OPEN, JSON.stringify(next));
      } catch (e) { console.error(e); }
      return next;
    });
  };

  // Hydrate from Supabase if connected
  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchAllManualDataFromSupabase().then(dbData => {
        if (dbData) {
          if (dbData.docsStructure?.length) setDocsStructure(dbData.docsStructure);
          if (Object.keys(dbData.pagesContent || {}).length) setPagesContent(dbData.pagesContent);
          if (Object.keys(dbData.mapConfigs || {}).length) setMapConfigs(dbData.mapConfigs);
          if (dbData.headerConfig) setHeaderConfig(dbData.headerConfig);
          setIsSupabaseConnected(true);
          showNotification('Connected to Supabase live database');

          // Auto-sync missing sales dashboard to DB if it was wiped
          const adminCat = dbData.docsStructure?.find(c => c.id === 'cat-admin-portal');
          if (adminCat && !adminCat.items.find(i => i.slug === 'sales-dashboard')) {
            const newPage = { id: 'page-sales-dashboard', title: 'Sales Dashboard', slug: 'sales-dashboard' };
            upsertPageToSupabase(newPage, adminCat.id, adminCat.items.length);
            syncPageContentToSupabase('sales-dashboard', DEFAULT_PAGES_CONTENT['sales-dashboard']);
            setDocsStructure(prev => {
              const next = [...prev];
              const c = next.find(x => x.id === adminCat.id);
              if (c) c.items.push(newPage);
              return next;
            });
            setPagesContent(prev => ({ ...prev, 'sales-dashboard': DEFAULT_PAGES_CONTENT['sales-dashboard'] }));

            if (!dbData.mapConfigs['sales-dashboard-1']) {
              upsertInteractiveMapToSupabase('sales-dashboard-1', DEFAULT_MAP_CONFIGS['sales-dashboard-1']);
              DEFAULT_MAP_CONFIGS['sales-dashboard-1'].hotspots.forEach(hs => syncHotspotToSupabase('sales-dashboard-1', hs));
              setMapConfigs(prev => ({ ...prev, 'sales-dashboard-1': DEFAULT_MAP_CONFIGS['sales-dashboard-1'] }));
            }
            if (!dbData.mapConfigs['sales-dashboard-2']) {
              upsertInteractiveMapToSupabase('sales-dashboard-2', DEFAULT_MAP_CONFIGS['sales-dashboard-2']);
              DEFAULT_MAP_CONFIGS['sales-dashboard-2'].hotspots.forEach(hs => syncHotspotToSupabase('sales-dashboard-2', hs));
              setMapConfigs(prev => ({ ...prev, 'sales-dashboard-2': DEFAULT_MAP_CONFIGS['sales-dashboard-2'] }));
            }
          }
        }
      });
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DOCS_STRUCTURE, JSON.stringify(docsStructure));
    } catch (e) { console.error(e); }
  }, [docsStructure]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PAGES_CONTENT, JSON.stringify(pagesContent));
    } catch (e) { console.error(e); }
  }, [pagesContent]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MAP_CONFIGS, JSON.stringify(mapConfigs));
    } catch (e) { console.error(e); }
  }, [mapConfigs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HEADER_CONFIG, JSON.stringify(headerConfig));
    } catch (e) { console.error(e); }
  }, [headerConfig]);

  const showNotification = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Sidebar navigation actions
  const addCategory = (title) => {
    const newCat = {
      id: 'cat-' + Date.now(),
      title: title || 'New Category',
      items: [],
      sort_order: docsStructure.length
    };
    setDocsStructure(prev => [...prev, newCat]);
    if (isSupabaseConfigured) upsertCategoryToSupabase(newCat);
    showNotification('Added new category: ' + (title || 'New Category'));
  };

  const renameCategory = (catId, newTitle) => {
    setDocsStructure(prev => {
      const updated = prev.map(cat => cat.id === catId ? { ...cat, title: newTitle } : cat);
      const target = updated.find(cat => cat.id === catId);
      if (target && isSupabaseConfigured) upsertCategoryToSupabase(target);
      return updated;
    });
    showNotification('Renamed category');
  };

  const deleteCategory = (catId) => {
    setDocsStructure(prev => prev.filter(cat => cat.id !== catId));
    if (isSupabaseConfigured) deleteCategoryFromSupabase(catId);
    showNotification('Deleted category');
  };

  const addPage = (catId, title, slug, initialContent = '') => {
    const pageSlug = slug ? slug.toLowerCase().replace(/[^a-z0-9-]/g, '-') : 'page-' + Date.now();
    const newPage = {
      id: 'page-' + Date.now(),
      title: title || 'New Page',
      slug: pageSlug
    };

    setDocsStructure(prev => {
      const updated = prev.map(cat => {
        if (cat.id === catId) {
          return { ...cat, items: [...cat.items, newPage] };
        }
        return cat;
      });
      const targetCat = updated.find(cat => cat.id === catId);
      if (targetCat && isSupabaseConfigured) {
        upsertPageToSupabase(newPage, catId, targetCat.items.length - 1);
      }
      return updated;
    });

    const finalContent = initialContent || `# ${title || 'New Page'}\n\nStart writing your content here...`;
    setPagesContent(prev => ({
      ...prev,
      [pageSlug]: finalContent
    }));

    if (isSupabaseConfigured) {
      syncPageContentToSupabase(pageSlug, finalContent);
    }

    showNotification('Added page: ' + (title || 'New Page'));
    return pageSlug;
  };

  const renamePage = (pageId, newTitle) => {
    setDocsStructure(prev => {
      let foundPage = null;
      let foundCatId = null;
      let sortOrder = 0;
      
      const updated = prev.map(cat => {
        const itemIdx = cat.items.findIndex(item => item.id === pageId);
        if (itemIdx !== -1) {
          foundCatId = cat.id;
          sortOrder = itemIdx;
          const newItems = [...cat.items];
          newItems[itemIdx] = { ...newItems[itemIdx], title: newTitle };
          foundPage = newItems[itemIdx];
          return { ...cat, items: newItems };
        }
        return cat;
      });

      if (foundPage && foundCatId && isSupabaseConfigured) {
        upsertPageToSupabase(foundPage, foundCatId, sortOrder);
      }

      return updated;
    });
    showNotification('Renamed page');
  };

  const deletePage = (catId, pageId, slug) => {
    setDocsStructure(prev => prev.map(cat => {
      if (cat.id === catId) {
        return { ...cat, items: cat.items.filter(item => item.id !== pageId) };
      }
      return cat;
    }));

    if (slug) {
      setPagesContent(prev => {
        const next = { ...prev };
        delete next[slug];
        return next;
      });
    }
    
    if (isSupabaseConfigured) {
      deletePageFromSupabase(pageId);
    }
    showNotification('Deleted page');
  };

  // Page Content actions
  const updatePageContent = (slug, content) => {
    setPagesContent(prev => ({
      ...prev,
      [slug]: content
    }));
    if (isSupabaseConfigured) {
      syncPageContentToSupabase(slug, content);
    }
    showNotification('Saved page content');
  };

  // Hotspot actions
  const moveHotspot = (mapId, hotspotId, x, y) => {
    const roundedX = Math.round(x * 10) / 10;
    const roundedY = Math.round(y * 10) / 10;
    
    setMapConfigs(prev => {
      const map = prev[mapId];
      if (!map) return prev;
      const updatedHotspots = map.hotspots.map(hs => 
        hs.id === hotspotId ? { ...hs, x: roundedX, y: roundedY } : hs
      );
      
      const movedHs = updatedHotspots.find(h => h.id === hotspotId);
      if (movedHs && isSupabaseConfigured) {
        syncHotspotToSupabase(mapId, movedHs);
      }

      return {
        ...prev,
        [mapId]: { ...map, hotspots: updatedHotspots }
      };
    });
  };

  const addHotspot = (mapId, hotspotData) => {
    const newHotspot = {
      id: 'hs-' + Date.now(),
      x: hotspotData.x || 50,
      y: hotspotData.y || 50,
      badge: hotspotData.badge || 'Step ' + ((mapConfigs[mapId]?.hotspots?.length || 0) + 1),
      placement: hotspotData.placement || 'bottom',
      title: hotspotData.title || 'New Step Title',
      description: hotspotData.description || 'Description of this step or interface element.'
    };

    setMapConfigs(prev => {
      const map = prev[mapId];
      if (!map) return prev;
      return {
        ...prev,
        [mapId]: {
          ...map,
          hotspots: [...map.hotspots, newHotspot]
        }
      };
    });

    if (isSupabaseConfigured) {
      syncHotspotToSupabase(mapId, newHotspot);
    }

    showNotification('Added new step dot');
    return newHotspot.id;
  };

  const updateHotspot = (mapId, hotspotId, updatedFields) => {
    setMapConfigs(prev => {
      const map = prev[mapId];
      if (!map) return prev;
      const updatedList = map.hotspots.map(hs => hs.id === hotspotId ? { ...hs, ...updatedFields } : hs);
      const targetHs = updatedList.find(h => h.id === hotspotId);
      if (targetHs && isSupabaseConfigured) {
        syncHotspotToSupabase(mapId, targetHs);
      }
      return {
        ...prev,
        [mapId]: {
          ...map,
          hotspots: updatedList
        }
      };
    });
    showNotification('Updated hotspot details');
  };

  const deleteHotspot = (mapId, hotspotId) => {
    setMapConfigs(prev => {
      const map = prev[mapId];
      if (!map) return prev;
      return {
        ...prev,
        [mapId]: {
          ...map,
          hotspots: map.hotspots.filter(hs => hs.id !== hotspotId)
        }
      };
    });
    if (isSupabaseConfigured) {
      deleteHotspotFromSupabase(hotspotId);
    }
    showNotification('Deleted step dot');
  };

  const addPictureSession = (mapId, title, imageUrl, altText = '') => {
    const cleanId = mapId.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const newSession = {
      title: title || 'Interactive Picture Session',
      imageUrl,
      altText: altText || title || 'Picture Session',
      hotspots: []
    };
    
    setMapConfigs(prev => ({
      ...prev,
      [cleanId]: newSession
    }));

    if (isSupabaseConfigured) {
      upsertInteractiveMapToSupabase(cleanId, newSession);
    }
    
    showNotification('Added picture session: ' + title);
    return cleanId;
  };

  const updatePictureSession = (mapId, updatedData) => {
    setMapConfigs(prev => {
      const existing = prev[mapId];
      if (!existing) return prev;
      const merged = { ...existing, ...updatedData };
      if (isSupabaseConfigured) {
        upsertInteractiveMapToSupabase(mapId, merged);
      }
      return {
        ...prev,
        [mapId]: merged
      };
    });
    showNotification('Updated picture session details');
  };

  const deletePictureSession = (mapId) => {
    setMapConfigs(prev => {
      const next = { ...prev };
      delete next[mapId];
      return next;
    });
    if (isSupabaseConfigured) {
      deleteInteractiveMapFromSupabase(mapId);
    }
    showNotification('Deleted picture session');
  };

  const deletePictureSessionFromPage = (currentSlug, mapId) => {
    const currentText = pagesContent[currentSlug] || '';
    const sections = parseMarkdownToSections(currentText);
    const filtered = sections.filter(s => !(s.type === 'image' && s.mapId === mapId));
    const updatedText = sectionsToMarkdown(filtered);
    updatePageContent(currentSlug, updatedText);
    showNotification('Removed image from page');
  };

  const movePictureSessionInMarkdown = (currentSlug, mapId, direction) => {
    const currentText = pagesContent[currentSlug] || '';
    const sections = parseMarkdownToSections(currentText);
    const targetIdx = sections.findIndex(s => s.type === 'image' && s.mapId === mapId);
    
    if (targetIdx === -1) {
      showNotification('Picture session block not found in page');
      return;
    }

    if (direction === 'up') {
      if (targetIdx === 0) {
        showNotification('Image is already at the top');
        return;
      }
      const newSections = [...sections];
      const temp = newSections[targetIdx - 1];
      newSections[targetIdx - 1] = newSections[targetIdx];
      newSections[targetIdx] = temp;
      updatePageContent(currentSlug, sectionsToMarkdown(newSections));
      showNotification('Moved image up between paragraphs');
    } else if (direction === 'down') {
      if (targetIdx === sections.length - 1) {
        showNotification('Image is already at the bottom');
        return;
      }
      const newSections = [...sections];
      const temp = newSections[targetIdx + 1];
      newSections[targetIdx + 1] = newSections[targetIdx];
      newSections[targetIdx] = temp;
      updatePageContent(currentSlug, sectionsToMarkdown(newSections));
      showNotification('Moved image down between paragraphs');
    }
  };

  const insertLocalImageSession = (file, currentSlug, insertPosition = null) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }
      const rawName = file.name.replace(/\.[^/.]+$/, '');
      const cleanTitle = rawName.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const mapId = 'img-' + Date.now();

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        addPictureSession(mapId, cleanTitle, dataUrl, cleanTitle);

        const currentText = pagesContent[currentSlug] || '';
        const snippet = `\n\n\`\`\`interactive-map\n${mapId}\n\`\`\`\n\n`;

        let updatedText;
        if (typeof insertPosition === 'number' && insertPosition >= 0 && insertPosition <= currentText.length) {
          updatedText = currentText.slice(0, insertPosition) + snippet + currentText.slice(insertPosition);
        } else {
          updatedText = currentText + snippet;
        }

        updatePageContent(currentSlug, updatedText);
        showNotification(`Uploaded local image: ${file.name}`);
        resolve(mapId);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const registerLocalImageSession = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }
      const rawName = file.name.replace(/\.[^/.]+$/, '');
      const cleanTitle = rawName.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const mapId = 'img-' + Date.now();

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        addPictureSession(mapId, cleanTitle, dataUrl, cleanTitle);
        resolve(mapId);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const replacePictureSessionImage = (mapId, file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        setMapConfigs(prev => {
          const existing = prev[mapId];
          if (!existing) return prev;
          return {
            ...prev,
            [mapId]: {
              ...existing,
              imageUrl: dataUrl
            }
          };
        });
        showNotification(`Replaced image for session: ${mapId}`);
        resolve(dataUrl);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Header Config actions
  const updateHeader = (newHeaderConfig) => {
    setHeaderConfig(prev => {
      const updated = { ...prev, ...newHeaderConfig };
      if (isSupabaseConfigured) {
        syncHeaderToSupabase(updated);
      }
      return updated;
    });
    showNotification('Updated header settings');
  };

  // Export / Import / Reset
  const exportAllData = () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      docsStructure,
      pagesContent,
      mapConfigs,
      headerConfig
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `octarine_manual_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Configuration exported successfully');
  };

  const importAllData = (jsonData) => {
    try {
      if (jsonData.docsStructure) setDocsStructure(jsonData.docsStructure);
      if (jsonData.pagesContent) setPagesContent(jsonData.pagesContent);
      if (jsonData.mapConfigs) setMapConfigs(jsonData.mapConfigs);
      if (jsonData.headerConfig) setHeaderConfig(jsonData.headerConfig);
      showNotification('Configuration imported successfully');
      return true;
    } catch (err) {
      alert('Failed to import configuration: ' + err.message);
      return false;
    }
  };

  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all manualbook data to default? Any unsaved custom pages will be lost.')) {
      setDocsStructure(DEFAULT_DOCS_STRUCTURE);
      setPagesContent(DEFAULT_PAGES_CONTENT);
      setMapConfigs(DEFAULT_MAP_CONFIGS);
      setHeaderConfig(DEFAULT_HEADER_CONFIG);
      localStorage.clear();
      showNotification('Reset to factory defaults');
    }
  };

  return (
    <ManualContext.Provider
      value={{
        docsStructure,
        pagesContent,
        mapConfigs,
        headerConfig,
        isEditMode,
        setIsEditMode,
        isSidebarOpen,
        toggleSidebar,
        statusMessage,
        isSupabaseConnected,
        showNotification,
        addCategory,
        renameCategory,
        deleteCategory,
        addPage,
        renamePage,
        deletePage,
        updatePageContent,
        moveHotspot,
        addHotspot,
        updateHotspot,
        deleteHotspot,
        addPictureSession,
        updatePictureSession,
        deletePictureSession,
        deletePictureSessionFromPage,
        movePictureSessionInMarkdown,
        insertLocalImageSession,
        registerLocalImageSession,
        replacePictureSessionImage,
        updateHeader,
        exportAllData,
        importAllData,
        resetToDefaults
      }}
    >
      {children}
    </ManualContext.Provider>
  );
};

export const useManual = () => {
  const context = useContext(ManualContext);
  if (!context) {
    throw new Error('useManual must be used within a ManualProvider');
  }
  return context;
};
