import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-04-22.dahlia",
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        {
          error: "Usuario no autenticado",
        },
        {
          status: 401,
        }
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      console.error("Error validando usuario:", userError?.message);

      return NextResponse.json(
        {
          error: "Sesión no válida",
        },
        {
          status: 401,
        }
      );
    }

    const userId = user.id;

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("trial_used")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Error comprobando trial_used:", profileError.message);

      return NextResponse.json(
        {
          error: "No se pudo comprobar el estado de la prueba gratuita",
        },
        {
          status: 500,
        }
      );
    }

    const trialUsed = Boolean(profile?.trial_used);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      billing_address_collection: "required",
      payment_method_types: ["card", "paypal", "sepa_debit"],

      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID as string,
          quantity: 1,
        },
      ],

      metadata: {
        userId,
        trialUsed: String(trialUsed),
      },

      subscription_data: {
        ...(trialUsed ? {} : { trial_period_days: 7 }),

        metadata: {
          userId,
          trialUsed: String(trialUsed),
        },
      },

      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/?premium=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/?premium=cancelled`,
    });

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);

    return NextResponse.json(
      {
        error: "No se pudo crear la sesión de pago",
      },
      {
        status: 500,
      }
    );
  }
}