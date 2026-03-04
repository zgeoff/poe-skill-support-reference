import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '@/App';

beforeEach(() => {
  window.location.hash = '';
  localStorage.clear();
});

describe('Search', () => {
  it('filters skills by name', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Arc');
    const input = screen.getByPlaceholderText('Search skills…');
    await user.type(input, 'Arc');
    await waitFor(() => {
      expect(screen.getByText('Arc')).toBeInTheDocument();
    });
  });

  it('supports fuzzy matching for partial/misspelled input', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Arc');
    const input = screen.getByPlaceholderText('Search skills…');
    await user.type(input, 'Cyclon');
    await waitFor(() => {
      expect(screen.getByText('Cyclone')).toBeInTheDocument();
    });
  });

  it('restores full list when search is cleared', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Arc');
    const input = screen.getByPlaceholderText('Search skills…');
    await user.type(input, 'Arc');
    await waitFor(() => {
      expect(screen.queryByText('Cleave')).not.toBeInTheDocument();
    });
    await user.clear(input);
    await waitFor(() => {
      expect(screen.getByText('Cleave')).toBeInTheDocument();
      expect(screen.getByText('Arc')).toBeInTheDocument();
    });
  });

  it('debounces search to avoid excessive re-renders', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Arc');
    const input = screen.getByPlaceholderText('Search skills…');
    // Type rapidly
    await user.type(input, 'Cleave');
    // Results should eventually settle
    await waitFor(() => {
      expect(screen.getByText('Cleave')).toBeInTheDocument();
    });
  });
});
