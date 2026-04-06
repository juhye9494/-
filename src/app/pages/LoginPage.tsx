import { useState } from "react";
import { useNavigate } from "react-router";
import { LogIn, Building2, Mail } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { motion } from "motion/react";
import { toast } from "sonner";
import { loginWithEmail } from "../utils/api";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("이메일을 입력해주세요");
      return;
    }

    // Check if email ends with @hankyung.com
    if (!email.endsWith("@hankyung.com")) {
      toast.error("한경비즈니스 이메일(@hankyung.com)로 로그인해주세요");
      return;
    }

    setIsLoading(true);

    try {
      // Call API to login
      const employee = await loginWithEmail(email);
      
      // Login success
      localStorage.setItem("employee", JSON.stringify({
        email: employee.email,
        id: employee.id,
        name: employee.name,
      }));
      
      toast.success(`${employee.name}님, 로그인 성공!`);
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Check if it's a "not registered" error
      if (error.message && error.message.includes("등록되지 않은")) {
        toast.error(error.message, {
          duration: 5000,
          action: {
            label: "데이터 초기화",
            onClick: () => navigate("/init-data")
          }
        });
      } else {
        toast.error(error.message || "로그인에 실패했습니다");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm p-6 sm:p-8 max-w-md w-full border border-gray-200"
      >
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4"
          >
            <Building2 className="w-8 h-8 text-white" />
          </motion.div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            직원 로그인
          </h1>
          <p className="text-sm text-gray-600">
            한국경제매거진앤북 구독 경쟁 이벤트
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="email"
                placeholder="example@hankyung.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-lg"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
              />
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2 inline" />
                로그인
              </>
            )}
          </Button>
        </form>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs text-gray-600 leading-relaxed text-center">
            <strong className="text-gray-900">안내:</strong> 사내 이메일(예: hankyung.com)을 입력하세요.
            <br />별도의 비밀번호 없이 이메일만으로 로그인할 수 있습니다.
          </p>
        </div>

        {/* Back Button */}


        {/* Admin Link */}
        <div className="mt-4 text-center">
          <Button
            onClick={() => navigate("/admin")}
            variant="ghost"
            size="sm"
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            관리자 페이지
          </Button>
        </div>
      </motion.div>
    </div>
  );
}