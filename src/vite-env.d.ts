/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Shows the development role chip above each page. */
  readonly VITE_SHOW_ROLE_CHIP?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
