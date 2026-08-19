-- ==============================================================================
-- OCTARINE MANUALBOOK - SUPABASE DATABASE SCHEMA & SEED DATA
-- ==============================================================================
-- This SQL file sets up the complete schema, Row Level Security (RLS) policies,
-- automatic timestamp triggers, and production seed data for Supabase / PostgreSQL.
-- ==============================================================================

-- 1. EXTENSIONS & CLEANUP
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if recreating
DROP TABLE IF EXISTS map_hotspots CASCADE;
DROP TABLE IF EXISTS interactive_maps CASCADE;
DROP TABLE IF EXISTS doc_pages CASCADE;
DROP TABLE IF EXISTS doc_categories CASCADE;
DROP TABLE IF EXISTS top_nav_links CASCADE;
DROP TABLE IF EXISTS header_settings CASCADE;

-- ==============================================================================
-- 2. TABLE DEFINITIONS
-- ==============================================================================

-- Table: Header Settings (Brand Logo, Subtitle, Announcement Ticker)
CREATE TABLE header_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default_header',
    logo_text VARCHAR(100) NOT NULL DEFAULT 'Octarine.',
    logo_subtext VARCHAR(100) DEFAULT 'Eau De Parfum',
    marquee_text TEXT NOT NULL DEFAULT 'NEW ARRIVALS EVERY WEEK • EXCLUSIVE FRAGRANCE COLLECTIONS • CAPTIVATE WITH EVERY SPRAY • DISCOVER YOUR SCENT • AUTHENTIC DESIGNER PERFUMES • ENDLESS POSSIBILITIES AWAIT • ',
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Table: Top Navigation Links (SHOP, COLLECTIONS, PROMO, ABOUT, BLOG, MANUAL)
CREATE TABLE top_nav_links (
    id VARCHAR(100) PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    is_external BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Table: Documentation Categories (Sidebar Navigation Sections)
CREATE TABLE doc_categories (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Table: Documentation Pages (Slug, Content Body in Markdown, Hierarchy)
CREATE TABLE doc_pages (
    id VARCHAR(100) PRIMARY KEY,
    category_id VARCHAR(100) NOT NULL REFERENCES doc_categories(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    content TEXT NOT NULL DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Table: Interactive Picture Sessions / Image Maps
CREATE TABLE interactive_maps (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255) DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Table: Map Step Dots / Hotspots (Coordinates, Tooltips, Badge, Placement)
CREATE TABLE map_hotspots (
    id VARCHAR(100) PRIMARY KEY,
    map_id VARCHAR(100) NOT NULL REFERENCES interactive_maps(id) ON DELETE CASCADE,
    badge VARCHAR(50) NOT NULL DEFAULT 'Step',
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    x_percent NUMERIC(5, 2) NOT NULL CHECK (x_percent >= 0 AND x_percent <= 100),
    y_percent NUMERIC(5, 2) NOT NULL CHECK (y_percent >= 0 AND y_percent <= 100),
    placement VARCHAR(20) NOT NULL DEFAULT 'bottom' CHECK (placement IN ('top', 'bottom', 'left', 'right')),
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==============================================================================
-- 3. INDEXES FOR HIGH QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX idx_doc_pages_slug ON doc_pages(slug);
CREATE INDEX idx_doc_pages_category ON doc_pages(category_id, sort_order);
CREATE INDEX idx_map_hotspots_map_id ON map_hotspots(map_id, sort_order);
CREATE INDEX idx_top_nav_links_sort ON top_nav_links(sort_order);
CREATE INDEX idx_doc_categories_sort ON doc_categories(sort_order);

-- ==============================================================================
-- 4. AUTOMATIC TIMESTAMP UPDATE TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_header_settings_updated_at BEFORE UPDATE ON header_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_top_nav_links_updated_at BEFORE UPDATE ON top_nav_links FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_doc_categories_updated_at BEFORE UPDATE ON doc_categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_doc_pages_updated_at BEFORE UPDATE ON doc_pages FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_interactive_maps_updated_at BEFORE UPDATE ON interactive_maps FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_map_hotspots_updated_at BEFORE UPDATE ON map_hotspots FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE header_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE top_nav_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE doc_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE doc_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactive_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_hotspots ENABLE ROW LEVEL SECURITY;

-- Allow Public Read Access (Anonymous + Authenticated visitors)
CREATE POLICY "Allow public read on header_settings" ON header_settings FOR SELECT USING (true);
CREATE POLICY "Allow public read on top_nav_links" ON top_nav_links FOR SELECT USING (true);
CREATE POLICY "Allow public read on doc_categories" ON doc_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read on doc_pages" ON doc_pages FOR SELECT USING (true);
CREATE POLICY "Allow public read on interactive_maps" ON interactive_maps FOR SELECT USING (true);
CREATE POLICY "Allow public read on map_hotspots" ON map_hotspots FOR SELECT USING (true);

-- Allow Authenticated Users / Admin Full Modification Access (Insert, Update, Delete)
CREATE POLICY "Allow authenticated manage header_settings" ON header_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated manage top_nav_links" ON top_nav_links FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated manage doc_categories" ON doc_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated manage doc_pages" ON doc_pages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated manage interactive_maps" ON interactive_maps FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated manage map_hotspots" ON map_hotspots FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- 6. SEED DATA INSERTION
-- ==============================================================================

-- A. Header Settings
INSERT INTO header_settings (id, logo_text, logo_subtext, marquee_text)
VALUES (
    'default_header',
    'Octarine.',
    'Eau De Parfum',
    'NEW ARRIVALS EVERY WEEK • EXCLUSIVE FRAGRANCE COLLECTIONS • CAPTIVATE WITH EVERY SPRAY • DISCOVER YOUR SCENT • AUTHENTIC DESIGNER PERFUMES • ENDLESS POSSIBILITIES AWAIT • '
);

-- B. Top Navbar Links
INSERT INTO top_nav_links (id, label, url, is_external, sort_order) VALUES
('nl-shop', 'SHOP', 'https://octarine.co.id/shop', true, 1),
('nl-collections', 'COLLECTIONS', 'https://octarine.co.id/collections', true, 2),
('nl-promo', 'PROMO', 'https://octarine.co.id/promo', true, 3),
('nl-about', 'ABOUT', 'https://octarine.co.id/about', true, 4),
('nl-blog', 'BLOG', 'https://octarine.co.id/blog', true, 5),
('nl-manual', 'MANUAL', '/manual/introduction', false, 6);

-- C. Documentation Categories
INSERT INTO doc_categories (id, title, sort_order) VALUES
('cat-getting-started', 'Getting Started', 1),
('cat-admin-portal', 'Admin Portal', 2),
('cat-products-guides', 'Products & Guides', 3),
('cat-shopping-support', 'Shopping & Support', 4);

-- D. Interactive Picture Sessions
INSERT INTO interactive_maps (id, title, image_url, alt_text) VALUES
(
    'home-page-map',
    'Octarine Storefront Overview',
    'https://placehold.co/1200x800/e0e0e0/333333?text=Octarine+Storefront+Overview',
    'Octarine Homepage'
),
(
    'admin-login-map',
    'Octarine Admin Login Screen',
    '/admin-login.png',
    'Octarine Admin Portal Login Screen'
);

-- E. Step Dots & Hotspots
INSERT INTO map_hotspots (id, map_id, badge, title, description, x_percent, y_percent, placement, sort_order) VALUES
-- Hotspots for Storefront Overview
('hs-shop', 'home-page-map', 'Navigation', 'Shop Navigation', 'Directs users to the main product catalog where they can filter by fragrance notes and category.', 45.00, 8.00, 'bottom', 1),
('hs-cart', 'home-page-map', 'Cart', 'Shopping Cart', 'Displays the number of items currently in the cart. Hovering opens the mini-cart dropdown.', 85.00, 8.00, 'bottom', 2),
('hs-hero', 'home-page-map', 'Action', 'Discover Now Button', 'Primary Call to Action (CTA) leading directly to the featured perfume collection.', 50.00, 75.00, 'top', 3),

-- Hotspots for Admin Login Portal
('hs-url', 'admin-login-map', 'Step 1', '1. Administrative URL', 'Access the backoffice login portal at https://octarine.co.id/admin/login. Ensure HTTPS encryption is active.', 27.50, 4.50, 'bottom', 1),
('hs-brand', 'admin-login-map', 'Portal', 'Octarine Admin Gateway', 'Official centralized administrative gateway for managing orders, products, inventory, and promotions.', 50.00, 29.50, 'bottom', 2),
('hs-email', 'admin-login-map', 'Step 2', '2. Email Address Field', 'Input your registered administrator credentials (e.g., admin@octarine.co.id). Make sure to avoid trailing spaces.', 44.00, 53.80, 'top', 3),
('hs-password', 'admin-login-map', 'Step 3', '3. Password Field & Visibility Toggle', 'Input your secret administrative password. Click the eye icon on the right to toggle password masking.', 56.00, 61.80, 'top', 4),
('hs-signin', 'admin-login-map', 'Step 4', '4. Sign In Action Button', 'Click "Sign in" (or press Enter) to authenticate and proceed directly to the Octarine Admin Management Dashboard.', 50.00, 68.20, 'bottom', 5);

-- F. Documentation Pages & Markdown Body Content
INSERT INTO doc_pages (id, category_id, title, slug, content, sort_order) VALUES
(
    'page-intro',
    'cat-getting-started',
    'Introduction',
    'introduction',
    '# Welcome to Octarine

Discover your scent with Octarine — a premium local perfume crafted with world-class aromas. This interactive manual is designed to guide you through our collections, help you choose your perfect fragrance, and provide information on our services.

## Authentic Designer Perfumes

Octarine is committed to bringing you the finest natural ingredients. We explore the globe to learn where and how these are harvested, ensuring that every spray captivates and elevates your presence.

### What You''ll Find Here

- **Getting Started:** Learn about our story and mission.
- **Admin Portal:** Step-by-step guides for backoffice store operations and authentication.
- **Products & Guides:** Dive into our fragrance notes and discover tips on choosing the scent that defines you.
- **Shopping & Support:** Everything you need to know about ordering, shipping, and returns.

> "Captivate with every spray. Endless possibilities await."

Ready to begin your journey? Choose a topic from the sidebar or switch to **Edit Mode** to customize this guide.',
    1
),
(
    'page-interactive-demo',
    'cat-getting-started',
    'Interactive Storefront Guide',
    'interactive-demo',
    '# Interactive Webcommerce Guide

Welcome to the interactive guide for the **Octarine** webcommerce platform. Here, we break down the key features of both the customer-facing storefront and the administrative backoffice interface.

---

## 1. Storefront Overview

This interactive map illustrates the primary components of the public homepage, including top navigation, shopping cart access, and the central hero call-to-action.

```interactive-map
home-page-map
```

---

## 2. Administrator Portal & Authentication

For authorized staff and store managers, the administration portal provides access to inventory, orders, and system settings.

```interactive-map
admin-login-map
```

> [!TIP]
> For a full, dedicated walkthrough of the administrative credentials input and security best practices, visit the [Admin Login Guide](/manual/admin-login).',
    2
),
(
    'page-about',
    'cat-getting-started',
    'About Octarine',
    'about-octarine',
    '# About Octarine

**Octarinē Eau De Parfum** is a luxury fragrance house dedicated to the art of olfactive elegance. We craft evocative, timeless perfumes by combining world-class ingredients with artisanal perfumery traditions.

---

## Our Story & Philosophy

Born from a passion for captivating scents and sensory storytelling, Octarine creates fragrances that make unforgettable impressions. Every bottle is a harmonious symphony of top, heart, and base notes formulated to evolve beautifully throughout the day.

### Core Values
- **Artisanal Craftsmanship**: High-concentration Eau De Parfum blends created for longevity and sillage.
- **Ethical Sourcing**: Ethically harvested botanicals and cruelty-free essential oils.
- **Accessible Luxury**: Providing world-class fragrance experiences directly to scent enthusiasts.

---

> "Captivate with every spray. Endless possibilities await."',
    3
),
(
    'page-admin-login',
    'cat-admin-portal',
    'Admin Login Guide',
    'admin-login',
    '# Admin Portal Login Guide

The **Octarine Admin Portal** is the centralized management gateway for authorized administrators, store managers, and fulfillment teams. It provides full control over catalog inventory, order processing, customer analytics, and marketing promotions.

---

## Interactive Admin Login Overview

Click on any of the pulsing indicator dots below to explore the login interface and understand each input field and action. You can also toggle **Edit Mode** to drag and reposition these dots or add new ones.

```interactive-map
admin-login-map
```

---

## Authentication Procedure

To sign in to the Octarine backoffice, follow the standard authentication workflow:

### Step 1: Navigate to the Admin Portal
- Open a modern, secure web browser (Google Chrome, Microsoft Edge, Firefox, or Safari).
- Navigate to the administrative login endpoint: **`https://octarine.co.id/admin/login`**.
- Verify that your connection is secured with an active SSL certificate (indicated by the lock icon in your browser''s address bar).

### Step 2: Input Your Administrator Credentials

1. **Email Address Field**:
   - Click into the **Email** text box.
   - Enter your registered administrator or staff email address (e.g., `admin@octarine.co.id` or `staff.name@octarine.co.id`).
   - *Note: Ensure there are no accidental spaces before or after the email address.*

2. **Password Field**:
   - Click into the **Password** text box.
   - Enter your secret account password.
   - **Show/Hide Toggle**: Click the **Eye icon** on the right side of the password box to reveal the plaintext password and verify that you haven''t made a typing mistake before submitting.

### Step 3: Submit and Access the Dashboard
- Click the **Sign in** button or press **`Enter`** on your keyboard.
- Once authenticated, the system will redirect you to the **Octarine Management Dashboard** (`/admin/dashboard`).

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
| **"Unauthorized access"** | Account lacks administrative permissions. | Ensure you are signing in with an account granted the `Store Admin` or `Manager` role. |
| **Session Expired** | Automatic timeout due to inactivity. | Refresh the page and re-enter your login credentials. |',
    1
),
(
    'page-fragrance-notes',
    'cat-products-guides',
    'Fragrance Notes',
    'fragrance-notes',
    '# Fragrance Notes & Families

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
   - Lasts: 6 to 12+ hours.',
    1
),
(
    'page-choosing-scent',
    'cat-products-guides',
    'Choosing Your Scent',
    'choosing-scent',
    '# Choosing Your Scent

Selecting a signature fragrance is a personal journey. Here are expert recommendations to guide you:

---

## 1. Match Scent to Occasion & Climate

- **Daytime & Office**: Crisp citrus, clean aquatic, or subtle floral accords that remain polite and refreshing.
- **Evening & Special Events**: Rich oriental, warm amber, and smoky oud accords that project confidence and elegance.
- **Warm Weather**: Lighter Eau De Parfum with botanical and sparkling citrus notes.
- **Cool Weather**: Gourmand, vanilla, leather, and wood notes that project warm, cozy sillage.

---

## 2. Test On Skin, Not Just Paper
Perfumes react uniquely with your skin chemistry and natural body heat. Always allow the scent to develop for at least 30 minutes before judging the final dry-down profile.',
    2
),
(
    'page-product-care',
    'cat-products-guides',
    'Product Care',
    'product-care',
    '# Product Care & Longevity

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
- **Do Not Rub Wrists**: Rubbing causes friction that breaks down top notes prematurely. Simply spray and let dry naturally.',
    3
),
(
    'page-how-to-order',
    'cat-shopping-support',
    'How to Order',
    'how-to-order',
    '# How to Order

Placing an order on the Octarine webstore is simple and seamless. Follow these steps:

---

## Step-by-Step Checkout Process

1. **Browse Collections**: Explore our fragrances via the **[SHOP](https://octarine.co.id/shop)** or **[COLLECTIONS](https://octarine.co.id/collections)** pages.
2. **Select Volume & Quantity**: Choose your preferred size (30ml / 50ml / 100ml) and click **Add to Cart**.
3. **Review Cart**: Click the shopping bag icon in the top right to verify your chosen scents and apply any promotional coupon codes.
4. **Enter Shipping Details**: Fill in recipient information, delivery address, and select your preferred courier.
5. **Complete Secure Payment**: Choose from QRIS, Virtual Accounts (BCA, Mandiri, BRI, BNI), Credit Cards, or E-Wallets.
6. **Order Confirmation**: Once confirmed, you will receive an email and WhatsApp notification with your real-time tracking number.',
    1
),
(
    'page-shipping',
    'cat-shopping-support',
    'Shipping Policy',
    'shipping',
    '# Shipping Policy

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
Once your parcel is dispatched from our fulfillment warehouse, an automated tracking URL will be sent to your registered email and phone number.',
    2
),
(
    'page-returns',
    'cat-shopping-support',
    'Returns & Refunds',
    'returns',
    '# Returns & Refunds

Customer satisfaction is paramount. If your order arrives damaged, defective, or incorrect, our concierge team is here to assist.

---

## Return Eligibility
- **Reporting Window**: Claims must be reported within **48 hours** of package delivery.
- **Condition**: Items must be in original packaging with intact seals, unless reporting a verified atomizer defect or transit breakage.
- **Unboxing Video**: An unedited unboxing video is required to process claims promptly.

---

## How to Initiate a Return
Contact our Customer Support via official WhatsApp or email `support@octarine.co.id` with your Order ID and unboxing documentation.',
    3
),
(
    'page-faqs',
    'cat-shopping-support',
    'FAQs',
    'faqs',
    '# Frequently Asked Questions (FAQs)

Find quick answers to common questions about Octarine fragrances and services.

---

### 1. How long does Octarine Eau De Parfum last?
Our fragrances have a high oil concentration (20-25%) that typically lasts **8 to 12 hours** on skin and even longer on clothing fabrics.

### 2. Are Octarine perfumes unisex?
Most of our creations are thoughtfully crafted to be gender-neutral, allowing the wearer''s skin chemistry to bring out the unique balance of notes.

### 3. How can I test scents before purchasing a full bottle?
We offer the **Discovery Discovery Set**, which includes 5x 2ml sample atomizers of our bestsellers.

### 4. How do I access the Admin Portal?
Authorized personnel can log in at **[Admin Login Guide](/manual/admin-login)** using verified staff credentials.',
    4
);
