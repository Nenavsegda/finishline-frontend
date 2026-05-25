'use client'

import type { Goal } from '@/lib/api'

interface Props {
  goals: Goal[]
}

// Mini checkered flag placed ON the timeline line
function MilestoneFlag({ cx, lineY }: { cx: number; lineY: number }) {
  const sz = 14
  const h = sz / 2
  return (
    <g>
      <rect x={cx - h} y={lineY - h} width={h} height={h} fill="#1a1a1a" />
      <rect x={cx}     y={lineY - h} width={h} height={h} fill="#ffffff" />
      <rect x={cx - h} y={lineY}     width={h} height={h} fill="#ffffff" />
      <rect x={cx}     y={lineY}     width={h} height={h} fill="#1a1a1a" />
      {/* outline keeps white cells visible */}
      <rect x={cx - h} y={lineY - h} width={sz} height={sz} fill="none" stroke="#1a1a1a" strokeWidth="0.8" />
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
  const FLAG_HALF = 7         // half of flag size (14/2)
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
