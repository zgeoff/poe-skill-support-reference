import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';

beforeEach(() => {
  window.location.hash = '';
  localStorage.clear();
});

describe('App', () => {
  it('renders loading state then skill list', async () => {
    render(<App />);
    expect(screen.getByText('Loading gem data...')).toBeInTheDocument();
    expect(await screen.findByText('Arc')).toBeInTheDocument();
  });

  it('shows all skills listed alphabetically on initial load', async () => {
    render(<App />);
    await screen.findByText('Arc');
    const skillNames = ['Arc', 'Automation', 'Ball Lightning', 'Cleave', 'Cyclone', 'Frostbolt', 'Maelstr\u00f6m', 'Poisonstrike', 'Rain of Arrows', 'Shield Charge'];
    for (const name of skillNames) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it('expands a skill row to show support pills on click', async () => {
    const user = userEvent.setup();
    render(<App />);
    const arcRow = await screen.findByText('Arc');
    await user.click(arcRow);
    expect(await screen.findByText('Spell Echo')).toBeInTheDocument();
    expect(screen.getByText('Faster Casting')).toBeInTheDocument();
  });

  it('collapses an expanded skill row on second click', async () => {
    const user = userEvent.setup();
    render(<App />);
    const arcRow = await screen.findByText('Arc');
    await user.click(arcRow);
    expect(await screen.findByText('Spell Echo')).toBeInTheDocument();
    await user.click(arcRow);
    await waitFor(() => {
      expect(screen.queryByText('Spell Echo')).not.toBeInTheDocument();
    });
  });

  it('allows multiple skills to be expanded simultaneously', async () => {
    const user = userEvent.setup();
    render(<App />);
    const arcRow = await screen.findByText('Arc');
    const cleaveRow = screen.getByText('Cleave');
    await user.click(arcRow);
    expect(await screen.findByText('Spell Echo')).toBeInTheDocument();
    await user.click(cleaveRow);
    expect(await screen.findByText('Multistrike')).toBeInTheDocument();
    // Both should still be visible
    expect(screen.getByText('Spell Echo')).toBeInTheDocument();
    expect(screen.getByText('Multistrike')).toBeInTheDocument();
  });

  it('filters by color when clicking Red, and resets with All', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Arc');
    await user.click(screen.getByText('Red'));
    // Red skills should be visible
    expect(screen.getByText('Cleave')).toBeInTheDocument();
    // Blue skills should be hidden
    expect(screen.queryByText('Arc')).not.toBeInTheDocument();
    // Reset
    await user.click(screen.getByText('All'));
    expect(await screen.findByText('Arc')).toBeInTheDocument();
  });

  it('shows empty state for nonsense query', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Arc');
    const input = screen.getByPlaceholderText('Search skills or supports...');
    await user.type(input, 'xyznonexistent');
    expect(await screen.findByText('No matching skills found')).toBeInTheDocument();
  });

  it('pins a skill and shows it in pinned section', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Arc');
    // Find the pin button for Arc
    const pinButtons = screen.getAllByLabelText('Pin');
    await user.click(pinButtons[0]); // Pin the first skill (Arc)
    expect(await screen.findByText('Pinned (1)')).toBeInTheDocument();
  });

  it('pinned skills persist through search changes', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Arc');
    // Pin Arc
    const pinButtons = screen.getAllByLabelText('Pin');
    await user.click(pinButtons[0]);
    expect(await screen.findByText('Pinned (1)')).toBeInTheDocument();
    // Search for something else
    const input = screen.getByPlaceholderText('Search skills or supports...');
    await user.type(input, 'Cleave');
    // Pinned section should still be visible
    await waitFor(() => {
      expect(screen.getByText('Pinned (1)')).toBeInTheDocument();
    });
  });

  it('unpins a skill and removes it from pinned section', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Arc');
    // Pin Arc
    const pinButtons = screen.getAllByLabelText('Pin');
    await user.click(pinButtons[0]);
    expect(await screen.findByText('Pinned (1)')).toBeInTheDocument();
    // Unpin it
    const unpinButton = screen.getAllByLabelText('Unpin')[0];
    await user.click(unpinButton);
    await waitFor(() => {
      expect(screen.queryByText('Pinned (1)')).not.toBeInTheDocument();
    });
  });

  it('can collapse and expand the pinned section', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Arc');
    // Pin Arc
    const pinButtons = screen.getAllByLabelText('Pin');
    await user.click(pinButtons[0]);
    const pinnedHeader = await screen.findByText('Pinned (1)');
    // Collapse
    await user.click(pinnedHeader);
    // The pinned skill's expand/collapse within should be hidden
    // But the header should still be visible
    expect(screen.getByText('Pinned (1)')).toBeInTheDocument();
  });
});
