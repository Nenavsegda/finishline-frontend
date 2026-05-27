interface Props {
  size?: number
  className?: string
}

// 3×3 checkerboard square logo
export default function FinishFlagIcon({ size = 24, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 30 30"
      fill="none"
      className={className}
    >
      {([0, 1, 2] as const).map(r =>
        ([0, 1, 2] as const).map(c => (
          <rect
            key={`${r}-${c}`}
            x={c * 10}
            y={r * 10}
            width={10}
            height={10}
            fill={(r + c) % 2 === 0 ? '#1a1a1a' : '#F5F4EF'}
          />
        ))
      )}
    </svg>
  )
}
