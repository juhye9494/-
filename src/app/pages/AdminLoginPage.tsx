import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Lock, User } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { motion } from "motion/react";
import { toast } from "sonner";

// Admin credentials - 실제 환경에서는 환경 변수나 백엔드에서 관리해야 합니다
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "hankyung2024!";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error("아이디와 비밀번호를 입력해주세요");
      return;
    }

    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      // Verify admin credentials
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Store admin session
        localStorage.setItem("adminAuth", JSON.stringify({
          authenticated: true,
          username: username,
          loginTime: new Date().toISOString(),
        }));
        
        toast.success("관리자 로그인 성공!");
        navigate("/admin");
      } else {
        toast.error("아이디 또는 비밀번호가 올바르지 않습니다");
      }
    } catch (error: any) {
      console.error("Admin login error:", error);
      toast.error("로그인에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full"
      >
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-full mb-4"
          >
            <Shield className="w-8 h-8 text-white" />
          </motion.div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            관리자 로그인
          </h1>
          <p className="text-sm text-gray-600">
            관리자 전용 페이지입니다
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              아이디
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                autoComplete="current-password"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-5 rounded-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                로그인 중...
              </div>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                로그인
              </>
            )}
          </Button>
        </form>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            관리자 계정이 필요하신가요?<br />
            IT팀에 문의해주세요.
          </p>
        </div>

        {/* Back Button */}
        <div className="mt-4 text-center">
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
          >
            ← 홈으로 돌아가기
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
