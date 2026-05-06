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

    const naverId = profileData.response.id;
    const naverName = profileData.response.name || '미확인';

    // 3. Supabase DB 연결 (Service Role 사용으로 RLS 우회)
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // 4. RPC 호출을 통한 원자적 처리 (중복 체크 + 카운트 증가)
    const { data: rpcData, error: rpcError } = await supabase.rpc("fn_subscribe_and_count", {
      p_employee_id: employeeId,
      p_naver_id: naverId,
      p_naver_name: naverName,
    });

    if (rpcError) throw rpcError;

    return new Response(
      JSON.stringify(rpcData),
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
