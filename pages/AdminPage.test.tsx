import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminPage from './AdminPage';
import { productService } from '../services/productService';
import { discountService } from '../services/discountService';
import { couponService } from '../services/couponService';
import { authService } from '../services/authService';
import { MemoryRouter } from 'react-router-dom';

// Mock services
vi.mock('../services/productService', () => ({
  __esModule: true,
  productService: {
    getAllProducts: vi.fn(),
    deleteProduct: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
  },
}));

vi.mock('../services/discountService', () => ({
  __esModule: true,
  discountService: {
    getAllDiscounts: vi.fn(),
  },
}));

vi.mock('../services/couponService', () => ({
  __esModule: true,
  couponService: {
    getAllCoupons: vi.fn(),
  },
}));

vi.mock('../services/authService', () => ({
  __esModule: true,
  authService: {
    getAccessToken: vi.fn(),
  },
}));

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  __esModule: true,
  useAuth: () => ({
    user: { id: 'admin', isAdmin: true },
    loading: false,
  }),
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

describe('AdminPage', () => {
    const mockProducts = [
        { id: '1', title: 'Test Asset 1', price: 1000, category: 'Prop', tags: [], externalLinks: {} },
        { id: '2', title: 'Test Asset 2', price: 2000, category: 'Environment', tags: [], externalLinks: {} },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (productService.getAllProducts as any).mockResolvedValue({ data: mockProducts, total: 2 });
        (discountService.getAllDiscounts as any).mockResolvedValue([]);
        (couponService.getAllCoupons as any).mockResolvedValue([]);
        (authService.getAccessToken as any).mockReturnValue('mock-token');
        (productService.deleteProduct as any).mockResolvedValue({ success: true });
    });

    it('renders admin panel and shows asset list by default', async () => {
        render(
            <MemoryRouter>
                <AdminPage />
            </MemoryRouter>
        );

        expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument();
        const firstAsset = await screen.findByText(/Test Asset 1/i);
        expect(firstAsset).toBeInTheDocument();
    });

    it('switches to Discounts tab and back', async () => {
        render(
            <MemoryRouter>
                <AdminPage />
            </MemoryRouter>
        );

        const discountsTab = screen.getByRole('button', { name: /Discounts/i });
        fireEvent.click(discountsTab);

        const discountTableLabel = await screen.findByText(/No discounts found/i);
        expect(discountTableLabel).toBeInTheDocument();

        // Switch back to Products
        const productsTab = screen.getByRole('button', { name: /Assets/i });
        fireEvent.click(productsTab);
        expect(await screen.findByText(/Test Asset 1/i)).toBeInTheDocument();
    });

    it('opens the product edit form and shows new store fields', async () => {
        render(
            <MemoryRouter>
                <AdminPage />
            </MemoryRouter>
        );

        const editBtns = await screen.findAllByLabelText(/Edit/i);
        fireEvent.click(editBtns[0]);

        expect(await screen.findByText(/Edit Asset/i)).toBeInTheDocument();
        
        // Check for Superhive input (label)
        expect(screen.getAllByText(/Superhive/i)[0]).toBeInTheDocument();
        
        // Check for YouTube input (label)
        expect(screen.getAllByText(/YouTube Video URL/i)[0]).toBeInTheDocument();
    });

    it('calls delete service when delete button is clicked and confirmed', async () => {
        window.confirm = vi.fn().mockReturnValue(true);

        render(
            <MemoryRouter>
                <AdminPage />
            </MemoryRouter>
        );

        const deleteBtn = await screen.findByLabelText(/Delete Test Asset 1/i);
        fireEvent.click(deleteBtn);

        expect(window.confirm).toHaveBeenCalled();
        await waitFor(() => {
            expect(productService.deleteProduct).toHaveBeenCalled();
        });
    });
    it('handles products with null galleryImages without crashing', async () => {
        (productService.getAllProducts as any).mockResolvedValue({ 
            data: [{ id: '99', title: 'Broken Asset', price: 1000, category: 'Prop', galleryImages: null }], 
            total: 1 
        });

        render(
            <MemoryRouter>
                <AdminPage />
            </MemoryRouter>
        );

        expect(await screen.findByText(/Broken Asset/i)).toBeInTheDocument();
    });
});
