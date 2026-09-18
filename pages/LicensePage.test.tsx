import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LicensePage from './LicensePage';

describe('LicensePage', () => {
  it('renders the main heading and license tiers', () => {
    render(
      <MemoryRouter>
        <LicensePage onBack={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText('License Agreements')).toBeInTheDocument();
    expect(screen.getByText('Personal License')).toBeInTheDocument();
    expect(screen.getByText('Studio / Company License')).toBeInTheDocument();
    expect(screen.getByText('Single-Seat')).toBeInTheDocument();
    expect(screen.getByText('Multi-Seat')).toBeInTheDocument();
  });

  it('does not contain outdated $100,000 revenue references', () => {
    render(
      <MemoryRouter>
        <LicensePage onBack={vi.fn()} />
      </MemoryRouter>
    );

    const bodyText = document.body.textContent || '';
    expect(bodyText).not.toContain('100,000');
    expect(screen.getByText(/Zero revenue cap, zero royalties/i)).toBeInTheDocument();
  });

  it('displays the Free Asset Policy and Prohibitions', () => {
    render(
      <MemoryRouter>
        <LicensePage onBack={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Strictly Prohibited \(All Tiers\):/i)).toBeInTheDocument();
    expect(screen.getByText(/2. Free Asset Usage Policy/i)).toBeInTheDocument();
  });

  it('includes a link to the Legal Center', () => {
    render(
      <MemoryRouter>
        <LicensePage onBack={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /Go to Legal Center →/i })).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    const handleBack = vi.fn();
    render(
      <MemoryRouter>
        <LicensePage onBack={handleBack} />
      </MemoryRouter>
    );

    const backButton = screen.getByRole('button', { name: /← Back to Shop/i });
    fireEvent.click(backButton);
    expect(handleBack).toHaveBeenCalledTimes(1);
  });
});
