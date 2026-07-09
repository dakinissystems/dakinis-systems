# ADR-008 — Hub como punto de entrada

## Contexto

Dakinis tiene varios productos (Core, LifeFlow, AkoeNet, StreamAutomator). Sin un punto de entrada único, cada producto compite por la atención del usuario y duplica login, navegación y contexto de workspace.

## Decisión

**Hub** (`hub.dakinissystems.com`) es la experiencia de entrada tras autenticación. Los productos son aplicaciones lanzadas desde Hub (SSO), no destinos independientes en el journey principal.

El usuario piensa en **workspace** (empresa), no en apps sueltas. Hub expone Mi día, administración (`/admin`) y launcher; Core es un producto más bajo Hub.

## Consecuencias

- Marketing y demo empiezan en Hub, no en Core.
- Internal API centraliza dashboard y workspace admin para Hub.
- Nuevos productos se registran en launcher + `hub.tenant_product_access`, no en landing separada.
- Visión UX Hub → [`HUB-WORKSPACE.md`](../HUB-WORKSPACE.md).
