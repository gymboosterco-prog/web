import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
  if (profile?.role !== "ADMIN") return null
  return supabase
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await requireAdmin()
  if (!supabase) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })

  const { email, password } = await request.json()
  if (!email) return NextResponse.json({ error: "E-posta zorunlu" }, { status: 400 })

  const adminClient = createAdminClient()
  let userId: string | undefined

  if (password) {
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (error) {
      // Kullanıcı zaten varsa şifresini güncelle
      const { data: listData } = await adminClient.auth.admin.listUsers()
      const existing = listData?.users?.find(u => u.email === email)
      if (existing) {
        await adminClient.auth.admin.updateUserById(existing.id, { password })
        userId = existing.id
      } else {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else {
      userId = data.user?.id
    }
  } else {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.gymbooster.tr"
    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?next=/portal`,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    userId = data.user?.id
  }

  if (userId) {
    await adminClient.from("profiles").upsert({
      id: userId,
      email,
      role: "SALON_OWNER",
      salon_id: id,
    })
    await adminClient.from("salons").update({ owner_email: email }).eq("id", id)
  }

  return NextResponse.json({ success: true, method: password ? "created" : "invited" })
}
