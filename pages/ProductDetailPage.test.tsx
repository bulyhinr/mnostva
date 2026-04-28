import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProductDetailPage from './ProductDetailPage';
import { MemoryRouter } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

// Mock useCart
vi.mock('../context/CartContext', () => ({
  __esModule: true,
  useCart: vi.fn(),
}));

// Mock useAuth
vi.mock('../context/AuthContext', () => ({
  __esModule: true,
  useAuth: vi.fn(),
}));

// Mock ScrollReveal
vi.mock('../components/ScrollReveal', () => ({
  __esModule: true,
  default: ({ children }: any) => <div>{children}</div>,
}));

// Mock ImageWithFallback
vi.mock('../components/ImageWithFallback', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

describe('ProductDetailPage', () => {
    const mockProduct = {
        id: '1',
        title: 'Cool Asset',
        price: 50.00,
        category: 'Prop',
        description: 'Large description text here',
        imageUrl: 'asset.jpg',
        features: ['Feature 1', 'Feature 2'],
        packContent: ['Item 1'],
        compatibility: ['Unity'],
        galleryImages: [],
        externalLinks: {}
    };

    const mockOnBack = vi.fn();
    const mockAddToCart = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useCart as any).mockReturnValue({
            cart: [],
            addToCart: mockAddToCart,
        });
        (useAuth as any).mockReturnValue({
            user: { id: '1', name: 'User' },
            loading: false
        });
    });

    it('renders product details correctly', () => {
        render(
            <MemoryRouter>
                <ProductDetailPage 
                    product={mockProduct as any} 
                    onBack={mockOnBack} 
                    onNavigateToLicense={vi.fn()}
                />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { name: /Cool Asset/i })).toBeInTheDocument();
        expect(screen.getByText(/\$50\.00/i)).toBeInTheDocument();
        expect(screen.getByText(/Large description text here/i)).toBeInTheDocument();
    });

    it('calls addToCart when clicking Add to Basket', () => {
        render(
            <MemoryRouter>
                <ProductDetailPage 
                    product={mockProduct as any} 
                    onBack={mockOnBack} 
                    onNavigateToLicense={vi.fn()}
                />
            </MemoryRouter>
        );

        const addBtn = screen.getByText(/Add to Basket/i);
        fireEvent.click(addBtn);

        expect(mockAddToCart).toHaveBeenCalledWith(mockProduct, 1, 'standard');
    });
});
