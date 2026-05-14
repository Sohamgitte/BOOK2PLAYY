import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

interface CheckAvailabilityPayload {
  courtId: string;
  slotDate: string;
  startTime: string;
  endTime: string;
}

interface LockSlotPayload {
  courtId: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  transactionId: string;
}

interface CreateBookingPayload {
  courtId: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  transactionId: string;
}

interface CancelBookingPayload {
  bookingId: string;
  reason: string;
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

async function calculatePeakPrice(
  courtId: string,
  slotDate: string,
  startTime: string,
  basePrice: number,
): Promise<number> {
  const date = new Date(slotDate);
  const dayOfWeek = date.getDay();

  const { data: peakRules } = await supabase
    .from("peak_pricing_rules")
    .select("*")
    .eq("court_id", courtId)
    .eq("day_of_week", dayOfWeek)
    .eq("is_active", true);

  const { data: holidayMultiplier } = await supabase
    .from("holiday_dates")
    .select("multiplier")
    .eq("holiday_date", slotDate)
    .eq("is_active", true)
    .maybeSingle();

  let multiplier = 1.0;

  if (holidayMultiplier) {
    multiplier = holidayMultiplier.multiplier;
  } else if (peakRules && peakRules.length > 0) {
    const [hours, minutes] = startTime.split(":").map(Number);
    const slotTimeMinutes = hours * 60 + minutes;

    for (const rule of peakRules) {
      const [ruleStartHours, ruleStartMins] = (rule.start_time || "00:00")
        .split(":")
        .map(Number);
      const [ruleEndHours, ruleEndMins] = (rule.end_time || "23:59")
        .split(":")
        .map(Number);

      const ruleStartMinutes = ruleStartHours * 60 + ruleStartMins;
      const ruleEndMinutes = ruleEndHours * 60 + ruleEndMins;

      if (slotTimeMinutes >= ruleStartMinutes && slotTimeMinutes < ruleEndMinutes) {
        multiplier = Math.max(multiplier, rule.multiplier);
      }
    }
  }

  return Number((basePrice * multiplier).toFixed(2));
}

async function checkAvailability(req: Request): Promise<Response> {
  try {
    const payload: CheckAvailabilityPayload = await req.json();

    const { data: conflicts } = await supabase
      .from("bookings")
      .select("*")
      .eq("court_id", payload.courtId)
      .eq("booking_date", payload.slotDate)
      .in("status", ["confirmed", "completed"])
      .or(
        `and(start_time.gte.${payload.startTime},start_time.lt.${payload.endTime}),and(end_time.gt.${payload.startTime},end_time.lte.${payload.endTime})`,
      );

    const { data: locks } = await supabase
      .from("slot_locks")
      .select("*")
      .eq("court_id", payload.courtId)
      .eq("slot_date", payload.slotDate)
      .eq("status", "locked")
      .gt("expires_at", new Date().toISOString())
      .or(
        `and(start_time.gte.${payload.startTime},start_time.lt.${payload.endTime}),and(end_time.gt.${payload.startTime},end_time.lte.${payload.endTime})`,
      );

    const isAvailable = !conflicts || conflicts.length === 0;
    const hasActiveLocks = locks && locks.length > 0;

    return new Response(
      JSON.stringify({
        available: isAvailable && !hasActiveLocks,
        conflicts: conflicts?.length || 0,
        activeLocks: locks?.length || 0,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Availability check error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}

async function lockSlot(req: Request): Promise<Response> {
  try {
    const payload: LockSlotPayload = await req.json();
    const userId = req.headers.get("x-user-id") || "";

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { data: court } = await supabase
      .from("courts")
      .select("price_per_hour")
      .eq("id", payload.courtId)
      .maybeSingle();

    if (!court) {
      return new Response(
        JSON.stringify({ error: "Court not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const peakPrice = await calculatePeakPrice(
      payload.courtId,
      payload.slotDate,
      payload.startTime,
      court.price_per_hour,
    );

    const { data: existingLock } = await supabase
      .from("slot_locks")
      .select("*")
      .eq("transaction_id", payload.transactionId)
      .maybeSingle();

    if (existingLock) {
      return new Response(
        JSON.stringify({
          lockId: existingLock.id,
          transactionId: existingLock.transaction_id,
          message: "Lock already exists for this transaction",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { data: lock, error: lockError } = await supabase
      .from("slot_locks")
      .insert({
        court_id: payload.courtId,
        slot_date: payload.slotDate,
        start_time: payload.startTime,
        end_time: payload.endTime,
        user_id: userId,
        transaction_id: payload.transactionId,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (lockError) {
      console.error("Lock creation error:", lockError);
      return new Response(
        JSON.stringify({ error: "Failed to lock slot" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        lockId: lock.id,
        transactionId: lock.transaction_id,
        expiresAt: lock.expires_at,
        basePrice: court.price_per_hour,
        peakPrice,
        message: "Slot locked successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Slot locking error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}

async function createBooking(req: Request): Promise<Response> {
  try {
    const payload: CreateBookingPayload = await req.json();
    const userId = req.headers.get("x-user-id") || "";

    const { data: lock } = await supabase
      .from("slot_locks")
      .select("*")
      .eq("transaction_id", payload.transactionId)
      .eq("status", "locked")
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (!lock) {
      return new Response(
        JSON.stringify({ error: "Slot lock expired or invalid" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { data: court } = await supabase
      .from("courts")
      .select("price_per_hour")
      .eq("id", payload.courtId)
      .maybeSingle();

    const peakPrice = await calculatePeakPrice(
      payload.courtId,
      payload.slotDate,
      payload.startTime,
      court?.price_per_hour || 0,
    );

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        player_id: userId,
        court_id: payload.courtId,
        booking_date: payload.slotDate,
        start_time: payload.startTime,
        end_time: payload.endTime,
        base_price: court?.price_per_hour || 0,
        peak_price: peakPrice,
        total_amount: peakPrice,
        status: "pending",
        payment_status: "pending",
      })
      .select()
      .single();

    if (bookingError) {
      return new Response(
        JSON.stringify({ error: "Failed to create booking" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    await supabase
      .from("slot_locks")
      .update({ status: "released" })
      .eq("id", lock.id);

    return new Response(
      JSON.stringify({
        bookingId: booking.id,
        totalAmount: booking.total_amount,
        peakPrice,
        status: "pending_payment",
        message: "Booking created, awaiting payment",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Booking creation error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}

async function cancelBooking(req: Request): Promise<Response> {
  try {
    const payload: CancelBookingPayload = await req.json();

    const { data: booking } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", payload.bookingId)
      .maybeSingle();

    if (!booking) {
      return new Response(
        JSON.stringify({ error: "Booking not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const bookingTime = new Date(`${booking.booking_date} ${booking.start_time}`);
    const hoursUntilBooking = (bookingTime.getTime() - Date.now()) / (1000 * 60 * 60);

    let refundPercentage = 0;
    if (hoursUntilBooking >= 24) {
      refundPercentage = 100;
    } else if (hoursUntilBooking >= 12) {
      refundPercentage = 75;
    } else if (hoursUntilBooking >= 6) {
      refundPercentage = 50;
    } else if (hoursUntilBooking > 0) {
      refundPercentage = 25;
    }

    const { data: paymentTx } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("booking_id", booking.id)
      .eq("status", "completed")
      .maybeSingle();

    let refundTx = null;
    if (paymentTx && refundPercentage > 0) {
      const { data } = await supabase
        .from("refund_transactions")
        .insert({
          payment_transaction_id: paymentTx.id,
          booking_id: booking.id,
          user_id: booking.player_id,
          refund_amount: (paymentTx.amount * refundPercentage) / 100,
          refund_percentage: refundPercentage,
          status: "completed",
        })
        .select()
        .single();
      refundTx = data;

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
        amount: refundTx.refund_amount,
        balance_after: currentBalance + refundTx.refund_amount,
        reference_type: "refund",
        reference_id: refundTx.id,
        description: `Refund for cancelled booking (${refundPercentage}%)`,
      });
    }

    await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        cancellation_reason: payload.reason,
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", booking.id);

    return new Response(
      JSON.stringify({
        bookingId: booking.id,
        refundPercentage,
        refundAmount: refundTx?.refund_amount || 0,
        message: "Booking cancelled successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Booking cancellation error:", error);
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

  if (url.pathname === "/booking_engine/check-availability" && req.method === "POST") {
    return checkAvailability(req);
  }

  if (url.pathname === "/booking_engine/lock-slot" && req.method === "POST") {
    return lockSlot(req);
  }

  if (url.pathname === "/booking_engine/create-booking" && req.method === "POST") {
    return createBooking(req);
  }

  if (url.pathname === "/booking_engine/cancel-booking" && req.method === "POST") {
    return cancelBooking(req);
  }

  return new Response(
    JSON.stringify({ error: "Not found" }),
    {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
