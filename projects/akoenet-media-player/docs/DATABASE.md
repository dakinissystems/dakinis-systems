# Base de datos — Media Player

Schema propuesto: **`akoenet`** (extensión) o **`media`** (schema dedicado).

Migración futura: `supabase/migrations/0xx_akoenet_media_player.sql`

---

## Tablas

### `media.tracks`

Metadatos; el binario vive en storage del usuario o URL externa.

| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid PK | |
| owner_user_id | uuid FK → dakinis_auth.users | |
| title | text | |
| artist | text | |
| album | text | |
| duration_ms | int | |
| source_type | enum | `local`, `url`, `jellyfin`, `radio` |
| source_ref | text | path, external id, stream url |
| cover_url | text | nullable |
| created_at | timestamptz | |

### `media.playlists`

| Columna | Tipo |
|---------|------|
| id | uuid PK |
| user_id | uuid FK |
| name | text |
| is_public | boolean default false |
| created_at | timestamptz |

### `media.playlist_tracks`

| Columna | Tipo |
|---------|------|
| playlist_id | uuid FK |
| track_id | uuid FK |
| position | int |
| PK | (playlist_id, track_id) |

### `media.favorites`

| user_id | track_id | PK compuesta |

### `media.skins`

| Columna | Tipo |
|---------|------|
| id | uuid PK |
| slug | text unique |
| name | text |
| author_user_id | uuid nullable |
| manifest | jsonb |
| package_url | text |
| marketplace_listed | boolean |

### `media.listening_rooms`

| Columna | Tipo |
|---------|------|
| id | uuid PK |
| owner_user_id | uuid |
| akoenet_server_id | bigint nullable |
| akoenet_channel_id | bigint nullable |
| current_track_id | uuid nullable |
| position_ms | int default 0 |
| is_playing | boolean |
| updated_at | timestamptz |

### `media.room_members`

| room_id | user_id | role (`leader` \| `follower`) | PK |

---

## Índices sugeridos

- `tracks(owner_user_id, created_at desc)`
- `playlist_tracks(playlist_id, position)`
- `listening_rooms(akoenet_server_id, akoenet_channel_id)`

SQL ejecutable: [../database/schema.sql](../database/schema.sql)
