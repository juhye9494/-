# 한국경제신문 구독 경쟁 이벤트 - 설정 가이드

## 🚀 시작하기

### 1단계: 테스트 데이터 초기화

백엔드가 구축되었으므로, 먼저 테스트 데이터를 등록해야 합니다.

**방법:**
1. 브라우저에서 `/init-data` 페이지로 이동
2. "데이터베이스 초기화 실행" 버튼 클릭
3. 20명의 테스트 직원 데이터가 자동으로 등록됩니다

**테스트 직원 계정:**
- kimms@hankyung.com (김민수)
- leeje@hankyung.com (이지은)
- parksj@hankyung.com (박서준)
- ... 총 20명

---

## 🔧 실제 운영을 위한 설정

### 2단계: 실제 직원 데이터 임포트

IT팀으로부터 받은 직원 명단 Excel 파일을 사용하여 데이터를 임포트합니다.

**필요한 컬럼:**
- 이름 (필수)
- 이메일 (필수, @hankyung.com)
- 부서 (선택)
- 사번 (선택)

**임포트 방법:**

API 엔드포인트를 사용하여 직원 데이터를 등록:

```javascript
POST https://[프로젝트ID].supabase.co/functions/v1/make-server-a834ef89/init-employees

Body (JSON):
[
  {
    "name": "홍길동",
    "email": "hong@hankyung.com",
    "department": "경제부",
    "employeeNumber": "2021001"
  },
  ...
]
```

---

## 🔑 네이버 로그인 API 설정

### 3단계: 네이버 개발자 센터 설정

**아직 완료하지 않았다면:**

1. **네이버 개발자 센터 접속**
   - https://developers.naver.com/apps/#/register

2. **애플리케이션 등록**
   - 애플리케이션 이름: `한국경제신문 구독 이벤트`
   - 사용 API: **네이버 로그인** 체크
   - 제공 정보: 회원 이름, 이메일 (필수)
   - 환경: **PC 웹** 선택

3. **서비스 URL 설정**
   - 서비스 URL: `https://[실제 도메인]`
   - Callback URL: `https://[실제 도메인]/callback`

4. **API 키 발급**
   - Client ID 복사
   - Client Secret 복사

---

### 4단계: 환경 변수 설정

백엔드 서버에 네이버 API 키를 환경 변수로 추가:

**Supabase 대시보드에서:**
1. Edge Functions → 환경 변수 설정
2. 다음 변수 추가:
   ```
   NAVER_CLIENT_ID=발급받은_클라이언트_ID
   NAVER_CLIENT_SECRET=발급받은_클라이언트_Secret
   ```

---

## 📊 데이터베이스 구조

### KV Store에 저장되는 데이터:

```
employee:{email} → { id, name, email, department, employeeNumber, createdAt }
employee_count:{employeeId} → subscriberCount (숫자)
subscription:{employeeId}:{naverId} → { naverId, employeeId, timestamp }
```

**예시:**
```
employee:kimms@hankyung.com → {
  id: "emp_kimms",
  name: "김민수",
  email: "kimms@hankyung.com",
  department: "디지털콘텐츠팀",
  employeeNumber: "2021001",
  createdAt: "2026-03-30T10:00:00Z"
}

employee_count:emp_kimms → 42

subscription:emp_kimms:naver123456 → {
  naverId: "naver123456",
  employeeId: "emp_kimms",
  timestamp: "2026-03-30T15:30:00Z"
}
```

---

## 🎯 실제 동작 흐름

### 직원 (회사 내부):
1. `/login` → 이메일 입력 (@hankyung.com)
2. 로그인 성공 → `/dashboard`
3. 개인 고유 링크 확인: `https://site.com/subscribe/emp_kimms`
4. 링크 복사하여 SNS, 카카오톡 등에 공유

### 외부인 (일반 사용자):
1. 직원이 공유한 링크 클릭: `https://site.com/subscribe/emp_kimms`
2. "김민수 님을 응원해주세요!" 페이지 진입
3. "네이버로 로그인" 버튼 클릭
4. 네이버 로그인 완료 → 김민수 카운트 +1
5. 한국경제신문 네이버 구독 페이지로 이동

### 실시간 랭킹:
1. `/` 홈페이지에서 상위 20위까지 실시간 표시
2. 피라미드 형태로 시각화
3. 1위는 노란색 + 애니메이션
4. 2-3위는 깔끔한 하얀색 디자인

---

## 🔍 API 엔드포인트 요약

### 직원 관련:
- `POST /make-server-a834ef89/login` - 직원 로그인
- `GET /make-server-a834ef89/employee/:id` - 직원 정보 조회
- `GET /make-server-a834ef89/employee/:id/rank` - 직원 순위 조회

### 구독 관련:
- `POST /make-server-a834ef89/subscribe` - 외부인 참여 (네이버 로그인)
- `GET /make-server-a834ef89/rankings` - 상위 20위 랭킹

### 관리자:
- `POST /make-server-a834ef89/init-employees` - 직원 데이터 초기화

---

## ⚠️ 중요 사항

1. **네이버 로그인은 현재 시뮬레이션 모드**
   - 실제 네이버 OAuth 연동이 필요합니다
   - `/src/app/pages/SubscribePage.tsx`의 `handleNaverLogin` 함수 수정 필요

2. **중복 참여 방지**
   - 네이버 ID 기준으로 중복 체크
   - 같은 네이버 ID가 같은 직원 링크로 재참여 불가
   - 하지만 다른 직원 링크로는 참여 가능

3. **보안**
   - 네이버 Client Secret은 백엔드에서만 사용
   - 프론트엔드에 절대 노출 금지

4. **성능**
   - 직원 수가 많아지면 랭킹 조회 최적화 필요
   - 캐싱 전략 고려

---

## 📱 테스트 시나리오

### 시나리오 1: 직원 로그인 & 링크 생성
1. `/login` 접속
2. `kimms@hankyung.com` 입력
3. 로그인 성공 → 대시보드로 이동
4. 개인 링크 복사

### 시나리오 2: 외부인 참여
1. 복사한 링크 접속
2. "네이버로 로그인" 버튼 클릭
3. 로그인 시뮬레이션 (1.5초 대기)
4. 참여 완료 화면 확인
5. 카운트 증가 확인

### 시나리오 3: 랭킹 확인
1. `/` 홈페이지 접속
2. 피라미드 형태로 상위 20위 확인
3. "내 순위 조회" 버튼으로 특정 직원 검색

---

## 🎨 디자인 특징

- **Toss Feed 스타일**: 깔끔한 파란색 그라데이션 배경
- **피라미드 레이아웃**: 1위부터 20위까지 정사각형 박스
- **1위 애니메이션**: 노란색 + 빛나는 효과 + 왕관
- **2-3위**: 깔끔한 하얀색 + 메달 아이콘
- **반응형 디자인**: 모바일/데스크톱 모두 지원

---

## 📞 문의

문제가 발생하거나 질문이 있으시면 IT팀에 문의하세요.

**이벤트 화이팅! 🎉**
