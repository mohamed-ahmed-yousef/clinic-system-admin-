import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-[-8rem] top-[-5rem] h-64 w-64 rounded-full bg-sky-300/25 blur-3xl" />
        <div className="absolute bottom-[-7rem] right-[-4rem] h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
      </div>

      <section className="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
              <img
                src="/logo photo 1.svg"
                alt="Horus Clinic System"
                className="h-8 w-auto object-contain"
              />
              <div className="leading-tight">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Horus
                </p>
                <p className="text-sm font-semibold text-slate-900">Clinic System Admin</p>
              </div>
            </div>

            <div className="space-y-5">
              <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-600 ring-1 ring-red-100">
                404 error
              </span>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Page not found
                </p>
                <h1 className="mt-3 max-w-xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                  This screen does not exist in the admin panel.
                </h1>
              </div>
              <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                The link may be outdated, typed incorrectly, or point to a route that is not
                available in this deployment. Use one of the actions below to get back to a valid
                screen.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/admin-123"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Go to sign in
              </Link>
              <Link
                href="/dashboard/brands"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Open dashboard
              </Link>
            </div>
          </div>

          <div className="relative border-t border-slate-100 bg-slate-950 px-6 py-10 text-white sm:px-10 lg:border-l lg:border-t-0 lg:px-10 lg:py-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.2),transparent_35%),radial-gradient(circle_at_bottom,rgba(99,102,241,0.32),transparent_38%)]" />
            <div className="relative">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-sm">
                <div className="flex items-end gap-3">
                  <span className="text-7xl font-black tracking-[-0.08em] text-white/95">404</span>
                  <span className="mb-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-100">
                    Invalid Route
                  </span>
                </div>
                <div className="mt-6 space-y-3 text-sm text-slate-200">
                  <p className="font-semibold text-white">Try one of these known routes:</p>
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 font-mono text-sky-100">
                    /admin-123
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 font-mono text-sky-100">
                    /dashboard/brands
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 font-mono text-sky-100">
                    /dashboard/users
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
