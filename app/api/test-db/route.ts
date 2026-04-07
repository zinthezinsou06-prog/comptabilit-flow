import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables")
}

export async function GET(request: Request) {
  try {
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: "Missing Supabase configuration" },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const results = {
      success: true,
      checks: [] as any[],
    }

    // Check if tables exist
    const tableChecks = ["categories", "depenses", "retraits", "logs", "user_settings"]

    for (const table of tableChecks) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select("count(*)", { count: "exact", head: true })

        results.checks.push({
          table,
          exists: !error,
          rowCount: data?.length || 0,
          error: error?.message || null,
        })
      } catch (e) {
        results.checks.push({
          table,
          exists: false,
          error: String(e),
        })
      }
    }

    // Try to get user (will fail if not authenticated, but that's ok for this test)
    const { data: authData, error: authError } = await supabase.auth.getUser()
    results.checks.push({
      test: "Authentication",
      authenticated: !authError,
      userId: authData?.user?.id || null,
      error: authError?.message || null,
    })

    return NextResponse.json(results)
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
