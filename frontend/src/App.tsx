// ─────────────────────────────────────────────────────────────
// App — Route Registry
//
// Collects route definitions from every feature module and
// renders them as a flat <Routes> tree.
//
// Each feature module exports an array of AppRoute objects:
//   path      — the URL path (e.g. "/workouts")
//   element   — the React component to render
//   protected — if true, wraps the element in <ProtectedRoute>
//               (redirects to /login if no session)
//   layout    — if true, wraps the element in <Layout>
//               (shows the sidebar / nav chrome)
//
// renderElement applies the wrappers in the right order:
//   Layout first (outer shell), then ProtectedRoute (auth guard).
// ─────────────────────────────────────────────────────────────

import { Route, Routes, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import Layout from "./components/Layout";
import { ProtectedRoute } from "./modules/auth/components/ProtectedRoute";
import { authRoutes } from "./modules/auth/routers/authRouter";
import { calorieRoutes } from "./modules/calorie-check/routers/calorieRouter";
import { chatRoutes } from "./modules/chat/routers/chatRouter";
import { dashboardRoutes } from "./modules/dashboard/routers/dashboardRouter";
import { landingRoutes } from "./modules/landing/routers/landingRouter";
import { mealRoutes } from "./modules/meals/routers/mealRouter";
import { notFoundRoutes } from "./modules/not-found/routers/notFoundRouter";
import {
  onboardingRoutes,
  profileRoutes,
} from "./modules/profile/routers/profileRouter";
import { musicRoutes } from "./modules/music/routers/musicRouter";
import { supplementRoutes } from "./modules/supplements/routers/supplementRouter";
import { workoutRoutes } from "./modules/workouts/routers/workoutRouter";

// ── AppRoute type ─────────────────────────────────────────────
// Shape of each route definition exported by feature modules.
type AppRoute = {
  path: string;
  element: ReactNode;
  protected?: boolean;
  layout?: boolean;
};

// ── appRoutes ─────────────────────────────────────────────────
// Full flat list of all routes in the application, assembled from
// each feature module's route array.
// /app → /dashboard redirect catches any legacy links.
const appRoutes: AppRoute[] = [
  ...landingRoutes,
  ...authRoutes,
  ...onboardingRoutes,
  ...dashboardRoutes,
  ...workoutRoutes,
  ...mealRoutes,
  ...calorieRoutes,
  ...supplementRoutes,
  ...chatRoutes,
  ...musicRoutes,
  ...profileRoutes,
  { path: "/app", element: <Navigate to="/dashboard" replace /> },
  ...notFoundRoutes,
];

// ── renderElement ─────────────────────────────────────────────
// Wraps a route's element in optional Layout and/or ProtectedRoute
// shells depending on the route's flags.
function renderElement(route: AppRoute) {
  let element = route.element;

  if (route.layout) {
    element = <Layout>{element}</Layout>;
  }

  if (route.protected) {
    element = <ProtectedRoute>{element}</ProtectedRoute>;
  }

  return element;
}

// ── App ───────────────────────────────────────────────────────
// Renders the full route tree. Each AppRoute becomes a single
// <Route> with the element processed by renderElement.
export default function App() {
  return (
    <Routes>
      {appRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={renderElement(route)}
        />
      ))}
    </Routes>
  );
}
