import { useEffect, useState } from "react";
import { applyDesTheme } from "../../shared-brand/src/themes.js";
import "./AppShell.css";

/**
 * Shell oficial Dakinis — mismo esqueleto en Core, LifeFlow, Hub, etc.
 * Solo cambia el acento de producto (data-product).
 */
export default function AppShell({
  product = "core",
  theme = "dark",
  sidebar,
  header,
  footer,
  notifications,
  commandPalette,
  search,
  children,
  className = "",
  sidebarOpen = false,
  onSidebarToggle,
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [prevSidebarOpen, setPrevSidebarOpen] = useState(sidebarOpen);
  if (sidebarOpen !== prevSidebarOpen) {
    setPrevSidebarOpen(sidebarOpen);
    setInternalOpen(sidebarOpen);
  }
  const open = onSidebarToggle ? sidebarOpen : internalOpen;

  useEffect(() => {
    applyDesTheme({ product, theme });
  }, [product, theme]);

  const toggleSidebar = () => {
    const next = !open;
    if (onSidebarToggle) {
      onSidebarToggle(next);
    } else {
      setInternalOpen(next);
    }
  };

  const shellClass = [
    "dakinis-shell",
    open ? "dakinis-shell--sidebar-open" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={shellClass} data-product={product} data-theme={theme}>
      <a href="#dakinis-main" className="dakinis-shell__skip">
        Saltar al contenido
      </a>

      {sidebar ? (
        <aside className="dakinis-shell__sidebar" aria-label="Navegación principal">
          {sidebar}
        </aside>
      ) : null}

      <div className="dakinis-shell__main">
        <header className="dakinis-shell__header">
          {header ?? (
            <div className="dakinis-shell__header-inner">
              <button
                type="button"
                className="dakinis-shell__menu-btn"
                onClick={toggleSidebar}
                aria-expanded={open}
                aria-label="Abrir menú"
              >
                ☰
              </button>
              {search ? <div className="dakinis-shell__search">{search}</div> : null}
              <div className="dakinis-shell__header-actions">
                {notifications}
                {commandPalette}
              </div>
            </div>
          )}
        </header>

        <main id="dakinis-main" className="dakinis-shell__content" tabIndex={-1}>
          {children}
        </main>

        {footer ? <footer className="dakinis-shell__footer">{footer}</footer> : null}
      </div>
    </div>
  );
}

export function DashboardTemplate({
  topbar,
  widgets,
  cards,
  timeline,
  quickActions,
  ...shellProps
}) {
  return (
    <AppShell {...shellProps}>
      <div className="dakinis-dashboard">
        {topbar ? <section className="dakinis-dashboard__topbar">{topbar}</section> : null}
        {widgets ? <section className="dakinis-dashboard__widgets">{widgets}</section> : null}
        {cards ? <section className="dakinis-dashboard__cards">{cards}</section> : null}
        {timeline ? <section className="dakinis-dashboard__timeline">{timeline}</section> : null}
        {quickActions ? (
          <section className="dakinis-dashboard__actions">{quickActions}</section>
        ) : null}
      </div>
    </AppShell>
  );
}
