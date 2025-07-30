/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DAYTONA_API_KEY: string
  readonly VITE_DAYTONA_API_URL: string
  readonly VITE_DAYTONA_TARGET: string
  readonly VITE_DAYTONA_ORGANIZATION_ID: string
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 