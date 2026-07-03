import AppShell from "./AppShell.jsx";
import { HUB_DASHBOARD_SECTIONS } from "../../shared-ux/src/hub-dashboard.js";

/**
 * AppShell preconfigurado para Dakinis Hub — producto hub, secciones Mi día primero.
 */
export default function HubShell({
  sidebar,
  header,
  children,
  commandPalette,
  notifications,
  search,
  ...props
}) {
  const defaultSidebar = sidebar ?? (
    <nav className="dakinis-hub-nav" aria-label="Hub">
      <ul className="dakinis-hub-nav__list">
        {HUB_DASHBOARD_SECTIONS.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} className="dakinis-hub-nav__link">
              {s.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <AppShell
      product="hub"
      sidebar={defaultSidebar}
      header={header}
      commandPalette={commandPalette}
      notifications={notifications}
      search={search}
      {...props}
    >
      {children}
    </AppShell>
  );
}
