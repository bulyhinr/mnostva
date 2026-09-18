import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LegalPage from './LegalPage';

describe('LegalPage', () => {
  it('renders the main heading and default quick comparison tab', () => {
    render(
      <MemoryRouter>
        <LegalPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Legal & Licensing')).toBeInTheDocument();
    expect(screen.getByText('🎮 License Comparison at a Glance')).toBeInTheDocument();
    expect(screen.getByText('Personal License (Single-Seat)')).toBeInTheDocument();
    expect(screen.getByText('Studio / Company License (Multi-Seat)')).toBeInTheDocument();
  });

  it('does not contain outdated $100,000 revenue cap references', () => {
    render(
      <MemoryRouter>
        <LegalPage />
      </MemoryRouter>
    );

    const bodyText = document.body.textContent || '';
    expect(bodyText).not.toContain('100,000');
    expect(screen.getAllByText(/Keep 100% of your earnings/i).length).toBeGreaterThan(0);
  });

  it('switches to the Full EULA tab and renders agreement sections', () => {
    render(
      <MemoryRouter>
        <LegalPage />
      </MemoryRouter>
    );

    const eulaTabButton = screen.getByRole('button', { name: /Full EULA Agreement/i });
    fireEvent.click(eulaTabButton);

    expect(screen.getByText('End User License Agreement (EULA)')).toBeInTheDocument();
    expect(screen.getByText(/Effective Date: September 1, 2026/i)).toBeInTheDocument();
    expect(screen.getByText('Definitions')).toBeInTheDocument();
    expect(screen.getByText('Ownership and Intellectual Property')).toBeInTheDocument();
    expect(screen.getByText('License Grant')).toBeInTheDocument();
  });

  it('has a working EULA download button', () => {
    render(
      <MemoryRouter>
        <LegalPage />
      </MemoryRouter>
    );

    const downloadButtons = screen.getAllByRole('button', { name: /Download/i });
    expect(downloadButtons.length).toBeGreaterThan(0);
  });

  it('switches to the Privacy & Policies tab and displays policy sections', () => {
    render(
      <MemoryRouter>
        <LegalPage />
      </MemoryRouter>
    );

    const policiesTabButton = screen.getByRole('button', { name: /Privacy & Policies/i });
    fireEvent.click(policiesTabButton);

    expect(screen.getByText(/Privacy & Data Protection \(GDPR \/ CCPA\)/i)).toBeInTheDocument();
    expect(screen.getByText('Cookie Policy')).toBeInTheDocument();
    expect(screen.getByText(/Refund & Cancellation Policy/i)).toBeInTheDocument();
    expect(screen.getByText(/Intellectual Property & DMCA Copyright Notice/i)).toBeInTheDocument();
  });
});
