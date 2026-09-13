import React, { useState, useEffect, useMemo } from 'react';
import {
  Zap, Calendar, Clock, Share2, Check, Copy, ExternalLink,
  Gift, Wifi, DollarSign, Award, ArrowRight, Shield, CheckCircle2,
  Users, Filter, MessageSquare, AlertCircle, ChevronRight, ChevronDown, Phone,
  FileCheck, Radio, Lock, X
} from 'lucide-react';
import {
  SquadTask,
  SquadDivision,
  TaskFrequency,
  BountyType,
  getAllSquadTasks,
  SQUAD_INFO,
  generateWhatsAppBroadcast,
  openWhatsAppShare
} from '../lib/squadTasks';
import {
  getCurrentContributor,
  ContributorProfile
} from '../lib/contributorAuth';
import {
  RF_DEEP_GREEN,
  RF_DARK_GREEN,
  RF_FOREST_DARK,
  RF_LEAF_GREEN,
  RF_MINT_ACCENT,
  RF_GOLD_YELLOW
} from '../constants/brand';

interface SquadTasksPageProps {
  onNavigate: (path: string) => void;
  onOpenStatus: () => void;
}

export const SquadTasksPage: React.FC<SquadTasksPageProps> = ({ onNavigate, onOpenStatus }) => {
  const [contributor, setContributor] = useState<ContributorProfile | null>(getCurrentContributor());
  const [tasks, setTasks] = useState<SquadTask[]>([]);
  const [selectedSquad, setSelectedSquad] = useState<SquadDivision | 'ALL'>('ALL');
  const [selectedFrequency, setSelectedFrequency] = useState<TaskFrequency | 'ALL'>('ALL');
  const [copiedTaskId, setCopiedTaskId] = useState<string | null>(null);
  const [bountyGuideOpen, setBountyGuideOpen] = useState(false);

  useEffect(() => {
    setTasks(getAllSquadTasks());

    const syncUser = () => {
      const u = getCurrentContributor();
      setContributor(u);
    };

    // Check URL parameters for squad filter (e.g. ?squad=TECHNOLOGY)
    const params = new URLSearchParams(window.location.search);
    const squadParam = params.get('squad')?.toUpperCase() as SquadDivision;
    if (squadParam && SQUAD_INFO[squadParam]) {
      setSelectedSquad(squadParam);
    } else if (contributor?.division && SQUAD_INFO[contributor.division as SquadDivision]) {
      setSelectedSquad(contributor.division as SquadDivision);
    }

    window.addEventListener('refeir-auth-change', syncUser);
    return () => window.removeEventListener('refeir-auth-change', syncUser);
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (t.status !== 'ACTIVE') return false;
      const matchesSquad = selectedSquad === 'ALL' || t.squad === selectedSquad || t.squad === 'GENERAL';
      const matchesFreq = selectedFrequency === 'ALL' || t.frequency === selectedFrequency;
      return matchesSquad && matchesFreq;
    });
  }, [tasks, selectedSquad, selectedFrequency]);

  const activeBountiesCount = useMemo(() => {
    return tasks.filter(t => t.status === 'ACTIVE' && t.bounty_type !== 'NONE').length;
  }, [tasks]);

  const handleCopyAnnouncement = (task: SquadTask) => {
    const text = generateWhatsAppBroadcast(task);
    navigator.clipboard.writeText(text);
    setCopiedTaskId(task.id);
    setTimeout(() => setCopiedTaskId(null), 3000);
  };

  const getBountyIcon = (type: BountyType) => {
    switch (type) {
      case 'AIRTIME':
        return <Gift size={15} style={{ color: '#F59E0B' }} />;
      case 'DATA':
        return <Wifi size={15} style={{ color: '#3B82F6' }} />;
      case 'CASH':
        return <DollarSign size={15} style={{ color: '#10B981' }} />;
      case 'XP_CREDIT':
        return <Award size={15} style={{ color: RF_GOLD_YELLOW }} />;
      default:
        return <Zap size={15} style={{ color: RF_MINT_ACCENT }} />;
    }
  };

  const getBountyTheme = (type: BountyType) => {
    switch (type) {
      case 'AIRTIME':
        return {
          bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.08) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          text: '#FCD34D'
        };
      case 'DATA':
        return {
          bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.08) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          text: '#93C5FD'
        };
      case 'CASH':
        return {
          bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(5, 150, 105, 0.08) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.45)',
          text: '#6EE7B7'
        };
      default:
        return {
          bg: 'linear-gradient(135deg, rgba(24, 252, 92, 0.12) 0%, rgba(15, 46, 30, 0.5) 100%)',
          border: '1px solid rgba(24, 252, 92, 0.3)',
          text: RF_MINT_ACCENT
        };
    }
  };

  // ─── GATE: UN-AUTHENTICATED USERS CANNOT ACCESS TASKS & BOUNTIES ───────────
  if (!contributor) {
    return (
      <div style={{ background: RF_DEEP_GREEN, minHeight: '100vh', color: '#FFFFFF', paddingTop: 90, paddingBottom: 100 }}>
        <div style={{ maxWidth: 840, margin: '0 auto', padding: '0 24px' }}>
          <div style={{
            background: 'linear-gradient(180deg, rgba(15, 46, 30, 0.85) 0%, rgba(7, 24, 15, 0.98) 100%)',
            border: '1px solid rgba(102, 187, 42, 0.3)',
            borderRadius: 28,
            padding: '52px 36px',
            textAlign: 'center',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6)'
          }}>
            {/* Lock Emblem */}
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'rgba(24, 252, 92, 0.08)',
              border: '1px solid rgba(24, 252, 92, 0.28)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              color: RF_MINT_ACCENT,
              boxShadow: '0 0 30px rgba(24, 252, 92, 0.15)'
            }}>
              <Lock size={32} />
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 999,
              background: 'rgba(245, 158, 11, 0.14)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              color: '#FCD34D',
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 20
            }}>
              <Shield size={13} />
              Restricted Contributor Channel • Sign In Required
            </div>

            <h1 style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: 'clamp(30px, 5vw, 44px)',
              fontWeight: 800,
              margin: '0 0 16px',
              color: '#FFFFFF',
              lineHeight: 1.2
            }}>
              Sign In to Access Daily Tasks &amp; Bounties
            </h1>

            <p style={{
              fontSize: 16,
              color: 'rgba(255, 255, 255, 0.72)',
              maxWidth: 620,
              margin: '0 auto 36px',
              lineHeight: 1.65
            }}>
              Daily squad directives, real-time mission briefs, and incentive bounties (Airtime giveaways, Data recharge, and Cash bonuses) are exclusively reserved for accepted Refeir Pioneers and signed-in contributors.
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
              <button
                onClick={() => onNavigate('/login')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 30px',
                  borderRadius: 14,
                  background: RF_MINT_ACCENT,
                  color: RF_FOREST_DARK,
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 14.5,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 18px rgba(24, 252, 92, 0.3)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(24, 252, 92, 0.45)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 18px rgba(24, 252, 92, 0.3)';
                }}
              >
                Sign In to Your Account
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => onNavigate('/signup')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 26px',
                  borderRadius: 14,
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  fontWeight: 600,
                  fontSize: 14.5,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(24, 252, 92, 0.4)';
                  e.currentTarget.style.color = RF_MINT_ACCENT;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
              >
                Activate Accepted Account
              </button>
            </div>

            {/* Gated Features Teaser Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
              textAlign: 'left',
              paddingTop: 32,
              borderTop: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '18px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.45)', fontSize: 12, marginBottom: 6 }}>
                  <Lock size={12} />
                  <span>Squad Directives</span>
                </div>
                <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                  Daily missions and sprint briefs across 6 squads
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '18px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.45)', fontSize: 12, marginBottom: 6 }}>
                  <Lock size={12} />
                  <span>Bounty Incentives</span>
                </div>
                <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                  Airtime, Data, and Cash prizes for daily tasks
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '18px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.45)', fontSize: 12, marginBottom: 6 }}>
                  <Lock size={12} />
                  <span>Advancement Rubric</span>
                </div>
                <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                  Submit verified proof of work to level up tiers
                </div>
              </div>
            </div>

            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 32, marginBottom: 0 }}>
              Applied already?{' '}
              <button
                onClick={onOpenStatus}
                style={{
                  background: 'none',
                  border: 'none',
                  color: RF_MINT_ACCENT,
                  cursor: 'pointer',
                  fontWeight: 600,
                  padding: 0,
                  textDecoration: 'underline'
                }}
              >
                Check Pioneer Application Status
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── GATE: SUSPENDED USERS CANNOT ACCESS TASKS ────────────────────────────
  if (contributor.is_suspended) {
    return (
      <div style={{ background: RF_DEEP_GREEN, minHeight: '100vh', color: '#FFFFFF', paddingTop: 90, paddingBottom: 100 }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px' }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 24,
            padding: '48px 32px',
            textAlign: 'center'
          }}>
            <AlertCircle size={44} style={{ color: '#EF4444', margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 12px', color: '#F87171' }}>
              Contributor Privileges Suspended
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, maxWidth: 520, margin: '0 auto 24px' }}>
              Your account ({contributor.email}) has been temporarily suspended by Refeir Administration.
              {contributor.suspension_reason ? ` Reason: ${contributor.suspension_reason}.` : ''}
              Access to daily squad tasks and bounty claims is deactivated.
            </p>
            <button
              onClick={() => onNavigate('/contact')}
              style={{
                padding: '12px 24px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#FFFFFF',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Contact Admissions Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: RF_DEEP_GREEN, minHeight: '100vh', color: '#FFFFFF', paddingTop: 90, paddingBottom: 100 }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>

        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 18px', borderRadius: 100,
            background: 'rgba(24, 252, 92, 0.1)', border: '1px solid rgba(24, 252, 92, 0.28)',
            color: RF_MINT_ACCENT, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', marginBottom: 18
          }}>
            <Shield size={13} />
            Authenticated Contributor • {contributor.full_name} ({contributor.division || 'GROWTH'} Squad)
          </div>

          <h1 style={{
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: 'clamp(32px, 5.5vw, 52px)',
            fontWeight: 800,
            lineHeight: 1.15,
            margin: '0 0 16px',
            color: '#FFFFFF'
          }}>
            Daily Squad Missions &amp; Bounties
          </h1>

          <p style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.72)',
            maxWidth: 720,
            margin: '0 auto 28px',
            lineHeight: 1.6
          }}>
            Check your squad’s daily and weekly deliverables, announced directly by squad leads and Tonye Taylor. Complete proof-of-work objectives to claim special bounties including <strong>Airtime giveaways</strong>, <strong>Data subscriptions</strong>, and <strong>Cash prizes</strong>.
          </p>

          {/* Quick Metrics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 14,
            maxWidth: 860,
            margin: '0 auto 36px'
          }}>
            <div style={{
              background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: '16px 20px', textAlign: 'center'
            }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Active Missions
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: RF_MINT_ACCENT, marginTop: 4 }}>
                {filteredTasks.length} Live
              </div>
            </div>

            <div style={{
              background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: '16px 20px', textAlign: 'center'
            }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Active Bonus Bounties
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: RF_GOLD_YELLOW, marginTop: 4 }}>
                {activeBountiesCount} Rewarded
              </div>
            </div>

            <div style={{
              background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: '16px 20px', textAlign: 'center'
            }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Squad Divisions
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#60A5FA', marginTop: 4 }}>
                6 Active
              </div>
            </div>

            <div style={{
              background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: '16px 20px', textAlign: 'center'
            }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Bounty Review
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#34D399', marginTop: 4 }}>
                &lt; 24h Payout
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div style={{
          background: 'rgba(15, 46, 30, 0.85)',
          border: '1px solid rgba(102, 187, 42, 0.25)',
          borderRadius: 20,
          padding: '18px 22px',
          marginBottom: 32,
          boxShadow: '0 15px 40px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          {/* Squad Selectors - Desktop: Pills, Mobile: Styled Selection Box */}
          <div>
            {/* Desktop View */}
            <div className="rp-squad-filter-desktop" style={{ alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Filter size={14} /> Filter Squad:
              </span>

              <button
                onClick={() => setSelectedSquad('ALL')}
                style={{
                  background: selectedSquad === 'ALL' ? RF_LEAF_GREEN : 'rgba(255,255,255,0.06)',
                  color: selectedSquad === 'ALL' ? RF_DEEP_GREEN : '#FFFFFF',
                  border: 'none', padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                All Squads ({tasks.length})
              </button>

              {(Object.keys(SQUAD_INFO) as SquadDivision[]).map(squadKey => {
                const info = SQUAD_INFO[squadKey];
                const isSelected = selectedSquad === squadKey;
                const count = tasks.filter(t => t.squad === squadKey && t.status === 'ACTIVE').length;

                return (
                  <button
                    key={squadKey}
                    onClick={() => setSelectedSquad(squadKey)}
                    style={{
                      background: isSelected ? info.color : 'rgba(255,255,255,0.06)',
                      color: isSelected ? '#000000' : 'rgba(255,255,255,0.85)',
                      border: `1px solid ${isSelected ? info.color : 'rgba(255,255,255,0.12)'}`,
                      padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: 6
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: isSelected ? '#000000' : info.color }} />
                    {info.tag} {count > 0 ? `(${count})` : ''}
                  </button>
                );
              })}
            </div>

            {/* Mobile View: Clean Custom Selection Box */}
            <div className="rp-squad-filter-mobile" style={{ flexDirection: 'column', gap: 8, width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label
                  htmlFor="rp-mobile-squad-select"
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.7)',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    letterSpacing: '0.04em'
                  }}
                >
                  <Filter size={13} color={RF_MINT_ACCENT} /> Filter by Squad:
                </label>
                <span style={{ fontSize: 11.5, color: RF_MINT_ACCENT, fontWeight: 600 }}>
                  {selectedSquad === 'ALL' ? `${tasks.length} total tasks` : SQUAD_INFO[selectedSquad as SquadDivision]?.name}
                </span>
              </div>

              <div style={{ position: 'relative', width: '100%' }}>
                <select
                  id="rp-mobile-squad-select"
                  value={selectedSquad}
                  onChange={e => setSelectedSquad(e.target.value as SquadDivision | 'ALL')}
                  style={{
                    width: '100%',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    background: 'rgba(6, 20, 13, 0.95)',
                    border: `1px solid ${selectedSquad === 'ALL' ? 'rgba(102, 187, 42, 0.35)' : SQUAD_INFO[selectedSquad as SquadDivision]?.color || RF_LEAF_GREEN}`,
                    borderRadius: 12,
                    padding: '12px 38px 12px 14px',
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="ALL" style={{ background: '#07180F', color: '#FFFFFF' }}>
                    All Squads ({tasks.length} Active Missions)
                  </option>
                  {(Object.keys(SQUAD_INFO) as SquadDivision[]).map(squadKey => {
                    const info = SQUAD_INFO[squadKey];
                    const count = tasks.filter(t => t.squad === squadKey && t.status === 'ACTIVE').length;
                    return (
                      <option
                        key={squadKey}
                        value={squadKey}
                        style={{ background: '#07180F', color: '#FFFFFF' }}
                      >
                        {info.name} ({info.tag}) — {count} {count === 1 ? 'mission' : 'missions'}
                      </option>
                    );
                  })}
                </select>

                <div style={{
                  position: 'absolute',
                  right: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <ChevronDown size={17} color={RF_MINT_ACCENT} />
                </div>
              </div>
            </div>
          </div>

          {/* Timeframe Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={14} /> Mission Cycle:
            </span>

            {[
              { id: 'ALL', label: 'All Cycles' },
              { id: 'DAILY', label: 'Daily Missions' },
              { id: 'WEEKLY', label: 'Weekly Sprints' },
              { id: 'FLASH_BOUNTY', label: 'Flash Bounties' }
            ].map(cycle => (
              <button
                key={cycle.id}
                onClick={() => setSelectedFrequency(cycle.id as any)}
                style={{
                  background: selectedFrequency === cycle.id ? 'rgba(24, 252, 92, 0.15)' : 'none',
                  color: selectedFrequency === cycle.id ? RF_MINT_ACCENT : 'rgba(255,255,255,0.6)',
                  border: `1px solid ${selectedFrequency === cycle.id ? RF_MINT_ACCENT : 'transparent'}`,
                  padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {cycle.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tasks Grid */}
        {filteredTasks.length === 0 ? (
          <div style={{
            background: 'rgba(0,0,0,0.3)', border: '1px dashed rgba(255,255,255,0.15)',
            borderRadius: 20, padding: '60px 24px', textAlign: 'center'
          }}>
            <Zap size={36} style={{ color: RF_MINT_ACCENT, margin: '0 auto 12px', opacity: 0.6 }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', margin: '0 0 8px' }}>
              No Active Missions Found For Selected Filter
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', maxWidth: 460, margin: '0 auto 20px' }}>
              Select "All Squads" to view other live objectives or check back later today when the next squad briefing is published.
            </p>
            <button
              onClick={() => { setSelectedSquad('ALL'); setSelectedFrequency('ALL'); }}
              style={{
                background: RF_LEAF_GREEN, color: RF_DEEP_GREEN, border: 'none',
                padding: '10px 22px', borderRadius: 100, fontSize: 13, fontWeight: 700, cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="rp-tasks-grid">
            {filteredTasks.map(task => {
              const squadMeta = SQUAD_INFO[task.squad] || SQUAD_INFO.GENERAL;
              const bountyTheme = getBountyTheme(task.bounty_type);
              const isCopied = copiedTaskId === task.id;

              return (
                <div
                  key={task.id}
                  id={task.id}
                  style={{
                    background: `linear-gradient(145deg, rgba(15, 46, 30, 0.8) 0%, rgba(6, 23, 14, 0.9) 100%)`,
                    border: '1px solid rgba(102, 187, 42, 0.25)',
                    borderRadius: 20,
                    padding: '26px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 12px 35px rgba(0,0,0,0.5)',
                    position: 'relative',
                    transition: 'all 0.2s'
                  }}
                >
                  <div>
                    {/* Top Badges Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 800,
                        background: `${squadMeta.color}22`,
                        color: squadMeta.color,
                        border: `1px solid ${squadMeta.color}55`,
                        padding: '3px 10px', borderRadius: 100,
                        textTransform: 'uppercase', letterSpacing: '0.04em'
                      }}>
                        {squadMeta.name}
                      </span>

                      <span style={{
                        fontSize: 11, fontWeight: 700,
                        background: 'rgba(255,255,255,0.06)',
                        color: 'rgba(255,255,255,0.75)',
                        padding: '3px 9px', borderRadius: 6,
                        display: 'inline-flex', alignItems: 'center', gap: 4
                      }}>
                        <Clock size={11} />
                        {task.frequency.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Special Bounty Callout Box (if applicable) */}
                    {task.bounty_type !== 'NONE' && (
                      <div style={{
                        background: bountyTheme.bg,
                        border: bountyTheme.border,
                        borderRadius: 12,
                        padding: '10px 14px',
                        marginBottom: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 7
                      }}>
                        {/* Bounty Reward Row */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <div style={{
                            width: 16,
                            height: 16,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: 1
                          }}>
                            {getBountyIcon(task.bounty_type)}
                          </div>
                          <span style={{
                            fontSize: 13,
                            fontWeight: 800,
                            color: bountyTheme.text,
                            letterSpacing: '-0.01em',
                            lineHeight: 1.35
                          }}>
                            {task.bounty_reward}
                          </span>
                        </div>

                        {/* Bounty Slots / Availability Row (Always perfectly aligned with the reward row) */}
                        {task.bounty_slots && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              width: 16,
                              height: 16,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <Users size={13} style={{ color: bountyTheme.text, opacity: 0.85 }} />
                            </div>
                            <span style={{
                              fontSize: 11,
                              fontWeight: 700,
                              background: 'rgba(0,0,0,0.3)',
                              color: '#FFFFFF',
                              border: '1px solid rgba(255,255,255,0.1)',
                              padding: '2px 9px',
                              borderRadius: 100,
                              display: 'inline-flex',
                              alignItems: 'center',
                              lineHeight: 1.3
                            }}>
                              {task.bounty_slots}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Task Title */}
                    <h3 style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: '#FFFFFF',
                      margin: '0 0 8px',
                      lineHeight: 1.4,
                      fontFamily: 'Plus Jakarta Sans, sans-serif'
                    }}>
                      {task.title}
                    </h3>

                    {/* Category & ID */}
                    <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.45)', marginBottom: 12 }}>
                      Category: <strong style={{ color: RF_MINT_ACCENT }}>{task.category}</strong> • ID: <code>{task.id}</code>
                    </div>

                    {/* Objective Description */}
                    <p style={{
                      fontSize: 13.5,
                      color: 'rgba(255,255,255,0.78)',
                      lineHeight: 1.6,
                      margin: '0 0 16px'
                    }}>
                      {task.description}
                    </p>

                    {/* Requirements Checklist */}
                    <div style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 12,
                      padding: '12px 14px',
                      marginBottom: 16
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                        Required Deliverables:
                      </div>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: 'rgba(255,255,255,0.85)', lineHeight: 1.55 }}>
                        {task.requirements.map((req, i) => (
                          <li key={i} style={{ marginBottom: 4 }}>{req}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Submission Format */}
                    <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FileCheck size={13} style={{ color: RF_MINT_ACCENT }} />
                      <span><strong>Proof Format:</strong> {task.submission_format}</span>
                    </div>
                  </div>

                  <div>
                    {/* Deadline and Signatory */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.45)',
                      paddingTop: 12,
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                      marginBottom: 16
                    }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={11} /> Deadline: {new Date(task.deadline).toLocaleDateString()}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Shield size={11} /> By: {task.announced_by.split('(')[0]}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <button
                        onClick={() => onNavigate(`/submit-task?category=${encodeURIComponent(task.category)}&taskId=${task.id}`)}
                        style={{
                          width: '100%',
                          background: RF_LEAF_GREEN,
                          color: RF_DEEP_GREEN,
                          border: 'none',
                          padding: '11px',
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          boxShadow: `0 4px 14px ${RF_LEAF_GREEN}33`,
                          transition: 'all 0.18s'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = RF_MINT_ACCENT)}
                        onMouseLeave={e => (e.currentTarget.style.background = RF_LEAF_GREEN)}
                      >
                        <CheckCircle2 size={15} /> Submit Task Proof
                      </button>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => openWhatsAppShare(task)}
                          style={{
                            flex: 1,
                            background: '#25D366',
                            color: '#021B0A',
                            border: 'none',
                            padding: '8px 10px',
                            borderRadius: 8,
                            fontSize: 11.5,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 5
                          }}
                          title="Share mission with peers on WhatsApp"
                        >
                          <Share2 size={13} /> Share Mission
                        </button>

                        <button
                          onClick={() => handleCopyAnnouncement(task)}
                          style={{
                            flex: 1,
                            background: 'rgba(255,255,255,0.08)',
                            color: '#FFFFFF',
                            border: '1px solid rgba(255,255,255,0.15)',
                            padding: '8px 10px',
                            borderRadius: 8,
                            fontSize: 11.5,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 5
                          }}
                          title="Copy task brief"
                        >
                          {isCopied ? <Check size={13} color={RF_MINT_ACCENT} /> : <Copy size={13} />}
                          {isCopied ? 'Copied!' : 'Copy Brief'}
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Pioneer Bounty & Deliverable Settlement Banner */}
        <div style={{
          marginTop: 60,
          background: 'linear-gradient(135deg, rgba(24, 252, 92, 0.08) 0%, rgba(15, 46, 30, 0.65) 100%)',
          border: '1px solid rgba(24, 252, 92, 0.25)',
          borderRadius: 24,
          padding: '36px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 24,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)'
        }}>
          <div style={{ maxWidth: 640 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: RF_MINT_ACCENT, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>
              <Award size={14} /> Official Pioneer Bounty Protocol
            </div>
            <h3 style={{
              fontSize: 24, fontWeight: 800, color: '#FFFFFF', margin: '0 0 10px',
              fontFamily: 'Plus Jakarta Sans, sans-serif'
            }}>
              Execute Deliverables, Claim Bounties &amp; Accelerate Your Certificate
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, margin: 0 }}>
              Every squad mission carries tangible compensation and verified proof-of-work credits. Submit your deliverables to receive fast-track airtime, data vouchers, or direct bank cash payouts within 24 hours while advancing towards your Level 3 Founding Pioneer Certificate.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => setBountyGuideOpen(true)}
              style={{
                background: RF_LEAF_GREEN, color: RF_DEEP_GREEN,
                border: 'none', padding: '12px 22px', borderRadius: 100, fontSize: 13,
                fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7,
                boxShadow: `0 4px 14px ${RF_LEAF_GREEN}33`,
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = RF_MINT_ACCENT)}
              onMouseLeave={e => (e.currentTarget.style.background = RF_LEAF_GREEN)}
            >
              <Award size={14} /> Bounty Claim Guide &amp; Rules <ArrowRight size={14} />
            </button>
            <button
              onClick={() => onNavigate('/submit-task')}
              style={{
                background: 'rgba(255,255,255,0.08)', color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.2)', padding: '12px 22px',
                borderRadius: 100, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6,
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            >
              <FileCheck size={14} /> Submit Proof of Work
            </button>
            <button
              onClick={() => onNavigate('/rewards')}
              style={{
                background: 'transparent', color: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.12)', padding: '12px 18px',
                borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6,
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
              }}
            >
              <ChevronRight size={14} /> Contributor Ladder
            </button>
          </div>
        </div>

        {/* Pioneer Bounty Claim Guide & Verification Rules Modal */}
        {bountyGuideOpen && (
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: 'rgba(5, 18, 11, 0.82)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 16
            }}
            onClick={() => setBountyGuideOpen(false)}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: '#0B2216',
                border: '1px solid rgba(24, 252, 92, 0.22)',
                borderRadius: 20,
                width: '100%',
                maxWidth: 620,
                maxHeight: '88vh',
                overflowY: 'auto',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75)',
                padding: '26px 28px',
                color: '#FFFFFF'
              }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    color: RF_MINT_ACCENT, fontSize: 11, fontWeight: 800,
                    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6
                  }}>
                    <Award size={13} /> BOUNTY CLAIM GUIDE
                  </div>
                  <h3 style={{ fontSize: 21, fontWeight: 800, margin: 0, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    Pioneer Bounty Claim Guide &amp; Verification Rules
                  </h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', margin: '4px 0 0', lineHeight: 1.5 }}>
                    How deliverables are verified, bounties are disbursed, and contributions level up your certificate.
                  </p>
                </div>
                <button
                  onClick={() => setBountyGuideOpen(false)}
                  style={{
                    background: 'rgba(255,255,255,0.06)', border: 'none',
                    color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
                    width: 32, height: 32, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    marginLeft: 12,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                >
                  <X size={17} />
                </button>
              </div>

              {/* 1. Bounty Payout Categories (Aligned List) */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                borderRadius: 14,
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                marginBottom: 20
              }}>
                {/* Airtime & Data */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 2
                  }}>
                    <Gift size={16} color="#F59E0B" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>Airtime &amp; Data Vouchers</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#FCD34D', background: 'rgba(245, 158, 11, 0.12)', padding: '2px 8px', borderRadius: 100 }}>
                        2–4 Hours Payout
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', margin: '3px 0 0', lineHeight: 1.45 }}>
                      Telecom recharge sent directly to the registered phone number on your profile (MTN, Airtel, Glo, 9mobile).
                    </p>
                  </div>
                </div>

                <div style={{ height: 1, background: 'rgba(255, 255, 255, 0.05)' }} />

                {/* Cash Bounties */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 2
                  }}>
                    <DollarSign size={16} color="#10B981" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>Direct Cash Bounties</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#34D399', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: 100 }}>
                        &lt; 24 Hours Transfer
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', margin: '3px 0 0', lineHeight: 1.45 }}>
                      Wired directly to your verified bank account or fintech wallet upon squad lead and admissions review.
                    </p>
                  </div>
                </div>

                <div style={{ height: 1, background: 'rgba(255, 255, 255, 0.05)' }} />

                {/* Certificate XP */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: 'rgba(24, 252, 92, 0.12)',
                    border: '1px solid rgba(24, 252, 92, 0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 2
                  }}>
                    <Award size={16} color={RF_MINT_ACCENT} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>Certificate XP &amp; Deliverable Credits</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: RF_MINT_ACCENT, background: 'rgba(24, 252, 92, 0.12)', padding: '2px 8px', borderRadius: 100 }}>
                        Instant Credit
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', margin: '3px 0 0', lineHeight: 1.45 }}>
                      Every approved mission logs verified proof of work toward your Level 2 (Practitioner) and Level 3 (Lead) certificate.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. 3-Step Process */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                  Execution &amp; Claim Steps:
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: 10
                }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: RF_LEAF_GREEN, color: RF_DEEP_GREEN, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        1
                      </div>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: '#FFFFFF' }}>Pick a Mission</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>
                      Review exact specifications and required submission formats on the card.
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: RF_LEAF_GREEN, color: RF_DEEP_GREEN, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        2
                      </div>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: '#FFFFFF' }}>Submit Proof</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>
                      Click <strong>Submit Task Proof</strong> and enter your public links or screenshots.
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: RF_LEAF_GREEN, color: RF_DEEP_GREEN, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        3
                      </div>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: '#FFFFFF' }}>Get Settled</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>
                      Submissions are verified daily, triggering direct payouts and certificate XP.
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Slot Rule Tip Box */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                background: 'rgba(24, 252, 92, 0.04)',
                borderRadius: 10,
                border: '1px solid rgba(24, 252, 92, 0.16)',
                marginBottom: 20
              }}>
                <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Shield size={16} color={RF_MINT_ACCENT} />
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.45 }}>
                  <strong style={{ color: '#FFFFFF' }}>Slots &amp; Integrity:</strong> Tasks with limited slots (e.g. <em>First 4 Campuses</em>) are awarded by submission timestamp. Only original, verifiable work qualifies.
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <button
                  onClick={() => {
                    setBountyGuideOpen(false);
                    onNavigate('/submit-task');
                  }}
                  style={{
                    background: RF_LEAF_GREEN,
                    color: RF_DEEP_GREEN,
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: 100,
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: `0 4px 14px ${RF_LEAF_GREEN}40`,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = RF_MINT_ACCENT)}
                  onMouseLeave={e => (e.currentTarget.style.background = RF_LEAF_GREEN)}
                >
                  <FileCheck size={14} /> Submit Deliverable Now <ArrowRight size={14} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => {
                      setBountyGuideOpen(false);
                      onNavigate('/rewards');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '6px 10px'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                  >
                    Rewards Ladder
                  </button>
                  <button
                    onClick={() => setBountyGuideOpen(false)}
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#FFFFFF',
                      borderRadius: 100,
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '7px 16px',
                      transition: 'all 0.2s'
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
