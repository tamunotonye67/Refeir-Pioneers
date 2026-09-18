export type StaffRole = 'SUPER_ADMIN' | 'MANAGER' | 'SQUAD_LEAD' | 'TASK_VIEWER' | 'ADMISSIONS_REVIEWER' | 'TASK_VERIFIER';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  assigned_division: string;
  passcode: string;
  /** Optional hashed/plain password for email+password login */
  password?: string;
  status: 'ACTIVE' | 'SUSPENDED';
  reviews_count: number;
  added_at: string;
}

const STAFF_STORAGE_KEY = 'refeir_admin_staff_v1';
const ACTIVE_STAFF_SESSION_KEY = 'refeir_active_staff_session';

const DEFAULT_STAFF: StaffMember[] = [
  {
    id: 'staff-1',
    name: 'Tonye Taylor',
    email: 'tonye@refeir.com',
    role: 'SUPER_ADMIN',
    assigned_division: 'ALL',
    passcode: 'refeir2026',
    password: 'Refeir@2026!',
    status: 'ACTIVE',
    reviews_count: 84,
    added_at: '2026-01-15T00:00:00.000Z'
  },
  {
    id: 'staff-mgr',
    name: 'Nkechi Okafor',
    email: 'manager@refeir.com',
    role: 'MANAGER',
    assigned_division: 'ALL',
    passcode: 'manager2026',
    password: 'Manager@2026!',
    status: 'ACTIVE',
    reviews_count: 51,
    added_at: '2026-01-20T00:00:00.000Z'
  },
  {
    id: 'staff-2',
    name: 'Sarah Alabi',
    email: 'sarah.alabi@refeir.com',
    role: 'ADMISSIONS_REVIEWER',
    assigned_division: 'GROWTH',
    passcode: 'admit2026',
    password: 'Sarah@Admit2026',
    status: 'ACTIVE',
    reviews_count: 32,
    added_at: '2026-02-01T00:00:00.000Z'
  },
  {
    id: 'staff-3',
    name: 'Chidi Eze',
    email: 'chidi.eze@refeir.com',
    role: 'SQUAD_LEAD',
    assigned_division: 'TECH_PRODUCT',
    passcode: 'techlead26',
    password: 'Chidi@TechLead26',
    status: 'ACTIVE',
    reviews_count: 19,
    added_at: '2026-02-10T00:00:00.000Z'
  },
  {
    id: 'staff-viewer',
    name: 'Zainab Bello',
    email: 'viewer@refeir.com',
    role: 'TASK_VIEWER',
    assigned_division: 'ALL',
    passcode: 'viewer2026',
    password: 'Viewer@2026!',
    status: 'ACTIVE',
    reviews_count: 12,
    added_at: '2026-02-15T00:00:00.000Z'
  }
];

export interface StaffPermissions {
  /** Can access staff directory, add/delete/suspend workers, change passcodes */
  canManageStaff: boolean;
  /** Can review, accept, waitlist, and reject candidate applications */
  canReviewApplications: boolean;
  /** Can delete candidate applications */
  canDeleteApplications: boolean;
  /** Can verify task proofs and award milestone progression */
  canVerifyTasks: boolean;
  /** Can create and announce squad missions */
  canAnnounceTasks: boolean;
  /** Can delete squad missions */
  canDeleteTasks: boolean;
  /** Can issue official completion certificates */
  canIssueCertificates: boolean;
  /** Can revoke issued certificates */
  canRevokeCertificates: boolean;
  /** Can manually edit member tiers / levels */
  canModifyMemberTier: boolean;
  /** Can suspend or reinstate members */
  canSuspendMembers: boolean;
  /** Can view platform analytics and intelligence */
  canViewAnalytics: boolean;
  /** Whether this role is strictly read-only */
  isReadOnly: boolean;
}

export const getStaffPermissions = (role: StaffRole): StaffPermissions => {
  switch (role) {
    case 'SUPER_ADMIN':
      return {
        canManageStaff: true,
        canReviewApplications: true,
        canDeleteApplications: true,
        canVerifyTasks: true,
        canAnnounceTasks: true,
        canDeleteTasks: true,
        canIssueCertificates: true,
        canRevokeCertificates: true,
        canModifyMemberTier: true,
        canSuspendMembers: true,
        canViewAnalytics: true,
        isReadOnly: false
      };
    case 'MANAGER':
      return {
        canManageStaff: false,
        canReviewApplications: true,
        canDeleteApplications: false,
        canVerifyTasks: true,
        canAnnounceTasks: true,
        canDeleteTasks: false,
        canIssueCertificates: true,
        canRevokeCertificates: false,
        canModifyMemberTier: false,
        canSuspendMembers: true,
        canViewAnalytics: true,
        isReadOnly: false
      };
    case 'ADMISSIONS_REVIEWER':
      return {
        canManageStaff: false,
        canReviewApplications: true,
        canDeleteApplications: false,
        canVerifyTasks: false,
        canAnnounceTasks: false,
        canDeleteTasks: false,
        canIssueCertificates: false,
        canRevokeCertificates: false,
        canModifyMemberTier: false,
        canSuspendMembers: false,
        canViewAnalytics: false,
        isReadOnly: false
      };
    case 'SQUAD_LEAD':
      return {
        canManageStaff: false,
        canReviewApplications: false,
        canDeleteApplications: false,
        canVerifyTasks: true,
        canAnnounceTasks: true,
        canDeleteTasks: false,
        canIssueCertificates: false,
        canRevokeCertificates: false,
        canModifyMemberTier: false,
        canSuspendMembers: false,
        canViewAnalytics: false,
        isReadOnly: false
      };
    case 'TASK_VERIFIER':
      return {
        canManageStaff: false,
        canReviewApplications: false,
        canDeleteApplications: false,
        canVerifyTasks: true,
        canAnnounceTasks: false,
        canDeleteTasks: false,
        canIssueCertificates: false,
        canRevokeCertificates: false,
        canModifyMemberTier: false,
        canSuspendMembers: false,
        canViewAnalytics: false,
        isReadOnly: false
      };
    case 'TASK_VIEWER':
      return {
        canManageStaff: false,
        canReviewApplications: false,
        canDeleteApplications: false,
        canVerifyTasks: false,
        canAnnounceTasks: false,
        canDeleteTasks: false,
        canIssueCertificates: false,
        canRevokeCertificates: false,
        canModifyMemberTier: false,
        canSuspendMembers: false,
        canViewAnalytics: false,
        isReadOnly: true
      };
    default:
      return {
        canManageStaff: false,
        canReviewApplications: false,
        canDeleteApplications: false,
        canVerifyTasks: false,
        canAnnounceTasks: false,
        canDeleteTasks: false,
        canIssueCertificates: false,
        canRevokeCertificates: false,
        canModifyMemberTier: false,
        canSuspendMembers: false,
        canViewAnalytics: false,
        isReadOnly: true
      };
  }
};

/**
 * Returns whether a given staff role is authorized to view a specific admin tab
 */
export const isTabAuthorized = (role: StaffRole, tab: string): boolean => {
  switch (role) {
    case 'SUPER_ADMIN':
      return true; // Super Admin has access to all tabs
    case 'MANAGER':
      // Manager has access to all operations except Staff Review Team management
      return ['applications', 'proofs', 'members', 'certificates', 'tasks', 'analytics'].includes(tab);
    case 'SQUAD_LEAD':
      // Squad Lead accesses missions, task proofs, and member directory for their squad
      return ['tasks', 'proofs', 'members'].includes(tab);
    case 'TASK_VIEWER':
    case 'TASK_VERIFIER':
      // Task Viewer strictly accesses task submissions / proofs and squad missions
      return ['proofs', 'tasks'].includes(tab);
    case 'ADMISSIONS_REVIEWER':
      return ['applications', 'members'].includes(tab);
    default:
      return ['proofs', 'tasks'].includes(tab);
  }
};

export const getStaffMembers = (): StaffMember[] => {
  const data = localStorage.getItem(STAFF_STORAGE_KEY);
  if (data) {
    try {
      const parsed: StaffMember[] = JSON.parse(data);
      // Back-fill default passwords for legacy records that don't have one
      const defaults = DEFAULT_STAFF;
      const patched = parsed.map(s => {
        if (!s.password) {
          const match = defaults.find(d => d.id === s.id);
          if (match?.password) return { ...s, password: match.password };
        }
        return s;
      });
      return patched;
    } catch {
      // ignore
    }
  }
  localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(DEFAULT_STAFF));
  return DEFAULT_STAFF;
};

export const saveStaffMembers = (staff: StaffMember[]) => {
  localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staff));
};

export const addStaffMember = (input: Omit<StaffMember, 'id' | 'reviews_count' | 'added_at'>): StaffMember => {
  const all = getStaffMembers();
  const newMember: StaffMember = {
    ...input,
    id: `staff-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    reviews_count: 0,
    added_at: new Date().toISOString()
  };
  all.push(newMember);
  saveStaffMembers(all);
  return newMember;
};

export const toggleStaffStatus = (id: string): void => {
  const all = getStaffMembers();
  const updated = all.map(s => s.id === id ? { ...s, status: (s.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE') as any } : s);
  saveStaffMembers(updated);
};

export const deleteStaffMember = (id: string): void => {
  const all = getStaffMembers().filter(s => s.id !== id);
  saveStaffMembers(all);
};

/**
 * Legacy: verify by passcode (still works as fallback / master key)
 */
export const verifyStaffPasscode = (passcode: string): StaffMember | null => {
  const cleanPasscode = passcode.trim();
  // Master passcode refeir2026 always succeeds
  if (cleanPasscode === 'refeir2026') {
    const superAdmin = getStaffMembers().find(s => s.passcode === 'refeir2026');
    if (superAdmin) return superAdmin;
    return DEFAULT_STAFF[0];
  }

  const all = getStaffMembers();
  const found = all.find(s => s.passcode === cleanPasscode && s.status === 'ACTIVE');
  return found || null;
};

/**
 * Verify staff by email + password. Returns the matched StaffMember or null.
 */
export const verifyStaffEmailPassword = (email: string, password: string): StaffMember | null => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();
  if (!cleanEmail || !cleanPassword) return null;

  const all = getStaffMembers();
  const found = all.find(
    s =>
      s.email.toLowerCase() === cleanEmail &&
      s.password === cleanPassword &&
      s.status === 'ACTIVE'
  );
  return found || null;
};

/**
 * Update a staff member's password (Super Admin only).
 */
export const updateStaffPassword = (id: string, newPassword: string): void => {
  const all = getStaffMembers();
  const updated = all.map(s => s.id === id ? { ...s, password: newPassword } : s);
  saveStaffMembers(updated);
};

export const getActiveStaffSession = (): StaffMember | null => {
  const data = sessionStorage.getItem(ACTIVE_STAFF_SESSION_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const setActiveStaffSession = (staff: StaffMember | null): void => {
  if (!staff) {
    sessionStorage.removeItem(ACTIVE_STAFF_SESSION_KEY);
  } else {
    sessionStorage.setItem(ACTIVE_STAFF_SESSION_KEY, JSON.stringify(staff));
  }
};
