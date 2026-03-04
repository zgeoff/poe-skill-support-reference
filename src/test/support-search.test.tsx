import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '@/App';

beforeEach(() => {
  window.location.hash = '';
  localStorage.clear();
});

describe('Support search', () => {
  it('toggles checkbox and changes placeholder', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Arc');

    expect(screen.getByPlaceholderText('Search skills…')).toBeInTheDocument();

    const checkbox = screen.getByRole('checkbox', { name: /search by support gem/i });
    await user.click(checkbox);

    expect(screen.getByPlaceholderText('Search supports…')).toBeInTheDocument();
  });

  it('filters skills by support name', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Arc');

    await user.click(screen.getByRole('checkbox', { name: /search by support gem/i }));
    const input = screen.getByPlaceholderText('Search supports…');
    await user.type(input, 'Multistrike');

    await waitFor(() => {
      // Cleave and Cyclone have Multistrike Support
      expect(screen.getByText('Cleave')).toBeInTheDocument();
      expect(screen.getByText('Cyclone')).toBeInTheDocument();
      // Arc does not
      expect(screen.queryByText('Arc')).not.toBeInTheDocument();
    });
  });

  it('shows only matching support pills', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Arc');

    await user.click(screen.getByRole('checkbox', { name: /search by support gem/i }));
    const input = screen.getByPlaceholderText('Search supports…');
    await user.type(input, 'Multistrike');

    await waitFor(() => {
      // Multistrike pills rendered (stripped " Support" suffix)
      expect(screen.getAllByText('Multistrike')).toHaveLength(2); // Cleave + Cyclone
    });

    // Other supports like Ruthless should not be shown
    expect(screen.queryByText('Ruthless')).not.toBeInTheDocument();
  });

  it('shows normal collapsed list when query is empty in support mode', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Arc');

    await user.click(screen.getByRole('checkbox', { name: /search by support gem/i }));

    // All skills still visible with no query
    expect(screen.getByText('Arc')).toBeInTheDocument();
    expect(screen.getByText('Cleave')).toBeInTheDocument();
    expect(screen.getByText('Cyclone')).toBeInTheDocument();
  });

  it('reverts to skill-name search when unchecked', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Arc');

    const checkbox = screen.getByRole('checkbox', { name: /search by support gem/i });
    await user.click(checkbox);

    const input = screen.getByPlaceholderText('Search supports…');
    await user.type(input, 'Multistrike');

    await waitFor(() => {
      expect(screen.getByText('Cleave')).toBeInTheDocument();
      expect(screen.queryByText('Arc')).not.toBeInTheDocument();
    });

    // Uncheck — reverts to skill name search
    await user.click(checkbox);
    expect(screen.getByPlaceholderText('Search skills…')).toBeInTheDocument();
  });

  it('persists ss=1 in URL hash and restores on load', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Arc');

    await user.click(screen.getByRole('checkbox', { name: /search by support gem/i }));

    await waitFor(() => {
      expect(window.location.hash).toContain('ss=1');
    });
  });

  it('restores search supports mode from hash', async () => {
    window.location.hash = '#?ss=1&q=Multistrike';
    render(<App />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search supports…')).toBeInTheDocument();
      expect(screen.getByText('Cleave')).toBeInTheDocument();
    });
  });

  it('applies color filter on top of support search', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Arc');

    await user.click(screen.getByRole('checkbox', { name: /search by support gem/i }));
    const input = screen.getByPlaceholderText('Search supports…');
    await user.type(input, 'Faster Attacks');

    await waitFor(() => {
      // Shield Charge, Cyclone, Rain of Arrows have Faster Attacks
      expect(screen.getByText('Shield Charge')).toBeInTheDocument();
      expect(screen.getByText('Cyclone')).toBeInTheDocument();
      expect(screen.getByText('Rain of Arrows')).toBeInTheDocument();
    });

    // Filter to red color only — Faster Attacks is a green gem, so only skills
    // with green Faster Attacks should show, but color filter restricts to red supports.
    // Since Faster Attacks is green, no skills should have red Faster Attacks matches.
    const redFilter = screen.getByRole('button', { name: /red/i });
    await user.click(redFilter);

    await waitFor(() => {
      expect(screen.queryByText('Shield Charge')).not.toBeInTheDocument();
      expect(screen.queryByText('Cyclone')).not.toBeInTheDocument();
    });
  });
});
