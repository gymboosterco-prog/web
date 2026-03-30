import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, gymName, instagramUrl } = body

    if (!name || !email || !phone || !gymName) {
      return NextResponse.json(
        { error: "Tüm alanlar zorunludur" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from("leads")
      .insert([
        {
          name,
          email,
          phone,
          gym_name: gymName,
          instagram_url: instagramUrl,
          status: "new",
          source: "website"
        }
      ])


    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json(
        { error: `Supabase hatası: ${error.message || "Bilinmeyen hata"}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error("API error:", error)
    
    // Check if it's our configuration error
    if (error.message?.includes("Supabase URL ve Anon Key")) {
      return NextResponse.json(
        { error: "Sistem yapılandırma hatası: Supabase anahtarları eksik." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check for authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      )
    }


    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json(
        { error: "Leads getirilemedi" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
}
