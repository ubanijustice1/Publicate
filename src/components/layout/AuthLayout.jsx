export default function AuthLayout({ heading, subheading, children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-primary-600 to-primary-800 p-12 text-white lg:flex">
        <a href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-lg font-bold">
            P
          </div>
          <span className="text-xl font-bold">Publicate</span>
        </a>
        <div>
          <h2 className="max-w-md text-3xl font-bold leading-tight">
            Grow your audience, one post at a time.
          </h2>
          <p className="mt-4 max-w-sm text-primary-100">
            Plan content, write captions with AI, and see exactly what it takes to get paid —
            built for creators and businesses across Nigeria.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-primary-100">
          <span className="h-2 w-2 rounded-full bg-accent" />
          Trusted by creators in Lagos, Abuja, Maiduguri and Port Harcourt
        </div>
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-32 -left-10 h-72 w-72 rounded-full bg-accent/20" />
      </div>

      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-10 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
              P
            </div>
            <span className="text-lg font-bold text-slate-900">Publicate</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{heading}</h1>
          <p className="mt-1.5 text-sm text-slate-500">{subheading}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  )
}
