import * as Sentry from "@sentry/nextjs"

const DSN = "https://ad1f57bc727aae9f5fac4ebb534f5f06@o4511247475146752.ingest.de.sentry.io/4511247481962576"

Sentry.init({
  dsn: DSN,
  environment: process.env.NODE_ENV ?? "production",
  tracesSampleRate: 0.2,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.0,
  integrations: [Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false })],
})
