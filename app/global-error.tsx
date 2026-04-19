"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { Sentry.captureException(error) }, [error])

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background text-foreground">
          <h2 className="text-xl font-bold">Bir şeyler ters gitti</h2>
          <button
            onClick={reset}
            className="px-4 py-2 bg-[#f2ff00] text-black font-semibold rounded-lg hover:opacity-90"
          >
            Tekrar Dene
          </button>
        </div>
      </body>
    </html>
  )
}
