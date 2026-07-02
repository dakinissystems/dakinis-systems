/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TABLETOP_API_URL?: string;
  /** Alias compatible con Finanzas (LifeFlow) */
  readonly VITE_API_URL?: string;
  /** @deprecated */
  readonly VITE_DND_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
