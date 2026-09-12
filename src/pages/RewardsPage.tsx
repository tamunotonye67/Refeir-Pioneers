import React, { useState } from 'react';
import {
  Shield, Award, Users, CheckCircle2, ArrowRight, Zap, Target,
  Star, TrendingUp, Layers, Code2, Palette, MessageSquare, Briefcase,
  FileCheck
} from 'lucide-react';
import {
  RF_DEEP_GREEN,
  RF_DARK_GREEN,
  RF_FOREST_DARK,
  RF_LEAF_GREEN,
  RF_MINT_ACCENT,
  RF_GOLD_YELLOW
} from '../constants/brand';

interface RewardsPageProps {
  onNavigate: (path: string) => void;
  onOpenStatus: () => void;
}

export interface ContributorLevel {
  level: number;
  title: string;
  tagline: string;
  subtitle: string;
  color: string;
  accent: string;
  criteria: string;
  eligibility: string[];
  contributions: string[];
  rewards: string[];
  governance: string;
}

export const CONTRIBUTOR_LEVELS: ContributorLevel[] = [
  {
    level: 1,
    title: 'Refeir Member',
    tagline: 'Interested in the Mission',
    subtitle: 'Entry Point & Community Onboarding',
    color: '#94A3B8',
    accent: 'rgba(148, 163, 184, 0.2)',
    criteria: 'Application approved by Admissions Committee & signed Community Code of Conduct.',
    eligibility: [
      'Submitted pioneer application with verified identity & contact info',
      'Passionate about the African freelance and referral economy',
      'Completed community orientation walkthrough'
    ],
    contributions: [
      'Join weekly community discussions on WhatsApp / Discord',
      'Attend bi-weekly platform town halls',
      'Share early feedback on product releases and announcements'
    ],
    rewards: [
      'Access to Refeir Pioneer Community channels',
      'Official Level 1 Pioneer Associate Certificate of Orientation',
      'Monthly insider product roadmap briefings',
      'Alpha testing access for early prototype builds',
      'Standard referral link for platform mainnet launch'
    ],
    governance: 'Community observer'
  },
  {
    level: 2,
    title: 'Refeir Pioneer',
    tagline: 'Has Made Meaningful Contributions',
    subtitle: 'Active Contributor & Squad Member',
    color: RF_LEAF_GREEN,
    accent: 'rgba(102, 187, 42, 0.2)',
    criteria: 'Completed and verified at least 15 tangible sprint deliverables evaluated and approved by a Squad Lead (5x verified proof-of-work quota).',
    eligibility: [
      'Achieved Level 1 standing with verified profile',
      'Assigned to a specific functional squad (Tech, Design, Growth, Ops, etc.)',
      'Delivered at least 15 verified proof-of-work jobs approved by reviewers'
    ],
    contributions: [
      'Technical: Bug fix, documentation update, or test suite run',
      'Design: UX critique, iconography asset, or component mock',
      'Growth: Validated employer or freelancer referral into beta',
      'Operations: Regional ecosystem map or translation of key materials'
    ],
    rewards: [
      'Official Level 2 Refeir Pioneer Certificate of Completion & Verified Digital Credential',
      'Official Refeir Pioneer Badge & Verifiable Accreditations',
      'Priority access to division squad sprints and private sessions',
      'Early access to client pilot work packages',
      'Featured listing in Pioneer Cohort Directory'
    ],
    governance: 'Squad voting participant'
  },
  {
    level: 3,
    title: 'Refeir Builder',
    tagline: 'Consistently Delivers',
    subtitle: 'Proven Track Record of Impact',
    color: RF_MINT_ACCENT,
    accent: 'rgba(24, 252, 92, 0.2)',
    criteria: 'Completed and verified at least 40 delivered sprint missions with sustained high quality and peer endorsements (5x verified proof-of-work quota).',
    eligibility: [
      'Maintained active Level 2 standing for minimum 4 weeks',
      'Delivered at least 40 verified proof-of-work jobs approved by squad leads',
      'Received 2+ peer endorsements from other Pioneer Builders or Leads'
    ],
    contributions: [
      'Building core features or integrations for web & mobile clients',
      'Designing end-to-end user flows or design system components',
      'Executing growth campaigns that onboard 50+ verified freelancers',
      'Writing comprehensive case studies, tutorials, and technical docs'
    ],
    rewards: [
      'Official Level 3 Refeir Builder Certificate of Level Completion',
      'Tier-2 Referral Commission Multiplier (+15% higher earnings)',
      'Access to Pioneer Contributor Bounty Reward Pools',
      'Public builder spotlight on Refeir official blog and social channels',
      'Specialized "Refeir Builder" NFT / Verifiable Credential'
    ],
    governance: 'Working group voting weight'
  },
  {
    level: 4,
    title: 'Refeir Lead',
    tagline: 'Leads a Functional Team',
    subtitle: 'Squad Leader & Community Anchor',
    color: RF_GOLD_YELLOW,
    accent: 'rgba(255, 209, 102, 0.2)',
    criteria: 'Completed and verified at least 75 delivered missions + appointed to lead a functional division squad or regional chapter (5x verified proof-of-work quota).',
    eligibility: [
      'Delivered at least 75 verified proof-of-work jobs with exceptional domain leadership',
      'Demonstrated mentorship, emotional intelligence, and team coordination',
      'Direct recommendation from Refeir Founders or Core Team'
    ],
    contributions: [
      'Lead weekly squad syncs and allocate mission backlog items',
      'Review and quality-check deliverables submitted by Level 1 & 2 contributors',
      'Run regional university, tech hub, or community developer workshops',
      'Coordinate cross-squad platform stress tests before public releases'
    ],
    rewards: [
      'Official Level 4 Refeir Lead Leadership Accreditation Certificate',
      'Tier-3 Referral Commission Multiplier (+30% bonus payout)',
      'Monthly squad leadership stipend & milestone bounties',
      'Direct weekly executive sessions with Founder Tonye Taylor',
      'Priority review for full-time / contract openings on the Core Team'
    ],
    governance: 'Squad leadership voting seat'
  },
  {
    level: 5,
    title: 'Refeir Core Team',
    tagline: 'Strategic Execution & Platform Ownership',
    subtitle: 'Sovereign Protocol Stewards',
    color: '#38BDF8',
    accent: 'rgba(56, 189, 248, 0.2)',
    criteria: 'Completed and verified at least 125 delivered strategic missions + unanimous approval by Refeir founders & leadership (5x verified proof-of-work quota).',
    eligibility: [
      'Delivered at least 125 verified high-impact mission tasks across platform architecture or operations',
      'Vetted and unanimously approved by Refeir founders & leadership',
      'Committing substantial weekly hours or full-time focus to Refeir'
    ],
    contributions: [
      'Platform architecture, sovereign smart contract rails, and multi-currency treasury',
      'Enterprise partnerships with major African fintechs and employers',
      'Strategic growth roadmap spanning Nigeria, Kenya, Ghana, Rwanda, and diaspora',
      'Legal, compliance, and multi-country operational expansion'
    ],
    rewards: [
      'Official Level 5 Sovereign Protocol Steward Master Certificate of Completion',
      'Allocation in Refeir Contributor Equity / Ecosystem Token Pool',
      'Full-time salaried or retainer contracts with Refeir Protocol',
      'Permanent Core Contributor Seat on Protocol Governance Council',
      'Direct equity vesting and executive profit-sharing participation'
    ],
    governance: 'Permanent strategic council member'
  }
];

export const RewardsPage: React.FC<RewardsPageProps> = ({ onNavigate, onOpenStatus }) => {
  const [activeLevel, setActiveLevel] = useState<number>(2); // Default highlight on Pioneer

  const selectedTier = CONTRIBUTOR_LEVELS.find(l => l.level === activeLevel) || CONTRIBUTOR_LEVELS[1];

  return (
    <div style={{ minHeight: '100vh', background: '#05120B', color: '#FFFFFF', paddingTop: 72 }}>
      {/* Hero Header */}
      <section style={{
        background: `linear-gradient(180deg, #07180F 0%, #0B2417 50%, #05120B 100%)`,
        padding: '90px 24px 70px', position: 'relative', overflow: 'hidden', textAlign: 'center',
        borderBottom: '1px solid rgba(102, 187, 42, 0.2)'
      }}>
        {/* Ambient glow */}
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: '80%', height: 350,
          background: 'radial-gradient(ellipse at center, rgba(24, 252, 92, 0.12) 0%, transparent 70%)',
          filter: 'blur(70px)', pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 100,
            background: 'rgba(102, 187, 42, 0.12)', border: '1px solid rgba(102, 187, 42, 0.3)',
            color: RF_MINT_ACCENT, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', marginBottom: 20
          }}>
            <Award size={13} />
            Formal Contributor Reward Scheme
          </div>

          <h1 style={{
            fontSize: 'clamp(34px, 5.2vw, 64px)', fontWeight: 500, lineHeight: 1.15,
            letterSpacing: '-0.02em', marginBottom: 24, fontFamily: 'Plus Jakarta Sans, sans-serif'
          }}>
            Earn recognition and rewards<br />
            <span style={{
              fontStyle: 'italic', fontWeight: 400,
              background: `linear-gradient(135deg, ${RF_MINT_ACCENT} 0%, ${RF_LEAF_GREEN} 60%, ${RF_GOLD_YELLOW} 100%)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              through actual contribution,<br />
              not just joining.
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(15px, 1.8vw, 18px)', color: 'rgba(255,255,255,0.78)',
            lineHeight: 1.7, maxWidth: 760, margin: '0 auto 36px'
          }}>
            Refeir is a merit-based meritocracy. We don't hand out rewards simply for occupying a seat in a WhatsApp group. 
            Every tier, commission bonus, and governance right is unlocked by solving real problems and delivering tangible value.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('/#apply')}
              style={{
                background: RF_LEAF_GREEN, color: RF_DEEP_GREEN, border: 'none',
                padding: '13px 30px', borderRadius: 100, fontSize: 14, fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.2s', boxShadow: `0 4px 18px ${RF_LEAF_GREEN}35`
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.background = RF_MINT_ACCENT;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.background = RF_LEAF_GREEN;
              }}
            >
              Apply to Start Climbing <ArrowRight size={15} />
            </button>

            <button
              onClick={onOpenStatus}
              style={{
                background: 'rgba(255,255,255,0.04)', color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.2)', padding: '13px 26px',
                borderRadius: 100, fontSize: 14, fontWeight: 500, cursor: 'pointer',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 7
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              }}
            >
              Check My Current Level
            </button>
          </div>
        </div>
      </section>

      {/* Core Principle Notice Bar */}
      <section style={{
        background: 'rgba(102, 187, 42, 0.05)',
        borderBottom: '1px solid rgba(102, 187, 42, 0.15)',
        padding: '20px 24px'
      }}>
        <div style={{
          maxWidth: 960, margin: '0 auto',
          display: 'flex', alignItems: 'flex-start', gap: 14,
          textAlign: 'left'
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255, 209, 102, 0.15)', border: `1px solid ${RF_GOLD_YELLOW}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            marginTop: 2
          }}>
            <Shield size={16} color={RF_GOLD_YELLOW} />
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, flex: 1 }}>
            <strong style={{ color: '#FFFFFF' }}>The Refeir Rule of Execution:</strong> Joining the community places you at{' '}
            <span style={{ color: '#94A3B8', fontWeight: 600 }}>Level 1 (Member)</span>. To achieve{' '}
            <span style={{ color: RF_LEAF_GREEN, fontWeight: 600 }}>Level 2 (Pioneer)</span> and unlock official badges, higher referral multipliers, bounties, and your Level Completion Certificate, you must complete and have verified at least 15 tangible proof-of-work missions (5x verified quota).
          </p>
        </div>
      </section>

      {/* Interactive Contributor Ladder Stepper */}
      <section id="ladder" style={{ padding: '80px 24px 100px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{
            fontSize: 11, fontWeight: 800, color: RF_MINT_ACCENT, letterSpacing: '0.18em',
            textTransform: 'uppercase', marginBottom: 12, display: 'inline-block'
          }}>
            The 5 Levels of Advancement
          </span>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 500, color: '#FFFFFF',
            letterSpacing: '-0.02em', fontFamily: 'Plus Jakarta Sans, sans-serif'
          }}>
            The Refeir Contributor Ladder
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', maxWidth: 600, margin: '12px auto 0' }}>
            Click on any level to inspect its qualification requirements, expected weekly contributions, and formal rewards.
          </p>
        </div>

        {/* Level Tabs / Stepper */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: 12,
          marginBottom: 40
        }}>
          {CONTRIBUTOR_LEVELS.map(lvl => {
            const isCurrent = lvl.level === activeLevel;
            return (
              <button
                key={lvl.level}
                onClick={() => setActiveLevel(lvl.level)}
                style={{
                  background: isCurrent ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                  border: isCurrent ? `1.5px solid ${lvl.color}` : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16,
                  padding: '18px 16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.25s ease',
                  boxShadow: isCurrent ? `0 8px 30px ${lvl.color}25` : 'none'
                }}
                onMouseEnter={e => {
                  if (!isCurrent) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                }}
                onMouseLeave={e => {
                  if (!isCurrent) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{
                    fontSize: 10.5, fontWeight: 800, padding: '3px 8px', borderRadius: 100,
                    background: lvl.accent, color: lvl.color, letterSpacing: '0.08em'
                  }}>
                    LEVEL 0{lvl.level}
                  </span>
                  {isCurrent && (
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: lvl.color }} />
                  )}
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: isCurrent ? '#FFFFFF' : 'rgba(255,255,255,0.85)', marginBottom: 4 }}>
                  {lvl.title}
                </div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
                  {lvl.tagline}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Tier Deep-Dive Card */}
        <div style={{
          background: 'rgba(15, 46, 30, 0.45)',
          border: `1.5px solid ${selectedTier.color}44`,
          borderRadius: 24,
          padding: '40px 36px',
          boxShadow: `0 20px 60px rgba(0,0,0,0.5), inset 0 0 50px ${selectedTier.color}08`,
          position: 'relative'
        }}>
          {/* Card Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            flexWrap: 'wrap', gap: 20, paddingBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.08)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{
                  fontSize: 12, fontWeight: 800, padding: '4px 12px', borderRadius: 100,
                  background: selectedTier.accent, color: selectedTier.color, letterSpacing: '0.1em'
                }}>
                  LEVEL 0{selectedTier.level} SPECIFICATION
                </span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                  Governance: <strong style={{ color: '#FFFFFF' }}>{selectedTier.governance}</strong>
                </span>
              </div>
              <h3 style={{ fontSize: 32, fontWeight: 600, color: '#FFFFFF', margin: 0, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {selectedTier.title}
              </h3>
              <p style={{ fontSize: 14.5, color: selectedTier.color, margin: '4px 0 0', fontWeight: 500 }}>
                "{selectedTier.tagline}" — {selectedTier.subtitle}
              </p>
            </div>

            <button
              onClick={() => onNavigate('/#apply')}
              style={{
                background: selectedTier.color,
                color: '#07180F',
                border: 'none',
                padding: '10px 22px',
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Qualify for Level {selectedTier.level} <ArrowRight size={14} />
            </button>
          </div>

          {/* Qualification Gate Callout */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14, padding: '16px 20px', margin: '24px 0 32px',
            display: 'flex', alignItems: 'center', gap: 14
          }}>
            <Target size={20} color={selectedTier.color} style={{ flexShrink: 0 }} />
            <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>
              <strong style={{ color: '#FFFFFF' }}>Qualification Gate:</strong> {selectedTier.criteria}
            </div>
          </div>

          {/* 3-Column Breakdown */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 28
          }}>
            {/* Column 1: Eligibility */}
            <div style={{
              background: 'rgba(255,255,255,0.02)', padding: '24px 22px', borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <CheckCircle2 size={16} color={selectedTier.color} />
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.9)' }}>
                  Eligibility Criteria
                </span>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.75 }}>
                {selectedTier.eligibility.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: 8 }}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Column 2: Tangible Contributions */}
            <div style={{
              background: 'rgba(255,255,255,0.02)', padding: '24px 22px', borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Code2 size={16} color={selectedTier.color} />
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.9)' }}>
                  Qualifying Missions
                </span>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.75 }}>
                {selectedTier.contributions.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: 8 }}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Column 3: Rewards & Privileges */}
            <div style={{
              background: 'rgba(255,255,255,0.02)', padding: '24px 22px', borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Award size={16} color={selectedTier.color} />
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.9)' }}>
                  Formal Rewards & Perks
                </span>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.75 }}>
                {selectedTier.rewards.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: 8 }}>
                    <strong style={{ color: '#FFFFFF' }}>{item}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How Contributions are Measured & Scored */}
      <section style={{
        background: '#07180F',
        borderTop: '1px solid rgba(102, 187, 42, 0.2)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '90px 24px'
      }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{
              fontSize: 11, fontWeight: 800, color: RF_MINT_ACCENT, letterSpacing: '0.18em',
              textTransform: 'uppercase', marginBottom: 12, display: 'inline-block'
            }}>
              Proof of Execution
            </span>
            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 500, color: '#FFFFFF',
              letterSpacing: '-0.02em', fontFamily: 'Plus Jakarta Sans, sans-serif'
            }}>
              How Contributions are Evaluated
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', maxWidth: 640, margin: '12px auto 0' }}>
              We evaluate contributions across six core functional tracks. Each mission is logged, reviewed, and vouched for before advancing your ladder rank.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 20
          }}>
            {[
              {
                icon: Code2,
                title: 'Tech & Architecture',
                color: RF_MINT_ACCENT,
                desc: 'Frontend bug fixes, API integrations, smart contract escrow testing, performance audits, and developer documentation.'
              },
              {
                icon: Palette,
                title: 'Design & Experience',
                color: RF_LEAF_GREEN,
                desc: 'UI mockups, interactive prototypes, icon packs, typography reviews, brand collateral, and accessibility auditing.'
              },
              {
                icon: TrendingUp,
                title: 'Growth & Referrals',
                color: RF_GOLD_YELLOW,
                desc: 'Bringing verified freelancers, inviting companies to test job postings, regional outreach, and referral attribution testing.'
              },
              {
                icon: MessageSquare,
                title: 'Community & Culture',
                color: '#38BDF8',
                desc: 'Moderating discussion squads, welcoming new cohort members, hosting audio spaces, and organizing local chapter meetups.'
              },
              {
                icon: Briefcase,
                title: 'Business & Partnerships',
                color: '#F472B6',
                desc: 'Connecting Refeir to tech hubs, universities, co-working spaces, and fintech payment channels across African regions.'
              },
              {
                icon: FileCheck,
                title: 'Operations & QA',
                color: '#A78BFA',
                desc: 'Writing end-to-end test cases, localizing copy for Francophone/Anglophone Africa, and validating escrow payment methods.'
              }
            ].map(({ icon: Icon, title, color, desc }) => (
              <div
                key={title}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 18,
                  padding: '28px 24px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = color;
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: `${color}18`,
                  border: `1px solid ${color}33`, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', marginBottom: 18
                }}>
                  <Icon size={22} color={color} />
                </div>
                <h4 style={{ fontSize: 17, fontWeight: 600, color: '#FFFFFF', marginBottom: 8 }}>
                  {title}
                </h4>
                <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, margin: 0 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verification & Ladder Promotion Process */}
      <section style={{ padding: '90px 24px', maxWidth: 1040, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <span style={{
            fontSize: 11, fontWeight: 800, color: RF_GOLD_YELLOW, letterSpacing: '0.18em',
            textTransform: 'uppercase', marginBottom: 12, display: 'inline-block'
          }}>
            Transparent Promotion Cycle
          </span>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 500, color: '#FFFFFF',
            fontFamily: 'Plus Jakarta Sans, sans-serif'
          }}>
            How to Level Up Your Standing
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 20
        }}>
          {[
            {
              step: '01',
              title: 'Claim or Propose a Mission',
              desc: 'Select an open task from your squad backlog or propose a self-directed initiative to your Squad Lead.'
            },
            {
              step: '02',
              title: 'Execute & Document',
              desc: 'Complete the work with proof of delivery (GitHub PR, Figma link, referral metrics, or report).'
            },
            {
              step: '03',
              title: 'Peer Review & Vouch',
              desc: 'Your Squad Lead and fellow Builders review the output for quality, impact, and alignment.'
            },
            {
              step: '04',
              title: 'Promotion & Reward Unlock',
              desc: 'The Admissions Committee logs the milestone in your Pioneer profile, upgrading your Contributor Ladder rank.'
            }
          ].map(item => (
            <div
              key={item.step}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                padding: '26px 22px'
              }}
            >
              <div style={{
                fontSize: 24, fontWeight: 800, color: RF_MINT_ACCENT, fontFamily: 'monospace',
                marginBottom: 12
              }}>
                {item.step}
              </div>
              <h4 style={{ fontSize: 16, fontWeight: 600, color: '#FFFFFF', marginBottom: 8 }}>
                {item.title}
              </h4>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer Section */}
      <section style={{
        background: `linear-gradient(135deg, ${RF_DARK_GREEN} 0%, ${RF_FOREST_DARK} 100%)`,
        padding: '80px 24px', textAlign: 'center', borderTop: '1px solid rgba(102, 187, 42, 0.25)'
      }}>
        <div style={{ maxWidth: 740, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 4.5vw, 48px)', fontWeight: 500, color: '#FFFFFF',
            fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 18
          }}>
            Ready to build your track record?
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, marginBottom: 32 }}>
            Submit your application to the Founding 100 today. Step in as a Refeir Member, deliver your first mission, and climb to Lead.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('/#apply')}
              style={{
                background: RF_LEAF_GREEN, color: RF_DEEP_GREEN, border: 'none',
                padding: '13px 32px', borderRadius: 100, fontSize: 14, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s', boxShadow: `0 4px 18px ${RF_LEAF_GREEN}35`
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.background = RF_MINT_ACCENT;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.background = RF_LEAF_GREEN;
              }}
            >
              Start Application
            </button>
            <button
              onClick={onOpenStatus}
              style={{
                background: 'rgba(255,255,255,0.04)', color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.2)', padding: '13px 26px',
                borderRadius: 100, fontSize: 14, fontWeight: 500, cursor: 'pointer'
              }}
            >
              Check My Application Status
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
