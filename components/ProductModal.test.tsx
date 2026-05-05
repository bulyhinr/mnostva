import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProductModal from './ProductModal';
import { MemoryRouter } from 'react-router-dom';

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
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 100,
    category: 'Prop' as any,
    tags: [],
    description: 'Test Description',
    imageUrl: 'test.jpg',
    externalLinks: {},
    galleryImages: null as any, // This is what we're testing
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
        <ProductModal product={badProduct} onClose={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Test Product/i)).toBeInTheDocument();
  });
});
