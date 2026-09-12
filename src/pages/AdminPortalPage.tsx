import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield, Search, Filter, CheckCircle2, Clock, XCircle, AlertCircle,
  ExternalLink, Download, MessageSquare, Mail, RefreshCw, UserCheck,
  ChevronDown, Edit3, Save, Lock, LogOut, ArrowRight, Star,
  Image as ImageIcon, Award, Eye, Check, FileCheck, Users,
  UserPlus, Trash2, Key, EyeOff, Copy, Ban, UserX, Calendar,
  Building2, Globe, Phone, Send, AtSign, Share2, Briefcase,
  AlertTriangle, Brain, Gift, Zap, Megaphone, PlusCircle, Radio, DollarSign
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  TaskSubmissionRecord,
  getTaskSubmissions,
  updateTaskSubmissionStatus,
  MIN_JOBS_FOR_PROMOTION
} from '../lib/taskSubmissions';
import {
  updateContributorLevel,
  getAllContributors,
  suspendContributor,
  activateContributor,
  ContributorProfile
} from '../lib/contributorAuth';
import {
  PioneerApplicationRecord,
  getStoredApplications,
  generateAcceptanceCode,
  updateStoredApplication
} from '../lib/pioneerApplications';
import {
  StaffMember,
  StaffRole,
  getStaffMembers,
  addStaffMember,
  toggleStaffStatus,
  deleteStaffMember,
  verifyStaffPasscode,
  getActiveStaffSession,
  setActiveStaffSession
} from '../lib/staffManagement';
import {
  PioneerCertificate,
  getAllCertificates,
  issueCertificate,
  revokeCertificate,
  getCertificatesByEmail,
  LEVEL_NAMES,
  LEVEL_DESCRIPTIONS
} from '../lib/certificates';
import { CertificateModal } from '../components/CertificateModal';
import {
  SquadTask,
  SquadDivision,
  BountyType,
  TaskFrequency,
  SQUAD_INFO,
  getAllSquadTasks,
  createSquadTask,
  deleteSquadTask,
  toggleTaskStatus,
  generateWhatsAppBroadcast,
  openWhatsAppShare
} from '../lib/squadTasks';
import {
  RF_DEEP_GREEN,
  RF_DARK_GREEN,
  RF_FOREST_DARK,
  RF_LEAF_GREEN,
  RF_MINT_ACCENT,
  RF_GOLD_YELLOW,
  RF_ORANGE
} from '../constants/brand';

interface AdminPortalPageProps {
  onNavigate: (path: string) => void;
}

export type ReviewStatus = 'PENDING' | 'REVIEWING' | 'ACCEPTED' | 'WAITLISTED' | 'REJECTED';
export type ContributorTier = 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4' | 'LEVEL_5';

export interface ApplicationRecord {
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
  status: ReviewStatus;
  contributor_level?: ContributorTier;
  is_founding_100: boolean;
  pioneer_id?: string | null;
  acceptance_code?: string | null;
  account_created?: boolean;
  internal_notes?: string | null;
  created_at: string;
}

const DEFAULT_PASSCODE = 'refeir2026';

// Realistic sample applications for preview when no live database records exist
const DEMO_APPLICATIONS: ApplicationRecord[] = [
  {
    id: 'demo-1',
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
    internal_notes: 'Strong fullstack candidate. Approved for Tech & Product squad. Delivered smart escrow contract tests.',
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    id: 'demo-2',
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
    internal_notes: 'High-quality portfolio. Submitted pioneer mobile design mocks.',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: 'demo-3',
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
    status: 'PENDING',
    contributor_level: 'LEVEL_1',
    is_founding_100: false,
    pioneer_id: null,
    internal_notes: '',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    id: 'demo-4',
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
    is_founding_100: false,
    pioneer_id: null,
    internal_notes: '',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString()
  }
];

export const AdminPortalPage: React.FC<AdminPortalPageProps> = ({ onNavigate }) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('refeir_admin_auth') === 'true';
  });
  const [loggedInStaff, setLoggedInStaff] = useState<StaffMember | null>(() => getActiveStaffSession());
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // Data & Management State
  const [adminTab, setAdminTab] = useState<'applications' | 'proofs' | 'members' | 'workers' | 'certificates' | 'tasks'>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab')?.toLowerCase();
      if (tabParam === 'tasks' || tabParam === 'squad-tasks' || tabParam === 'bounties') return 'tasks';
      if (tabParam === 'proofs') return 'proofs';
      if (tabParam === 'members') return 'members';
      if (tabParam === 'workers') return 'workers';
      if (tabParam === 'certificates') return 'certificates';
    } catch {}
    return 'applications';
  });
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [taskSubmissions, setTaskSubmissions] = useState<TaskSubmissionRecord[]>([]);
  const [membersList, setMembersList] = useState<ContributorProfile[]>(() => getAllContributors());
  const [certificatesList, setCertificatesList] = useState<PioneerCertificate[]>(() => getAllCertificates());
  const [selectedCertificateForModal, setSelectedCertificateForModal] = useState<PioneerCertificate | null>(null);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [issueCertModalOpen, setIssueCertModalOpen] = useState(false);
  const [issueCertMemberEmail, setIssueCertMemberEmail] = useState('');
  const [issueCertLevel, setIssueCertLevel] = useState<ContributorTier>('LEVEL_1');
  const [issueCertDistinction, setIssueCertDistinction] = useState('Founding Pioneer Accreditations & Verified Proof-of-Work Deliverables');
  const [certSearchTerm, setCertSearchTerm] = useState('');
  const [certLevelFilter, setCertLevelFilter] = useState('ALL');
  const [certStatusFilter, setCertStatusFilter] = useState<'ALL' | 'ISSUED' | 'REVOKED'>('ALL');
  const [certFeedbackMsg, setCertFeedbackMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeApp, setActiveApp] = useState<ApplicationRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Pioneer Members State
  const [selectedMember, setSelectedMember] = useState<ContributorProfile | null>(null);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [memberStatusFilter, setMemberStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [memberDivisionFilter, setMemberDivisionFilter] = useState('ALL');
  const [memberLevelFilter, setMemberLevelFilter] = useState('ALL');
  const [suspendModalMember, setSuspendModalMember] = useState<ContributorProfile | null>(null);
  const [suspendReasonInput, setSuspendReasonInput] = useState('Violation of Refeir Pioneer Code of Conduct');
  const [memberActionFeedback, setMemberActionFeedback] = useState('');

  // Staff / Workers Management State
  const [staffList, setStaffList] = useState<StaffMember[]>(() => getStaffMembers());
  const [addWorkerModalOpen, setAddWorkerModalOpen] = useState(false);
  const [staffSearchTerm, setStaffSearchTerm] = useState('');
  const [staffRoleFilter, setStaffRoleFilter] = useState('ALL');
  const [revealedPasscodes, setRevealedPasscodes] = useState<Record<string, boolean>>({});
  const [copiedPasscodeId, setCopiedPasscodeId] = useState<string | null>(null);

  // New Worker Form Fields
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerEmail, setNewWorkerEmail] = useState('');
  const [newWorkerRole, setNewWorkerRole] = useState<StaffRole>('ADMISSIONS_REVIEWER');
  const [newWorkerDivision, setNewWorkerDivision] = useState('ALL');
  const [newWorkerPasscode, setNewWorkerPasscode] = useState('');
  const [workerFormError, setWorkerFormError] = useState('');

  // Proofs of Work Review State
  const [activeTask, setActiveTask] = useState<TaskSubmissionRecord | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskFeedback, setTaskFeedback] = useState('');
  const [updatingTask, setUpdatingTask] = useState(false);
  const [screenshotModalUrl, setScreenshotModalUrl] = useState<string | null>(null);
  const [taskFilterStatus, setTaskFilterStatus] = useState<string>('ALL');

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [divisionFilter, setDivisionFilter] = useState<string>('ALL');
  const [foundingOnly, setFoundingOnly] = useState(false);

  // Edit / Action State inside Modal
  const [editStatus, setEditStatus] = useState<ReviewStatus>('PENDING');
  const [editContributorLevel, setEditContributorLevel] = useState<ContributorTier>('LEVEL_1');
  const [editIsFounding, setEditIsFounding] = useState(false);
  const [editPioneerId, setEditPioneerId] = useState('');
  const [editAcceptanceCode, setEditAcceptanceCode] = useState<string | null>(null);
  const [copiedCodeAppId, setCopiedCodeAppId] = useState<string | null>(null);
  const [copiedModalCode, setCopiedModalCode] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [savingChanges, setSavingChanges] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Handle Passcode Login with Staff Registry
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = passcode.trim();
    const staff = verifyStaffPasscode(cleanPass);
    if (staff) {
      sessionStorage.setItem('refeir_admin_auth', 'true');
      setActiveStaffSession(staff);
      setLoggedInStaff(staff);
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid passcode. Use your assigned worker passcode or master key "refeir2026".');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('refeir_admin_auth');
    setActiveStaffSession(null);
    setLoggedInStaff(null);
    setIsAuthenticated(false);
    setPasscode('');
  };

  const isSuperAdmin = loggedInStaff?.role === 'SUPER_ADMIN';

  // Toggle Worker Active / Suspended (Super Admin Only)
  const handleToggleStaff = (id: string) => {
    if (!isSuperAdmin) {
      alert('Unauthorized: Only Super Admin (Tonye Taylor) has permission to suspend or activate staff members.');
      return;
    }
    toggleStaffStatus(id);
    setStaffList(getStaffMembers());
  };

  // Delete Worker (Super Admin Only)
  const handleDeleteStaff = (id: string) => {
    if (!isSuperAdmin) {
      alert('Unauthorized: Only Super Admin (Tonye Taylor) has permission to remove staff members.');
      return;
    }
    if (window.confirm('Are you sure you want to remove this staff worker? Their access will be revoked immediately.')) {
      deleteStaffMember(id);
      setStaffList(getStaffMembers());
    }
  };

  // Add Worker Modal Submission (Super Admin Only)
  const handleCreateWorker = (e: React.FormEvent) => {
    e.preventDefault();
    setWorkerFormError('');

    if (!isSuperAdmin) {
      setWorkerFormError('Unauthorized: Only Super Admin (Tonye Taylor) can register new staff workers.');
      return;
    }

    if (!newWorkerName.trim()) {
      setWorkerFormError('Please enter the worker’s full name.');
      return;
    }
    if (!newWorkerEmail.trim() || !newWorkerEmail.includes('@')) {
      setWorkerFormError('Please enter a valid email address.');
      return;
    }
    if (!newWorkerPasscode.trim()) {
      setWorkerFormError('Please enter an access passcode for this worker.');
      return;
    }

    addStaffMember({
      name: newWorkerName.trim(),
      email: newWorkerEmail.trim().toLowerCase(),
      role: newWorkerRole,
      assigned_division: newWorkerDivision,
      passcode: newWorkerPasscode.trim(),
      status: 'ACTIVE'
    });

    setStaffList(getStaffMembers());
    setNewWorkerName('');
    setNewWorkerEmail('');
    setNewWorkerPasscode('');
    setAddWorkerModalOpen(false);
  };

  const handleCopyPasscode = (id: string, code: string) => {
    if (!isSuperAdmin) {
      alert('Unauthorized: Passcode access is strictly restricted to Super Admin.');
      return;
    }
    navigator.clipboard.writeText(code);
    setCopiedPasscodeId(id);
    setTimeout(() => setCopiedPasscodeId(null), 2000);
  };

  // Helper to count verified jobs for any contributor
  const getVerifiedJobsCount = (email: string, includeCurrentTaskId?: string): number => {
    return taskSubmissions.filter(t => {
      const matchEmail = t.email.toLowerCase() === email.toLowerCase();
      if (!matchEmail) return false;
      if (includeCurrentTaskId && t.id === includeCurrentTaskId) return true;
      return t.status === 'VERIFIED';
    }).length;
  };

  // Fetch Applications and Task Submissions
  const fetchApplications = async () => {
    setLoading(true);
    try {
      // Fetch task submissions
      try {
        const tasks = await getTaskSubmissions();
        setTaskSubmissions(tasks);
      } catch (e) {
        console.warn('Error loading task submissions:', e);
      }

      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('pioneer_applications')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          setApplications(data as ApplicationRecord[]);
          setLoading(false);
          return;
        }
      }
      // Load from local storage registry with acceptance codes
      const stored = getStoredApplications();
      setApplications(stored as ApplicationRecord[]);
    } catch (err) {
      console.error(err);
      setApplications(getStoredApplications() as ApplicationRecord[]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTaskModal = (task: TaskSubmissionRecord) => {
    setActiveTask(task);
    setTaskFeedback(task.admin_feedback || '');
    setTaskModalOpen(true);
  };

  const handleUpdateTaskStatus = async (newStatus: 'VERIFIED' | 'NEEDS_REVISION' | 'REJECTED') => {
    if (!activeTask) return;
    setUpdatingTask(true);
    try {
      await updateTaskSubmissionStatus(activeTask.id, newStatus, taskFeedback.trim());
      setTaskSubmissions(prev =>
        prev.map(t => (t.id === activeTask.id ? { ...t, status: newStatus, admin_feedback: taskFeedback.trim() } : t))
      );

      // Promotion qualification check: Contributors are NOT promoted automatically on a single task.
      // Must satisfy the required threshold of verified completed jobs.
      if (newStatus === 'VERIFIED') {
        const contributorEmail = activeTask.email.toLowerCase();
        const previouslyVerified = taskSubmissions.filter(
          t => t.email.toLowerCase() === contributorEmail && t.id !== activeTask.id && t.status === 'VERIFIED'
        ).length;
        const totalVerifiedJobs = previouslyVerified + 1;

        const targetTier = activeTask.target_level;
        const requiredJobs = MIN_JOBS_FOR_PROMOTION[targetTier] || 15;

        const matchingApp = applications.find(
          a =>
            (activeTask.application_number && a.application_number === activeTask.application_number) ||
            a.email.toLowerCase() === contributorEmail
        );

        if (totalVerifiedJobs >= requiredJobs) {
          // Meets or exceeds required job threshold -> Promote
          if (matchingApp) {
            setApplications(prev =>
              prev.map(a =>
                a.id === matchingApp.id ? { ...a, contributor_level: targetTier, status: 'ACCEPTED' } : a
              )
            );
          }
          updateContributorLevel(activeTask.email, targetTier);

          // Auto-issue Certificate for qualified level
          issueCertificate({
            pioneer_id: activeTask.pioneer_id || matchingApp?.pioneer_id || undefined,
            application_number: activeTask.application_number || matchingApp?.application_number || undefined,
            recipient_name: activeTask.full_name,
            recipient_email: contributorEmail,
            level: targetTier,
            division: activeTask.division,
            verified_jobs_count: totalVerifiedJobs,
            issued_by: loggedInStaff ? `${loggedInStaff.name} (${loggedInStaff.role.replace('_', ' ')})` : 'Tonye Taylor (Platform Architect & Founder)'
          });
          setCertificatesList(getAllCertificates());
        } else {
          // Do not promote yet. Keep level and accept application if pending.
          if (matchingApp && matchingApp.status !== 'ACCEPTED') {
            setApplications(prev =>
              prev.map(a =>
                a.id === matchingApp.id ? { ...a, status: 'ACCEPTED' } : a
              )
            );
          }
        }
      }

      setTaskModalOpen(false);
    } catch (err) {
      console.error('Task status update failed:', err);
    } finally {
      setUpdatingTask(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchApplications();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab')?.toLowerCase();
      if (tabParam === 'tasks' || tabParam === 'squad-tasks' || tabParam === 'bounties') setAdminTab('tasks');
      else if (tabParam === 'proofs') setAdminTab('proofs');
      else if (tabParam === 'members') setAdminTab('members');
      else if (tabParam === 'workers') setAdminTab('workers');
      else if (tabParam === 'certificates') setAdminTab('certificates');
      else if (tabParam === 'applications') setAdminTab('applications');
    } catch {}
  }, []);

  // Filtered Applications List
  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch =
        app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.application_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.city && app.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (app.pioneer_id && app.pioneer_id.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
      const matchesDivision = divisionFilter === 'ALL' || app.primary_division === divisionFilter;
      const matchesFounding = !foundingOnly || app.is_founding_100;

      return matchesSearch && matchesStatus && matchesDivision && matchesFounding;
    });
  }, [applications, searchTerm, statusFilter, divisionFilter, foundingOnly]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter(a => a.status === 'PENDING').length;
    const reviewing = applications.filter(a => a.status === 'REVIEWING').length;
    const accepted = applications.filter(a => a.status === 'ACCEPTED').length;
    const founding = applications.filter(a => a.is_founding_100).length;
    return { total, pending, reviewing, accepted, founding };
  }, [applications]);

  // Task Submissions Statistics
  const taskStats = useMemo(() => {
    const total = taskSubmissions.length;
    const pending = taskSubmissions.filter(t => t.status === 'PENDING').length;
    const verified = taskSubmissions.filter(t => t.status === 'VERIFIED').length;
    const needsRevision = taskSubmissions.filter(t => t.status === 'NEEDS_REVISION').length;
    return { total, pending, verified, needsRevision };
  }, [taskSubmissions]);

  // Filtered Task Submissions
  const filteredTasks = useMemo(() => {
    return taskSubmissions.filter(t => {
      const matchSearch =
        t.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.task_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.reference_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = taskFilterStatus === 'ALL' || t.status === taskFilterStatus;
      const matchDivision = divisionFilter === 'ALL' || t.division === divisionFilter;
      return matchSearch && matchStatus && matchDivision;
    });
  }, [taskSubmissions, searchTerm, taskFilterStatus, divisionFilter]);

  // Filtered Staff Workers
  const filteredStaff = useMemo(() => {
    return staffList.filter(s => {
      const matchSearch =
        s.name.toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
        s.assigned_division.toLowerCase().includes(staffSearchTerm.toLowerCase());
      const matchRole = staffRoleFilter === 'ALL' || s.role === staffRoleFilter;
      return matchSearch && matchRole;
    });
  }, [staffList, staffSearchTerm, staffRoleFilter]);

  // Filtered Members Memo
  const filteredMembers = useMemo(() => {
    return membersList.filter(m => {
      const q = memberSearchTerm.trim().toLowerCase();
      const matchSearch =
        !q ||
        m.full_name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.pioneer_id && m.pioneer_id.toLowerCase().includes(q)) ||
        (m.application_number && m.application_number.toLowerCase().includes(q)) ||
        (m.country && m.country.toLowerCase().includes(q)) ||
        (m.city && m.city.toLowerCase().includes(q)) ||
        (m.institution && m.institution.toLowerCase().includes(q));

      const matchStatus =
        memberStatusFilter === 'ALL' ||
        (memberStatusFilter === 'SUSPENDED' && m.is_suspended) ||
        (memberStatusFilter === 'ACTIVE' && !m.is_suspended);

      const matchDivision =
        memberDivisionFilter === 'ALL' || m.division === memberDivisionFilter;

      const matchLevel =
        memberLevelFilter === 'ALL' || m.contributor_level === memberLevelFilter;

      return matchSearch && matchStatus && matchDivision && matchLevel;
    });
  }, [membersList, memberSearchTerm, memberStatusFilter, memberDivisionFilter, memberLevelFilter]);

  const memberStats = useMemo(() => {
    return {
      total: membersList.length,
      active: membersList.filter(m => !m.is_suspended).length,
      suspended: membersList.filter(m => m.is_suspended).length,
      completed: membersList.filter(m => m.is_profile_completed).length
    };
  }, [membersList]);

  const refreshMembers = () => {
    setMembersList(getAllContributors());
  };

  const handleOpenMemberModal = (member: ContributorProfile) => {
    setSelectedMember(member);
    setMemberModalOpen(true);
  };

  const handleOpenSuspendModal = (member: ContributorProfile) => {
    setSuspendModalMember(member);
    setSuspendReasonInput('Violation of Refeir Pioneer Code of Conduct');
  };

  const handleConfirmSuspend = () => {
    if (!suspendModalMember) return;
    try {
      const updated = suspendContributor(suspendModalMember.email, suspendReasonInput);
      refreshMembers();
      if (selectedMember?.email.toLowerCase() === suspendModalMember.email.toLowerCase()) {
        setSelectedMember(updated);
      }
      setMemberActionFeedback(`Account for ${suspendModalMember.full_name} was suspended.`);
      setTimeout(() => setMemberActionFeedback(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to suspend member');
    } finally {
      setSuspendModalMember(null);
    }
  };

  const handleReactivateMember = (member: ContributorProfile) => {
    try {
      const updated = activateContributor(member.email);
      refreshMembers();
      if (selectedMember?.email.toLowerCase() === member.email.toLowerCase()) {
        setSelectedMember(updated);
      }
      setMemberActionFeedback(`Account for ${member.full_name} was reactivated.`);
      setTimeout(() => setMemberActionFeedback(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to reactivate member');
    }
  };

  const handlePromoteMemberLevel = (email: string, newLevel: ContributorTier) => {
    updateContributorLevel(email, newLevel);
    refreshMembers();
    if (selectedMember?.email.toLowerCase() === email.toLowerCase()) {
      setSelectedMember(prev => prev ? { ...prev, contributor_level: newLevel } : null);
    }

    // Auto-issue Certificate for newly accredited level
    const targetMember = membersList.find(m => m.email.toLowerCase() === email.toLowerCase());
    if (targetMember) {
      issueCertificate({
        pioneer_id: targetMember.pioneer_id,
        application_number: targetMember.application_number,
        recipient_name: targetMember.full_name,
        recipient_email: targetMember.email,
        level: newLevel,
        division: targetMember.division,
        verified_jobs_count: getVerifiedJobsCount(email),
        issued_by: loggedInStaff ? `${loggedInStaff.name} (${loggedInStaff.role.replace('_', ' ')})` : 'Tonye Taylor (Platform Architect & Founder)'
      });
      setCertificatesList(getAllCertificates());
    }

    setMemberActionFeedback(`Rank upgraded to ${newLevel.replace('_', ' ')} and Certificate issued.`);
    setTimeout(() => setMemberActionFeedback(''), 4000);
  };

  const refreshCertificates = () => {
    setCertificatesList(getAllCertificates());
  };

  const handleOpenIssueCertModal = (memberEmail?: string, defaultLevel?: ContributorTier) => {
    if (memberEmail) {
      setIssueCertMemberEmail(memberEmail);
    } else if (membersList.length > 0) {
      setIssueCertMemberEmail(membersList[0].email);
    }
    if (defaultLevel) {
      setIssueCertLevel(defaultLevel);
    }
    setIssueCertModalOpen(true);
  };

  const handleConfirmIssueCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMember = membersList.find(m => m.email.toLowerCase() === issueCertMemberEmail.toLowerCase());
    if (!targetMember) {
      alert('Selected pioneer member was not found');
      return;
    }
    const cert = issueCertificate({
      pioneer_id: targetMember.pioneer_id,
      application_number: targetMember.application_number,
      recipient_name: targetMember.full_name,
      recipient_email: targetMember.email,
      level: issueCertLevel,
      division: targetMember.division,
      verified_jobs_count: getVerifiedJobsCount(targetMember.email),
      issued_by: loggedInStaff ? `${loggedInStaff.name} (${loggedInStaff.role.replace('_', ' ')})` : 'Tonye Taylor (Platform Architect & Founder)',
      special_distinction: issueCertDistinction.trim()
    });

    setCertificatesList(getAllCertificates());
    setIssueCertModalOpen(false);
    setCertFeedbackMsg(`Official Certificate (${cert.id}) minted for ${targetMember.full_name}!`);
    setTimeout(() => setCertFeedbackMsg(''), 5000);
  };

  const handleRevokeCertificate = (id: string) => {
    const reason = window.prompt('Enter reason for revoking this certificate:');
    if (reason === null) return;
    revokeCertificate(id, reason.trim() || 'Administrative revocation');
    setCertificatesList(getAllCertificates());
    setCertFeedbackMsg('Certificate has been revoked.');
    setTimeout(() => setCertFeedbackMsg(''), 4000);
  };

  const handleViewCertificate = (cert: PioneerCertificate) => {
    setSelectedCertificateForModal(cert);
    setIsCertificateModalOpen(true);
  };

  // Filtered Certificates List
  const filteredCertificates = useMemo(() => {
    return certificatesList.filter(c => {
      const q = certSearchTerm.trim().toLowerCase();
      const matchSearch =
        !q ||
        c.recipient_name.toLowerCase().includes(q) ||
        c.recipient_email.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.pioneer_id.toLowerCase().includes(q) ||
        c.division.toLowerCase().includes(q) ||
        c.verification_hash.toLowerCase().includes(q);

      const matchLevel = certLevelFilter === 'ALL' || c.level === certLevelFilter;
      const matchStatus = certStatusFilter === 'ALL' || c.status === certStatusFilter;

      return matchSearch && matchLevel && matchStatus;
    });
  }, [certificatesList, certSearchTerm, certLevelFilter, certStatusFilter]);

  // Certificate Statistics
  const certificateStats = useMemo(() => {
    return {
      total: certificatesList.length,
      level1: certificatesList.filter(c => c.level === 'LEVEL_1').length,
      advanced: certificatesList.filter(c => c.level !== 'LEVEL_1').length,
      revoked: certificatesList.filter(c => c.status === 'REVOKED').length
    };
  }, [certificatesList]);

  // Squad Tasks Management State
  const [tasksList, setTasksList] = useState<SquadTask[]>(() => getAllSquadTasks());
  const [taskSearchTerm, setTaskSearchTerm] = useState('');
  const [taskSquadFilter, setTaskSquadFilter] = useState('ALL');
  const [taskBountyFilter, setTaskBountyFilter] = useState('ALL');
  const [taskFrequencyFilter, setTaskFrequencyFilter] = useState('ALL');
  const [taskStatusFilter, setTaskStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ARCHIVED'>('ALL');
  const [taskFeedbackMsg, setTaskFeedbackMsg] = useState('');
  const [newTaskModalOpen, setNewTaskModalOpen] = useState(false);
  const [copiedTaskBroadcastId, setCopiedTaskBroadcastId] = useState<string | null>(null);

  // New Task Form Fields
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSquad, setNewTaskSquad] = useState<SquadDivision>('GENERAL');
  const [newTaskCategory, setNewTaskCategory] = useState('Liking, Commenting & Viral Loop Sharing');
  const [newTaskFrequency, setNewTaskFrequency] = useState<TaskFrequency>('DAILY');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskRequirements, setNewTaskRequirements] = useState(
    '1. Like and leave an insightful comment on the linked post\n2. Share to your WhatsApp status or story\n3. Take a screenshot showing your engagement\n4. Submit proof via Refeir Pioneers submit portal'
  );
  const [newTaskBountyType, setNewTaskBountyType] = useState<BountyType>('AIRTIME');
  const [newTaskBountyReward, setNewTaskBountyReward] = useState('₦1,500 Airtime Voucher');
  const [newTaskBountyInstructions, setNewTaskBountyInstructions] = useState('First 10 verified submissions will receive instant mobile airtime recharge code on WhatsApp.');
  const [newTaskDeadline, setNewTaskDeadline] = useState('Today 11:59 PM WAT');
  const [newTaskMaxClaims, setNewTaskMaxClaims] = useState(10);

  const refreshTasks = () => {
    setTasksList(getAllSquadTasks());
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      alert('Please enter a task title');
      return;
    }
    const reqs = newTaskRequirements
      .split('\n')
      .map(r => r.trim())
      .filter(r => r.length > 0);

    const created = createSquadTask({
      title: newTaskTitle.trim(),
      squad: newTaskSquad,
      category: newTaskCategory.trim() || 'General Mission',
      frequency: newTaskFrequency,
      description: newTaskDescription.trim(),
      requirements: reqs.length > 0 ? reqs : ['Complete task objectives and upload screenshot proof.'],
      submission_format: 'Screenshot Proof + Live URL',
      bounty_type: newTaskBountyType,
      bounty_reward: newTaskBountyReward.trim() || undefined,
      bounty_slots: `First ${newTaskMaxClaims} Verified Submissions`,
      bounty_instructions: newTaskBountyInstructions.trim() || undefined,
      deadline: newTaskDeadline.trim() || 'Today 11:59 PM WAT',
      status: 'ACTIVE',
      announced_by: loggedInStaff ? `${loggedInStaff.name} (${loggedInStaff.role.replace('_', ' ')})` : 'Refeir Squad Leadership'
    });

    setTasksList(getAllSquadTasks());
    setNewTaskModalOpen(false);
    setTaskFeedbackMsg(`Mission "${created.title}" successfully announced and broadcast-ready!`);
    setTimeout(() => setTaskFeedbackMsg(''), 5000);

    setNewTaskTitle('');
    setNewTaskDescription('');
  };

  const handleDeleteTask = (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete mission "${title}"?`)) return;
    deleteSquadTask(id);
    setTasksList(getAllSquadTasks());
    setTaskFeedbackMsg('Mission deleted.');
    setTimeout(() => setTaskFeedbackMsg(''), 3000);
  };

  const handleToggleTaskStatus = (id: string) => {
    toggleTaskStatus(id);
    setTasksList(getAllSquadTasks());
  };

  const handleCopyBroadcast = (task: SquadTask) => {
    const text = generateWhatsAppBroadcast(task);
    navigator.clipboard.writeText(text).then(() => {
      setCopiedTaskBroadcastId(task.id);
      setTimeout(() => setCopiedTaskBroadcastId(null), 3000);
    });
  };

  const filteredSquadTasks = useMemo(() => {
    return tasksList.filter(t => {
      const q = taskSearchTerm.trim().toLowerCase();
      const matchSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.bounty_reward && t.bounty_reward.toLowerCase().includes(q));

      const matchSquad = taskSquadFilter === 'ALL' || t.squad === taskSquadFilter;
      const matchBounty = taskBountyFilter === 'ALL' || t.bounty_type === taskBountyFilter;
      const matchFreq = taskFrequencyFilter === 'ALL' || t.frequency === taskFrequencyFilter;
      const matchStatus = taskStatusFilter === 'ALL' || t.status === taskStatusFilter;

      return matchSearch && matchSquad && matchBounty && matchFreq && matchStatus;
    });
  }, [tasksList, taskSearchTerm, taskSquadFilter, taskBountyFilter, taskFrequencyFilter, taskStatusFilter]);

  const squadTaskStats = useMemo(() => {
    const activeTasks = tasksList.filter(t => t.status === 'ACTIVE');
    return {
      total: tasksList.length,
      active: activeTasks.length,
      bounties: activeTasks.filter(t => t.bounty_type !== 'NONE').length,
      airtime: activeTasks.filter(t => t.bounty_type === 'AIRTIME').length,
      data: activeTasks.filter(t => t.bounty_type === 'DATA').length,
      cash: activeTasks.filter(t => t.bounty_type === 'CASH').length,
      daily: activeTasks.filter(t => t.frequency === 'DAILY').length
    };
  }, [tasksList]);

  // Open Detailed Review Modal
  const openReviewModal = (app: ApplicationRecord) => {
    setActiveApp(app);
    setEditStatus(app.status);
    setEditContributorLevel(app.contributor_level || 'LEVEL_1');
    setEditIsFounding(app.is_founding_100);
    setEditPioneerId(app.pioneer_id || '');
    setEditNotes(app.internal_notes || '');
    setEditAcceptanceCode(app.acceptance_code || null);
    setSaveSuccessMsg('');
    setModalOpen(true);
  };

  // Save Application Changes
  const handleSaveChanges = async () => {
    if (!activeApp) return;
    setSavingChanges(true);
    setSaveSuccessMsg('');

    let finalAcceptanceCode = editAcceptanceCode || activeApp.acceptance_code;
    if (editStatus === 'ACCEPTED' && !finalAcceptanceCode) {
      finalAcceptanceCode = generateAcceptanceCode(activeApp.application_number);
      setEditAcceptanceCode(finalAcceptanceCode);
    }

    let finalPioneerId = editPioneerId.trim() || activeApp.pioneer_id || '';
    if (editStatus === 'ACCEPTED' && !finalPioneerId) {
      const existingSeats = applications.map(a => a.pioneer_id).filter(Boolean) as string[];
      const numbers = existingSeats.map(s => {
        const match = s.match(/RP-(\d+)/i);
        return match ? parseInt(match[1], 10) : 0;
      });
      const maxNum = numbers.length > 0 ? Math.max(...numbers, 45) : 45;
      finalPioneerId = `RP-${String(maxNum + 1).padStart(3, '0')}`;
      setEditPioneerId(finalPioneerId);
    }

    const updatedFields: Partial<ApplicationRecord> = {
      status: editStatus,
      contributor_level: editContributorLevel,
      is_founding_100: editIsFounding,
      pioneer_id: finalPioneerId || null,
      acceptance_code: finalAcceptanceCode || null,
      internal_notes: editNotes.trim() || null
    };

    try {
      if (isSupabaseConfigured) {
        await supabase
          .from('pioneer_applications')
          .update(updatedFields)
          .eq('id', activeApp.id);
      }

      // Update in persistent local applications storage
      updateStoredApplication(activeApp.id, updatedFields);

      // Update local state
      setApplications(prev => prev.map(a => {
        if (a.id === activeApp.id) {
          return { ...a, ...updatedFields };
        }
        return a;
      }));

      setActiveApp(prev => prev ? { ...prev, ...updatedFields } : null);
      setSaveSuccessMsg('Status & Acceptance Code updated successfully!');
    } catch (err) {
      console.error(err);
      setSaveSuccessMsg('Saved locally.');
    } finally {
      setSavingChanges(false);
      setTimeout(() => setSaveSuccessMsg(''), 3500);
    }
  };

  // Auto-generate next Pioneer ID
  const generateNextPioneerId = () => {
    const nextNum = stats.founding + 1;
    const formatted = `RP-${String(nextNum).padStart(3, '0')}`;
    setEditPioneerId(formatted);
    setEditIsFounding(true);
    setEditStatus('ACCEPTED');
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredApps.length === 0) return;
    const headers = [
      'Application Number', 'Full Name', 'Email', 'WhatsApp Number', 'Country', 'City',
      'Division', 'Roles', 'Status', 'Founding 100', 'Pioneer ID', 'Date Applied'
    ];

    const rows = filteredApps.map(a => [
      a.application_number,
      `"${a.full_name}"`,
      a.email,
      `"${a.whatsapp_number}"`,
      a.country,
      `"${a.city || ''}"`,
      a.primary_division || '',
      `"${(a.roles || []).join(', ')}"`,
      a.status,
      a.is_founding_100 ? 'YES' : 'NO',
      a.pioneer_id || '',
      new Date(a.created_at).toLocaleDateString()
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `refeir_pioneer_applications_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Status Badge Component
  const renderStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <span style={{
            background: 'rgba(24, 252, 92, 0.15)', color: RF_MINT_ACCENT, border: `1px solid ${RF_LEAF_GREEN}55`,
            padding: '4px 10px', borderRadius: 100, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em'
          }}>
            ACCEPTED
          </span>
        );
      case 'REVIEWING':
        return (
          <span style={{
            background: 'rgba(246, 178, 26, 0.15)', color: RF_GOLD_YELLOW, border: `1px solid ${RF_GOLD_YELLOW}55`,
            padding: '4px 10px', borderRadius: 100, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em'
          }}>
            REVIEWING
          </span>
        );
      case 'WAITLISTED':
        return (
          <span style={{
            background: 'rgba(244, 124, 32, 0.15)', color: '#FFB27D', border: `1px solid rgba(244, 124, 32, 0.5)`,
            padding: '4px 10px', borderRadius: 100, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em'
          }}>
            WAITLISTED
          </span>
        );
      case 'REJECTED':
        return (
          <span style={{
            background: 'rgba(239, 68, 68, 0.12)', color: '#FCA5A5', border: '1px solid rgba(239, 68, 68, 0.4)',
            padding: '4px 10px', borderRadius: 100, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em'
          }}>
            REJECTED
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span style={{
            background: 'rgba(255, 255, 255, 0.08)', color: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '4px 10px', borderRadius: 100, fontSize: 11.5, fontWeight: 600, letterSpacing: '0.04em'
          }}>
            PENDING
          </span>
        );
    }
  };

  const renderTaskStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span style={{
            background: 'rgba(24, 252, 92, 0.15)', color: RF_MINT_ACCENT, border: `1px solid ${RF_LEAF_GREEN}66`,
            padding: '4px 10px', borderRadius: 100, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em',
            display: 'inline-flex', alignItems: 'center', gap: 4
          }}>
            <Check size={12} /> VERIFIED
          </span>
        );
      case 'NEEDS_REVISION':
        return (
          <span style={{
            background: 'rgba(244, 124, 32, 0.15)', color: '#FFB27D', border: `1px solid rgba(244, 124, 32, 0.5)`,
            padding: '4px 10px', borderRadius: 100, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em'
          }}>
            NEEDS REVISION
          </span>
        );
      case 'REJECTED':
        return (
          <span style={{
            background: 'rgba(239, 68, 68, 0.12)', color: '#FCA5A5', border: '1px solid rgba(239, 68, 68, 0.4)',
            padding: '4px 10px', borderRadius: 100, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em'
          }}>
            REJECTED
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span style={{
            background: 'rgba(246, 178, 26, 0.15)', color: RF_GOLD_YELLOW, border: '1px solid rgba(246, 178, 26, 0.4)',
            padding: '4px 10px', borderRadius: 100, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em'
          }}>
            PENDING PROOF
          </span>
        );
    }
  };

  const renderStaffRoleBadge = (role: StaffRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <span style={{
            background: `${RF_GOLD_YELLOW}15`, color: RF_GOLD_YELLOW, border: `1px solid ${RF_GOLD_YELLOW}55`,
            padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
            display: 'inline-flex', alignItems: 'center', gap: 4
          }}>
            <Shield size={11} /> SUPER ADMIN
          </span>
        );
      case 'ADMISSIONS_REVIEWER':
        return (
          <span style={{
            background: `${RF_MINT_ACCENT}15`, color: RF_MINT_ACCENT, border: `1px solid ${RF_MINT_ACCENT}55`,
            padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
            display: 'inline-flex', alignItems: 'center', gap: 4
          }}>
            <UserCheck size={11} /> ADMISSIONS REVIEWER
          </span>
        );
      case 'TASK_VERIFIER':
        return (
          <span style={{
            background: `${RF_LEAF_GREEN}15`, color: RF_LEAF_GREEN, border: `1px solid ${RF_LEAF_GREEN}55`,
            padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
            display: 'inline-flex', alignItems: 'center', gap: 4
          }}>
            <Award size={11} /> TASK VERIFIER
          </span>
        );
      case 'SQUAD_LEAD':
        return (
          <span style={{
            background: `${RF_ORANGE}15`, color: '#FFB27D', border: `1px solid ${RF_ORANGE}55`,
            padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
            display: 'inline-flex', alignItems: 'center', gap: 4
          }}>
            <Star size={11} /> SQUAD LEAD
          </span>
        );
    }
  };

  // ─── LOGIN SCREEN ────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(135deg, ${RF_DEEP_GREEN} 0%, ${RF_FOREST_DARK} 100%)`,
        padding: 24, color: '#FFFFFF', paddingTop: 72
      }}>
        <div style={{
          maxWidth: 440, width: '100%', background: 'rgba(15, 42, 26, 0.75)',
          borderRadius: 24, padding: '40px 32px', border: '1px solid rgba(102, 187, 42, 0.3)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.65)', textAlign: 'center', backdropFilter: 'blur(16px)'
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, background: `${RF_LEAF_GREEN}20`,
            border: `1px solid ${RF_LEAF_GREEN}44`, display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 20px', color: RF_MINT_ACCENT
          }}>
            <Lock size={24} />
          </div>

          <h2 style={{
            fontSize: 26, fontWeight: 500, fontFamily: 'Plus Jakarta Sans, sans-serif',
            marginBottom: 8, color: '#FFFFFF'
          }}>
            Refeir Admissions Suite
          </h2>

          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: 26 }}>
            Internal review portal for evaluating Pioneer candidate applications, managing squad placements, and issuing Founding 100 seats.
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <input
                type="password"
                placeholder="Enter admissions passcode..."
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                autoFocus
                style={{
                  width: '100%', padding: '13px 18px', borderRadius: 100,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(102, 187, 42, 0.3)',
                  color: '#FFFFFF', fontSize: 14, outline: 'none', textAlign: 'center'
                }}
              />
            </div>

            {authError && (
              <div style={{
                padding: '10px 14px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)', color: '#FCA5A5', fontSize: 12.5
              }}>
                {authError}
              </div>
            )}

            <button
              type="submit"
              style={{
                background: RF_LEAF_GREEN, color: RF_DEEP_GREEN, border: 'none',
                padding: '12px 24px', borderRadius: 100, fontSize: 14, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s', boxShadow: `0 4px 16px ${RF_LEAF_GREEN}44`
              }}
            >
              Access Admissions Portal
            </button>
          </form>

          <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.55)', margin: '0 0 10px' }}>
              Quick Staff Passcodes (Click to fill):
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setPasscode('refeir2026')}
                style={{
                  background: 'rgba(24, 252, 92, 0.08)', border: '1px solid rgba(24, 252, 92, 0.25)',
                  color: RF_MINT_ACCENT, padding: '3px 9px', borderRadius: 100, fontSize: 11, cursor: 'pointer'
                }}
              >
                Tonye (Super Admin)
              </button>
              <button
                type="button"
                onClick={() => setPasscode('admit2026')}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.85)', padding: '3px 9px', borderRadius: 100, fontSize: 11, cursor: 'pointer'
                }}
              >
                Sarah (Admissions)
              </button>
              <button
                type="button"
                onClick={() => setPasscode('techlead26')}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.85)', padding: '3px 9px', borderRadius: 100, fontSize: 11, cursor: 'pointer'
                }}
              >
                Chidi (Tech Lead)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── AUTHENTICATED ADMIN SUITE ───────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh', background: '#07180F', color: '#FFFFFF', paddingTop: 72,
      fontFamily: 'Plus Jakarta Sans, sans-serif'
    }}>
      {/* Top Admin Navigation Bar */}
      <div style={{
        background: 'rgba(15, 46, 30, 0.95)', borderBottom: '1px solid rgba(102, 187, 42, 0.18)',
        padding: '16px 24px'
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              background: `${RF_LEAF_GREEN}20`, border: `1px solid ${RF_LEAF_GREEN}44`,
              width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: RF_MINT_ACCENT
            }}>
              <Shield size={16} />
            </div>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', display: 'block' }}>
                Refeir Admissions Suite
              </span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                Founding Cohort 001 Candidate Reviews
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Logged in Worker Role Badge */}
            {loggedInStaff && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(24, 252, 92, 0.08)', border: '1px solid rgba(24, 252, 92, 0.25)',
                padding: '5px 12px', borderRadius: 100
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#FFFFFF' }}>{loggedInStaff.name}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: RF_DEEP_GREEN, background: RF_MINT_ACCENT,
                  padding: '1px 6px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.04em'
                }}>
                  {loggedInStaff.role.replace('_', ' ')}
                </span>
              </div>
            )}

            <button
              onClick={fetchApplications}
              disabled={loading}
              style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#FFFFFF', padding: '7px 14px', borderRadius: 100, fontSize: 12,
                fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <RefreshCw size={13} className={loading ? 'rp-spin' : ''} />
              Refresh
            </button>

            <button
              onClick={handleExportCSV}
              style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#FFFFFF', padding: '7px 14px', borderRadius: 100, fontSize: 12,
                fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <Download size={13} />
              Export CSV
            </button>

            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#FCA5A5', padding: '7px 14px', borderRadius: 100, fontSize: 12,
                fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <LogOut size={13} />
              Exit Admin
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '36px 24px 80px' }}>
        {/* Navigation Tabs between Applications, Proofs of Work, and Review Team & Workers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16, flexWrap: 'wrap' }}>
          <button
            onClick={() => setAdminTab('applications')}
            style={{
              background: adminTab === 'applications' ? RF_LEAF_GREEN : 'rgba(255,255,255,0.05)',
              color: adminTab === 'applications' ? RF_DEEP_GREEN : '#FFFFFF',
              border: 'none', padding: '10px 20px', borderRadius: 100, fontSize: 13.5,
              fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.2s'
            }}
          >
            <UserCheck size={16} />
            Applications &amp; Admissions
            <span style={{
              background: adminTab === 'applications' ? 'rgba(15, 46, 30, 0.25)' : 'rgba(255,255,255,0.15)',
              padding: '2px 8px', borderRadius: 100, fontSize: 11
            }}>
              {stats.total}
            </span>
          </button>

          <button
            onClick={() => setAdminTab('proofs')}
            style={{
              background: adminTab === 'proofs' ? RF_LEAF_GREEN : 'rgba(255,255,255,0.05)',
              color: adminTab === 'proofs' ? RF_DEEP_GREEN : '#FFFFFF',
              border: 'none', padding: '10px 20px', borderRadius: 100, fontSize: 13.5,
              fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.2s'
            }}
          >
            <FileCheck size={16} />
            Task Submissions &amp; Proofs
            <span style={{
              background: adminTab === 'proofs' ? 'rgba(15, 46, 30, 0.25)' : RF_MINT_ACCENT,
              color: adminTab === 'proofs' ? RF_DEEP_GREEN : RF_DEEP_GREEN,
              padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 800
            }}>
              {taskStats.total}
            </span>
          </button>

          <button
            onClick={() => { setAdminTab('members'); refreshMembers(); }}
            style={{
              background: adminTab === 'members' ? RF_LEAF_GREEN : 'rgba(255,255,255,0.05)',
              color: adminTab === 'members' ? RF_DEEP_GREEN : '#FFFFFF',
              border: 'none', padding: '10px 20px', borderRadius: 100, fontSize: 13.5,
              fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.2s'
            }}
          >
            <Award size={16} />
            Pioneer Profiles
            <span style={{
              background: adminTab === 'members' ? 'rgba(15, 46, 30, 0.25)' : 'rgba(255,255,255,0.15)',
              padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 800
            }}>
              {membersList.length}
            </span>
          </button>

          <button
            onClick={() => setAdminTab('workers')}
            style={{
              background: adminTab === 'workers' ? RF_LEAF_GREEN : 'rgba(255,255,255,0.05)',
              color: adminTab === 'workers' ? RF_DEEP_GREEN : '#FFFFFF',
              border: 'none', padding: '10px 20px', borderRadius: 100, fontSize: 13.5,
              fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.2s'
            }}
          >
            <Users size={16} />
            Review Team &amp; Workers
            <span style={{
              background: adminTab === 'workers' ? 'rgba(15, 46, 30, 0.25)' : 'rgba(255,255,255,0.15)',
              padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 800
            }}>
              {staffList.length}
            </span>
          </button>

          <button
            onClick={() => { setAdminTab('certificates'); refreshCertificates(); }}
            style={{
              background: adminTab === 'certificates' ? RF_LEAF_GREEN : 'rgba(255,255,255,0.05)',
              color: adminTab === 'certificates' ? RF_DEEP_GREEN : '#FFFFFF',
              border: 'none', padding: '10px 20px', borderRadius: 100, fontSize: 13.5,
              fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.2s'
            }}
          >
            <Award size={16} />
            Certifications
            <span style={{
              background: adminTab === 'certificates' ? 'rgba(15, 46, 30, 0.25)' : RF_GOLD_YELLOW,
              color: adminTab === 'certificates' ? RF_DEEP_GREEN : RF_DEEP_GREEN,
              padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 800
            }}>
              {certificatesList.length}
            </span>
          </button>

          <button
            onClick={() => { setAdminTab('tasks'); refreshTasks(); }}
            style={{
              background: adminTab === 'tasks' ? RF_LEAF_GREEN : 'rgba(255,255,255,0.05)',
              color: adminTab === 'tasks' ? RF_DEEP_GREEN : '#FFFFFF',
              border: 'none', padding: '10px 20px', borderRadius: 100, fontSize: 13.5,
              fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.2s'
            }}
          >
            <Megaphone size={16} />
            Squad Tasks &amp; Bounties
            <span style={{
              background: adminTab === 'tasks' ? 'rgba(15, 46, 30, 0.25)' : RF_MINT_ACCENT,
              color: adminTab === 'tasks' ? RF_DEEP_GREEN : RF_DEEP_GREEN,
              padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 800
            }}>
              {tasksList.filter(t => t.status === 'ACTIVE').length}
            </span>
          </button>
        </div>

        {adminTab === 'applications' && (
          <div>
            {/* KPI & Metrics Bar */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16, marginBottom: 32
        }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Applications</span>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#FFFFFF', marginTop: 4 }}>{stats.total}</div>
            <span style={{ fontSize: 12, color: RF_MINT_ACCENT }}>All time received</span>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pending Review</span>
            <div style={{ fontSize: 32, fontWeight: 700, color: RF_GOLD_YELLOW, marginTop: 4 }}>{stats.pending}</div>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Requires decision</span>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Accepted Pioneers</span>
            <div style={{ fontSize: 32, fontWeight: 700, color: RF_MINT_ACCENT, marginTop: 4 }}>{stats.accepted}</div>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Approved candidates</span>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Founding 100 Seats</span>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#FFFFFF', marginTop: 4 }}>
              {stats.founding} <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)' }}>/ 100</span>
            </div>
            <div style={{ width: '100%', height: 4, borderRadius: 100, background: 'rgba(255,255,255,0.1)', marginTop: 8 }}>
              <div style={{ width: `${Math.min(100, stats.founding)}%`, height: '100%', borderRadius: 100, background: RF_MINT_ACCENT }} />
            </div>
          </div>
        </div>

        {/* Filters & Search Controls */}
        <div style={{
          background: 'rgba(255,255,255,0.02)', borderRadius: 18, padding: '20px 22px',
          border: '1px solid rgba(255,255,255,0.08)', marginBottom: 24,
          display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', justifyContent: 'space-between'
        }}>
          {/* Search Bar */}
          <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 420 }}>
            <Search size={16} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by name, email, RP-2026 number, country..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '10px 16px 10px 42px', borderRadius: 100,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#FFFFFF', fontSize: 13, outline: 'none'
              }}
            />
          </div>

          {/* Filter Dropdowns */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#FFFFFF', padding: '9px 16px', borderRadius: 100, fontSize: 12.5, outline: 'none'
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="REVIEWING">Under Review</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="WAITLISTED">Waitlisted</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              value={divisionFilter}
              onChange={e => setDivisionFilter(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#FFFFFF', padding: '9px 16px', borderRadius: 100, fontSize: 12.5, outline: 'none'
              }}
            >
              <option value="ALL">All Divisions</option>
              <option value="TECH_PRODUCT">Tech & Product</option>
              <option value="CREATIVE">Creative</option>
              <option value="GROWTH">Growth</option>
              <option value="BUSINESS">Business</option>
              <option value="COMMUNITY">Community</option>
              <option value="RESEARCH_TESTING">Research & Testing</option>
            </select>

            <label style={{
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5,
              color: 'rgba(255,255,255,0.75)', cursor: 'pointer', userSelect: 'none'
            }}>
              <input
                type="checkbox"
                checked={foundingOnly}
                onChange={e => setFoundingOnly(e.target.checked)}
                style={{ accentColor: RF_MINT_ACCENT }}
              />
              Founding 100 Only
            </label>
          </div>
        </div>

        {/* Applications Data Table */}
        <div style={{
          background: 'rgba(255,255,255,0.02)', borderRadius: 18, border: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Application ID</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Candidate</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Division & Roles</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Status</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Submitted</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '48px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.45)' }}>
                      No applications match the current filter or search term.
                    </td>
                  </tr>
                ) : (
                  filteredApps.map(app => (
                    <tr
                      key={app.id}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        transition: 'background 0.2s', cursor: 'pointer'
                      }}
                      onClick={() => openReviewModal(app)}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* ID & Founding & Acceptance Code */}
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ fontFamily: 'monospace', fontSize: 12.5, fontWeight: 700, color: RF_MINT_ACCENT }}>
                          {app.application_number}
                        </div>
                        {app.is_founding_100 && (
                          <span style={{
                            display: 'inline-block', fontSize: 10, fontWeight: 700, color: RF_GOLD_YELLOW,
                            marginTop: 3, letterSpacing: '0.04em'
                          }}>
                            ⭐ {app.pioneer_id || 'FOUNDING 100'}
                          </span>
                        )}
                        {app.status === 'ACCEPTED' && (
                          <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{
                              fontSize: 10, fontFamily: 'monospace', color: RF_MINT_ACCENT,
                              background: 'rgba(24, 252, 92, 0.1)', padding: '2px 6px', borderRadius: 4,
                              border: `1px solid ${RF_LEAF_GREEN}44`, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3
                            }}>
                              <Key size={9} />
                              {app.acceptance_code || 'ACC-PENDING'}
                            </span>
                            {app.acceptance_code && (
                              <button
                                title="Copy Acceptance Code"
                                onClick={e => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(app.acceptance_code!);
                                  setCopiedCodeAppId(app.id);
                                  setTimeout(() => setCopiedCodeAppId(null), 2000);
                                }}
                                style={{
                                  background: 'none', border: 'none',
                                  color: copiedCodeAppId === app.id ? RF_MINT_ACCENT : 'rgba(255,255,255,0.45)',
                                  cursor: 'pointer', padding: 2, display: 'inline-flex', alignItems: 'center'
                                }}
                              >
                                {copiedCodeAppId === app.id ? <Check size={11} /> : <Copy size={11} />}
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Candidate Name & Location */}
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{app.full_name}</div>
                        <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)' }}>
                          {app.city ? `${app.city}, ` : ''}{app.country} • {app.email}
                        </div>
                      </td>

                      {/* Division & Roles */}
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: '#FFFFFF' }}>
                          {app.primary_division?.replace('_', ' ') || 'General'}
                        </div>
                        <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {(app.roles || []).join(', ')}
                        </div>
                      </td>

                      {/* Review Status & Contributor Level */}
                      <td style={{ padding: '16px 18px' }}>
                        <div>{renderStatusBadge(app.status)}</div>
                        <div style={{ marginTop: 4 }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700,
                            color: app.contributor_level === 'LEVEL_5' ? '#38BDF8'
                              : app.contributor_level === 'LEVEL_4' ? RF_GOLD_YELLOW
                              : app.contributor_level === 'LEVEL_3' ? RF_MINT_ACCENT
                              : app.contributor_level === 'LEVEL_2' ? RF_LEAF_GREEN
                              : '#94A3B8',
                            letterSpacing: '0.04em'
                          }}>
                            {app.contributor_level === 'LEVEL_5' ? '★ L5: Core Team'
                              : app.contributor_level === 'LEVEL_4' ? '🎖️ L4: Lead'
                              : app.contributor_level === 'LEVEL_3' ? '⚡ L3: Builder'
                              : app.contributor_level === 'LEVEL_2' ? '🌱 L2: Pioneer'
                              : '👤 L1: Member'}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '16px 18px', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                        {new Date(app.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </td>

                      {/* Action Button */}
                      <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                        <button
                          onClick={e => { e.stopPropagation(); openReviewModal(app); }}
                          style={{
                            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)',
                            color: '#FFFFFF', padding: '6px 14px', borderRadius: 100, fontSize: 12,
                            fontWeight: 500, cursor: 'pointer'
                          }}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}

    {adminTab === 'proofs' && (
      <div>
          {/* KPI Bar for Task Submissions */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16, marginBottom: 32
          }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Mission Submissions</span>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#FFFFFF', marginTop: 4 }}>{taskStats.total}</div>
              <span style={{ fontSize: 12, color: RF_MINT_ACCENT }}>All time reported</span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pending Verification</span>
              <div style={{ fontSize: 32, fontWeight: 700, color: RF_GOLD_YELLOW, marginTop: 4 }}>{taskStats.pending}</div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Requires squad review</span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Verified &amp; Promoted</span>
              <div style={{ fontSize: 32, fontWeight: 700, color: RF_MINT_ACCENT, marginTop: 4 }}>{taskStats.verified}</div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Ladder rank upgraded</span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Needs Revision</span>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#FFB27D', marginTop: 4 }}>{taskStats.needsRevision}</div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Actionable notes sent</span>
            </div>
          </div>

          {/* Proofs Filter Bar */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', borderRadius: 18, padding: '20px 22px',
            border: '1px solid rgba(255,255,255,0.08)', marginBottom: 24,
            display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', justifyContent: 'space-between'
          }}>
            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 300px', minWidth: 260 }}>
              <Search size={16} color="rgba(255,255,255,0.4)" />
              <input
                type="text"
                placeholder="Search by contributor name, mission title, email, or POW code..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  background: 'none', border: 'none', color: '#FFFFFF', fontSize: 14,
                  width: '100%', outline: 'none'
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Status:</span>
              <select
                value={taskFilterStatus}
                onChange={e => setTaskFilterStatus(e.target.value)}
                style={{
                  background: 'rgba(15, 46, 30, 0.95)', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#FFFFFF', padding: '6px 12px', borderRadius: 8, fontSize: 12.5, outline: 'none'
                }}
              >
                <option value="ALL">All Proofs ({taskStats.total})</option>
                <option value="PENDING">Pending Verification ({taskStats.pending})</option>
                <option value="VERIFIED">Verified ({taskStats.verified})</option>
                <option value="NEEDS_REVISION">Needs Revision ({taskStats.needsRevision})</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {/* Division Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Division:</span>
              <select
                value={divisionFilter}
                onChange={e => setDivisionFilter(e.target.value)}
                style={{
                  background: 'rgba(15, 46, 30, 0.95)', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#FFFFFF', padding: '6px 12px', borderRadius: 8, fontSize: 12.5, outline: 'none'
                }}
              >
                <option value="ALL">All Divisions</option>
                <option value="TECHNOLOGY">💻 Technology</option>
                <option value="DESIGN">🎨 Product &amp; Design</option>
                <option value="GROWTH">📈 Growth &amp; Referrals</option>
                <option value="COMMUNITY">🌍 Community &amp; Campus</option>
                <option value="OPERATIONS">⚙️ Operations &amp; QA</option>
                <option value="BUSINESS">🤝 Business &amp; Partnerships</option>
              </select>
            </div>
          </div>

          {/* Proofs Table */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', borderRadius: 18,
            border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '14px 18px', fontSize: 11.5, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Reference / Date</th>
                  <th style={{ padding: '14px 18px', fontSize: 11.5, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Contributor</th>
                  <th style={{ padding: '14px 18px', fontSize: 11.5, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Target Rank</th>
                  <th style={{ padding: '14px 18px', fontSize: 11.5, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Mission &amp; Category</th>
                  <th style={{ padding: '14px 18px', fontSize: 11.5, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Evidence</th>
                  <th style={{ padding: '14px 18px', fontSize: 11.5, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '14px 18px', fontSize: 11.5, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '48px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                      No task completion proofs found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map(task => (
                    <tr
                      key={task.id}
                      onClick={() => handleOpenTaskModal(task)}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        cursor: 'pointer', transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '16px 18px' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace', color: RF_MINT_ACCENT, display: 'block' }}>
                          {task.reference_id}
                        </span>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
                          {new Date(task.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td style={{ padding: '16px 18px' }}>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: '#FFFFFF', display: 'block' }}>
                          {task.full_name}
                        </span>
                        <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', display: 'block' }}>
                          {task.email}
                        </span>
                        <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                          {task.application_number && (
                            <span style={{ fontSize: 10.5, fontFamily: 'monospace', color: RF_MINT_ACCENT, background: 'rgba(24, 252, 92, 0.08)', padding: '1px 6px', borderRadius: 4 }}>
                              {task.application_number}
                            </span>
                          )}
                          {task.pioneer_id && (
                            <span style={{ fontSize: 10.5, fontFamily: 'monospace', fontWeight: 700, color: RF_GOLD_YELLOW, background: 'rgba(246, 178, 26, 0.1)', padding: '1px 6px', borderRadius: 4 }}>
                              {task.pioneer_id}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px 18px' }}>
                        <span style={{
                          padding: '3px 9px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                          background: task.target_level === 'LEVEL_2' ? `${RF_MINT_ACCENT}15` : `${RF_GOLD_YELLOW}15`,
                          border: `1px solid ${task.target_level === 'LEVEL_2' ? RF_MINT_ACCENT : RF_GOLD_YELLOW}55`,
                          color: task.target_level === 'LEVEL_2' ? RF_MINT_ACCENT : RF_GOLD_YELLOW
                        }}>
                          {task.target_level.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '16px 18px' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF', display: 'block', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {task.task_title}
                        </span>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                          {task.task_category}
                        </span>
                      </td>
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <ImageIcon size={14} color={task.screenshots.length > 0 ? RF_MINT_ACCENT : 'rgba(255,255,255,0.4)'} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: task.screenshots.length > 0 ? '#FFFFFF' : 'rgba(255,255,255,0.4)' }}>
                            {task.screenshots.length} Screenshot{task.screenshots.length === 1 ? '' : 's'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 18px' }}>
                        {renderTaskStatusBadge(task.status)}
                      </td>
                      <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                        <button
                          onClick={e => { e.stopPropagation(); handleOpenTaskModal(task); }}
                          style={{
                            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)',
                            color: '#FFFFFF', padding: '6px 14px', borderRadius: 100, fontSize: 12,
                            fontWeight: 500, cursor: 'pointer'
                          }}
                        >
                          Review Proof
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── PIONEER MEMBERS & PROFILES MANAGEMENT TAB ────────────────────────── */}
      {adminTab === 'members' && (
        <div>
          {/* Action Feedback Banner */}
          {memberActionFeedback && (
            <div style={{
              background: 'rgba(24, 252, 92, 0.12)', border: `1px solid ${RF_LEAF_GREEN}66`,
              padding: '12px 18px', borderRadius: 12, marginBottom: 20, display: 'flex',
              alignItems: 'center', gap: 10, color: '#FFFFFF', fontSize: 13.5
            }}>
              <CheckCircle2 size={18} color={RF_MINT_ACCENT} />
              <span>{memberActionFeedback}</span>
            </div>
          )}

          {/* Header with Title & Refresh */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 28, flexWrap: 'wrap', gap: 16
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 6px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                  Pioneer Members &amp; Contributor Profiles
                </h2>
                <span style={{
                  fontSize: 10.5, fontWeight: 700, background: 'rgba(24, 252, 92, 0.12)',
                  color: RF_MINT_ACCENT, border: `1px solid ${RF_LEAF_GREEN}44`,
                  padding: '3px 10px', borderRadius: 100, display: 'inline-flex', alignItems: 'center', gap: 4,
                  textTransform: 'uppercase'
                }}>
                  <Users size={11} /> {membersList.length} Registered Pioneers
                </span>
              </div>
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.65)', margin: 0, maxWidth: 760 }}>
                Comprehensive directory of verified pioneer community members. Review full legal identities, permanent Date of Birth records, banking settlements, survey reasoning submissions, and enforce account suspension.
              </p>
            </div>

            <button
              onClick={refreshMembers}
              style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)',
                color: '#FFFFFF', padding: '10px 20px', borderRadius: 100, fontSize: 13,
                fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            >
              <RefreshCw size={14} /> Refresh Directory
            </button>
          </div>

          {/* Members KPI Cards */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16, marginBottom: 32
          }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Pioneers</span>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#FFFFFF', marginTop: 4 }}>{memberStats.total}</div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Enrolled in network</span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Active Pioneers</span>
              <div style={{ fontSize: 32, fontWeight: 700, color: RF_MINT_ACCENT, marginTop: 4 }}>{memberStats.active}</div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Good standing &amp; active</span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Suspended Accounts</span>
              <div style={{ fontSize: 32, fontWeight: 700, color: memberStats.suspended > 0 ? '#EF4444' : 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                {memberStats.suspended}
              </div>
              <span style={{ fontSize: 12, color: memberStats.suspended > 0 ? '#FCA5A5' : 'rgba(255,255,255,0.5)' }}>Access restricted</span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Completed Profiles</span>
              <div style={{ fontSize: 32, fontWeight: 700, color: RF_GOLD_YELLOW, marginTop: 4 }}>{memberStats.completed}</div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>With permanent DOB &amp; details</span>
            </div>
          </div>

          {/* Members Search & Filter Controls */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', borderRadius: 18, padding: '18px 22px',
            border: '1px solid rgba(255,255,255,0.08)', marginBottom: 24,
            display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', justifyContent: 'space-between'
          }}>
            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 280px', minWidth: 240 }}>
              <Search size={16} color="rgba(255,255,255,0.4)" />
              <input
                type="text"
                placeholder="Search by name, email, Pioneer ID, App #, country..."
                value={memberSearchTerm}
                onChange={e => setMemberSearchTerm(e.target.value)}
                style={{
                  background: 'none', border: 'none', color: '#FFFFFF', fontSize: 14,
                  width: '100%', outline: 'none'
                }}
              />
              {memberSearchTerm && (
                <button
                  onClick={() => setMemberSearchTerm('')}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Account Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Status:</span>
              <select
                value={memberStatusFilter}
                onChange={e => setMemberStatusFilter(e.target.value as any)}
                style={{
                  background: 'rgba(15, 46, 30, 0.95)', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#FFFFFF', padding: '6px 12px', borderRadius: 8, fontSize: 12.5, outline: 'none'
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Only</option>
                <option value="SUSPENDED">Suspended Only</option>
              </select>
            </div>

            {/* Squad Division Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Squad:</span>
              <select
                value={memberDivisionFilter}
                onChange={e => setMemberDivisionFilter(e.target.value)}
                style={{
                  background: 'rgba(15, 46, 30, 0.95)', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#FFFFFF', padding: '6px 12px', borderRadius: 8, fontSize: 12.5, outline: 'none'
                }}
              >
                <option value="ALL">All Squads</option>
                <option value="TECHNOLOGY">Technology</option>
                <option value="DESIGN">Design</option>
                <option value="GROWTH">Growth</option>
                <option value="COMMUNITY">Community</option>
                <option value="OPERATIONS">Operations</option>
                <option value="BUSINESS">Business</option>
              </select>
            </div>

            {/* Contributor Rank Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Rank:</span>
              <select
                value={memberLevelFilter}
                onChange={e => setMemberLevelFilter(e.target.value)}
                style={{
                  background: 'rgba(15, 46, 30, 0.95)', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#FFFFFF', padding: '6px 12px', borderRadius: 8, fontSize: 12.5, outline: 'none'
                }}
              >
                <option value="ALL">All Tiers</option>
                <option value="LEVEL_1">Level 1 (Pioneer Associate)</option>
                <option value="LEVEL_2">Level 2 (Lead Builder)</option>
                <option value="LEVEL_3">Level 3 (Squad Architect)</option>
                <option value="LEVEL_4">Level 4 (Division Strategist)</option>
                <option value="LEVEL_5">Level 5 (Founding Partner)</option>
              </select>
            </div>
          </div>

          {/* Members Table */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Member / Pioneer</th>
                  <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pioneer ID &amp; App #</th>
                  <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Squad &amp; Rank</th>
                  <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date of Birth</th>
                  <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Location</th>
                  <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Account Status</th>
                  <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '48px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                      No pioneer members found matching your search and filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map(member => {
                    const initials = member.full_name
                      .split(' ')
                      .map(n => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();

                    return (
                      <tr
                        key={member.id}
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          background: member.is_suspended ? 'rgba(239, 68, 68, 0.04)' : 'transparent',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = member.is_suspended ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255,255,255,0.02)')}
                        onMouseLeave={e => (e.currentTarget.style.background = member.is_suspended ? 'rgba(239, 68, 68, 0.04)' : 'transparent')}
                      >
                        {/* Member Identity */}
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {member.avatar_url ? (
                              <img
                                src={member.avatar_url}
                                alt={member.full_name}
                                style={{
                                  width: 40, height: 40, borderRadius: '50%', objectFit: 'cover',
                                  border: `2px solid ${member.is_suspended ? '#EF4444' : RF_LEAF_GREEN}`
                                }}
                              />
                            ) : (
                              <div style={{
                                width: 40, height: 40, borderRadius: '50%',
                                background: member.is_suspended ? 'rgba(239, 68, 68, 0.2)' : `${RF_LEAF_GREEN}25`,
                                border: `1px solid ${member.is_suspended ? '#EF4444' : RF_LEAF_GREEN}66`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: member.is_suspended ? '#FCA5A5' : RF_MINT_ACCENT,
                                fontSize: 13, fontWeight: 700
                              }}>
                                {initials || 'RP'}
                              </div>
                            )}
                              <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>
                                  {member.full_name}
                                </span>
                                {member.is_profile_completed && (
                                  <span title="Profile Completed" style={{ display: 'inline-flex' }}>
                                    <CheckCircle2 size={13} color={RF_MINT_ACCENT} />
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                                {member.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Pioneer ID & Application Number */}
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(24, 252, 92, 0.08)', border: '1px solid rgba(24, 252, 92, 0.2)', padding: '3px 8px', borderRadius: 6 }}>
                            <Award size={12} color={RF_MINT_ACCENT} />
                            <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: RF_MINT_ACCENT }}>
                              {member.pioneer_id || 'PENDING'}
                            </span>
                          </div>
                          {member.application_number && (
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4, fontFamily: 'monospace' }}>
                              {member.application_number}
                            </div>
                          )}
                        </td>

                        {/* Squad & Rank */}
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#FFFFFF', marginBottom: 4 }}>
                            {member.division || 'Unassigned'}
                          </div>
                          <span style={{
                            fontSize: 10.5, fontWeight: 700,
                            color: RF_GOLD_YELLOW, background: 'rgba(255, 209, 102, 0.1)',
                            border: '1px solid rgba(255, 209, 102, 0.3)',
                            padding: '2px 7px', borderRadius: 100, textTransform: 'uppercase'
                          }}>
                            {(member.contributor_level || 'LEVEL_1').replace('_', ' ')}
                          </span>
                        </td>

                        {/* Date of Birth */}
                        <td style={{ padding: '16px 20px' }}>
                          {member.date_of_birth ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Calendar size={13} color={RF_MINT_ACCENT} />
                              <span style={{ fontSize: 12.5, fontWeight: 600, color: '#FFFFFF' }}>
                                {member.date_of_birth}
                              </span>
                              <span title="Permanent & Non-editable" style={{ display: 'inline-flex' }}>
                                <Lock size={10} color="rgba(255,255,255,0.4)" />
                              </span>
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>
                              Not provided
                            </span>
                          )}
                        </td>

                        {/* Location */}
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.85)' }}>
                            {member.city ? `${member.city}, ` : ''}{member.country || 'Global'}
                          </div>
                          {member.institution && (
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                              {member.institution}
                            </div>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td style={{ padding: '16px 20px' }}>
                          {member.is_suspended ? (
                            <div>
                              <span style={{
                                padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                                background: 'rgba(239, 68, 68, 0.18)', color: '#FCA5A5',
                                border: '1px solid #EF4444', display: 'inline-flex', alignItems: 'center', gap: 4
                              }}>
                                <Ban size={11} /> SUSPENDED
                              </span>
                              {member.suspension_reason && (
                                <div style={{ fontSize: 11, color: '#FCA5A5', marginTop: 4, maxWidth: 170, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={member.suspension_reason}>
                                  {member.suspension_reason}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{
                              padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                              background: 'rgba(24, 252, 92, 0.15)', color: RF_MINT_ACCENT,
                              border: `1px solid ${RF_LEAF_GREEN}`, display: 'inline-flex', alignItems: 'center', gap: 4
                            }}>
                              <CheckCircle2 size={11} /> ACTIVE
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <button
                              onClick={() => handleOpenMemberModal(member)}
                              style={{
                                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)',
                                color: '#FFFFFF', padding: '6px 14px', borderRadius: 100, fontSize: 12,
                                fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                                transition: 'all 0.15s'
                              }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                            >
                              <Eye size={12} /> View Profile
                            </button>

                            {member.is_suspended ? (
                              <button
                                onClick={() => handleReactivateMember(member)}
                                style={{
                                  background: 'rgba(24, 252, 92, 0.12)', border: `1px solid ${RF_LEAF_GREEN}66`,
                                  color: RF_MINT_ACCENT, padding: '6px 14px', borderRadius: 100, fontSize: 12,
                                  fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                                  transition: 'all 0.15s'
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(24, 252, 92, 0.22)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(24, 252, 92, 0.12)')}
                              >
                                <CheckCircle2 size={12} /> Reactivate
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenSuspendModal(member)}
                                style={{
                                  background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)',
                                  color: '#FCA5A5', padding: '6px 14px', borderRadius: 100, fontSize: 12,
                                  fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                                  transition: 'all 0.15s'
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.22)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)')}
                              >
                                <Ban size={12} /> Suspend
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── REVIEW TEAM & WORKERS MANAGEMENT TAB ──────────────────────────────── */}
      {adminTab === 'workers' && (
        <div>
          {/* Header with Title & "+ Add Worker" CTA */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 28, flexWrap: 'wrap', gap: 16
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 6px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                  Review Team &amp; Squad Workers
                </h2>
                {isSuperAdmin ? (
                  <span style={{
                    fontSize: 10.5, fontWeight: 700, background: 'rgba(24, 252, 92, 0.12)',
                    color: RF_MINT_ACCENT, border: `1px solid ${RF_LEAF_GREEN}44`,
                    padding: '3px 10px', borderRadius: 100, display: 'inline-flex', alignItems: 'center', gap: 4,
                    textTransform: 'uppercase'
                  }}>
                    <Shield size={11} /> Super Admin Privilege Active
                  </span>
                ) : (
                  <span style={{
                    fontSize: 10.5, fontWeight: 700, background: 'rgba(255, 209, 102, 0.12)',
                    color: RF_GOLD_YELLOW, border: `1px solid ${RF_GOLD_YELLOW}44`,
                    padding: '3px 10px', borderRadius: 100, display: 'inline-flex', alignItems: 'center', gap: 4,
                    textTransform: 'uppercase'
                  }}>
                    <Lock size={11} /> Read-Only Staff Directory
                  </span>
                )}
              </div>
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.65)', margin: 0, maxWidth: 680 }}>
                Delegate admissions evaluation, task verification, and squad level reviews to verified workers. Suspending, modifying, and adding new workers is exclusively reserved for Super Admin (Tonye Taylor).
              </p>
            </div>

            {isSuperAdmin ? (
              <button
                onClick={() => {
                  setNewWorkerPasscode(`worker26_${Math.floor(100 + Math.random() * 900)}`);
                  setWorkerFormError('');
                  setAddWorkerModalOpen(true);
                }}
                style={{
                  background: RF_LEAF_GREEN, color: RF_DEEP_GREEN, border: 'none',
                  padding: '12px 22px', borderRadius: 100, fontSize: 13.5, fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: `0 4px 16px ${RF_LEAF_GREEN}44`, transition: 'all 0.2s'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = RF_MINT_ACCENT)}
                onMouseLeave={e => (e.currentTarget.style.background = RF_LEAF_GREEN)}
              >
                <UserPlus size={16} />
                Add New Worker
              </button>
            ) : (
              <div style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
                padding: '9px 18px', borderRadius: 100, fontSize: 12.5, color: 'rgba(255,255,255,0.5)',
                display: 'flex', alignItems: 'center', gap: 6
              }}>
                <Lock size={13} color={RF_GOLD_YELLOW} />
                Worker provisioning reserved for Super Admin
              </div>
            )}
          </div>

          {/* Workers KPI Metrics */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16, marginBottom: 32
          }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Review Staff</span>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#FFFFFF', marginTop: 4 }}>{staffList.length}</div>
              <span style={{ fontSize: 12, color: RF_MINT_ACCENT }}>Provisioned accounts</span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Active Reviewers</span>
              <div style={{ fontSize: 32, fontWeight: 700, color: RF_MINT_ACCENT, marginTop: 4 }}>
                {staffList.filter(s => s.status === 'ACTIVE').length}
              </div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Authorized to verify</span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Reviews Handled</span>
              <div style={{ fontSize: 32, fontWeight: 700, color: RF_GOLD_YELLOW, marginTop: 4 }}>
                {staffList.reduce((acc, s) => acc + (s.reviews_count || 0), 0)}
              </div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Decisions &amp; promotions logged</span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Root Super Admin</span>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginTop: 8 }}>
                Tonye Taylor
              </div>
              <span style={{ fontSize: 12, color: RF_GOLD_YELLOW }}>Platform Architect</span>
            </div>
          </div>

          {/* Workers Filter & Search Bar */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', borderRadius: 18, padding: '18px 22px',
            border: '1px solid rgba(255,255,255,0.08)', marginBottom: 24,
            display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', justifyContent: 'space-between'
          }}>
            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 280px', minWidth: 240 }}>
              <Search size={16} color="rgba(255,255,255,0.4)" />
              <input
                type="text"
                placeholder="Search worker by name, email, or division..."
                value={staffSearchTerm}
                onChange={e => setStaffSearchTerm(e.target.value)}
                style={{
                  background: 'none', border: 'none', color: '#FFFFFF', fontSize: 14,
                  width: '100%', outline: 'none'
                }}
              />
              {staffSearchTerm && (
                <button
                  onClick={() => setStaffSearchTerm('')}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Role Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Role:</span>
              <select
                value={staffRoleFilter}
                onChange={e => setStaffRoleFilter(e.target.value)}
                style={{
                  background: 'rgba(15, 46, 30, 0.95)', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#FFFFFF', padding: '6px 12px', borderRadius: 8, fontSize: 12.5, outline: 'none'
                }}
              >
                <option value="ALL">All Roles</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMISSIONS_REVIEWER">Admissions Reviewer</option>
                <option value="TASK_VERIFIER">Task Verifier</option>
                <option value="SQUAD_LEAD">Squad Lead</option>
              </select>
            </div>
          </div>

          {/* Workers Table */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Worker / Reviewer</th>
                  <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Role</th>
                  <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Assigned Squad</th>
                  <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Access Passcode</th>
                  <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Reviews Handled</th>
                  <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</th>
                  <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '48px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                      No workers found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map(member => {
                    const isRevealed = !!revealedPasscodes[member.id];
                    const isRootSuperAdmin = member.passcode === 'refeir2026';

                    return (
                      <tr
                        key={member.id}
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        {/* Worker Identity */}
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: '50%',
                              background: member.role === 'SUPER_ADMIN' ? `${RF_GOLD_YELLOW}25` : `${RF_LEAF_GREEN}20`,
                              border: `1px solid ${member.role === 'SUPER_ADMIN' ? RF_GOLD_YELLOW : RF_LEAF_GREEN}55`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: member.role === 'SUPER_ADMIN' ? RF_GOLD_YELLOW : RF_MINT_ACCENT,
                              fontWeight: 800, fontSize: 14
                            }}>
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>
                                {member.name}
                              </div>
                              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)' }}>
                                {member.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td style={{ padding: '16px 20px' }}>
                          {renderStaffRoleBadge(member.role)}
                        </td>

                        {/* Squad */}
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{
                            fontSize: 12, fontWeight: 600,
                            color: member.assigned_division === 'ALL' ? RF_MINT_ACCENT : 'rgba(255,255,255,0.85)',
                            background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 6
                          }}>
                            {member.assigned_division === 'ALL' ? '🌐 All Squads' : member.assigned_division}
                          </span>
                        </td>

                        {/* Passcode */}
                        <td style={{ padding: '16px 20px' }}>
                          {isSuperAdmin ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}>
                              <span style={{ fontFamily: 'monospace', fontSize: 12, color: isRevealed ? RF_MINT_ACCENT : 'rgba(255,255,255,0.5)', minWidth: 74 }}>
                                {isRevealed ? member.passcode : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => setRevealedPasscodes(prev => ({ ...prev, [member.id]: !prev[member.id] }))}
                                title={isRevealed ? 'Hide passcode' : 'Show passcode'}
                                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 2 }}
                              >
                                {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopyPasscode(member.id, member.passcode)}
                                title="Copy passcode"
                                style={{ background: 'none', border: 'none', color: copiedPasscodeId === member.id ? RF_MINT_ACCENT : 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 2 }}
                              >
                                <Copy size={13} />
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: 'monospace' }}>
                              <Lock size={12} color="rgba(255,255,255,0.3)" /> ••••••••
                            </div>
                          )}
                        </td>

                        {/* Reviews Conducted */}
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF' }}>
                            {member.reviews_count}
                          </span>
                          <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.45)', marginLeft: 4 }}>
                            verified
                          </span>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{
                            padding: '3px 9px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                            background: member.status === 'ACTIVE' ? 'rgba(24, 252, 92, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: member.status === 'ACTIVE' ? RF_MINT_ACCENT : '#FCA5A5',
                            border: `1px solid ${member.status === 'ACTIVE' ? RF_LEAF_GREEN : '#EF4444'}`
                          }}>
                            {member.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            {isSuperAdmin ? (
                              <>
                                {!isRootSuperAdmin && (
                                  <button
                                    onClick={() => handleToggleStaff(member.id)}
                                    style={{
                                      background: member.status === 'ACTIVE' ? 'rgba(244, 124, 32, 0.1)' : 'rgba(24, 252, 92, 0.1)',
                                      border: `1px solid ${member.status === 'ACTIVE' ? RF_ORANGE : RF_LEAF_GREEN}44`,
                                      color: member.status === 'ACTIVE' ? '#FFB27D' : RF_MINT_ACCENT,
                                      padding: '5px 12px', borderRadius: 100, fontSize: 11.5, fontWeight: 600,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {member.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                                  </button>
                                )}

                                {!isRootSuperAdmin ? (
                                  <button
                                    onClick={() => handleDeleteStaff(member.id)}
                                    title="Delete worker account"
                                    style={{
                                      background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                                      color: '#FCA5A5', padding: '6px', borderRadius: 8, cursor: 'pointer',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                ) : (
                                  <span style={{ fontSize: 11, color: RF_GOLD_YELLOW, fontStyle: 'italic', fontWeight: 600 }}>
                                    ★ Super Admin
                                  </span>
                                )}
                              </>
                            ) : (
                              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <Lock size={11} /> View only
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── CERTIFICATE ISSUANCE & ACCREDITATIONS TAB ───────────────────────── */}
      {adminTab === 'certificates' && (
        <div>
          {/* Action Feedback Banner */}
          {certFeedbackMsg && (
            <div style={{
              background: 'rgba(24, 252, 92, 0.12)', border: `1px solid ${RF_LEAF_GREEN}66`,
              padding: '12px 18px', borderRadius: 12, marginBottom: 20, display: 'flex',
              alignItems: 'center', gap: 10, color: '#FFFFFF', fontSize: 13.5
            }}>
              <CheckCircle2 size={18} color={RF_MINT_ACCENT} />
              <span>{certFeedbackMsg}</span>
            </div>
          )}

          {/* Header with Title, "+ Issue Certificate" CTA & Refresh */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 28, flexWrap: 'wrap', gap: 16
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 6px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                  Pioneer Certificates &amp; Level Accreditations
                </h2>
                <span style={{
                  fontSize: 10.5, fontWeight: 700, background: 'rgba(255, 209, 102, 0.12)',
                  color: RF_GOLD_YELLOW, border: `1px solid ${RF_GOLD_YELLOW}55`,
                  padding: '3px 10px', borderRadius: 100, display: 'inline-flex', alignItems: 'center', gap: 4,
                  textTransform: 'uppercase'
                }}>
                  <Award size={11} /> {certificatesList.length} Accreditations Minted
                </span>
              </div>
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.65)', margin: 0, maxWidth: 780 }}>
                Official sovereign credential registry. Issue, monitor, print, and inspect cryptographic Certificates of Level Completion awarded to contributors who successfully complete verified proof-of-work quotas.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => handleOpenIssueCertModal()}
                style={{
                  background: RF_LEAF_GREEN, color: RF_DEEP_GREEN, border: 'none',
                  padding: '10px 20px', borderRadius: 100, fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  boxShadow: `0 4px 14px ${RF_LEAF_GREEN}44`, transition: 'all 0.2s'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = RF_MINT_ACCENT)}
                onMouseLeave={e => (e.currentTarget.style.background = RF_LEAF_GREEN)}
              >
                <Award size={15} /> Issue New Certificate
              </button>

              <button
                onClick={refreshCertificates}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)',
                  color: '#FFFFFF', padding: '10px 18px', borderRadius: 100, fontSize: 13,
                  fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          </div>

          {/* Certificate KPI Metrics */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16, marginBottom: 32
          }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Certificates</span>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#FFFFFF', marginTop: 4 }}>{certificateStats.total}</div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>All minted credentials</span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Level 1 Passes</span>
              <div style={{ fontSize: 32, fontWeight: 700, color: RF_MINT_ACCENT, marginTop: 4 }}>{certificateStats.level1}</div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Orientation &amp; onboarding</span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Advanced Tier Awards</span>
              <div style={{ fontSize: 32, fontWeight: 700, color: RF_GOLD_YELLOW, marginTop: 4 }}>{certificateStats.advanced}</div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Level 2 through Level 5</span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Active Verifiable</span>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#38BDF8', marginTop: 4 }}>
                {certificateStats.total - certificateStats.revoked}
              </div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Tamper-evident status</span>
            </div>
          </div>

          {/* Certificate Filter & Search Bar */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', borderRadius: 18, padding: '18px 22px',
            border: '1px solid rgba(255,255,255,0.08)', marginBottom: 24,
            display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', justifyContent: 'space-between'
          }}>
            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 280px', minWidth: 240 }}>
              <Search size={16} color="rgba(255,255,255,0.4)" />
              <input
                type="text"
                placeholder="Search by recipient name, email, Pioneer ID, serial number..."
                value={certSearchTerm}
                onChange={e => setCertSearchTerm(e.target.value)}
                style={{
                  background: 'none', border: 'none', color: '#FFFFFF', fontSize: 14,
                  width: '100%', outline: 'none'
                }}
              />
              {certSearchTerm && (
                <button
                  onClick={() => setCertSearchTerm('')}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Level Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Tier Level:</span>
              <select
                value={certLevelFilter}
                onChange={e => setCertLevelFilter(e.target.value)}
                style={{
                  background: 'rgba(15, 46, 30, 0.95)', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#FFFFFF', padding: '6px 12px', borderRadius: 8, fontSize: 12.5, outline: 'none'
                }}
              >
                <option value="ALL">All Levels</option>
                <option value="LEVEL_1">Level 1: Pioneer Associate</option>
                <option value="LEVEL_2">Level 2: Refeir Pioneer (15+ jobs)</option>
                <option value="LEVEL_3">Level 3: Refeir Builder (40+ jobs)</option>
                <option value="LEVEL_4">Level 4: Refeir Lead (75+ jobs)</option>
                <option value="LEVEL_5">Level 5: Refeir Core Team (125+ jobs)</option>
              </select>
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Status:</span>
              <select
                value={certStatusFilter}
                onChange={e => setCertStatusFilter(e.target.value as any)}
                style={{
                  background: 'rgba(15, 46, 30, 0.95)', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#FFFFFF', padding: '6px 12px', borderRadius: 8, fontSize: 12.5, outline: 'none'
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="ISSUED">Active (Issued)</option>
                <option value="REVOKED">Revoked</option>
              </select>
            </div>
          </div>

          {/* Certificates Table */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Certificate Serial &amp; Hash</th>
                  <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Recipient Pioneer</th>
                  <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Certified Level</th>
                  <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Squad</th>
                  <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Verified Tasks</th>
                  <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Issued At</th>
                  <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</th>
                  <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCertificates.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '48px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                      No certificates found matching your search. Click "+ Issue New Certificate" to mint one.
                    </td>
                  </tr>
                ) : (
                  filteredCertificates.map(cert => (
                    <tr
                      key={cert.id}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Certificate Serial */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontFamily: 'monospace', fontSize: 12.5, fontWeight: 700, color: RF_GOLD_YELLOW }}>
                          {cert.id}
                        </div>
                        <div style={{ fontSize: 10.5, fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>
                          {cert.verification_hash.slice(0, 16)}...
                        </div>
                      </td>

                      {/* Recipient Pioneer */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#FFFFFF' }}>
                          {cert.recipient_name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                          <span style={{
                            fontFamily: 'monospace', fontSize: 11, color: RF_MINT_ACCENT,
                            background: 'rgba(24, 252, 92, 0.08)', padding: '1px 6px', borderRadius: 4
                          }}>
                            {cert.pioneer_id}
                          </span>
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
                            {cert.recipient_email}
                          </span>
                        </div>
                      </td>

                      {/* Certified Level */}
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          fontSize: 11.5, fontWeight: 700,
                          background: 'rgba(255, 209, 102, 0.12)', color: RF_GOLD_YELLOW,
                          border: `1px solid ${RF_GOLD_YELLOW}55`, padding: '4px 10px',
                          borderRadius: 100, display: 'inline-flex', alignItems: 'center', gap: 4
                        }}>
                          <Award size={12} /> {cert.level_title}
                        </span>
                      </td>

                      {/* Squad Division */}
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)',
                          background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 6
                        }}>
                          {cert.division}
                        </span>
                      </td>

                      {/* Verified Deliverables */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF' }}>
                          {cert.verified_jobs_count > 0 ? `${cert.verified_jobs_count} jobs` : 'Orientation'}
                        </div>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
                          approved deliverables
                        </span>
                      </td>

                      {/* Issued Date & Authority */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: 12.5, color: '#FFFFFF' }}>
                          {new Date(cert.issued_at).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.45)', marginTop: 2, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={cert.issued_by}>
                          {cert.issued_by}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 20px' }}>
                        {cert.status === 'ISSUED' ? (
                          <span style={{
                            padding: '3px 9px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                            background: 'rgba(24, 252, 92, 0.15)', color: RF_MINT_ACCENT,
                            border: `1px solid ${RF_LEAF_GREEN}`
                          }}>
                            ACTIVE
                          </span>
                        ) : (
                          <span style={{
                            padding: '3px 9px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                            background: 'rgba(239, 68, 68, 0.15)', color: '#FCA5A5',
                            border: '1px solid #EF4444'
                          }}>
                            REVOKED
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <button
                            onClick={() => handleViewCertificate(cert)}
                            style={{
                              background: 'rgba(255, 209, 102, 0.12)', border: `1px solid ${RF_GOLD_YELLOW}55`,
                              color: RF_GOLD_YELLOW, padding: '5px 12px', borderRadius: 100, fontSize: 11.5,
                              fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4
                            }}
                          >
                            <Eye size={12} /> Inspect
                          </button>

                          {cert.status === 'ISSUED' && (
                            <button
                              onClick={() => handleRevokeCertificate(cert.id)}
                              style={{
                                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#FCA5A5', padding: '5px 10px', borderRadius: 100, fontSize: 11,
                                cursor: 'pointer'
                              }}
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── SQUAD TASKS & DAILY BOUNTIES MANAGEMENT TAB ─────────────────────── */}
      {adminTab === 'tasks' && (
        <div>
          {/* Action Feedback Banner */}
          {taskFeedbackMsg && (
            <div style={{
              background: 'rgba(24, 252, 92, 0.12)', border: `1px solid ${RF_LEAF_GREEN}66`,
              padding: '12px 18px', borderRadius: 12, marginBottom: 20, display: 'flex',
              alignItems: 'center', gap: 10, color: '#FFFFFF', fontSize: 13.5
            }}>
              <CheckCircle2 size={18} color={RF_MINT_ACCENT} />
              <span>{taskFeedbackMsg}</span>
            </div>
          )}

          {/* Header with Title, "+ Announce Daily/Weekly Task" CTA & Refresh */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 28, flexWrap: 'wrap', gap: 16
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 6px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                  Daily Squad Tasks &amp; Bounties Management
                </h2>
                <span style={{
                  fontSize: 10.5, fontWeight: 700, background: 'rgba(24, 252, 92, 0.12)',
                  color: RF_MINT_ACCENT, border: `1px solid ${RF_MINT_ACCENT}55`,
                  padding: '3px 10px', borderRadius: 100, display: 'inline-flex', alignItems: 'center', gap: 4,
                  textTransform: 'uppercase'
                }}>
                  <Radio size={11} /> {squadTaskStats.active} Active Missions
                </span>
              </div>
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.65)', margin: 0, maxWidth: 820 }}>
                Announce daily and weekly tasks for each squad or the General community. Squad leads can distribute tasks directly to their official WhatsApp groups with pre-formatted broadcasts, incentivized by Airtime giveaways, Data subscriptions, Monetary cash bounties, and verified deliverable credits.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => setNewTaskModalOpen(true)}
                style={{
                  background: RF_LEAF_GREEN, color: RF_DEEP_GREEN, border: 'none',
                  padding: '10px 20px', borderRadius: 100, fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  boxShadow: `0 4px 14px ${RF_LEAF_GREEN}44`, transition: 'all 0.2s'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = RF_MINT_ACCENT)}
                onMouseLeave={e => (e.currentTarget.style.background = RF_LEAF_GREEN)}
              >
                <Radio size={14} /> Squad Lead Broadcast Protocol
              </button>

              <button
                onClick={refreshTasks}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)',
                  color: '#FFFFFF', padding: '10px 18px', borderRadius: 100, fontSize: 13,
                  fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          </div>

          {/* KPI Metrics */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16, marginBottom: 32
          }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Active Squad Missions</span>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#FFFFFF', marginTop: 4 }}>{squadTaskStats.active}</div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Across 6 squads &amp; general</span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Incentivized Bounties</span>
              <div style={{ fontSize: 32, fontWeight: 700, color: RF_MINT_ACCENT, marginTop: 4 }}>{squadTaskStats.bounties}</div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                {squadTaskStats.airtime} Airtime • {squadTaskStats.data} Data • {squadTaskStats.cash} Cash
              </span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Daily Tasks Today</span>
              <div style={{ fontSize: 32, fontWeight: 700, color: RF_GOLD_YELLOW, marginTop: 4 }}>{squadTaskStats.daily}</div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>24-hour fast sprints</span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Announcements</span>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#38BDF8', marginTop: 4 }}>{squadTaskStats.total}</div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Lifetime missions cataloged</span>
            </div>
          </div>

          {/* Search and Filters */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', borderRadius: 18, padding: '18px 22px',
            border: '1px solid rgba(255,255,255,0.08)', marginBottom: 24, display: 'flex',
            flexWrap: 'wrap', gap: 14, alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 260px',
              background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10, padding: '8px 14px'
            }}>
              <Search size={16} color="rgba(255,255,255,0.4)" />
              <input
                type="text"
                value={taskSearchTerm}
                onChange={e => setTaskSearchTerm(e.target.value)}
                placeholder="Search missions, rewards, descriptions..."
                style={{
                  background: 'transparent', border: 'none', outline: 'none',
                  color: '#FFFFFF', fontSize: 13, width: '100%'
                }}
              />
              {taskSearchTerm && (
                <button
                  onClick={() => setTaskSearchTerm('')}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 11 }}
                >
                  Clear
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Squad Filter */}
              <select
                value={taskSquadFilter}
                onChange={e => setTaskSquadFilter(e.target.value)}
                style={{
                  background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#FFFFFF', borderRadius: 8, padding: '8px 12px', fontSize: 12.5, outline: 'none'
                }}
              >
                <option value="ALL">All Squads &amp; Divisions</option>
                <option value="GENERAL">General Community (All)</option>
                <option value="TECHNOLOGY">Technology &amp; Protocol</option>
                <option value="CREATIVE">Brand &amp; Creative</option>
                <option value="GROWTH">Growth &amp; Virality</option>
                <option value="COMMUNITY">Community &amp; Culture</option>
                <option value="OPERATIONS">Operations &amp; Delivery</option>
                <option value="ENTERPRISE">Enterprise &amp; BD</option>
              </select>

              {/* Bounty Filter */}
              <select
                value={taskBountyFilter}
                onChange={e => setTaskBountyFilter(e.target.value)}
                style={{
                  background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#FFFFFF', borderRadius: 8, padding: '8px 12px', fontSize: 12.5, outline: 'none'
                }}
              >
                <option value="ALL">All Bounty Types</option>
                <option value="AIRTIME_GIVEAWAY">Airtime Giveaways</option>
                <option value="DATA_SUBSCRIPTION">Data Subscriptions</option>
                <option value="MONETARY_CASH">Monetary Cash Bounties</option>
                <option value="SOVEREIGN_XP">Sovereign XP Only</option>
              </select>

              {/* Frequency Filter */}
              <select
                value={taskFrequencyFilter}
                onChange={e => setTaskFrequencyFilter(e.target.value)}
                style={{
                  background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#FFFFFF', borderRadius: 8, padding: '8px 12px', fontSize: 12.5, outline: 'none'
                }}
              >
                <option value="ALL">All Cycles</option>
                <option value="DAILY">Daily Tasks</option>
                <option value="WEEKLY">Weekly Tasks</option>
                <option value="FLASH_BOUNTY">Flash Bounties</option>
              </select>

              {/* Status Filter */}
              <select
                value={taskStatusFilter}
                onChange={e => setTaskStatusFilter(e.target.value as any)}
                style={{
                  background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#FFFFFF', borderRadius: 8, padding: '8px 12px', fontSize: 12.5, outline: 'none'
                }}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active Only</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          {/* Tasks Table */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', borderRadius: 18,
            border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '16px 20px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 11.5, textTransform: 'uppercase' }}>Target Squad &amp; Mission</th>
                  <th style={{ padding: '16px 20px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 11.5, textTransform: 'uppercase' }}>Cycle &amp; Deadline</th>
                  <th style={{ padding: '16px 20px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 11.5, textTransform: 'uppercase' }}>Special Bounty Incentive</th>
                  <th style={{ padding: '16px 20px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 11.5, textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 20px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 11.5, textTransform: 'uppercase', textAlign: 'right' }}>Broadcast &amp; Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSquadTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                      No tasks found matching current filters. Click "+ Announce New Task" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredSquadTasks.map(task => {
                    const squadInfo = SQUAD_INFO[task.squad] || SQUAD_INFO.GENERAL;
                    const isCopied = copiedTaskBroadcastId === task.id;

                    const getBountyPill = () => {
                      switch (task.bounty_type) {
                        case 'AIRTIME':
                          return (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              background: 'rgba(255, 209, 102, 0.12)', color: RF_GOLD_YELLOW,
                              border: `1px solid ${RF_GOLD_YELLOW}55`, padding: '2px 8px',
                              borderRadius: 100, fontSize: 11, fontWeight: 700
                            }}>
                              <Gift size={11} /> {task.bounty_reward || 'Airtime Giveaway'}
                            </span>
                          );
                        case 'DATA':
                          return (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              background: 'rgba(56, 189, 248, 0.12)', color: '#38BDF8',
                              border: '1px solid rgba(56, 189, 248, 0.4)', padding: '2px 8px',
                              borderRadius: 100, fontSize: 11, fontWeight: 700
                            }}>
                              <Zap size={11} /> {task.bounty_reward || 'Data Subscription'}
                            </span>
                          );
                        case 'CASH':
                          return (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              background: 'rgba(24, 252, 92, 0.12)', color: RF_MINT_ACCENT,
                              border: `1px solid ${RF_MINT_ACCENT}55`, padding: '2px 8px',
                              borderRadius: 100, fontSize: 11, fontWeight: 700
                            }}>
                              <DollarSign size={11} /> {task.bounty_reward || 'Cash Bounty'}
                            </span>
                          );
                        default:
                          return (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              background: 'rgba(167, 139, 250, 0.12)', color: '#C084FC',
                              border: '1px solid rgba(167, 139, 250, 0.3)', padding: '2px 8px',
                              borderRadius: 100, fontSize: 11, fontWeight: 600
                            }}>
                              <Award size={11} /> Deliverable XP
                            </span>
                          );
                      }
                    };

                    return (
                      <tr key={task.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                        {/* Squad & Mission */}
                        <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{
                              background: `${squadInfo.color}22`, color: squadInfo.color,
                              border: `1px solid ${squadInfo.color}55`, padding: '2px 8px',
                              borderRadius: 100, fontSize: 10.5, fontWeight: 700
                            }}>
                              {squadInfo.name}
                            </span>
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>• {task.category}</span>
                          </div>
                          <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: 14 }}>
                            {task.title}
                          </div>
                          <div style={{
                            fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 3,
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                          }}>
                            {task.description}
                          </div>
                        </td>

                        {/* Frequency & Deadline */}
                        <td style={{ padding: '16px 20px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <span style={{
                            background: task.frequency === 'DAILY' ? 'rgba(255, 209, 102, 0.15)' : 'rgba(255,255,255,0.08)',
                            color: task.frequency === 'DAILY' ? RF_GOLD_YELLOW : '#FFFFFF',
                            padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700
                          }}>
                            {task.frequency.replace('_', ' ')}
                          </span>
                          {task.deadline && (
                            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Clock size={12} /> {task.deadline}
                            </div>
                          )}
                        </td>

                        {/* Bounty & Value */}
                        <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                          <div style={{ marginBottom: 4 }}>
                            {getBountyPill()}
                          </div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                            {task.bounty_slots || 'Verified Submissions'}
                          </div>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                          <button
                            onClick={() => handleToggleTaskStatus(task.id)}
                            style={{
                              background: task.status === 'ACTIVE' ? 'rgba(24, 252, 92, 0.12)' : 'rgba(255,255,255,0.06)',
                              color: task.status === 'ACTIVE' ? RF_MINT_ACCENT : 'rgba(255,255,255,0.45)',
                              border: `1px solid ${task.status === 'ACTIVE' ? RF_MINT_ACCENT + '55' : 'rgba(255,255,255,0.15)'}`,
                              padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4
                            }}
                            title="Click to toggle Active / Archived"
                          >
                            {task.status === 'ACTIVE' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                            {task.status}
                          </button>
                        </td>

                        {/* Broadcast & Actions */}
                        <td style={{ padding: '16px 20px', verticalAlign: 'middle', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            {/* 1-Click WhatsApp Share */}
                            <button
                              onClick={() => openWhatsAppShare(task)}
                              style={{
                                background: '#25D366', color: '#FFFFFF', border: 'none',
                                padding: '6px 12px', borderRadius: 100, fontSize: 11.5,
                                fontWeight: 700, cursor: 'pointer', display: 'inline-flex',
                                alignItems: 'center', gap: 4, boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)'
                              }}
                              title="Broadcast task directly to WhatsApp group"
                            >
                              <MessageSquare size={12} /> Broadcast
                            </button>

                            {/* Copy Broadcast Text */}
                            <button
                              onClick={() => handleCopyBroadcast(task)}
                              style={{
                                background: isCopied ? 'rgba(24, 252, 92, 0.15)' : 'rgba(255,255,255,0.06)',
                                border: `1px solid ${isCopied ? RF_MINT_ACCENT : 'rgba(255,255,255,0.18)'}`,
                                color: isCopied ? RF_MINT_ACCENT : '#FFFFFF',
                                padding: '6px 10px', borderRadius: 100, fontSize: 11.5,
                                fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4
                              }}
                              title="Copy preformatted announcement text"
                            >
                              <Copy size={12} /> {isCopied ? 'Copied!' : 'Copy'}
                            </button>

                            {/* Delete Task */}
                            <button
                              onClick={() => handleDeleteTask(task.id, task.title)}
                              style={{
                                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#FCA5A5', padding: '6px 8px', borderRadius: 100, fontSize: 11,
                                cursor: 'pointer', display: 'inline-flex', alignItems: 'center'
                              }}
                              title="Delete task"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>

      {/* ─── DETAILED APPLICANT REVIEW MODAL ────────────────────────────────────── */}
      {modalOpen && activeApp && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(5, 18, 11, 0.85)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }} onClick={() => setModalOpen(false)}>
          <div style={{
            background: `linear-gradient(135deg, ${RF_DARK_GREEN} 0%, ${RF_FOREST_DARK} 100%)`,
            border: '1px solid rgba(102, 187, 42, 0.35)',
            borderRadius: 24, maxWidth: 680, width: '100%', maxHeight: '90vh',
            boxShadow: '0 25px 60px rgba(0,0,0,0.85)', position: 'relative',
            display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{
              padding: '24px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace', color: RF_MINT_ACCENT }}>
                    {activeApp.application_number}
                  </span>
                  {renderStatusBadge(editStatus)}
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
                  {activeApp.full_name}
                </h3>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.6)',
                  width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div style={{ padding: '24px 28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Quick Contact Bar */}
              <div style={{
                background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '14px 18px',
                border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexWrap: 'wrap', gap: 14,
                alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                  📍 {activeApp.city ? `${activeApp.city}, ` : ''}{activeApp.country} • ⏱️ {activeApp.availability || 'Not specified'}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <a
                    href={`https://wa.me/${activeApp.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hello ${activeApp.full_name}, this is the Refeir Admissions Team regarding your application (${activeApp.application_number}).`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: '#25D366', color: '#FFFFFF', padding: '6px 12px',
                      borderRadius: 100, fontSize: 12, fontWeight: 600, textDecoration: 'none',
                      display: 'inline-flex', alignItems: 'center', gap: 4
                    }}
                  >
                    <MessageSquare size={13} /> WhatsApp
                  </a>

                  <a
                    href={`mailto:${activeApp.email}`}
                    style={{
                      background: 'rgba(255,255,255,0.08)', color: '#FFFFFF', padding: '6px 12px',
                      borderRadius: 100, fontSize: 12, fontWeight: 500, textDecoration: 'none',
                      display: 'inline-flex', alignItems: 'center', gap: 4
                    }}
                  >
                    <Mail size={13} /> Email
                  </a>
                </div>
              </div>

              {/* Roles & Portfolio */}
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Target Roles & Skills</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                  {(activeApp.roles || []).map(r => (
                    <span key={r} style={{ background: 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: 100, fontSize: 12 }}>
                      {r}
                    </span>
                  ))}
                </div>
                {activeApp.skills && (
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 8, lineHeight: 1.5 }}>
                    <strong>Tools:</strong> {activeApp.skills}
                  </p>
                )}
                {activeApp.portfolio_url && (
                  <div style={{ marginTop: 8 }}>
                    <a
                      href={activeApp.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: RF_MINT_ACCENT, fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      View Portfolio / GitHub <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>

              {/* Motivation & Contribution */}
              {activeApp.motivation && (
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Candidate Motivation</span>
                  <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, margin: '6px 0 0' }}>
                    "{activeApp.motivation}"
                  </p>
                </div>
              )}

              {/* Admissions Decision Panel */}
              <div style={{
                background: 'rgba(102, 187, 42, 0.08)', padding: '18px 20px', borderRadius: 14,
                border: '1px solid rgba(102, 187, 42, 0.25)', display: 'flex', flexDirection: 'column', gap: 14
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: RF_MINT_ACCENT, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Admissions Decision & Seat Assignment
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
                      Review Status
                    </label>
                    <select
                      value={editStatus}
                      onChange={e => setEditStatus(e.target.value as ReviewStatus)}
                      style={{
                        width: '100%', padding: '9px 12px', borderRadius: 8,
                        background: '#07180F', border: '1px solid rgba(255,255,255,0.2)',
                        color: '#FFFFFF', fontSize: 13, outline: 'none'
                      }}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="REVIEWING">REVIEWING</option>
                      <option value="ACCEPTED">ACCEPTED</option>
                      <option value="WAITLISTED">WAITLISTED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
                      Contributor Ladder Rank
                    </label>
                    <select
                      value={editContributorLevel}
                      onChange={e => setEditContributorLevel(e.target.value as ContributorTier)}
                      style={{
                        width: '100%', padding: '9px 12px', borderRadius: 8,
                        background: '#07180F', border: '1px solid rgba(255,255,255,0.2)',
                        color: RF_MINT_ACCENT, fontSize: 13, outline: 'none', fontWeight: 600
                      }}
                    >
                      <option value="LEVEL_1">Level 1: Refeir Member (Starting • 0 jobs)</option>
                      <option value="LEVEL_2">Level 2: Refeir Pioneer (15+ verified jobs required)</option>
                      <option value="LEVEL_3">Level 3: Refeir Builder (40+ verified jobs required)</option>
                      <option value="LEVEL_4">Level 4: Refeir Lead (75+ verified jobs required)</option>
                      <option value="LEVEL_5">Level 5: Refeir Core Team (125+ verified jobs required)</option>
                    </select>

                    <div style={{ marginTop: 6, fontSize: 11.5, color: 'rgba(255,255,255,0.6)' }}>
                      Verified Jobs Completed: <strong style={{ color: RF_MINT_ACCENT }}>{getVerifiedJobsCount(activeApp.email)}</strong>
                    </div>

                    {getVerifiedJobsCount(activeApp.email) < (MIN_JOBS_FOR_PROMOTION[editContributorLevel] || 0) && (
                      <div style={{
                        marginTop: 6, padding: '6px 10px', borderRadius: 6,
                        background: 'rgba(244, 124, 32, 0.12)', border: '1px solid rgba(244, 124, 32, 0.35)',
                        color: '#FFB27D', fontSize: 11
                      }}>
                        ⚠️ Notice: Candidate has {getVerifiedJobsCount(activeApp.email)} verified job(s). {editContributorLevel.replace('_', ' ')} requires at least {MIN_JOBS_FOR_PROMOTION[editContributorLevel]} verified jobs before qualification.
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
                      Pioneer ID (Seat Number)
                    </label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input
                        type="text"
                        placeholder="e.g. RP-042"
                        value={editPioneerId}
                        onChange={e => setEditPioneerId(e.target.value)}
                        style={{
                          width: '100%', padding: '9px 12px', borderRadius: 8,
                          background: '#07180F', border: '1px solid rgba(255,255,255,0.2)',
                          color: '#FFFFFF', fontSize: 13, outline: 'none', fontFamily: 'monospace'
                        }}
                      />
                      <button
                        type="button"
                        onClick={generateNextPioneerId}
                        title="Auto-generate next Founding 100 seat"
                        style={{
                          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
                          color: RF_MINT_ACCENT, padding: '0 10px', borderRadius: 8, fontSize: 11,
                          fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap'
                        }}
                      >
                        Auto
                      </button>
                    </div>
                  </div>
                </div>

                {/* Official Acceptance Code Display */}
                {editStatus === 'ACCEPTED' && (
                  <div style={{
                    background: 'rgba(24, 252, 92, 0.08)', border: `1px solid ${RF_LEAF_GREEN}66`,
                    borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
                  }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: RF_MINT_ACCENT, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Key size={13} /> Official Acceptance Code Issued
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF', fontFamily: 'monospace', marginTop: 4 }}>
                        {editAcceptanceCode || activeApp.acceptance_code || '(Will be automatically generated upon saving)'}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
                        Share this code with the candidate. They must provide it with Application ID ({activeApp.application_number}) to activate their contributor profile.
                      </div>
                    </div>

                    {(editAcceptanceCode || activeApp.acceptance_code) && (
                      <button
                        type="button"
                        onClick={() => {
                          const codeToCopy = editAcceptanceCode || activeApp.acceptance_code!;
                          navigator.clipboard.writeText(codeToCopy);
                          setCopiedModalCode(true);
                          setTimeout(() => setCopiedModalCode(false), 2000);
                        }}
                        style={{
                          background: RF_LEAF_GREEN, color: RF_DEEP_GREEN, border: 'none',
                          padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                        }}
                      >
                        {copiedModalCode ? <Check size={13} /> : <Copy size={13} />}
                        {copiedModalCode ? 'Copied Code' : 'Copy Acceptance Code'}
                      </button>
                    )}
                  </div>
                )}

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={editIsFounding}
                    onChange={e => setEditIsFounding(e.target.checked)}
                    style={{ accentColor: RF_MINT_ACCENT }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF' }}>
                    Designate as Founding 100 Pioneer ⭐
                  </span>
                </label>

                <div>
                  <label style={{ display: 'block', fontSize: 11.5, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
                    Internal Admissions Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Candidate strengths, assigned projects, onboarding status..."
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: 8,
                      background: '#07180F', border: '1px solid rgba(255,255,255,0.2)',
                      color: '#FFFFFF', fontSize: 13, outline: 'none', resize: 'vertical'
                    }}
                  />
                </div>
              </div>

              {saveSuccessMsg && (
                <div style={{
                  padding: '10px 14px', borderRadius: 8, background: 'rgba(24, 252, 92, 0.15)',
                  border: `1px solid ${RF_LEAF_GREEN}66`, color: RF_MINT_ACCENT, fontSize: 13
                }}>
                  {saveSuccessMsg}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div style={{
              padding: '18px 28px', borderTop: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{
                  background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)',
                  fontSize: 13, cursor: 'pointer'
                }}
              >
                Close
              </button>

              <button
                type="button"
                disabled={savingChanges}
                onClick={handleSaveChanges}
                style={{
                  background: RF_LEAF_GREEN, color: RF_DEEP_GREEN, border: 'none',
                  padding: '10px 24px', borderRadius: 100, fontSize: 13.5, fontWeight: 600,
                  cursor: savingChanges ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                <Save size={14} />
                {savingChanges ? 'Saving...' : 'Save Decision'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── DETAILED TASK PROOF REVIEW MODAL ────────────────────────────────────── */}
      {taskModalOpen && activeTask && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(5, 18, 11, 0.85)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }} onClick={() => setTaskModalOpen(false)}>
          <div style={{
            background: `linear-gradient(135deg, ${RF_DARK_GREEN} 0%, ${RF_FOREST_DARK} 100%)`,
            border: '1px solid rgba(102, 187, 42, 0.35)',
            borderRadius: 24, maxWidth: 740, width: '100%', maxHeight: '90vh',
            boxShadow: '0 25px 60px rgba(0,0,0,0.85)', position: 'relative',
            display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{
              padding: '24px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace', color: RF_MINT_ACCENT }}>
                    {activeTask.reference_id}
                  </span>
                  {renderTaskStatusBadge(activeTask.status)}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                  {activeTask.task_title}
                </h3>
              </div>

              <button
                onClick={() => setTaskModalOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.6)',
                  width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px 28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Contributor Card */}
              <div style={{
                background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '14px 18px',
                border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexWrap: 'wrap', gap: 14,
                alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>{activeTask.full_name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
                    {activeTask.email} {activeTask.application_number ? `• App ID: ${activeTask.application_number}` : ''} {activeTask.pioneer_id ? `• Pioneer ID: ${activeTask.pioneer_id}` : ''}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 700,
                    background: `${RF_LEAF_GREEN}20`, color: RF_MINT_ACCENT, border: `1px solid ${RF_LEAF_GREEN}44`
                  }}>
                    Targeting {activeTask.target_level.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Promotion Qualification & Completed Jobs Progress Meter */}
              {(() => {
                const priorVerified = taskSubmissions.filter(
                  t => t.email.toLowerCase() === activeTask.email.toLowerCase() && t.status === 'VERIFIED' && t.id !== activeTask.id
                ).length;
                const totalAfterVerify = priorVerified + 1;
                const requiredJobs = MIN_JOBS_FOR_PROMOTION[activeTask.target_level] || 15;
                const qualifies = totalAfterVerify >= requiredJobs;

                return (
                  <div style={{
                    background: qualifies ? 'rgba(24, 252, 92, 0.08)' : 'rgba(255, 209, 102, 0.08)',
                    border: `1px solid ${qualifies ? RF_LEAF_GREEN : RF_GOLD_YELLOW}44`,
                    borderRadius: 14, padding: '14px 18px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                        color: qualifies ? RF_MINT_ACCENT : RF_GOLD_YELLOW
                      }}>
                        {qualifies ? '✓ Promotion Threshold Reached' : '⏳ Promotion Threshold In Progress'}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#FFFFFF' }}>
                        {totalAfterVerify} of {requiredJobs} Verified Jobs Delivered
                      </span>
                    </div>

                    <div style={{
                      width: '100%', height: 6, background: 'rgba(255,255,255,0.1)',
                      borderRadius: 10, overflow: 'hidden', margin: '8px 0'
                    }}>
                      <div style={{
                        width: `${Math.min(100, (totalAfterVerify / requiredJobs) * 100)}%`,
                        height: '100%',
                        background: qualifies ? RF_MINT_ACCENT : RF_GOLD_YELLOW,
                        borderRadius: 10, transition: 'width 0.3s ease'
                      }} />
                    </div>

                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.5 }}>
                      {qualifies ? (
                        <>Verifying this deliverable completes job #{totalAfterVerify}, meeting the {requiredJobs}-job requirement for promotion to <strong>{activeTask.target_level.replace('_', ' ')}</strong>.</>
                      ) : (
                        <>Verifying this deliverable logs job #{totalAfterVerify}. The contributor needs <strong>{requiredJobs - totalAfterVerify} more verified job{requiredJobs - totalAfterVerify === 1 ? '' : 's'}</strong> before qualifying for promotion to <strong>{activeTask.target_level.replace('_', ' ')}</strong>.</>
                      )}
                    </p>
                  </div>
                );
              })()}

              {/* Task Details */}
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                  Mission Category &amp; Division
                </span>
                <p style={{ fontSize: 13, color: '#FFFFFF', marginTop: 4 }}>
                  <strong>Division:</strong> {activeTask.division} • <strong>Category:</strong> {activeTask.task_category}
                </p>
              </div>

              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                  Work Accomplished &amp; Impact Description
                </span>
                <p style={{
                  fontSize: 13.5, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6,
                  background: 'rgba(0,0,0,0.25)', padding: '14px 16px', borderRadius: 10,
                  marginTop: 6, whiteSpace: 'pre-wrap'
                }}>
                  {activeTask.task_description}
                </p>
              </div>

              {/* Deliverable Links */}
              {(activeTask.deliverable_url || activeTask.additional_url) && (
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                    Deliverable &amp; Proof URLs
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
                    {activeTask.deliverable_url && (
                      <a
                        href={activeTask.deliverable_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: 'rgba(24, 252, 92, 0.1)', border: `1px solid ${RF_LEAF_GREEN}55`,
                          color: RF_MINT_ACCENT, padding: '6px 14px', borderRadius: 8, fontSize: 12.5,
                          textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6
                        }}
                      >
                        <ExternalLink size={13} /> View Primary Deliverable
                      </a>
                    )}
                    {activeTask.additional_url && (
                      <a
                        href={activeTask.additional_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: '#FFFFFF', padding: '6px 14px', borderRadius: 8, fontSize: 12.5,
                          textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6
                        }}
                      >
                        <ExternalLink size={13} /> Additional Verification Link
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Attached Screenshots Gallery */}
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                  Uploaded Screenshots &amp; Evidence ({activeTask.screenshots.length})
                </span>
                {activeTask.screenshots.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                    No screenshots attached to this mission.
                  </p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                    {activeTask.screenshots.map((s, idx) => (
                      <div
                        key={s.id || idx}
                        onClick={() => setScreenshotModalUrl(s.data_url)}
                        style={{
                          background: 'rgba(0,0,0,0.4)', borderRadius: 10, overflow: 'hidden',
                          border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                          transition: 'transform 0.15s, border-color 0.15s'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = RF_MINT_ACCENT;
                          e.currentTarget.style.transform = 'scale(1.02)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                          e.currentTarget.style.transform = '';
                        }}
                      >
                        <div style={{ height: 110, position: 'relative' }}>
                          <img
                            src={s.data_url}
                            alt={s.name || `Screenshot ${idx + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <div style={{
                            position: 'absolute', bottom: 4, right: 6,
                            background: 'rgba(0,0,0,0.7)', borderRadius: 4, padding: '2px 6px',
                            fontSize: 10, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 3
                          }}>
                            <Eye size={10} /> Enlarge
                          </div>
                        </div>
                        <div style={{ padding: '8px 10px' }}>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {s.name || `Image #${idx + 1}`}
                          </div>
                          {s.caption && (
                            <div style={{ fontSize: 11, color: RF_MINT_ACCENT, marginTop: 2, fontStyle: 'italic' }}>
                              "{s.caption}"
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Squad / Admin Feedback Notes */}
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Squad Lead &amp; Admin Verification Feedback
                </span>
                <textarea
                  rows={3}
                  placeholder="Add feedback, notes or peer validation remarks for the contributor..."
                  value={taskFeedback}
                  onChange={e => setTaskFeedback(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
                    color: '#FFFFFF', fontSize: 13, outline: 'none', boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{
              padding: '18px 28px', borderTop: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 10
            }}>
              <button
                type="button"
                onClick={() => setTaskModalOpen(false)}
                style={{
                  background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)',
                  fontSize: 13, cursor: 'pointer'
                }}
              >
                Close
              </button>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  disabled={updatingTask}
                  onClick={() => handleUpdateTaskStatus('NEEDS_REVISION')}
                  style={{
                    background: 'rgba(244, 124, 32, 0.15)', border: `1px solid rgba(244, 124, 32, 0.5)`,
                    color: '#FFB27D', padding: '9px 16px', borderRadius: 100, fontSize: 12.5,
                    fontWeight: 600, cursor: updatingTask ? 'not-allowed' : 'pointer'
                  }}
                >
                  Request Revision
                </button>

                {(() => {
                  const priorVerified = taskSubmissions.filter(
                    t => t.email.toLowerCase() === activeTask.email.toLowerCase() && t.status === 'VERIFIED' && t.id !== activeTask.id
                  ).length;
                  const totalAfterVerify = priorVerified + 1;
                  const requiredJobs = MIN_JOBS_FOR_PROMOTION[activeTask.target_level] || 15;
                  const qualifies = totalAfterVerify >= requiredJobs;

                  return (
                    <button
                      type="button"
                      disabled={updatingTask}
                      onClick={() => handleUpdateTaskStatus('VERIFIED')}
                      style={{
                        background: qualifies ? RF_LEAF_GREEN : 'rgba(24, 252, 92, 0.2)',
                        color: qualifies ? RF_DEEP_GREEN : RF_MINT_ACCENT,
                        border: qualifies ? 'none' : `1px solid ${RF_LEAF_GREEN}66`,
                        padding: '9px 20px', borderRadius: 100, fontSize: 12.5, fontWeight: 700,
                        cursor: updatingTask ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6
                      }}
                    >
                      <Check size={14} />
                      {updatingTask ? (
                        'Verifying...'
                      ) : qualifies ? (
                        `Verify Proof & Promote to ${activeTask.target_level.replace('_', ' ')}`
                      ) : (
                        `Verify Task Proof (${totalAfterVerify}/${requiredJobs} Jobs Done)`
                      )}
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── FULL-SCREEN SCREENSHOT LIGHTBOX MODAL ──────────────────────────────── */}
      {screenshotModalUrl && (
        <div
          onClick={() => setScreenshotModalUrl(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1100,
            background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
          }}
        >
          <div style={{ position: 'relative', maxWidth: '92vw', maxHeight: '92vh' }}>
            <img
              src={screenshotModalUrl}
              alt="Screenshot Full View"
              style={{ maxWidth: '100%', maxHeight: '88vh', borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)' }}
            />
            <button
              onClick={() => setScreenshotModalUrl(null)}
              style={{
                position: 'absolute', top: -14, right: -14,
                width: 34, height: 34, borderRadius: '50%',
                background: '#FFFFFF', color: '#000000', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontWeight: 800
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ─── ADD NEW WORKER MODAL ──────────────────────────────────────────────── */}
      {addWorkerModalOpen && (
        <div
          onClick={() => setAddWorkerModalOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1100,
            background: 'rgba(5, 18, 11, 0.85)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: `linear-gradient(145deg, ${RF_DARK_GREEN} 0%, ${RF_FOREST_DARK} 100%)`,
              border: '1px solid rgba(102, 187, 42, 0.35)',
              borderRadius: 24, maxWidth: 500, width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
              position: 'relative', overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '24px 28px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, background: `${RF_LEAF_GREEN}20`,
                  border: `1px solid ${RF_LEAF_GREEN}44`, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: RF_MINT_ACCENT
                }}>
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                    Add Review Worker
                  </h3>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: '2px 0 0' }}>
                    Grant verification &amp; admission review permissions
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAddWorkerModalOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.6)',
                  width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateWorker} style={{ padding: '24px 28px' }}>
              {workerFormError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444',
                  borderRadius: 10, padding: '10px 14px', color: '#FCA5A5',
                  fontSize: 13, marginBottom: 16
                }}>
                  {workerFormError}
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: 6 }}>
                  Worker Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Amara Okafor"
                  value={newWorkerName}
                  onChange={e => setNewWorkerName(e.target.value)}
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
                    color: '#FFFFFF', fontSize: 13.5, outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: 6 }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="e.g. amara@refeir.com"
                  value={newWorkerEmail}
                  onChange={e => setNewWorkerEmail(e.target.value)}
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
                    color: '#FFFFFF', fontSize: 13.5, outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: 6 }}>
                    Assigned Role *
                  </label>
                  <select
                    value={newWorkerRole}
                    onChange={e => setNewWorkerRole(e.target.value as StaffRole)}
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: 10,
                      background: 'rgba(15, 46, 30, 0.95)', border: '1px solid rgba(255,255,255,0.15)',
                      color: '#FFFFFF', fontSize: 13, outline: 'none', boxSizing: 'border-box'
                    }}
                  >
                    <option value="ADMISSIONS_REVIEWER">Admissions Reviewer</option>
                    <option value="TASK_VERIFIER">Task Verifier</option>
                    <option value="SQUAD_LEAD">Squad Lead</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: 6 }}>
                    Division Squad Scope *
                  </label>
                  <select
                    value={newWorkerDivision}
                    onChange={e => setNewWorkerDivision(e.target.value)}
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: 10,
                      background: 'rgba(15, 46, 30, 0.95)', border: '1px solid rgba(255,255,255,0.15)',
                      color: '#FFFFFF', fontSize: 13, outline: 'none', boxSizing: 'border-box'
                    }}
                  >
                    <option value="ALL">All Squads (Global)</option>
                    <option value="TECHNOLOGY">Technology &amp; Architecture</option>
                    <option value="DESIGN">Product &amp; Design</option>
                    <option value="GROWTH">Growth &amp; Referrals</option>
                    <option value="COMMUNITY">Community &amp; Chapters</option>
                    <option value="OPERATIONS">Operations &amp; QA</option>
                    <option value="BUSINESS">Business Development</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: 6 }}>
                  Dedicated Access Passcode *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={newWorkerPasscode}
                    onChange={e => setNewWorkerPasscode(e.target.value)}
                    placeholder="e.g. worker26_482"
                    style={{
                      width: '100%', padding: '11px 14px 11px 36px', borderRadius: 10,
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
                      color: '#FFFFFF', fontSize: 13.5, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                  <Key size={15} style={{ position: 'absolute', left: 12, top: 13, color: 'rgba(255,255,255,0.4)' }} />
                </div>
                <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.45)', marginTop: 4, display: 'block' }}>
                  Worker will enter this passcode to log into the internal portal.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setAddWorkerModalOpen(false)}
                  style={{
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
                    color: '#FFFFFF', padding: '10px 18px', borderRadius: 100, fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: RF_LEAF_GREEN, color: RF_DEEP_GREEN, border: 'none',
                    padding: '10px 22px', borderRadius: 100, fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                    boxShadow: `0 2px 12px ${RF_LEAF_GREEN}44`
                  }}
                >
                  <UserPlus size={14} /> Add Worker to Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── SELECTED MEMBER FULL PROFILE MODAL ──────────────────────────────── */}
      {memberModalOpen && selectedMember && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.82)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            maxWidth: 900, width: '100%', maxHeight: '92vh', overflowY: 'auto',
            background: '#0B2416', borderRadius: 24, border: '1px solid rgba(102, 187, 42, 0.3)',
            padding: '32px 32px 36px', position: 'relative', boxShadow: '0 25px 60px rgba(0,0,0,0.85)'
          }}>
            {/* Close Button */}
            <button
              onClick={() => setMemberModalOpen(false)}
              style={{
                position: 'absolute', top: 22, right: 22, background: 'rgba(255,255,255,0.08)',
                border: 'none', color: 'rgba(255,255,255,0.7)', width: 34, height: 34,
                borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 16, transition: 'all 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            >
              ✕
            </button>

            {/* Suspended Alert Banner (if account is suspended) */}
            {selectedMember.is_suspended && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.45)',
                borderRadius: 14, padding: '16px 20px', marginBottom: 24,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Ban size={22} color="#EF4444" />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#FCA5A5' }}>
                      Account Currently Suspended
                    </div>
                    <div style={{ fontSize: 12.5, color: 'rgba(252, 165, 165, 0.85)', marginTop: 2 }}>
                      Reason: {selectedMember.suspension_reason || 'Administrative restriction'}
                      {selectedMember.suspended_at && ` • Suspended on ${new Date(selectedMember.suspended_at).toLocaleDateString()}`}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleReactivateMember(selectedMember)}
                  style={{
                    background: 'rgba(24, 252, 92, 0.15)', border: `1px solid ${RF_LEAF_GREEN}`,
                    color: RF_MINT_ACCENT, padding: '7px 16px', borderRadius: 100, fontSize: 12.5,
                    fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                  }}
                >
                  <CheckCircle2 size={13} /> Lift Suspension
                </button>
              </div>
            )}

            {/* Modal Header: Avatar, Name, Pioneer ID, Squad & Rank Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
              {selectedMember.avatar_url ? (
                <img
                  src={selectedMember.avatar_url}
                  alt={selectedMember.full_name}
                  style={{
                    width: 76, height: 76, borderRadius: '50%', objectFit: 'cover',
                    border: `3px solid ${selectedMember.is_suspended ? '#EF4444' : RF_LEAF_GREEN}`,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
                  }}
                />
              ) : (
                <div style={{
                  width: 76, height: 76, borderRadius: '50%',
                  background: selectedMember.is_suspended ? 'rgba(239, 68, 68, 0.25)' : `${RF_LEAF_GREEN}30`,
                  border: `2px solid ${selectedMember.is_suspended ? '#EF4444' : RF_LEAF_GREEN}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: selectedMember.is_suspended ? '#FCA5A5' : RF_MINT_ACCENT,
                  fontSize: 26, fontWeight: 700
                }}>
                  {selectedMember.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                </div>
              )}

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: 24, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                    {selectedMember.full_name}
                  </h2>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: 'rgba(24, 252, 92, 0.1)', border: '1px solid rgba(24, 252, 92, 0.3)',
                    padding: '3px 9px', borderRadius: 6
                  }}>
                    <Award size={13} color={RF_MINT_ACCENT} />
                    <span style={{ fontFamily: 'monospace', fontSize: 12.5, fontWeight: 700, color: RF_MINT_ACCENT }}>
                      {selectedMember.pioneer_id || 'PENDING ID'}
                    </span>
                  </div>
                  {selectedMember.application_number && (
                    <span style={{ fontSize: 11.5, fontFamily: 'monospace', color: 'rgba(255,255,255,0.45)' }}>
                      App #{selectedMember.application_number}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 11.5, fontWeight: 600, background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)',
                    padding: '3px 10px', borderRadius: 100
                  }}>
                    {selectedMember.division || 'Unassigned Squad'}
                  </span>

                  <span style={{
                    fontSize: 11.5, fontWeight: 700, background: 'rgba(255, 209, 102, 0.12)',
                    border: '1px solid rgba(255, 209, 102, 0.4)', color: RF_GOLD_YELLOW,
                    padding: '3px 10px', borderRadius: 100, textTransform: 'uppercase'
                  }}>
                    {(selectedMember.contributor_level || 'LEVEL_1').replace('_', ' ')}
                  </span>

                  {selectedMember.is_profile_completed ? (
                    <span style={{
                      fontSize: 11.5, fontWeight: 700, background: 'rgba(24, 252, 92, 0.12)',
                      border: `1px solid ${RF_LEAF_GREEN}55`, color: RF_MINT_ACCENT,
                      padding: '3px 10px', borderRadius: 100, display: 'inline-flex', alignItems: 'center', gap: 4
                    }}>
                      <CheckCircle2 size={12} /> Profile Complete
                    </span>
                  ) : (
                    <span style={{
                      fontSize: 11.5, fontWeight: 600, background: 'rgba(244, 124, 32, 0.12)',
                      border: '1px solid rgba(244, 124, 32, 0.4)', color: '#FFB27D',
                      padding: '3px 10px', borderRadius: 100
                    }}>
                      Profile Incomplete
                    </span>
                  )}

                  {selectedMember.is_suspended ? (
                    <span style={{
                      fontSize: 11.5, fontWeight: 700, background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid #EF4444', color: '#FCA5A5',
                      padding: '3px 10px', borderRadius: 100, display: 'inline-flex', alignItems: 'center', gap: 4
                    }}>
                      <Ban size={12} /> SUSPENDED
                    </span>
                  ) : (
                    <span style={{
                      fontSize: 11.5, fontWeight: 700, background: 'rgba(24, 252, 92, 0.12)',
                      border: `1px solid ${RF_LEAF_GREEN}55`, color: RF_MINT_ACCENT,
                      padding: '3px 10px', borderRadius: 100, display: 'inline-flex', alignItems: 'center', gap: 4
                    }}>
                      <CheckCircle2 size={12} /> ACTIVE
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Grid Information Sections */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginBottom: 24 }}>
              {/* Section 1: Legal Identity & Personal Information */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px' }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: RF_MINT_ACCENT, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <UserCheck size={14} /> Legal Identity &amp; Record
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'block' }}>Full Legal Name</span>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: '#FFFFFF' }}>{selectedMember.full_name}</span>
                  </div>

                  {/* Permanent Date of Birth */}
                  <div style={{
                    background: 'rgba(24, 252, 92, 0.04)', border: '1px solid rgba(24, 252, 92, 0.18)',
                    borderRadius: 10, padding: '8px 12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, color: RF_MINT_ACCENT, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={12} /> Date of Birth
                      </span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <Lock size={10} /> Permanent &amp; Non-editable
                      </span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', marginTop: 4, display: 'block' }}>
                      {selectedMember.date_of_birth || 'Not recorded yet'}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'block' }}>Email Address</span>
                    <a href={`mailto:${selectedMember.email}`} style={{ fontSize: 13, color: RF_MINT_ACCENT, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Mail size={12} /> {selectedMember.email}
                    </a>
                  </div>

                  <div>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'block' }}>WhatsApp Number</span>
                    {selectedMember.whatsapp_number ? (
                      <a href={`https://wa.me/${selectedMember.whatsapp_number.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#25D366', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Phone size={12} /> {selectedMember.whatsapp_number}
                      </a>
                    ) : (
                      <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.4)' }}>Not provided</span>
                    )}
                  </div>

                  <div>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'block' }}>Telegram Handle</span>
                    <span style={{ fontSize: 13, color: '#FFFFFF', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Send size={12} color="#0088cc" /> {selectedMember.telegram_handle || 'Not provided'}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'block' }}>Country &amp; City</span>
                    <span style={{ fontSize: 13, color: '#FFFFFF', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Globe size={12} /> {selectedMember.city ? `${selectedMember.city}, ` : ''}{selectedMember.country || 'Global'}
                    </span>
                  </div>

                  {selectedMember.institution && (
                    <div>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'block' }}>Institution / University</span>
                      <span style={{ fontSize: 13, color: '#FFFFFF', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Building2 size={12} /> {selectedMember.institution}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Settlement Banking & Payouts */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px' }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: RF_GOLD_YELLOW, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Briefcase size={14} /> Settlement &amp; Banking
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'block' }}>Payout Method</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF' }}>
                      {selectedMember.payout_preference ? selectedMember.payout_preference.replace('_', ' ') : 'Local Bank Transfer'}
                    </span>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: 14, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'block' }}>Bank Institution</span>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: '#FFFFFF' }}>
                        {selectedMember.bank_name || 'Not provided'}
                      </span>
                    </div>

                    <div style={{ marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'block' }}>Account Number</span>
                      <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'monospace', color: RF_MINT_ACCENT }}>
                        {selectedMember.account_number || '••••••••••'}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'block' }}>Account Holder Name</span>
                      <span style={{ fontSize: 13, color: '#FFFFFF' }}>
                        {selectedMember.account_name || 'Not provided'}
                      </span>
                    </div>
                  </div>

                  {/* Social Profiles & Online Footprint */}
                  <div>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: 6 }}>Online Footprint</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {selectedMember.github_url && (
                        <a href={selectedMember.github_url} target="_blank" rel="noopener noreferrer" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#FFFFFF', padding: '4px 10px', borderRadius: 8, fontSize: 11.5, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <ExternalLink size={11} /> GitHub
                        </a>
                      )}
                      {selectedMember.linkedin_url && (
                        <a href={selectedMember.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#0077B5', padding: '4px 10px', borderRadius: 8, fontSize: 11.5, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <ExternalLink size={11} /> LinkedIn
                        </a>
                      )}
                      {selectedMember.twitter_handle && (
                        <a href={`https://twitter.com/${selectedMember.twitter_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#1DA1F2', padding: '4px 10px', borderRadius: 8, fontSize: 11.5, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <AtSign size={11} /> {selectedMember.twitter_handle}
                        </a>
                      )}
                      {selectedMember.portfolio_url && (
                        <a href={selectedMember.portfolio_url} target="_blank" rel="noopener noreferrer" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: RF_MINT_ACCENT, padding: '4px 10px', borderRadius: 8, fontSize: 11.5, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <ExternalLink size={11} /> Portfolio
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio & Skills Summary */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px', marginBottom: 24 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>
                Professional Biography &amp; Skills
              </h3>
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, margin: '0 0 14px' }}>
                {selectedMember.bio || 'No personal bio provided yet.'}
              </p>

              {selectedMember.skills && selectedMember.skills.length > 0 && (
                <div>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: 6 }}>Key Capabilities:</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {selectedMember.skills.map((skill, i) => (
                      <span key={i} style={{ background: 'rgba(102, 187, 42, 0.12)', border: '1px solid rgba(102, 187, 42, 0.25)', color: RF_MINT_ACCENT, padding: '3px 9px', borderRadius: 100, fontSize: 11.5, fontWeight: 600 }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pioneer Reasoning Survey Submissions (10 Scenarios) */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '22px', marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Brain size={16} color={RF_MINT_ACCENT} />
                  Pioneer Reasoning Profiles &amp; Scenario Evaluations
                </h3>
                <span style={{
                  fontSize: 11, fontWeight: 700, background: 'rgba(24, 252, 92, 0.1)',
                  color: RF_MINT_ACCENT, border: `1px solid ${RF_LEAF_GREEN}44`,
                  padding: '2px 8px', borderRadius: 100
                }}>
                  {selectedMember.survey_responses?.length || 0} / 10 Scenarios Recorded
                </span>
              </div>

              {selectedMember.survey_responses && selectedMember.survey_responses.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 360, overflowY: 'auto', paddingRight: 6 }}>
                  {selectedMember.survey_responses.map((resp, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 12, padding: '14px 16px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                        <span style={{
                          background: `${RF_LEAF_GREEN}25`, color: RF_MINT_ACCENT,
                          fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 6,
                          flexShrink: 0, marginTop: 1
                        }}>
                          Q{resp.question_id || idx + 1}
                        </span>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF', lineHeight: 1.4 }}>
                          {(resp as any).question_text || resp.question}
                        </div>
                      </div>

                      <div style={{
                        background: 'rgba(24, 252, 92, 0.06)', borderLeft: `3px solid ${RF_MINT_ACCENT}`,
                        padding: '8px 12px', borderRadius: '0 8px 8px 0', marginBottom: resp.reasoning_notes ? 8 : 0
                      }}>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Selected Approach:
                        </span>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: RF_MINT_ACCENT }}>
                          {resp.selected_option}
                        </span>
                      </div>

                      {resp.reasoning_notes && (
                        <div style={{ marginTop: 6, fontSize: 12, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', lineHeight: 1.5, paddingLeft: 6 }}>
                          "{resp.reasoning_notes}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: 13, background: 'rgba(0,0,0,0.2)', borderRadius: 12 }}>
                  This contributor has not yet completed the 10 Pioneer Reasoning Survey questions.
                </div>
              )}
            </div>

            {/* Pioneer Certificates & Accreditations */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '22px', marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Award size={16} color={RF_GOLD_YELLOW} />
                  Accreditations &amp; Issued Certificates
                </h3>
                <button
                  type="button"
                  onClick={() => handleOpenIssueCertModal(selectedMember.email, selectedMember.contributor_level)}
                  style={{
                    background: 'rgba(255, 209, 102, 0.12)', border: `1px solid ${RF_GOLD_YELLOW}66`,
                    color: RF_GOLD_YELLOW, padding: '5px 14px', borderRadius: 100, fontSize: 11.5,
                    fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5
                  }}
                >
                  <Award size={12} /> + Issue Certificate
                </button>
              </div>

              {(() => {
                const memberCerts = getCertificatesByEmail(selectedMember.email);
                if (memberCerts.length === 0) {
                  return (
                    <div style={{ padding: '20px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: 12.5, background: 'rgba(0,0,0,0.2)', borderRadius: 12 }}>
                      No certificates issued yet for this member. Click "+ Issue Certificate" above to mint one.
                    </div>
                  );
                }
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                    {memberCerts.map(cert => (
                      <div
                        key={cert.id}
                        style={{
                          background: 'rgba(0,0,0,0.35)', border: `1px solid ${cert.status === 'ISSUED' ? 'rgba(255, 209, 102, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                          borderRadius: 14, padding: '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 10
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: RF_GOLD_YELLOW, fontFamily: 'monospace' }}>
                              {cert.id}
                            </span>
                            <span style={{
                              fontSize: 10, fontWeight: 700,
                              background: cert.status === 'ISSUED' ? 'rgba(24, 252, 92, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: cert.status === 'ISSUED' ? RF_MINT_ACCENT : '#FCA5A5',
                              padding: '1px 6px', borderRadius: 4
                            }}>
                              {cert.status}
                            </span>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>
                            {cert.level_title}
                          </div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                            {cert.verified_jobs_count > 0 ? `${cert.verified_jobs_count} verified jobs delivered` : 'Orientation accredited'}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
                          <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)' }}>
                            {new Date(cert.issued_at).toLocaleDateString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleViewCertificate(cert)}
                            style={{
                              background: 'rgba(24, 252, 92, 0.1)', border: `1px solid ${RF_LEAF_GREEN}44`,
                              color: RF_MINT_ACCENT, padding: '3px 10px', borderRadius: 100, fontSize: 11,
                              fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4
                            }}
                          >
                            <Eye size={11} /> View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Administrative Management Controls Bar */}
            <div style={{
              background: 'rgba(15, 46, 30, 0.95)', border: '1px solid rgba(102, 187, 42, 0.3)',
              borderRadius: 16, padding: '18px 22px', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', flexWrap: 'wrap', gap: 14
            }}>
              {/* Quick Level Promotion */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
                  Pioneer Rank:
                </span>
                <select
                  value={selectedMember.contributor_level || 'LEVEL_1'}
                  onChange={e => handlePromoteMemberLevel(selectedMember.email, e.target.value as any)}
                  style={{
                    background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)',
                    color: RF_GOLD_YELLOW, padding: '7px 12px', borderRadius: 8, fontSize: 12.5,
                    fontWeight: 700, outline: 'none', cursor: 'pointer'
                  }}
                >
                  <option value="LEVEL_1">Level 1 - Pioneer Associate</option>
                  <option value="LEVEL_2">Level 2 - Lead Builder</option>
                  <option value="LEVEL_3">Level 3 - Squad Architect</option>
                  <option value="LEVEL_4">Level 4 - Division Strategist</option>
                  <option value="LEVEL_5">Level 5 - Founding Partner</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {selectedMember.is_suspended ? (
                  <button
                    onClick={() => handleReactivateMember(selectedMember)}
                    style={{
                      background: RF_LEAF_GREEN, color: RF_DEEP_GREEN, border: 'none',
                      padding: '9px 18px', borderRadius: 100, fontSize: 12.5, fontWeight: 700,
                      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6
                    }}
                  >
                    <CheckCircle2 size={14} /> Reactivate Member
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenSuspendModal(selectedMember)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444',
                      color: '#FCA5A5', padding: '9px 18px', borderRadius: 100, fontSize: 12.5,
                      fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6
                    }}
                  >
                    <Ban size={14} /> Suspend Member
                  </button>
                )}

                <button
                  onClick={() => setMemberModalOpen(false)}
                  style={{
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)',
                    color: '#FFFFFF', padding: '9px 18px', borderRadius: 100, fontSize: 12.5,
                    fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── SUSPEND MEMBER CONFIRMATION MODAL ──────────────────────────────── */}
      {suspendModalMember && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1100,
          background: 'rgba(0, 0, 0, 0.86)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            maxWidth: 540, width: '100%', background: '#140D0D', borderRadius: 24,
            border: '1px solid rgba(239, 68, 68, 0.4)', padding: '32px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.9)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#EF4444'
              }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                  Suspend Pioneer Member
                </h3>
                <div style={{ fontSize: 13, color: '#FCA5A5', marginTop: 2 }}>
                  {suspendModalMember.full_name} ({suspendModalMember.email})
                </div>
              </div>
            </div>

            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: 18 }}>
              Suspending this pioneer will immediately block their account access, revoke login sessions, and prevent them from submitting task proofs. The member will see the administrative reason provided below when attempting to sign in.
            </p>

            {/* Preset Common Reasons */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                Preset Suspension Reasons (Click to apply)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {[
                  'Violation of Refeir Pioneer Code of Conduct',
                  'Fraudulent or falsified task submission proof',
                  'Plagiarism or unauthorized work duplication',
                  'Inactivity or unresponsive during squad deliverables',
                  'Platform or community safety concern'
                ].map((reason, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSuspendReasonInput(reason)}
                    style={{
                      background: suspendReasonInput === reason ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${suspendReasonInput === reason ? '#EF4444' : 'rgba(255,255,255,0.12)'}`,
                      color: suspendReasonInput === reason ? '#FCA5A5' : 'rgba(255,255,255,0.8)',
                      padding: '4px 10px', borderRadius: 8, fontSize: 11, cursor: 'pointer', textAlign: 'left'
                    }}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Reason Input */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#FFFFFF', marginBottom: 6 }}>
                Reason for Suspension (Visible to Member) *
              </label>
              <textarea
                value={suspendReasonInput}
                onChange={e => setSuspendReasonInput(e.target.value)}
                placeholder="Explain the specific reason for suspending this account..."
                rows={3}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 10,
                  background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#FFFFFF', fontSize: 13, outline: 'none', boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setSuspendModalMember(null)}
                style={{
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)',
                  color: '#FFFFFF', padding: '10px 18px', borderRadius: 100, fontSize: 13,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmSuspend}
                disabled={!suspendReasonInput.trim()}
                style={{
                  background: '#EF4444', color: '#FFFFFF', border: 'none',
                  padding: '10px 22px', borderRadius: 100, fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)'
                }}
              >
                <Ban size={14} /> Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── ISSUE CERTIFICATE MODAL ────────────────────────────────────── */}
      {issueCertModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1100,
          background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            maxWidth: 580, width: '100%', background: '#0F2E1E', borderRadius: 24,
            border: `1px solid ${RF_GOLD_YELLOW}66`, padding: '32px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.9)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, background: 'rgba(255, 209, 102, 0.15)',
                border: `1px solid ${RF_GOLD_YELLOW}66`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: RF_GOLD_YELLOW
              }}>
                <Award size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                  Issue Pioneer Certificate of Level Completion
                </h3>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
                  Mint a tamper-evident accreditation credential for a verified contributor
                </div>
              </div>
            </div>

            <form onSubmit={handleConfirmIssueCertificate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Select Member */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#FFFFFF', marginBottom: 6 }}>
                  Select Pioneer Contributor *
                </label>
                <select
                  value={issueCertMemberEmail}
                  onChange={e => setIssueCertMemberEmail(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)',
                    color: '#FFFFFF', fontSize: 13, outline: 'none'
                  }}
                  required
                >
                  {membersList.map(m => (
                    <option key={m.id} value={m.email}>
                      {m.full_name} ({m.pioneer_id || 'PENDING'} • {m.division} • {getVerifiedJobsCount(m.email)} verified jobs)
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Level to Certify */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#FFFFFF', marginBottom: 6 }}>
                  Accreditation Tier Level *
                </label>
                <select
                  value={issueCertLevel}
                  onChange={e => setIssueCertLevel(e.target.value as any)}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)',
                    color: RF_GOLD_YELLOW, fontSize: 13, fontWeight: 700, outline: 'none'
                  }}
                  required
                >
                  <option value="LEVEL_1">Level 1: Pioneer Associate (Orientation)</option>
                  <option value="LEVEL_2">Level 2: Refeir Pioneer (15+ verified deliverables)</option>
                  <option value="LEVEL_3">Level 3: Refeir Builder (40+ verified deliverables)</option>
                  <option value="LEVEL_4">Level 4: Refeir Lead (75+ verified deliverables)</option>
                  <option value="LEVEL_5">Level 5: Refeir Core Team (125+ verified deliverables)</option>
                </select>
              </div>

              {/* Verified Jobs Notice */}
              {(() => {
                const targetMember = membersList.find(m => m.email.toLowerCase() === issueCertMemberEmail.toLowerCase());
                const verifiedCount = targetMember ? getVerifiedJobsCount(targetMember.email) : 0;
                const required = MIN_JOBS_FOR_PROMOTION[issueCertLevel] || 0;
                const meets = verifiedCount >= required;

                return (
                  <div style={{
                    background: meets ? 'rgba(24, 252, 92, 0.08)' : 'rgba(255, 209, 102, 0.08)',
                    border: `1px solid ${meets ? RF_LEAF_GREEN : RF_GOLD_YELLOW}44`,
                    padding: '10px 14px', borderRadius: 10, fontSize: 12, color: '#FFFFFF'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginBottom: 2 }}>
                      <span>Verified Deliverables Logged:</span>
                      <span style={{ color: meets ? RF_MINT_ACCENT : RF_GOLD_YELLOW }}>{verifiedCount} / {required} required</span>
                    </div>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>
                      {meets ? '✓ Contributor satisfies the 5x verified proof-of-work quota for this accreditation.' : '⚠️ Contributor has not reached the standard 5x quota. Administrator manual override is active.'}
                    </span>
                  </div>
                );
              })()}

              {/* Commendation / Special Distinction */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#FFFFFF', marginBottom: 6 }}>
                  Special Distinction &amp; Commendation Note
                </label>
                <input
                  type="text"
                  value={issueCertDistinction}
                  onChange={e => setIssueCertDistinction(e.target.value)}
                  placeholder="e.g. Founding 100 Distinction • Outstanding UI Architecture"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)',
                    color: '#FFFFFF', fontSize: 13, outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIssueCertModalOpen(false)}
                  style={{
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)',
                    color: '#FFFFFF', padding: '10px 18px', borderRadius: 100, fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    background: RF_LEAF_GREEN, color: RF_DEEP_GREEN, border: 'none',
                    padding: '10px 22px', borderRadius: 100, fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                    boxShadow: `0 4px 14px ${RF_LEAF_GREEN}44`
                  }}
                >
                  <Award size={15} /> Issue &amp; Mint Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── ANNOUNCE NEW SQUAD TASK / BOUNTY MODAL ───────────────────────── */}
      {newTaskModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1100,
          background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            maxWidth: 720, width: '100%', maxHeight: '90vh', overflowY: 'auto',
            background: '#0F2E1E', borderRadius: 24,
            border: `1px solid ${RF_LEAF_GREEN}66`, padding: '32px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.9)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, background: 'rgba(24, 252, 92, 0.15)',
                  border: `1px solid ${RF_LEAF_GREEN}66`, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: RF_MINT_ACCENT
                }}>
                  <Radio size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                    Squad Lead Broadcast Protocol
                  </h3>
                  <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
                    Announce &amp; broadcast missions directly to WhatsApp groups with special Airtime, Data, or Cash bounties
                  </div>
                </div>
              </div>

              <button
                onClick={() => setNewTaskModalOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.6)',
                  width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Mission Title */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#FFFFFF', marginBottom: 6 }}>
                  Mission Title *
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Campus Viral Loop: Share Refeir Milestone Carousel to WhatsApp Status"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)',
                    color: '#FFFFFF', fontSize: 13.5, outline: 'none', boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              {/* Target Squad & Cycle Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#FFFFFF', marginBottom: 6 }}>
                    Target Squad / Division *
                  </label>
                  <select
                    value={newTaskSquad}
                    onChange={e => setNewTaskSquad(e.target.value as any)}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 10,
                      background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)',
                      color: '#FFFFFF', fontSize: 13, outline: 'none'
                    }}
                    required
                  >
                    <option value="GENERAL">General Community (All Squads)</option>
                    <option value="TECHNOLOGY">Technology &amp; Protocol</option>
                    <option value="CREATIVE">Brand Strategy &amp; Creative</option>
                    <option value="GROWTH">Growth &amp; Virality</option>
                    <option value="COMMUNITY">Community &amp; Culture</option>
                    <option value="OPERATIONS">Operations &amp; Delivery</option>
                    <option value="ENTERPRISE">Enterprise &amp; BD</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#FFFFFF', marginBottom: 6 }}>
                    Frequency / Sprint Cycle *
                  </label>
                  <select
                    value={newTaskFrequency}
                    onChange={e => setNewTaskFrequency(e.target.value as any)}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 10,
                      background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)',
                      color: '#FFFFFF', fontSize: 13, outline: 'none'
                    }}
                    required
                  >
                    <option value="DAILY">Daily Task (24-Hour Sprint)</option>
                    <option value="WEEKLY">Weekly Sprint Objective</option>
                    <option value="FLASH_BOUNTY">Flash Bounty (Limited Window)</option>
                  </select>
                </div>
              </div>

              {/* Category & Deadline Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#FFFFFF', marginBottom: 6 }}>
                    Task Category *
                  </label>
                  <input
                    type="text"
                    value={newTaskCategory}
                    onChange={e => setNewTaskCategory(e.target.value)}
                    placeholder="e.g. Liking, Commenting & Viral Loop Sharing"
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 10,
                      background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)',
                      color: '#FFFFFF', fontSize: 13, outline: 'none', boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#FFFFFF', marginBottom: 6 }}>
                    Submission Deadline
                  </label>
                  <input
                    type="text"
                    value={newTaskDeadline}
                    onChange={e => setNewTaskDeadline(e.target.value)}
                    placeholder="e.g. Today 11:59 PM WAT"
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 10,
                      background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)',
                      color: '#FFFFFF', fontSize: 13, outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Special Bonus / Bounty Incentive Box */}
              <div style={{
                background: 'rgba(0,0,0,0.3)', borderRadius: 14, padding: '18px 20px',
                border: '1px solid rgba(255, 209, 102, 0.25)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Gift size={16} color={RF_GOLD_YELLOW} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: RF_GOLD_YELLOW, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Special Bonus &amp; Bounty Motivation (Airtime, Data, Cash)
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#FFFFFF', marginBottom: 4 }}>
                      Bounty Reward Type *
                    </label>
                    <select
                      value={newTaskBountyType}
                      onChange={e => setNewTaskBountyType(e.target.value as any)}
                      style={{
                        width: '100%', padding: '8px 12px', borderRadius: 8,
                        background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)',
                        color: '#FFFFFF', fontSize: 12.5, outline: 'none'
                      }}
                      required
                    >
                      <option value="AIRTIME">Airtime Giveaway (e.g. ₦1,500 Airtime)</option>
                      <option value="DATA">Data Subscription (e.g. 5GB - 10GB Data)</option>
                      <option value="CASH">Monetary Cash Bounty (Direct Payout)</option>
                      <option value="XP_CREDIT">Sovereign Deliverable XP Credit</option>
                      <option value="NONE">No Special Bounty (Standard Deliverable)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#FFFFFF', marginBottom: 4 }}>
                      Bounty Prize Label
                    </label>
                    <input
                      type="text"
                      value={newTaskBountyReward}
                      onChange={e => setNewTaskBountyReward(e.target.value)}
                      placeholder="e.g. ₦1,500 Airtime Voucher or 10GB Data"
                      style={{
                        width: '100%', padding: '8px 12px', borderRadius: 8,
                        background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)',
                        color: '#FFFFFF', fontSize: 12.5, outline: 'none', boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#FFFFFF', marginBottom: 4 }}>
                      Max Claims / Winner Cap
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={newTaskMaxClaims}
                      onChange={e => setNewTaskMaxClaims(Number(e.target.value))}
                      style={{
                        width: '100%', padding: '8px 12px', borderRadius: 8,
                        background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)',
                        color: '#FFFFFF', fontSize: 12.5, outline: 'none', boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#FFFFFF', marginBottom: 4 }}>
                      Deliverable Verification Format
                    </label>
                    <input
                      type="text"
                      defaultValue="Screenshot Proof + Live Post Link"
                      placeholder="e.g. Screenshot Proof + Live Post Link"
                      style={{
                        width: '100%', padding: '8px 12px', borderRadius: 8,
                        background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)',
                        color: '#FFFFFF', fontSize: 12.5, outline: 'none', boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#FFFFFF', marginBottom: 4 }}>
                    Bounty Claim Instructions
                  </label>
                  <input
                    type="text"
                    value={newTaskBountyInstructions}
                    onChange={e => setNewTaskBountyInstructions(e.target.value)}
                    placeholder="e.g. First 10 verified submissions will receive instant mobile airtime voucher on WhatsApp."
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: 8,
                      background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)',
                      color: '#FFFFFF', fontSize: 12, outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Task Description */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#FFFFFF', marginBottom: 6 }}>
                  Mission Briefing &amp; Context *
                </label>
                <textarea
                  value={newTaskDescription}
                  onChange={e => setNewTaskDescription(e.target.value)}
                  rows={3}
                  placeholder="Explain the mission, purpose, why this matters for Refeir, and the target audience..."
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)',
                    color: '#FFFFFF', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              {/* Requirements Checklist (Newline separated) */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#FFFFFF', marginBottom: 6 }}>
                  Deliverable Requirements (One per line)
                </label>
                <textarea
                  value={newTaskRequirements}
                  onChange={e => setNewTaskRequirements(e.target.value)}
                  rows={3}
                  placeholder="1. Like and leave an insightful comment on the linked post&#10;2. Share to your WhatsApp status or story&#10;3. Take a screenshot showing your engagement&#10;4. Submit proof via Refeir Pioneers submit portal"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)',
                    color: '#FFFFFF', fontSize: 12.5, outline: 'none', resize: 'vertical', boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* WhatsApp Broadcast Live Preview */}
              <div style={{
                background: 'rgba(37, 211, 102, 0.08)', border: '1px dashed rgba(37, 211, 102, 0.4)',
                borderRadius: 14, padding: '14px 18px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: '#25D366', fontSize: 12, fontWeight: 700 }}>
                  <MessageSquare size={14} /> WhatsApp Broadcast Message Preview (Ready for Squad Groups)
                </div>
                <div style={{
                  fontSize: 12, color: 'rgba(255,255,255,0.85)', fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap', lineHeight: 1.5, background: 'rgba(0,0,0,0.3)',
                  padding: '10px 12px', borderRadius: 8
                }}>
{`📢 *REFEIR PIONEERS • ${newTaskFrequency.replace('_', ' ')} MISSION*
🎯 *Squad:* ${SQUAD_INFO[newTaskSquad]?.name || 'All Squads'}
━━━━━━━━━━━━━━━━━━━━
⚡ *${newTaskTitle || 'Mission Title'}*
${newTaskBountyType !== 'NONE' ? `🎁 *Bounty Reward:* ${newTaskBountyReward || 'Special Bounty'}\n` : ''}⏱️ *Deadline:* ${newTaskDeadline}
━━━━━━━━━━━━━━━━━━━━
👉 *Full briefing & submit proof:* ${window.location.origin}/tasks`}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setNewTaskModalOpen(false)}
                  style={{
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)',
                    color: '#FFFFFF', padding: '10px 18px', borderRadius: 100, fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    background: RF_LEAF_GREEN, color: RF_DEEP_GREEN, border: 'none',
                    padding: '10px 24px', borderRadius: 100, fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                    boxShadow: `0 4px 14px ${RF_LEAF_GREEN}44`
                  }}
                >
                  <Radio size={14} /> Launch Broadcast Protocol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── CERTIFICATE INSPECTION / PRINT MODAL ───────────────────────── */}
      {isCertificateModalOpen && selectedCertificateForModal && (
        <CertificateModal
          certificate={selectedCertificateForModal}
          isOpen={isCertificateModalOpen}
          onClose={() => setIsCertificateModalOpen(false)}
        />
      )}
    </div>
  );
};

