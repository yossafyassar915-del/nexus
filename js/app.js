// app.js — Dashboard page bootstrap.
// Loads the shared layout (sidebar/header/AI widget) plus the dashboard's
// own components and data, and wires up the voice widget. This demo build
// has no authentication — the dashboard loads immediately.
//
// NOTE: fetch() of local components/*.html requires the site to be served
// over http (e.g. `python -m http.server 5500`, or GitHub Pages itself)
// rather than opened as a file://.
import { loadLayout, loadComponent } from "./layout.js";
import { initDashboardData } from "./charts.js";
import { initAiWidget } from "./ai_widget.js";

async function bootstrap() {
  await loadLayout();
  await loadComponent("opportunities-slot", "components/crm_table.html");

  await initDashboardData();
  initAiWidget();
}

document.addEventListener("DOMContentLoaded", bootstrap);
