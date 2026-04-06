import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { CheckCircle, XCircle, Share2, ArrowLeft, ExternalLink } from "lucide-react";
import { getEmployeeById, getNaverAuthUrl, verifyNaverAndCount } from "../utils/api";
import type { Employee } from "../utils/api";
import { Button } from "../components/ui/button";
import { motion } from "motion/react";
import { toast } from "sonner";
import { NAVER_GUIDE_BASE64 } from "../assets/GuideImage";

export function SubscribePage() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loadingEmployee, setLoadingEmployee] = useState(true);

  useEffect(() => {
    if (employeeId) {
      loadEmployee();
    }

    // 네이버 로그인 후 돌아왔을 때의 처리
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state"); // state에는 employeeId가 담겨 있습니다.

    if (code && state) {
      handleNaverCallback(code, state);
    }
  }, [employeeId]);

  const loadEmployee = async () => {
    if (!employeeId) return;
    
    try {
      setLoadingEmployee(true);
      const emp = await getEmployeeById(employeeId);
      setEmployee(emp);
    } catch (error: any) {
      console.error("Failed to load employee:", error);
      setEmployee(null);
    } finally {
      setLoadingEmployee(false);
    }
  };

  const handleNaverCallback = async (code: string, state: string) => {
    setIsLoading(true);
    try {
      // 1. 서버에 코드 검증 및 카운트 요청
      await verifyNaverAndCount(code, state);
      
      // 2. 성공 시 즉시 네이버 뉴스 페이지로 이동 (사용자 요청 사항)
      handleGoToNaver();
    } catch (error: any) {
      console.error("Callback error:", error);
      toast.error(error.message || "인증 처리 중 오류가 발생했습니다.");
      setIsLoading(false);
    }
  };

  const handleNaverLogin = () => {
    if (!employeeId) return;
    
    // 네이버 인증 페이지로 리다이렉트
    const authUrl = getNaverAuthUrl(employeeId);
    window.location.href = authUrl;
  };

  const handleGoToNaver = () => {
    // Redirect to Hankyung Naver press subscription page ranking list (Immediate redirect in current window)
    window.location.href = "https://media.naver.com/press/050/ranking";
    toast.success("한경비즈니스 구독 페이지로 이동합니다");
  };

  const handleShare = () => {
    const url = window.location.href;
    
    const textArea = document.createElement("textarea");
    textArea.value = url;
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
      toast.error("링크 복사에 실패했습니다.");
    }
    
    document.body.removeChild(textArea);
  };

  if (loadingEmployee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-2xl p-8 max-w-md text-center"
        >
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">링크를 찾을 수 없습니다</h1>
          <p className="text-gray-600 mb-6 text-sm">
            유효하지 않은 링크입니다. 링크를 다시 확인해주세요.
          </p>

        </motion.div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-2xl p-8 max-w-md text-center"
        >
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">링크를 찾을 수 없습니다</h1>
          <p className="text-gray-600 mb-6 text-sm">
            유효하지 않은 링크입니다. 링크를 다시 확인해주세요.
          </p>

        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 relative overflow-hidden flex items-center justify-center p-4">
      {/* Decorative triangles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[30px] border-b-white/20" />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-2xl p-6 md:p-8 max-w-md w-full relative z-10"
      >
        {!authenticated ? (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {employee.name} 님을 응원해주세요!
              </h1>
              <p className="text-sm text-gray-600">
                한국경제매거진앤북 구독 경쟁 이벤트
              </p>
            </div>

            {/* Employee Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">추천인</div>
                  <div className="text-lg font-bold text-blue-600">
                    {employee.name}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">현재 참여자</div>
                  <div className="text-lg font-bold text-blue-600">
                    {employee.subscriberCount}명
                  </div>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-200">
              <h3 className="text-base font-bold text-gray-900 mb-3 text-center">
                🎯 참여 방법
              </h3>
              <ol className="space-y-4 text-sm text-gray-700 mb-4">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-green-600 min-w-[20px]">1.</span>
                  <span>아래 "네이버로 로그인" 버튼을 눌러주세요</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-green-600 min-w-[20px]">2.</span>
                  <span>로그인 후 이동하는 페이지에서 <strong>[+구독] 버튼</strong>을 클릭하면 참여 완료!</span>
                </li>
              </ol>
              
              {/* Naver Guide Image */}
              <div className="mb-4 rounded-lg overflow-hidden border border-yellow-300 shadow-md">
                <img 
                  src={NAVER_GUIDE_BASE64} 
                  alt="네이버 뉴스 구독 가이드" 
                  className="w-full h-auto"
                />
              </div>

              <div className="pt-3 border-t border-green-200">
                <p className="text-xs text-center text-gray-600 italic">
                  ✓ 로그인이 완료되면 자동으로 구독 페이지로 이동합니다.
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleNaverLogin}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 rounded-lg text-base font-semibold"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
                  />
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845Z"/>
                    </svg>
                    네이버로 로그인하고 참여하기
                  </>
                )}
              </Button>

              <Button
                onClick={handleShare}
                variant="outline"
                className="w-full py-5 border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <Share2 className="w-4 h-4 mr-2" />
                친구에게 링크 공유하기
              </Button>


            </div>
          </>
        ) : (
          /* Success State */
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6, delay: 0.2 }}
            >
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            </motion.div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              참여 완료! 🎉
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              {employee.name} 님을 응원해주셔서 감사합니다!
            </p>

            <div className="bg-green-50 rounded-lg p-6 mb-6 border border-green-200">
              <div className="text-sm text-green-700 mb-2">
                {employee.name} 님의 현재 참여자 수
              </div>
              <div className="text-4xl font-bold text-green-600 mb-2">
                {employee.subscriberCount}명
              </div>
              <div className="text-xs text-gray-600">
                ✅ 인증이 완료되었습니다!
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleGoToNaver}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-semibold"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                한경비즈니스 네이버 구독하기
              </Button>



              <Button
                onClick={handleShare}
                variant="ghost"
                className="w-full py-5 text-gray-600 hover:text-gray-900"
              >
                <Share2 className="w-4 h-4 mr-2" />
                다른 친구에게도 공유하기
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}