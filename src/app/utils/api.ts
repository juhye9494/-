import { createClient } from '@supabase/supabase-js';

// 프로젝트 최상단 .env 파일에 아래 값을 추가해야 합니다.
// VITE_SUPABASE_URL=your_project_url
// VITE_SUPABASE_ANON_KEY=your_anon_key

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseKey);

const NAVER_CLIENT_ID = (import.meta as any).env.VITE_NAVER_CLIENT_ID;

export interface Employee {
  id: string;
  name: string;
  email: string;
  company?: string;
  department?: string;
  employeeNumber?: string;
  subscriberCount: number;
}

export interface Subscription {
  id: string;
  employeeId: string;
  naverId: string;
  naverName: string | null;
  createdAt: string;
  employeeName?: string;
  employeeCompany?: string;
  employeeDepartment?: string;
}

const mapEmployee = (row: any): Employee => ({
  id: row.id,
  name: row.name,
  email: row.email,
  company: row.company,
  department: row.department,
  employeeNumber: row.employee_number,
  subscriberCount: row.subscriber_count || 0,
});

export async function loginWithEmail(email: string): Promise<Employee> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) {
    throw new Error('사원 정보를 찾을 수 없습니다.');
  }

  return mapEmployee(data);
}

export async function getEmployeeById(id: string): Promise<Employee> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new Error('해당 사원을 찾을 수 없습니다.');
  }

  return mapEmployee(data);
}

export async function subscribe(employeeId: string, naverId: string): Promise<{ success: boolean; newCount: number; message: string }> {
  // 1. Check if already subscribed
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('employee_id', employeeId)
    .eq('naver_id', naverId)
    .single();

  if (existing) {
    throw new Error('이미 참여하셨습니다.');
  }

  // 2. Insert subscription
  const { error: insertError } = await supabase
    .from('subscriptions')
    .insert([{ employee_id: employeeId, naver_id: naverId }]);

  if (insertError) {
    console.error("Subscription insert error:", insertError);
    if (insertError.code === '23505') { // unique violation
       throw new Error('이미 참여하셨습니다.');
    }
    throw new Error('구독 처리 중 오류가 발생했습니다.');
  }

  // 3. Update employee count
  const emp = await getEmployeeById(employeeId);
  const newCount = emp.subscriberCount + 1;
  await supabase
    .from('employees')
    .update({ subscriber_count: newCount })
    .eq('id', employeeId);

  return { success: true, newCount, message: '참여 완료' };
}

// 네이버 로그인 인증 URL 생성 (프론트엔드용)
export function getNaverAuthUrl(employeeId: string) {
  // 현재 접속한 도메인(origin)을 그대로 사용합니다. (예: https://hankyungbizcampaign.vercel.app)
  const redirectUri = encodeURIComponent(window.location.origin); 
  const state = encodeURIComponent(employeeId); // 직원 ID를 state에 담아 보냄
  return `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${redirectUri}&state=${state}`;
}

// 네이버 코드 검증 및 카운트 (Edge Function 호출)
export async function verifyNaverAndCount(code: string, employeeId: string) {
  const { data, error } = await supabase.functions.invoke('naver-verify', {
    body: { code, employeeId }
  });

  if (error) throw error;
  return data;
}

export async function getRankings(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('subscriber_count', { ascending: false })
    .limit(20);

  if (error) {
    console.error("Ranking error:", error);
    return [];
  }

  return data.map(mapEmployee);
}

export async function getEmployeeRank(id: string): Promise<{ rank: number; total: number }> {
  const { data, error } = await supabase
    .from('employees')
    .select('id, subscriber_count')
    .order('subscriber_count', { ascending: false });

  if (error || !data) {
    return { rank: 0, total: 0 };
  }

  const rank = data.findIndex(emp => emp.id === id) + 1;
  return { rank, total: data.length };
}

export async function initEmployees(employees: Array<any>): Promise<{ success: boolean; message: string; count: number }> {
  const toInsert = employees.map(emp => ({
    name: emp.name,
    email: emp.email,
    department: emp.department,
    company: emp.company,
    position: emp.position
    // subscriber_count를 제외하여 기존 데이터가 있을 경우 점수를 보존합니다.
  }));

  const { error } = await supabase
    .from('employees')
    .upsert(toInsert, { onConflict: 'email' });

  if (error) throw error;

  return { success: true, message: '초기화 성공', count: employees.length };
}

export async function getAllEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('name', { ascending: true });

  if (error) return [];
  return data.map(mapEmployee);
}

export async function getSubscriptions(): Promise<Subscription[]> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      employees (
        name,
        company,
        department
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching subscriptions:", error);
    return [];
  }

  return data.map((row: any) => ({
    id: row.id,
    employeeId: row.employee_id,
    naverId: row.naver_id,
    naverName: row.naver_name,
    createdAt: row.created_at,
    employeeName: row.employees?.name,
    employeeCompany: row.employees?.company,
    employeeDepartment: row.employees?.department,
  }));
}

export interface DepartmentStatistics {
  company: string;
  department: string;
  employeeCount: number;
  totalSubscribers: number;
  avgSubscribers: number;
  topEmployee: { name: string; subscriberCount: number; } | null;
}

export async function getDepartmentStatistics(): Promise<DepartmentStatistics[]> {
  const employees = await getAllEmployees();
  // 간단한 통계 계산
  const statsMap = new Map<string, DepartmentStatistics>();
  
  for (const emp of employees) {
    const key = `${emp.company || '기타'}-${emp.department || '기타'}`;
    if (!statsMap.has(key)) {
      statsMap.set(key, {
        company: emp.company || '기타',
        department: emp.department || '기타',
        employeeCount: 0,
        totalSubscribers: 0,
        avgSubscribers: 0,
        topEmployee: null
      });
    }
    
    const stat = statsMap.get(key)!;
    stat.employeeCount++;
    stat.totalSubscribers += emp.subscriberCount;
    
    if (!stat.topEmployee || emp.subscriberCount > stat.topEmployee.subscriberCount) {
      stat.topEmployee = { name: emp.name, subscriberCount: emp.subscriberCount };
    }
  }
  
  const result = Array.from(statsMap.values());
  result.forEach(stat => {
    stat.avgSubscribers = stat.employeeCount > 0 ? stat.totalSubscribers / stat.employeeCount : 0;
  });
  
  return result;
}

export interface CompanyStatistics {
  company: string;
  employeeCount: number;
  totalSubscribers: number;
  avgSubscribers: number;
  departments: DepartmentStatistics[];
}

export async function getCompanyStatistics(): Promise<CompanyStatistics[]> {
  const deptStats = await getDepartmentStatistics();
  const compMap = new Map<string, CompanyStatistics>();
  
  for (const dept of deptStats) {
    if (!compMap.has(dept.company)) {
      compMap.set(dept.company, {
        company: dept.company,
        employeeCount: 0,
        totalSubscribers: 0,
        avgSubscribers: 0,
        departments: []
      });
    }
    
    const comp = compMap.get(dept.company)!;
    comp.departments.push(dept);
    comp.employeeCount += dept.employeeCount;
    comp.totalSubscribers += dept.totalSubscribers;
  }
  
  const result = Array.from(compMap.values());
  result.forEach(comp => {
    comp.avgSubscribers = comp.employeeCount > 0 ? comp.totalSubscribers / comp.employeeCount : 0;
  });
  
  return result;
}

export interface TextSettings {
  eventTitle: string;
  eventDescription: string;
  dashboardWelcome: string;
  loginPageTitle: string;
  loginPageSubtitle: string;
  subscribePageTitle: string;
  subscribePageDescription: string;
  rankingPageTitle: string;
  rankingPageSubtitle: string;
  successMessage: string;
  alreadySubscribedMessage: string;
}

export async function getTextSettings(): Promise<TextSettings> {
  const { data, error } = await supabase
    .from('admin_settings')
    .select('*')
    .eq('id', 1)
    .single();
    
  if (error || !data) {
    // 기본값 반환
    return {
      eventTitle: "한경비즈니스 구독 랭킹",
      eventDescription: "사원님의 힘을 보여주세요",
      dashboardWelcome: "환영합니다",
      loginPageTitle: "사원 로그인",
      loginPageSubtitle: "회사 이메일로 로그인하세요",
      subscribePageTitle: "응원하기",
      subscribePageDescription: "네이버로 로그인해서 응원!",
      rankingPageTitle: "실시간 랭킹",
      rankingPageSubtitle: "누가 가장 많은 구독을?",
      successMessage: "참여 완료!",
      alreadySubscribedMessage: "이미 참여하셨습니다."
    };
  }
  
  return data as unknown as TextSettings;
}

export async function updateTextSettings(settings: TextSettings): Promise<{ success: boolean; message: string }> {
  const { error } = await supabase
    .from('admin_settings')
    .upsert({ id: 1, ...settings });
    
  if (error) throw error;
  return { success: true, message: '성공' };
}