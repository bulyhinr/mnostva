
export interface Discount {
  id: string;
  name: string;
  percentage: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: 'Room' | 'Level' | 'Prop' | 'Full Pack' | 'Weapons';
  externalLinks: {
    unity?: string;
    fab?: string;
    cgtrader?: string;
    artstation?: string;
  };
  tags: string[];
  features?: string[];
  packContent?: string[];
  compatibility?: string[];
  technicalSpecs?: {
    polyCount?: string;
    textures?: string;
    rigged?: boolean;
    animated?: boolean;
  };
  discount?: Discount;
  fileKey?: string;
  previewImageKey?: string;
  galleryImages?: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface Recommendation {
  title: string;
  description: string;
  suggestedColors: string[];
  theme: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  joinedAt: string;
  isAdmin?: boolean;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'completed' | 'pending';
}

export interface ActivityLog {
  id: string;
  type: 'login' | 'purchase' | 'profile_update';
  description: string;
  timestamp: string;
}

export type PageType = 'home' | 'marketplace' | 'license' | 'product-detail' | 'about' | 'login' | 'profile' | 'checkout' | 'admin';
