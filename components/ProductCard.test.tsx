import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProductCard from './ProductCard';
import { useCart } from '../context/CartContext';
import { MemoryRouter } from 'react-router-dom';

// Mock useCart
vi.mock('../context/CartContext', () => ({
  useCart: vi.fn(),
}));

describe('ProductCard', () => {
    const mockProduct = {
        id: '1',
        name: 'Test Asset',
        price: 19.99,
        category: 'Prop',
        description: 'A test asset description',
        imageUrl: 'test.jpg',
        tags: ['tag1', 'tag2'],
        externalLinks: {}
    };
    const mockOnOpen = vi.fn();
    const mockAddToCart = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useCart as any).mockReturnValue({
            addToCart: mockAddToCart,
            cart: []
        });
    });

    it('renders product information', () => {
        render(
            <MemoryRouter>
                <ProductCard product={mockProduct as any} onOpen={mockOnOpen} />
            </MemoryRouter>
        );

        expect(screen.getAllByText(/Test Asset/i)[0]).toBeInTheDocument();
        expect(screen.getAllByText(/\$19\.99/i)[0]).toBeInTheDocument();
        expect(screen.getAllByText(/Prop/i)[0]).toBeInTheDocument();
    });

    it('calls onOpen when clicking on image or title', () => {
        render(
            <MemoryRouter>
                <ProductCard product={mockProduct as any} onOpen={mockOnOpen} />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole('heading', { name: /Test Asset/i }));
        expect(mockOnOpen).toHaveBeenCalledWith(mockProduct);
    });

    it('calls addToCart when "Add to Basket" is clicked', () => {
        render(
            <MemoryRouter>
                <ProductCard product={mockProduct as any} onOpen={mockOnOpen} />
            </MemoryRouter>
        );

        const addBtn = screen.getByText(/Add to Basket/i);
        fireEvent.click(addBtn);

        expect(mockAddToCart).toHaveBeenCalledWith(mockProduct);
    });

    it('shows "In Basket" when product is already in cart', () => {
        (useCart as any).mockReturnValue({
            addToCart: mockAddToCart,
            cart: [{ id: '1' }]
        });

        render(
            <MemoryRouter>
                <ProductCard product={mockProduct as any} onOpen={mockOnOpen} />
            </MemoryRouter>
        );

        expect(screen.getByText(/In Basket/i)).toBeInTheDocument();
        expect(screen.queryByText(/Add to Basket/i)).not.toBeInTheDocument();
    });
});
