import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import * as crypto from "node:crypto";

interface GenerateQRPayload {
  bookingId: string;
}

interface CheckInPayload {
  token: string;
  latitude?: number;
  longitude?: number;
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

function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

async function generateQRCode(req: Request): Promise<Response> {
  try {
    const payload: GenerateQRPayload = await req.json();
    const userId = req.headers.get("x-user-id") || "";

    const { data: booking } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", payload.bookingId)
      .eq("player_id", userId)
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

    const { data: existingQR } = await supabase
      .from("qr_codes")
      .select("*")
      .eq("booking_id", payload.bookingId)
      .eq("is_used", false)
      .maybeSingle();

    if (existingQR) {
      return new Response(
        JSON.stringify({
          qrCodeId: existingQR.id,
          token: existingQR.token,
          bookingId: payload.bookingId,
          message: "QR code already generated",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const token = generateSecureToken();

    const { data: qrCode, error: qrError } = await supabase
      .from("qr_codes")
      .insert({
        booking_id: payload.bookingId,
        token,
        is_used: false,
      })
      .select()
      .single();

    if (qrError) {
      return new Response(
        JSON.stringify({ error: "Failed to generate QR code" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(token)}`;

    return new Response(
      JSON.stringify({
        qrCodeId: qrCode.id,
        token,
        qrUrl: qrDataUrl,
        bookingId: payload.bookingId,
        message: "QR code generated successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("QR generation error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}

async function checkIn(req: Request): Promise<Response> {
  try {
    const payload: CheckInPayload = await req.json();
    const userId = req.headers.get("x-user-id") || "";

    const { data: qrCode } = await supabase
      .from("qr_codes")
      .select("*")
      .eq("token", payload.token)
      .eq("is_used", false)
      .maybeSingle();

    if (!qrCode) {
      return new Response(
        JSON.stringify({ error: "Invalid or already used QR code" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { data: booking } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", qrCode.booking_id)
      .eq("player_id", userId)
      .maybeSingle();

    if (!booking) {
      return new Response(
        JSON.stringify({ error: "Booking not found or not authorized" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const bookingTime = new Date(`${booking.booking_date} ${booking.start_time}`);
    const now = new Date();
    const timeDiffMinutes = (now.getTime() - bookingTime.getTime()) / (1000 * 60);

    if (timeDiffMinutes < -5 || timeDiffMinutes > 30) {
      return new Response(
        JSON.stringify({
          error: "Check-in not allowed at this time",
          message:
            timeDiffMinutes < -5 ? "Too early to check in" : "Too late to check in",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { data: checkIn, error: checkInError } = await supabase
      .from("check_ins")
      .insert({
        booking_id: qrCode.booking_id,
        user_id: userId,
        qr_code_id: qrCode.id,
        latitude: payload.latitude,
        longitude: payload.longitude,
        checked_in_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (checkInError) {
      return new Response(
        JSON.stringify({ error: "Failed to check in" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    await supabase
      .from("qr_codes")
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq("id", qrCode.id);

    await supabase
      .from("bookings")
      .update({ checked_in_at: new Date().toISOString() })
      .eq("id", booking.id);

    return new Response(
      JSON.stringify({
        checkInId: checkIn.id,
        bookingId: booking.id,
        checkedInAt: checkIn.checked_in_at,
        message: "Check-in successful",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Check-in error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}

async function verifyCheckIn(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const bookingId = url.searchParams.get("bookingId");

    const { data: checkIn } = await supabase
      .from("check_ins")
      .select("*")
      .eq("booking_id", bookingId)
      .maybeSingle();

    if (!checkIn) {
      return new Response(
        JSON.stringify({
          verified: false,
          message: "No check-in found for this booking",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        verified: true,
        checkInId: checkIn.id,
        checkedInAt: checkIn.checked_in_at,
        latitude: checkIn.latitude,
        longitude: checkIn.longitude,
        message: "Check-in verified",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Verification error:", error);
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

  if (url.pathname === "/checkin_verification/generate-qr" && req.method === "POST") {
    return generateQRCode(req);
  }

  if (url.pathname === "/checkin_verification/checkin" && req.method === "POST") {
    return checkIn(req);
  }

  if (url.pathname === "/checkin_verification/verify" && req.method === "GET") {
    return verifyCheckIn(req);
  }

  return new Response(
    JSON.stringify({ error: "Not found" }),
    {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
