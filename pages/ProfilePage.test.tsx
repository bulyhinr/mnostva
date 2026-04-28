import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfilePage from './ProfilePage';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { useCart } from '../context/CartContext';

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  __esModule: true,
  useAuth: vi.fn(),
}));

// Mock CartContext
vi.mock('../context/CartContext', () => ({
  __esModule: true,
  useCart: vi.fn(),
}));

// Mock orderService
vi.mock('../services/orderService', () => ({
  __esModule: true,
  orderService: {
    cancelOrder: vi.fn(),
    getPaymentDetails: vi.fn(),
  },
}));

// Mock ScrollReveal
vi.mock('../components/ScrollReveal', () => ({
  __esModule: true,
  default: ({ children }: any) => <div>{children}</div>,
}));

describe('ProfilePage', () => {
    const mockUser = {
        id: '1',
        name: 'Jane Doe',
        email: 'jane@example.com',
        avatar: 'avatar.jpg',
        joinedAt: new Date().toISOString(),
        bio: 'Artist'
    };

    const mockOrders = [
        {
            id: 'o1',
            date: new Date().toISOString(),
            status: 'paid',
            total: 50.00,
            items: [
                { id: '1', name: 'Cool Asset', price: 50.00, imageUrl: 'asset.jpg' }
            ]
        }
    ];

    const mockLogout = vi.fn();
    const mockUpdateProfile = vi.fn();
    const mockFetchOrders = vi.fn();
    const mockOnBack = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as any).mockReturnValue({
            user: mockUser,
            orders: mockOrders,
            logs: [],
            updateProfile: mockUpdateProfile,
            logout: mockLogout,
            fetchOrders: mockFetchOrders
        });
        (useCart as any).mockReturnValue({ addToCart: vi.fn() });
    });

    it('renders dashboard with user info and order stats', async () => {
        render(
            <MemoryRouter>
                <ProfilePage onBack={mockOnBack} onNavigateToShop={vi.fn()} />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { name: /Hello, Jane/i })).toBeInTheDocument();
        expect(screen.getByText(/Total Assets/i)).toBeInTheDocument();
        expect(screen.getByText(/Orders Count/i)).toBeInTheDocument();
        expect(screen.getAllByText(/Cool Asset/i)[0]).toBeInTheDocument();
    });

    it('switches to My Assets tab', async () => {
        render(
            <MemoryRouter>
                <ProfilePage onBack={mockOnBack} onNavigateToShop={vi.fn()} />
            </MemoryRouter>
        );

        const assetsTab = screen.getByRole('button', { name: /My Assets/i });
        fireEvent.click(assetsTab);

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /Your Stylized Collection/i })).toBeInTheDocument();
            expect(screen.getByText(/Download Files/i)).toBeInTheDocument();
        });
    });

    it('switches to Settings tab and allows updating name', async () => {
        render(
            <MemoryRouter>
                <ProfilePage onBack={mockOnBack} onNavigateToShop={vi.fn()} />
            </MemoryRouter>
        );

        const settingsTab = screen.getByRole('button', { name: /Settings/i });
        fireEvent.click(settingsTab);

        const nameInput = screen.getByDisplayValue('Jane Doe');
        fireEvent.change(nameInput, { target: { value: 'Jane New Name' } });

        const saveBtn = screen.getByText(/Save Changes/i);
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(mockUpdateProfile).toHaveBeenCalledWith(expect.objectContaining({
                name: 'Jane New Name'
            }));
        });
    });

    it('calls logout when clicking logout button', () => {
        render(
            <MemoryRouter>
                <ProfilePage onBack={mockOnBack} onNavigateToShop={vi.fn()} />
            </MemoryRouter>
        );

        const logoutBtn = screen.getByRole('button', { name: /Logout/i });
        fireEvent.click(logoutBtn);

        expect(mockLogout).toHaveBeenCalled();
    });

    it('calls onBack when clicking back button', () => {
        render(
            <MemoryRouter>
                <ProfilePage onBack={mockOnBack} onNavigateToShop={vi.fn()} />
            </MemoryRouter>
        );

        const backBtn = screen.getByText(/Back/i);
        fireEvent.click(backBtn);

        expect(mockOnBack).toHaveBeenCalled();
    });
});
