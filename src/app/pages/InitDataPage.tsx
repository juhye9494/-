import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { initEmployees, getAllEmployees } from "../utils/api";
import { motion } from "motion/react";
import { CheckCircle, AlertCircle, Database, Search } from "lucide-react";
import type { Employee } from "../utils/api";
import employeesDB from "../data/employees-db.json";

// Test employee data - imported from JSON file
const testEmployees = employeesDB;

export function InitDataPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentEmployees, setCurrentEmployees] = useState<Employee[]>([]);
  const [showCurrentData, setShowCurrentData] = useState(false);
  const [isLoadingCurrent, setIsLoadingCurrent] = useState(false);

  const handleInitData = async () => {
    if (!confirm("테스트 데이터를 초기화하시겠습니까?")) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setIsSuccess(false);

    try {
      const result = await initEmployees(testEmployees);
      setIsSuccess(true);
      toast.success(`${result.count}명의 직원 데이터가 등록되었습니다!`);
    } catch (error: any) {
      console.error("Init error:", error);
      setErrorMessage(error.message || "데이터 초기화에 실패했습니다");
      toast.error("데이터 초기화에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckCurrentData = async () => {
    setIsLoadingCurrent(true);
    try {
      const employees = await getAllEmployees();
      setCurrentEmployees(employees);
      setShowCurrentData(true);
      toast.success(`현재 ${employees.length}명의 직원이 등록되어 있습니다`);
    } catch (error: any) {
      console.error("Get employees error:", error);
      toast.error("직원 목록을 불러오는데 실패했습니다");
      setCurrentEmployees([]);
    } finally {
      setIsLoadingCurrent(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4"
          >
            <Database className="w-8 h-8 text-white" />
          </motion.div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            데이터베이스 초기화
          </h1>
          <p className="text-sm text-gray-600">
            테스트용 직원 데이터를 데이터베이스에 등록합니다
          </p>
        </div>

        {/* Employee List Preview */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200 max-h-96 overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            등록될 직원 목록 ({testEmployees.length}명)
          </h3>
          <div className="space-y-3 text-xs">
            {/* Group by company */}
            {Array.from(new Set(testEmployees.map(emp => emp.company))).map(company => (
              <div key={company}>
                <div className="font-semibold text-blue-700 mb-1 flex items-center gap-2">
                  <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
                  {company}
                </div>
                <div className="space-y-1 pl-4">
                  {testEmployees.filter(emp => emp.company === company).map((emp, index) => (
                    <div key={index} className="flex justify-between text-gray-600 py-1">
                      <span className="font-medium">{emp.name}</span>
                      <span className="text-gray-400">{emp.department}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Messages */}
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold text-green-900 mb-1">초기화 완료!</div>
              <div className="text-sm text-green-700">
                {testEmployees.length}명의 직원 데이터가 성공적으로 등록되었습니다.
              </div>
            </div>
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold text-red-900 mb-1">오류 발생</div>
              <div className="text-sm text-red-700">{errorMessage}</div>
            </div>
          </motion.div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            ⚠️ 주사항
          </h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• 이 작업은 테스트 환경에서만 실행하세요</li>
            <li>• 기존 데이터가 있다면 중복 등록될 수 있습니다</li>
            <li>• 모든 직원의 초기 구독자 수는 0명으로 설정됩니다</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleCheckCurrentData}
            disabled={isLoadingCurrent}
            variant="outline"
            className="w-full py-6 text-base font-semibold border-2"
          >
            {isLoadingCurrent ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"
              />
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                현재 등록된 직원 확인
              </>
            )}
          </Button>

          {showCurrentData && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-yellow-50 rounded-lg p-4 border border-yellow-200"
            >
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                📋 현재 등록된 직원 ({currentEmployees.length}명)
              </h3>
              {currentEmployees.length === 0 ? (
                <p className="text-xs text-gray-600">
                  등록된 직원이 없습니다. 위의 "데이터베이스 초기화" 버튼을 눌러 직원 데이터를 등록하세요.
                </p>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-1 text-xs">
                  {currentEmployees.map((emp, idx) => (
                    <div key={idx} className="flex justify-between items-center py-1.5 border-b border-yellow-100 last:border-0">
                      <div>
                        <span className="font-medium text-gray-900">{emp.name}</span>
                        <span className="text-gray-500 ml-2">({emp.email})</span>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-600">{emp.company}</div>
                        <div className="text-gray-400 text-[10px]">{emp.department}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          <Button
            onClick={handleInitData}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-semibold"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
              />
            ) : (
              <>
                <Database className="w-5 h-5 mr-2" />
                데이터베이스 초기화 실행
              </>
            )}
          </Button>

          <Button
            onClick={() => window.location.href = "/"}
            variant="outline"
            className="w-full py-5 border-2"
          >
            홈으로 돌아가기
          </Button>

          <Button
            onClick={() => navigate("/admin")}
            variant="ghost"
            size="sm"
            className="w-full text-xs text-gray-400 hover:text-gray-600"
          >
            관리자 페이지
          </Button>
        </div>
      </motion.div>
    </div>
  );
}