import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders content when user is authenticated', () => {
    (useAuth as any).mockReturnValue({ user: { id: '1', role: 'user' }, loading: false });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={
            <ProtectedRoute>
              <div>Secret Area</div>
            </ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Secret Area/i)).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    (useAuth as any).mockReturnValue({ user: null, loading: false });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={
            <ProtectedRoute>
              <div>Secret Area</div>
            </ProtectedRoute>
          } />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText(/Secret Area/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Login Page/i)).toBeInTheDocument();
  });

  it('shows loading state if auth is loading', () => {
    (useAuth as any).mockReturnValue({ user: null, loading: true });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Secret Area</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Loading/i)).toBeInTheDocument();
  });
});
