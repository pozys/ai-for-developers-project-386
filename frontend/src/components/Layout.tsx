import type { ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router'

import { ThemeToggle } from '@/theme/ThemeToggle'

function getNavLinkClassName(isActive: boolean) {
  return [
    'inline-flex items-center rounded-full px-3 py-2 text-sm font-medium transition-all',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
    isActive
      ? 'bg-foreground text-background shadow-sm shadow-foreground/10'
      : 'border border-border/80 bg-card/80 text-muted-foreground shadow-sm backdrop-blur hover:border-primary/30 hover:text-foreground',
  ].join(' ')
}

interface LayoutProps {
  children?: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute left-[-4rem] top-32 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl dark:bg-amber-300/10" />
        <div className="absolute right-[-5rem] top-48 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl dark:bg-sky-500/10" />
      </div>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <nav
          aria-label="Основная навигация"
          className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
              <span className="font-heading text-lg leading-none">В</span>
            </div>
            <div className="leading-tight">
              <p className="font-heading text-lg">Встречалка</p>
              <p className="text-xs text-muted-foreground">Запись на встречу без лишних шагов</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <NavLink to="/" end className={({ isActive }) => getNavLinkClassName(isActive)}>
              Главная
            </NavLink>
            <NavLink
              to="/admin/event-types"
              className={({ isActive }) => getNavLinkClassName(isActive)}
            >
              Админка
            </NavLink>
            <ThemeToggle />
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        {children ?? <Outlet />}
      </main>
    </div>
  )
}
