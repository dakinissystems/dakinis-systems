# @dakinis/desktop-runtime

Client-side **Desktop Runtime** for Dakinis Workspace — layout load/save via Internal API.

## Implemented (AkoeNet Client)

| Module | Path |
|--------|------|
| Layout API client | `apps/akoenet/Client/src/workspace/desktopRuntime/layoutApi.js` |
| Profile → window merge | `layoutMerge.js` |
| React hook | `useDesktopLayout.js` |

## API (AkoeNet backend proxy)

```
GET  /workspace/desktop/profiles
GET  /workspace/desktop/layout/:addonId?profileKey=
PUT  /workspace/desktop/layout/:addonId  { profileKey?, windows: [{ id, rect, visible }] }
```

Internal API (service key):

```
GET  /internal/workspaces/me/:userId/desktop/profiles
GET  /internal/workspaces/me/:userId/desktop/layout/:addonId
PUT  /internal/workspaces/me/:userId/desktop/layout/:addonId
```

Persisted in `meta.workspace_desktop_profiles.window_state.addons[addonId].windows`.

## Fallback

localStorage (`dmp_window_layout_v1`) when Internal API is unavailable.

## Related

- [`DESKTOP-RUNTIME.md`](../../docs/DESKTOP-RUNTIME.md)
- [`seed_workspace_desktop_profiles.sql`](../../../docs/supabase/scripts/seed_workspace_desktop_profiles.sql)
