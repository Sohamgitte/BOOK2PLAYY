import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

interface JoinQueuePayload {
  courtId: string;
  slotDate: string;
  startTime: string;
}

interface CancelQueuePayload {
  queueId: string;
}

interface NotifyFromQueuePayload {
  courtId: string;
  slotDate: string;
  startTime: string;
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

async function joinQueue(req: Request): Promise<Response> {
  try {
    const payload: JoinQueuePayload = await req.json();
    const userId = req.headers.get("x-user-id") || "";

    const { data: existingQueue } = await supabase
      .from("waiting_queue")
      .select("*")
      .eq("court_id", payload.courtId)
      .eq("slot_date", payload.slotDate)
      .eq("start_time", payload.startTime)
      .eq("user_id", userId)
      .eq("status", "waiting")
      .maybeSingle();

    if (existingQueue) {
      return new Response(
        JSON.stringify({
          queueId: existingQueue.id,
          position: existingQueue.queue_position,
          message: "User already in queue",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { data: queueEntries } = await supabase
      .from("waiting_queue")
      .select("queue_position")
      .eq("court_id", payload.courtId)
      .eq("slot_date", payload.slotDate)
      .eq("start_time", payload.startTime)
      .eq("status", "waiting")
      .order("queue_position", { ascending: false })
      .limit(1);

    const nextPosition = (queueEntries?.[0]?.queue_position || 0) + 1;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { data: newQueue, error: queueError } = await supabase
      .from("waiting_queue")
      .insert({
        court_id: payload.courtId,
        slot_date: payload.slotDate,
        start_time: payload.startTime,
        user_id: userId,
        queue_position: nextPosition,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (queueError) {
      return new Response(
        JSON.stringify({ error: "Failed to join queue" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        queueId: newQueue.id,
        position: newQueue.queue_position,
        expiresAt: newQueue.expires_at,
        message: "Added to queue successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Queue join error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}

async function getQueuePosition(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const queueId = url.searchParams.get("queueId");
    const userId = req.headers.get("x-user-id") || "";

    const { data: queue } = await supabase
      .from("waiting_queue")
      .select("*")
      .eq("id", queueId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!queue) {
      return new Response(
        JSON.stringify({ error: "Queue entry not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { data: queueAhead } = await supabase
      .from("waiting_queue")
      .select("id")
      .eq("court_id", queue.court_id)
      .eq("slot_date", queue.slot_date)
      .eq("start_time", queue.start_time)
      .lt("queue_position", queue.queue_position)
      .eq("status", "waiting");

    return new Response(
      JSON.stringify({
        queueId: queue.id,
        position: queue.queue_position,
        peopleAhead: queueAhead?.length || 0,
        status: queue.status,
        message: `You are position ${queue.queue_position}`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Queue position error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}

async function cancelQueue(req: Request): Promise<Response> {
  try {
    const payload: CancelQueuePayload = await req.json();
    const userId = req.headers.get("x-user-id") || "";

    const { data: queue } = await supabase
      .from("waiting_queue")
      .select("*")
      .eq("id", payload.queueId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!queue) {
      return new Response(
        JSON.stringify({ error: "Queue entry not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    await supabase
      .from("waiting_queue")
      .update({ status: "cancelled" })
      .eq("id", payload.queueId);

    const { data: nextInQueue } = await supabase
      .from("waiting_queue")
      .select("*")
      .eq("court_id", queue.court_id)
      .eq("slot_date", queue.slot_date)
      .eq("start_time", queue.start_time)
      .eq("status", "waiting")
      .order("queue_position", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (nextInQueue) {
      await supabase.from("queue_notifications").insert({
        queue_id: nextInQueue.id,
        user_id: nextInQueue.user_id,
        notification_type: "position_changed",
      });
    }

    return new Response(
      JSON.stringify({
        queueId: payload.queueId,
        message: "Cancelled from queue",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Queue cancellation error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}

async function notifyFromQueue(req: Request): Promise<Response> {
  try {
    const payload: NotifyFromQueuePayload = await req.json();

    const { data: queueList } = await supabase
      .from("waiting_queue")
      .select("*")
      .eq("court_id", payload.courtId)
      .eq("slot_date", payload.slotDate)
      .eq("start_time", payload.startTime)
      .eq("status", "waiting")
      .order("queue_position", { ascending: true })
      .limit(1);

    if (!queueList || queueList.length === 0) {
      return new Response(
        JSON.stringify({ message: "No one in queue" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const firstInQueue = queueList[0];

    await supabase
      .from("waiting_queue")
      .update({ status: "notified", notified_at: new Date().toISOString() })
      .eq("id", firstInQueue.id);

    await supabase.from("queue_notifications").insert({
      queue_id: firstInQueue.id,
      user_id: firstInQueue.user_id,
      notification_type: "available",
    });

    await supabase.from("notifications").insert({
      user_id: firstInQueue.user_id,
      title: "Court slot available!",
      message: `A slot is now available for ${payload.slotDate} at ${payload.startTime}. Book now!`,
      type: "alert",
    });

    return new Response(
      JSON.stringify({
        notifiedUserId: firstInQueue.user_id,
        queueId: firstInQueue.id,
        message: "User notified successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Queue notification error:", error);
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

  if (url.pathname === "/queue_management/join" && req.method === "POST") {
    return joinQueue(req);
  }

  if (url.pathname === "/queue_management/position" && req.method === "GET") {
    return getQueuePosition(req);
  }

  if (url.pathname === "/queue_management/cancel" && req.method === "POST") {
    return cancelQueue(req);
  }

  if (url.pathname === "/queue_management/notify" && req.method === "POST") {
    return notifyFromQueue(req);
  }

  return new Response(
    JSON.stringify({ error: "Not found" }),
    {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
