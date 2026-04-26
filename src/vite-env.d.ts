/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COMPANY_PHONE_DISPLAY?: string;
  readonly VITE_COMPANY_PHONE_HREF?: string;
  readonly VITE_COMPANY_PHONE_E164?: string;
  readonly VITE_COMPANY_EMAIL?: string;
  readonly VITE_COMPANY_MC_NUM?: string;
  readonly VITE_COMPANY_DOT_NUM?: string;
  readonly VITE_COMPANY_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
