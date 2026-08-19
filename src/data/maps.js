import adminLoginImg from '../assets/admin-login.png';

// This file stores the configurations for your interactive screenshots.
// You can define hotspots with x, y percentages, tooltip placement, and content.

export const mapConfigs = {
  'home-page-map': {
    imageUrl: 'https://placehold.co/1200x800/e0e0e0/333333?text=Octarine+Storefront+Overview',
    altText: 'Octarine Homepage',
    hotspots: [
      {
        id: 'nav-shop',
        x: 45,
        y: 8,
        placement: 'bottom',
        title: 'Shop Navigation',
        description: 'Directs users to the main product catalog where they can filter by fragrance notes and category.'
      },
      {
        id: 'cart-icon',
        x: 85,
        y: 8,
        placement: 'bottom',
        title: 'Shopping Cart',
        description: 'Displays the number of items currently in the user\'s cart. Hovering shows a mini-cart dropdown.'
      },
      {
        id: 'hero-button',
        x: 50,
        y: 75,
        placement: 'top',
        title: 'Discover Now Button',
        description: 'Primary Call to Action (CTA) leading directly to the featured perfume collection.'
      }
    ]
  },
  'admin-login-map': {
    imageUrl: adminLoginImg,
    altText: 'Octarine Admin Portal Login Screen',
    hotspots: [
      {
        id: 'url-endpoint',
        x: 27.5,
        y: 4.5,
        placement: 'bottom',
        title: '1. Administrative URL',
        description: 'Access the backoffice login page at https://octarine.co.id/admin/login. Always ensure HTTPS is active.'
      },
      {
        id: 'brand-header',
        x: 50,
        y: 29.5,
        placement: 'bottom',
        title: 'Octarine Admin Gateway',
        description: 'Official centralized administrative gateway for managing orders, products, inventory, and promotions.'
      },
      {
        id: 'email-input',
        x: 44,
        y: 53.8,
        placement: 'top',
        title: '2. Email Address Field',
        description: 'Input your registered administrator credentials (e.g., admin@octarine.co.id). Make sure to avoid trailing spaces.'
      },
      {
        id: 'password-input',
        x: 56,
        y: 61.8,
        placement: 'top',
        title: '3. Password Field & Visibility Toggle',
        description: 'Input your secret administrative password. Click the eye icon on the right to toggle password masking.'
      },
      {
        id: 'signin-button',
        x: 50,
        y: 68.2,
        placement: 'bottom',
        title: '4. Sign In Action Button',
        description: 'Click "Sign in" (or press Enter) to authenticate and proceed directly to the Octarine Admin Management Dashboard.'
      }
    ]
  }
};
