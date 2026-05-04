import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from './LoginPage';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Mock ScrollReveal
vi.mock('../components/ScrollReveal', () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="scroll-reveal">{children}</div>,
}));

// Mock AuthContext
const mockLogin = vi.fn();
const mockRegister = vi.fn();
vi.mock('../context/AuthContext', () => ({
  __esModule: true,
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
  }),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom') as any;
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useSearchParams: () => [new URLSearchParams()],
    };
});

describe('LoginPage', () => {
  const mockOnSuccess = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form by default', () => {
    render(
      <MemoryRouter>
        <LoginPage onSuccess={mockOnSuccess} onBack={mockOnBack} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/123@123.com/i)).toBeInTheDocument();
  });

  it('switches to register mode', () => {
    render(
      <MemoryRouter>
        <LoginPage onSuccess={mockOnSuccess} onBack={mockOnBack} />
      </MemoryRouter>
    );

    const switchBtn = screen.getByText(/Sign up here/i);
    fireEvent.click(switchBtn);

    expect(screen.getByText(/Join the Magic!/i)).toBeInTheDocument();
  });

  it('calls login from useAuth on submit and calls onSuccess on success', async () => {
    mockLogin.mockResolvedValue(true);

    render(
      <MemoryRouter>
        <LoginPage onSuccess={mockOnSuccess} onBack={mockOnBack} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/123@123.com/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/••••••/i), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Login Now/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('shows local error state on login failure', async () => {
    mockLogin.mockResolvedValue(false);

    render(
      <MemoryRouter>
        <LoginPage onSuccess={mockOnSuccess} onBack={mockOnBack} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/123@123.com/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/••••••/i), { target: { value: 'wrong' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Login Now/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
      expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
    });
    
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('calls register with acceptedTerms on signup submit', async () => {
    mockRegister.mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <LoginPage onSuccess={mockOnSuccess} onBack={mockOnBack} />
      </MemoryRouter>
    );

    // Switch to signup
    fireEvent.click(screen.getByText(/Sign up here/i));

    // Fill fields
    fireEvent.change(screen.getByPlaceholderText(/Artist Name/i), { target: { value: 'New Artist' } });
    fireEvent.change(screen.getByPlaceholderText(/123@123.com/i), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/••••••/i), { target: { value: 'password123' } });
    
    // Check terms
    fireEvent.click(screen.getByRole('checkbox'));
    
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('New Artist', 'new@example.com', 'password123', true);
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
