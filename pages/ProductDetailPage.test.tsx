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
        name: 'Cool Asset',
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

    it('renders YouTube iframe when youtube link is provided', () => {
        const productWithYoutube = {
            ...mockProduct,
            externalLinks: { youtube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }
        };
 
        render(
            <MemoryRouter>
                <ProductDetailPage 
                    product={productWithYoutube as any} 
                    onBack={mockOnBack} 
                    onNavigateToLicense={vi.fn()}
                />
            </MemoryRouter>
        );
 
        // YouTube icon should be visible in gallery thumbnails
        expect(screen.getAllByTitle(/YouTube Video/i).length).toBeGreaterThanOrEqual(1);
        
        // Click on youtube thumbnail
        fireEvent.click(screen.getAllByTitle(/YouTube Video/i)[0]);
        
        // Main view should show youtube iframe
        expect(screen.getAllByTitle(/YouTube Video/i).length).toBeGreaterThanOrEqual(1);
    });
 
    it('handles keyboard navigation in lightbox', async () => {
        const productWithGallery = {
            ...mockProduct,
            galleryImages: ['img1.jpg', 'img2.jpg']
        };
 
        render(
            <MemoryRouter>
                <ProductDetailPage 
                    product={productWithGallery as any} 
                    onBack={mockOnBack} 
                    onNavigateToLicense={vi.fn()}
                />
            </MemoryRouter>
        );
 
        // Open lightbox
        const mainImage = screen.getByAltText(/Cool Asset/i);
        fireEvent.click(mainImage);
 
        // Should show lightbox (checking for fullscreen preview indicator)
        expect(screen.getByText(/1 \/ 3 — PREVIEW/i)).toBeInTheDocument();
 
        // Press Right Arrow
        fireEvent.keyDown(window, { key: 'ArrowRight' });
        expect(screen.getByText(/2 \/ 3 — PREVIEW/i)).toBeInTheDocument();
 
        // Press Left Arrow
        fireEvent.keyDown(window, { key: 'ArrowLeft' });
        expect(screen.getByText(/1 \/ 3 — PREVIEW/i)).toBeInTheDocument();
 
        // Press Escape
        fireEvent.keyDown(window, { key: 'Escape' });
        expect(screen.queryByText(/1 \/ 3 — PREVIEW/i)).not.toBeInTheDocument();
    });
 
    it('renders Key Features and Technical Specs when data is provided', () => {
        const productWithSpecs = {
            ...mockProduct,
            technicalSpecs: {
                polyCount: '10k',
                textures: '4k',
                rigged: true,
                animated: false
            }
        };

        render(
            <MemoryRouter>
                <ProductDetailPage 
                    product={productWithSpecs as any} 
                    onBack={mockOnBack} 
                    onNavigateToLicense={vi.fn()}
                />
            </MemoryRouter>
        );

        expect(screen.getByText(/Key Features/i)).toBeInTheDocument();
        expect(screen.getByText(/Feature 1/i)).toBeInTheDocument();
        expect(screen.getByText(/Technical Specs/i)).toBeInTheDocument();
        expect(screen.getByText(/10k/i)).toBeInTheDocument();
        expect(screen.getByText(/Rigged/i)).toBeInTheDocument();
    });

    it('does not render Technical Specs when data is empty', () => {
        const productNoSpecs = {
            ...mockProduct,
            technicalSpecs: {} // Empty object
        };

        render(
            <MemoryRouter>
                <ProductDetailPage 
                    product={productNoSpecs as any} 
                    onBack={mockOnBack} 
                    onNavigateToLicense={vi.fn()}
                />
            </MemoryRouter>
        );

        expect(screen.queryByText(/Technical Specs/i)).not.toBeInTheDocument();
    });
});
