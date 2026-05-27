'use client'

import type { Goal } from '@/lib/api'

interface Props {
  goals: Goal[]
}

const DOT_R        = 5
const LABEL_HALF_W = 85   // half-width of label block (SVG units, ~22 chars @ 7.5px/char)
const MAX_LEVELS   = 3

interface LabelPos {
  titleY:      number
  dateY:       number
  connectorY:  number  // connector endpoint nearest the label (above=bottom of label, below=top)
}

// Three levels per side — each level shifts further from the timeline
const ABOVE_POS: LabelPos[] = [
  { titleY: 22,  dateY: 35,  connectorY: 43  }, // level 0 — closest to line
  { titleY: 7,   dateY: 20,  connectorY: 28  }, // level 1
  { titleY: -8,  dateY: 5,   connectorY: 13  }, // level 2 — furthest from line
]
const BELOW_POS: LabelPos[] = [
  { titleY: 135, dateY: 148, connectorY: 127 }, // level 0
  { titleY: 151, dateY: 164, connectorY: 143 }, // level 1
  { titleY: 167, dateY: 180, connectorY: 159 }, // level 2
]

/**
 * Assigns a vertical level to each label so that no two labels on the same
 * side share the same level AND have overlapping x-extents.
 *
 * Algorithm: sort by x, then for each item try level 0, 1, 2 in order
 * and pick the first level whose rightEdge doesn't conflict.
 */
function assignLevels(items: { x: number; id: string }[]): Map<string, number> {
  const sorted    = [...items].sort((a, b) => a.x - b.x)
  const levelMap  = new Map<string, number>()
  const rightEdge = new Array<number>(MAX_LEVELS).fill(-Infinity)

  for (const item of sorted) {
    let lv = 0
    // Find the first level where this item fits (no x-overlap with previous item on that level)
    while (lv < MAX_LEVELS - 1 && item.x - LABEL_HALF_W <= rightEdge[lv]) {
      lv++
    }
    levelMap.set(item.id, lv)
    rightEdge[lv] = item.x + LABEL_HALF_W
  }
  return levelMap
}

export default function Timeline({ goals }: Props) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const active = goals
    .filter(g => g.is_active === 1 && g.is_completed === 0 && new Date(g.target_date) >= today)
    .sort((a, b) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime())

  if (active.length === 0) return null

  const maxDate = new Date(active[active.length - 1].target_date)
  const totalMs = Math.max(maxDate.getTime() - today.getTime(), 1)

  const W      = 900
  const PAD_L  = 55
  const PAD_R  = 55
  const TRACK  = W - PAD_L - PAD_R
  const LINE_Y = 100

  const items = active.map((goal, i) => {
    const ms    = new Date(goal.target_date).getTime() - today.getTime()
    const x     = PAD_L + (ms / totalMs) * TRACK
    const above = i % 2 === 0
    const dateStr = new Date(goal.target_date).toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'short',
    })
    const title = goal.title.length > 22 ? goal.title.slice(0, 21) + '…' : goal.title
    return { goal, x, above, dateStr, title }
  })

  const aboveLevels = assignLevels(
    items.filter(i => i.above).map(i => ({ x: i.x, id: i.goal.id }))
  )
  const belowLevels = assignLevels(
    items.filter(i => !i.above).map(i => ({ x: i.x, id: i.goal.id }))
  )

  return (
    <div className="w-full select-none">
      {/* viewBox top at -20 gives headroom for level-2 above labels */}
      <svg viewBox="0 -20 900 240" className="w-full overflow-visible" aria-hidden>

        {/* Main timeline line */}
        <line
          x1={PAD_L - 20} y1={LINE_Y}
          x2={W - PAD_R + 20} y2={LINE_Y}
          stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round"
        />

        {/* "сейчас" */}
        <circle cx={PAD_L - 20} cy={LINE_Y} r="3" fill="#1a1a1a" />
        <text x={PAD_L - 20} y={LINE_Y + 16} textAnchor="middle" fontSize="11" fill="#999" fontFamily="inherit">
          сейчас
        </text>

        {/* End dot */}
        <circle cx={W - PAD_R + 20} cy={LINE_Y} r="3" fill="#1a1a1a" />

        {/* Goal milestones */}
        {items.map(({ goal, x, above, dateStr, title }) => {
          const levelMap = above ? aboveLevels : belowLevels
          const level    = levelMap.get(goal.id) ?? 0
          const pos      = (above ? ABOVE_POS : BELOW_POS)[level]

          return (
            <g key={goal.id}>
              {/* Connector: above → label-bottom down to dot-top; below → dot-bottom down to label-top */}
              {above ? (
                <line x1={x} y1={pos.connectorY} x2={x} y2={LINE_Y - DOT_R - 1}
                  stroke="#c0c0c0" strokeWidth="1" />
              ) : (
                <line x1={x} y1={LINE_Y + DOT_R + 1} x2={x} y2={pos.connectorY}
                  stroke="#c0c0c0" strokeWidth="1" />
              )}

              {/* Dot */}
              <circle cx={x} cy={LINE_Y} r={DOT_R} fill="#1a1a1a" stroke="#F5F4EF" strokeWidth="2.5" />

              {/* Labels */}
              <text x={x} y={pos.titleY} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#1a1a1a" fontFamily="inherit">
                {title}
              </text>
              <text x={x} y={pos.dateY} textAnchor="middle" fontSize="11" fill="#999" fontFamily="inherit">
                {dateStr}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
