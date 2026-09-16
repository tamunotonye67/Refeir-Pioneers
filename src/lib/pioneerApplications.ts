import { supabase, isSupabaseConfigured } from './supabase';

export type PioneerReviewStatus = 'PENDING' | 'REVIEWING' | 'ACCEPTED' | 'WAITLISTED' | 'REJECTED';
export type ContributorTier = 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4' | 'LEVEL_5';

export interface PioneerApplicationRecord {
  id: string;
  application_number: string;
  full_name: string;
  email: string;
  whatsapp_number: string;
  country: string;
  city?: string | null;
  roles: string[];
  skills?: string | null;
  portfolio_url?: string | null;
  primary_division?: string | null;
  contribution?: string | null;
  availability?: string | null;
  motivation?: string | null;
  learning_goals?: string | null;
  discovery_source?: string | null;
  status: PioneerReviewStatus;
  contributor_level?: ContributorTier;
  is_founding_100: boolean;
  pioneer_id?: string | null;
  acceptance_code?: string | null;
  account_created?: boolean;
  internal_notes?: string | null;
  created_at: string;
}

const APPS_STORAGE_KEY = 'refeir_pioneer_applications_v2';

// Seed demo applications with Acceptance Codes for ACCEPTED members
export const INITIAL_DEMO_APPLICATIONS: PioneerApplicationRecord[] = [
  {
    id: 'app-demo-1',
    application_number: 'RP-2026-849201',
    full_name: 'Chidubem Nwosu',
    email: 'chidubem.nwosu@example.com',
    whatsapp_number: '+2348031234567',
    country: 'Nigeria',
    city: 'Lagos',
    roles: ['Developer', 'Product'],
    skills: 'TypeScript, React, Node.js, Smart Contract Escrows, PostgreSQL',
    portfolio_url: 'https://github.com/chidubem-demo',
    primary_division: 'TECH_PRODUCT',
    contribution: 'Want to build and audit the smart contract milestone escrow system.',
    availability: '6–10 hours/week',
    motivation: 'Africa needs decentralized trust infrastructure to unlock cross-border freelance payouts.',
    learning_goals: 'Deep dive into decentralized referral loops and tokenomics.',
    discovery_source: 'Twitter / X',
    status: 'ACCEPTED',
    contributor_level: 'LEVEL_3',
    is_founding_100: true,
    pioneer_id: 'RP-012',
    acceptance_code: 'ACC-8492-9041',
    account_created: false,
    internal_notes: 'Strong fullstack candidate. Approved for Tech & Product squad. Delivered smart escrow contract tests.',
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    id: 'app-demo-2',
    application_number: 'RP-2026-612948',
    full_name: 'Amina Kimani',
    email: 'amina.k@example.com',
    whatsapp_number: '+254712345678',
    country: 'Kenya',
    city: 'Nairobi',
    roles: ['Designer'],
    skills: 'Figma, UI/UX, Design Systems, Mobile Interaction Design',
    portfolio_url: 'https://dribbble.com/amina-demo',
    primary_division: 'CREATIVE',
    contribution: 'Crafting the mobile app UI component library and freelancer profile screens.',
    availability: '3–5 hours/week',
    motivation: 'Excited about shaping the visual identity and usability of Refeir.',
    learning_goals: 'Leading design critique sessions with fellow African designers.',
    discovery_source: 'LinkedIn',
    status: 'ACCEPTED',
    contributor_level: 'LEVEL_2',
    is_founding_100: true,
    pioneer_id: 'RP-028',
    acceptance_code: 'ACC-6129-3319',
    account_created: false,
    internal_notes: 'High-quality portfolio. Submitted pioneer mobile design mocks.',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: 'app-demo-3',
    application_number: 'RP-2026-492019',
    full_name: 'Kwame Mensah',
    email: 'kwame.mensah@example.com',
    whatsapp_number: '+233241234567',
    country: 'Ghana',
    city: 'Accra',
    roles: ['Marketer', 'Community Builder'],
    skills: 'Viral loops, Campus Ambassador Growth, Content Strategy',
    portfolio_url: 'https://linkedin.com/in/kwame-demo',
    primary_division: 'GROWTH',
    contribution: 'Setting up campus developer chapters across University of Ghana and KNUST.',
    availability: '6–10 hours/week',
    motivation: 'I run a 5,000+ member student tech community eager for verified freelance opportunities.',
    learning_goals: 'Mastering platform referral economics and community scaling.',
    discovery_source: 'WhatsApp Community',
    status: 'ACCEPTED',
    contributor_level: 'LEVEL_2',
    is_founding_100: false,
    pioneer_id: 'RP-045',
    acceptance_code: 'ACC-4920-7712',
    account_created: true,
    internal_notes: 'Promoted to Level 2 based on campus ambassador chapters launched.',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    id: 'app-demo-4',
    application_number: 'RP-2026-728193',
    full_name: 'Thabo Mokoena',
    email: 'thabo.m@example.com',
    whatsapp_number: '+27821234567',
    country: 'South Africa',
    city: 'Johannesburg',
    roles: ['Business Developer', 'Entrepreneur'],
    skills: 'B2B Sales, Fintech Partnerships, Legal Frameworks',
    portfolio_url: 'https://linkedin.com/in/thabo-demo',
    primary_division: 'BUSINESS',
    contribution: 'Connecting Refeir with South African venture studios and tech agencies for pilot jobs.',
    availability: '3–5 hours/week',
    motivation: 'Refeir’s referral model solves the trust deficit between foreign clients and African talent.',
    learning_goals: 'Exploring cross-border fiat-to-stablecoin rails.',
    discovery_source: 'TechCabal Article',
    status: 'PENDING',
    contributor_level: 'LEVEL_1',
    is_founding_100: false,
    pioneer_id: null,
    acceptance_code: null,
    account_created: false,
    internal_notes: '',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString()
  }
];

export const generateAcceptanceCode = (appNumber: string): string => {
  const digits = appNumber.replace(/\D/g, '').slice(-4) || '2026';
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ACC-${digits}-${rand}`;
};

export const getStoredApplications = (): PioneerApplicationRecord[] => {
  const raw = localStorage.getItem(APPS_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // fallback
    }
  }
  localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_APPLICATIONS));
  return INITIAL_DEMO_APPLICATIONS;
};

export const saveStoredApplications = (apps: PioneerApplicationRecord[]): void => {
  localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(apps));
  window.dispatchEvent(new Event('refeir-applications-change'));
};

export const addStoredApplication = (app: Omit<PioneerApplicationRecord, 'id' | 'created_at'>): PioneerApplicationRecord => {
  const apps = getStoredApplications();
  const newApp: PioneerApplicationRecord = {
    ...app,
    id: `app-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    created_at: new Date().toISOString()
  };
  apps.unshift(newApp);
  saveStoredApplications(apps);

  if (isSupabaseConfigured) {
    supabase
      .from('pioneer_applications')
      .insert([newApp])
      .then(({ error }) => {
        if (error) console.warn('Supabase application insert warning:', error.message);
      });
  }

  return newApp;
};

export const updateStoredApplication = (
  idOrAppNumber: string,
  updates: Partial<PioneerApplicationRecord>
): PioneerApplicationRecord | null => {
  const apps = getStoredApplications();
  let updatedApp: PioneerApplicationRecord | null = null;

  const modified = apps.map(app => {
    if (app.id === idOrAppNumber || app.application_number.toUpperCase() === idOrAppNumber.toUpperCase()) {
      // If updating status to ACCEPTED and no acceptance code exists, auto-generate one
      let accCode = updates.acceptance_code !== undefined ? updates.acceptance_code : app.acceptance_code;
      if (updates.status === 'ACCEPTED' && !accCode) {
        accCode = generateAcceptanceCode(app.application_number);
      }

      // If status is ACCEPTED and no pioneer_id exists, auto-assign next available seat
      let pId = updates.pioneer_id !== undefined ? updates.pioneer_id : app.pioneer_id;
      if (updates.status === 'ACCEPTED' && !pId) {
        const existingSeats = apps.map(a => a.pioneer_id).filter(Boolean) as string[];
        const numbers = existingSeats.map(s => {
          const match = s.match(/RP-(\d+)/i);
          return match ? parseInt(match[1], 10) : 0;
        });
        const maxNum = numbers.length > 0 ? Math.max(...numbers, 45) : 45;
        pId = `RP-${String(maxNum + 1).padStart(3, '0')}`;
      }

      updatedApp = {
        ...app,
        ...updates,
        acceptance_code: accCode,
        pioneer_id: pId
      };
      return updatedApp;
    }
    return app;
  });

  if (updatedApp) {
    saveStoredApplications(modified);

    if (isSupabaseConfigured) {
      supabase
        .from('pioneer_applications')
        .update(updatedApp)
        .eq('application_number', (updatedApp as PioneerApplicationRecord).application_number)
        .then(({ error }) => {
          if (error) console.warn('Supabase application update warning:', error.message);
        });
    }
  }
  return updatedApp;
};

export const findApplicationByLookup = (query: string): PioneerApplicationRecord | null => {
  const clean = query.trim().toLowerCase();
  if (!clean) return null;
  const apps = getStoredApplications();
  return apps.find(a =>
    a.application_number.toLowerCase() === clean ||
    a.email.toLowerCase() === clean
  ) || null;
};

export const validateAcceptanceCredentials = (
  applicationNumber: string,
  acceptanceCode: string,
  _pioneerId?: string
): { valid: boolean; error?: string; application?: PioneerApplicationRecord } => {
  const cleanAppNum = applicationNumber.trim().toUpperCase();
  const cleanAccCode = acceptanceCode.trim().toUpperCase();

  if (!cleanAppNum) {
    return { valid: false, error: 'Application ID is required.' };
  }
  if (!cleanAccCode) {
    return { valid: false, error: 'Acceptance Code is required.' };
  }

  const apps = getStoredApplications();
  const app = apps.find(a => a.application_number.toUpperCase() === cleanAppNum);

  if (!app) {
    return {
      valid: false,
      error: `No application found for ID "${cleanAppNum}". Please verify your Application ID.`
    };
  }

  if (app.status !== 'ACCEPTED') {
    return {
      valid: false,
      error: `Application ${cleanAppNum} is currently ${app.status}. You cannot sign up until your application has been officially ACCEPTED by the Admissions Committee.`
    };
  }

  if (!app.acceptance_code || app.acceptance_code.trim().toUpperCase() !== cleanAccCode) {
    return {
      valid: false,
      error: `The Acceptance Code provided is invalid for Application ${cleanAppNum}. Please check your acceptance letter or use the "Check Status" tool.`
    };
  }

  return { valid: true, application: app };
};

export const generateNextPioneerId = (): string => {
  const apps = getStoredApplications();
  let maxId = 50;
  for (const a of apps) {
    if (a.pioneer_id && a.pioneer_id.startsWith('RP-')) {
      const num = parseInt(a.pioneer_id.replace('RP-', ''), 10);
      if (!isNaN(num) && num > maxId) {
        maxId = num;
      }
    }
  }
  const nextNum = maxId + 1;
  return `RP-${String(nextNum).padStart(3, '0')}`;
};

/**
 * Fetches applications from Supabase if configured, and updates local cache.
 */
export const fetchApplicationsFromDatabase = async (): Promise<PioneerApplicationRecord[]> => {
  if (!isSupabaseConfigured) {
    return getStoredApplications();
  }

  try {
    const { data, error } = await supabase
      .from('pioneer_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      saveStoredApplications(data as PioneerApplicationRecord[]);
      return data as PioneerApplicationRecord[];
    }
  } catch (err) {
    console.warn('Could not query Supabase pioneer_applications, falling back to local storage:', err);
  }

  return getStoredApplications();
};

/**
 * Pushes all locally stored applications to Supabase (useful for seeding fresh Supabase instance).
 */
export const syncApplicationsToSupabase = async (): Promise<{ success: boolean; count: number; error?: string }> => {
  if (!isSupabaseConfigured) {
    return { success: false, count: 0, error: 'Supabase is not configured. Add credentials to .env' };
  }

  const apps = getStoredApplications();
  try {
    const { error } = await supabase
      .from('pioneer_applications')
      .upsert(apps, { onConflict: 'application_number' });

    if (error) {
      return { success: false, count: 0, error: error.message };
    }

    return { success: true, count: apps.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || 'Sync failed' };
  }
};
