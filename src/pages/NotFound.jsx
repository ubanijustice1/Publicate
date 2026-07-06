import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="text-xl font-semibold text-slate-900">Page not found</h1>
      <p className="text-sm text-slate-500">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-2">
        Back to home
      </Link>
    </div>
  )
}
