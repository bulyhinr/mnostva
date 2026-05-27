import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CartDrawer from './CartDrawer';
import { MemoryRouter } from 'react-router-dom';
import { useCart } from '../context/CartContext';

// Mock useCart
vi.mock('../context/CartContext', () => ({
  useCart: vi.fn(),
  calculateDiscountedPrice: (price: number, percentage: number) => {
    const priceCents = Math.round(price * 100);
    const discountCents = Math.round(priceCents * (percentage / 100));
    return (priceCents - discountCents) / 100;
  },
}));

describe('CartDrawer', () => {
  const mockOnClose = vi.fn();
  const mockOnCheckout = vi.fn();
  const mockRemoveFromCart = vi.fn();
  const mockUpdateQuantity = vi.fn();

  const sampleItems = [
    {
      id: '1',
      name: 'Magic Asset',
      price: 15.50,
      imageUrl: 'test.jpg',
      category: 'Prop',
      description: 'Test',
      quantity: 1
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useCart as any).mockReturnValue({
        cart: sampleItems,
        removeFromCart: mockRemoveFromCart,
        updateQuantity: mockUpdateQuantity,
        totalPrice: 15.50
    });
  });

  it('renders "Empty Basket" when no items in cart', () => {
    (useCart as any).mockReturnValue({
        cart: [],
        removeFromCart: mockRemoveFromCart,
        updateQuantity: mockUpdateQuantity,
        totalPrice: 0
    });

    render(
      <MemoryRouter>
        <CartDrawer 
          isOpen={true} 
          onClose={mockOnClose} 
          onCheckout={mockOnCheckout}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/Your basket is empty!/i)).toBeInTheDocument();
  });

  it('renders items and total price correctly', () => {
    render(
      <MemoryRouter>
        <CartDrawer 
          isOpen={true} 
          onClose={mockOnClose} 
          onCheckout={mockOnCheckout}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/Magic Asset/i)).toBeInTheDocument();
    expect(screen.getAllByText(/\$15\.50/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Total/i)).toBeInTheDocument();
  });

  it('calls removeFromCart when delete button clicked', async () => {
    vi.useFakeTimers();
    render(
      <MemoryRouter>
        <CartDrawer 
          isOpen={true} 
          onClose={mockOnClose} 
          onCheckout={mockOnCheckout}
        />
      </MemoryRouter>
    );

    const removeBtns = screen.getAllByRole('button');
    const removeBtn = removeBtns.find(btn => btn.querySelector('svg pathological sequence or similar')) || removeBtns[2]; // Fallback to index if needed
    
    // Better: let's update CartDrawer to have aria-labels too
    fireEvent.click(screen.getByLabelText(/Remove Magic Asset/i));

    vi.advanceTimersByTime(400); // Wait for timeout in handler
    expect(mockRemoveFromCart).toHaveBeenCalledWith('1', 'standard');
    vi.useRealTimers();
  });

  it('calls onClose when close button clicked', () => {
    render(
      <MemoryRouter>
        <CartDrawer 
          isOpen={true} 
          onClose={mockOnClose} 
          onCheckout={mockOnCheckout}
        />
      </MemoryRouter>
    );

    const closeBtn = screen.getByText(/Close/i);
    fireEvent.click(closeBtn);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
