/**
 * AI 관련 주요 용어 한/영 매핑 사전
 */
const TERM_MAP: Record<string, string[]> = {
  'chatgpt': ['챗지피티', '챗gpt', 'gpt', '지피티'],
  'claude': ['클로드', '클로드3', '클로드ai'],
  'midjourney': ['미드저니', '미드저니ai', '이미지생성'],
  'gemini': ['제미나이', '구글ai', '제미니'],
  'notion': ['노션', '노션ai'],
  'canva': ['캔바', '캔바ai'],
  'stable diffusion': ['스테이블디퓨전', '스태이블디퓨전', 'sd'],
}

/**
 * 사용자의 검색어를 분석하여 연관된 영문/한글 키워드들을 모두 반환합니다.
 */
export function expandSearchTerm(query: string): string[] {
  if (!query) return [];
  const lowerQuery = query.toLowerCase().replace(/\s+/g, '');
  const expansion = new Set<string>([query]);

  // 매핑 사전을 뒤져서 연관된 단어가 있으면 모두 추가
  for (const [eng, korList] of Object.entries(TERM_MAP)) {
    if (eng.includes(lowerQuery) || korList.some(kor => kor.includes(lowerQuery))) {
      expansion.add(eng);
      korList.forEach(kor => expansion.add(kor));
    }
  }

  return Array.from(expansion);
}
