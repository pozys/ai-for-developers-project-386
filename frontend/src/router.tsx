import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router";

import AdminLayout from "@/components/AdminLayout";
import Layout from "@/components/Layout";
import BookingPage from "@/pages/BookingPage";
import EventTypesPage from "@/pages/EventTypesPage";
import NotFoundPage from "@/pages/NotFoundPage";
import RouteErrorPage from "@/pages/RouteErrorPage";
import BookingsPage from "@/pages/admin/BookingsPage";
import CreateEventTypePage from "@/pages/admin/CreateEventTypePage";
import EditEventTypePage from "@/pages/admin/EditEventTypePage";
import AdminEventTypesPage from "@/pages/admin/EventTypesPage";

const appRoutes = createRoutesFromElements(
  <Route
    path="/"
    element={<Layout />}
    errorElement={
      <Layout>
        <RouteErrorPage />
      </Layout>
    }
  >
    <Route index element={<EventTypesPage />} />
    <Route path="event-types/:id/book" element={<BookingPage />} />
    <Route path="admin" element={<AdminLayout />}>
      <Route path="event-types" element={<AdminEventTypesPage />} />
      <Route path="event-types/new" element={<CreateEventTypePage />} />
      <Route path="event-types/:id/edit" element={<EditEventTypePage />} />
      <Route path="bookings" element={<BookingsPage />} />
    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Route>,
);

const appRouter = createBrowserRouter(appRoutes);

export { appRouter, appRoutes };
