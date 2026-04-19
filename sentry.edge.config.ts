import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: "https://ad1f57bc727aae9f5fac4ebb534f5f06@o4511247475146752.ingest.de.sentry.io/4511247481962576",
  tracesSampleRate: 0.1,
})
