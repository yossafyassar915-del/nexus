// layout.js — shared shell logic used by every page (dashboard, CRM, ERP).
// Loads the sidebar, header, and AI widget HTML fragments into their slots.
// There is no authentication in this demo build — every page is open by
// default, so this just loads the shell and wires the demo-only controls.
import { db } from "./db.js";

export async function loadComponent(targetId, path) {
  const target = document.getElementById(targetId);
  if (!target) return;
  const res = await fetch(path);
  target.innerHTML = await res.text();
}

export async function loadLayout() {
  await Promise.all([
    loadComponent("sidebar-slot", "components/sidebar.html"),
    loadComponent("header-slot", "components/header.html"),
    loadComponent("ai-widget-slot", "components/ai_widget.html"),
  ]);
  highlightActiveNavLink();
  wireResetButton();
}

function highlightActiveNavLink() {
  const page = window.location.pathname.split("/").pop() || "index.html";
  const hash = window.location.hash.replace("#", "");
  document.querySelectorAll(".sidebar__link").forEach((link) => {
    const href = link.getAttribute("href") || "";
    const matches =
      (page === "index.html" && href.includes("index.html") && !href.includes("#")) ||
      (hash && href.includes(hash));
    link.classList.toggle("is-active", matches);
  });
}

function wireResetButton() {
  const btn = document.getElementById("reset-demo-btn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const confirmed = window.confirm(
      "Reset all demo data back to the original sample data? Anything you've added or changed will be lost."
    );
    if (!confirmed) return;
    db.resetAll();
    window.location.reload();
  });
}
