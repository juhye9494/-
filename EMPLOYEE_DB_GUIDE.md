# 직원 데이터베이스 관리 가이드

## 개요
이 프로젝트는 직원 데이터를 `/src/app/data/employees-db.json` 파일에서 관리합니다.

## 직원 데이터 업데이트 방법

### 1. JSON 파일 직접 수정
`/src/app/data/employees-db.json` 파일을 열어서 직원 정보를 추가/수정/삭제하세요.

```json
{
  "name": "홍길동",
  "email": "hong@hankyung.com",
  "company": "한국경제신문",
  "department": "편집국",
  "employeeNumber": "2024001"
}
```

### 2. 필수 필드
- **name**: 직원 이름 (필수)
- **email**: 이메일 주소 (필수, @hankyung.com으로 끝나야 함)
- **company**: 계열사명 (선택)
- **department**: 부서명 (선택)
- **employeeNumber**: 사원번호 (선택)

### 3. 지원되는 계열사
- 한국경제신문
- 한경닷컴
- 한경BP
- 한경이코노미
- 한경비즈니스
- 한국경제TV
- 한국경제매거진앤북

## 외부 환경(안티그래픽스)으로 이전 시

### 필요한 파일들
1. **전체 프로젝트 폴더** - 모든 소스 코드
2. **환경 변수** (`.env` 파일 또는 서버 설정):
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

### 직원 DB 업데이트 프로세스
1. `/src/app/data/employees-db.json` 파일에 회사 직원 데이터를 넣으세요
2. 애플리케이션을 배포하세요
3. `/init-data` 페이지로 이동하세요
4. "데이터베이스 초기화 실행" 버튼을 클릭하세요
5. 데이터가 Supabase KV Store에 저장됩니다

### 엑셀/CSV에서 변환하기
회사에 엑셀 또는 CSV 형태의 직원 명단이 있다면:

1. 온라인 CSV to JSON 컨버터 사용: https://csvjson.com/csv2json
2. 엑셀에서 CSV로 내보내기
3. 컨버터에서 JSON으로 변환
4. 필드명을 `name`, `email`, `company`, `department`, `employeeNumber`로 맞추기
5. `/src/app/data/employees-db.json`에 붙여넣기

### 예시: 엑셀 데이터 구조
| name | email | company | department | employeeNumber |
|------|-------|---------|------------|----------------|
| 엄주혜 | juhye94@hankyung.com | 한국경제매거진앤북 | 콘텐츠디자인본부 | 2022001 |
| 박주혜 | parkjh@hankyung.com | 한국경제신문 | IT팀 | 2019001 |

## 고유 링크 생성 규칙
각 직원의 고유 링크는 이메일의 `@` 앞부분을 사용합니다:
- 이메일: `juhye94@hankyung.com` → 고유 ID: `emp_juhye94`
- 구독 링크: `/subscribe/emp_juhye94`

## 주의사항
⚠️ **이메일 주소는 중복될 수 없습니다**
- 각 직원은 고유한 `@hankyung.com` 이메일을 가져야 합니다
- 중복된 이��일이 있으면 마지막 데이터만 저장됩니다

⚠️ **데이터 초기화는 신중하게**
- "데이터베이스 초기화" 버튼은 기존 데이터에 추가됩니다
- 완전히 새로 시작하려면 Supabase 콘솔에서 KV Store를 비워야 합니다

## 트러블슈팅

### "등록되지 않은 직원입니다" 에러가 나올 때
1. `/init-data` 페이지로 이동
2. "현재 등록된 직원 확인" 버튼 클릭
3. 해당 직원이 목록에 있는지 확인
4. 없다면 "데이터베이스 초기화 실행" 버튼 클릭

### JSON 파일 형식 오류
- JSON Validator 사용: https://jsonlint.com/
- 쉼표, 중괄호, 대괄호를 정확히 확인하세요
- 마지막 항목 뒤에는 쉼표를 붙이지 마세요

## 문의
기술 지원이 필요하면 IT팀에 문의하세요.
