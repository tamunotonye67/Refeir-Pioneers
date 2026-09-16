import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key'
);

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

export interface SupabaseHealthStatus {
  isConfigured: boolean;
  connected: boolean;
  latencyMs?: number;
  message: string;
  projectUrl?: string;
  error?: string;
  tablesFound?: {
    applications: boolean;
    profiles: boolean;
    tasks: boolean;
    proofOfWork: boolean;
    certificates: boolean;
    staff: boolean;
  };
}

export type SupabaseDiagnostics = SupabaseHealthStatus;

export const checkSupabaseConnection = async (): Promise<SupabaseHealthStatus> => {
  if (!isSupabaseConfigured) {
    return {
      isConfigured: false,
      connected: false,
      message: 'Supabase credentials not detected in .env (Running on local reactive storage engine).'
    };
  }

  const startTime = performance.now();
  try {
    // 1. Quick probe query on pioneer_applications
    const { data: appData, error: appError } = await supabase
      .from('pioneer_applications')
      .select('count', { count: 'exact', head: true });

    const latencyMs = Math.round(performance.now() - startTime);

    if (appError) {
      // If table doesn't exist yet (PGRST205 / 42P01 error code)
      if (appError.code === '42P01' || appError.message?.includes('does not exist')) {
        return {
          isConfigured: true,
          connected: true,
          latencyMs,
          message: 'Connected to Supabase project, but tables are not yet created. Run schema.sql in Supabase SQL Editor.',
          projectUrl: supabaseUrl
        };
      }
      return {
        isConfigured: true,
        connected: false,
        latencyMs,
        message: `Connection error: ${appError.message}`,
        projectUrl: supabaseUrl
      };
    }

    // 2. Probe remaining tables
    const [profRes, taskRes, powRes, certRes, staffRes] = await Promise.all([
      supabase.from('contributor_profiles').select('count', { count: 'exact', head: true }),
      supabase.from('squad_tasks').select('count', { count: 'exact', head: true }),
      supabase.from('pioneer_proof_of_work').select('count', { count: 'exact', head: true }),
      supabase.from('pioneer_certificates').select('count', { count: 'exact', head: true }),
      supabase.from('staff_members').select('count', { count: 'exact', head: true })
    ]);

    return {
      isConfigured: true,
      connected: true,
      latencyMs,
      message: 'Successfully connected to live Supabase PostgreSQL database.',
      projectUrl: supabaseUrl,
      tablesFound: {
        applications: !appError,
        profiles: !profRes.error,
        tasks: !taskRes.error,
        proofOfWork: !powRes.error,
        certificates: !certRes.error,
        staff: !staffRes.error
      }
    };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - startTime);
    return {
      isConfigured: true,
      connected: false,
      latencyMs,
      message: err?.message || 'Network error connecting to Supabase endpoint.',
      projectUrl: supabaseUrl
    };
  }
};