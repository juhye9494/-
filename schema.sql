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
    naver_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(employee_id, naver_id)
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
