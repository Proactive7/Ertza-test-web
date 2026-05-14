import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("profiles")
      .update({
        premium: false,
        cancel_at_period_end: false,
        trial_used: true,
        stripe_subscription_status: "expired",
      })
      .lte("premium_until", now)
      .eq("premium", true)
      .select("id, username, premium_until, stripe_subscription_status");

    if (error) {
      console.error("SYNC EXPIRED ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      checkedAt: now,
      updatedUsers: data?.length || 0,
      users: data || [],
    });
  } catch (err) {
    console.error("SYNC EXPIRED CATCH:", err);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}