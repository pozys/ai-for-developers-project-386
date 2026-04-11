import type { ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router'

function getNavLinkClassName(isActive: boolean) {
  return isActive ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground'
}

interface LayoutProps {
  children?: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <nav
          aria-label="Основная навигация"
          className="container mx-auto flex h-14 flex-wrap items-center gap-4 px-4 sm:gap-6"
        >
          <NavLink
            to="/"
            end
            className={({ isActive }) => getNavLinkClassName(isActive)}
          >
            Home
          </NavLink>
          <NavLink
            to="/admin/event-types"
            className={({ isActive }) => getNavLinkClassName(isActive)}
          >
            Admin: типы событий
          </NavLink>
          <NavLink
            to="/admin/bookings"
            className={({ isActive }) => getNavLinkClassName(isActive)}
          >
            Admin: бронирования
          </NavLink>
        </nav>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children ?? <Outlet />}
      </main>
    </div>
  )
}
