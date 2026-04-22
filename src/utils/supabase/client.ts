import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Supabase 설정 정보(URL/KEY)가 누락되었습니다. Vercel 환경 변수 설정을 확인해 주세요.')
  }

  return createBrowserClient(url, key)
}
