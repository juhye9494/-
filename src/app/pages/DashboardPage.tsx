import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Copy, Trophy } from "lucide-react";
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

export function DashboardPage() {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [employeeInfo, setEmployeeInfo] = useState<Employee | null>(null);
  const [rank, setRank] = useState<number>(0);
  const [myLink, setMyLink] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 relative overflow-hidden">
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
          <h1 className="text-3xl font-bold text-white">개인실적 조회하기</h1>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-2xl p-6 sm:p-8 relative"
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
          <div className="mb-8 border-b border-gray-100 pb-8">
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
          <div className="mb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 sm:p-6 text-center border border-blue-100">
                <div className="text-sm text-gray-600 mb-1 font-medium">현재 실적</div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">{count}명</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 sm:p-6 text-center border border-blue-100">
                <div className="text-sm text-gray-600 mb-1 font-medium">현재 순위</div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">{rank}위</div>
              </div>
            </div>
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