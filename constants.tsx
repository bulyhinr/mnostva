
import { Product, NavItem } from './types';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '#home' },
  { label: 'Why Us', href: '#benefits' },
  { label: 'Marketplace', href: '#marketplace' },
  { label: 'About Us', href: '#about' },
];

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Cozy Witch Attic',
    description: 'A magical, purple-themed stylized room with cauldrons, spell books, and floating candles. Perfect for cozy RPGs.',
    price: 45.00,
    imageUrl: 'https://picsum.photos/seed/witch/800/600',
    category: 'Room',
    tags: ['Magic', 'Cozy', 'Stylized'],
    externalLinks: {
      unity: 'https://assetstore.unity.com/publishers/53480',
      fab: 'https://www.fab.com/sellers/Mnostva%20Art',
      cgtrader: 'https://www.cgtrader.com/designers/mnostva'
    },
    features: [
      'Over 50 unique stylized props',
      'Modular wall and floor pieces',
      'Custom particle effects for candles',
      'Mobile-optimized geometry'
    ],
    packContent: [
      '1x Attic Room Shell (Modular)',
      '12x Magical Spellbooks',
      '5x Stylized Cauldrons',
      '15x Decorative Furniture items',
      '8x Crystal and Potion variants'
    ],
    compatibility: ['Unity 2021.3+', 'Unreal Engine 5.1+', 'Godot 4.0+', 'Blender 3.6+'],
    technicalSpecs: {
      polyCount: '15k - 25k Tris',
      textures: '2K PBR Stylized',
      rigged: false,
      animated: true
    }
  },
  {
    id: '2',
    name: 'Cyberpunk Ramen Shop',
    description: 'Neon-lit cartoon level with high-detail props. Includes animated steam and noodle physics.',
    price: 59.00,
    imageUrl: 'https://picsum.photos/seed/ramen/800/600',
    category: 'Level',
    tags: ['Sci-Fi', 'Urban', 'Food'],
    externalLinks: {
      unity: 'https://assetstore.unity.com/publishers/53480',
      cgtrader: 'https://www.cgtrader.com/designers/mnostva'
    },
    features: [
      'Fully interactive kitchen area',
      'Custom shader for neon flickering',
      'Procedural steam and smoke VFX',
      'Included interior and exterior'
    ],
    packContent: [
      'Shop Building (Interior/Exterior)',
      'Full Kitchen Equipment set',
      '20x Cyberpunk Signage props',
      'Animated Noodle Bowls',
      'Street Furniture pack'
    ],
    compatibility: ['Unity 2022.1+ (URP/HDRP)', 'Unreal Engine 5.0+'],
    technicalSpecs: {
      polyCount: '45k Tris',
      textures: '4K Stylized Atlases',
      rigged: false,
      animated: true
    }
  },
  {
    id: '3',
    name: 'Marshmallow Dream Forest',
    description: 'A soft, bouncy cartoon level with candy-like trees and pastel clouds. Built for mobile performance.',
    price: 35.00,
    imageUrl: 'https://picsum.photos/seed/forest/800/600',
    category: 'Full Pack',
    tags: ['Nature', 'Kidcore', 'Pastel'],
    externalLinks: {
      fab: 'https://www.fab.com/sellers/Mnostva%20Art'
    },
    features: [
      'Infinite terrain tiling',
      'Wind-animated foliage',
      'Low-poly optimization',
      'Vertex-colored materials'
    ],
    packContent: [
      '10x Marshmallow Tree types',
      'Tileable Terrain textures',
      'Animated Cloud system',
      'Lollipop Flower props',
      'Stylized Water shader'
    ],
    compatibility: ['Unity (All Versions)', 'Unreal Engine 4/5', 'Mobile Platforms'],
    technicalSpecs: {
      polyCount: '8k Tris',
      textures: '512px - 1K',
      rigged: false,
      animated: true
    }
  },
  {
    id: '4',
    name: 'Retro Arcade Lounge',
    description: 'Pixel-perfect 3D models of arcade cabinets and vaporwave aesthetic lounge furniture.',
    price: 29.00,
    imageUrl: 'https://picsum.photos/seed/arcade/800/600',
    category: 'Room',
    tags: ['Retro', 'Gaming', '80s'],
    externalLinks: {
      unity: 'https://assetstore.unity.com/publishers/53480',
      fab: 'https://www.fab.com/sellers/Mnostva%20Art'
    },
    features: [
      'Interactable arcade cabinets',
      'Vaporwave color palette presets',
      'Emissive lighting textures',
      'Includes retro console props'
    ],
    packContent: [
      '5x Distinct Arcade Cabinets',
      'Modular Bar and Lounge pieces',
      'Neon Wall lighting strips',
      'Vaporwave Statue prop',
      'Retro Console and Controller'
    ],
    compatibility: ['Unity URP', 'Unreal Engine 5', 'Godot'],
    technicalSpecs: {
      polyCount: '12k Tris',
      textures: '2K Stylized',
      rigged: false,
      animated: false
    }
  },
  {
    id: '5',
    name: 'Cat Cafe Interior',
    description: 'An adorable interior set with scratching posts, cozy booths, and 10 unique stylized cat models.',
    price: 49.00,
    imageUrl: 'https://picsum.photos/seed/cat/800/600',
    category: 'Room',
    tags: ['Cute', 'Animals', 'Modern'],
    externalLinks: {
      cgtrader: 'https://www.cgtrader.com/designers/mnostva'
    },
    features: [
      '10 Rigged stylized cat models',
      'Fully furnished cafe layout',
      'Animated ceiling fans and lights',
      'High-quality stylized cat props'
    ],
    packContent: [
      '10x Rigged Cat Models',
      'Full Cafe Furniture set',
      'Modular Scratching Posts',
      'Kitchenware for Cafe',
      'Indoor Plants pack'
    ],
    compatibility: ['Unity 2021+', 'Unreal Engine 5.1+', 'Blender'],
    technicalSpecs: {
      polyCount: '30k Tris',
      textures: '2K PBR',
      rigged: true,
      animated: true
    }
  },
  {
    id: '6',
    name: 'Floating Island Village',
    description: 'A comprehensive level set featuring low-poly floating islands, wind turbines, and cartoon houses.',
    price: 75.00,
    imageUrl: 'https://picsum.photos/seed/island/800/600',
    category: 'Level',
    tags: ['Fantasy', 'Sky', 'Adventure'],
    externalLinks: {
      unity: 'https://assetstore.unity.com/publishers/53480'
    },
    features: [
      'Modular floating island pieces',
      'Cartoon water shader included',
      'Animated wind turbines',
      'Day/Night lighting setups'
    ],
    packContent: [
      '6x Floating Island bases',
      '4x Stylized Village House types',
      '3x Wind Turbine variants',
      'Stone Bridges and Fences',
      'Low-poly Nature assets'
    ],
    compatibility: ['Unity 2020+', 'Unreal Engine 4/5', 'Godot 4'],
    technicalSpecs: {
      polyCount: '50k Tris',
      textures: '4K Atlases',
      rigged: false,
      animated: true
    }
  }
];
