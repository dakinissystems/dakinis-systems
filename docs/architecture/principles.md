# Principios de arquitectura — Dakinis Platform

> Reglas estables · no implementación · ago 2026  
> Índice → [`README.md`](./README.md)

Cualquier PR de dominio Hospitality / CRM / Connectors debe poder justificarse contra esta lista.

---

## Principios

1. **No lógica de negocio en Providers**  
   Un connector importa, normaliza y sincroniza estado externo. Crear pedidos, precios, stock y facturas viven en el core / dominio.

2. **No `if (channel === "…")` en servicios de dominio**  
   El polimorfismo va por Registry + Provider. OrderService no conoce Glovo.

3. **Todo Connector es intercambiable**  
   Se añade con `register(provider)`. Sin tocar el orquestador más allá del registro.

4. **Toda integración es idempotente**  
   Clave mínima: `provider + external_id` (u equivalente). Webhooks duplicados no duplican negocio.

5. **Todo módulo consume eventos**  
   CRM, WhatsApp, Analytics, Delivery sync — reaccionan al Event Bus, no se llaman en cadena síncrona salvo necesidad dura.

6. **No polling redundante**  
   Un pulse / un fetch por concern. Sin bucles de render que re-disparen red. Roadmap: SSE → WebSocket.

7. **Shell ≠ Producto**  
   Dock, Header, Pulse, Deep links y Command Palette son infraestructura reusable. Los módulos son dominio.

8. **CRM no depende de Hospitality**  
   El sentido de dependencia es Hospitality → CRM (consume), nunca al revés.

9. **Resiliencia declarada en Connectors**  
   Timeout, retries, circuit breaker, rate limit, health y telemetría son parte del contrato — no implícitos.

10. **Config no es un cajón**  
    Parámetros estables vs operación vs integraciones. Evolucionar taxonomía; no acumular pantallas sueltas.

11. **Command Palette es infraestructura**  
    Toda capacidad nueva se pregunta: ¿aparece en Ctrl+K?

12. **Documentar decisiones, no el diario**  
    ADR = por qué. Changelog / STATUS = qué pasó ayer.
