// ─────────────────────────────────────────────────────────────
// Application Entry Point
//
// Mounts the React app into the #root div in index.html and
// wraps it with all the global providers in the correct order:
//
//   ThemeProvider       — injects the dark/light CSS class onto <html>
//   QueryClientProvider — supplies React Query's shared cache
//   BrowserRouter       — enables client-side routing with <Routes>
//   AuthProvider        — fetches the current user on load and
//                         exposes login/logout/register across the app
//
// The QueryClient is configured to:
//   retry: 1   — retry a failed request once before showing an error
//   refetchOnWindowFocus: false — avoid surprise refetches when the
//                                 user switches tabs
// ─────────────────────────────────────────────────────────────

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { AuthProvider } from "./modules/auth/components/AuthProvider";
import { ThemeProvider } from "./context/ThemeContext";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter
          future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
        >
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);
