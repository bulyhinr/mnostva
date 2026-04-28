import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MarketplacePage from './MarketplacePage';
import { productService } from '../services/productService';
import { MemoryRouter } from 'react-router-dom';

// Mock productService
vi.mock('../services/productService', () => ({
  productService: {
    getAllProducts: vi.fn(),
  },
}));

// Mock ProductCard
vi.mock('../components/ProductCard', () => ({
  default: ({ product, onOpen }: any) => (
    <div data-testid="product-card">
      <span>{product.name}</span>
      <span>${product.price ? product.price.toFixed(2) : '0.00'}</span>
      <button onClick={() => onOpen(product)}>Open</button>
    </div>
  )
}));

// Mock ImageWithFallback 
vi.mock('../components/ImageWithFallback', () => ({
  default: (props: any) => <img {...props} />
}));

// Mock ScrollReveal
vi.mock('../components/ScrollReveal', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('MarketplacePage', () => {
    const mockOnSelectProduct = vi.fn();
    const mockOnNavigateToLicense = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders marketplace title and loading state', async () => {
        (productService.getAllProducts as any).mockResolvedValue({ data: [], total: 0 });

        render(
            <MemoryRouter>
                <MarketplacePage 
                    onSelectProduct={mockOnSelectProduct} 
                    onNavigateToLicense={mockOnNavigateToLicense} 
                />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { name: /The Asset Shop/i })).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Search assets.../i)).toBeInTheDocument();
    });

    it('fetches and displays products', async () => {
        const mockProducts = {
            data: [
                {
                    id: '1',
                    title: 'Stylized House',
                    price: 2500,
                    category: 'Room',
                    description: 'A cozy house',
                    previewImageKey: 'image123'
                }
            ],
            total: 1
        };

        (productService.getAllProducts as any).mockResolvedValue(mockProducts);

        render(
            <MemoryRouter>
                <MarketplacePage 
                    onSelectProduct={mockOnSelectProduct} 
                    onNavigateToLicense={mockOnNavigateToLicense} 
                />
            </MemoryRouter>
        );

        expect(await screen.findByText(/Stylized House/i)).toBeInTheDocument();
        expect(screen.getByText(/\$25\.00/i)).toBeInTheDocument();
    });

    it('updates results when searching', async () => {
        (productService.getAllProducts as any).mockResolvedValue({ data: [], total: 0 });

        render(
            <MemoryRouter>
                <MarketplacePage 
                    onSelectProduct={mockOnSelectProduct} 
                    onNavigateToLicense={mockOnNavigateToLicense} 
                />
            </MemoryRouter>
        );

        const searchInput = screen.getByPlaceholderText(/Search assets.../i);
        fireEvent.change(searchInput, { target: { value: 'Dungeon' } });

        await waitFor(() => {
            expect(productService.getAllProducts).toHaveBeenCalledWith(expect.objectContaining({
                search: 'Dungeon'
            }));
        }, { timeout: 1000 }); // Accounts for debounce
    });

    it('shows "No assets found" when results are empty', async () => {
        (productService.getAllProducts as any).mockResolvedValue({ data: [], total: 0 });

        render(
            <MemoryRouter>
                <MarketplacePage 
                    onSelectProduct={mockOnSelectProduct} 
                    onNavigateToLicense={mockOnNavigateToLicense} 
                />
            </MemoryRouter>
        );

        expect(await screen.findByText(/No assets found!/i)).toBeInTheDocument();
    });
});
