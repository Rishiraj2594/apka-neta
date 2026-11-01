'use client'

import { useState, useMemo, useEffect } from 'react'
import * as topojson from 'topojson-client'
import { geoMercator, geoPath } from 'd3-geo'
import Image from 'next/image'
import {
  ChevronRight,
  ArrowLeft,
  MapPin,
  Sparkles,
  Loader2,
  CheckCircle2,
  ExternalLink,
  AlertTriangle,
  Scale,
  ShieldCheck,
  Flame,
} from 'lucide-react'

// Import pre-processed, accurate India state boundary TopoJSON (Zero network delay)
import indiaTopoRaw from '../../../public/topojson/india-merged-states.json'
import statesMetaRaw from '@/data/states-meta.json'
import chiefMinistersRaw from '@/data/chief-ministers.json'
import rajasthanMpsRaw from '@/data/mps-rajasthan.json'
import allDistrictMpsRaw from '@/data/all-district-mps.json'

// ─── Color Palette (Saffron & Warm Civic Theme) ─────────────────────────────────
const COLORS = {
  default: '#F3EAD8',
  defaultBorder: '#C99A45',
  hover: '#F5BE58',
  hoverBorder: '#9A5C00',
  rajasthan: '#FCD88A',
  alwar: '#F59E0B',
  active: '#D97706',
}

interface PathItem {
  name: string
  d: string
  centroid: [number, number]
}

interface TehsilInfo {
  id: string
  name: string
  slug: string
  hasCivicData: boolean
  city?: string
  citySlug?: string
  representative?: {
    name: string
    title: string
    party: string
    partyColor: string
    photo: string
  }
}

const ALWAR_TEHSILS: TehsilInfo[] = [
  {
    id: 'TJ',
    name: 'Tijara (Bhiwadi AC)',
    slug: 'tijara',
    hasCivicData: true,
    city: 'Bhiwadi',
    citySlug: 'bhiwadi',
    representative: {
      name: 'Mahant Balaknath',
      title: 'MLA, Tijara Vidhan Sabha',
      party: 'BJP',
      partyColor: '#FF6B00',
      photo: '/images/leaders/mla_balaknath.jpg',
    },
  },
  { id: 'AL', name: 'Alwar City', slug: 'alwar-city', hasCivicData: false },
  { id: 'BH', name: 'Behror', slug: 'behror', hasCivicData: false },
  { id: 'KO', name: 'Kotkasim', slug: 'kotkasim', hasCivicData: false },
  { id: 'RJ', name: 'Rajgarh', slug: 'rajgarh', hasCivicData: false },
  { id: 'ND', name: 'Neemrana', slug: 'neemrana', hasCivicData: false },
  { id: 'MU', name: 'Mundawar', slug: 'mundawar', hasCivicData: false },
]

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

type DrillLevel = 'india' | 'state' | 'district'

interface DrillState {
  level: DrillLevel
  stateName: string | null
  stateSlug: string | null
  districtName: string | null
}

interface IndiaMapProps {
  onLocationSelect: (params: {
    state: string
    stateSlug: string
    district?: string
    districtSlug?: string
    tehsil?: string
    tehsilSlug?: string
    city?: string
    citySlug?: string
  }) => void
  selectedStateSlug?: string
  selectedDistrict?: string
  onStateChange?: (stateSlug: string, stateName: string) => void
  onDistrictChange?: (districtName: string) => void
}

export default function IndiaMap({
  onLocationSelect,
  selectedStateSlug,
  selectedDistrict,
  onStateChange,
  onDistrictChange,
}: IndiaMapProps) {
  const [drill, setDrill] = useState<DrillState>({
    level: 'india',
    stateName: null,
    stateSlug: null,
    districtName: null,
  })

  const [hoveredName, setHoveredName] = useState<string | null>(null)
  const [selectedTehsil, setSelectedTehsil] = useState<string | null>('TJ')
  const [tooltip, setTooltip] = useState<{
    name: string
    x: number
    y: number
    tag: string | null
    subtag?: string | null
  } | null>(null)

  const [stateDistrictsMap, setStateDistrictsMap] = useState<Record<string, any>>({})
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false)
  const [districtPaths, setDistrictPaths] = useState<PathItem[]>([])
  const [otherDistrictSelected, setOtherDistrictSelected] = useState<{
    name: string
    stateName: string
    mpInfo?: any
    requested?: boolean
  } | null>(null)

  const [heatmapMode, setHeatmapMode] = useState<'civic' | 'crime'>('crime')

  // Helper to retrieve official MP data (cases, conviction, assets) for any district
  function getDistrictMp(stateName: string, districtName: string) {
    const byState = (allDistrictMpsRaw.byStateDistrict as Record<string, Record<string, any>>)[stateName]
    if (byState && byState[districtName]) {
      return byState[districtName]
    }
    const byDistrict = (allDistrictMpsRaw.byDistrict as Record<string, any>)[districtName]
    if (byDistrict) return byDistrict

    const rajasthan = (rajasthanMpsRaw as Record<string, any>)[districtName]
    if (rajasthan) return rajasthan

    return null
  }

  // Map state metadata for quick lookup
  const statesMetaLookup = useMemo(() => {
    const map = new Map<string, (typeof statesMetaRaw.states)[0]>()
    statesMetaRaw.states.forEach((s) => {
      map.set(s.name.toLowerCase(), s)
      map.set(s.slug, s)
    })
    return map
  }, [])

  // ─── Convert India TopoJSON to GeoJSON features with projected SVG paths ───────
  const indiaPaths = useMemo<PathItem[]>(() => {
    try {
      const topo = indiaTopoRaw as any
      const geo = topojson.feature(topo, topo.objects.states) as any
      const projection = geoMercator().fitExtent([[15, 15], [485, 535]], geo)
      const pathGen = geoPath().projection(projection)

      return geo.features.map((feat: any): PathItem => {
        const centroid = pathGen.centroid(feat) as [number, number]
        const validCentroid: [number, number] =
          centroid && !isNaN(centroid[0]) && !isNaN(centroid[1])
            ? [Math.round(centroid[0] * 10) / 10, Math.round(centroid[1] * 10) / 10]
            : [0, 0]

        return {
          name: feat.properties?.name || 'Unknown',
          d: pathGen(feat) || '',
          centroid: validCentroid,
        }
      })
    } catch (err) {
      console.error('Error generating India paths:', err)
      return []
    }
  }, [])

  // ─── Load state district TopoJSON dynamically when state changes ───────────────
  useEffect(() => {
    if (!drill.stateSlug) {
      setDistrictPaths([])
      return
    }

    let isMounted = true
    const slug = drill.stateSlug

    // Check cache first
    if (stateDistrictsMap[slug]) {
      computeDistrictPaths(stateDistrictsMap[slug])
      return
    }

    setIsLoadingDistricts(true)
    fetch(`/topojson/states/${slug}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`)
        return res.json()
      })
      .then((topo) => {
        if (!isMounted) return
        setStateDistrictsMap((prev) => ({ ...prev, [slug]: topo }))
        computeDistrictPaths(topo)
        setIsLoadingDistricts(false)
      })
      .catch((err) => {
        console.error(`Failed to load district TopoJSON for ${slug}:`, err)
        if (isMounted) setIsLoadingDistricts(false)
      })

    return () => {
      isMounted = false
    }
  }, [drill.stateSlug, stateDistrictsMap])

  function computeDistrictPaths(topo: any) {
    try {
      const geo = topojson.feature(topo, topo.objects.districts) as any
      const projection = geoMercator().fitExtent([[20, 20], [480, 430]], geo)
      const pathGen = geoPath().projection(projection)

      const paths = geo.features.map((feat: any): PathItem => {
        const centroid = pathGen.centroid(feat) as [number, number]
        const validCentroid: [number, number] =
          centroid && !isNaN(centroid[0]) && !isNaN(centroid[1])
            ? [Math.round(centroid[0] * 10) / 10, Math.round(centroid[1] * 10) / 10]
            : [0, 0]

        return {
          name: feat.properties?.district || 'Unknown',
          d: pathGen(feat) || '',
          centroid: validCentroid,
        }
      })
      setDistrictPaths(paths)
    } catch (e) {
      console.error('Error generating district paths:', e)
      setDistrictPaths([])
    }
  }

  // Sync external state selection (e.g. from homepage dropdown)
  useEffect(() => {
    if (selectedStateSlug) {
      const meta = statesMetaLookup.get(selectedStateSlug)
      if (meta && drill.stateSlug !== meta.slug) {
        setDrill({
          level: 'state',
          stateName: meta.name,
          stateSlug: meta.slug,
          districtName: selectedDistrict || null,
        })
      }
    } else if (selectedStateSlug === '' && drill.level !== 'india') {
      setDrill({
        level: 'india',
        stateName: null,
        stateSlug: null,
        districtName: null,
      })
    }
  }, [selectedStateSlug, selectedDistrict, statesMetaLookup, drill.stateSlug, drill.level])

  // ─── Handlers ────────────────────────────────────────────────────────────────
  function handleStateClick(name: string) {
    const slug = slugify(name)
    const meta = statesMetaLookup.get(name.toLowerCase()) || {
      name,
      slug,
      districtsCount: 0,
      hasPilot: false,
      districts: [],
      sizeKb: '0',
    }

    setDrill({
      level: 'state',
      stateName: meta.name,
      stateSlug: meta.slug,
      districtName: null,
    })
    setOtherDistrictSelected(null)
    setTooltip(null)
    setHoveredName(null)

    if (onStateChange) {
      onStateChange(meta.slug, meta.name)
    }
  }

  function handleDistrictClick(districtName: string) {
    const isAlwar = (districtName === 'Alwar' || districtName === 'Khairthal-Tijara') && drill.stateName === 'Rajasthan'
    const mpInfo = getDistrictMp(drill.stateName || '', districtName)

    if (isAlwar) {
      setDrill({
        level: 'district',
        stateName: 'Rajasthan',
        stateSlug: 'rajasthan',
        districtName: 'Alwar (Khairthal-Tijara)',
      })
      setOtherDistrictSelected(null)
      setTooltip(null)
      setHoveredName(null)
      if (onDistrictChange) onDistrictChange('Khairthal-Tijara')
    } else {
      setOtherDistrictSelected({
        name: districtName,
        stateName: drill.stateName || 'State',
        mpInfo: mpInfo || null,
        requested: false,
      })
      setTooltip(null)
      if (onDistrictChange) onDistrictChange(districtName)
    }
  }

  function handleTehsilClick(tehsil: TehsilInfo) {
    setSelectedTehsil(tehsil.id)
    if (tehsil.hasCivicData && tehsil.city) {
      onLocationSelect({
        state: 'Rajasthan',
        stateSlug: 'rajasthan',
        district: 'Khairthal-Tijara',
        districtSlug: 'khairthal-tijara',
        tehsil: tehsil.name,
        tehsilSlug: tehsil.slug,
        city: tehsil.city,
        citySlug: tehsil.citySlug!,
      })
    }
  }

  function handleBack() {
    if (drill.level === 'district') {
      setDrill((prev) => ({ ...prev, level: 'state', districtName: null }))
      setSelectedTehsil(null)
      if (onDistrictChange) onDistrictChange('')
    } else {
      setDrill({ level: 'india', stateName: null, stateSlug: null, districtName: null })
      setDistrictPaths([])
      setSelectedTehsil(null)
      setOtherDistrictSelected(null)
      if (onStateChange) onStateChange('', '')
      if (onDistrictChange) onDistrictChange('')
    }
    setHoveredName(null)
    setTooltip(null)
  }

  const currentCM = drill.stateSlug ? (chiefMinistersRaw as Record<string, any>)[drill.stateSlug] : null

  // State Crime Statistics from ADR / MyNeta
  const stateCrimeStats = useMemo(() => {
    if (!drill.stateName) return null
    const stateDistricts = (allDistrictMpsRaw.byStateDistrict as Record<string, Record<string, any>>)[drill.stateName] || {}
    const mps = Object.values(stateDistricts)
    const total = mps.length
    const withCases = mps.filter((m: any) => (m.criminalCases || 0) > 0).length
    const convicted = mps.filter((m: any) => m.convicted).length
    const totalCases = mps.reduce((acc: number, m: any) => acc + (m.criminalCases || 0), 0)
    return { total, withCases, convicted, totalCases }
  }, [drill.stateName])

  return (
    <div
      className="rounded-2xl p-4 relative"
      style={{
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(14px)',
        border: '1px solid rgba(244,161,24,0.3)',
        boxShadow: '0 8px 30px rgba(196,121,10,0.06)',
      }}
    >
      {/* ─── Breadcrumb ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 text-xs text-amber-900 font-medium">
          <button
            onClick={() => {
              setDrill({ level: 'india', stateName: null, stateSlug: null, districtName: null })
              setDistrictPaths([])
              setSelectedTehsil(null)
              setOtherDistrictSelected(null)
              setHoveredName(null)
              setTooltip(null)
              if (onStateChange) onStateChange('', '')
              if (onDistrictChange) onDistrictChange('')
            }}
            className="hover:text-amber-600 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>🇮🇳</span> India
          </button>
          {drill.stateName && (
            <>
              <ChevronRight className="w-3 h-3 text-amber-500" />
              <button
                onClick={() => {
                  setDrill((prev) => ({ ...prev, level: 'state', districtName: null }))
                  setOtherDistrictSelected(null)
                  setHoveredName(null)
                  setTooltip(null)
                  if (onDistrictChange) onDistrictChange('')
                }}
                className="hover:text-amber-600 transition-colors cursor-pointer font-bold"
              >
                {drill.stateName}
              </button>
            </>
          )}
          {drill.districtName && (
            <>
              <ChevronRight className="w-3 h-3 text-amber-500" />
              <span className="font-bold text-amber-950">{drill.districtName}</span>
            </>
          )}
        </div>

        {drill.level !== 'india' && (
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer"
            style={{
              background: 'rgba(244,161,24,0.12)',
              border: '1px solid rgba(244,161,24,0.3)',
              color: '#B45309',
            }}
          >
            <ArrowLeft className="w-3 h-3" />
            Back
          </button>
        )}
      </div>

      {/* ─── Level Description ───────────────────────────────────── */}
      <div className="text-center mb-3">
        {drill.level === 'india' && (
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(245,158,11,0.12)', color: '#B45309' }}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Click any Chief Minister badge on the map to explore State Districts & MPs</span>
          </div>
        )}
        {drill.level === 'state' && (
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(245,158,11,0.12)', color: '#B45309' }}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>
              {drill.stateName} · Click any <strong>District MP Badge</strong> to view local representatives & tenders
            </span>
          </div>
        )}
        {drill.level === 'district' && (
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(245,158,11,0.12)', color: '#B45309' }}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Alwar Parliamentary Constituency · Select Assembly Constituency (MLA)</span>
          </div>
        )}
      </div>

      {/* ─── Level 1: India Map (With State Names & ALL CM Avatar Badges) ───── */}
      {drill.level === 'india' && (
        <div className="relative flex justify-center">
          <svg
            viewBox="0 0 500 550"
            className="w-full max-h-[520px] select-none"
            style={{ filter: 'drop-shadow(0 4px 16px rgba(196,121,10,0.12))' }}
          >
            <defs>
              {/* Dynamic clip paths for each state CM */}
              {indiaPaths.map((item) => {
                const slug = slugify(item.name)
                const cm = (chiefMinistersRaw as Record<string, any>)[slug]
                if (!cm || !item.centroid || item.centroid[0] <= 0) return null
                const r = item.name === 'Rajasthan' ? 14 : 11
                return (
                  <clipPath key={`clip-cm-${slug}`} id={`clip-cm-${slug}`}>
                    <circle cx={item.centroid[0]} cy={item.centroid[1]} r={r} />
                  </clipPath>
                )
              })}
              <filter id="badge-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#D97706" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* State Polygons */}
            {indiaPaths.map((item) => {
              const meta = statesMetaLookup.get(item.name.toLowerCase())
              const isRajasthan = item.name === 'Rajasthan'
              const isHovered = hoveredName === item.name
              const districtsCount = meta?.districtsCount || ''
              const slug = slugify(item.name)
              const cm = (chiefMinistersRaw as Record<string, any>)[slug]

              return (
                <path
                  key={item.name}
                  d={item.d}
                  fill={isHovered ? COLORS.hover : isRajasthan ? COLORS.rajasthan : COLORS.default}
                  stroke={isHovered ? COLORS.hoverBorder : isRajasthan ? '#B45309' : COLORS.defaultBorder}
                  strokeWidth={isHovered ? 1.6 : isRajasthan ? 1.4 : 0.6}
                  className="cursor-pointer"
                  style={{
                    transition: 'fill 0.15s ease, stroke 0.15s ease',
                    filter: isRajasthan ? 'drop-shadow(0 0 3px rgba(245,158,11,0.4))' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    setHoveredName(item.name)
                    const svgRect = e.currentTarget.closest('svg')?.getBoundingClientRect()
                    if (svgRect) {
                      setTooltip({
                        name: item.name,
                        x: e.clientX - svgRect.left,
                        y: e.clientY - svgRect.top - 12,
                        tag: cm ? `CM: ${cm.honorific} ${cm.name} (${cm.party})` : `Click to view ${districtsCount} Districts`,
                        subtag: isRajasthan ? '✓ Pilot Active · 33 Districts' : `${districtsCount} Districts · Real Boundaries`,
                      })
                    }
                  }}
                  onMouseMove={(e) => {
                    const svgRect = e.currentTarget.closest('svg')?.getBoundingClientRect()
                    if (svgRect) {
                      setTooltip((prev) =>
                        prev ? { ...prev, x: e.clientX - svgRect.left, y: e.clientY - svgRect.top - 12 } : null
                      )
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredName(null)
                    setTooltip(null)
                  }}
                  onClick={() => handleStateClick(item.name)}
                />
              )
            })}

            {/* State Names rendered below CM badges */}
            {indiaPaths.map((item) => {
              if (
                !item.centroid ||
                item.centroid[0] <= 0 ||
                item.centroid[1] <= 0 ||
                isNaN(item.centroid[0]) ||
                isNaN(item.centroid[1])
              )
                return null
              const isRajasthan = item.name === 'Rajasthan'
              const displayName =
                item.name === 'Dadra and Nagar Haveli and Daman and Diu'
                  ? 'D&NH'
                  : item.name === 'Andaman and Nicobar Islands'
                  ? 'A&N'
                  : item.name === 'Jammu and Kashmir'
                  ? 'J&K'
                  : item.name

              // Place label below centroid avatar
              const textY = isRajasthan ? item.centroid[1] + 22 : item.centroid[1] + 16

              return (
                <text
                  key={`name-${item.name}`}
                  x={item.centroid[0]}
                  y={textY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={isRajasthan ? '8' : '6'}
                  fontWeight={isRajasthan ? 'bold' : '600'}
                  fill={isRajasthan ? '#78350F' : '#4B5563'}
                  className="pointer-events-none select-none drop-shadow-2xs"
                  style={{
                    letterSpacing: '0.02em',
                    textShadow: '0 1px 2px rgba(255,255,255,0.95)',
                  }}
                >
                  {displayName}
                </text>
              )
            })}

            {/* ─── Chief Minister Avatar Badges Pinned across ALL States ─── */}
            {indiaPaths.map((item) => {
              const slug = slugify(item.name)
              const cm = (chiefMinistersRaw as Record<string, any>)[slug]
              if (!cm || !item.centroid || item.centroid[0] <= 0 || isNaN(item.centroid[0])) return null

              const isRajasthan = item.name === 'Rajasthan'
              const r = isRajasthan ? 14 : 11
              const imgSize = r * 2
              const partyColor = cm.color || '#FF6B00'

              return (
                <g
                  key={`cm-badge-${slug}`}
                  className="cursor-pointer transition-transform hover:scale-125"
                  style={{ transformOrigin: `${item.centroid[0]}px ${item.centroid[1]}px` }}
                  onClick={() => handleStateClick(item.name)}
                  onMouseEnter={(e) => {
                    setHoveredName(item.name)
                    const svgRect = e.currentTarget.closest('svg')?.getBoundingClientRect()
                    if (svgRect) {
                      setTooltip({
                        name: `${cm.honorific} ${cm.name}`,
                        x: e.clientX - svgRect.left,
                        y: e.clientY - svgRect.top - 12,
                        tag: `Chief Minister of ${item.name} (${cm.party})`,
                        subtag: 'Click to explore state districts & MPs',
                      })
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredName(null)
                    setTooltip(null)
                  }}
                >
                  {/* Outer ring */}
                  <circle
                    cx={item.centroid[0]}
                    cy={item.centroid[1]}
                    r={r + 2.5}
                    fill="none"
                    stroke={partyColor}
                    strokeWidth={isRajasthan ? '2' : '1.5'}
                    strokeDasharray={isRajasthan ? '3 2' : 'none'}
                    opacity={isRajasthan ? 0.9 : 0.7}
                  />
                  <circle
                    cx={item.centroid[0]}
                    cy={item.centroid[1]}
                    r={r + 0.5}
                    fill="#FFFFFF"
                    stroke={partyColor}
                    strokeWidth="1"
                    filter="url(#badge-glow)"
                  />
                  <image
                    href={cm.photo}
                    x={item.centroid[0] - r}
                    y={item.centroid[1] - r}
                    width={imgSize}
                    height={imgSize}
                    preserveAspectRatio="xMidYMid slice"
                    clipPath={`url(#clip-cm-${slug})`}
                  />
                </g>
              )
            })}
          </svg>
        </div>
      )}

      {/* ─── Level 2: State Districts Map (With MP Avatar Badges on Districts) ─── */}
      {drill.level === 'state' && (
        <div className="relative flex flex-col items-center">
          {/* State Leader Header Strip */}
          {currentCM && (
            <div
              className="w-full p-2.5 rounded-xl border mb-2 flex items-center justify-between"
              style={{
                background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.8) 0%, rgba(255, 255, 255, 0.9) 100%)',
                borderColor: 'rgba(245, 158, 11, 0.4)',
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="relative w-10 h-10 rounded-full overflow-hidden border-2 shadow-xs flex-shrink-0"
                  style={{ borderColor: currentCM.color || '#D97706' }}
                >
                  <img
                    src={currentCM.photo}
                    alt={currentCM.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded text-white"
                      style={{ background: currentCM.color || '#B45309' }}
                    >
                      Chief Minister
                    </span>
                    <span className="text-[10px] font-semibold text-amber-900">{drill.stateName}</span>
                  </div>
                  <h4 className="text-xs font-bold text-stone-900">
                    {currentCM.honorific} {currentCM.name} ({currentCM.party})
                  </h4>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-stone-500 block">Elected Leadership</span>
                <span className="text-xs font-bold text-amber-950">
                  {drill.stateName === 'Rajasthan' ? '25 Lok Sabha MPs' : 'State Assembly & MPs'}
                </span>
              </div>
            </div>
          )}

          {/* ─── Mode Switcher & ADR Crime Legend ─── */}
          <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-1 mb-2.5">
            <div className="flex items-center gap-1.5 bg-amber-100/70 p-1 rounded-xl border border-amber-200/80 shadow-2xs">
              <button
                onClick={() => setHeatmapMode('crime')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  heatmapMode === 'crime'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-950 hover:bg-white/50'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>ADR Crime Heatmap</span>
                {stateCrimeStats && stateCrimeStats.convicted > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-yellow-300 text-red-950 text-[10px] font-black">
                    {stateCrimeStats.convicted} Convicted
                  </span>
                )}
              </button>
              <button
                onClick={() => setHeatmapMode('civic')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  heatmapMode === 'civic'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-950 hover:bg-white/50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Civic View</span>
              </button>
            </div>

            {/* Crime Legend Bar */}
            {heatmapMode === 'crime' ? (
              <div className="flex flex-wrap items-center gap-2 text-[10.5px] font-medium text-stone-700 bg-white/70 px-2.5 py-1.5 rounded-lg border border-stone-200">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> 0 Clean
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span> 1-2
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span> 3-5
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> 6+
                </span>
                <span className="flex items-center gap-1 font-bold text-red-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-700 inline-block border border-red-300"></span> ⚠️ Convicted
                </span>
              </div>
            ) : (
              <span className="text-xs text-stone-500">
                Click any district to view representative scorecard
              </span>
            )}
          </div>

          {isLoadingDistricts ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-amber-800">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
              <p className="text-sm font-medium">Loading {drill.stateName} districts map...</p>
            </div>
          ) : (
            <svg
              viewBox="0 0 500 450"
              className="w-full max-h-[460px] select-none"
              style={{ filter: 'drop-shadow(0 4px 16px rgba(196,121,10,0.12))' }}
            >
              <defs>
                {/* Dynamic clip paths for each district MP with photos */}
                {districtPaths.map((item) => {
                  const mp = getDistrictMp(drill.stateName || '', item.name)
                  if (!mp || !mp.photo || !item.centroid || item.centroid[0] <= 0) return null
                  const slug = slugify(item.name)
                  return (
                    <clipPath key={`clip-mp-${slug}`} id={`clip-mp-${slug}`}>
                      <circle cx={item.centroid[0]} cy={item.centroid[1]} r="11" />
                    </clipPath>
                  )
                })}
              </defs>

              {/* District Polygons */}
              {districtPaths.map((item) => {
                const isAlwar =
                  drill.stateName === 'Rajasthan' && (item.name === 'Alwar' || item.name === 'Khairthal-Tijara')
                const isSelected = otherDistrictSelected?.name === item.name
                const isHovered = hoveredName === item.name
                const mp = getDistrictMp(drill.stateName || '', item.name)

                // Dynamic Polygon Shading: Civic View vs ADR Crime Heatmap
                let fillColor = COLORS.default
                let strokeColor = COLORS.defaultBorder
                let strokeWidth = 0.6

                if (heatmapMode === 'crime' && mp) {
                  if (mp.convicted) {
                    fillColor = isSelected
                      ? 'rgba(185, 28, 28, 0.85)'
                      : isHovered
                      ? 'rgba(220, 38, 38, 0.65)'
                      : 'rgba(220, 38, 38, 0.42)'
                    strokeColor = '#991B1B'
                    strokeWidth = isSelected ? 2.5 : isHovered ? 2.0 : 1.4
                  } else if ((mp.criminalCases || 0) >= 6) {
                    fillColor = isSelected
                      ? 'rgba(220, 38, 38, 0.75)'
                      : isHovered
                      ? 'rgba(239, 68, 68, 0.55)'
                      : 'rgba(239, 68, 68, 0.36)'
                    strokeColor = '#DC2626'
                    strokeWidth = isSelected ? 2.2 : isHovered ? 1.8 : 1.1
                  } else if ((mp.criminalCases || 0) >= 3) {
                    fillColor = isSelected
                      ? 'rgba(234, 88, 12, 0.70)'
                      : isHovered
                      ? 'rgba(249, 115, 22, 0.50)'
                      : 'rgba(249, 115, 22, 0.30)'
                    strokeColor = '#EA580C'
                    strokeWidth = isSelected ? 2.0 : isHovered ? 1.6 : 0.9
                  } else if ((mp.criminalCases || 0) >= 1) {
                    fillColor = isSelected
                      ? 'rgba(217, 119, 6, 0.65)'
                      : isHovered
                      ? 'rgba(245, 158, 11, 0.45)'
                      : 'rgba(245, 158, 11, 0.22)'
                    strokeColor = '#D97706'
                    strokeWidth = isSelected ? 2.0 : isHovered ? 1.5 : 0.8
                  } else {
                    fillColor = isSelected
                      ? 'rgba(5, 150, 105, 0.60)'
                      : isHovered
                      ? 'rgba(16, 185, 129, 0.40)'
                      : 'rgba(16, 185, 129, 0.20)'
                    strokeColor = '#059669'
                    strokeWidth = isSelected ? 2.0 : isHovered ? 1.4 : 0.7
                  }
                } else {
                  fillColor = isSelected
                    ? COLORS.active
                    : isHovered
                    ? COLORS.hover
                    : isAlwar
                    ? COLORS.alwar
                    : COLORS.default
                  strokeColor = isSelected
                    ? '#78350F'
                    : isHovered
                    ? COLORS.hoverBorder
                    : isAlwar
                    ? '#9A5C00'
                    : COLORS.defaultBorder
                  strokeWidth = isSelected ? 2 : isHovered ? 1.6 : isAlwar ? 1.5 : 0.6
                }

                return (
                  <g key={item.name}>
                    <path
                      d={item.d}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      className="cursor-pointer"
                      style={{
                        transition: 'fill 0.15s ease, stroke 0.15s ease',
                        filter: mp?.convicted && heatmapMode === 'crime' ? 'drop-shadow(0 0 5px rgba(220,38,38,0.5))' : isAlwar ? 'drop-shadow(0 0 4px rgba(245,158,11,0.5))' : 'none',
                      }}
                      onMouseEnter={(e) => {
                        setHoveredName(item.name)
                        const svgRect = e.currentTarget.closest('svg')?.getBoundingClientRect()
                        if (svgRect) {
                          let tag = 'Click to select district'
                          let subtag = isAlwar
                            ? '✓ Live Pilot · Click for MLA & Bhiwadi Tenders'
                            : mp?.portfolio || mp?.constituency || drill.stateName || undefined

                          if (mp) {
                            if (heatmapMode === 'crime') {
                              if (mp.convicted) {
                                tag = `🚨 ⚠️ CONVICTED · MP: ${mp.mp} (${mp.party})`
                                subtag = `⚠️ ${mp.convictionDetails || 'Declared under RP Act / IPC'} · ${mp.criminalCases} Cases`
                              } else if (mp.criminalCases > 0) {
                                tag = `⚖️ ${mp.criminalCases} Criminal Cases · MP: ${mp.mp} (${mp.party})`
                                subtag = `${mp.constituency} · Click for ADR details`
                              } else {
                                tag = `✓ 0 Clean Cases · MP: ${mp.mp} (${mp.party})`
                                subtag = `${mp.constituency} · Click for details`
                              }
                            } else {
                              tag = `MP: ${mp.mp} (${mp.party})`
                            }
                          }

                          setTooltip({
                            name: item.name,
                            x: e.clientX - svgRect.left,
                            y: e.clientY - svgRect.top - 12,
                            tag,
                            subtag,
                          })
                        }
                      }}
                      onMouseMove={(e) => {
                        const svgRect = e.currentTarget.closest('svg')?.getBoundingClientRect()
                        if (svgRect) {
                          setTooltip((prev) =>
                            prev ? { ...prev, x: e.clientX - svgRect.left, y: e.clientY - svgRect.top - 12 } : null
                          )
                        }
                      }}
                      onMouseLeave={() => {
                        setHoveredName(null)
                        setTooltip(null)
                      }}
                      onClick={() => handleDistrictClick(item.name)}
                    />

                    {/* District name label */}
                    {item.centroid &&
                      item.centroid[0] > 0 &&
                      item.centroid[1] > 0 &&
                      !isNaN(item.centroid[0]) &&
                      !isNaN(item.centroid[1]) && (
                        <text
                          x={item.centroid[0]}
                          y={mp?.photo ? item.centroid[1] + 16 : item.centroid[1]}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize={isAlwar ? '8.5' : districtPaths.length > 40 ? '6.5' : '7.5'}
                          fontWeight={isAlwar || isSelected || (mp?.convicted && heatmapMode === 'crime') ? 'bold' : 'normal'}
                          fill={isSelected ? '#FFFFFF' : (mp?.convicted && heatmapMode === 'crime') ? '#991B1B' : isAlwar ? '#78350F' : '#4B5563'}
                          className="pointer-events-none select-none drop-shadow-2xs"
                        >
                          {item.name}
                        </text>
                      )}

                    {/* Prominent Conviction Warning Sign (⚠️) on District Centroid */}
                    {mp?.convicted && heatmapMode === 'crime' && item.centroid && item.centroid[0] > 0 && !isNaN(item.centroid[0]) && (
                      <g
                        className="pointer-events-none select-none animate-pulse"
                        transform={`translate(${item.centroid[0]}, ${item.centroid[1] - (mp.photo ? 14 : 9)})`}
                      >
                        <circle cx="0" cy="0" r="7.5" fill="#DC2626" stroke="#FFFFFF" strokeWidth="1" />
                        <text x="0" y="3.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#FFFFFF">⚠️</text>
                      </g>
                    )}
                  </g>
                )
              })}

              {/* ─── MP Avatar Badges Pinned on District Centroids ─── */}
              {districtPaths.map((item) => {
                const mp = getDistrictMp(drill.stateName || '', item.name)
                if (!mp || !item.centroid || item.centroid[0] <= 0 || isNaN(item.centroid[0])) return null

                const slug = slugify(item.name)
                const isAlwar = item.name === 'Alwar'
                const r = isAlwar ? 13 : 10.5
                let ringColor = mp.party === 'BJP' ? '#FF6B00' : mp.party === 'INC' ? '#00AEEF' : '#7C3AED'
                if (heatmapMode === 'crime') {
                  if (mp.convicted) ringColor = '#DC2626'
                  else if (mp.criminalCases >= 6) ringColor = '#EF4444'
                  else if (mp.criminalCases >= 3) ringColor = '#F97316'
                  else if (mp.criminalCases >= 1) ringColor = '#F59E0B'
                  else ringColor = '#10B981'
                }

                if (!mp.photo) return null

                return (
                  <g
                    key={`mp-pin-${slug}`}
                    className="cursor-pointer transition-transform hover:scale-125"
                    style={{ transformOrigin: `${item.centroid[0]}px ${item.centroid[1]}px` }}
                    onClick={() => handleDistrictClick(item.name)}
                    onMouseEnter={(e) => {
                      setHoveredName(item.name)
                      const svgRect = e.currentTarget.closest('svg')?.getBoundingClientRect()
                      if (svgRect) {
                        setTooltip({
                          name: mp.mp,
                          x: e.clientX - svgRect.left,
                          y: e.clientY - svgRect.top - 12,
                          tag: `MP, ${mp.constituency} (${mp.party})`,
                          subtag: mp.convicted ? `⚠️ CONVICTED · ${mp.criminalCases} Cases` : isAlwar
                            ? 'Union Minister · Click for MLA & Bhiwadi'
                            : mp.portfolio || 'Click to view MP scorecard',
                        })
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredName(null)
                      setTooltip(null)
                    }}
                  >
                    <circle
                      cx={item.centroid[0]}
                      cy={item.centroid[1]}
                      r={r + 2}
                      fill="none"
                      stroke={ringColor}
                      strokeWidth={isAlwar ? '2' : '1.5'}
                      strokeDasharray={isAlwar ? '3 2' : 'none'}
                      opacity={isAlwar ? 0.9 : 0.7}
                    />
                    <circle cx={item.centroid[0]} cy={item.centroid[1]} r={r} fill="#FFFFFF" stroke={ringColor} strokeWidth="1" />
                    <image
                      href={mp.photo}
                      x={item.centroid[0] - r}
                      y={item.centroid[1] - r}
                      width={r * 2}
                      height={r * 2}
                      preserveAspectRatio="xMidYMid slice"
                      clipPath={`url(#clip-mp-${slug})`}
                    />
                  </g>
                )
              })}
            </svg>
          )}

          {/* District Preview Card when district is clicked */}
          {otherDistrictSelected && (
            <div
              className="mt-3 w-full p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-fade-in shadow-xs"
              style={{
                background: otherDistrictSelected.mpInfo?.convicted
                  ? 'linear-gradient(135deg, rgba(254, 226, 226, 0.95) 0%, rgba(255, 241, 242, 0.9) 100%)'
                  : 'rgba(254, 243, 199, 0.85)',
                borderColor: otherDistrictSelected.mpInfo?.convicted
                  ? 'rgba(239, 68, 68, 0.6)'
                  : 'rgba(245, 158, 11, 0.4)',
              }}
            >
              <div className="flex items-start gap-3">
                {otherDistrictSelected.mpInfo?.photo ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500 shadow-xs flex-shrink-0">
                    <Image
                      src={otherDistrictSelected.mpInfo.photo}
                      alt={otherDistrictSelected.mpInfo.mp}
                      fill
                      sizes="48px"
                      className="object-cover object-top"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-amber-200/80 border border-amber-400 text-amber-900 font-bold text-sm flex-shrink-0 shadow-2xs">
                    {otherDistrictSelected.mpInfo?.convicted ? (
                      <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse" />
                    ) : (
                      <Scale className="w-6 h-6 text-amber-800" />
                    )}
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-bold text-stone-950">
                      {otherDistrictSelected.name}, {otherDistrictSelected.stateName}
                    </h4>

                    {/* Conviction Warning Banner */}
                    {otherDistrictSelected.mpInfo?.convicted && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600 text-white text-[10.5px] font-black shadow-xs animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        CONVICTED
                      </span>
                    )}
                  </div>

                  {otherDistrictSelected.mpInfo ? (
                    <>
                      <p className="text-xs text-stone-800 mt-0.5">
                        <strong>MP:</strong> {otherDistrictSelected.mpInfo.mp} ({otherDistrictSelected.mpInfo.party}) ·{' '}
                        {otherDistrictSelected.mpInfo.portfolio || otherDistrictSelected.mpInfo.constituency}
                      </p>

                      {otherDistrictSelected.mpInfo.convicted && (
                        <p className="text-[11px] text-red-950 font-semibold mt-1 bg-red-50 p-1.5 rounded border border-red-200">
                          <strong>⚠️ Conviction Details:</strong> {otherDistrictSelected.mpInfo.convictionDetails}
                        </p>
                      )}

                      {/* Criminal Cases & Credentials Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                            otherDistrictSelected.mpInfo.criminalCases === 0
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : otherDistrictSelected.mpInfo.criminalCases >= 6
                              ? 'bg-red-100 text-red-900 border-red-300'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}
                        >
                          {otherDistrictSelected.mpInfo.criminalCases === 0
                            ? '✓ 0 Criminal Cases (Clean)'
                            : `⚖️ ${otherDistrictSelected.mpInfo.criminalCases} Declared Criminal Cases`}
                        </span>

                        {otherDistrictSelected.mpInfo.education && (
                          <span className="px-2 py-0.5 rounded text-[11px] bg-white/80 text-stone-700 border border-stone-200">
                            🎓 {otherDistrictSelected.mpInfo.education}
                          </span>
                        )}

                        {otherDistrictSelected.mpInfo.assets && (
                          <span className="px-2 py-0.5 rounded text-[11px] bg-white/80 text-stone-700 border border-stone-200">
                            💰 {otherDistrictSelected.mpInfo.assets.split('~')[1]?.trim() || otherDistrictSelected.mpInfo.assets}
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-amber-800 mt-0.5">
                      Real geographic boundary verified · Civic tenders & representative tracker onboarding.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex-shrink-0 flex items-center gap-2 mt-2 md:mt-0 self-end md:self-center">
                {otherDistrictSelected.mpInfo?.myneta_url && (
                  <a
                    href={otherDistrictSelected.mpInfo.myneta_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-colors inline-flex items-center gap-1 shadow-2xs"
                  >
                    <span>MyNeta Affidavit</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {otherDistrictSelected.requested ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Request Logged
                  </span>
                ) : (
                  <button
                    onClick={() =>
                      setOtherDistrictSelected((prev) => (prev ? { ...prev, requested: true } : null))
                    }
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white shadow-xs transition-all active:scale-95 cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #F4A118 0%, #C4790A 100%)' }}
                  >
                    Request Data
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Level 3: District Subdivisions / Constituencies (Alwar / Khairthal-Tijara) ─── */}
      {drill.level === 'district' && (
        <div className="space-y-4 pt-1">
          {/* Member of Parliament (MP) Banner */}
          <div
            className="p-3 rounded-xl border flex items-center justify-between gap-3 shadow-xs"
            style={{
              background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.85) 0%, rgba(255, 255, 255, 0.95) 100%)',
              borderColor: 'rgba(245, 158, 11, 0.45)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-600 shadow-xs flex-shrink-0">
                <Image
                  src="/images/leaders/mp_bhupender_yadav.jpg"
                  alt="Bhupender Yadav"
                  fill
                  sizes="48px"
                  className="object-cover object-top"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-amber-600 text-white">
                    Member of Parliament (MP)
                  </span>
                  <span className="text-[10px] font-semibold text-amber-900">Alwar Lok Sabha (No. 8)</span>
                </div>
                <h4 className="text-sm font-bold text-stone-900 mt-0.5">Shri Bhupender Yadav (BJP)</h4>
                <p className="text-[11px] text-amber-800">Union Cabinet Minister (Environment, Forest & Climate Change)</p>
              </div>
            </div>

            <a
              href="https://www.myneta.info/LokSabha2024/candidate.php?candidate_id=360"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline inline-flex items-center gap-1 flex-shrink-0"
            >
              MyNeta Profile <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Subdivisions & Tehsils Selector */}
          <div>
            <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider mb-2 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-600" /> Assembly Constituencies & Tehsils
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ALWAR_TEHSILS.map((tehsil) => (
                <div
                  key={tehsil.id}
                  onClick={() => handleTehsilClick(tehsil)}
                  className={`
                    p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer
                    ${
                      selectedTehsil === tehsil.id
                        ? 'bg-amber-500/10 border-amber-500 shadow-md ring-1 ring-amber-500'
                        : 'bg-white/80 border-amber-200/70 hover:bg-amber-50 hover:border-amber-400'
                    }
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span className="text-xs font-bold text-amber-950">{tehsil.name}</span>
                      </div>
                      {tehsil.hasCivicData ? (
                        <span className="mt-1.5 inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {tehsil.city} ✓ Live Pilot
                        </span>
                      ) : (
                        <span className="mt-1.5 inline-block text-[10px] px-2 py-0.5 rounded-full text-stone-400 bg-stone-100">
                          Data onboarding
                        </span>
                      )}
                    </div>

                    {tehsil.representative && (
                      <div className="flex items-center gap-2 pl-2 border-l border-amber-200">
                        <div className="relative w-9 h-9 rounded-full overflow-hidden border border-amber-500 flex-shrink-0">
                          <Image
                            src={tehsil.representative.photo}
                            alt={tehsil.representative.name}
                            fill
                            sizes="36px"
                            className="object-cover object-top"
                          />
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-bold text-amber-800 block">
                            {tehsil.representative.party}
                          </span>
                          <span className="text-[11px] font-bold text-stone-900 block truncate max-w-[90px]">
                            {tehsil.representative.name}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {tehsil.hasCivicData && (
                    <div className="mt-2 pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-amber-800 font-medium">Chairman: Dr. Gunjan Khattana</span>
                      <span className="font-bold text-amber-900 underline flex items-center gap-0.5">
                        Open Dashboard ↗
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Floating Tooltip ──────────────────────────────────── */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-30 transition-all duration-75"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div
            className="px-3 py-1.5 rounded-lg text-center whitespace-nowrap shadow-lg"
            style={{
              background: 'rgba(30, 20, 10, 0.94)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(245,158,11,0.4)',
            }}
          >
            <p className="text-xs font-bold text-white">{tooltip.name}</p>
            {tooltip.tag && <p className="text-[10px] text-amber-300 font-medium mt-0.5">{tooltip.tag}</p>}
            {tooltip.subtag && <p className="text-[9px] text-stone-400 mt-0.5">{tooltip.subtag}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
