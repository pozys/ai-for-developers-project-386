import { Check, ChevronDown, LaptopMinimal, Moon, Sun } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/theme/themeContext";
import type { ThemeMode } from "@/theme/theme";

interface ThemeOption {
  icon: typeof Sun;
  label: string;
  mode: ThemeMode;
}

const themeOptions: ThemeOption[] = [
  { mode: "light", label: "Светлая", icon: Sun },
  { mode: "dark", label: "Тёмная", icon: Moon },
  { mode: "system", label: "Системная", icon: LaptopMinimal },
];

export function ThemeToggle() {
  const { mode, resolvedTheme, setMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeOption = useMemo(
    () =>
      themeOptions.find((option) => option.mode === mode) ?? themeOptions[2],
    [mode],
  );

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (target instanceof Node && menuRef.current?.contains(target)) {
        return;
      }

      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const ActiveIcon =
    activeOption.mode === "system"
      ? resolvedTheme === "dark"
        ? Moon
        : Sun
      : activeOption.icon;
  const menuId = "theme-menu";

  return (
    <div ref={menuRef} className="relative shrink-0">
      <Button
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`Текущая тема: ${activeOption.label}`}
        className="gap-2"
        onClick={() => setIsOpen((value) => !value)}
        size="sm"
        type="button"
        variant="outline"
      >
        <ActiveIcon aria-hidden="true" className="size-4" />
        <span className="hidden sm:inline">{activeOption.label}</span>
        <ChevronDown aria-hidden="true" className="size-3.5 opacity-60" />
      </Button>

      {isOpen ? (
        <div
          aria-label="Выбор темы"
          id={menuId}
          className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-border/80 bg-popover p-1 shadow-xl shadow-black/10 backdrop-blur-xl"
          role="menu"
        >
          {themeOptions.map((option) => {
            const OptionIcon =
              option.mode === "system" ? LaptopMinimal : option.icon;
            const isSelected = mode === option.mode;

            return (
              <button
                aria-checked={isSelected}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                  "outline-none focus-visible:bg-muted focus-visible:text-foreground",
                  isSelected
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                )}
                key={option.mode}
                onClick={() => {
                  setMode(option.mode);
                  setIsOpen(false);
                }}
                role="menuitemradio"
                type="button"
              >
                <OptionIcon aria-hidden="true" className="size-4 shrink-0" />
                <span className="flex-1">{option.label}</span>
                <Check
                  aria-hidden="true"
                  className={cn(
                    "size-4 shrink-0 transition-opacity",
                    isSelected ? "opacity-100 text-foreground" : "opacity-0",
                  )}
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
