import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const rateMap = new Map<string, { count: number; resetAt: number }>()

export async function proxy(request: NextRequest) {
  // Rate limiting: /api/salon-leads POST — 1 dakikada 5 istek
  if (request.method === "POST" && request.nextUrl.pathname === "/api/salon-leads") {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"
    const now = Date.now()
    const entry = rateMap.get(ip)
    if (!entry || now > entry.resetAt) {
      rateMap.set(ip, { count: 1, resetAt: now + 60_000 })
    } else if (entry.count >= 5) {
      return NextResponse.json(
        { error: "Çok fazla istek. Lütfen bir dakika bekleyin." },
        { status: 429 }
      )
    } else {
      entry.count++
    }
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set({ name, value, ...options })
          )
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Süresi dolmuş session'ı yeniler — Server Components için gerekli
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
