import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Marketplace from './Marketplace';
import { productService } from '../services/productService';
import { MemoryRouter } from 'react-router-dom';
import { useCart } from '../context/CartContext';

// Mock useCart
vi.mock('../context/CartContext', () => ({
  useCart: () => ({
    addToCart: vi.fn(),
    cart: [],
  }),
}));

// Mock productService
vi.mock('../services/productService', () => ({
  productService: {
    getAllProducts: vi.fn(),
  },
}));

// Mock ProductCard to simplify testing Marketplace component logic
vi.mock('./ProductCard', () => ({
  default: ({ product, onOpen }: any) => (
    <div data-testid="product-card">
      <button onClick={() => onOpen(product)}>Open {product.name}</button>
    </div>
  )
}));

// Mock ScrollReveal
vi.mock('./ScrollReveal', () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));

describe('Marketplace Component', () => {
  const mockProducts = {
    data: [
      { id: '1', title: 'Asset 1', price: 1000, category: 'Prop', description: 'Desc 1' },
      { id: '2', title: 'Asset 2', price: 2000, category: 'Room', description: 'Desc 2' }
    ],
    total: 2
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (productService.getAllProducts as any).mockResolvedValue(mockProducts);
  });

  it('renders title and products', async () => {
    render(
      <MemoryRouter>
        <Marketplace title="Test Marketplace" limit={3} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Test/i)).toBeInTheDocument();
    expect(screen.getByText(/Marketplace/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Open Asset 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Open Asset 2/i)).toBeInTheDocument();
    });
  });

  it('calls onSelectProduct when a product is clicked', async () => {
    const mockOnSelectProduct = vi.fn();
    
    render(
      <MemoryRouter>
        <Marketplace 
          title="Test Marketplace" 
          limit={3} 
          onSelectProduct={mockOnSelectProduct} 
        />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText(/Open Asset 1/i));
    
    fireEvent.click(screen.getByText(/Open Asset 1/i));
    
    expect(mockOnSelectProduct).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
  });

  it('opens modal if onSelectProduct is not provided', async () => {
    render(
      <MemoryRouter>
        <Marketplace title="Test Marketplace" limit={3} />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText(/Open Asset 1/i));
    
    fireEvent.click(screen.getByText(/Open Asset 1/i));
    
    // Check if ProductModal content appears (it's mocked implicitly or renders its own content)
    // Since we are checking ProductModal in Marketplace.tsx, we can check for "Asset 1" title in modal
    expect(await screen.findByRole('heading', { name: /Asset 1/i })).toBeInTheDocument();
  });
});
