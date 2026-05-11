import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-04-22.dahlia",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

function unixToIsoDate(timestamp: number | null | undefined): string | null {
  if (!timestamp) return null;
  return new Date(timestamp * 1000).toISOString();
}

function getSubscriptionPeriodEnd(
  subscription: Stripe.Subscription
): string | null {
  const firstItem = subscription.items?.data?.[0];

  return unixToIsoDate(firstItem?.current_period_end);
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const invoiceWithSubscription = invoice as Stripe.Invoice & {
    subscription?: string | Stripe.Subscription | null;
  };

  const subscription = invoiceWithSubscription.subscription;

  if (typeof subscription === "string") return subscription;

  return subscription?.id || null;
}

function isPremiumStatus(status: Stripe.Subscription.Status): boolean {
  return status === "active" || status === "trialing" || status === "past_due";
}

async function setPremiumFromSubscription({
  userId,
  customerId,
  subscription,
}: {
  userId: string;
  customerId: string | null;
  subscription: Stripe.Subscription;
}) {
  const premiumActive = isPremiumStatus(subscription.status);
  const premiumUntil = getSubscriptionPeriodEnd(subscription);

  const { error } = await supabase
    .from("profiles")
    .update({
      premium: premiumActive,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      stripe_subscription_status: subscription.status,
      premium_until: premiumUntil,
      cancel_at_period_end: subscription.cancel_at_period_end,
      trial_used: true,
    })
    .eq("id", userId);

  if (error) {
    console.error("Supabase subscription update error:", error.message);
    throw error;
  }

  console.log("Suscripción actualizada para:", userId);
}

async function updateSubscriptionById(subscription: Stripe.Subscription) {
  const premiumActive = isPremiumStatus(subscription.status);
  const premiumUntil = getSubscriptionPeriodEnd(subscription);

  const { error } = await supabase
    .from("profiles")
    .update({
      premium: premiumActive,
      stripe_subscription_status: subscription.status,
      premium_until: premiumUntil,
      cancel_at_period_end: subscription.cancel_at_period_end,
      trial_used: true,
    })
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    console.error("Supabase subscription status update error:", error.message);
    throw error;
  }

  console.log("Estado de suscripción actualizado:", subscription.id);
}

async function deactivatePremiumBySubscription(subscriptionId: string) {
  const { error } = await supabase
    .from("profiles")
    .update({
      premium: false,
      stripe_subscription_status: "canceled",
      stripe_subscription_id: null,
      premium_until: null,
      cancel_at_period_end: false,
      trial_used: true,
    })
    .eq("stripe_subscription_id", subscriptionId);

  if (error) {
    console.error("Supabase premium deactivation error:", error.message);
    throw error;
  }

  console.log("Premium desactivado para subscription:", subscriptionId);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe signature" },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const userId = session.metadata?.userId;

        if (!userId) {
          return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        const customerId =
          typeof session.customer === "string" ? session.customer : null;

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : null;

        if (!subscriptionId) {
          return NextResponse.json(
            { error: "Missing subscriptionId" },
            { status: 400 }
          );
        }

        const subscription = await stripe.subscriptions.retrieve(
          subscriptionId,
          {
            expand: ["items.data"],
          }
        );

        await setPremiumFromSubscription({
          userId,
          customerId,
          subscription,
        });

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        const userId = subscription.metadata?.userId;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : null;

        if (userId) {
          await setPremiumFromSubscription({
            userId,
            customerId,
            subscription,
          });
        } else {
          await updateSubscriptionById(subscription);
        }

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = getInvoiceSubscriptionId(invoice);

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(
            subscriptionId,
            {
              expand: ["items.data"],
            }
          );

          await updateSubscriptionById(subscription);
        }

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = getInvoiceSubscriptionId(invoice);

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(
            subscriptionId,
            {
              expand: ["items.data"],
            }
          );

          await updateSubscriptionById(subscription);
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await deactivatePremiumBySubscription(subscription.id);

        break;
      }

      default: {
        console.log(`Evento Stripe ignorado: ${event.type}`);
      }
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error("Webhook error:", error);

    return NextResponse.json(
      {
        error: "Webhook failed",
      },
      {
        status: 400,
      }
    );
  }
}