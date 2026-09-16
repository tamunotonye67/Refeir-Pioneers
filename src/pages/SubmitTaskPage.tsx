import React, { useState, useRef, useEffect } from 'react';
import {
  Upload, X, CheckCircle2, AlertCircle, ArrowRight, FileText,
  Image as ImageIcon, Link as LinkIcon, Shield, ShieldCheck, Award, Zap,
  Check, ChevronRight, Eye, RefreshCw, User, LogIn,
  LogOut, Clock, XCircle, ExternalLink, Lock, Key, Search, Mail, Briefcase, Globe
} from 'lucide-react';
import {
  RF_DEEP_GREEN,
  RF_DARK_GREEN,
  RF_FOREST_DARK,
  RF_GREEN,
  RF_LEAF_GREEN,
  RF_MINT_ACCENT,
  RF_GOLD_YELLOW,
  RF_ORANGE
} from '../constants/brand';
import {
  saveTaskSubmission,
  getTaskSubmissions,
  ScreenshotAttachment,
  TaskSubmissionRecord
} from '../lib/taskSubmissions';
import {
  getCurrentContributor,
  signOutContributor,
  ContributorProfile
} from '../lib/contributorAuth';

interface SubmitTaskPageProps {
  onNavigate: (path: string) => void;
  onOpenStatus: () => void;
}

const DIVISIONS_LIST = [
  { id: 'TECHNOLOGY', name: 'Technology & Architecture' },
  { id: 'DESIGN', name: 'Product, UI/UX & Brand Design' },
  { id: 'GROWTH', name: 'Growth, Marketing & Referrals' },
  { id: 'COMMUNITY', name: 'Community, Regional & Campus Chapters' },
  { id: 'OPERATIONS', name: 'Operations, Quality & Governance' },
  { id: 'BUSINESS', name: 'Business Development & Strategic Partnerships' },
  { id: 'GENERAL', name: 'Cross-Functional / General Mission' }
];

const TASK_CATEGORIES = [
  'Social Media Post Sharing & Amplification (X, LinkedIn, Facebook, etc.)',
  'Social Media Engagement: Liking & Commenting',
  'Software Engineering, Bug Fix or Smart Contract',
  'UI/UX Design, Mockups or Brand Graphics',
  'Community Moderation, Growth Loop or Referral Drive',
  'Campus Workshop, Meetup or Physical Event',
  'Technical Documentation, Article or Whitepaper',
  'QA Testing, Bug Bounty or Audit Report',
  'Strategic Partnership or Pilot Client Lead'
];

export const SubmitTaskPage: React.FC<SubmitTaskPageProps> = ({ onNavigate, onOpenStatus }) => {
  // Contributor Session & History State
  const [contributor, setContributor] = useState<ContributorProfile | null>(getCurrentContributor());
  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');
  const [myTasks, setMyTasks] = useState<TaskSubmissionRecord[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState(() => contributor?.full_name || '');
  const [email, setEmail] = useState(() => contributor?.email || '');
  const [applicationNumber, setApplicationNumber] = useState(() => contributor?.application_number || '');
  const [pioneerId, setPioneerId] = useState(() => contributor?.pioneer_id || '');
  const [division, setDivision] = useState(() => contributor?.division || 'TECHNOLOGY');
  const [targetLevel, setTargetLevel] = useState<'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4' | 'LEVEL_5'>('LEVEL_2');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState(TASK_CATEGORIES[0]);
  const [taskDescription, setTaskDescription] = useState('');
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [additionalUrl, setAdditionalUrl] = useState('');
  const [agreeAuthentic, setAgreeAuthentic] = useState(false);

  // Screenshots state
  const [screenshots, setScreenshots] = useState<ScreenshotAttachment[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [previewModalImg, setPreviewModalImg] = useState<string | null>(null);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedRecord, setSubmittedRecord] = useState<{
    referenceId: string;
    taskTitle: string;
    targetLevel: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize contributor auth changes
  useEffect(() => {
    const syncContributor = () => {
      const user = getCurrentContributor();
      setContributor(user);
      if (user) {
        setFullName(user.full_name);
        setEmail(user.email);
        if (user.application_number) setApplicationNumber(user.application_number);
        if (user.pioneer_id) setPioneerId(user.pioneer_id);
        if (user.division) setDivision(user.division);
      }
    };

    syncContributor();
    window.addEventListener('refeir-auth-change', syncContributor);
    return () => window.removeEventListener('refeir-auth-change', syncContributor);
  }, []);

  // Fetch past missions submitted by this contributor
  useEffect(() => {
    const fetchUserTasks = async () => {
      const targetEmail = (contributor?.email || email).trim().toLowerCase();
      if (!targetEmail) {
        setMyTasks([]);
        return;
      }
      setLoadingTasks(true);
      try {
        const allTasks = await getTaskSubmissions();
        const filtered = allTasks.filter(t => t.email.toLowerCase() === targetEmail);
        setMyTasks(filtered);
      } catch (err) {
        console.warn('Failed to load user missions:', err);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchUserTasks();
  }, [contributor, email, submittedRecord]);

  // Compress image on canvas to keep localStorage light & prevent performance bottleneck
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
            resolve(dataUrl);
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => reject(new Error('Failed to load image for compression'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsCompressing(true);
    setErrorMessage('');

    try {
      const newScreenshots: ScreenshotAttachment[] = [];
      const remainingSlots = 5 - screenshots.length;
      const countToProcess = Math.min(files.length, remainingSlots);

      if (files.length > remainingSlots) {
        setErrorMessage(`Only up to 5 screenshots are allowed. Added the first ${remainingSlots}.`);
      }

      for (let i = 0; i < countToProcess; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;

        const dataUrl = await compressImage(file);
        newScreenshots.push({
          id: `scr-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          name: file.name,
          data_url: dataUrl,
          size: file.size,
          caption: ''
        });
      }

      setScreenshots(prev => [...prev, ...newScreenshots]);
    } catch (err) {
      console.error(err);
      setErrorMessage('Could not process some image files. Please verify the images and try again.');
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveScreenshot = (id: string) => {
    setScreenshots(prev => prev.filter(item => item.id !== id));
  };

  const handleCaptionChange = (id: string, caption: string) => {
    setScreenshots(prev => prev.map(item => item.id === id ? { ...item, caption } : item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please provide your Full Name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide a valid registered Email address.');
      return;
    }
    if (!applicationNumber.trim()) {
      setErrorMessage('Please provide your official Application ID (e.g. RP-2026-492019). Both Application ID and Pioneer ID are required.');
      return;
    }
    if (!pioneerId.trim()) {
      setErrorMessage('Please provide your assigned Pioneer ID (e.g. RP-045). Both Application ID and Pioneer ID are required.');
      return;
    }
    if (!taskTitle.trim()) {
      setErrorMessage('Please provide a descriptive Task / Mission Title.');
      return;
    }
    if (!taskDescription.trim() || taskDescription.trim().length < 25) {
      setErrorMessage('Please provide a detailed description of what you accomplished (at least 25 characters).');
      return;
    }
    if (!agreeAuthentic) {
      setErrorMessage('Please check the authenticity declaration to confirm this is your own work.');
      return;
    }

    setSubmitting(true);

    try {
      const saved = await saveTaskSubmission({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        application_number: applicationNumber.trim().toUpperCase(),
        pioneer_id: pioneerId.trim().toUpperCase(),
        division,
        target_level: targetLevel,
        task_title: taskTitle.trim(),
        task_category: taskCategory,
        task_description: taskDescription.trim(),
        deliverable_url: deliverableUrl.trim() || undefined,
        additional_url: additionalUrl.trim() || undefined,
        screenshots
      });

      setSubmittedRecord({
        referenceId: saved.reference_id,
        taskTitle: saved.task_title,
        targetLevel: saved.target_level
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'An error occurred while submitting your task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTaskTitle('');
    setTaskDescription('');
    setDeliverableUrl('');
    setAdditionalUrl('');
    setScreenshots([]);
    setAgreeAuthentic(false);
    setSubmittedRecord(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(180deg, ${RF_FOREST_DARK} 0%, ${RF_DEEP_GREEN} 50%, ${RF_FOREST_DARK} 100%)`,
      color: '#FFFFFF',
      fontFamily: 'Plus Jakarta Sans, Manrope, sans-serif',
      paddingTop: 88,
      paddingBottom: 90
    }}>
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 24px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 28 }}>
          <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('/')}>Home</span>
          <ChevronRight size={14} />
          <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('/rewards')}>Rewards Ladder</span>
          <ChevronRight size={14} />
          <span style={{ color: RF_MINT_ACCENT, fontWeight: 600 }}>Submit Task Proof</span>
        </div>

        {/* ─── SUCCESS VIEW ────────────────────────────────────────────────────────── */}
        {submittedRecord ? (
          <div style={{
            background: 'rgba(15, 46, 30, 0.9)',
            border: `1.5px solid ${RF_MINT_ACCENT}55`,
            borderRadius: 24,
            padding: '48px 36px',
            textAlign: 'center',
            boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 40px ${RF_MINT_ACCENT}15`
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', background: `${RF_LEAF_GREEN}20`,
              border: `2px solid ${RF_LEAF_GREEN}`, display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 24px', color: RF_MINT_ACCENT
            }}>
              <CheckCircle2 size={40} />
            </div>

            <div style={{
              display: 'inline-block', padding: '4px 14px', borderRadius: 100,
              background: 'rgba(24, 252, 92, 0.12)', border: `1px solid ${RF_LEAF_GREEN}44`,
              color: RF_MINT_ACCENT, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', marginBottom: 12
            }}>
              Proof of Work Queued for Verification
            </div>

            <h1 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 800, color: '#FFFFFF', marginBottom: 12, lineHeight: 1.2 }}>
              Task Submitted Successfully!
            </h1>

            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', maxWidth: 600, margin: '0 auto 28px', lineHeight: 1.6 }}>
              Thank you, <strong style={{ color: '#FFFFFF' }}>{fullName}</strong>. Your mission submission has been logged with reference code:
            </p>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'rgba(7, 24, 15, 0.8)', padding: '12px 24px', borderRadius: 12,
              border: `1px solid ${RF_LEAF_GREEN}66`, color: RF_MINT_ACCENT,
              fontSize: 20, fontWeight: 800, letterSpacing: '0.05em', marginBottom: 32
            }}>
              <Award size={22} />
              {submittedRecord.referenceId}
            </div>

            {/* Submission Detail Summary Card */}
            <div style={{
              background: 'rgba(7, 24, 15, 0.6)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: '20px 24px', maxWidth: 640, margin: '0 auto 36px',
              textAlign: 'left'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                <div>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block' }}>Target Ladder Rank</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: RF_GOLD_YELLOW }}>
                    {submittedRecord.targetLevel === 'LEVEL_2' && 'Level 2: Refeir Pioneer'}
                    {submittedRecord.targetLevel === 'LEVEL_3' && 'Level 3: Refeir Builder'}
                    {submittedRecord.targetLevel === 'LEVEL_4' && 'Level 4: Refeir Lead'}
                    {submittedRecord.targetLevel === 'LEVEL_5' && 'Level 5: Refeir Core Team'}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block' }}>Evidence Attachments</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF' }}>
                    {screenshots.length} Screenshot{screenshots.length === 1 ? '' : 's'} Uploaded
                  </span>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block' }}>Task Title</span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#FFFFFF' }}>{submittedRecord.taskTitle}</span>
                </div>
              </div>

              <div style={{
                marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)',
                fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5
              }}>
                ⚡ <strong>What happens next:</strong> Your division squad lead and Admissions Team review submissions weekly. Once verified, your status on the Contributor Ladder is elevated and badge credentials are generated.
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14 }}>
              <button
                onClick={resetForm}
                style={{
                  background: RF_LEAF_GREEN, color: RF_DEEP_GREEN, border: 'none',
                  padding: '13px 26px', borderRadius: 100, fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = RF_MINT_ACCENT)}
                onMouseLeave={e => (e.currentTarget.style.background = RF_LEAF_GREEN)}
              >
                <RefreshCw size={16} /> Submit Another Mission
              </button>

              <button
                onClick={() => onNavigate('/rewards')}
                style={{
                  background: 'rgba(255,255,255,0.06)', color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.2)', padding: '13px 24px',
                  borderRadius: 100, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              >
                View Rewards Ladder <ArrowRight size={16} />
              </button>

              <button
                onClick={onOpenStatus}
                style={{
                  background: 'none', color: RF_MINT_ACCENT, border: 'none',
                  padding: '13px 20px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'underline'
                }}
              >
                Check Application Status
              </button>
            </div>
          </div>
        ) : (
          /* ─── FORM VIEW ────────────────────────────────────────────────────────── */
          <div>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 38 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '4px 14px', borderRadius: 100,
                background: 'rgba(24, 252, 92, 0.1)', border: `1px solid ${RF_LEAF_GREEN}44`,
                color: RF_MINT_ACCENT, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
                textTransform: 'uppercase', marginBottom: 14
              }}>
                <Shield size={13} />
                PROOF OF WORK &amp; ADVANCEMENT
              </div>

              <h1 style={{
                fontSize: 'clamp(28px, 4.5vw, 42px)', fontWeight: 800,
                color: '#FFFFFF', lineHeight: 1.2, marginBottom: 16,
                fontFamily: 'Plus Jakarta Sans, sans-serif'
              }}>
                Report Completed Task &amp; <br />
                <span style={{ whiteSpace: 'nowrap' }}>Submit Evidence</span>
              </h1>

              <p style={{
                fontSize: 16, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6,
                maxWidth: 680, margin: '0 auto'
              }}>
                Refeir operates on verified execution. When you complete a squad mission, bug bounty, growth loop, or campus milestone, report it here with screenshots and deliverables to advance on the <strong>Contributor Ladder</strong>.
              </p>
            </div>

            {/* Verification Rule Notice Card */}
            <div className="rp-banner-card" style={{
              background: 'rgba(15, 46, 30, 0.7)',
              border: `1px solid ${RF_LEAF_GREEN}35`
            }}>
              <div className="rp-banner-content">
                <div className="rp-banner-icon">
                  <ShieldCheck size={20} />
                </div>
                <div className="rp-banner-body">
                  <div className="rp-banner-title">
                    Advancing to Level 2 (Refeir Pioneer) &amp; Beyond
                  </div>
                  <p className="rp-banner-text">
                    Submitting tangible proof of work (such as code PRs, Figma links, and screenshots) allows your squad leader and core team to upgrade your profile, mint your verified badge, and unlock commission multipliers.
                  </p>
                </div>
              </div>
            </div>

            {/* Contributor Profile Banner / Sign In Trigger */}
            <div className="rp-banner-card" style={{
              background: contributor ? 'rgba(24, 252, 92, 0.08)' : 'rgba(255, 255, 255, 0.04)',
              border: contributor ? `1px solid ${RF_LEAF_GREEN}55` : '1px solid rgba(255, 255, 255, 0.12)'
            }}>
              {contributor ? (
                <div className="rp-banner-content">
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${RF_LEAF_GREEN} 0%, ${RF_MINT_ACCENT} 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: RF_DEEP_GREEN, fontWeight: 800, fontSize: 15,
                    flexShrink: 0, overflow: 'hidden'
                  }}>
                    {contributor.avatar_url ? (
                      <img src={contributor.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      contributor.full_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="rp-banner-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14.5, fontWeight: 700, color: '#FFFFFF' }}>
                        {contributor.full_name}
                      </span>
                      <span style={{
                        fontSize: 10.5, fontWeight: 700, color: RF_DEEP_GREEN, background: RF_MINT_ACCENT,
                        padding: '2px 8px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.04em'
                      }}>
                        {contributor.contributor_level.replace('_', ' ')}
                      </span>
                      <span style={{
                        fontSize: 10.5, color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.08)',
                        padding: '2px 8px', borderRadius: 100
                      }}>
                        {contributor.division}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4, wordBreak: 'break-word', lineHeight: 1.45 }}>
                      {contributor.email} {contributor.application_number ? `• App: ${contributor.application_number}` : ''} {contributor.pioneer_id ? `• Pioneer Seat: ${contributor.pioneer_id}` : ''} — Task proofs are linked to your profile
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rp-banner-content">
                  <div className="rp-banner-icon">
                    <User size={19} />
                  </div>
                  <div className="rp-banner-body">
                    <div className="rp-banner-title">
                      Track Missions with a Refeir Contributor Profile
                    </div>
                    <p className="rp-banner-text">
                      Sign in to avoid typing your Application ID &amp; Pioneer ID every time, and track all your approved proofs automatically.
                    </p>
                  </div>
                </div>
              )}

              <div className="rp-banner-action-col">
                {contributor ? (
                  <button
                    onClick={() => signOutContributor()}
                    className="rp-banner-btn-signout"
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#FCA5A5',
                      padding: '8px 18px',
                      borderRadius: 100,
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      lineHeight: 1,
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                  >
                    <LogOut size={13} style={{ flexShrink: 0 }} />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigate('/signin')}
                    className="rp-banner-btn"
                  >
                    <LogIn size={14} style={{ flexShrink: 0 }} />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            </div>

            {contributor && !contributor.is_profile_completed && (
              <div style={{
                background: 'rgba(255, 184, 0, 0.12)', border: '1px solid rgba(255, 184, 0, 0.4)',
                borderRadius: 16, padding: '16px 20px', marginBottom: 24,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <AlertCircle size={22} color={RF_GOLD_YELLOW} style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: '#FFFFFF', fontSize: 14 }}>Complete Your Contributor Profile</strong>
                    <div style={{ fontSize: 12.5, color: '#FDE68A', marginTop: 2 }}>
                      Your official Pioneer ID is minted once your profile is completed. Please complete your profile to unlock task verification and receive your credential pass.
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('/complete-profile')}
                  style={{
                    background: RF_GOLD_YELLOW, color: RF_DEEP_GREEN, border: 'none',
                    padding: '9px 20px', borderRadius: 100, fontSize: 13, fontWeight: 800,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                    boxShadow: '0 2px 10px rgba(255, 184, 0, 0.3)'
                  }}
                >
                  Complete Profile Now →
                </button>
              </div>
            )}

            {!contributor ? (
              /* ─── PIONEER AUTHENTICATION REQUIRED GATE ─── */
              <div className="rp-auth-gate-card">
                <div className="rp-auth-gate-icon-box">
                  <Lock size={26} />
                </div>

                <span className="rp-auth-gate-badge">
                  Access Restricted • Pioneer Sign-In Required
                </span>

                <h2 className="rp-auth-gate-title">
                  Pioneer Verification Required
                </h2>

                <p className="rp-auth-gate-desc">
                  Task reporting, mission deliverables, and Contributor Ladder upgrades are restricted to <strong>officially accepted Refeir Pioneers</strong>. Members must enter their mandatory <strong>Application ID</strong> &amp; <strong>Pioneer ID</strong>, and be issued an official Acceptance Code.
                </p>

                <div className="rp-auth-gate-steps">
                  <div className="rp-auth-gate-step-item">
                    <div className="rp-auth-gate-step-num">1</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="rp-auth-gate-step-title">Application &amp; Pioneer ID</div>
                      <div className="rp-auth-gate-step-desc">Both IDs are mandatory and assigned upon admission.</div>
                    </div>
                  </div>

                  <div className="rp-auth-gate-step-item">
                    <div className="rp-auth-gate-step-num">2</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="rp-auth-gate-step-title">Acceptance Code</div>
                      <div className="rp-auth-gate-step-desc">Issued by admissions to confirm your verified seat.</div>
                    </div>
                  </div>
                </div>

                <div className="rp-auth-gate-actions">
                  <button
                    onClick={() => onNavigate('/signin')}
                    className="rp-auth-gate-btn-primary"
                  >
                    <LogIn size={15} style={{ flexShrink: 0 }} />
                    <span>Sign In / Activate</span>
                  </button>

                  <button
                    onClick={onOpenStatus}
                    className="rp-auth-gate-btn-secondary"
                  >
                    <Search size={15} style={{ flexShrink: 0, color: RF_MINT_ACCENT }} />
                    <span>Check Admission Status</span>
                  </button>
                </div>

                <div className="rp-auth-gate-link-wrap">
                  <button
                    onClick={() => onNavigate('/#apply')}
                    className="rp-auth-gate-apply-link"
                  >
                    Not yet applied? Apply to Pioneers →
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* View Mode Tabs (Submit New vs Past Missions History) */}
                <div style={{
                  display: 'flex', background: 'rgba(0,0,0,0.35)', borderRadius: 14,
                  padding: 4, marginBottom: 26, border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('submit')}
                style={{
                  flex: 1, padding: '11px 16px', borderRadius: 10, border: 'none',
                  background: activeTab === 'submit' ? RF_LEAF_GREEN : 'transparent',
                  color: activeTab === 'submit' ? RF_DEEP_GREEN : 'rgba(255,255,255,0.75)',
                  fontSize: 13.5, fontWeight: 700, cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.15s'
                }}
              >
                <Zap size={15} /> Submit New Mission Proof
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('history')}
                style={{
                  flex: 1, padding: '11px 16px', borderRadius: 10, border: 'none',
                  background: activeTab === 'history' ? RF_LEAF_GREEN : 'transparent',
                  color: activeTab === 'history' ? RF_DEEP_GREEN : 'rgba(255,255,255,0.75)',
                  fontSize: 13.5, fontWeight: 700, cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.15s'
                }}
              >
                <FileText size={15} />
                My Mission History
                {myTasks.length > 0 && (
                  <span style={{
                    background: activeTab === 'history' ? RF_DEEP_GREEN : 'rgba(24, 252, 92, 0.2)',
                    color: activeTab === 'history' ? RF_MINT_ACCENT : '#FFFFFF',
                    fontSize: 11, fontWeight: 800, padding: '1px 7px', borderRadius: 100
                  }}>
                    {myTasks.length}
                  </span>
                )}
              </button>
            </div>

            {/* TAB: MISSION HISTORY */}
            {activeTab === 'history' && (
              <div style={{
                background: 'rgba(7, 24, 15, 0.75)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(102, 187, 42, 0.2)',
                borderRadius: 24,
                padding: 'clamp(24px, 4vw, 36px)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                      My Tracked Proofs of Work
                    </h2>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: '4px 0 0' }}>
                      Associated with: <strong style={{ color: RF_MINT_ACCENT }}>{contributor?.email || email || 'Current Session'}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('submit')}
                    style={{
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)',
                      color: '#FFFFFF', padding: '8px 16px', borderRadius: 100, fontSize: 12.5,
                      fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                    }}
                  >
                    <Zap size={14} color={RF_MINT_ACCENT} /> Submit Another Task
                  </button>
                </div>

                {loadingTasks ? (
                  <div style={{ textAlign: 'center', padding: '50px 0', color: 'rgba(255,255,255,0.6)' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
                    <div>Loading your mission history...</div>
                  </div>
                ) : myTasks.length === 0 ? (
                  <div style={{
                    textAlign: 'center', padding: '48px 20px', background: 'rgba(0,0,0,0.2)',
                    borderRadius: 16, border: '1px dashed rgba(255,255,255,0.15)'
                  }}>
                    <FileText size={36} color="rgba(255,255,255,0.3)" style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF', marginBottom: 6 }}>
                      No Task Submissions Found Yet
                    </div>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', maxWidth: 440, margin: '0 auto 20px' }}>
                      You haven't submitted any mission proofs under this email yet. Complete a squad task, upload your proof, and start climbing the Refeir Contributor Ladder!
                    </p>
                    <button
                      onClick={() => setActiveTab('submit')}
                      style={{
                        background: RF_LEAF_GREEN, color: RF_DEEP_GREEN, border: 'none',
                        padding: '10px 22px', borderRadius: 100, fontSize: 13, fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Submit Your First Mission Proof
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {myTasks.map(task => {
                      const isVerified = task.status === 'VERIFIED';
                      const isPending = task.status === 'PENDING';
                      const isRevision = task.status === 'NEEDS_REVISION';
                      const isRejected = task.status === 'REJECTED';

                      return (
                        <div
                          key={task.id}
                          style={{
                            background: 'rgba(15, 46, 30, 0.65)',
                            border: `1px solid ${isVerified ? RF_LEAF_GREEN + '66' : isRevision ? RF_ORANGE + '66' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: 16,
                            padding: '20px 24px',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{
                                fontSize: 11, fontWeight: 800, letterSpacing: '0.06em',
                                color: RF_MINT_ACCENT, background: 'rgba(24, 252, 92, 0.1)',
                                padding: '3px 8px', borderRadius: 6, border: `1px solid ${RF_LEAF_GREEN}33`
                              }}>
                                {task.reference_id}
                              </span>
                              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                                {new Date(task.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>

                            {/* Status Badge */}
                            <div style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700,
                              background: isVerified
                                ? 'rgba(24, 252, 92, 0.15)'
                                : isPending
                                ? 'rgba(246, 178, 26, 0.15)'
                                : isRevision
                                ? 'rgba(244, 124, 32, 0.15)'
                                : 'rgba(239, 68, 68, 0.15)',
                              color: isVerified
                                ? RF_MINT_ACCENT
                                : isPending
                                ? RF_GOLD_YELLOW
                                : isRevision
                                ? RF_ORANGE
                                : '#FCA5A5',
                              border: `1px solid ${isVerified ? RF_LEAF_GREEN : isPending ? RF_GOLD_YELLOW : isRevision ? RF_ORANGE : '#EF4444'}`
                            }}>
                              {isVerified && <CheckCircle2 size={13} />}
                              {isPending && <Clock size={13} />}
                              {isRevision && <AlertCircle size={13} />}
                              {isRejected && <XCircle size={13} />}
                              {task.status.replace('_', ' ')}
                            </div>
                          </div>

                          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF', margin: '0 0 6px' }}>
                            {task.task_title}
                          </h3>

                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 6 }}>
                              {task.task_category}
                            </span>
                            <span style={{ fontSize: 11.5, color: RF_GOLD_YELLOW, background: 'rgba(246, 178, 26, 0.08)', padding: '2px 8px', borderRadius: 6 }}>
                              Target: {task.target_level.replace('_', ' ')}
                            </span>
                            <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)' }}>
                              Squad: {task.division}
                            </span>
                          </div>

                          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, margin: '0 0 14px' }}>
                            {task.task_description}
                          </p>

                          {/* Deliverables Links */}
                          {(task.deliverable_url || task.additional_url) && (
                            <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                              {task.deliverable_url && (
                                <a
                                  href={task.deliverable_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    fontSize: 12, color: RF_MINT_ACCENT, display: 'inline-flex',
                                    alignItems: 'center', gap: 4, textDecoration: 'none'
                                  }}
                                >
                                  <ExternalLink size={12} /> Primary Deliverable
                                </a>
                              )}
                              {task.additional_url && (
                                <a
                                  href={task.additional_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    fontSize: 12, color: RF_MINT_ACCENT, display: 'inline-flex',
                                    alignItems: 'center', gap: 4, textDecoration: 'none'
                                  }}
                                >
                                  <ExternalLink size={12} /> Additional URL
                                </a>
                              )}
                            </div>
                          )}

                          {/* Screenshots preview */}
                          {task.screenshots && task.screenshots.length > 0 && (
                            <div style={{ marginTop: 10 }}>
                              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>
                                Attachments ({task.screenshots.length}):
                              </span>
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {task.screenshots.map((s, idx) => (
                                  <img
                                    key={s.id || idx}
                                    src={s.data_url}
                                    alt={s.name}
                                    onClick={() => setPreviewModalImg(s.data_url)}
                                    style={{
                                      width: 60, height: 44, objectFit: 'cover', borderRadius: 6,
                                      border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer'
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Admin Feedback Box */}
                          {task.admin_feedback && (
                            <div style={{
                              marginTop: 14, padding: '10px 14px', borderRadius: 10,
                              background: isVerified ? 'rgba(24, 252, 92, 0.08)' : 'rgba(244, 124, 32, 0.08)',
                              border: `1px solid ${isVerified ? RF_LEAF_GREEN + '33' : RF_ORANGE + '33'}`,
                              fontSize: 12.5, color: '#FFFFFF', lineHeight: 1.4
                            }}>
                              <strong style={{ color: isVerified ? RF_MINT_ACCENT : RF_ORANGE }}>Reviewer Feedback: </strong>
                              {task.admin_feedback}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB: SUBMIT NEW PROOF */}
            {activeTab === 'submit' && (
              <form onSubmit={handleSubmit} style={{
                background: 'rgba(7, 24, 15, 0.75)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(102, 187, 42, 0.2)',
                borderRadius: 24,
                padding: 'clamp(24px, 4vw, 40px)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
              }}>

                {errorMessage && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444',
                    borderRadius: 12, padding: '12px 16px', color: '#FCA5A5',
                    fontSize: 14, display: 'flex', alignItems: 'center', gap: 10,
                    marginBottom: 24
                  }}>
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Section 1: Contributor Identification */}
                <div style={{ marginBottom: 32 }}>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: RF_MINT_ACCENT, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: '50%', background: `${RF_LEAF_GREEN}33`,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
                      lineHeight: 1, flexShrink: 0
                    }}>1</span>
                    Contributor Identification
                  </h2>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: 6 }}>
                        Full Name *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          placeholder="e.g. Kwame Mensah"
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          style={{
                            width: '100%', padding: '12px 14px 12px 42px', borderRadius: 10,
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
                            color: '#FFFFFF', fontSize: 14, outline: 'none', boxSizing: 'border-box'
                          }}
                        />
                        <User size={16} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                          Registered Email Address *
                        </label>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Lock size={11} /> Locked
                        </span>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="email"
                          placeholder="e.g. kwame@example.com"
                          value={email}
                          readOnly
                          style={{
                            width: '100%', padding: '12px 14px 12px 42px', borderRadius: 10,
                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
                            color: 'rgba(255,255,255,0.7)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                            cursor: 'not-allowed'
                          }}
                        />
                        <Mail size={16} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                          Application ID *
                        </label>
                        <span style={{ fontSize: 11, color: `${RF_LEAF_GREEN}cc`, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Lock size={11} /> Locked
                        </span>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          placeholder="e.g. RP-2026-492019"
                          value={applicationNumber}
                          readOnly
                          style={{
                            width: '100%', padding: '12px 14px 12px 42px', borderRadius: 10,
                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(24, 252, 92, 0.2)',
                            color: 'rgba(255,255,255,0.85)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                            fontFamily: 'monospace', textTransform: 'uppercase', cursor: 'not-allowed'
                          }}
                        />
                        <Key size={16} color="rgba(24, 252, 92, 0.5)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                          Pioneer ID *
                        </label>
                        <span style={{ fontSize: 11, color: 'rgba(246, 178, 26, 0.85)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Lock size={11} /> Locked
                        </span>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          placeholder="e.g. RP-045"
                          value={pioneerId}
                          readOnly
                          style={{
                            width: '100%', padding: '12px 14px 12px 42px', borderRadius: 10,
                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(246, 178, 26, 0.25)',
                            color: RF_GOLD_YELLOW, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                            fontFamily: 'monospace', textTransform: 'uppercase', fontWeight: 700,
                            cursor: 'not-allowed'
                          }}
                        />
                        <Award size={16} color="rgba(246, 178, 26, 0.6)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: 6 }}>
                        Primary Division / Squad *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <select
                          value={division}
                          onChange={e => setDivision(e.target.value)}
                          style={{
                            width: '100%', padding: '12px 14px 12px 42px', borderRadius: 10,
                            background: 'rgba(15, 46, 30, 0.95)', border: '1px solid rgba(255,255,255,0.15)',
                            color: '#FFFFFF', fontSize: 14, outline: 'none', boxSizing: 'border-box'
                          }}
                        >
                          {DIVISIONS_LIST.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                        <Briefcase size={16} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      </div>
                    </div>
                  </div>

                  {/* Target Contributor Level Selector */}
                  <div style={{ marginTop: 20 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: 8 }}>
                      Which Contributor Ladder Rank are you qualifying for? *
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
                      {[
                        { id: 'LEVEL_2', label: 'Level 2: Pioneer', subtitle: '1st Tangible Mission', color: RF_MINT_ACCENT, icon: Award },
                        { id: 'LEVEL_3', label: 'Level 3: Builder', subtitle: '4+ Missions Delivered', color: RF_GOLD_YELLOW, icon: Zap },
                        { id: 'LEVEL_4', label: 'Level 4: Lead', subtitle: 'Team / Squad Anchor', color: RF_ORANGE, icon: Shield },
                        { id: 'LEVEL_5', label: 'Level 5: Core Team', subtitle: 'Strategic Protocol Delivery', color: '#60A5FA', icon: ShieldCheck },
                      ].map(lvl => {
                        const active = targetLevel === lvl.id;
                        const IconComp = lvl.icon;
                        return (
                          <div
                            key={lvl.id}
                            onClick={() => setTargetLevel(lvl.id as any)}
                            style={{
                              padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                              background: active ? `${RF_LEAF_GREEN}22` : 'rgba(255,255,255,0.03)',
                              border: `1.5px solid ${active ? lvl.color : 'rgba(255,255,255,0.1)'}`,
                              transition: 'all 0.15s'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: active ? lvl.color : '#FFFFFF' }}>
                                {lvl.label}
                              </span>
                              <IconComp size={14} color={active ? lvl.color : 'rgba(255,255,255,0.4)'} style={{ flexShrink: 0 }} />
                            </div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
                              {lvl.subtitle}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Section 2: Task Details */}
                <div style={{ marginBottom: 32 }}>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: RF_MINT_ACCENT, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: '50%', background: `${RF_LEAF_GREEN}33`,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
                      lineHeight: 1, flexShrink: 0
                    }}>2</span>
                    Mission &amp; Task Deliverables
                  </h2>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginBottom: 18 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: 6 }}>
                        Task / Mission Title *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          placeholder="e.g. Implemented responsive Escrow UI component"
                          value={taskTitle}
                          onChange={e => setTaskTitle(e.target.value)}
                          style={{
                            width: '100%', padding: '12px 14px 12px 42px', borderRadius: 10,
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
                            color: '#FFFFFF', fontSize: 14, outline: 'none', boxSizing: 'border-box'
                          }}
                        />
                        <Zap size={16} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: 6 }}>
                        Task Category *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <select
                          value={taskCategory}
                          onChange={e => setTaskCategory(e.target.value)}
                          style={{
                            width: '100%', padding: '12px 14px 12px 42px', borderRadius: 10,
                            background: 'rgba(15, 46, 30, 0.95)', border: '1px solid rgba(255,255,255,0.15)',
                            color: '#FFFFFF', fontSize: 14, outline: 'none', boxSizing: 'border-box'
                          }}
                        >
                          {TASK_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <CheckCircle2 size={16} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: 6 }}>
                      Description of Work Done &amp; Impact *
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Describe what you built or accomplished, tools/technologies used, problems solved, and tangible metrics (e.g. lines of code, attendees, conversion numbers, links)..."
                      value={taskDescription}
                      onChange={e => setTaskDescription(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 14px', borderRadius: 10,
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
                        color: '#FFFFFF', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                        fontFamily: 'inherit', resize: 'vertical'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: 6 }}>
                        Primary Deliverable URL <span style={{ opacity: 0.6, fontWeight: 400 }}>(GitHub PR, Figma, Demo)</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="url"
                          placeholder="https://github.com/... or https://figma.com/..."
                          value={deliverableUrl}
                          onChange={e => setDeliverableUrl(e.target.value)}
                          style={{
                            width: '100%', padding: '12px 14px 12px 42px', borderRadius: 10,
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
                            color: '#FFFFFF', fontSize: 14, outline: 'none', boxSizing: 'border-box'
                          }}
                        />
                        <LinkIcon size={16} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: 6 }}>
                        Additional Verification URL <span style={{ opacity: 0.6, fontWeight: 400 }}>(Tweet, Docs, Drive)</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="url"
                          placeholder="https://twitter.com/... or https://docs.google.com/..."
                          value={additionalUrl}
                          onChange={e => setAdditionalUrl(e.target.value)}
                          style={{
                            width: '100%', padding: '12px 14px 12px 42px', borderRadius: 10,
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
                            color: '#FFFFFF', fontSize: 14, outline: 'none', boxSizing: 'border-box'
                          }}
                        />
                        <Globe size={16} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Screenshots & Visual Evidence */}
                <div style={{ marginBottom: 32 }}>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: RF_MINT_ACCENT, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: '50%', background: `${RF_LEAF_GREEN}33`,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
                      lineHeight: 1, flexShrink: 0
                    }}>3</span>
                    Screenshots &amp; Visual Evidence
                  </h2>

                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 16 }}>
                  Attach screenshots proving your work (e.g. terminal tests passing, code diffs, UI designs, event photos, or chat engagement). You can attach up to 5 images.
                </p>

                {/* Drag and Drop Zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${RF_LEAF_GREEN}55`,
                    borderRadius: 16,
                    padding: '28px 20px',
                    textAlign: 'center',
                    background: 'rgba(15, 46, 30, 0.4)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    marginBottom: 18
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = RF_MINT_ACCENT;
                    e.currentTarget.style.background = 'rgba(15, 46, 30, 0.7)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = `${RF_LEAF_GREEN}55`;
                    e.currentTarget.style.background = 'rgba(15, 46, 30, 0.4)';
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    multiple
                    style={{ display: 'none' }}
                    onChange={e => handleFileUpload(e.target.files)}
                  />

                  <div style={{
                    width: 48, height: 48, borderRadius: '50%', background: `${RF_LEAF_GREEN}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: RF_MINT_ACCENT,
                    margin: '0 auto 12px'
                  }}>
                    <Upload size={22} />
                  </div>

                  <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>
                    {isCompressing ? 'Processing & optimizing images...' : 'Click to Browse or Drag & Drop Screenshots'}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                    Supports PNG, JPG, JPEG, WEBP (Max 5 images)
                  </div>
                </div>

                {/* Screenshot Thumbnails & Captions */}
                {screenshots.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                    {screenshots.map((s, idx) => (
                      <div
                        key={s.id}
                        style={{
                          background: 'rgba(7, 24, 15, 0.9)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: 12,
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        {/* Image Preview */}
                        <div style={{ position: 'relative', height: 140, background: '#000000' }}>
                          <img
                            src={s.data_url}
                            alt={s.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveScreenshot(s.id)}
                            style={{
                              position: 'absolute', top: 8, right: 8,
                              width: 26, height: 26, borderRadius: '50%',
                              background: 'rgba(0,0,0,0.7)', border: 'none',
                              color: '#EF4444', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', cursor: 'pointer'
                            }}
                            title="Remove image"
                          >
                            <X size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewModalImg(s.data_url)}
                            style={{
                              position: 'absolute', bottom: 8, right: 8,
                              padding: '4px 8px', borderRadius: 6,
                              background: 'rgba(0,0,0,0.7)', border: 'none',
                              color: '#FFFFFF', display: 'flex', alignItems: 'center',
                              gap: 4, fontSize: 11, cursor: 'pointer'
                            }}
                          >
                            <Eye size={12} /> View
                          </button>
                        </div>

                        {/* Caption input */}
                        <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            #{idx + 1}: {s.name}
                          </div>
                          <input
                            type="text"
                            placeholder="Optional caption (e.g. Dashboard view)"
                            value={s.caption || ''}
                            onChange={e => handleCaptionChange(s.id, e.target.value)}
                            style={{
                              width: '100%', padding: '6px 8px', borderRadius: 6,
                              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                              color: '#FFFFFF', fontSize: 12, outline: 'none', boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 4: Declaration & Submit */}
              <div style={{
                borderTop: '1px solid rgba(255,255,255,0.1)',
                paddingTop: 24,
                marginBottom: 24
              }}>
                <label style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  cursor: 'pointer', fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5
                }}>
                  <input
                    type="checkbox"
                    checked={agreeAuthentic}
                    onChange={e => setAgreeAuthentic(e.target.checked)}
                    style={{ marginTop: 3, accentColor: RF_LEAF_GREEN, cursor: 'pointer', width: 16, height: 16, flexShrink: 0 }}
                  />
                  <span>
                    I confirm that the submitted task, deliverables, and screenshots represent my authentic individual or squad contribution to Refeir, adhere to community standards, and are ready for peer and leadership review.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || isCompressing}
                style={{
                  width: '100%',
                  background: submitting || isCompressing ? 'rgba(102, 187, 42, 0.5)' : RF_LEAF_GREEN,
                  color: RF_DEEP_GREEN,
                  border: 'none',
                  padding: '16px',
                  borderRadius: 100,
                  fontSize: 16,
                  fontWeight: 800,
                  letterSpacing: '0.01em',
                  cursor: submitting || isCompressing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  boxShadow: `0 4px 20px ${RF_LEAF_GREEN}44`,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  if (!submitting && !isCompressing) {
                    e.currentTarget.style.background = RF_MINT_ACCENT;
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={e => {
                  if (!submitting && !isCompressing) {
                    e.currentTarget.style.background = RF_LEAF_GREEN;
                    e.currentTarget.style.transform = '';
                  }
                }}
              >
                {submitting ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" style={{ flexShrink: 0 }} />
                    Submitting for Verification...
                  </>
                ) : (
                  <>
                    <Zap size={18} style={{ flexShrink: 0 }} />
                    Submit for Verification
                  </>
                )}
              </button>
            </form>
          )}
        </>
        )}
      </div>
        )}
      </div>

      {/* Lightbox Preview Modal for Screenshots */}
      {previewModalImg && (
        <div
          onClick={() => setPreviewModalImg(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img
              src={previewModalImg}
              alt="Screenshot Preview"
              style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)' }}
            />
            <button
              onClick={() => setPreviewModalImg(null)}
              style={{
                position: 'absolute', top: -14, right: -14,
                width: 32, height: 32, borderRadius: '50%',
                background: '#FFFFFF', color: '#000000', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontWeight: 800
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
