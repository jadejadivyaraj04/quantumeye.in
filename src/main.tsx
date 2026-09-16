import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

/**
 * Two entry points in one bundle.
 *
 * The dashboard is imported lazily, so a visitor downloads none of it - not
 * the editors, not the GitHub client. It answers on /admin, and also on
 * /#/admin, because a static host that does not rewrite unknown paths to
 * index.html would 404 on the first form. The hash always works.
 */
const Admin = lazy(() => import("./admin/Admin"));

const path = window.location.pathname.replace(/\/+$/, "");
const isAdmin = path === "/admin" || window.location.hash.startsWith("#/admin");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isAdmin ? (
      <Suspense fallback={null}>
        <Admin />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
);
