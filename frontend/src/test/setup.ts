import "@testing-library/jest-dom";
import { beforeEach, vi } from "vitest";

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.classList.remove("dark");
  document.documentElement.style.colorScheme = "light";
});

vi.stubGlobal("matchMedia", (query: string) => ({
  addEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
  media: query,
  matches: false,
  onchange: null,
  removeEventListener: vi.fn(),
}));
