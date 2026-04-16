import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

async function requireUploader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
  return ["ADMIN", "SALON_OWNER"].includes(profile?.role ?? "")
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

export async function POST(request: Request) {
  const allowed = await requireUploader()
  if (!allowed) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 })

  if (file.size > MAX_FILE_SIZE)
    return NextResponse.json({ error: "Dosya 5 MB'ı geçemez" }, { status: 400 })

  const allowedMimes = ["image/jpeg", "image/png", "image/webp"]
  if (!allowedMimes.includes(file.type))
    return NextResponse.json({ error: "Sadece JPG, PNG veya WebP yüklenebilir" }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg"
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const adminClient = createAdminClient()
  const { error } = await adminClient.storage
    .from("salon-gallery")
    .upload(filename, buffer, { contentType: file.type, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = adminClient.storage.from("salon-gallery").getPublicUrl(filename)
  return NextResponse.json({ url: publicUrl })
}
