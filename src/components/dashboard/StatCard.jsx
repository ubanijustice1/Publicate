export default function StatCard({ icon: Icon, label, value, hint, accent = false }) {
  return (
    <div className="card flex items-start gap-4 p-5">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          accent ? 'bg-accent-50 text-accent-600' : 'bg-primary-50 text-primary-700'
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-slate-900">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
      </div>
    </div>
  )
}
