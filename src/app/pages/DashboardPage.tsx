import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { LogOut, Copy, Trophy, Shield } from "lucide-react";
import { Button } from "../components/ui/button";
import { motion } from "motion/react";
import { toast } from "sonner";
import { getEmployeeById, getEmployeeRank } from "../utils/api";
import type { Employee } from "../utils/api";

interface EmployeeData {
  email: string;
  id: string;
  name: string;
}

// Mock subscription data - 실제로는 서버에서 가져와야 함
interface Subscription {
  no: number;
  date: string;
  email: string;
  withdrawn: boolean;
  excluded: boolean;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [employeeInfo, setEmployeeInfo] = useState<Employee | null>(null);
  const [rank, setRank] = useState<number>(0);
  const [myLink, setMyLink] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for subscriptions
  const mockSubscriptions: Subscription[] = [
    { no: 1, date: "2026-03-25 14:23", email: "user1@naver.com", withdrawn: false, excluded: false },
    { no: 2, date: "2026-03-26 09:15", email: "user2@gmail.com", withdrawn: false, excluded: false },
    { no: 3, date: "2026-03-27 16:42", email: "user3@kakao.com", withdrawn: true, excluded: true },
  ];

  useEffect(() => {
    // Check if user is logged in
    const stored = localStorage.getItem("employee");
    if (!stored) {
      toast.error("로그인이 필요합니다");
      navigate("/login");
      return;
    }

    const data: EmployeeData = JSON.parse(stored);
    setEmployee(data);
    setMyLink(`${window.location.origin}/subscribe/${data.id}`);
    
    // Set current date
    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} 기준`;
    setCurrentDate(formatted);

    // Load employee data from API
    loadEmployeeData(data.id);
  }, [navigate]);

  const loadEmployeeData = async (employeeId: string) => {
    try {
      setIsLoading(true);
      const [empData, rankData] = await Promise.all([
        getEmployeeById(employeeId),
        getEmployeeRank(employeeId)
      ]);
      setEmployeeInfo(empData);
      setRank(rankData.rank);
    } catch (error: any) {
      console.error("Failed to load employee data:", error);
      toast.error("데이터를 불러오는데 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("employee");
    toast.success("로그아웃되었습니다");
    navigate("/");
  };

  const handleCopyLink = () => {
    const textArea = document.createElement("textarea");
    textArea.value = myLink;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      toast.success("링크가 복사되었습니다!");
    } catch (err) {
      toast.error("링크 복사에 실패했습니다");
    }
    
    document.body.removeChild(textArea);
  };

  if (!employee) {
    return null;
  }

  const count = employeeInfo?.subscriberCount || 0;
  const validCount = mockSubscriptions.filter(s => !s.excluded).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 relative overflow-hidden">
      {/* Decorative triangles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[25px] border-b-white/20" />
          </motion.div>
        ))}
      </div>

      {/* Header with Logout */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <Button
          onClick={handleLogout}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20"
        >
          <LogOut className="w-4 h-4 mr-1" />
          로그아웃
        </Button>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl relative z-10">
        {/* Logo and Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {/* Triangle Logo */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-0 h-0 border-l-[50px] border-l-transparent border-r-[50px] border-r-transparent border-b-[80px] border-b-white" />
              <div className="absolute top-2 left-1/2 -translate-x-1/2 text-blue-600 font-bold text-xs whitespace-nowrap">
                HANKYUNG
              </div>
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[60px] h-[2px] bg-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">개인실적 조회하기</h1>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-2xl p-8 relative"
        >
          {/* Date */}
          <div className="text-right text-sm text-gray-500 mb-6">
            {currentDate}
          </div>

          {/* Employee Info */}
          <div className="space-y-3 mb-8">
            <div className="flex items-center">
              <span className="text-lg font-bold text-gray-900 w-24">이름 :</span>
              <span className="text-lg text-gray-800">{employee.name}</span>
            </div>
            <div className="flex items-center">
              <span className="text-lg font-bold text-gray-900 w-24">회사 :</span>
              <span className="text-lg text-gray-800">한국경제매거진</span>
            </div>
          </div>

          {/* Link Section */}
          <div className="mb-8">
            <div className="mb-3">
              <span className="text-base font-bold text-green-600">{employee.name}님의 고유추천링크 :</span>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
              <p className="text-base font-semibold text-green-700 break-all">
                {myLink}
              </p>
            </div>
            <Button
              onClick={handleCopyLink}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-semibold"
            >
              <Copy className="w-5 h-5 mr-2" />
              링크 복사하기
            </Button>
          </div>

          {/* Stats Section */}
          <div className="border-t border-gray-200 pt-6 mb-8">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-base text-gray-700">2026년 실적</span>
                <span className="text-xl font-bold text-blue-600">{count}명</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-base text-gray-700">2026년 실적(순위 반영)</span>
                <span className="text-xl font-bold text-blue-600">{validCount}명</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-base text-gray-700">현재 순위</span>
                <span className="text-2xl font-bold text-blue-600">{rank}위</span>
              </div>
            </div>
          </div>

          {/* Subscription List */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">가입인증 리스트</h3>
            
            {/* Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <ul className="space-y-1 text-xs text-gray-700">
                <li>* 가입정보보호법에 따라 이메일주소 일부만 확인할 수 있습니다.</li>
                <li>* 회원가입 후 탈퇴시 재등록됩니다.</li>
                <li>* 본회측 도메인 사용되지 않는 도메인 등 검사작업 판단될 수 있는 계정이 최종가입한 경우, 이탈경우로 문의하여 실적제외 인정하지 않습니다.</li>
              </ul>
            </div>

            {/* Table */}
            {mockSubscriptions.length > 0 ? (
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4 text-center font-semibold text-gray-700">번호</th>
                      <th className="py-3 px-4 text-center font-semibold text-gray-700">가입인증<br/>날짜 시간</th>
                      <th className="py-3 px-4 text-center font-semibold text-gray-700">이메일</th>
                      <th className="py-3 px-4 text-center font-semibold text-gray-700">탈퇴여부</th>
                      <th className="py-3 px-4 text-center font-semibold text-gray-700">실적제외</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockSubscriptions.map((sub) => (
                      <tr key={sub.no} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-center text-gray-700">{sub.no}</td>
                        <td className="py-3 px-4 text-center text-gray-700">{sub.date}</td>
                        <td className="py-3 px-4 text-center text-gray-700">{sub.email}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`${sub.withdrawn ? 'text-red-600' : 'text-gray-700'}`}>
                            {sub.withdrawn ? '탈퇴' : '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`${sub.excluded ? 'text-red-600 font-semibold' : 'text-gray-700'}`}>
                            {sub.excluded ? '제외' : '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
                아직 가입 인증 내역이 없습니다
              </div>
            )}
          </div>

          {/* Action Button */}
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="w-full py-6 text-base font-semibold border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <Trophy className="w-5 h-5 mr-2" />
            실시간 랭킹 보기
          </Button>
        </motion.div>
      </div>
    </div>
  );
}