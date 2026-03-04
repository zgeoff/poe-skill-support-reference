import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '@/App';

beforeEach(() => {
  window.location.hash = '';
  localStorage.clear();
});

describe('URL Hash', () => {
  it('loads app with hash and restores search query', async () => {
    window.location.hash = '#?q=arc';
    render(<App />);
    const input = await screen.findByPlaceholderText('Search skills…');
    expect(input).toHaveValue('arc');
    expect(await screen.findByText('Arc')).toBeInTheDocument();
  });

  it('expanding a skill updates the URL hash', async () => {
    const user = userEvent.setup();
    render(<App />);
    const arcRow = await screen.findByText('Arc');
    await user.click(arcRow);
    await waitFor(() => {
      expect(window.location.hash).toContain('e=Arc');
    });
  });

  it('changing the search query updates the hash', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Arc');
    const input = screen.getByPlaceholderText('Search skills…');
    await user.type(input, 'cleave');
    await waitFor(() => {
      expect(window.location.hash).toContain('q=cleave');
    });
  });

  it('color filter changes are reflected in hash', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Arc');
    await user.click(screen.getByText('Blue'));
    await waitFor(() => {
      expect(window.location.hash).toContain('c=blue');
    });
  });

  it('loading with pre-set hash restores expanded and color state', async () => {
    window.location.hash = '#?e=Arc&c=blue';
    render(<App />);
    // Arc should be expanded (support pills visible)
    expect(await screen.findByText('Spell Echo')).toBeInTheDocument();
    // Color filter no longer hides skills - all skills should be visible
    expect(screen.getByText('Cleave')).toBeInTheDocument();
    expect(screen.getByText('Arc')).toBeInTheDocument();
  });
});
