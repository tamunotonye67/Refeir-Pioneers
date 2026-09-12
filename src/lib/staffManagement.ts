export type StaffRole = 'ADMISSIONS_REVIEWER' | 'TASK_VERIFIER' | 'SQUAD_LEAD' | 'SUPER_ADMIN';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  assigned_division: string;
  passcode: string;
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
    status: 'ACTIVE',
    reviews_count: 84,
    added_at: '2026-01-15T00:00:00.000Z'
  },
  {
    id: 'staff-2',
    name: 'Sarah Alabi',
    email: 'sarah.alabi@refeir.com',
    role: 'ADMISSIONS_REVIEWER',
    assigned_division: 'GROWTH',
    passcode: 'admit2026',
    status: 'ACTIVE',
    reviews_count: 32,
    added_at: '2026-02-01T00:00:00.000Z'
  },
  {
    id: 'staff-3',
    name: 'Chidi Eze',
    email: 'chidi.eze@refeir.com',
    role: 'SQUAD_LEAD',
    assigned_division: 'TECHNOLOGY',
    passcode: 'techlead26',
    status: 'ACTIVE',
    reviews_count: 19,
    added_at: '2026-02-10T00:00:00.000Z'
  }
];

export const getStaffMembers = (): StaffMember[] => {
  const data = localStorage.getItem(STAFF_STORAGE_KEY);
  if (data) {
    try {
      return JSON.parse(data);
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
