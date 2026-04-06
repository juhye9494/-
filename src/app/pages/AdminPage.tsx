import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Search, 
  Building2, 
  BarChart3, 
  LogOut,
  Shield,
  Download,
  Filter,
  FileText,
  Save
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { getAllEmployees, getDepartmentStatistics, getTextSettings, updateTextSettings } from "../utils/api";
import type { Employee, DepartmentStatistics, TextSettings } from "../utils/api";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export function AdminPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStatistics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [textSettings, setTextSettings] = useState<TextSettings>({
    eventTitle: "",
    eventDescription: "",
    dashboardWelcome: "",
    loginPageTitle: "",
    loginPageSubtitle: "",
    subscribePageTitle: "",
    subscribePageDescription: "",
    rankingPageTitle: "",
    rankingPageSubtitle: "",
    successMessage: "",
    alreadySubscribedMessage: "",
  });
  const [isSavingText, setIsSavingText] = useState(false);

  useEffect(() => {
    // Check if admin is authenticated
    const stored = localStorage.getItem("adminAuth");
    if (!stored) {
      toast.error("관리자 로그인이 필요합니다");
      navigate("/admin/login");
      return;
    }

    // Verify admin authentication
    try {
      const adminAuth = JSON.parse(stored);
      if (!adminAuth.authenticated) {
        toast.error("관리자 권한이 없습니다");
        navigate("/admin/login");
        return;
      }
    } catch (error) {
      toast.error("인증 정보가 올바르지 않습니다");
      navigate("/admin/login");
      return;
    }
    
    // Load data
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [employeesData, statsData, textSettingsData] = await Promise.all([
        getAllEmployees(),
        getDepartmentStatistics(),
        getTextSettings()
      ]);
      setEmployees(employeesData);
      setFilteredEmployees(employeesData);
      setDepartmentStats(statsData);
      setTextSettings(textSettingsData);
    } catch (error: any) {
      console.error("Failed to load admin data:", error);
      toast.error("데이터를 불러오는데 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Filter employees based on search, company and department
    let filtered = employees;

    // Company filter
    if (companyFilter !== "all") {
      filtered = filtered.filter(emp => emp.company === companyFilter);
    }

    // Department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter(emp => emp.department === departmentFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredEmployees(filtered);
  }, [searchQuery, companyFilter, departmentFilter, employees]);

  // When company filter changes, reset department filter
  useEffect(() => {
    setDepartmentFilter("all");
  }, [companyFilter]);

  // Get unique companies and departments
  const companies = Array.from(new Set(employees.map(emp => emp.company).filter(Boolean)));
  const departments = companyFilter === "all" 
    ? Array.from(new Set(employees.map(emp => emp.department).filter(Boolean)))
    : Array.from(new Set(employees.filter(emp => emp.company === companyFilter).map(emp => emp.department).filter(Boolean)));

  // Top performers by department
  const topPerformersByDept = departmentStats.map(stat => ({
    department: stat.department,
    topEmployee: stat.topEmployee?.name || "-",
    count: stat.topEmployee?.subscriberCount || 0,
  }));

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    toast.success("로그아웃되었습니다");
    navigate("/");
  };

  const handleExportData = () => {
    toast.success("데이터 내보내기 기능은 준비 중입니다");
  };

  const totalEmployees = employees.length;
  const totalSubscribers = employees.reduce((sum, emp) => sum + emp.subscriberCount, 0);
  const avgSubscribers = Math.round(totalSubscribers / totalEmployees);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center"
              >
                <Shield className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">관리자 대시보드</h1>
                <p className="text-xs text-gray-500">구독 경쟁 이벤트 관리</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                size="sm"
                className="text-sm"
              >
                랭킹 보기
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-sm text-gray-600"
              >
                <LogOut className="w-4 h-4 mr-1" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">전체 사원</p>
                <p className="text-3xl font-bold text-gray-900">{totalEmployees}명</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">총 참여자</p>
                <p className="text-3xl font-bold text-gray-900">{totalSubscribers}명</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">평균 참여자</p>
                <p className="text-3xl font-bold text-gray-900">{avgSubscribers}명</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <Tabs defaultValue="employees" className="w-full">
            <div className="border-b border-gray-200 px-6 pt-6">
              <TabsList className="bg-gray-100">
                <TabsTrigger value="employees" className="data-[state=active]:bg-white">
                  <Users className="w-4 h-4 mr-2" />
                  사원 관리
                </TabsTrigger>
                <TabsTrigger value="statistics" className="data-[state=active]:bg-white">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  부서별 통계
                </TabsTrigger>
                <TabsTrigger value="textSettings" className="data-[state=active]:bg-white">
                  <FileText className="w-4 h-4 mr-2" />
                  텍스트 설정
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Employees Tab */}
            <TabsContent value="employees" className="p-6 space-y-4">
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="이름, 이메일, ID로 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={companyFilter} onValueChange={setCompanyFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="회사 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 회사</SelectItem>
                    {companies.map(comp => (
                      <SelectItem key={comp} value={comp}>{comp}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="부서 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 부서</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button onClick={handleExportData} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  내보내기
                </Button>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  {filteredEmployees.length}명의 사원 
                  {departmentFilter !== "all" && ` (${departmentFilter})`}
                </span>
                {searchQuery && (
                  <span className="text-blue-600">
                    "{searchQuery}" 검색 결과
                  </span>
                )}
              </div>

              {/* Employee Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-20">순위</TableHead>
                        <TableHead>이름</TableHead>
                        <TableHead>이메일</TableHead>
                        <TableHead>회사</TableHead>
                        <TableHead>부서</TableHead>
                        <TableHead className="text-right">참여자 수</TableHead>
                        <TableHead className="text-right">개인링크</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            검색 결과가 없습니다
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredEmployees
                          .sort((a, b) => b.subscriberCount - a.subscriberCount)
                          .map((employee, index) => {
                            const globalRank = employees
                              .sort((a, b) => b.subscriberCount - a.subscriberCount)
                              .findIndex(emp => emp.id === employee.id) + 1;

                            return (
                              <TableRow key={employee.id} className="hover:bg-gray-50">
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    {globalRank <= 3 ? (
                                      <span className="text-lg">
                                        {globalRank === 1 ? "🥇" : globalRank === 2 ? "🥈" : "🥉"}
                                      </span>
                                    ) : (
                                      <span className="text-gray-600">{globalRank}</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">{employee.name}</TableCell>
                                <TableCell className="text-gray-600 text-sm">{employee.email}</TableCell>
                                <TableCell>
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                    {employee.company}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                    {employee.department}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right font-semibold text-blue-600">
                                  {employee.subscriberCount}명
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-xs"
                                    onClick={() => {
                                      const url = `${window.location.origin}/subscribe/${employee.id}`;
                                      navigator.clipboard.writeText(url);
                                      toast.success("링크가 복사되었습니다");
                                    }}
                                  >
                                    복사
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="statistics" className="p-6 space-y-6">
              {/* Department Statistics Cards */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">부서별 현황</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {departmentStats.map((stat, index) => (
                    <motion.div
                      key={`${stat.company}-${stat.department}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-xs text-purple-600 font-medium">{stat.company}</div>
                          <h4 className="font-semibold text-gray-900">{stat.department}</h4>
                        </div>
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        >
                          {stat.employeeCount}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">총 참여자</span>
                          <span className="font-semibold text-blue-600">{stat.totalSubscribers}명</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">평균</span>
                          <span className="font-medium text-gray-900">{stat.avgSubscribers}명</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Bar Chart - Total Subscribers by Department */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">부서별 총 참여자 수</h3>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={departmentStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="department" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="totalSubscribers" 
                        fill="#3b82f6" 
                        name="총 참여자"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart - Employee Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">부서별 인원 분포</h3>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={departmentStats}
                          dataKey="employeeCount"
                          nameKey="department"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={(entry) => `${entry.department} (${entry.employeeCount})`}
                          labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                        >
                          {departmentStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Performers by Department */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">부서별 1위</h3>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="space-y-3">
                      {topPerformersByDept
                        .sort((a, b) => b.count - a.count)
                        .map((item, index) => (
                          <div 
                            key={item.department}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              >
                                {index + 1}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {item.topEmployee}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {item.department}
                                </div>
                              </div>
                            </div>
                            <div className="text-lg font-bold text-blue-600">
                              {item.count}명
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Average Subscribers by Department */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">부서별 평균 참여자 수</h3>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={departmentStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="department" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="avgSubscribers" 
                        fill="#10b981" 
                        name="평균 참여자"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            {/* Text Settings Tab */}
            <TabsContent value="textSettings" className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  사이트 텍스트 설정
                </h3>
                <p className="text-sm text-gray-500">
                  이벤트 페이��에 표시되는 모든 텍스트를 관리할 수 있습니다.
                </p>
              </div>

              {/* Event Section */}
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-200 p-6">
                <h4 className="text-md font-semibold text-blue-900 mb-4">🎉 이벤트 정보</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      이벤트 제목
                    </label>
                    <Input
                      placeholder="예: 2025 구독 확장 이벤트"
                      value={textSettings.eventTitle}
                      onChange={(e) => setTextSettings({ ...textSettings, eventTitle: e.target.value })}
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      이벤트 설명
                    </label>
                    <Input
                      placeholder="예: 한경비즈니스 그룹 구독 확장 이벤트에 참여해주세요!"
                      value={textSettings.eventDescription}
                      onChange={(e) => setTextSettings({ ...textSettings, eventDescription: e.target.value })}
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Dashboard Section */}
              <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg border border-purple-200 p-6">
                <h4 className="text-md font-semibold text-purple-900 mb-4">📊 대시보드</h4>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    환영 메시지
                  </label>
                  <Input
                    placeholder="예: 님의 참여 현황"
                    value={textSettings.dashboardWelcome}
                    onChange={(e) => setTextSettings({ ...textSettings, dashboardWelcome: e.target.value })}
                    className="bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    직원 이름 뒤에 표시됩니다 (예: "홍길동님의 참여 현황")
                  </p>
                </div>
              </div>

              {/* Login Page Section */}
              <div className="bg-gradient-to-br from-green-50 to-white rounded-lg border border-green-200 p-6">
                <h4 className="text-md font-semibold text-green-900 mb-4">🔐 로그인 페이지</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      페이지 제목
                    </label>
                    <Input
                      placeholder="예: 한경비즈니스 구독 경쟁"
                      value={textSettings.loginPageTitle}
                      onChange={(e) => setTextSettings({ ...textSettings, loginPageTitle: e.target.value })}
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      페이지 부제목
                    </label>
                    <Input
                      placeholder="예: 직원 로그인"
                      value={textSettings.loginPageSubtitle}
                      onChange={(e) => setTextSettings({ ...textSettings, loginPageSubtitle: e.target.value })}
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Subscribe Page Section */}
              <div className="bg-gradient-to-br from-yellow-50 to-white rounded-lg border border-yellow-200 p-6">
                <h4 className="text-md font-semibold text-yellow-900 mb-4">✨ 구독 페이지</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      페이지 제목
                    </label>
                    <Input
                      placeholder="예: 구독 이벤트 참여하기"
                      value={textSettings.subscribePageTitle}
                      onChange={(e) => setTextSettings({ ...textSettings, subscribePageTitle: e.target.value })}
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      페이지 설명
                    </label>
                    <Input
                      placeholder="예: 네이버 로그인으로 간편하게 참여하세요"
                      value={textSettings.subscribePageDescription}
                      onChange={(e) => setTextSettings({ ...textSettings, subscribePageDescription: e.target.value })}
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Ranking Page Section */}
              <div className="bg-gradient-to-br from-orange-50 to-white rounded-lg border border-orange-200 p-6">
                <h4 className="text-md font-semibold text-orange-900 mb-4">🏆 랭킹 페이지</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      페이지 제목
                    </label>
                    <Input
                      placeholder="예: 실시간 순위"
                      value={textSettings.rankingPageTitle}
                      onChange={(e) => setTextSettings({ ...textSettings, rankingPageTitle: e.target.value })}
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      페이지 부제목
                    </label>
                    <Input
                      placeholder="예: TOP 20 리더보드"
                      value={textSettings.rankingPageSubtitle}
                      onChange={(e) => setTextSettings({ ...textSettings, rankingPageSubtitle: e.target.value })}
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Messages Section */}
              <div className="bg-gradient-to-br from-pink-50 to-white rounded-lg border border-pink-200 p-6">
                <h4 className="text-md font-semibold text-pink-900 mb-4">💬 알림 메시지</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      참여 성공 메시지
                    </label>
                    <Input
                      placeholder="예: 참여해주셔서 감사합니다!"
                      value={textSettings.successMessage}
                      onChange={(e) => setTextSettings({ ...textSettings, successMessage: e.target.value })}
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      중복 참여 메시지
                    </label>
                    <Input
                      placeholder="예: 이미 참여하셨습니다"
                      value={textSettings.alreadySubscribedMessage}
                      onChange={(e) => setTextSettings({ ...textSettings, alreadySubscribedMessage: e.target.value })}
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={async () => {
                    setIsSavingText(true);
                    try {
                      await updateTextSettings(textSettings);
                      toast.success("텍스트 설정이 저장되었습니다");
                    } catch (error: any) {
                      console.error("Failed to save text settings:", error);
                      toast.error("텍스트 설정 저장에 실패했습니다");
                    } finally {
                      setIsSavingText(false);
                    }
                  }}
                  disabled={isSavingText}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {isSavingText ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      저장 중...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      변경사항 저장
                    </>
                  )}
                </Button>
                <p className="text-sm text-gray-500">
                  * 변경사항은 즉시 사이트에 반영됩니다
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}