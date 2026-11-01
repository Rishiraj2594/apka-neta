'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import IndiaMap from '@/components/map/IndiaMap'
import NationalLeadersBar from '@/components/map/NationalLeadersBar'
import { MapPin, Users, FileText, TrendingUp, Sparkles } from 'lucide-react'
import bhiwadiData from '@/data/bhiwadi.json'
import statesMetaRaw from '@/data/states-meta.json'
import { formatINR } from '@/lib/formatters'

export default function HomePage() {
  const router = useRouter()

  const [selectedStateSlug, setSelectedStateSlug] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [selectedCity, setSelectedCity] = useState('')

  const totalFundsTracked = bhiwadiData.tenders.reduce((acc, t) => acc + t.amount_inr, 0)

  const STATS = [
    { icon: Users, label: 'Representatives Tracked', value: `${bhiwadiData.representatives.length}`, sub: 'Bhiwadi (Local, MLA, MP)' },
    { icon: FileText, label: 'Public Tenders Listed', value: `${bhiwadiData.tenders.length}`, sub: 'BIDA & Nagar Parishad' },
    { icon: TrendingUp, label: 'Funds Tracked', value: formatINR(totalFundsTracked), sub: 'Across 3 Gov Schemes' },
    { icon: MapPin, label: 'Cities Live', value: '1', sub: 'Bhiwadi, Rajasthan' },
  ]

  // Find currently selected state metadata
  const currentStateMeta = useMemo(() => {
    return statesMetaRaw.states.find((s) => s.slug === selectedStateSlug)
  }, [selectedStateSlug])

  // Available districts for the selected state
  const availableDistricts = useMemo(() => {
    if (!currentStateMeta) return []
    // If Rajasthan, make sure Khairthal-Tijara / Alwar are prominent
    const dists = [...currentStateMeta.districts]
    if (currentStateMeta.slug === 'rajasthan' && !dists.includes('Khairthal-Tijara')) {
      dists.unshift('Khairthal-Tijara')
    }
    return dists
  }, [currentStateMeta])

  function handleLocationSelect(params: {
    stateSlug: string
    districtSlug?: string
    tehsilSlug?: string
    citySlug?: string
  }) {
    const parts = [params.stateSlug, params.districtSlug, params.citySlug].filter(Boolean)
    router.push('/' + parts.join('/'))
  }

  function handleStateDropdownChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const slug = e.target.value
    setSelectedStateSlug(slug)
    const meta = statesMetaRaw.states.find((s) => s.slug === slug)
    if (meta && meta.districts.length > 0) {
      if (slug === 'rajasthan') {
        setSelectedDistrict('Khairthal-Tijara')
        setSelectedCity('bhiwadi')
      } else {
        setSelectedDistrict(meta.districts[0])
        setSelectedCity('')
      }
    } else {
      setSelectedDistrict('')
      setSelectedCity('')
    }
  }

  function handleDistrictDropdownChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const dist = e.target.value
    setSelectedDistrict(dist)
    if (dist === 'Khairthal-Tijara' || dist === 'Alwar') {
      setSelectedCity('bhiwadi')
    } else {
      setSelectedCity('')
    }
  }

  const isBhiwadiSelected =
    selectedStateSlug === 'rajasthan' &&
    (selectedDistrict === 'Khairthal-Tijara' || selectedDistrict === 'Alwar')

  return (
    <div className="space-y-10">
      {/* ── Hero ── */}
      <section className="text-center pt-6 pb-2 space-y-3">
        <div
          className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-1"
          style={{ background: 'rgba(244,161,24,0.12)', color: '#C4790A', border: '1px solid rgba(244,161,24,0.25)' }}
        >
          🇮🇳 Live Across All 36 States & UTs · Pilot in Bhiwadi, Rajasthan
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Know Your <span style={{ color: 'var(--saffron)' }}>Elected Representatives</span>
        </h1>
        <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
          Hover and click on any state across India to inspect its districts, real boundaries, public works tenders, and fund utilization.
        </p>
      </section>

      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="glass-card p-4 flex flex-col items-center text-center gap-1"
          >
            <s.icon className="w-5 h-5 mb-1" style={{ color: 'var(--saffron)' }} />
            <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
            <div className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            <div className="text-[10px]" style={{ color: 'var(--saffron-dark)', opacity: 0.7 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Main Two-Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              🗺️ Interactive India & District Map
            </h2>
            <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              36 States & UTs Active
            </span>
          </div>
          {/* Executive Leadership of India Bar on Top */}
          <NationalLeadersBar />
          <IndiaMap
            onLocationSelect={handleLocationSelect}
            selectedStateSlug={selectedStateSlug}
            selectedDistrict={selectedDistrict}
            onStateChange={(slug) => {
              if (!slug) {
                setSelectedStateSlug('')
                setSelectedDistrict('')
                setSelectedCity('')
                return
              }
              setSelectedStateSlug(slug)
              if (slug === 'rajasthan') {
                setSelectedDistrict('Khairthal-Tijara')
                setSelectedCity('bhiwadi')
              } else {
                const meta = statesMetaRaw.states.find((s) => s.slug === slug)
                if (meta && meta.districts.length > 0) {
                  setSelectedDistrict(meta.districts[0])
                }
                setSelectedCity('')
              }
            }}
            onDistrictChange={(distName) => {
              setSelectedDistrict(distName)
              if (distName === 'Alwar' || distName === 'Khairthal-Tijara') {
                setSelectedCity('bhiwadi')
              } else {
                setSelectedCity('')
              }
            }}
          />
        </div>

        {/* Dropdown + Info Column */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold px-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            📋 Or Select Directly
          </h2>
          <div className="glass-card p-5 space-y-4">
            <div className="space-y-3">
              {/* State Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    State / Union Territory
                  </label>
                  <span className="text-[10px] text-amber-700 font-medium">
                    {statesMetaRaw.states.length} available
                  </span>
                </div>
                <select
                  className="w-full px-3 py-2.5 rounded-xl text-sm font-medium border outline-none transition-all cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.8)', borderColor: 'rgba(244,161,24,0.3)', color: 'var(--text-primary)' }}
                  value={selectedStateSlug}
                  onChange={handleStateDropdownChange}
                >
                  <option value="">-- All India Overview --</option>
                  {statesMetaRaw.states.map((st) => (
                    <option key={st.slug} value={st.slug}>
                      {st.name} {st.hasPilot ? '✓ (Pilot Live)' : `(${st.districtsCount} Districts)`}
                    </option>
                  ))}
                </select>
              </div>

              {/* District Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>District</label>
                  <span className="text-[10px] text-amber-700 font-medium">
                    {availableDistricts.length} districts in {currentStateMeta?.name}
                  </span>
                </div>
                <select
                  className="w-full px-3 py-2.5 rounded-xl text-sm font-medium border outline-none transition-all cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.8)', borderColor: 'rgba(244,161,24,0.3)', color: 'var(--text-primary)' }}
                  value={selectedDistrict}
                  onChange={handleDistrictDropdownChange}
                >
                  {availableDistricts.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist} {dist === 'Khairthal-Tijara' || dist === 'Alwar' ? '✓ (Bhiwadi Active)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* City / Town Dropdown */}
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>City / Town</label>
                <select
                  className="w-full px-3 py-2.5 rounded-xl text-sm font-medium border outline-none transition-all cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.8)', borderColor: 'rgba(244,161,24,0.3)', color: 'var(--text-primary)' }}
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  {isBhiwadiSelected ? (
                    <option value="bhiwadi">Bhiwadi ✓ Live (Nagar Parishad + BIDA + RIICO)</option>
                  ) : (
                    <option value="">Civic tracking coming soon for this district</option>
                  )}
                </select>
              </div>
            </div>

            {isBhiwadiSelected ? (
              <button
                onClick={() => router.push('/rajasthan/khairthal-tijara/bhiwadi')}
                className="w-full py-3 rounded-xl font-semibold text-sm text-white shadow-md transition-all active:scale-95 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #F4A118 0%, #C4790A 100%)', boxShadow: '0 4px 14px rgba(244,161,24,0.35)' }}
              >
                View Bhiwadi Dashboard →
              </button>
            ) : (
              <div
                className="p-3.5 rounded-xl border space-y-2 text-center"
                style={{ background: 'rgba(254, 243, 199, 0.45)', borderColor: 'rgba(245, 158, 11, 0.3)' }}
              >
                <p className="text-xs font-semibold text-amber-950">
                  {selectedDistrict}, {currentStateMeta?.name}
                </p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Real administrative boundaries are active. Full representative scorecards and public tenders are being onboarded.
                </p>
                <button
                  onClick={() => router.push('/rajasthan/khairthal-tijara/bhiwadi')}
                  className="text-xs font-semibold text-amber-900 underline hover:text-amber-950 cursor-pointer"
                >
                  Or explore the live pilot in Bhiwadi, Rajasthan →
                </button>
              </div>
            )}
          </div>

          {/* What you'll find */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
              <Sparkles className="w-4 h-4 text-amber-600" /> What you'll find on ApkaNeta
            </h3>
            <ul className="space-y-2">
              {[
                ['🗺️', 'Geographic drilldown for all 36 Indian states & union territories'],
                ['👤', 'Representative profiles (Nagar Parishad Chairman, MLA, MP)'],
                ['📜', 'Manifesto promises with official evidence audit trail'],
                ['🏗️', 'Public works tenders (BIDA, RIICO, LSG Rajasthan)'],
                ['💰', 'Fund allocation vs. actual spend analytics'],
              ].map(([icon, text]) => (
                <li key={text} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span className="text-sm">{icon}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
