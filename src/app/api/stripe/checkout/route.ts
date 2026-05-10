import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-04-30.basil",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const userId = body.userId;

    if (!userId) {
      return NextResponse.json(
        {
          error: "Falta userId",
        },
        {
          status: 400,
        }
      );
    }

    const { data: profile, error: profileError } = await supabase
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