import { NavLink, Outlet } from "react-router";

function getAdminNavClass(isActive: boolean) {
  return [
    "inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-all",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
    isActive
      ? "bg-foreground text-background shadow-sm shadow-foreground/10"
      : "border border-border/80 bg-card/80 text-muted-foreground shadow-sm backdrop-blur hover:border-primary/30 hover:text-foreground",
  ].join(" ");
}

export default function AdminLayout() {
  return (
    <div className="space-y-6">
      <nav
        aria-label="Навигация по админке"
        className="flex flex-wrap gap-2 border-b border-border/60 pb-4"
      >
        <NavLink
          to="/admin/event-types"
          className={({ isActive }) => getAdminNavClass(isActive)}
        >
          Типы событий
        </NavLink>
        <NavLink
          to="/admin/bookings"
          className={({ isActive }) => getAdminNavClass(isActive)}
        >
          Бронирования
        </NavLink>
      </nav>
      <Outlet />
    </div>
  );
}
