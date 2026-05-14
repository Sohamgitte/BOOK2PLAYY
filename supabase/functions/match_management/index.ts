import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

interface CreateMatchPayload {
  bookingId: string;
  title: string;
  description: string;
  sport: string;
  maxPlayers: number;
  skillLevel: string;
}

interface InvitePlayerPayload {
  matchId: string;
  playerEmail: string;
}

interface RespondToInvitePayload {
  requestId: string;
  status: "accepted" | "declined";
}

interface RecordScorePayload {
  matchId: string;
  team1Score: number;
  team2Score: number;
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

async function createMatch(req: Request): Promise<Response> {
  try {
    const payload: CreateMatchPayload = await req.json();
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

    const { data: match, error: matchError } = await supabase
      .from("matches")
      .insert({
        creator_id: userId,
        booking_id: payload.bookingId,
        title: payload.title,
        description: payload.description,
        sport: payload.sport,
        max_players: payload.maxPlayers,
        skill_level: payload.skillLevel,
        current_players: 1,
      })
      .select()
      .single();

    if (matchError) {
      return new Response(
        JSON.stringify({ error: "Failed to create match" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    await supabase.from("notifications").insert({
      user_id: userId,
      title: "Match created",
      message: `Your match "${payload.title}" is now open for players to join!`,
      type: "booking",
    });

    return new Response(
      JSON.stringify({
        matchId: match.id,
        status: match.status,
        currentPlayers: match.current_players,
        message: "Match created successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Match creation error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}

async function invitePlayer(req: Request): Promise<Response> {
  try {
    const payload: InvitePlayerPayload = await req.json();
    const userId = req.headers.get("x-user-id") || "";

    const { data: match } = await supabase
      .from("matches")
      .select("*")
      .eq("id", payload.matchId)
      .eq("creator_id", userId)
      .maybeSingle();

    if (!match) {
      return new Response(
        JSON.stringify({ error: "Match not found or not authorized" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id")
      .eq("full_name", payload.playerEmail)
      .limit(1);

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ error: "Player not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const targetUserId = profiles[0].id;

    const { data: existingRequest } = await supabase
      .from("match_requests")
      .select("*")
      .eq("match_id", payload.matchId)
      .eq("user_id", targetUserId)
      .maybeSingle();

    if (existingRequest) {
      return new Response(
        JSON.stringify({ message: "Invitation already sent" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { data: invitation, error: inviteError } = await supabase
      .from("match_requests")
      .insert({
        match_id: payload.matchId,
        user_id: targetUserId,
        requested_by: userId,
      })
      .select()
      .single();

    if (inviteError) {
      return new Response(
        JSON.stringify({ error: "Failed to send invitation" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    await supabase.from("notifications").insert({
      user_id: targetUserId,
      title: "Match invitation",
      message: `You've been invited to join match "${match.title}"`,
      type: "booking",
    });

    return new Response(
      JSON.stringify({
        requestId: invitation.id,
        message: "Invitation sent successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Invitation error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}

async function respondToInvite(req: Request): Promise<Response> {
  try {
    const payload: RespondToInvitePayload = await req.json();
    const userId = req.headers.get("x-user-id") || "";

    const { data: request } = await supabase
      .from("match_requests")
      .select("*")
      .eq("id", payload.requestId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!request) {
      return new Response(
        JSON.stringify({ error: "Request not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    await supabase
      .from("match_requests")
      .update({
        status: payload.status,
        responded_at: new Date().toISOString(),
      })
      .eq("id", payload.requestId);

    if (payload.status === "accepted") {
      const { data: match } = await supabase
        .from("matches")
        .select("current_players")
        .eq("id", request.match_id)
        .maybeSingle();

      if (match) {
        await supabase
          .from("matches")
          .update({ current_players: (match.current_players || 0) + 1 })
          .eq("id", request.match_id);
      }
    }

    return new Response(
      JSON.stringify({
        requestId: payload.requestId,
        status: payload.status,
        message: `Invitation ${payload.status} successfully`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Invitation response error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}

async function recordScore(req: Request): Promise<Response> {
  try {
    const payload: RecordScorePayload = await req.json();
    const userId = req.headers.get("x-user-id") || "";

    const { data: match } = await supabase
      .from("matches")
      .select("*")
      .eq("id", payload.matchId)
      .eq("creator_id", userId)
      .maybeSingle();

    if (!match) {
      return new Response(
        JSON.stringify({ error: "Match not found or not authorized" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const winningTeam =
      payload.team1Score > payload.team2Score ? 1 : 2;

    const { data: score, error: scoreError } = await supabase
      .from("match_scores")
      .insert({
        match_id: payload.matchId,
        team1_score: payload.team1Score,
        team2_score: payload.team2Score,
        winning_team: winningTeam,
        recorded_by: userId,
      })
      .select()
      .single();

    if (scoreError) {
      return new Response(
        JSON.stringify({ error: "Failed to record score" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    await supabase
      .from("matches")
      .update({ status: "completed" })
      .eq("id", payload.matchId);

    return new Response(
      JSON.stringify({
        scoreId: score.id,
        team1Score: score.team1_score,
        team2Score: score.team2_score,
        winningTeam,
        message: "Score recorded successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Score recording error:", error);
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

  if (url.pathname === "/match_management/create" && req.method === "POST") {
    return createMatch(req);
  }

  if (url.pathname === "/match_management/invite" && req.method === "POST") {
    return invitePlayer(req);
  }

  if (url.pathname === "/match_management/respond" && req.method === "POST") {
    return respondToInvite(req);
  }

  if (url.pathname === "/match_management/record-score" && req.method === "POST") {
    return recordScore(req);
  }

  return new Response(
    JSON.stringify({ error: "Not found" }),
    {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
