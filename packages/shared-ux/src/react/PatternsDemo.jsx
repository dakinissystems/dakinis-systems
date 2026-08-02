/**
 * Demo DES B4 — patrones Dashboard / Chat / Forms.
 * Ruta: /__des/patterns (solo DEV).
 */
import { useState } from "react";
import { UX_PATTERNS } from "../patterns.js";
import Button from "./Button.jsx";
import Badge from "./Badge.jsx";
import Card from "./Card.jsx";
import { DashboardCard } from "../DashboardCard.jsx";
import DashboardPattern from "./DashboardPattern.jsx";
import ChatPattern from "./ChatPattern.jsx";
import FormPattern from "./FormPattern.jsx";

export default function PatternsDemo({ className = "" }) {
  const [chatValue, setChatValue] = useState("");
  const [messages, setMessages] = useState([
    { id: "1", role: "assistant", content: "Hola — soy el patrón Chat DES.", timestamp: "ahora" },
  ]);
  const [formValues, setFormValues] = useState({ name: "", email: "" });
  const [formSuccess, setFormSuccess] = useState("");

  function sendChat(text) {
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", content: text, timestamp: "ahora" },
      {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: "Recibido. El producto pinta el acento; el layout es compartido.",
        timestamp: "ahora",
      },
    ]);
    setChatValue("");
  }

  return (
    <section className={`dakinis-des-demo ${className}`.trim()} aria-labelledby="des-patterns-title">
      <header className="dakinis-des-demo__head dakinis-motion-fade-in">
        <p className="dakinis-des-demo__kicker">DES · Experience</p>
        <h1 id="des-patterns-title">Patrones · Dashboard / Chat / Forms</h1>
        <p className="dakinis-des-demo__lead">
          Misma estructura en todos los productos; solo cambia el acento.
        </p>
      </header>

      <Card className="dakinis-des-demo__panel" style={{ marginBottom: "1.5rem" }}>
        <h2>Registro</h2>
        <ul className="dakinis-des-demo__list">
          {Object.entries(UX_PATTERNS).map(([key, entry]) => (
            <li key={key}>
              <Badge tone={entry.status === "ready" ? "success" : "warning"}>{entry.status}</Badge>{" "}
              <strong>{key}</strong> · <code>{entry.export}</code>
              {entry.note ? <> — {entry.note}</> : null}
            </li>
          ))}
        </ul>
        <p className="dakinis-des-demo__hint">
          Dashboard: {UX_PATTERNS.dashboard.sections.join(" → ")}
        </p>
      </Card>

      <div className="dakinis-des-demo__stack">
        <Card className="dakinis-des-demo__panel">
          <h2>Dashboard</h2>
          <DashboardPattern
            topbar={
              <div className="dakinis-pattern-dashboard__topbar-row">
                <strong>Mi día</strong>
                <Badge tone="accent">demo</Badge>
              </div>
            }
            widgets={
              <>
                <DashboardCard title="Ingresos" value="2.4k €" status="OK" />
                <DashboardCard title="Alertas" value="3" status="Aten." />
              </>
            }
            cards={<Card>Bloque de detalle / lista</Card>}
            quickActions={
              <>
                <Button variant="primary" size="sm">
                  Nueva
                </Button>
                <Button variant="ghost" size="sm">
                  Exportar
                </Button>
              </>
            }
          />
        </Card>

        <Card className="dakinis-des-demo__panel">
          <h2>Chat</h2>
          <ChatPattern
            messages={messages}
            value={chatValue}
            onChange={setChatValue}
            onSend={sendChat}
            footer={
              <span className="dakinis-des-demo__hint">IA = purple soft · CTA producto = accent</span>
            }
          />
        </Card>

        <Card className="dakinis-des-demo__panel">
          <h2>Form</h2>
          <FormPattern
            title="Datos de contacto"
            description="Campos semánticos · validación vía props error/success."
            fields={[
              { name: "name", label: "Nombre", required: true },
              { name: "email", label: "Email", type: "email", required: true },
            ]}
            values={formValues}
            onChange={(name, value) => {
              setFormSuccess("");
              setFormValues((v) => ({ ...v, [name]: value }));
            }}
            onSubmit={() => setFormSuccess("Guardado (demo).")}
            success={formSuccess}
            secondaryLabel="Cancelar"
            onSecondary={() => {
              setFormValues({ name: "", email: "" });
              setFormSuccess("");
            }}
          />
        </Card>
      </div>
    </section>
  );
}
