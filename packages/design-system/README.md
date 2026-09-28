# @dakinis/design-system

Versioned entry point for the Dakinis Experience System (DES).

```json
"@dakinis/design-system": "^1.0.0"
```

Use this package from Hub, Core, StreamAutomator, and AkoeNet instead of vendoring token trees. Local copies in app repos should be refreshed via `scripts/sync-hub-des.ps1` (or product-specific sync) from this source of truth.

## Layers

| Export | Role |
|--------|------|
| `.` | Full DES re-export + meta |
| `./tokens` | Token contract |
| `./themes` | Theme / product accents |
| `./components` | Platform UI vs Product UI split |
| `./layouts` | Shell metadata |
| `./patterns` | Official UX patterns |
| `./ui-states` | Loading / empty / error vocabulary |

## Versioning

- **1.0.x** — façade + contracts (current)
- **1.1+** — token consolidation (retire `--nexora-*` / dual `.dark` forks)
- Breaking visual contracts → major bump
