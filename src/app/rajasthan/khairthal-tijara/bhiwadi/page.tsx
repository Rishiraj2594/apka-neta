'use client'

import { useState } from 'react'
import {
  ChevronRight,
  Building2,
  Landmark,
  Flag,
  MapPin,
  Phone,
  Mail,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Compass,
  Filter,
} from 'lucide-react'
import Link from 'next/link'
import data from '@/data/bhiwadi.json'
import type { Representative, Tender, Authority, PromiseStatus, TenderStatus } from '@/types'
import { formatINR } from '@/lib/formatters'

// ─── Status helpers ────────────────────────────────────────────────────────────

const PROMISE_STATUS: Record<
  PromiseStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  delivered:   { label: 'Delivered',        color: '#16A34A', bg: '#F0FDF4', icon: CheckCircle2 },
  inProgress:  { label: 'In Progress',      color: '#D97706', bg: '#FFFBEB', icon: Clock        },
  underReview: { label: 'Under Review',      color: '#6366F1', bg: '#EEF2FF', icon: AlertCircle  },
  notStarted:  { label: 'No Sanction Found', color: '#9CA3AF', bg: '#F9FAFB', icon: HelpCircle   },
}

const TENDER_STATUS: Record<TenderStatus, { label: string; color: string; bg: string }> = {
  floated:   { label: 'Tender Floated',  color: '#6366F1', bg: '#EEF2FF' },
  awarded:   { label: 'Awarded',         color: '#0891B2', bg: '#ECFEFF' },
  wip:       { label: 'Work in Progress',color: '#D97706', bg: '#FFFBEB' },
  completed: { label: 'Completed',       color: '#16A34A', bg: '#F0FDF4' },
  delayed:   { label: 'Delayed',         color: '#DC2626', bg: '#FEF2F2' },
}

const TIER_META = {
  local:    { icon: Building2, label: 'Municipal Board', color: '#0891B2' },
  state:    { icon: Landmark,  label: 'State MLA',       color: '#7C3AED' },
  national: { icon: Flag,      label: 'National MP',     color: '#DC2626' },
}

const FUND_TAG: Record<string, { label: string; color: string }> = {
  departmental: { label: 'Dept. Budget', color: '#0891B2' },
  mlalad:       { label: 'MLALAD Fund',  color: '#7C3AED' },
  mplad:        { label: 'MPLAD Fund',   color: '#DC2626' },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FundBar({
  allocated,
  sanctioned,
  disbursed,
}: {
  allocated: number
  sanctioned: number
  disbursed: number
}) {
  const pctSanctioned = Math.round((sanctioned / allocated) * 100)
  const pctDisbursed  = Math.round((disbursed  / allocated) * 100)
  return (
    <div className="space-y-2 mt-3">
      <div className="flex justify-between text-xs" style={{ color: '#78716C' }}>
        <span>Allocated: <strong>{formatINR(allocated)}</strong></span>
        <span>Disbursed: <strong style={{ color: '#16A34A' }}>{formatINR(disbursed)}</strong></span>
      </div>
      <div className="relative h-2 rounded-full overflow-hidden" style={{ background: '#E8DCC8' }}>
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all"
          style={{ width: `${pctSanctioned}%`, background: '#F4C870' }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all"
          style={{ width: `${pctDisbursed}%`, background: '#F4A118' }}
        />
      </div>
      <div className="flex gap-4 text-[10px]" style={{ color: '#78716C' }}>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#F4C870' }} />
          Sanctioned {pctSanctioned}%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#F4A118' }} />
          Spent {pctDisbursed}%
        </span>
      </div>
    </div>
  )
}

function RepCard({ rep }: { rep: Representative }) {
  const tier = TIER_META[rep.tier]
  const TierIcon = tier.icon
  return (
    <div className="glass-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div
          className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xl font-bold shadow"
          style={{ background: `linear-gradient(135deg, ${tier.color}CC, ${tier.color})` }}
        >
          {rep.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{ background: `${tier.color}18`, color: tier.color }}
            >
              <TierIcon className="w-3 h-3" />
              {tier.label}
            </span>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: `${rep.party_color}18`, color: rep.party_color }}
            >
              {rep.party}
            </span>
          </div>
          <h3 className="font-bold text-base mt-1 leading-tight" style={{ color: '#1A1208' }}>
            {rep.myneta?.profile_url ? (
              <a
                href={rep.myneta.profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline hover:text-amber-700 inline-flex items-center gap-1.5 group/link"
                title={
                  rep.tier === 'local'
                    ? `Click to view ${rep.name}'s official SEC Rajasthan nomination affidavit PDF`
                    : `Click to view ${rep.name}'s official election affidavit and assets on MyNeta`
                }
              >
                <span>{rep.name}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover/link:opacity-100 text-amber-600 transition-opacity" />
              </a>
            ) : (
              rep.name
            )}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: '#78716C' }}>{rep.designation}</p>
          <p className="text-xs" style={{ color: '#78716C' }}>{rep.constituency}</p>
          <p className="text-[11px] mt-0.5" style={{ color: '#C4790A' }}>
            Term: {rep.term_start} – {rep.term_end}
          </p>
        </div>
      </div>

      {/* MyNeta / ADR Transparency Scorecard */}
      {rep.myneta && (
        <div
          className="p-3 rounded-xl space-y-2"
          style={{
            background: 'rgba(254, 243, 199, 0.55)',
            border: '1px solid rgba(245, 158, 11, 0.28)',
          }}
        >
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              {rep.tier === 'local' ? 'SEC Rajasthan Disclosure' : 'MyNeta / ADR Scorecard'}
            </span>
            <a
              href={rep.myneta.profile_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-bold text-amber-800 hover:text-amber-950 underline inline-flex items-center gap-0.5"
            >
              {rep.tier === 'local' ? 'View SEC Affidavit PDF ↗' : 'View MyNeta Affidavit ↗'}
            </a>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center">
            {/* Criminal Cases */}
            <div className="p-1.5 rounded-lg bg-white/85 border border-amber-200/60 shadow-xs">
              <p className="text-[9px] uppercase text-stone-500 font-semibold">Cases</p>
              <p
                className={`text-xs font-bold ${
                  rep.myneta.criminal_cases === 0 ? 'text-emerald-700' : 'text-amber-800'
                }`}
              >
                {rep.myneta.criminal_cases === 0 ? '0 (Clean)' : `${rep.myneta.criminal_cases} Case`}
              </p>
            </div>

            {/* Declared Assets */}
            <div className="p-1.5 rounded-lg bg-white/85 border border-amber-200/60 shadow-xs">
              <p className="text-[9px] uppercase text-stone-500 font-semibold">Assets</p>
              <p className="text-xs font-bold text-stone-900">
                {formatINR(rep.myneta.declared_assets_inr)}
              </p>
            </div>

            {/* Education */}
            <div className="p-1.5 rounded-lg bg-white/85 border border-amber-200/60 shadow-xs">
              <p className="text-[9px] uppercase text-stone-500 font-semibold">Education</p>
              <p className="text-xs font-bold text-stone-900 truncate" title={rep.myneta.education}>
                {rep.myneta.education.split(' ')[0]}
              </p>
            </div>
          </div>

          <p className="text-[9px] text-stone-500 text-center italic">
            Source: {rep.myneta.source_label}
          </p>
        </div>
      )}

      {/* Contact */}
      <div className="flex flex-wrap gap-3 text-xs" style={{ color: '#78716C' }}>
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-amber-500" />
          {rep.contact.office}
        </span>
        {rep.contact.phone && (
          <span className="flex items-center gap-1">
            <Phone className="w-3 h-3 text-amber-500" />
            {rep.contact.phone}
          </span>
        )}
        {rep.contact.email && (
          <span className="flex items-center gap-1">
            <Mail className="w-3 h-3 text-amber-500" />
            {rep.contact.email}
          </span>
        )}
      </div>

      {/* Fund bar */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: '#78716C' }}>
          {rep.funds.scheme}
        </p>
        <FundBar
          allocated={rep.funds.allocated_inr}
          sanctioned={rep.funds.sanctioned_inr}
          disbursed={rep.funds.disbursed_inr}
        />
      </div>

      {/* Promises */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: '#78716C' }}>
          Promises & Manifesto
        </p>
        <div className="space-y-2">
          {rep.promises.map((p) => {
            const s = PROMISE_STATUS[p.status as PromiseStatus]
            const SIcon = s.icon
            return (
              <div key={p.id} className="rounded-xl p-3 flex items-start gap-2.5" style={{ background: s.bg }}>
                <SIcon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: s.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium leading-snug" style={{ color: '#1A1208' }}>
                    {p.title}
                  </p>
                  <p className="text-[10px] mt-0.5 font-semibold" style={{ color: s.color }}>
                    {s.label}
                  </p>
                  {p.evidence && (
                    <p className="text-[10px] mt-1 leading-snug" style={{ color: '#78716C' }}>
                      📎 {p.evidence}
                      {p.source_url && (
                        <a
                          href={p.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1 inline-flex items-center gap-0.5"
                          style={{ color: '#F4A118' }}
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </p>
                  )}
                  <span
                    className="inline-block text-[10px] px-1.5 py-0.5 rounded-full mt-1"
                    style={{ background: 'rgba(0,0,0,0.05)', color: '#78716C' }}
                  >
                    {p.category}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function AuthorityCard({ authority }: { authority: Authority }) {
  return (
    <div className="glass-card p-5 space-y-3.5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl p-2 rounded-xl" style={{ background: 'rgba(244,161,24,0.1)' }}>
            {authority.icon}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base" style={{ color: '#1A1208' }}>
                {authority.short_name}
              </h3>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: `${authority.badge_color}14`, color: authority.badge_color }}
              >
                {authority.type}
              </span>
            </div>
            <p className="text-xs font-medium leading-tight mt-0.5" style={{ color: '#78716C' }}>
              {authority.full_name}
            </p>
          </div>
        </div>
      </div>

      {/* Jurisdiction Scope */}
      <div className="p-2.5 rounded-xl text-xs" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)' }}>
        <p className="text-[10px] uppercase font-bold tracking-wide text-amber-900 mb-1">
          📍 Jurisdiction Area:
        </p>
        <p className="leading-snug" style={{ color: '#44403C' }}>
          {authority.jurisdiction_scope}
        </p>
      </div>

      {/* Key Responsibilities */}
      <div>
        <p className="text-[10px] uppercase font-bold tracking-wide text-amber-900 mb-1.5">
          ⚙️ What This Body Handles:
        </p>
        <ul className="space-y-1">
          {authority.responsibilities.map((r) => (
            <li key={r} className="text-xs flex items-start gap-1.5 text-stone-600">
              <span className="text-amber-500 font-bold">•</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Official Contact */}
      <div className="pt-2 border-t text-xs flex flex-wrap gap-x-4 gap-y-1.5" style={{ borderColor: 'rgba(244,161,24,0.15)', color: '#78716C' }}>
        <span>👤 {authority.head_official.designation}: <strong style={{ color: '#1A1208' }}>{authority.head_official.name}</strong></span>
        <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-amber-600" />{authority.head_official.phone}</span>
        {authority.head_official.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-amber-600" />{authority.head_official.email}</span>}
      </div>
    </div>
  )
}

function TenderRow({ tender }: { tender: Tender }) {
  const s = TENDER_STATUS[tender.status as TenderStatus]
  const fund = FUND_TAG[tender.fund_type] || { label: tender.fund_label, color: '#0891B2' }

  // Authority badge icon & name
  const authorityBadge = (() => {
    if (tender.authority_id === 'bida') return { label: 'BIDA', icon: '🏗️', color: '#D97706' }
    if (tender.authority_id === 'riico') return { label: 'RIICO', icon: '🏭', color: '#0284C7' }
    if (tender.authority_id === 'nagar-parishad') return { label: 'Nagar Parishad', icon: '🏘️', color: '#16A34A' }
    return null
  })()

  return (
    <div className="glass-card p-4 space-y-2 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <p className="text-sm font-semibold leading-snug flex-1" style={{ color: '#1A1208' }}>
          {tender.title}
        </p>
        <span className="text-xs font-bold flex-shrink-0" style={{ color: '#F4A118' }}>
          {formatINR(tender.amount_inr)}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        {authorityBadge && (
          <span
            className="text-[11px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"
            style={{ background: `${authorityBadge.color}15`, color: authorityBadge.color, border: `1px solid ${authorityBadge.color}30` }}
          >
            <span>{authorityBadge.icon}</span>
            <span>{authorityBadge.label}</span>
          </span>
        )}
        <span
          className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
          style={{ background: s.bg, color: s.color }}
        >
          {s.label}
        </span>
        <span
          className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
          style={{ background: `${fund.color}14`, color: fund.color }}
        >
          {fund.label}
        </span>
        <span
          className="text-[11px] px-2 py-0.5 rounded-full"
          style={{ background: '#F4F4F4', color: '#78716C' }}
        >
          {tender.category}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-xs" style={{ color: '#78716C' }}>
        <span>Dept: <strong style={{ color: '#1A1208' }}>{tender.department}</strong></span>
        <span>Contractor: <strong style={{ color: '#1A1208' }}>{tender.contractor_name}</strong></span>
        <span>Awarded: {tender.awarded_date}</span>
        <span>Target: {tender.target_date}</span>
        {tender.ward && <span>Ward: <strong>{tender.ward}</strong></span>}
      </div>
      {tender.source_url && (
        <a
          href={tender.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] inline-flex items-center gap-1 font-medium"
          style={{ color: '#F4A118' }}
        >
          <ExternalLink className="w-3 h-3" /> View on sppp.rajasthan.gov.in
        </a>
      )}
    </div>
  )
}

// ─── Main Page Component ───────────────────────────────────────────────────────

export default function BhiwadiPage() {
  const reps = data.representatives as Representative[]
  const tenders = data.tenders as Tender[]
  const authorities = (data.authorities || []) as Authority[]

  const [activeAuthorityFilter, setActiveAuthorityFilter] = useState<string>('all')

  const totalSpend = tenders.reduce((s, t) => s + t.amount_inr, 0)
  const completed = tenders.filter((t) => t.status === 'completed').length
  const delayed = tenders.filter((t) => t.status === 'delayed').length

  // Filtered tenders based on user selection
  const filteredTenders =
    activeAuthorityFilter === 'all'
      ? tenders
      : tenders.filter((t) => t.authority_id === activeAuthorityFilter)

  const filteredSpend = filteredTenders.reduce((s, t) => s + t.amount_inr, 0)

  return (
    <div className="space-y-8">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-1.5 text-xs flex-wrap" style={{ color: '#78716C' }}>
        {[
          ['India', '/'],
          ['Rajasthan', '/rajasthan'],
          ['Khairthal-Tijara', '/rajasthan/khairthal-tijara'],
          ['Bhiwadi', ''],
        ].map(([label, href], i, arr) => (
          <span key={label} className="flex items-center gap-1.5">
            {href ? (
              <Link href={href} className="hover:underline font-medium" style={{ color: '#C4790A' }}>
                {label}
              </Link>
            ) : (
              <span className="font-semibold" style={{ color: '#1A1208' }}>
                {label}
              </span>
            )}
            {i < arr.length - 1 && <ChevronRight className="w-3 h-3 opacity-50" />}
          </span>
        ))}
      </nav>

      {/* ── City Header ── */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 flex-wrap">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow"
            style={{ background: 'linear-gradient(135deg, #F4A118 0%, #C4790A 100%)' }}
          >
            🏙️
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1A1208' }}>
              Bhiwadi
            </h1>
            <p className="text-sm" style={{ color: '#78716C' }}>
              Khairthal-Tijara District · Tijara Tehsil · Rajasthan · NCR Region · 60 Wards
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          {[
            { label: 'Total Works Budget', value: formatINR(totalSpend), icon: '💰' },
            { label: 'Projects Tracked', value: `${tenders.length}`, icon: '🏗️' },
            { label: 'Completed', value: `${completed}`, icon: '✅' },
            { label: 'Delayed', value: `${delayed}`, icon: '⚠️' },
          ].map((s) => (
            <div
              key={s.label}
              className="text-center p-3 rounded-xl"
              style={{ background: 'rgba(244,161,24,0.07)' }}
            >
              <div className="text-xl">{s.icon}</div>
              <div className="text-lg font-bold mt-1" style={{ color: '#1A1208' }}>
                {s.value}
              </div>
              <div className="text-[11px]" style={{ color: '#78716C' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3-Tier Representatives ── */}
      <section>
        <h2 className="text-base font-bold mb-3 flex items-center gap-2" style={{ color: '#1A1208' }}>
          <span>👤</span> Your Elected Representatives
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {reps.map((rep) => (
            <RepCard key={rep.id} rep={rep} />
          ))}
        </div>
      </section>

      {/* ── Civic Bodies & Authorities (BIDA, RIICO, Nagar Parishad, RSPCB) ── */}
      <section>
        <div className="mb-3">
          <h2 className="text-base font-bold flex items-center gap-2" style={{ color: '#1A1208' }}>
            <span>🏛️</span> Governing Bodies & Industrial Authorities
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            Bhiwadi’s development is split between Regional Authorities (BIDA), Industrial Agencies (RIICO), Municipal Boards, and Pollution Monitors (RSPCB).
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {authorities.map((auth) => (
            <AuthorityCard key={auth.id} authority={auth} />
          ))}
        </div>
      </section>

      {/* ── "Who Solves What?" Citizen Helper Guide ── */}
      <section className="glass-card p-5 border-amber-300">
        <h3 className="text-sm font-bold flex items-center gap-2 mb-2 text-amber-950">
          <Compass className="w-4 h-4 text-amber-600" /> Who Do I Contact for Common Issues in Bhiwadi?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-white/70 border border-amber-200">
            <span className="font-bold text-amber-900 block mb-1">🌊 Highway & Regional Flood</span>
            <p className="text-stone-600 mb-1.5 leading-snug">Inter-state waterlogging on NH-919 or bypass drains</p>
            <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-amber-100 text-amber-800">
              🏗️ BIDA (01493-220055)
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white/70 border border-sky-200">
            <span className="font-bold text-sky-900 block mb-1">🏭 Industrial Area Roads</span>
            <p className="text-stone-600 mb-1.5 leading-snug">Roads, lights & water inside RIICO Phases 1-4, Chopanki</p>
            <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-sky-100 text-sky-800">
              🏭 RIICO (01493-221226)
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white/70 border border-emerald-200">
            <span className="font-bold text-emerald-900 block mb-1">🗑️ Colony Waste & Lights</span>
            <p className="text-stone-600 mb-1.5 leading-snug">Door-to-door garbage, sector parks & ward CC roads</p>
            <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
              🏘️ Nagar Parishad (01493-220138)
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white/70 border border-purple-200">
            <span className="font-bold text-purple-900 block mb-1">🌿 Chemical Stench & Air</span>
            <p className="text-stone-600 mb-1.5 leading-snug">Factory toxic smoke, black effluent & AQI violations</p>
            <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-purple-100 text-purple-800">
              🌿 RSPCB (01493-220412)
            </span>
          </div>
        </div>
      </section>

      {/* ── Public Works & Tenders with Authority Filters ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2" style={{ color: '#1A1208' }}>
              <span>🏗️</span> Public Works & Construction Tenders
            </h2>
            <p className="text-xs" style={{ color: '#78716C' }}>
              Sanctioned budgets, awarded contractors, and execution status from Rajasthan SPPP
            </p>
          </div>

          <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
            Showing: <strong>{formatINR(filteredSpend)}</strong> ({filteredTenders.length} works)
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="font-medium flex items-center gap-1 text-stone-500 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter by Body:
          </span>

          <button
            onClick={() => setActiveAuthorityFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeAuthorityFilter === 'all'
                ? 'bg-amber-500 text-white shadow'
                : 'bg-white/80 border border-amber-200 text-stone-700 hover:bg-amber-50'
            }`}
          >
            All Works ({tenders.length})
          </button>

          <button
            onClick={() => setActiveAuthorityFilter('bida')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
              activeAuthorityFilter === 'bida'
                ? 'bg-amber-500 text-white shadow'
                : 'bg-white/80 border border-amber-200 text-stone-700 hover:bg-amber-50'
            }`}
          >
            <span>🏗️</span> BIDA ({tenders.filter((t) => t.authority_id === 'bida').length})
          </button>

          <button
            onClick={() => setActiveAuthorityFilter('riico')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
              activeAuthorityFilter === 'riico'
                ? 'bg-amber-500 text-white shadow'
                : 'bg-white/80 border border-amber-200 text-stone-700 hover:bg-amber-50'
            }`}
          >
            <span>🏭</span> RIICO ({tenders.filter((t) => t.authority_id === 'riico').length})
          </button>

          <button
            onClick={() => setActiveAuthorityFilter('nagar-parishad')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
              activeAuthorityFilter === 'nagar-parishad'
                ? 'bg-amber-500 text-white shadow'
                : 'bg-white/80 border border-amber-200 text-stone-700 hover:bg-amber-50'
            }`}
          >
            <span>🏘️</span> Nagar Parishad ({tenders.filter((t) => t.authority_id === 'nagar-parishad').length})
          </button>
        </div>

        {/* Tenders List */}
        <div className="space-y-3">
          {filteredTenders.length === 0 ? (
            <div className="glass-card p-8 text-center text-stone-500 text-xs">
              No tenders found for this authority filter.
            </div>
          ) : (
            filteredTenders.map((tender) => <TenderRow key={tender.id} tender={tender} />)
          )}
        </div>
      </section>

      {/* ── Contractor Analytics ── */}
      <section>
        <h2 className="text-base font-bold mb-3 flex items-center gap-2" style={{ color: '#1A1208' }}>
          <span>
            <TrendingUp className="w-4 h-4 inline" />
          </span>{' '}
          Contractor Analytics
        </h2>
        <div className="glass-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#78716C' }}>
            Top vendors by total awarded value across BIDA, RIICO, and Nagar Parishad
          </p>
          <div className="space-y-3">
            {data.contractors
              .sort((a, b) => b.total_value_inr - a.total_value_inr)
              .map((c, idx) => {
                const maxVal = data.contractors[0].total_value_inr
                const pct = Math.round((c.total_value_inr / maxVal) * 100)
                return (
                  <div key={c.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium" style={{ color: '#1A1208' }}>
                        {idx + 1}. {c.name}
                      </span>
                      <span style={{ color: '#F4A118' }} className="font-bold">
                        {formatINR(c.total_value_inr)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#E8DCC8' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: 'linear-gradient(90deg, #F4A118, #C4790A)',
                        }}
                      />
                    </div>
                    <p className="text-[10px]" style={{ color: '#78716C' }}>
                      {c.total_contracts} contract{c.total_contracts > 1 ? 's' : ''}
                    </p>
                  </div>
                )
              })}
          </div>
        </div>
      </section>
    </div>
  )
}
