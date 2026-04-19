"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"

export function SentryInit() {
  useEffect(() => {
    Sentry.init({
      dsn: "https://ad1f57bc727aae9f5fac4ebb534f5f06@o4511247475146752.ingest.de.sentry.io/4511247481962576",
      tracesSampleRate: 0.2,
      replaysOnErrorSampleRate: 1.0,
      replaysSessionSampleRate: 0.0,
      integrations: [Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false })],
    })
  }, [])

  return null
}
