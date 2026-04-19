import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderApp } from "@/test/renderApp";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { ThemeToggle } from "@/theme/ThemeToggle";
import { useTheme } from "@/theme/themeContext";
import { themeStorageKey } from "@/theme/theme";

type MatchMediaListener = (event: MediaQueryListEvent) => void;

interface MockMediaQueryList {
  addEventListener: (eventName: "change", listener: MatchMediaListener) => void;
  dispatchEvent: (event: Event) => boolean;
  matches: boolean;
  media: string;
  onchange: MediaQueryList["onchange"];
  removeEventListener: (
    eventName: "change",
    listener: MatchMediaListener,
  ) => void;
}

function createMatchMedia(matches: boolean) {
  const listeners = new Set<MatchMediaListener>();

  const mediaQueryList: MockMediaQueryList = {
    addEventListener: vi.fn(
      (eventName: "change", listener: MatchMediaListener) => {
        if (eventName === "change") {
          listeners.add(listener);
        }
      },
    ),
    dispatchEvent: vi.fn(),
    matches,
    media: "(prefers-color-scheme: dark)",
    onchange: null,
    removeEventListener: vi.fn(
      (eventName: "change", listener: MatchMediaListener) => {
        if (eventName === "change") {
          listeners.delete(listener);
        }
      },
    ),
  };

  return {
    mediaQueryList,
    setMatches(nextMatches: boolean) {
      mediaQueryList.matches = nextMatches;

      const changeEvent = {
        matches: nextMatches,
        media: mediaQueryList.media,
        type: "change",
      } as MediaQueryListEvent;

      listeners.forEach((listener) => {
        listener(changeEvent);
      });
    },
  };
}

function ThemeStatus() {
  const { mode, resolvedTheme, setMode } = useTheme();

  useEffect(() => {
    document.documentElement.dataset.themeMode = mode;
    document.documentElement.dataset.resolvedTheme = resolvedTheme;
  }, [mode, resolvedTheme]);

  return (
    <div>
      <p>mode:{mode}</p>
      <p>resolved:{resolvedTheme}</p>
      <button type="button" onClick={() => setMode("dark")}>
        Set dark
      </button>
      <button type="button" onClick={() => setMode("system")}>
        Set system
      </button>
    </div>
  );
}

beforeEach(() => {
  window.localStorage.removeItem(themeStorageKey);
  const matchMedia = createMatchMedia(false);
  vi.stubGlobal("matchMedia", () => matchMedia.mediaQueryList);
});

describe("ThemeProvider", () => {
  it("applies the system theme and persists manual changes", async () => {
    const user = userEvent.setup();

    window.localStorage.setItem(themeStorageKey, "system");
    const matchMedia = createMatchMedia(true);
    vi.stubGlobal("matchMedia", () => matchMedia.mediaQueryList);

    render(
      <ThemeProvider>
        <ThemeStatus />
      </ThemeProvider>,
    );

    expect(screen.getByText("mode:system")).toBeInTheDocument();
    expect(screen.getByText("resolved:dark")).toBeInTheDocument();
    expect(document.documentElement).toHaveClass("dark");

    await user.click(screen.getByRole("button", { name: "Set dark" }));

    await waitFor(() => {
      expect(screen.getByText("mode:dark")).toBeInTheDocument();
      expect(screen.getByText("resolved:dark")).toBeInTheDocument();
    });

    expect(window.localStorage.getItem(themeStorageKey)).toBe("dark");
    expect(document.documentElement).toHaveClass("dark");
  });

  it("reacts to system color scheme changes when mode is system", async () => {
    const matchMedia = createMatchMedia(false);
    vi.stubGlobal("matchMedia", () => matchMedia.mediaQueryList);

    window.localStorage.setItem(themeStorageKey, "system");

    render(
      <ThemeProvider>
        <ThemeStatus />
      </ThemeProvider>,
    );

    expect(screen.getByText("resolved:light")).toBeInTheDocument();
    expect(document.documentElement).not.toHaveClass("dark");

    matchMedia.setMatches(true);

    await waitFor(() => {
      expect(screen.getByText("resolved:dark")).toBeInTheDocument();
      expect(document.documentElement).toHaveClass("dark");
    });
  });
});

describe("ThemeToggle", () => {
  it("switches theme from the app header", async () => {
    const user = userEvent.setup();

    renderApp({ initialEntries: ["/"] });

    await user.click(screen.getByRole("button", { name: /Текущая тема:/i }));
    await user.click(screen.getByRole("menuitemradio", { name: /Тёмная/i }));

    await waitFor(() => {
      expect(window.localStorage.getItem(themeStorageKey)).toBe("dark");
      expect(document.documentElement).toHaveClass("dark");
    });

    expect(
      screen.getByRole("button", { name: /Текущая тема: Тёмная/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Выбрано")).not.toBeInTheDocument();
  });

  it("renders the toggle in the layout", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    expect(
      screen.getByRole("button", { name: /Текущая тема:/i }),
    ).toBeInTheDocument();
  });
});
