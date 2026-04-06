import { useNavigate } from "react-router-dom";
import { Home, Search } from "lucide-react";
import { Button } from "../components/ui/button";
import { motion } from "motion/react";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-sm p-12 max-w-lg text-center border border-gray-200"
      >
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-8xl font-bold text-gray-200 mb-4"
        >
          404
        </motion.div>
        
        <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          페이지를 찾을 수 없습니다
        </h1>
        
        <p className="text-gray-600 mb-8 text-sm">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        
        <Button
          onClick={() => navigate("/")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-5"
        >
          <Home className="w-4 h-4 mr-2" />
          홈으로 돌아가기
        </Button>
      </motion.div>
    </div>
  );
}