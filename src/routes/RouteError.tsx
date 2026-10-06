import { isRouteErrorResponse, useRouteError } from 'react-router-dom'

/** Last-resort error screen for crashes inside a route. Plain markup so it renders even if shared UI fails. */
export function RouteError() {
  const error = useRouteError()
  const chunkFailed = error instanceof Error && /Failed to fetch dynamically imported module|Importing a module script failed/i.test(error.message)
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : chunkFailed
      ? 'A new version of the site is available. Reload to continue.'
      : 'Something went wrong while showing this page.'

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-bg px-6 text-center text-ink">
      <p className="eyebrow">Unique Lights</p>
      <h1 className="text-[2.2rem]">The lights flickered.</h1>
      <p className="max-w-md text-muted">{message}</p>
      <div className="flex gap-3">
        <button type="button" onClick={() => window.location.reload()} className="h-11 rounded-full bg-ink px-5 font-semibold text-bg">
          Reload
        </button>
        <a href="/" className="flex h-11 items-center rounded-full border border-line-strong px-5 font-semibold">
          Go home
        </a>
      </div>
    </div>
  )
}
