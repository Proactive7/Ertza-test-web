import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-04-30.basil",
});

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

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      billing_address_collection: "required",

      payment_method_types: [
        "card",
        "paypal",
        "sepa_debit",
      ],

      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID as string,
          quantity: 1,
        },
      ],

      metadata: {
        userId,
      },

      subscription_data: {
        metadata: {
          userId,
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