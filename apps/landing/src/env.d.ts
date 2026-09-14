/// <reference types="astro/client" />

// `interface` is required for declaration merging: type aliases cannot
// augment Astro/Vite's global `ImportMetaEnv` / `ImportMeta` types.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- declaration merging requires an interface
interface ImportMetaEnv {
  /** URL base del ERP (portal de pacientes). Override por entorno. */
  readonly PUBLIC_ERP_URL?: string;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- declaration merging requires an interface
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
