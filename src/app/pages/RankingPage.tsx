import { useState, useEffect } from "react";
import { Trophy, Crown, Search, User } from "lucide-react";
import { getRankings, getEmployeeRank, verifyNaverAndCount } from "../utils/api";
import type { Employee } from "../utils/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { motion } from "motion/react";
import { toast } from "sonner";

export function RankingPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<{
    rank: number;
    name: string;
    count: number;
    email?: string;
  } | null>(null);
  const [loggedInEmployee, setLoggedInEmployee] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    // Check if user is logged in
    const stored = localStorage.getItem("employee");
    if (stored) {
      setLoggedInEmployee(JSON.parse(stored));
    }

    // Load rankings
    loadRankings();

    // 네이버 로그인 콜백 확인
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state"); // state에 담긴 직원 ID

    if (code && state) {
      handleNaverCallback(code, state);
    }

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleNaverCallback = async (code: string, employeeId: string) => {
    const loadingToast = toast.loading("인증 확인 중... 곧 이동합니다.");
    
    // 보험(Fallback): 서버 응답이 너무 느려도 2.5초 뒤엔 무조건 네이버 뉴스로 보냅니다.
    const fallbackRedirect = setTimeout(() => {
      toast.dismiss(loadingToast);
      window.location.href = "https://media.naver.com/press/050/ranking";
    }, 2500);

    try {
      // 1. 서버에 코드 검증 및 카운트 요청 (비동기)
      await verifyNaverAndCount(code, employeeId);
      
      // 서버 응답이 2.5초보다 빠르면 위 타이머를 취소하고 즉시 이동
      clearTimeout(fallbackRedirect);
      toast.dismiss(loadingToast);
      window.location.href = "https://media.naver.com/press/050/ranking";
    } catch (error: any) {
      console.error("Home callback error:", error);
      // 에러가 나더라도 사용자는 뉴스 페이지로 보내줍니다. (데이터는 로그로 확인)
      clearTimeout(fallbackRedirect);
      toast.dismiss(loadingToast);
      window.location.href = "https://media.naver.com/press/050/ranking";
    }
  };

  const loadRankings = async () => {
    try {
      setIsLoading(true);
      const rankings = await getRankings();
      setEmployees(rankings);
      
      // If no employees, show init data message
      if (rankings.length === 0) {
        toast.info("데이터가 없습니다. 먼저 데이터를 초기화해주세요.", {
          duration: 5000,
          action: {
            label: "초기화 페이지",
            onClick: () => navigate("/init-data")
          }
        });
      }
    } catch (error) {
      console.error("Failed to load rankings:", error);
      toast.error("랭킹 정보를 불러오는데 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("검색어를 입력해주세요");
      return;
    }

    try {
      // 1. 전체 목록(employees)에서 ID 또는 이메일이 일치하는 직원 찾기
      const employee = employees.find(
        (emp) => 
          emp.id === searchQuery.trim() || 
          emp.email === searchQuery.trim()
      );
      
      if (employee) {
        // 2. 해당 직원의 ID로 순위 정보 가져오기
        const { rank } = await getEmployeeRank(employee.id);
        setSearchResult({
          rank,
          name: employee.name,
          count: employee.subscriberCount,
          email: employee.email,
        });
      } else {
        toast.error("해당 직원을 찾을 수 없습니다. (ID 또는 이메일을 확인해주세요)");
      }
    } catch (error: any) {
      console.error("Search error:", error);
      toast.error(error.message || "검색에 실패했습니다");
    }
  };

  const handleMyRank = async () => {
    if (!loggedInEmployee) {
      toast.error("로그인이 필요합니다");
      navigate("/login");
      return;
    }

    try {
      const { rank } = await getEmployeeRank(loggedInEmployee.id);
      const employee = employees.find(emp => emp.id === loggedInEmployee.id);
      
      if (employee) {
        setSearchResult({
          rank,
          name: employee.name,
          count: employee.subscriberCount,
          email: employee.email,
        });
      }
    } catch (error: any) {
      console.error("My rank error:", error);
      toast.error("순위 정보를 찾을 수 없습니다");
    }
  };

  const copyLink = (employeeId: string) => {
    const url = `${window.location.origin}/subscribe/${employeeId}`;
    
    // Use fallback method directly to avoid clipboard permission issues
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
      toast.success("링크가 복사되었습니다");
    } catch (err) {
      toast.error("링크 복사에 실패했습니다");
    }
    
    document.body.removeChild(textArea);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // 피라미드 구조를 위한 줄별 배열 생성
  const getPyramidRows = () => {
    if (employees.length === 0) return [];
    
    if (isMobile) {
      // 모바일: 1위(1), 2-3위(2), 이후 줄당 3명씩
      const rows = [];
      rows.push(employees.slice(0, 1));
      if (employees.length > 1) rows.push(employees.slice(1, 3));
      
      let current = 3;
      while (current < employees.length) {
        rows.push(employees.slice(current, Math.min(current + 3, employees.length)));
        current += 3;
      }
      return rows;
    } else {
      // 데스크탑: 기존 피라미드 (1, 2, 3, 4, 5, 5)
      return [
        employees.slice(0, 1),
        employees.slice(1, 3),
        employees.slice(3, 6),
        employees.slice(6, 10),
        employees.slice(10, 15),
        employees.slice(15, 20),
      ];
    }
  };

  const pyramidRows = getPyramidRows();

  const getRankStyle = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white border-yellow-500 shadow-lg shadow-yellow-500/50";
    if (rank === 2) return "bg-white text-gray-900 border-gray-200 shadow-lg";
    if (rank === 3) return "bg-white text-gray-900 border-gray-200 shadow-lg";
    return "bg-white text-gray-900 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 bg-fixed overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-300" />
              <div>
                <h1 className="text-xl font-bold text-white">구독 랭킹</h1>
                <p className="text-xs text-white/80">실시간 사원별 구독자 순위</p>
              </div>
            </div>
            
            {/* Search Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-sm bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  <Search className="w-4 h-4 mr-1" />
                  내 순위 조회
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle>내 순위 조회</DialogTitle>
                  <DialogDescription>
                    사원 ID를 입력하여 순위를 확인하세요
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {/* My Rank Button - only shown if logged in */}
                  {loggedInEmployee && (
                    <Button
                      onClick={handleMyRank}
                      variant="outline"
                      className="w-full bg-blue-50 border-blue-200 hover:bg-blue-100"
                    >
                      <User className="w-4 h-4 mr-2" />
                      내 순위 보기 ({loggedInEmployee.email})
                    </Button>
                  )}
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="사원 ID 또는 이메일"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button onClick={handleSearch} size="sm" className="bg-blue-600 hover:bg-blue-700">
                      조회
                    </Button>
                  </div>
                  
                  {searchResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-blue-50 rounded-lg p-4 border border-blue-100"
                    >
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                          {searchResult.rank}위
                        </div>
                        <div className="text-base text-gray-900 mb-0.5">{searchResult.name}</div>
                        <div className="text-sm text-gray-600">
                          구독자 {searchResult.count}명
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Pyramid Structure */}
        <div className="space-y-4">
          {pyramidRows.map((row, rowIndex) => {
            const itemsInRow = row.length;
            const startRank = pyramidRows.slice(0, rowIndex).reduce((sum, r) => sum + r.length, 0) + 1;
            
            return (
              <motion.div
                key={rowIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rowIndex * 0.1 }}
                className="flex justify-center gap-1 sm:gap-3"
              >
                {row.map((employee, index) => {
                  const rank = startRank + index;
                  const isTopThree = rank <= 3;
                  
                  return (
                    <motion.div
                      key={employee.id}
                      initial={{ opacity: 0, scale: 0.8, y: -20 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1, 
                        y: 0,
                        // Special animation only for 1st place
                        ...(rank === 1 && {
                          y: [0, -8, 0],
                        })
                      }}
                      transition={{ 
                        duration: 0.5,
                        delay: rowIndex * 0.1 + index * 0.05,
                        ...(rank === 1 && {
                          y: {
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }
                        })
                      }}
                      whileHover={{ 
                        scale: 1.1, 
                        rotate: rank === 1 ? [0, -3, 3, 0] : 0 
                      }}
                      className="relative group"
                    >
                      {/* Glow effect only for 1st place */}
                      {rank === 1 && (
                        <motion.div
                          className="absolute inset-0 rounded-lg blur-xl opacity-50 bg-yellow-400"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.6, 0.3],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      )}
                      
                      <div
                        className={`w-24 h-24 sm:w-28 sm:h-28 rounded-lg border-2 ${getRankStyle(rank)} ${
                          isTopThree ? 'border-3 shadow-2xl' : 'shadow-sm hover:shadow-md'
                        } transition-all duration-200 flex flex-col items-center justify-center p-2 sm:p-3 relative z-10`}
                      >
                        {/* Sparkle effects for 1st place */}
                        {rank === 1 && (
                          <>
                            <motion.div
                              className="absolute -top-1 -right-1 text-2xl"
                              animate={{ 
                                rotate: [0, 360],
                                scale: [1, 1.3, 1],
                              }}
                              transition={{ 
                                duration: 3,
                                repeat: Infinity,
                                ease: "linear"
                              }}
                            >
                              ✨
                            </motion.div>
                            <motion.div
                              className="absolute -bottom-1 -left-1 text-xl"
                              animate={{ 
                                rotate: [360, 0],
                                scale: [1, 1.2, 1],
                              }}
                              transition={{ 
                                duration: 2.5,
                                repeat: Infinity,
                                ease: "linear",
                                delay: 0.5,
                              }}
                            >
                              💫
                            </motion.div>
                          </>
                        )}

                        {/* Rank Badge */}
                        <motion.div 
                          className={`absolute -top-1 -left-1 sm:-top-2 sm:-left-2 w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-md ${
                            rank === 1 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-white' :
                            rank === 2 ? 'bg-blue-600 text-white' :
                            rank === 3 ? 'bg-blue-600 text-white' :
                            'bg-gray-800 text-white'
                          }`}
                          animate={rank === 1 ? {
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1],
                          } : undefined}
                          transition={rank === 1 ? {
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          } : undefined}
                        >
                          {rank}
                        </motion.div>

                        {/* Crown for 1st place */}
                        {rank === 1 && (
                          <motion.div
                            animate={{ 
                              y: [0, -3, 0],
                              rotate: [-5, 5, -5],
                            }}
                            transition={{ 
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <Crown className="w-6 h-6 mb-1 text-yellow-100 drop-shadow-lg" />
                          </motion.div>
                        )}

                        {/* Medal icons for 2nd and 3rd */}
                        {rank === 2 && (
                          <motion.div
                            animate={{ 
                              scale: [1, 1.1, 1],
                            }}
                            transition={{ 
                              duration: 1.2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="text-xl mb-1"
                          >
                            🥈
                          </motion.div>
                        )}
                        {rank === 3 && (
                          <motion.div
                            animate={{ 
                              scale: [1, 1.1, 1],
                            }}
                            transition={{ 
                              duration: 1.2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="text-xl mb-1"
                          >
                            🥉
                          </motion.div>
                        )}

                        {/* Name */}
                        <div className={`text-[10px] sm:text-sm font-bold text-center mb-0.5 sm:mb-1 ${
                          rank === 1 ? 'text-white drop-shadow-md' : 'text-gray-900'
                        }`}>
                          {employee.name}
                        </div>

                        {/* Subscriber Count */}
                        <div className={`text-[8px] sm:text-xs font-semibold ${
                          rank === 1 ? 'text-white/90' : 'text-gray-600'
                        }`}>
                          {employee.subscriberCount}명 참여
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            );
          })}
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 space-y-4"
        >
          {/* Create Link Button */}
          <div className="text-center">
            <Button
              onClick={() => navigate("/login")}
              size="lg"
              className="bg-white hover:bg-white/90 text-blue-600 px-8 py-6 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              🔗 내 링크 생성하기
            </Button>
            <p className="text-sm text-white/90 mt-3">
              한국경제신문 직원이신가요? 로그인하여 나만의 추천 링크를 받으세요!
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-white/95 backdrop-blur rounded-lg p-5 border border-white/20 shadow-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-blue-600" />
              이벤트 안내
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              직원 로그인 후 개인 링크를 받아 공유하세요.
              해당 링크로 접속하여 네이버 로그인한 사용자 수만큼 순위가 올라갑니다!
            </p>
          </div>
        </motion.div>

        {/* Footer - Admin Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center pb-8"
        >
          <Button
            onClick={() => navigate("/admin")}
            variant="ghost"
            size="sm"
            className="text-white/60 hover:text-white hover:bg-white/10 text-xs"
          >
            관리자 페이지
          </Button>
        </motion.div>
      </div>
    </div>
  );
}