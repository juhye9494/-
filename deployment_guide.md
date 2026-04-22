## 1. GitHub에 코드 올리기 (저장소 생성)

Vercel 배포를 위해서는 먼저 코드가 GitHub에 올라가 있어야 합니다.

1.  **GitHub 저장소 생성**:
    - [GitHub](https://github.com/)에 로그인하고 'New Repository'를 클릭합니다.
    - 저장소 이름(예: `hkmagazine-ai-guide`)을 정하고 생성합니다.
2.  **로컬 코드 업로드 (터미널)**:
    - 앱 폴더(`한경`)의 최상위 경로에서 다음 명령어를 차례대로 입력합니다:

```bash
# git 초기화
git init

# 모든 파일 추가
git add .

# 첫 번째 커밋
git commit -m "Initial commit"

# 메인 브랜치 설정 (보통 main)
git branch -M main

# GitHub 저장소 연결 (본인의 저장소 주소로 변경하세요)
git remote add origin https://github.com/사용자이름/저장소이름.git

# 코드 전송 (푸시)
git push -u origin main
```

---

## 2. 데이터베이스 설정 (OAuth 이후)

## 1. 사전 준비 사항

배포를 위해 다음 계정들이 필요합니다:
- **GitHub**: 소스 코드 저장소
- **Vercel**: 웹 호스팅 및 배포
- **Supabase**: PostgreSQL 데이터베이스 및 스토리지
- **Firebase**: Firestore(기존 데이터 관리용) 및 인증(선택 사항)

---

## 2. 데이터베이스 설정

### A. Supabase 설정

1. [Supabase Console](https://app.supabase.com/)에서 새 프로젝트를 생성합니다.
2. **SQL Editor**에서 아래 쿼리를 실행하여 `posts` 테이블을 생성합니다:

```sql
-- 게시물 테이블 생성 (최종 버전)
create table posts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  category text,
  description text,
  author_name text,
  reading_time int8 default 1,
  cost text,
  image_url text,
  steps jsonb default '[]'::jsonb,
  tips text[] default '{}'::text[],
  tools text[] default '{}'::text[],
  links text[] default '{}'::text[],
  user_id uuid references auth.users(id) not null,
  content text,
  status text default 'published',
  working_time text,
  cost_saving text
);

-- RLS (Row Level Security) 설정
alter table posts enable row level security;

-- 모든 사용자가 게시물을 읽을 수 있도록 허용
create policy "누구나 게시물을 볼 수 있습니다." on posts
  for select using (true);

-- 인증된 사용자만 게시물을 작성할 수 있도록 허용
create policy "인증된 사용자만 게시물을 작성할 수 있습니다." on posts
  for insert with check (auth.role() = 'authenticated');

-- 본인의 게시물만 수정/삭제할 수 있도록 허용
create policy "본인의 게시물만 수정할 수 있습니다." on posts
  for update using (auth.uid() = user_id);

create policy "본인의 게시물만 삭제할 수 있습니다." on posts
  for delete using (auth.uid() = user_id);
```

3. **Storage** 메뉴에서 `images`라는 이름의 새로운 공개(Public) 버킷을 생성합니다.
   - 이미 업로드 기능을 사용하려면 이 버킷이 반드시 필요합니다.
   - 업로드된 이미지는 `post-images` 폴더 안에 저장됩니다.

### B. Firebase 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 프로젝트를 생성합니다.
2. **Firestore Database**를 활성화하고, 다음 컬렉션을 확인하거나 생성합니다:
   - `guides`: 가이드 데이터 저장
   - `config`: `categories`, `siteSettings` 등의 설정 데이터 저장

---

## 3. 환경 변수 (Environment Variables) 설정

Vercel 배포 시 다음 환경 변수들을 설정해야 합니다. `.env.local` 파일의 내용을 기반으로 입력하세요.

| 변수명 | 설명 | 확인 위치 |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키 (Anon Key) | Settings > API |
| `VITE_FIREBASE_API_KEY` | Firebase API 키 | 프로젝트 설정 > 일반 |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase 인증 도메인 | 프로젝트 설정 > 일반 |
| `VITE_FIREBASE_PROJECT_ID` | Firebase 프로젝트 ID | 프로젝트 설정 > 일반 |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase 스토리지 버킷 | 프로젝트 설정 > 일반 |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase 발신자 ID | 프로젝트 설정 > 일반 |
| `VITE_FIREBASE_APP_ID` | Firebase 앱 ID | 프로젝트 설정 > 일반 |

---

## 4. Vercel 배포 단계

1. [Vercel Dashboard](https://vercel.com/dashboard)에서 **Add New > Project**를 클릭합니다.
2. GitHub 저장소를 연결합니다.
3. **Environment Variables** 섹션에서 위 3번 항목의 변수들을 모두 추가합니다.
4. **Build and Output Settings**는 기본값(Next.js)으로 유지합니다.
5. **Deploy** 버튼을 클릭하여 배포를 시작합니다.

---

## 5. 로컬 개발 환경 실행

로컬에서 테스트하려면 다음 명령어를 사용하세요:

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 확인할 수 있습니다.

---

## 6. 주의 사항 및 팁

- **보안**: `ANON_KEY`는 클라이언트 측에서 사용 가능하지만, 중요한 로직은 항상 Supabase의 **RLS(Row Level Security)**를 통해 보호해야 합니다.
- **이미지 업로드**: Supabase Storage의 `posts` 버킷이 Public으로 설정되어 있는지 확인하세요.
- **도메인**: Vercel 배포 후 제공되는 `.vercel.app` 도메인 외에 커스텀 도메인을 연결하려면 Vercel Settings > Domains에서 설정할 수 있습니다.

---

## 7. 자주 발생하는 문제 및 해결 방법 (Troubleshooting)

### Q1. "등록 실패: Failed to fetch" 또는 "서버에 연결할 수 없습니다" 오류
이 오류는 주로 **Vercel 브랜치(Preview) 환경**에서 발생합니다.

**해결 방법:**
1.  **Vercel 환경 변수 설정 확인**:
    - Vercel 프로젝트의 **Settings > Environment Variables**로 이동합니다.
    - `NEXT_PUBLIC_SUPABASE_URL` 및 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 항목의 **'Edit'**를 누릅니다.
    - **'Preview'** 및 **'Development'** 체크박스가 선택되어 있는지 확인하고 저장합니다.
    - 설정을 변경한 후에는 해당 브랜치에서 **Redeploy**를 진행해야 적용됩니다.
2.  **네트워크 확인**:
    - 사내 망이나 방화벽이 있는 환경에서 `supabase.co` 도메인 접속이 차단되어 있는지 확인해 보세요.
3.  **로그인 세션**:
    - 로그인 세션이 만료되었을 수 있으니, 로그아웃 후 다시 로그인하여 시도해 보세요.

### Q2. 등록 버튼 클릭 시 아무 반응이 없거나 DB에 저장이 안 됨
**해결 방법:**
1.  **SQL 쿼리 다시 실행**: 이 문서의 **2-A 절**에 있는 `게시물 테이블 생성 (최종 버전)` SQL 쿼리를 Supabase의 SQL Editor에서 다시 실행해 주세요. (기존 테이블이 이미 있다면 컬럼이 부족하여 오류가 날 수 있습니다.)
2.  **Storage 버킷 이름**: Storage 메뉴에서 `images`라는 이름의 버킷이 **Public**으로 생성되어 있는지 다시 한번 확인해 주세요.
