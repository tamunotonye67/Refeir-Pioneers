import React, { useState, useEffect } from 'react';
import {
  Lock, Mail, Shield, ArrowRight, CheckCircle2,
  AlertCircle, LogIn, Key, Check, HelpCircle, UserCheck
} from 'lucide-react';
import {
  RF_DEEP_GREEN,
  RF_DARK_GREEN,
  RF_FOREST_DARK,
  RF_LEAF_GREEN,
  RF_MINT_ACCENT,
  RF_GOLD_YELLOW
} from '../constants/brand';
import { signInContributor, signUpContributor, getCurrentContributor } from '../lib/contributorAuth';
import { validateAcceptanceCredentials, PioneerApplicationRecord } from '../lib/pioneerApplications';

interface AuthPageProps {
  onNavigate: (path: string) => void;
  onOpenStatus: () => void;
  initialTab?: 'signin' | 'signup';
  prefilledAppNumber?: string;
  prefilledPioneerId?: string;
  prefilledAcceptanceCode?: string;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onNavigate,
  onOpenStatus,
  initialTab = 'signin',
  prefilledAppNumber = '',
  prefilledPioneerId = '',
  prefilledAcceptanceCode = ''
}) => {
  const [tab, setTab] = useState<'signin' | 'signup'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [appNumber, setAppNumber] = useState(prefilledAppNumber);
  const [pioneerId, setPioneerId] = useState(prefilledPioneerId);
  const [acceptanceCode, setAcceptanceCode] = useState(prefilledAcceptanceCode);
  const [verifiedApp, setVerifiedApp] = useState<PioneerApplicationRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [validationMsg, setValidationMsg] = useState('');

  useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (prefilledAppNumber) setAppNumber(prefilledAppNumber);
    if (prefilledPioneerId) setPioneerId(prefilledPioneerId);
    if (prefilledAcceptanceCode) setAcceptanceCode(prefilledAcceptanceCode);
  }, [prefilledAppNumber, prefilledPioneerId, prefilledAcceptanceCode]);

  // Live verification when Application ID and Acceptance Code are entered
  useEffect(() => {
    if (tab === 'signup' && appNumber.trim().length >= 8 && acceptanceCode.trim().length >= 6) {
      const check = validateAcceptanceCredentials(appNumber, acceptanceCode);
      if (check.valid && check.application) {
        setVerifiedApp(check.application);
        setEmail(check.application.email);
        setErrorMsg('');
        setValidationMsg(`Verified: ${check.application.full_name} • Application ${check.application.application_number} (${check.application.primary_division || 'Pioneer Squad'})`);
      } else {
        setVerifiedApp(null);
        setValidationMsg('');
        if (check.error) {
          setErrorMsg(check.error);
        }
      }
    } else {
      setVerifiedApp(null);
      setValidationMsg('');
    }
  }, [appNumber, acceptanceCode, tab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (tab === 'signin') {
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }
      if (!password.trim()) {
        setErrorMsg('Please enter your password.');
        return;
      }

      setLoading(true);
      try {
        const user = await signInContributor(email, password);
        if (!user.is_profile_completed) {
          onNavigate('/complete-profile');
        } else {
          onNavigate('/submit-task');
        }
      } catch (err: any) {
        setErrorMsg(err?.message || 'Authentication failed. Please check your credentials.');
      } finally {
        setLoading(false);
      }
    } else {
      if (!appNumber.trim()) {
        setErrorMsg('Please enter your official Application ID (e.g. RP-2026-849201).');
        return;
      }
      if (!acceptanceCode.trim()) {
        setErrorMsg('Please enter your official Acceptance Code (e.g. ACC-8492-9041) issued upon admission.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }
      if (!password.trim() || password.length < 6) {
        setErrorMsg('Please create a secure password (at least 6 characters).');
        return;
      }

      setLoading(true);
      try {
        await signUpContributor({
          application_number: appNumber,
          acceptance_code: acceptanceCode,
          email,
          password
        });
        onNavigate('/complete-profile');
      } catch (err: any) {
        setErrorMsg(err?.message || 'Verification failed. Only accepted applicants can register.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTestFill = (type: 'kwame_signin' | 'chidubem_signup' | 'amina_signup') => {
    setErrorMsg('');
    if (type === 'kwame_signin') {
      setTab('signin');
      setEmail('kwame.mensah@example.com');
      setPassword('password123');
    } else if (type === 'chidubem_signup') {
      setTab('signup');
      setAppNumber('RP-2026-849201');
      setAcceptanceCode('ACC-8492-9041');
      setEmail('chidubem.nwosu@example.com');
      setPassword('password123');
    } else if (type === 'amina_signup') {
      setTab('signup');
      setAppNumber('RP-2026-612948');
      setAcceptanceCode('ACC-6129-3319');
      setEmail('amina.k@example.com');
      setPassword('password123');
    }
  };

  return (
    <div style={{ background: RF_DEEP_GREEN, minHeight: '100vh', color: '#FFFFFF', paddingTop: 100, paddingBottom: 80 }}>
      <div style={{ maxWidth: 540, margin: '0 auto', padding: '0 20px' }}>
        
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 100,
            background: 'rgba(24, 252, 92, 0.1)', border: '1px solid rgba(24, 252, 92, 0.25)',
            color: RF_MINT_ACCENT, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
            textTransform: 'uppercase', marginBottom: 16
          }}>
            <Shield size={14} /> Contributor Authentication
          </div>

          <h1 style={{
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: 'clamp(28px, 5vw, 36px)',
            fontWeight: 800,
            lineHeight: 1.2,
            margin: '0 0 10px',
            color: '#FFFFFF'
          }}>
            {tab === 'signin' ? 'Sign In to Refeir Pioneers' : 'Activate Contributor Profile'}
          </h1>
          <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6 }}>
            {tab === 'signin'
              ? 'Access your contributor portal, submit verified deliverables, and climb the advancement ladder.'
              : 'Members can only sign up after being accepted by admissions and issued an official Acceptance Code.'}
          </p>
        </div>

        {/* Card Container */}
        <div style={{
          background: `linear-gradient(145deg, ${RF_DARK_GREEN} 0%, ${RF_FOREST_DARK} 100%)`,
          border: '1px solid rgba(102, 187, 42, 0.35)',
          borderRadius: 24,
          padding: '32px 30px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(24, 252, 92, 0.08)'
        }}>

          {/* Tab Switcher */}
          <div style={{
            display: 'flex', background: 'rgba(0,0,0,0.4)', borderRadius: 100,
            padding: 4, marginBottom: 24, border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <button
              type="button"
              onClick={() => { setTab('signin'); setErrorMsg(''); }}
              style={{
                flex: 1, padding: '10px 16px', borderRadius: 100, border: 'none',
                background: tab === 'signin' ? RF_LEAF_GREEN : 'transparent',
                color: tab === 'signin' ? RF_DEEP_GREEN : 'rgba(255,255,255,0.7)',
                fontSize: 13.5, fontWeight: 700, cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.15s'
              }}
            >
              <LogIn size={15} /> Sign In
            </button>
            <button
              type="button"
              onClick={() => { setTab('signup'); setErrorMsg(''); }}
              style={{
                flex: 1, padding: '10px 16px', borderRadius: 100, border: 'none',
                background: tab === 'signup' ? RF_LEAF_GREEN : 'transparent',
                color: tab === 'signup' ? RF_DEEP_GREEN : 'rgba(255,255,255,0.7)',
                fontSize: 13.5, fontWeight: 700, cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.15s'
              }}
            >
              <Key size={15} /> Activate (Sign Up)
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444',
              borderRadius: 12, padding: '12px 16px', color: '#FCA5A5',
              fontSize: 13, display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20,
              lineHeight: 1.5
            }}>
              <AlertCircle size={17} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <span>{errorMsg}</span>
                {tab === 'signup' && onOpenStatus && (
                  <div style={{ marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={onOpenStatus}
                      style={{
                        background: 'none', border: 'none', padding: 0, color: RF_MINT_ACCENT,
                        fontSize: 12.5, fontWeight: 700, textDecoration: 'underline', cursor: 'pointer'
                      }}
                    >
                      Look up your Acceptance Code via Check Status →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Validation Success Banner */}
          {tab === 'signup' && validationMsg && (
            <div style={{
              background: 'rgba(24, 252, 92, 0.12)', border: `1px solid ${RF_MINT_ACCENT}`,
              borderRadius: 12, padding: '12px 16px', color: '#FFFFFF',
              fontSize: 13, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20
            }}>
              <CheckCircle2 size={18} color={RF_MINT_ACCENT} style={{ flexShrink: 0 }} />
              <span style={{ fontWeight: 600 }}>{validationMsg}</span>
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit}>
            {tab === 'signup' && (
              <>
                {/* Notice Box on Activation Prerequisites */}
                <div style={{
                  background: 'rgba(255, 184, 0, 0.08)', border: '1px solid rgba(255, 184, 0, 0.3)',
                  borderRadius: 12, padding: '12px 14px', marginBottom: 18,
                  fontSize: 12.5, color: '#FDE68A', display: 'flex', alignItems: 'flex-start', gap: 10,
                  lineHeight: 1.5
                }}>
                  <HelpCircle size={17} color={RF_GOLD_YELLOW} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={{ color: '#FFFFFF' }}>Admission Verification:</strong> Enter your official <strong>Application ID</strong> and <strong>Acceptance Code</strong>. Your official Pioneer ID will be minted once you sign in and complete your contributor profile.
                  </div>
                </div>

                {/* Application Number */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: 6 }}>
                    Application ID <span style={{ color: '#EF4444' }}>* (Mandatory)</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="e.g. RP-2026-849201"
                      value={appNumber}
                      onChange={e => setAppNumber(e.target.value.toUpperCase())}
                      style={{
                        width: '100%', boxSizing: 'border-box', background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
                        padding: '11px 14px', color: '#FFFFFF', fontSize: 13.5, outline: 'none'
                      }}
                      onFocus={e => (e.target.style.borderColor = RF_MINT_ACCENT)}
                      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
                    />
                  </div>
                  <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', margin: '4px 0 0' }}>
                    Received upon submitting your initial pioneer recruitment application.
                  </p>
                </div>

                {/* Acceptance Code */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
                      Acceptance Code <span style={{ color: '#EF4444' }}>* (Mandatory)</span>
                    </label>
                    {onOpenStatus && (
                      <button
                        type="button"
                        onClick={onOpenStatus}
                        style={{
                          background: 'none', border: 'none', color: RF_MINT_ACCENT,
                          fontSize: 11.5, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline'
                        }}
                      >
                        Don't have code? Check Status
                      </button>
                    )}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="e.g. ACC-8492-9041"
                      value={acceptanceCode}
                      onChange={e => setAcceptanceCode(e.target.value.toUpperCase())}
                      style={{
                        width: '100%', boxSizing: 'border-box', background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
                        padding: '11px 14px', color: '#FFFFFF', fontSize: 13.5, outline: 'none',
                        letterSpacing: '0.04em'
                      }}
                      onFocus={e => (e.target.style.borderColor = RF_MINT_ACCENT)}
                      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
                    />
                  </div>
                  <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', margin: '4px 0 0' }}>
                    Issued by the admissions board in your acceptance letter or on the status check tool.
                  </p>
                </div>
              </>
            )}

            {/* Email Field */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: 6 }}>
                Email Address <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  placeholder="e.g. yourname@domain.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    width: '100%', boxSizing: 'border-box', background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
                    padding: '11px 14px 11px 40px', color: '#FFFFFF', fontSize: 13.5, outline: 'none'
                  }}
                  onFocus={e => (e.target.style.borderColor = RF_MINT_ACCENT)}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: 6 }}>
                {tab === 'signin' ? 'Password' : 'Create Account Password'} <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  placeholder={tab === 'signin' ? 'Enter your password' : 'Min 6 characters'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{
                    width: '100%', boxSizing: 'border-box', background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
                    padding: '11px 14px 11px 40px', color: '#FFFFFF', fontSize: 13.5, outline: 'none'
                  }}
                  onFocus={e => (e.target.style.borderColor = RF_MINT_ACCENT)}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', background: RF_LEAF_GREEN, color: RF_DEEP_GREEN,
                border: 'none', padding: '13px', borderRadius: 100, fontSize: 14.5,
                fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: `0 4px 16px ${RF_LEAF_GREEN}44`, transition: 'all 0.2s',
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = RF_MINT_ACCENT; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = RF_LEAF_GREEN; }}
            >
              {loading ? (
                'Processing...'
              ) : tab === 'signin' ? (
                <>
                  <LogIn size={16} /> Sign In to Contributor Portal
                </>
              ) : (
                <>
                  <UserCheck size={16} /> Verify & Activate Pioneer Profile
                </>
              )}
            </button>
          </form>

          {/* Quick Fill Test Accounts */}
          <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', marginBottom: 8, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Quick Test Profiles (Demo Candidates)
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleTestFill('kwame_signin')}
                style={{
                  flex: 1, minWidth: 140, background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
                  padding: '7px 10px', fontSize: 11.5, color: 'rgba(255,255,255,0.8)',
                  cursor: 'pointer', textAlign: 'center'
                }}
              >
                Kwame (Lvl 3 Sign In)
              </button>
              <button
                type="button"
                onClick={() => handleTestFill('chidubem_signup')}
                style={{
                  flex: 1, minWidth: 140, background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
                  padding: '7px 10px', fontSize: 11.5, color: 'rgba(255,255,255,0.8)',
                  cursor: 'pointer', textAlign: 'center'
                }}
              >
                Chidubem (Accepted Recruit)
              </button>
              <button
                type="button"
                onClick={() => handleTestFill('amina_signup')}
                style={{
                  flex: 1, minWidth: 140, background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
                  padding: '7px 10px', fontSize: 11.5, color: 'rgba(255,255,255,0.8)',
                  cursor: 'pointer', textAlign: 'center'
                }}
              >
                Amina (Accepted Recruit)
              </button>
            </div>
          </div>

          {/* Footer Assistance */}
          <div style={{ marginTop: 22, textAlign: 'center', fontSize: 12.5, color: 'rgba(255,255,255,0.55)' }}>
            Not yet applied to Refeir Pioneers?{' '}
            <button
              type="button"
              onClick={() => onNavigate('/#apply')}
              style={{
                background: 'none', border: 'none', color: RF_MINT_ACCENT,
                fontWeight: 600, cursor: 'pointer', textDecoration: 'underline'
              }}
            >
              Submit Application →
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
