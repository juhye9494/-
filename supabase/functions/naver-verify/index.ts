import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const NAVER_CLIENT_ID = Deno.env.get("NAVER_CLIENT_ID");
const NAVER_CLIENT_SECRET = Deno.env.get("NAVER_CLIENT_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORS 처리
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { code, employeeId, redirectUri } = await req.json();

    if (!code || !employeeId) {
      throw new Error("인증 코드와 직원 ID가 필요합니다.");
    }

    // 1. 네이버 토큰 교환
    const tokenResponse = await fetch(
      `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${NAVER_CLIENT_ID}&client_secret=${NAVER_CLIENT_SECRET}&code=${code}&state=hankyung`,
      { method: "POST" }
    );
    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error("Naver Token Error:", tokenData);
      throw new Error("네이버 인증 토큰을 가져오지 못했습니다.");
    }

    // 2. 네이버 프로필 조회 (고유 ID 추출)
    const profileResponse = await fetch("https://openapi.naver.com/v1/nid/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profileData = await profileResponse.json();

    if (profileData.resultcode !== "00") {
      throw new Error("네이버 프로필 조회에 실패했습니다.");
    }

    const naverId = profileData.response.id; // 네이버 유저 고유 고유 ID

    // 3. Supabase DB 연결 (Service Role 사용으로 RLS 우회)
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // 4. 중복 참여 확인
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("employee_id", employeeId)
      .eq("naver_id", naverId)
      .single();

    if (existing) {
      return new Response(
        JSON.stringify({ success: true, message: "이미 참여 완료된 사용자입니다.", alreadyDone: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. 참여 기록 저장
    const { error: insertError } = await supabase
      .from("subscriptions")
      .insert([{ employee_id: employeeId, naver_id: naverId }]);

    if (insertError) throw insertError;

    // 6. 사원 카운트 증가
    // RPC를 쓰거나 직접 쿼리 (가장 확실한 방식)
    const { data: emp, error: getError } = await supabase
      .from("employees")
      .select("subscriber_count")
      .eq("id", employeeId)
      .single();

    if (getError) throw getError;

    const { error: updateError } = await supabase
      .from("employees")
      .update({ subscriber_count: (emp.subscriber_count || 0) + 1 })
      .eq("id", employeeId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, message: "카운트 성공" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Edge Function Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
