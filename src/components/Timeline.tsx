'use client'

import type { Goal } from '@/lib/api'

interface Props {
  goals: Goal[]
}

// Two crossed checkered racing flags centered on the timeline point
function MilestoneFlag({ cx, lineY }: { cx: number; lineY: number }) {
  const id1 = `cf1-${cx}`
  const id2 = `cf2-${cx}`

  // Flag body: wavy path (pole at origin, flag waves to the right/up)
  // Pole goes from (0,0) down to (0,14). Flag top-left at (0,0), waves rightward.
  // We'll draw each flag as a group and rotate to cross them.

  // Checkerboard via clipPath on the wavy flag shape
  // Flag shape: a curved/wavy parallelogram ~18×10 units
  // Pole: vertical line 14 units tall

  return (
    <g transform={`translate(${cx},${lineY})`}>
      <defs>
        {/* Wavy flag outline path — pole at (0,0), flag extends right and up */}
        <clipPath id={id1}>
          <path d="M0,0 C4,-8 10,-10 16,-8 C12,-4 8,-2 14,2 C10,4 4,2 0,0 Z" />
        </clipPath>
        <clipPath id={id2}>
          <path d="M0,0 C4,-8 10,-10 16,-8 C12,-4 8,-2 14,2 C10,4 4,2 0,0 Z" />
        </clipPath>
      </defs>

      {/* Flag 1 — rotated -25deg, shifted left */}
      <g transform="rotate(-25) translate(-8,-6)">
        {/* Pole */}
        <line x1="0" y1="0" x2="0" y2="14" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round"/>
        {/* Flag background white */}
        <path d="M0,0 C4,-8 10,-10 16,-8 C12,-4 8,-2 14,2 C10,4 4,2 0,0 Z" fill="#ffffff" stroke="#1a1a1a" strokeWidth="0.8"/>
        {/* Checker cells clipped to flag shape */}
        <g clipPath={`url(#${id1})`}>
          {[0,1,2,3].map(col => [0,1].map(row => (
            <rect
              key={`${col}-${row}`}
              x={col * 4} y={-8 + row * 4}
              width={4} height={4}
              fill={(col + row) % 2 === 0 ? '#1a1a1a' : 'none'}
            />
          )))}
        </g>
      </g>

      {/* Flag 2 — mirrored, rotated +25deg, shifted right */}
      <g transform="scale(-1,1) rotate(-25) translate(-8,-6)">
        {/* Pole */}
        <line x1="0" y1="0" x2="0" y2="14" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round"/>
        {/* Flag background white */}
        <path d="M0,0 C4,-8 10,-10 16,-8 C12,-4 8,-2 14,2 C10,4 4,2 0,0 Z" fill="#ffffff" stroke="#1a1a1a" strokeWidth="0.8"/>
        {/* Checker cells */}
        <g clipPath={`url(#${id2})`}>
          {[0,1,2,3].map(col => [0,1].map(row => (
            <rect
              key={`${col}-${row}`}
              x={col * 4} y={-8 + row * 4}
              width={4} height={4}
              fill={(col + row) % 2 === 0 ? '#1a1a1a' : 'none'}
            />
          )))}
        </g>
      </g>

      {/* Center dot on timeline */}
      <circle cx={0} cy={0} r="2.5" fill="#1a1a1a" />
    </g>
  )
}

export default function Timeline({ goals }: Props) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const active = goals
    .filter(g => g.is_active === 1 && new Date(g.target_date) >= today)
    .sort((a, b) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime())

  if (active.length === 0) return null

  const maxDate = new Date(active[active.length - 1].target_date)
  const totalMs = Math.max(maxDate.getTime() - today.getTime(), 1)

  // --- SVG layout constants ---
  const W = 900
  const PAD_L = 55
  const PAD_R = 55
  const TRACK = W - PAD_L - PAD_R
  const LINE_Y = 100          // horizontal line y
  const FLAG_HALF = 14        // flags extend ~14px above/below line center
  const SVG_H = 200

  // Label positions (alternating above / below)
  const ABOVE_TITLE_Y = 18
  const ABOVE_DATE_Y  = 31
  const ABOVE_LINE_END = ABOVE_DATE_Y + 6   // bottom of above-label block
  const BELOW_TITLE_Y = 133
  const BELOW_DATE_Y  = 146
  const BELOW_LINE_START = BELOW_TITLE_Y - 6 // top of below-label block

  const items = active.map((goal, i) => {
    const ms = new Date(goal.target_date).getTime() - today.getTime()
    const x = PAD_L + (ms / totalMs) * TRACK
    const above = i % 2 === 0
    const dateStr = new Date(goal.target_date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    })
    const title = goal.title.length > 22 ? goal.title.slice(0, 21) + '…' : goal.title
    return { goal, x, above, dateStr, title }
  })

  return (
    <div className="w-full select-none">
      <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full overflow-visible" aria-hidden>

        {/* ── Main timeline line ── */}
        <line
          x1={PAD_L - 20} y1={LINE_Y}
          x2={W - PAD_R + 20} y2={LINE_Y}
          stroke="#1a1a1a"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Start dot + "сейчас" */}
        <circle cx={PAD_L - 20} cy={LINE_Y} r="3" fill="#1a1a1a" />
        <text x={PAD_L - 20} y={LINE_Y + 16} textAnchor="middle" fontSize="11" fill="#999" fontFamily="inherit">
          сейчас
        </text>

        {/* End dot */}
        <circle cx={W - PAD_R + 20} cy={LINE_Y} r="3" fill="#1a1a1a" />

        {/* ── Goal milestones ── */}
        {items.map(({ goal, x, above, dateStr, title }) => (
          <g key={goal.id}>
            {/* Connector line */}
            {above ? (
              <line
                x1={x} y1={ABOVE_LINE_END}
                x2={x} y2={LINE_Y - FLAG_HALF - 1}
                stroke="#c0c0c0"
                strokeWidth="1"
              />
            ) : (
              <line
                x1={x} y1={LINE_Y + FLAG_HALF + 1}
                x2={x} y2={BELOW_LINE_START}
                stroke="#c0c0c0"
                strokeWidth="1"
              />
            )}

            {/* Checkered flag on the line */}
            <MilestoneFlag cx={x} lineY={LINE_Y} />

            {/* Labels */}
            {above ? (
              <>
                <text x={x} y={ABOVE_TITLE_Y} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#1a1a1a" fontFamily="inherit">
                  {title}
                </text>
                <text x={x} y={ABOVE_DATE_Y} textAnchor="middle" fontSize="11" fill="#999" fontFamily="inherit">
                  {dateStr}
                </text>
              </>
            ) : (
              <>
                <text x={x} y={BELOW_TITLE_Y} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#1a1a1a" fontFamily="inherit">
                  {title}
                </text>
                <text x={x} y={BELOW_DATE_Y} textAnchor="middle" fontSize="11" fill="#999" fontFamily="inherit">
                  {dateStr}
                </text>
              </>
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}
