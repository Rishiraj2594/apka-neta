'use client'

import Image from 'next/image'
import nationalLeaders from '@/data/national-leaders.json'
import { Sparkles, Award } from 'lucide-react'

export default function NationalLeadersBar() {
  const leaders = [
    { key: 'president', ...nationalLeaders.president, badge: 'President' },
    { key: 'vicePresident', ...nationalLeaders.vicePresident, badge: 'Vice President' },
    { key: 'primeMinister', ...nationalLeaders.primeMinister, badge: 'Prime Minister' },
  ]

  return (
    <div
      className="p-3.5 rounded-2xl border mb-4 backdrop-blur-md transition-all shadow-xs"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(254,243,199,0.55) 100%)',
        borderColor: 'rgba(244,161,24,0.35)',
        boxShadow: '0 4px 20px rgba(196,121,10,0.06)',
      }}
    >
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🇮🇳</span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1">
            Constitutional Leadership of India
          </h3>
        </div>
        <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-600" /> Executive Head & Government
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {leaders.map((leader) => (
          <div
            key={leader.key}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-white/80 border border-amber-200/60 shadow-2xs hover:border-amber-400 transition-colors"
          >
            <div className="relative w-12 h-12 flex-shrink-0 rounded-full overflow-hidden border-2 border-amber-500 shadow-xs">
              <Image
                src={leader.photo}
                alt={leader.name}
                fill
                sizes="48px"
                className="object-cover object-top"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-200">
                  {leader.badge}
                </span>
              </div>
              <h4 className="text-xs font-bold text-stone-900 truncate mt-0.5" title={leader.name}>
                {leader.name}
              </h4>
              <p className="text-[10px] text-amber-800 truncate" title={leader.designation}>
                {leader.designation}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
