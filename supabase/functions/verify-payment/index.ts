import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Boost duration mapping (in hours)
const BOOST_DURATIONS: Record<string, number> = {
  "boost-daily": 24,
  "boost-48h": 48,
  "starter-pack": 0, // Pack non ha durata fissa
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authenticated user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get session_id from request
    const { session_id } = await req.json();
    
    if (!session_id) {
      throw new Error("Missing session_id");
    }

    console.log(`Verifying payment for session ${session_id}`);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    const product_id = session.metadata?.product_id;
    if (!product_id) {
      throw new Error("Product ID not found in session metadata");
    }

    // Create service role client for database operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if purchase already exists (idempotency)
    const { data: existingPurchase } = await supabaseAdmin
      .from("purchases")
      .select("id")
      .eq("stripe_payment_intent_id", session.payment_intent as string)
      .single();

    if (existingPurchase) {
      console.log(`Purchase already processed: ${existingPurchase.id}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          already_processed: true,
          purchase_id: existingPurchase.id 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Create purchase record
    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from("purchases")
      .insert({
        user_id: user.id,
        product_id: product_id,
        stripe_payment_intent_id: session.payment_intent as string,
        amount: session.amount_total! / 100, // Convert from cents
        currency: session.currency!,
        status: "completed",
        metadata: {
          session_id: session_id,
          customer_email: session.customer_details?.email,
        },
      })
      .select()
      .single();

    if (purchaseError) {
      console.error("Error creating purchase:", purchaseError);
      throw purchaseError;
    }

    console.log(`Purchase created: ${purchase.id}`);

    // Activate boost if applicable
    const duration = BOOST_DURATIONS[product_id];
    if (duration > 0) {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + duration * 60 * 60 * 1000);

      const { data: boost, error: boostError } = await supabaseAdmin
        .from("active_boosts")
        .insert({
          user_id: user.id,
          product_id: product_id,
          purchase_id: purchase.id,
          activated_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          is_active: true,
        })
        .select()
        .single();

      if (boostError) {
        console.error("Error creating boost:", boostError);
        throw boostError;
      }

      console.log(`Boost activated: ${boost.id}, expires at ${expiresAt}`);

      return new Response(
        JSON.stringify({ 
          success: true,
          purchase_id: purchase.id,
          boost_id: boost.id,
          expires_at: expiresAt.toISOString(),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // For starter pack, just return purchase
    return new Response(
      JSON.stringify({ 
        success: true,
        purchase_id: purchase.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error verifying payment:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
