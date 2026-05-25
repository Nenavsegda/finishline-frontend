interface Props {
  width?: number
  height?: number
  className?: string
}

export default function FinishFlagIcon({ width = 28, height = 22, className }: Props) {
  // Flag: 4 cols × 3 rows, pole on the left
  // Each cell: 6 wide × 3 tall → flag body 24×9, total viewBox 28×22
  const cells: React.ReactElement[] = []
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const black = (row + col) % 2 === 0
      cells.push(
        <rect
          key={`${row}-${col}`}
          x={3 + col * 6}
          y={2 + row * 3}
          width={6}
          height={3}
          fill={black ? '#1a1a1a' : '#ffffff'}
        />
      )
    }
  }

  return (
    <svg width={width} height={height} viewBox="0 0 28 22" fill="none" className={className}>
      {/* Pole */}
      <line x1="3" y1="2" x2="3" y2="20" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
      {/* Checkered cells */}
      {cells}
      {/* Flag border (makes white cells visible on cream bg) */}
      <rect x="3" y="2" width="24" height="9" fill="none" stroke="#1a1a1a" strokeWidth="0.6" />
    </svg>
  )
}
