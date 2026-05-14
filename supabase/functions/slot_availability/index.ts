import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

interface SlotAvailabilityPayload {
  courtId: string;
  startDate: string;
  endDate: string;
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

function generateTimeSlots(startTime: string = "06:00", endTime: string = "23:00"): string[] {
  const slots: string[] = [];
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  let currentHour = startHour;
  let currentMin = startMin;

  while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
    slots.push(
      `${String(currentHour).padStart(2, "0")}:${String(currentMin).padStart(2, "0")}`,
    );

    currentMin += 60;
    if (currentMin >= 60) {
      currentHour += 1;
      currentMin = 0;
    }
  }

  return slots;
}

async function getSlotAvailability(req: Request): Promise<Response> {
  try {
    const payload: SlotAvailabilityPayload = await req.json();

    const { data: court } = await supabase
      .from("courts")
      .select("*")
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

    const { data: bookings } = await supabase
      .from("bookings")
      .select("*")
      .eq("court_id", payload.courtId)
      .gte("booking_date", payload.startDate)
      .lte("booking_date", payload.endDate)
      .in("status", ["confirmed", "completed"]);

    const { data: locks } = await supabase
      .from("slot_locks")
      .select("*")
      .eq("court_id", payload.courtId)
      .gte("slot_date", payload.startDate)
      .lte("slot_date", payload.endDate)
      .eq("status", "locked")
      .gt("expires_at", new Date().toISOString());

    const { data: queue } = await supabase
      .from("waiting_queue")
      .select("*")
      .eq("court_id", payload.courtId)
      .gte("slot_date", payload.startDate)
      .lte("slot_date", payload.endDate)
      .in("status", ["waiting", "notified"]);

    const availability: Record<
      string,
      {
        date: string;
        slots: Array<{
          time: string;
          available: boolean;
          booked: boolean;
          locked: boolean;
          queueWaiting: number;
        }>;
      }
    > = {};

    const startDate = new Date(payload.startDate);
    const endDate = new Date(payload.endDate);

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const timeSlots = generateTimeSlots();

      availability[dateStr] = {
        date: dateStr,
        slots: timeSlots.map((time) => {
          const isBooked = bookings?.some(
            (b) =>
              b.booking_date === dateStr &&
              b.start_time <= time &&
              b.end_time > time,
          );

          const isLocked = locks?.some(
            (l) =>
              l.slot_date === dateStr &&
              l.start_time <= time &&
              l.end_time > time,
          );

          const queueCount = queue?.filter(
            (q) => q.slot_date === dateStr && q.start_time === time,
          ).length || 0;

          return {
            time,
            available: !isBooked && !isLocked,
            booked: !!isBooked,
            locked: !!isLocked,
            queueWaiting: queueCount,
          };
        }),
      };

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return new Response(
      JSON.stringify({
        courtId: payload.courtId,
        courtName: court.name,
        pricePerHour: court.price_per_hour,
        availability,
        summary: {
          totalSlots: Object.values(availability).reduce(
            (sum, day) => sum + day.slots.length,
            0,
          ),
          bookedSlots: bookings?.length || 0,
          lockedSlots: locks?.length || 0,
          queueingPlayers: queue?.length || 0,
        },
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

async function getCourtStats(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const courtId = url.searchParams.get("courtId");

    if (!courtId) {
      return new Response(
        JSON.stringify({ error: "Court ID required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const { data: bookings } = await supabase
      .from("bookings")
      .select("*")
      .eq("court_id", courtId)
      .gte("created_at", thirtyDaysAgo);

    const { data: reviews } = await supabase
      .from("reviews")
      .select("rating")
      .eq("court_id", courtId);

    const confirmedCount = bookings?.filter((b) => b.status === "confirmed").length || 0;
    const completedCount = bookings?.filter((b) => b.status === "completed").length || 0;
    const cancelledCount = bookings?.filter((b) => b.status === "cancelled").length || 0;
    const totalRevenue =
      bookings?.reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0) || 0;
    const avgRating =
      reviews && reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2)
        : 0;

    return new Response(
      JSON.stringify({
        courtId,
        stats: {
          confirmedBookings: confirmedCount,
          completedBookings: completedCount,
          cancelledBookings: cancelledCount,
          totalBookings: bookings?.length || 0,
          totalRevenue: totalRevenue.toFixed(2),
          averageRating: avgRating,
          reviewCount: reviews?.length || 0,
          occupancyRate: bookings
            ? ((confirmedCount + completedCount) / bookings.length * 100).toFixed(2)
            : 0,
        },
        period: {
          start: thirtyDaysAgo,
          end: new Date().toISOString().split("T")[0],
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Stats error:", error);
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

  if (url.pathname === "/slot_availability/get" && req.method === "POST") {
    return getSlotAvailability(req);
  }

  if (url.pathname === "/slot_availability/stats" && req.method === "GET") {
    return getCourtStats(req);
  }

  return new Response(
    JSON.stringify({ error: "Not found" }),
    {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
