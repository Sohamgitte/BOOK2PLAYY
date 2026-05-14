import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import * as crypto from "node:crypto";

interface PaymentPayload {
  bookingId: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

interface RefundPayload {
  paymentTransactionId: string;
  refundPercentage: number;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
);

function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string,
): boolean {
  const message = `${orderId}|${paymentId}`;
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(message);
  const generatedSignature = hmac.digest("hex");
  return generatedSignature === signature;
}

async function handlePaymentVerification(req: Request): Promise<Response> {
  try {
    const payload: PaymentPayload = await req.json();

    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET") || "";
    const isValid = verifyRazorpaySignature(
      payload.razorpayOrderId,
      payload.razorpayPaymentId,
      payload.razorpaySignature,
      razorpayKeySecret,
    );

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "Invalid payment signature" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", payload.bookingId)
      .maybeSingle();

    if (bookingError || !booking) {
      return new Response(
        JSON.stringify({ error: "Booking not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { data: existingPayment } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("razorpay_payment_id", payload.razorpayPaymentId)
      .maybeSingle();

    if (existingPayment) {
      return new Response(
        JSON.stringify({
          status: "completed",
          paymentId: existingPayment.id,
          message: "Payment already processed",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { data: paymentTx, error: paymentError } = await supabase
      .from("payment_transactions")
      .insert({
        user_id: booking.player_id,
        booking_id: payload.bookingId,
        amount: payload.amount,
        currency: payload.currency,
        razorpay_order_id: payload.razorpayOrderId,
        razorpay_payment_id: payload.razorpayPaymentId,
        razorpay_signature: payload.razorpaySignature,
        status: "completed",
      })
      .select()
      .single();

    if (paymentError) {
      return new Response(
        JSON.stringify({ error: "Failed to save payment" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    await supabase
      .from("bookings")
      .update({ status: "confirmed", payment_status: "paid" })
      .eq("id", payload.bookingId);

    const currentBalance = (await supabase
      .from("wallet_transactions")
      .select("balance_after")
      .eq("user_id", booking.player_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()).data?.balance_after || 0;

    await supabase.from("wallet_transactions").insert({
      user_id: booking.player_id,
      transaction_type: "credit",
      amount: payload.amount,
      balance_after: currentBalance + payload.amount,
      reference_type: "payment",
      reference_id: paymentTx.id,
      description: `Payment for booking at ${booking.booking_date}`,
    });

    await supabase
      .from("slot_locks")
      .update({ status: "released" })
      .eq("user_id", booking.player_id)
      .eq("court_id", booking.court_id)
      .eq("slot_date", booking.booking_date);

    return new Response(
      JSON.stringify({
        status: "completed",
        paymentId: paymentTx.id,
        bookingId: booking.id,
        message: "Payment verified successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}

async function handleRefund(req: Request): Promise<Response> {
  try {
    const payload: RefundPayload = await req.json();

    const { data: paymentTx, error: paymentError } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("id", payload.paymentTransactionId)
      .maybeSingle();

    if (paymentError || !paymentTx) {
      return new Response(
        JSON.stringify({ error: "Payment transaction not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const refundAmount = (paymentTx.amount * payload.refundPercentage) / 100;

    const { data: refundTx, error: refundError } = await supabase
      .from("refund_transactions")
      .insert({
        payment_transaction_id: paymentTx.id,
        booking_id: paymentTx.booking_id,
        user_id: paymentTx.user_id,
        refund_amount: refundAmount,
        refund_percentage: payload.refundPercentage,
        refund_method: "wallet",
        status: "completed",
      })
      .select()
      .single();

    if (refundError) {
      return new Response(
        JSON.stringify({ error: "Failed to create refund" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const currentBalance = (await supabase
      .from("wallet_transactions")
      .select("balance_after")
      .eq("user_id", paymentTx.user_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()).data?.balance_after || 0;

    await supabase.from("wallet_transactions").insert({
      user_id: paymentTx.user_id,
      transaction_type: "credit",
      amount: refundAmount,
      balance_after: currentBalance + refundAmount,
      reference_type: "refund",
      reference_id: refundTx.id,
      description: `Refund for cancelled booking (${payload.refundPercentage}%)`,
    });

    await supabase
      .from("payment_transactions")
      .update({ status: "refunded" })
      .eq("id", paymentTx.id);

    return new Response(
      JSON.stringify({
        status: "completed",
        refundId: refundTx.id,
        refundAmount,
        message: "Refund processed successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Refund processing error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const url = new URL(req.url);

  if (url.pathname === "/payment_processing/verify" && req.method === "POST") {
    return handlePaymentVerification(req);
  }

  if (url.pathname === "/payment_processing/refund" && req.method === "POST") {
    return handleRefund(req);
  }

  return new Response(
    JSON.stringify({ error: "Not found" }),
    {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
