import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProductModal from './ProductModal';
import { MemoryRouter } from 'react-router-dom';

// Mock useAuth
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
  }),
}));

// Mock CartContext
vi.mock('../context/CartContext', () => ({
  useCart: () => ({
    addToCart: vi.fn(),
    cart: [],
  }),
}));

// Mock ImageWithFallback
vi.mock('./ImageWithFallback', () => ({
  default: (props: any) => <img {...props} />,
}));

describe('ProductModal Robustness', () => {
  const mockProduct: any = {
    id: '1',
    name: 'Test Product',
    price: 100,
    category: 'Prop',
    tags: [],
    description: 'Test Description',
    imageUrl: 'test.jpg',
    externalLinks: {},
    galleryImages: null,
    isActive: true,
    commercialPrice: undefined
  };

  it('renders without crashing even if galleryImages is null', () => {
    render(
      <MemoryRouter>
        <ProductModal product={mockProduct} onClose={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Test Product/i)).toBeInTheDocument();
  });

  it('handles galleryImages being a string (unexpected data type)', () => {
    const badProduct = {
        ...mockProduct,
        galleryImages: 'not-an-array' as any
    };

    render(
      <MemoryRouter>
        <ProductModal product={badProduct as any} onClose={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Test Product/i)).toBeInTheDocument();
  });

  it('renders Key Features and Technical Specs when data is provided', () => {
    const productWithData = {
      ...mockProduct,
      features: ['Cool feature'],
      technicalSpecs: {
        polyCount: '5k',
        textures: '2k'
      }
    };

    render(
      <MemoryRouter>
        <ProductModal product={productWithData as any} onClose={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Key Features/i)).toBeInTheDocument();
    expect(screen.getByText(/Cool feature/i)).toBeInTheDocument();
    expect(screen.getByText(/Technical Specs/i)).toBeInTheDocument();
    expect(screen.getByText(/5k/i)).toBeInTheDocument();
  });

  it('hides Technical Specs when empty', () => {
    const productNoSpecs = {
      ...mockProduct,
      technicalSpecs: {}
    };

    render(
      <MemoryRouter>
        <ProductModal product={productNoSpecs as any} onClose={() => {}} />
      </MemoryRouter>
    );

    expect(screen.queryByText(/Technical Specs/i)).not.toBeInTheDocument();
  });

  it('renders multiple YouTube iframe links in the modal gallery', () => {
    const productWithMultipleYoutubes = {
      ...mockProduct,
      externalLinks: {
        youtube: [
          'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          'https://youtu.be/kJQP7kiw5Fk'
        ]
      }
    };

    render(
      <MemoryRouter>
        <ProductModal product={productWithMultipleYoutubes as any} onClose={() => {}} />
      </MemoryRouter>
    );

    // YouTube icons/thumbnails should be present in the gallery inside the modal
    const youtubeIcons = screen.getAllByTitle(/YouTube Video/i);
    expect(youtubeIcons.length).toBeGreaterThanOrEqual(2);
  });
});
