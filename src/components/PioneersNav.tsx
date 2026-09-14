import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X, ChevronDown, User, LogOut, Award, Zap, FileCheck } from 'lucide-react';
import {
  RF_DEEP_GREEN,
  RF_DARK_GREEN,
  RF_FOREST_DARK,
  RF_LEAF_GREEN,
  RF_MINT_ACCENT,
  RF_GOLD_YELLOW
} from '../constants/brand';
import { getCurrentContributor, signOutContributor, ContributorProfile } from '../lib/contributorAuth';

export interface PioneersNavProps {
  currentPath?: string;
  onNavigate: (path: string) => void;
  onOpenStatus: () => void;
}

export const PioneersNav: React.FC<PioneersNavProps> = ({ currentPath = '/', onNavigate, onOpenStatus }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [contributor, setContributor] = useState<ContributorProfile | null>(getCurrentContributor());
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth <= 768);
  const moreRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleAuthChange = () => {
      setContributor(getCurrentContributor());
    };
    window.addEventListener('refeir-auth-change', handleAuthChange);
    return () => window.removeEventListener('refeir-auth-change', handleAuthChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreDropdownOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        // Only close on click outside for desktop dropdown. Mobile sheet manages its own backdrop touch/click.
        if (window.innerWidth > 768) {
          setProfileMenuOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [mobileMenuOpen]);

  const handleLinkClick = (target: string, isHash: boolean = false) => {
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
    if (isHash) {
      if (currentPath === '/' || currentPath === '') {
        const el = document.getElementById(target);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
      }
      onNavigate(`/#${target}`);
    } else {
      onNavigate(target);
    }
  };

  const moreLinks = [
    {
      label: 'Squad Divisions',
      path: '/divisions',
      action: 'navigate' as const,
      tag: 'Specialized Units',
      desc: 'The 6 operational pioneer squads driving platform growth, protocol design, and outreach.',
      preview: 'Explore Engineering, Brand Strategy, Community Growth, Intelligence, Content, and Operations squads.',
      cta: 'Explore all 6 squad divisions'
    },
    {
      label: 'Daily Tasks & Bounties',
      path: '/tasks',
      action: 'navigate' as const,
      tag: 'Squad Missions & Bounties',
      desc: 'Daily and weekly announced tasks for each squad with special bonus bounties (Airtime, Data, Cash).',
      preview: 'Check live squad missions, claim special incentive bounties, and submit verified proof of work.',
      cta: 'View active squad tasks'
    },
    {
      label: 'Rewards Ladder',
      path: '/rewards',
      action: 'navigate' as const,
      tag: 'Contributor Ladder',
      desc: 'Structured 5-level contributor advancement scheme rooted in genuine deliverable impact.',
      preview: 'Advance through Member, Pioneer, Builder, Lead, and Core Team tiers with tailored bounties and prestige.',
      cta: 'View advancement rubric'
    },
    {
      label: 'Submit Task Proof',
      path: '/submit-task',
      action: 'navigate' as const,
      tag: 'Proof of Work',
      desc: 'Report mission deliverables, upload screenshots or live links, and log verified contributions.',
      preview: 'Logged directly to your contributor profile with reviewer verification and advancement credits.',
      cta: 'Open submission console'
    },
    {
      label: 'Story & Founder',
      path: '/story',
      action: 'navigate' as const,
      tag: 'Origin & Founder',
      desc: 'How Refeir was born, its grassroots history across Africa, and Founder Tonye Taylor’s journey.',
      preview: 'Discover why Tonye Taylor built Refeir, the first university cohorts, and our sovereign decentralized roadmap.',
      cta: 'Read origin story & founder essay'
    },
    {
      label: 'Check Status',
      path: undefined,
      action: 'status' as const,
      tag: 'Application Tracking',
      desc: 'Look up your admission review, squad assignment, and acceptance status in real time.',
      preview: 'Lookup your Pioneer ID or registered email to view real-time verification and committee feedback.',
      cta: 'Open status lookup modal'
    },
    {
      label: 'How It Works',
      path: '/how-it-works',
      action: 'navigate' as const,
      tag: 'Execution Roadmap',
      desc: 'Complete overview of application, vetting, team assignment, and milestone deployment cycle.',
      preview: 'Understand the end-to-end pipeline from initial recruit onboarding to strategic execution.',
      cta: 'Review recruitment lifecycle'
    },
    {
      label: 'FAQ',
      path: '/faq',
      action: 'navigate' as const,
      tag: 'Knowledge Base',
      desc: 'Common questions covering admission criteria, squad workloads, stipends, and expectations.',
      preview: 'Find quick clarity on commitments, team assignments, cross-squad eligibility, and evaluation.',
      cta: 'Search knowledge base'
    },
    {
      label: 'Contact',
      path: '/contact',
      action: 'navigate' as const,
      tag: 'Admissions Desk',
      desc: 'Connect with the Pioneer recruitment team and regional operations leads directly.',
      preview: 'For institutional partnerships, leadership referrals, and expedited applicant queries.',
      cta: 'Message admissions team'
    },
  ];

  const handleItemClick = (item: typeof moreLinks[0]) => {
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
    if (item.action === 'status') {
      onOpenStatus();
    } else if (item.path) {
      handleLinkClick(item.path, false);
    }
  };

  const isMoreActive = moreLinks.some(item => item.path && currentPath === item.path);
  const activeFlyoutItem = moreLinks[hoveredIndex] || moreLinks[0];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? `rgba(15, 46, 30, 0.96)` : 'transparent',
      backdropFilter: scrolled ? 'blur(18px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(102, 187, 42, 0.15)' : 'none',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        maxWidth: 1240, margin: '0 auto', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72
      }}>
        {/* Left Side: Mobile Hamburger (shown only on mobile) + Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Mobile Menu Toggle (Minimalist icon) */}
          <button
            onClick={() => {
              const nextState = !mobileMenuOpen;
              setMobileMenuOpen(nextState);
              if (nextState) {
                setProfileMenuOpen(false);
              }
            }}
            className="rp-nav-hamburger"
            aria-label="Toggle navigation menu"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 6px 6px 0',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'opacity 0.2s ease',
              flexShrink: 0,
              opacity: 0.9
            }}
          >
            {mobileMenuOpen ? (
              <X size={22} strokeWidth={1.5} color={RF_MINT_ACCENT} />
            ) : (
              <Menu size={22} strokeWidth={1.5} color="rgba(255, 255, 255, 0.9)" />
            )}
          </button>

          {/* Brand Logo */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
            onClick={() => handleLinkClick('/', false)}
          >
            <img src="/Refeir-LogoWhite.png" alt="Refeir" style={{ height: 26, width: 'auto' }} />
            <span style={{
              fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', color: RF_MINT_ACCENT,
              padding: '2px 7px', border: `1px solid ${RF_LEAF_GREEN}33`, borderRadius: 100,
              background: `${RF_LEAF_GREEN}14`, textTransform: 'uppercase'
            }}>
              PIONEERS
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="rp-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {/* Pioneers */}
          <button
            onClick={() => handleLinkClick('pioneers-about', true)}
            style={{
              background: 'none', border: 'none',
              color: currentPath === '/' && (window.location.hash === '#pioneers-about' || !window.location.hash) ? RF_MINT_ACCENT : 'rgba(255,255,255,0.72)',
              fontSize: 13, fontWeight: 500, letterSpacing: '0.01em',
              cursor: 'pointer', transition: 'all 0.2s', padding: '6px 0'
            }}
            onMouseEnter={e => (e.currentTarget.style.color = RF_MINT_ACCENT)}
            onMouseLeave={e => (e.currentTarget.style.color = currentPath === '/' ? RF_MINT_ACCENT : 'rgba(255,255,255,0.72)')}
          >
            Pioneers
          </button>

          {/* About Refeir */}
          <button
            onClick={() => handleLinkClick('/about', false)}
            style={{
              background: 'none', border: 'none',
              color: currentPath === '/about' ? RF_MINT_ACCENT : 'rgba(255,255,255,0.72)',
              fontSize: 13, fontWeight: 500, letterSpacing: '0.01em',
              cursor: 'pointer', transition: 'all 0.2s', padding: '6px 0'
            }}
            onMouseEnter={e => (e.currentTarget.style.color = RF_MINT_ACCENT)}
            onMouseLeave={e => (e.currentTarget.style.color = currentPath === '/about' ? RF_MINT_ACCENT : 'rgba(255,255,255,0.72)')}
          >
            About Refeir
          </button>

          {/* "Explore" Interactive Dropdown with Sharp Wide Flyout */}
          <div
            ref={moreRef}
            style={{ position: 'relative' }}
            onMouseEnter={() => setMoreDropdownOpen(true)}
            onMouseLeave={() => setMoreDropdownOpen(false)}
          >
            <button
              onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
              style={{
                background: 'none', border: 'none',
                color: isMoreActive ? RF_MINT_ACCENT : 'rgba(255,255,255,0.72)',
                fontSize: 13, fontWeight: 500, letterSpacing: '0.01em',
                cursor: 'pointer', transition: 'all 0.2s', padding: '6px 0',
                display: 'inline-flex', alignItems: 'center', gap: 5
              }}
              onMouseEnter={e => (e.currentTarget.style.color = RF_MINT_ACCENT)}
              onMouseLeave={e => (e.currentTarget.style.color = isMoreActive ? RF_MINT_ACCENT : 'rgba(255,255,255,0.72)')}
            >
              Explore
              <ChevronDown
                size={14}
                style={{
                  transform: moreDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                  opacity: 0.7
                }}
              />
            </button>

            {/* Dropdown Menu Box: Sharp Edges, Wide Flyout, Vertical Divider */}
            {moreDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: -60,
                  paddingTop: 12,
                  zIndex: 200
                }}
              >
                <div
                  style={{
                    background: 'rgba(6, 20, 13, 0.98)',
                    backdropFilter: 'blur(22px)',
                    border: '1px solid rgba(102, 187, 42, 0.35)',
                    borderRadius: 0, // Sharp corners
                    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(24, 252, 92, 0.08)',
                    display: 'flex',
                    width: 580,
                    maxWidth: 'calc(100vw - 32px)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Left Column: Menu Items */}
                  <div style={{ width: '48%', padding: '8px 0', display: 'flex', flexDirection: 'column' }}>
                    {moreLinks.map((item, idx) => {
                      const isSelected = !!item.path && currentPath === item.path;
                      const isHovered = hoveredIndex === idx;
                      return (
                        <button
                          key={item.label}
                          onClick={() => handleItemClick(item)}
                          onMouseEnter={() => setHoveredIndex(idx)}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '10px 18px',
                            borderRadius: 0, // Sharp edges
                            background: isHovered
                              ? 'rgba(102, 187, 42, 0.14)'
                              : isSelected
                              ? 'rgba(255, 255, 255, 0.04)'
                              : 'transparent',
                            border: 'none',
                            borderLeft: isHovered
                              ? `3px solid ${RF_MINT_ACCENT}`
                              : isSelected
                              ? `3px solid rgba(102, 187, 42, 0.45)`
                              : '3px solid transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'background 0.15s, border-color 0.15s'
                          }}
                        >
                          <span style={{
                            fontSize: 13,
                            fontWeight: isHovered || isSelected ? 600 : 500,
                            color: isHovered ? RF_MINT_ACCENT : isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.85)',
                            letterSpacing: '0.01em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 7
                          }}>
                            {item.label}
                          </span>
                          <span style={{
                            fontSize: 12,
                            color: isHovered ? RF_MINT_ACCENT : 'rgba(255, 255, 255, 0.25)',
                            transform: isHovered ? 'translateX(2px)' : 'none',
                            transition: 'transform 0.15s, color 0.15s'
                          }}>
                            ›
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Vertical Dividing Line */}
                  <div style={{
                    width: 1,
                    background: 'rgba(102, 187, 42, 0.25)',
                    alignSelf: 'stretch'
                  }} />

                  {/* Right Column: Dynamic Flyout Details */}
                  <div style={{
                    width: '52%',
                    padding: '22px 22px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: 'rgba(24, 252, 92, 0.02)'
                  }}>
                    <div>
                      <div style={{
                        display: 'inline-block',
                        fontSize: 9.5,
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        color: RF_MINT_ACCENT,
                        background: 'rgba(24, 252, 92, 0.08)',
                        border: '1px solid rgba(24, 252, 92, 0.25)',
                        padding: '3px 8px',
                        borderRadius: 0, // Sharp edges
                        marginBottom: 10,
                        textTransform: 'uppercase'
                      }}>
                        {activeFlyoutItem.tag}
                      </div>

                      <h4 style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: '#FFFFFF',
                        margin: '0 0 8px 0',
                        letterSpacing: '-0.01em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}>
                        {activeFlyoutItem.label}
                      </h4>

                      <p style={{
                        fontSize: 12.5,
                        lineHeight: 1.5,
                        color: 'rgba(255, 255, 255, 0.8)',
                        margin: '0 0 10px 0'
                      }}>
                        {activeFlyoutItem.desc}
                      </p>

                      <p style={{
                        fontSize: 11.5,
                        lineHeight: 1.45,
                        color: 'rgba(255, 255, 255, 0.48)',
                        margin: 0
                      }}>
                        {activeFlyoutItem.preview}
                      </p>
                    </div>

                    <div
                      onClick={() => handleItemClick(activeFlyoutItem)}
                      style={{
                        marginTop: 18,
                        paddingTop: 12,
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: 12,
                        fontWeight: 600,
                        color: RF_MINT_ACCENT,
                        cursor: 'pointer'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
                      onMouseLeave={e => (e.currentTarget.style.color = RF_MINT_ACCENT)}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {activeFlyoutItem.cta}
                      </span>
                      <span>→</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls & Mobile Hamburger Toggle */}
        <div className="rp-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* "Become a Pioneer" Button (Desktop/Tablet CTA) */}
          <button
            onClick={() => handleLinkClick('apply', true)}
            className="rp-nav-cta-desk"
            style={{
              background: RF_LEAF_GREEN,
              color: RF_DEEP_GREEN,
              border: 'none',
              padding: '7px 18px',
              borderRadius: 100,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '0.01em',
              transition: 'all 0.2s',
              boxShadow: `0 2px 10px ${RF_LEAF_GREEN}33`,
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.background = RF_MINT_ACCENT;
              e.currentTarget.style.boxShadow = `0 4px 16px ${RF_MINT_ACCENT}44`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.background = RF_LEAF_GREEN;
              e.currentTarget.style.boxShadow = `0 2px 10px ${RF_LEAF_GREEN}33`;
            }}
          >
            Become a Pioneer
          </button>

          {/* Contributor Profile Chip or Sign In Trigger */}
          {contributor ? (
            <div ref={profileMenuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  const nextState = !profileMenuOpen;
                  setProfileMenuOpen(nextState);
                  if (nextState) {
                    setMobileMenuOpen(false);
                  }
                }}
                style={{
                  background: 'rgba(24, 252, 92, 0.08)',
                  border: '1px solid rgba(24, 252, 92, 0.28)',
                  padding: '5px 12px 5px 8px',
                  borderRadius: 100,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  color: '#FFFFFF',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = RF_MINT_ACCENT;
                  e.currentTarget.style.background = 'rgba(24, 252, 92, 0.14)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(24, 252, 92, 0.28)';
                  e.currentTarget.style.background = 'rgba(24, 252, 92, 0.08)';
                }}
              >
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${RF_LEAF_GREEN} 0%, ${RF_MINT_ACCENT} 100%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: RF_DEEP_GREEN, fontWeight: 700, fontSize: 11,
                  overflow: 'hidden'
                }}>
                  {contributor.avatar_url ? (
                    <img src={contributor.avatar_url} alt={contributor.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    contributor.full_name.charAt(0).toUpperCase()
                  )}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#FFFFFF', lineHeight: 1.1 }}>
                    {contributor.full_name.split(' ')[0]}
                  </div>
                  <div style={{ fontSize: 9.5, color: RF_MINT_ACCENT, fontWeight: 700, letterSpacing: '0.04em' }}>
                    {contributor.contributor_level.replace('_', ' ')}
                  </div>
                </div>
                <ChevronDown size={13} style={{ color: 'rgba(255,255,255,0.6)', marginLeft: 2 }} />
              </button>

              {/* Profile Menu: Desktop Dropdown in-place */}
              {profileMenuOpen && !isMobile && (
                <div className="rp-profile-menu-box">
                  <div style={{ padding: '4px 8px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>
                          {contributor.full_name}
                        </div>
                        <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {contributor.email}
                        </div>
                      </div>
                      <span style={{
                        fontSize: 10,
                        background: 'rgba(24, 252, 92, 0.12)', color: RF_MINT_ACCENT,
                        padding: '3px 8px', borderRadius: 6, fontWeight: 700,
                        border: '1px solid rgba(24, 252, 92, 0.25)',
                        textTransform: 'uppercase', letterSpacing: '0.04em'
                      }}>
                        {contributor.contributor_level.replace('_', ' ')}
                      </span>
                    </div>
                    {contributor.application_number && (
                      <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          display: 'inline-block', fontSize: 10,
                          background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)',
                          padding: '2px 8px', borderRadius: 4, fontWeight: 600,
                          letterSpacing: '0.03em'
                        }}>
                          ID: {contributor.application_number}
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '10px 0 4px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {!contributor.is_profile_completed ? (
                      <button
                        className="rp-docker-btn"
                        onClick={() => { setProfileMenuOpen(false); onNavigate('/complete-profile'); }}
                        style={{
                          background: 'rgba(255, 184, 0, 0.15)', border: '1px solid rgba(255, 184, 0, 0.4)',
                          color: '#FDE68A', fontWeight: 700, marginBottom: 6
                        }}
                      >
                        <span style={{ width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <User size={16} color={RF_GOLD_YELLOW} />
                        </span>
                        <span>Complete Profile (Mint ID)</span>
                      </button>
                    ) : (
                      <button
                        className="rp-docker-btn"
                        onClick={() => { setProfileMenuOpen(false); onNavigate('/profile'); }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                      >
                        <span style={{ width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <User size={16} color={RF_MINT_ACCENT} />
                        </span>
                        <span>Profile</span>
                      </button>
                    )}
                    <button
                      className="rp-docker-btn"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        window.location.hash = '#certificates';
                        onNavigate('/profile');
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                      <span style={{ width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileCheck size={16} color={RF_GOLD_YELLOW} />
                      </span>
                      <span>My Certificates</span>
                    </button>
                    <button
                      className="rp-docker-btn"
                      onClick={() => { setProfileMenuOpen(false); handleLinkClick('/submit-task', false); }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                      <span style={{ width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Award size={16} color={RF_MINT_ACCENT} />
                      </span>
                      <span>Submit Task Proof</span>
                    </button>
                    <button
                      className="rp-docker-btn"
                      onClick={() => { setProfileMenuOpen(false); handleLinkClick('/rewards', false); }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                      <span style={{ width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Zap size={16} color={RF_GOLD_YELLOW} />
                      </span>
                      <span>Rewards & Ladder</span>
                    </button>
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '6px 0' }} />
                    <button
                      className="rp-docker-btn"
                      onClick={() => { setProfileMenuOpen(false); signOutContributor(); }}
                      style={{ color: '#FCA5A5' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.12)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                      <span style={{ width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <LogOut size={16} color="#FCA5A5" />
                      </span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Mobile Profile Docker (Mounted cleanly via Portal to document.body to prevent parent transform/blur judder) */}
              {profileMenuOpen && isMobile && typeof document !== 'undefined' && createPortal(
                <div style={{ position: 'fixed', inset: 0, zIndex: 99999, pointerEvents: 'auto' }}>
                  {/* Backdrop Overlay */}
                  <div
                    className="rp-profile-docker-overlay"
                    onClick={() => setProfileMenuOpen(false)}
                    onTouchMove={(e) => e.preventDefault()}
                    aria-hidden="true"
                  />
                  <div className="rp-profile-menu-box" role="dialog" aria-modal="true" aria-label="Contributor profile options">
                    {/* Mobile Sheet Handle Pill */}
                    <div className="rp-docker-handle" />

                    <div style={{ padding: '4px 8px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF' }}>
                            {contributor.full_name}
                          </div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {contributor.email}
                          </div>
                        </div>
                        <span style={{
                          fontSize: 10,
                          background: 'rgba(24, 252, 92, 0.12)', color: RF_MINT_ACCENT,
                          padding: '3px 8px', borderRadius: 6, fontWeight: 700,
                          border: '1px solid rgba(24, 252, 92, 0.25)',
                          textTransform: 'uppercase', letterSpacing: '0.04em'
                        }}>
                          {contributor.contributor_level.replace('_', ' ')}
                        </span>
                      </div>
                      {contributor.application_number && (
                        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{
                            display: 'inline-block', fontSize: 10,
                            background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)',
                            padding: '2px 8px', borderRadius: 4, fontWeight: 600,
                            letterSpacing: '0.03em'
                          }}>
                            ID: {contributor.application_number}
                          </span>
                        </div>
                      )}
                    </div>

                    <div style={{ padding: '12px 0 6px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {!contributor.is_profile_completed ? (
                        <button
                          className="rp-docker-btn"
                          onClick={() => { setProfileMenuOpen(false); onNavigate('/complete-profile'); }}
                          style={{
                            background: 'rgba(255, 184, 0, 0.15)', border: '1px solid rgba(255, 184, 0, 0.4)',
                            color: '#FDE68A', fontWeight: 700, marginBottom: 6
                          }}
                        >
                          <span style={{ width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <User size={18} color={RF_GOLD_YELLOW} />
                          </span>
                          <span>Complete Profile (Mint ID)</span>
                        </button>
                      ) : (
                        <button
                          className="rp-docker-btn"
                          onClick={() => { setProfileMenuOpen(false); onNavigate('/profile'); }}
                        >
                          <span style={{ width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <User size={18} color={RF_MINT_ACCENT} />
                          </span>
                          <span>Profile</span>
                        </button>
                      )}
                      <button
                        className="rp-docker-btn"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          window.location.hash = '#certificates';
                          onNavigate('/profile');
                        }}
                      >
                        <span style={{ width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <FileCheck size={18} color={RF_GOLD_YELLOW} />
                        </span>
                        <span>My Certificates</span>
                      </button>
                      <button
                        className="rp-docker-btn"
                        onClick={() => { setProfileMenuOpen(false); handleLinkClick('/submit-task', false); }}
                      >
                        <span style={{ width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Award size={18} color={RF_MINT_ACCENT} />
                        </span>
                        <span>Submit Task Proof</span>
                      </button>
                      <button
                        className="rp-docker-btn"
                        onClick={() => { setProfileMenuOpen(false); handleLinkClick('/rewards', false); }}
                      >
                        <span style={{ width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Zap size={18} color={RF_GOLD_YELLOW} />
                        </span>
                        <span>Rewards & Ladder</span>
                      </button>
                      <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '8px 0' }} />
                      <button
                        className="rp-docker-btn"
                        onClick={() => { setProfileMenuOpen(false); signOutContributor(); }}
                        style={{ color: '#FCA5A5' }}
                      >
                        <span style={{ width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <LogOut size={18} color="#FCA5A5" />
                        </span>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>,
                document.body
              )}
            </div>
          ) : (
            <button
              onClick={() => onNavigate('/signin')}
              className="rp-nav-signin"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                color: '#FFFFFF',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                padding: '6px 14px',
                borderRadius: 100,
                transition: 'all 0.15s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)';
                e.currentTarget.style.color = RF_MINT_ACCENT;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer - Full Screen Overlay */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 72,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: 'calc(100vh - 72px)',
            background: `linear-gradient(180deg, ${RF_DARK_GREEN} 0%, #030a06 100%)`,
            borderBottom: `1px solid ${RF_LEAF_GREEN}33`,
            padding: '20px 24px 40px',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
            zIndex: 999
          }}
        >
          {/* Contributor Profile or Sign In */}
          {contributor ? (
            <div style={{
              background: 'rgba(24, 252, 92, 0.08)', border: '1px solid rgba(24, 252, 92, 0.25)',
              borderRadius: 12, padding: '12px 14px', marginBottom: 14
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${RF_LEAF_GREEN} 0%, ${RF_MINT_ACCENT} 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: RF_DEEP_GREEN, fontWeight: 700, fontSize: 13,
                    overflow: 'hidden', flexShrink: 0
                  }}>
                    {contributor.avatar_url ? (
                      <img src={contributor.avatar_url} alt={contributor.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      contributor.full_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#FFFFFF' }}>
                      {contributor.full_name}
                    </div>
                    <div style={{ fontSize: 11, color: RF_MINT_ACCENT, fontWeight: 600 }}>
                      {contributor.pioneer_id ? `${contributor.pioneer_id} • ` : ''}{contributor.contributor_level.replace('_', ' ')} • {contributor.division}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => signOutContributor()}
                  style={{
                    background: 'none', border: 'none', color: '#FCA5A5',
                    fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                  }}
                >
                  <LogOut size={13} /> Sign Out
                </button>
              </div>

              {!contributor.is_profile_completed ? (
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigate('/complete-profile'); }}
                  style={{
                    width: '100%', background: 'rgba(255, 184, 0, 0.15)', border: '1px solid rgba(255, 184, 0, 0.4)',
                    color: '#FDE68A', padding: '8px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                  }}
                >
                  <User size={13} color={RF_GOLD_YELLOW} /> Complete Profile to Mint ID →
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => { setMobileMenuOpen(false); onNavigate('/profile'); }}
                    style={{
                      flex: 1, background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#FFFFFF', padding: '7px 8px', borderRadius: 8, fontSize: 11.5, fontWeight: 600,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5
                    }}
                  >
                    <User size={13} color={RF_MINT_ACCENT} /> Profile & Pass
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      window.location.hash = '#certificates';
                      onNavigate('/profile');
                    }}
                    style={{
                      flex: 1, background: 'rgba(255, 184, 0, 0.12)', border: '1px solid rgba(255, 184, 0, 0.3)',
                      color: RF_GOLD_YELLOW, padding: '7px 8px', borderRadius: 8, fontSize: 11.5, fontWeight: 700,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5
                    }}
                  >
                    <FileCheck size={13} color={RF_GOLD_YELLOW} /> Certificates
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('/signin');
              }}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)',
                color: '#FFFFFF', padding: '10px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                marginBottom: 14
              }}
            >
              <User size={14} color={RF_MINT_ACCENT} /> Sign In / Register
            </button>
          )}

          {/* Top Links */}
          <button
            onClick={() => handleLinkClick('pioneers-about', true)}
            style={{
              display: 'block', width: '100%', textAlign: 'left', background: 'none',
              border: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)',
              color: currentPath === '/' ? RF_MINT_ACCENT : 'rgba(255,255,255,0.85)',
              fontSize: 14, fontWeight: 500, padding: '12px 0', cursor: 'pointer'
            }}
          >
            Pioneers
          </button>

          <button
            onClick={() => handleLinkClick('/about', false)}
            style={{
              display: 'block', width: '100%', textAlign: 'left', background: 'none',
              border: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)',
              color: currentPath === '/about' ? RF_MINT_ACCENT : 'rgba(255,255,255,0.85)',
              fontSize: 14, fontWeight: 500, padding: '12px 0', cursor: 'pointer'
            }}
          >
            About Refeir
          </button>

          {/* Explore Section Items */}
          <div style={{ padding: '10px 0 6px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', fontWeight: 600, display: 'block', marginBottom: 6 }}>
              Explore
            </span>
            {moreLinks.map(item => {
              const isSelected = !!item.path && currentPath === item.path;
              return (
                <button
                  key={item.label}
                  onClick={() => handleItemClick(item)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', textAlign: 'left', background: 'none',
                    border: 'none',
                    color: isSelected ? RF_MINT_ACCENT : 'rgba(255,255,255,0.85)',
                    fontSize: 13.5, fontWeight: isSelected ? 600 : 500, padding: '8px 6px', cursor: 'pointer'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    {item.label}
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>›</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handleLinkClick('apply', true)}
            style={{
              marginTop: 18, width: '100%', background: RF_LEAF_GREEN, color: RF_DEEP_GREEN,
              border: 'none', padding: '12px', borderRadius: 100, fontSize: 13.5,
              fontWeight: 600, cursor: 'pointer', letterSpacing: '0.01em'
            }}
          >
            Become a Pioneer
          </button>
        </div>
      )}
    </nav>
  );
};
