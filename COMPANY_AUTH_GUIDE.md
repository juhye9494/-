# 한국경제신문 인증 시스템 연동 가이드

## 현재 구조 (데모)
```typescript
// LoginPage.tsx - 현재는 시뮬레이션
setTimeout(() => {
  if (email.endsWith("@hankyung.com")) {
    // 로그인 성공
  }
}, 1500);
```

---

## 실제 연동 방법

### 방법 1: 회사 REST API 연동 (권장)

회사에서 제공하는 인증 API가 있다면:

```typescript
// /src/app/services/auth.ts 파일 생성
export async function loginWithCompanyAuth(email: string, password: string) {
  const response = await fetch('https://auth.hankyung.com/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('로그인 실패');
  }

  const data = await response.json();
  return {
    employeeId: data.employee_id,
    name: data.name,
    email: data.email,
    department: data.department,
  };
}
```

```typescript
// LoginPage.tsx 수정
import { loginWithCompanyAuth } from '../services/auth';

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const employee = await loginWithCompanyAuth(email, password);
    
    localStorage.setItem("employee", JSON.stringify(employee));
    toast.success("로그인 성공!");
    navigate("/dashboard");
  } catch (error) {
    toast.error("로그인 실패: 이메일과 비밀번호를 확인해주세요");
  } finally {
    setIsLoading(false);
  }
};
```

---

### 방법 2: Supabase 백엔드 경유 (보안 강화)

회사 API를 직접 호출하지 않고 Supabase 서버를 경유:

```typescript
// /supabase/functions/server/index.tsx에 추가
app.post('/make-server-a834ef89/auth/login', async (c) => {
  const { email, password } = await c.req.json();

  try {
    // 회사 인증 API 호출
    const response = await fetch('https://auth.hankyung.com/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': Deno.env.get('HANKYUNG_API_KEY'), // 환경변수로 관리
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return c.json({ error: '인증 실패' }, 401);
    }

    const data = await response.json();
    
    // KV 스토어에 직원 정보 저장 (선택)
    await kv.set(`employee:${data.employee_id}`, {
      id: data.employee_id,
      name: data.name,
      email: data.email,
      subscriberCount: 0,
    });

    return c.json({
      success: true,
      employee: {
        id: data.employee_id,
        name: data.name,
        email: data.email,
      }
    });
  } catch (error) {
    return c.json({ error: '서버 오류' }, 500);
  }
});
```

```typescript
// LoginPage.tsx에서 사용
import { projectId, publicAnonKey } from '/utils/supabase/info';

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-a834ef89/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    localStorage.setItem("employee", JSON.stringify(data.employee));
    toast.success("로그인 성공!");
    navigate("/dashboard");
  } catch (error) {
    toast.error("로그인 실패: 이메일과 비밀번호를 확인해주세요");
  } finally {
    setIsLoading(false);
  }
};
```

---

### 방법 3: OAuth/SAML 인증 (SSO)

회사에서 SSO를 지원한다면:

```typescript
// OAuth 로그인 버튼 추가
const handleOAuthLogin = () => {
  const clientId = 'YOUR_CLIENT_ID';
  const redirectUri = `${window.location.origin}/auth/callback`;
  const authUrl = `https://auth.hankyung.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
  
  window.location.href = authUrl;
};

// 콜백 페이지에서 처리 (/src/app/pages/AuthCallback.tsx)
useEffect(() => {
  const code = new URLSearchParams(window.location.search).get('code');
  
  if (code) {
    // 코드를 토큰으로 교환
    exchangeCodeForToken(code);
  }
}, []);
```

---

## 연동 체크리스트

### 1. 회사 IT팀에 확인할 사항
- [ ] 인증 API 엔드포인트 URL
- [ ] API 인증 방식 (API Key, OAuth, SAML 등)
- [ ] 요청/응답 형식
- [ ] 직원 ID 형식
- [ ] CORS 정책 (프론트엔드에서 직접 호출 가능한지)
- [ ] Rate Limiting 정책

### 2. 필요한 정보
```typescript
interface CompanyAuthConfig {
  apiUrl: string;          // 예: https://auth.hankyung.com/api
  apiKey?: string;         // API 키 (있다면)
  clientId?: string;       // OAuth 클라이언트 ID (있다면)
  clientSecret?: string;   // OAuth 시크릿 (있다면)
}
```

### 3. 보안 고려사항
- ✅ HTTPS 사용 필수
- ✅ API Key는 환경변수로 관리 (프론트엔드 노출 금지)
- ✅ 비밀번호는 평문 전송 금지 (HTTPS 사용)
- ✅ JWT 토큰 사용 시 localStorage보다 httpOnly 쿠키 권장
- ✅ CORS 정책 확인

---

## 다음 단계

1. **IT팀에 연락** → API 문서 요청
2. **API 테스트** → Postman 등으로 먼저 테스트
3. **코드 작성** → 위 방법 중 선택하여 구현
4. **환경변수 설정** → API 키 등록
5. **테스트** → 실제 계정으로 로그인 테스트

궁금한 점이나 추가 도움이 필요하면 말씀해주세요!
