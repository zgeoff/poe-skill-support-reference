import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import { testGemData } from './fixtures';

// Mock fetch to return test fixture data (as spec requires)
vi.stubGlobal('fetch', vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(testGemData),
  }),
));

beforeEach(() => {
  window.location.hash = '';
  localStorage.clear();
});
