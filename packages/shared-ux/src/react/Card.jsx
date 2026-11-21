/**
 * Card DES — contenedor semántico (surface + radius + elevation).
 * Preferir DashboardCard para KPIs Hub.
 */
export default function Card({ children, className = "", ai = false, as: Comp = "div", ...props }) {
  const cls = ["dakinis-card", ai ? "dakinis-card--ai" : "", className].filter(Boolean).join(" ");
  return (
    <Comp className={cls} {...props}>
      {children}
    </Comp>
  );
}
