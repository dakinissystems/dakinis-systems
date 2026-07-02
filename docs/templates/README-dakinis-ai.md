# Dakinis AI

**Shared AI platform** for the Dakinis ecosystem — agents, RAG, chat gateway, OCR and embeddings workers.

Production: [ai.dakinissystems.com](https://ai.dakinissystems.com)

---

## Role

AI is **platform**, not part of Core. All products consume it:

| Consumer | Agent / use |
|----------|-------------|
| Core | `core-advisor`, Copilot |
| LifeFlow | Financial coach (Pro) |
| Hub | Cross-product summaries |
| Future products | Agent registry |

---

## Stack

- API + BullMQ workers on Railway
- Redis for queues (shared plugin — future: Notifications, Search workers)
- Supabase schema `ai`
- Internal routes via Gateway `/ai/`

---

## Related

- DES AI components: `@dakinis/shared-ux/react/Ai*.jsx` in [dakinis-shared](https://github.com/dakinissystems/dakinis-shared)
- Architecture: [dakinis-systems](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/ARCHITECTURE.md)
