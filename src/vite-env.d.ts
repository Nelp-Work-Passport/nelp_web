/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Where the Nelp API is. Defaults to http://localhost:8000. */
  readonly VITE_API_URL?: string
  /** Shows the development role chip above each page. */
  readonly VITE_SHOW_ROLE_CHIP?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
