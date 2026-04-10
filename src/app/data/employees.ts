// Mock data for demonstration
// In production, this would come from a database
export interface Employee {
  id: string;
  name: string;
  email: string;
  subscriberCount: number;
}

export const mockEmployees: Employee[] = [
  { id: "emp001", name: "김민수", email: "kimms@hankyung.com", subscriberCount: 133 },
  { id: "emp002", name: "이지은", email: "leeje@hankyung.com", subscriberCount: 127 },
  { id: "emp003", name: "박서준", email: "parksj@hankyung.com", subscriberCount: 118 },
  { id: "emp004", name: "정수아", email: "jungsa@hankyung.com", subscriberCount: 105 },
  { id: "emp005", name: "최동욱", email: "choidw@hankyung.com", subscriberCount: 98 },
  { id: "emp006", name: "강민지", email: "kangmj@hankyung.com", subscriberCount: 92 },
  { id: "emp007", name: "윤하늘", email: "yoonhn@hankyung.com", subscriberCount: 87 },
  { id: "emp008", name: "임태양", email: "limty@hankyung.com", subscriberCount: 81 },
  { id: "emp009", name: "송지호", email: "songjh@hankyung.com", subscriberCount: 76 },
  { id: "emp010", name: "한소희", email: "hansh@hankyung.com", subscriberCount: 72 },
  { id: "emp011", name: "오세훈", email: "ohsh@hankyung.com", subscriberCount: 68 },
  { id: "emp012", name: "장미래", email: "jangml@hankyung.com", subscriberCount: 64 },
  { id: "emp013", name: "신우진", email: "shinwj@hankyung.com", subscriberCount: 59 },
  { id: "emp014", name: "배준호", email: "baejh@hankyung.com", subscriberCount: 55 },
  { id: "emp015", name: "서은채", email: "seoec@hankyung.com", subscriberCount: 51 },
  { id: "emp016", name: "문지훈", email: "moonjh@hankyung.com", subscriberCount: 47 },
  { id: "emp017", name: "안유진", email: "anyj@hankyung.com", subscriberCount: 43 },
  { id: "emp018", name: "조민기", email: "jomk@hankyung.com", subscriberCount: 39 },
  { id: "emp019", name: "황수빈", email: "hwangsb@hankyung.com", subscriberCount: 35 },
  { id: "emp020", name: "홍다연", email: "hongdy@hankyung.com", subscriberCount: 31 },
];

// Sort employees by subscriber count (descending)
export const getRankedEmployees = (): Employee[] => {
  return [...mockEmployees].sort((a, b) => b.subscriberCount - a.subscriberCount);
};

// Get employee rank
export const getEmployeeRank = (employeeId: string): number => {
  const ranked = getRankedEmployees();
  return ranked.findIndex(emp => emp.id === employeeId) + 1;
};

// Get employee by id
export const getEmployeeById = (employeeId: string): Employee | undefined => {
  return mockEmployees.find(emp => emp.id === employeeId);
};

// Get employee by email
export const getEmployeeByEmail = (email: string): Employee | undefined => {
  return mockEmployees.find(emp => emp.email?.toLowerCase() === email.toLowerCase());
};

// Simulate OAuth login and subscription
// In production, this would:
// 1. Redirect to Naver OAuth
// 2. Get user's Naver ID
// 3. Check if this Naver ID already subscribed through this employee link
// 4. If not, increment count and save Naver ID
export const authenticateAndSubscribe = (employeeId: string, naverId: string): boolean => {
  const employee = mockEmployees.find(emp => emp.id === employeeId);
  
  // Check if this Naver ID already subscribed (in production, check database)
  const storageKey = `subscribed_${employeeId}_${naverId}`;
  const alreadySubscribed = localStorage.getItem(storageKey);
  
  if (alreadySubscribed) {
    return false; // Already subscribed
  }
  
  if (employee) {
    employee.subscriberCount += 1;
    localStorage.setItem(storageKey, 'true');
    return true;
  }
  return false;
};