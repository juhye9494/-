-- 1. 직원 정보 테이블
CREATE TABLE public.employees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department TEXT,
    company TEXT,
    position TEXT,
    employee_number TEXT,
    subscriber_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. 네이버 참여내역 테이블 (중복 방지용)
CREATE TABLE public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    naver_id TEXT NOT NULL UNIQUE,
    naver_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. 어드민 페이지 텍스트 설정 테이블
CREATE TABLE public.admin_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    event_title TEXT DEFAULT '한국경제신문 구독 이벤트',
    event_description TEXT DEFAULT '임직원 추천을 통해 구독하고 다양한 혜택을 받으세요!'
);
INSERT INTO public.admin_settings (id) VALUES (1);

-- RLS (Row Level Security) 설정
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- 편의상 누구나 조회, 생성, 수정할 수 있도록 임시 개방 정책 적용 (운영 전 제한 권장)
CREATE POLICY "Allow All operations on employees" ON public.employees FOR ALL USING (true);
CREATE POLICY "Allow All operations on subscriptions" ON public.subscriptions FOR ALL USING (true);
CREATE POLICY "Allow All operations on admin_settings" ON public.admin_settings FOR ALL USING (true);
-- 4. 구독 및 카운트 가중치 원자적 처리 함수 (RPC)
-- 같은 네이버 ID가 다른 개인링크로 접속해도 하나만 카운트되도록 보장합니다.
CREATE OR REPLACE FUNCTION public.fn_subscribe_and_count(p_employee_id UUID, p_naver_id TEXT, p_naver_name TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- RLS 우회하여 실행
AS $$
DECLARE
    v_existing_id UUID;
    v_new_count INTEGER;
BEGIN
    -- 1. 전역 중복 참여 확인 (어떤 직원의 링크든 상관없이 네이버 ID 기준)
    SELECT id INTO v_existing_id FROM public.subscriptions WHERE naver_id = p_naver_id LIMIT 1;
    
    IF v_existing_id IS NOT NULL THEN
        -- 이미 참여한 경우: 카운트 증가 없이 성공 응답 반환 (중복 참여임을 알림)
        RETURN jsonb_build_object(
            'success', true,
            'already_done', true,
            'message', '이미 참여 완료된 사용자입니다.'
        );
    END IF;
    
    -- 2. 신규 참여: 참여 내역 저장
    INSERT INTO public.subscriptions (employee_id, naver_id, naver_name)
    VALUES (p_employee_id, p_naver_id, p_naver_name);
    
    -- 3. 해당 사원의 카운트 1 증가 (원자적 업데이트)
    UPDATE public.employees
    SET subscriber_count = subscriber_count + 1
    WHERE id = p_employee_id
    RETURNING subscriber_count INTO v_new_count;
    
    RETURN jsonb_build_object(
        'success', true,
        'already_done', false,
        'new_count', v_new_count,
        'message', '카운트 성공'
    );
EXCEPTION WHEN OTHERS THEN
    -- 에러 발생 시 처리
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$;
