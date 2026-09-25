declare namespace NodeJS {
  interface ProcessEnv {
    readonly NEXT_PUBLIC_SUPABASE_URL: string;
    readonly NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: string;
    readonly SUPABASE_SERVICE_ROLE_KEY: string;
    readonly TMDB_READ_TOKEN: string;
    readonly AI_MODEL?: string;
  }
}
