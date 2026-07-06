export default function ScoreGauge({ score = 0, size = 140 }) {
  const radius = (size - 14) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color = score >= 80 ? '#16a34a' : score >= 50 ? '#f97316' : '#dc2626'

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e2e8f0" strokeWidth="10" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-900">{score}</span>
        <span className="text-xs text-slate-400">/ 100</span>
      </div>
    </div>
  )
}
