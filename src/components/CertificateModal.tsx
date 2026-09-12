import React, { useState } from 'react';
import {
  Printer, Copy, Check, X
} from 'lucide-react';
import { PioneerCertificate } from '../lib/certificates';
import {
  RF_DEEP_GREEN,
  RF_LEAF_GREEN,
  RF_MINT_ACCENT
} from '../constants/brand';

interface CertificateModalProps {
  certificate: PioneerCertificate;
  isOpen: boolean;
  onClose: () => void;
}

// Authentic Embossed Golden Rosette Seal with Ribbon Tails
const OfficialSeal: React.FC = () => (
  <svg
    width="88"
    height="102"
    viewBox="0 0 100 115"
    style={{ display: 'block', margin: '0 auto', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.18))' }}
  >
    <defs>
      {/* Ribbon Gradient */}
      <linearGradient id="sealRibbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#C59A3F" />
        <stop offset="50%" stopColor="#E5C77A" />
        <stop offset="100%" stopColor="#8C6318" />
      </linearGradient>

      {/* Starburst Medallion Radial Gradient */}
      <radialGradient id="sealGoldRadial" cx="50%" cy="46%" r="52%">
        <stop offset="0%" stopColor="#FFF4BE" />
        <stop offset="35%" stopColor="#ECC260" />
        <stop offset="70%" stopColor="#B88728" />
        <stop offset="100%" stopColor="#784E0B" />
      </radialGradient>

      {/* Ring Linear Gradient */}
      <linearGradient id="sealRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF4BE" />
        <stop offset="50%" stopColor="#8F6317" />
        <stop offset="100%" stopColor="#ECC260" />
      </linearGradient>
    </defs>

    {/* Ribbon Tails hanging down behind */}
    <polygon
      points="37,60 25,108 37,98 49,108 43,60"
      fill="url(#sealRibbonGrad)"
      stroke="#6B4508"
      strokeWidth="0.5"
    />
    <polygon
      points="63,60 51,108 63,98 75,108 69,60"
      fill="url(#sealRibbonGrad)"
      stroke="#6B4508"
      strokeWidth="0.5"
    />

    {/* 32-Point Starburst / Rosette Medallion */}
    <polygon
      points="50,8 57.06,12.5 65.31,11.04 70.11,17.9 78.28,19.72 80.1,27.89 86.96,32.69 85.5,40.94 90,48 85.5,55.06 86.96,63.31 80.1,68.11 78.28,76.28 70.11,78.1 65.31,84.96 57.06,83.5 50,88 42.94,83.5 34.69,84.96 29.89,78.1 21.72,76.28 19.9,68.11 13.04,63.31 14.5,55.06 10,48 14.5,40.94 13.04,32.69 19.9,27.89 21.72,19.72 29.89,17.9 34.69,11.04 42.94,12.5"
      fill="url(#sealGoldRadial)"
      stroke="#6B4508"
      strokeWidth="0.75"
    />

    {/* Outer Concentric Beveled Ring */}
    <circle cx="50" cy="48" r="33.5" fill="none" stroke="#6B4508" strokeWidth="1" />
    <circle cx="50" cy="48" r="31.5" fill="none" stroke="url(#sealRingGrad)" strokeWidth="1.5" />

    {/* Beaded Stamped Ring */}
    <circle
      cx="50"
      cy="48"
      r="28"
      fill="none"
      stroke="#FFF8D6"
      strokeWidth="1.2"
      strokeDasharray="1.2,1.8"
    />

    {/* Deep Emerald Inner Core */}
    <circle cx="50" cy="48" r="22" fill="#0A321B" stroke="#D4AF37" strokeWidth="1.5" />

    {/* Center Refeir Emblem */}
    <image href="/Refeir-Favic-Symb.png" x="35" y="33" width="30" height="30" />
  </svg>
);

export const CertificateModal: React.FC<CertificateModalProps> = ({
  certificate,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/status?lookup=${encodeURIComponent(certificate.pioneer_id || certificate.recipient_email)}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const formattedDate = new Date(certificate.issued_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div
        style={{
          maxWidth: 900,
          width: '100%',
          margin: 'auto',
          background: '#0B2115',
          borderRadius: 20,
          border: '1px solid rgba(24, 252, 92, 0.25)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.95), 0 0 50px rgba(24, 252, 92, 0.08)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Control Bar (Non-Printable) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 22px',
            background: 'rgba(15, 46, 30, 0.95)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.08em',
                background: 'rgba(24, 252, 92, 0.12)',
                color: RF_MINT_ACCENT,
                border: `1px solid ${RF_LEAF_GREEN}55`,
                padding: '3px 10px',
                borderRadius: 100,
                textTransform: 'uppercase'
              }}
            >
              {certificate.status === 'ISSUED' ? 'Official Accreditation' : 'Revoked Certificate'}
            </span>
            <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'rgba(255,255,255,0.6)' }}>
              {certificate.id}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={handlePrint}
              style={{
                background: RF_LEAF_GREEN,
                color: RF_DEEP_GREEN,
                border: 'none',
                padding: '8px 16px',
                borderRadius: 100,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: `0 2px 10px ${RF_LEAF_GREEN}44`,
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = RF_MINT_ACCENT)}
              onMouseLeave={e => (e.currentTarget.style.background = RF_LEAF_GREEN)}
            >
              <Printer size={14} /> Print Certificate
            </button>

            <button
              onClick={handleCopyLink}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.18)',
                color: '#FFFFFF',
                padding: '8px 16px',
                borderRadius: 100,
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              {copied ? <Check size={14} color={RF_MINT_ACCENT} /> : <Copy size={14} />}
              {copied ? 'Verification Copied!' : 'Copy Verification'}
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: 'none',
                color: 'rgba(255,255,255,0.7)',
                width: 32,
                height: 32,
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Certificate Printable Canvas (White Paper Aesthetic) */}
        <div
          id="refeir-certificate-printable"
          style={{
            padding: '32px',
            background: '#FAF9F5',
            position: 'relative'
          }}
        >
          {/* Certificate Diplomatic Double Frame */}
          <div
            style={{
              background: '#FFFFFF',
              border: '2.5px solid #0D3E24',
              borderRadius: 12,
              padding: '6px',
              position: 'relative',
              boxShadow: '0 10px 35px rgba(0,0,0,0.1)'
            }}
          >
            {/* Inset Hairline Gold Frame */}
            <div
              style={{
                border: '1px solid #C59A3F',
                borderRadius: 8,
                padding: '42px 48px 30px',
                textAlign: 'center',
                position: 'relative',
                background: '#FFFFFF'
              }}
            >
              {/* Subtle Refeir Logo Watermark */}
              <img
                src="/Refeir-Favic-Symb.png"
                alt=""
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  height: 250,
                  width: 'auto',
                  opacity: 0.028,
                  pointerEvents: 'none',
                  userSelect: 'none'
                }}
              />

              {/* Actual Refeir Logo Header */}
              <div style={{ marginBottom: 18 }}>
                <img
                  src="/RefeirLogo.png"
                  alt="Refeir Logo"
                  style={{
                    height: 42,
                    width: 'auto',
                    display: 'block',
                    margin: '0 auto 10px'
                  }}
                />
                <div
                  style={{
                    fontSize: 10.5,
                    letterSpacing: '0.24em',
                    color: '#8C6D23',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    marginBottom: 10
                  }}
                >
                  Founding Pioneer Accreditation
                </div>
                <h1
                  style={{
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    fontSize: 28,
                    fontWeight: 700,
                    color: '#0A1C12',
                    margin: '0 0 8px',
                    letterSpacing: '0.02em'
                  }}
                >
                  Certificate of Level Completion
                </h1>
                <div
                  style={{
                    width: 72,
                    height: 1.5,
                    background: '#C59A3F',
                    margin: '0 auto',
                    opacity: 0.85
                  }}
                />
              </div>

              {/* Recipient Citation */}
              <p
                style={{
                  fontSize: 14,
                  color: '#556B5D',
                  margin: '0 0 8px',
                  fontStyle: 'italic',
                  fontFamily: 'Plus Jakarta Sans, sans-serif'
                }}
              >
                This certifies that
              </p>

              {/* Recipient Full Name */}
              <div
                style={{
                  fontSize: 35,
                  fontWeight: 700,
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  color: '#0A1C12',
                  letterSpacing: '0.01em',
                  marginBottom: 12
                }}
              >
                {certificate.recipient_name}
              </div>

              {/* Attainment Statement */}
              <p
                style={{
                  fontSize: 13.5,
                  color: '#374151',
                  margin: '0 auto 8px',
                  maxWidth: 600,
                  lineHeight: 1.6
                }}
              >
                has satisfied all verified proof-of-work criteria and is accredited with the sovereign rank of
              </p>

              {/* Level Title */}
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: '#0D4726',
                  letterSpacing: '0.04em',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  textTransform: 'uppercase',
                  marginBottom: 6
                }}
              >
                {certificate.level_title}
              </div>

              {/* Subtitle: Squad, Deliverables & ID */}
              <div
                style={{
                  fontSize: 12.5,
                  color: '#4B5563',
                  marginBottom: 28
                }}
              >
                {certificate.division} Squad • {certificate.verified_jobs_count > 0 ? `${certificate.verified_jobs_count} Verified Deliverables Delivered` : 'Orientation Completed'} • Pioneer ID: <strong style={{ color: '#0D4726' }}>{certificate.pioneer_id}</strong>
              </div>

              {/* Signatures & Seal Section */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto 1fr',
                  alignItems: 'flex-end',
                  gap: 20,
                  paddingTop: 16,
                  borderTop: '1px solid #E5E7EB',
                  maxWidth: 720,
                  margin: '0 auto'
                }}
              >
                {/* Left Signature: Founder */}
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                      fontSize: 22,
                      fontStyle: 'italic',
                      color: '#0D4726',
                      marginBottom: 4
                    }}
                  >
                    Tonye Taylor
                  </div>
                  <div
                    style={{
                      width: 140,
                      height: 1,
                      background: '#9CA3AF',
                      margin: '0 auto 6px'
                    }}
                  />
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>Tonye Taylor</div>
                  <div style={{ fontSize: 10.5, color: '#6B7280' }}>Platform Architect &amp; Founder</div>
                </div>

                {/* Center: Actual Golden Rosette Seal */}
                <div style={{ textAlign: 'center' }}>
                  <OfficialSeal />
                  <div style={{ fontSize: 9.5, color: '#6B7280', marginTop: 4, fontWeight: 600 }}>
                    Issued: {formattedDate}
                  </div>
                </div>

                {/* Right Signature: Admissions & Protocol Committee */}
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                      fontSize: 20,
                      fontStyle: 'italic',
                      color: '#0D4726',
                      marginBottom: 6
                    }}
                  >
                    Admissions Council
                  </div>
                  <div
                    style={{
                      width: 140,
                      height: 1,
                      background: '#9CA3AF',
                      margin: '0 auto 6px'
                    }}
                  />
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>Refeir Pioneer Council</div>
                  <div style={{ fontSize: 10.5, color: '#6B7280' }}>Sovereign Accreditation Board</div>
                </div>
              </div>

              {/* Discreet Verification Footer */}
              <div
                style={{
                  marginTop: 22,
                  paddingTop: 10,
                  borderTop: '1px solid #F3F4F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 8,
                  fontSize: 10,
                  color: '#9CA3AF'
                }}
              >
                <div>
                  Certificate ID: <strong style={{ color: '#374151' }}>{certificate.id}</strong>
                </div>
                <div style={{ fontFamily: 'monospace' }}>
                  Hash: <span style={{ color: '#0D4726' }}>{certificate.verification_hash.slice(0, 10)}...{certificate.verification_hash.slice(-8)}</span>
                </div>
                <div>
                  Refeir Sovereign Verified Credential
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .no-print {
            display: none !important;
          }
          #refeir-certificate-printable, #refeir-certificate-printable * {
            visibility: visible;
          }
          #refeir-certificate-printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 16px !important;
            background: #FFFFFF !important;
            color: #111827 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};
