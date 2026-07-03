/** Storage asset purposes — platform service (Supabase Storage / R2). */
export const STORAGE_PURPOSES = [
  { id: "asset", label: "Assets", products: ["landing", "hub", "core"] },
  { id: "media", label: "Media", products: ["streamautomator", "akoenet"] },
  { id: "document", label: "Documents", products: ["lifeflow", "core", "knowledge"] },
  { id: "export", label: "Exports", products: ["lifeflow", "core", "tabletop"] },
  { id: "avatar", label: "Avatars", products: ["akoenet", "hub", "core"] },
];

export const STORAGE_BACKENDS = ["supabase-storage", "cloudflare-r2"];
