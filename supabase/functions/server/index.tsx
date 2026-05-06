import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-a834ef89/health", (c) => {
  return c.json({ status: "ok" });
});

// Initialize employee data (admin only - for initial setup)
app.post("/make-server-a834ef89/init-employees", async (c) => {
  try {
    const employees = await c.req.json();
    
    // Store each employee
    for (const emp of employees) {
      const employeeId = `emp_${emp.email.split('@')[0]}`;
      
      // Store employee data
      await kv.set(`employee:${emp.email.toLowerCase()}`, {
        id: employeeId,
        name: emp.name,
        email: emp.email.toLowerCase(),
        company: emp.company || "",
        department: emp.department || "",
        employeeNumber: emp.employeeNumber || "",
        createdAt: new Date().toISOString(),
      });
      
      // Initialize subscriber count to 0
      await kv.set(`employee_count:${employeeId}`, 0);
    }
    
    return c.json({ 
      success: true, 
      message: `${employees.length}명의 직원 데이터가 등록되었습니다.`,
      count: employees.length 
    });
  } catch (error) {
    console.error("Error initializing employees:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Employee login (email check)
app.post("/make-server-a834ef89/login", async (c) => {
  try {
    const { email } = await c.req.json();
    
    if (!email) {
      return c.json({ success: false, error: "이메일을 입력해주세요." }, 400);
    }
    
    // Check if email ends with @hankyung.com
    if (!email.toLowerCase().endsWith("@hankyung.com")) {
      return c.json({ 
        success: false, 
        error: "한국경제신문 직원 이메일(@hankyung.com)만 로그인 가능합니다." 
      }, 403);
    }
    
    // Get employee data
    const employee = await kv.get(`employee:${email.toLowerCase()}`);
    
    if (!employee) {
      return c.json({ 
        success: false, 
        error: "등록되지 않은 직원입니다. IT팀에 문의해주세요." 
      }, 404);
    }
    
    // Get subscriber count
    const count = await kv.get(`employee_count:${employee.id}`) || 0;
    
    return c.json({
      success: true,
      employee: {
        ...employee,
        subscriberCount: count,
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get employee by ID
app.get("/make-server-a834ef89/employee/:id", async (c) => {
  try {
    const employeeId = c.req.param("id");
    
    // Find employee by searching all employee keys
    const allEmployees = await kv.getByPrefix("employee:");
    const employee = allEmployees.find((emp: any) => emp.id === employeeId);
    
    if (!employee) {
      return c.json({ success: false, error: "직원을 찾을 수 없습니다." }, 404);
    }
    
    // Get subscriber count
    const count = await kv.get(`employee_count:${employeeId}`) || 0;
    
    return c.json({
      success: true,
      employee: {
        ...employee,
        subscriberCount: count,
      }
    });
  } catch (error) {
    console.error("Get employee error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Subscribe (external user via Naver login)
app.post("/make-server-a834ef89/subscribe", async (c) => {
  try {
    const { employeeId, naverId } = await c.req.json();
    
    if (!employeeId || !naverId) {
      return c.json({ 
        success: false, 
        error: "직원 ID와 네이버 ID가 요합니다." 
      }, 400);
    }
    
    // Check if this Naver ID already subscribed for this employee
    const subscriptionKey = `subscription:${employeeId}:${naverId}`;
    const alreadySubscribed = await kv.get(subscriptionKey);
    
    if (alreadySubscribed) {
      return c.json({ 
        success: false, 
        error: "이미 참여하셨습니다.",
        alreadySubscribed: true
      }, 400);
    }
    
    // Increment subscriber count
    const currentCount = await kv.get(`employee_count:${employeeId}`) || 0;
    const newCount = currentCount + 1;
    await kv.set(`employee_count:${employeeId}`, newCount);
    
    // Record subscription
    await kv.set(subscriptionKey, {
      naverId,
      employeeId,
      timestamp: new Date().toISOString(),
    });
    
    return c.json({
      success: true,
      newCount,
      message: "참여가 완료되었습니다!"
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get rankings (top 20)
app.get("/make-server-a834ef89/rankings", async (c) => {
  try {
    // Get all employees
    const allEmployees = await kv.getByPrefix("employee:");
    
    // Get counts for each employee
    const employeesWithCounts = await Promise.all(
      allEmployees.map(async (emp: any) => {
        const count = await kv.get(`employee_count:${emp.id}`) || 0;
        return {
          ...emp,
          subscriberCount: count,
        };
      })
    );
    
    // Sort by subscriber count (descending) and take top 20
    const rankings = employeesWithCounts
      .sort((a, b) => b.subscriberCount - a.subscriberCount)
      .slice(0, 20);
    
    return c.json({
      success: true,
      rankings,
      total: allEmployees.length,
    });
  } catch (error) {
    console.error("Rankings error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get employee rank
app.get("/make-server-a834ef89/employee/:id/rank", async (c) => {
  try {
    const employeeId = c.req.param("id");
    
    // Get all employees with counts
    const allEmployees = await kv.getByPrefix("employee:");
    const employeesWithCounts = await Promise.all(
      allEmployees.map(async (emp: any) => {
        const count = await kv.get(`employee_count:${emp.id}`) || 0;
        return {
          id: emp.id,
          subscriberCount: count,
        };
      })
    );
    
    // Sort and find rank
    const sorted = employeesWithCounts
      .sort((a, b) => b.subscriberCount - a.subscriberCount);
    
    const rank = sorted.findIndex(emp => emp.id === employeeId) + 1;
    
    if (rank === 0) {
      return c.json({ success: false, error: "직원을 찾을 수 없습니다." }, 404);
    }
    
    return c.json({
      success: true,
      rank,
      total: allEmployees.length,
    });
  } catch (error) {
    console.error("Rank error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Admin: Get all employees with full details
app.get("/make-server-a834ef89/admin/employees", async (c) => {
  try {
    // Get all employees
    const allEmployees = await kv.getByPrefix("employee:");
    
    // Get counts for each employee
    const employeesWithCounts = await Promise.all(
      allEmployees.map(async (emp: any) => {
        const count = await kv.get(`employee_count:${emp.id}`) || 0;
        return {
          ...emp,
          subscriberCount: count,
        };
      })
    );
    
    return c.json({
      success: true,
      employees: employeesWithCounts,
      total: employeesWithCounts.length,
    });
  } catch (error) {
    console.error("Admin get employees error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Admin: Get department statistics
app.get("/make-server-a834ef89/admin/statistics", async (c) => {
  try {
    // Get all employees with counts
    const allEmployees = await kv.getByPrefix("employee:");
    const employeesWithCounts = await Promise.all(
      allEmployees.map(async (emp: any) => {
        const count = await kv.get(`employee_count:${emp.id}`) || 0;
        return {
          ...emp,
          subscriberCount: count,
        };
      })
    );
    
    // Group by company and department
    const companyDeptMap = new Map();
    
    employeesWithCounts.forEach((emp: any) => {
      const key = `${emp.company}||${emp.department}`;
      if (!companyDeptMap.has(key)) {
        companyDeptMap.set(key, []);
      }
      companyDeptMap.get(key).push(emp);
    });
    
    // Calculate statistics for each company-department combination
    const departmentStats = Array.from(companyDeptMap.entries()).map(([key, deptEmployees]: [string, any]) => {
      const [company, department] = key.split("||");
      const totalSubscribers = deptEmployees.reduce((sum: number, emp: any) => sum + emp.subscriberCount, 0);
      const avgSubscribers = Math.round(totalSubscribers / deptEmployees.length);
      
      // Find top performer
      const topEmployee = deptEmployees.sort((a: any, b: any) => b.subscriberCount - a.subscriberCount)[0];
      
      return {
        company: company || "",
        department: department || "",
        employeeCount: deptEmployees.length,
        totalSubscribers,
        avgSubscribers,
        topEmployee: topEmployee ? {
          name: topEmployee.name,
          subscriberCount: topEmployee.subscriberCount,
        } : null,
      };
    });
    
    return c.json({
      success: true,
      statistics: departmentStats.filter(stat => stat.department), // Filter out empty departments
    });
  } catch (error) {
    console.error("Admin statistics error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Admin: Get company statistics
app.get("/make-server-a834ef89/admin/company-statistics", async (c) => {
  try {
    // Get all employees with counts
    const allEmployees = await kv.getByPrefix("employee:");
    const employeesWithCounts = await Promise.all(
      allEmployees.map(async (emp: any) => {
        const count = await kv.get(`employee_count:${emp.id}`) || 0;
        return {
          ...emp,
          subscriberCount: count,
        };
      })
    );
    
    // Group by company
    const companies = [...new Set(employeesWithCounts.map((emp: any) => emp.company))].filter(Boolean);
    
    const companyStats = companies.map(company => {
      const companyEmployees = employeesWithCounts.filter((emp: any) => emp.company === company);
      const totalSubscribers = companyEmployees.reduce((sum: number, emp: any) => sum + emp.subscriberCount, 0);
      const avgSubscribers = Math.round(totalSubscribers / companyEmployees.length);
      
      // Get departments within this company
      const departments = [...new Set(companyEmployees.map((emp: any) => emp.department))].filter(Boolean);
      
      const departmentStats = departments.map(dept => {
        const deptEmployees = companyEmployees.filter((emp: any) => emp.department === dept);
        const deptTotalSubscribers = deptEmployees.reduce((sum: number, emp: any) => sum + emp.subscriberCount, 0);
        const deptAvgSubscribers = Math.round(deptTotalSubscribers / deptEmployees.length);
        
        const topEmployee = deptEmployees.sort((a: any, b: any) => b.subscriberCount - a.subscriberCount)[0];
        
        return {
          company,
          department: dept,
          employeeCount: deptEmployees.length,
          totalSubscribers: deptTotalSubscribers,
          avgSubscribers: deptAvgSubscribers,
          topEmployee: topEmployee ? {
            name: topEmployee.name,
            subscriberCount: topEmployee.subscriberCount,
          } : null,
        };
      });
      
      return {
        company,
        employeeCount: companyEmployees.length,
        totalSubscribers,
        avgSubscribers,
        departments: departmentStats,
      };
    });
    
    return c.json({
      success: true,
      statistics: companyStats,
    });
  } catch (error) {
    console.error("Admin company statistics error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Admin: Get site text settings
app.get("/make-server-a834ef89/admin/text-settings", async (c) => {
  try {
    const settings = await kv.get("site:text_settings");
    
    // Default text settings
    const defaultSettings = {
      eventTitle: "2025 구독 확장 이벤트",
      eventDescription: "한국경제신문 그룹 구독 확장 이벤트에 참여해주세요!",
      dashboardWelcome: "님의 참여 현황",
      loginPageTitle: "한국경제신문 구독 경쟁",
      loginPageSubtitle: "직원 로그인",
      subscribePageTitle: "구독 이벤트 참여하기",
      subscribePageDescription: "네이버 로그인으로 간편하게 참여하세요",
      rankingPageTitle: "실시간 순위",
      rankingPageSubtitle: "TOP 20 리더보드",
      successMessage: "참여해주셔서 감사합니다!",
      alreadySubscribedMessage: "이미 참여하셨습니다",
    };
    
    return c.json({
      success: true,
      settings: settings || defaultSettings,
    });
  } catch (error) {
    console.error("Get text settings error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Admin: Update site text settings
app.post("/make-server-a834ef89/admin/text-settings", async (c) => {
  try {
    const settings = await c.req.json();
    
    await kv.set("site:text_settings", {
      ...settings,
      updatedAt: new Date().toISOString(),
    });
    
    return c.json({
      success: true,
      message: "텍스트 설정이 업데이트되었습니다.",
      settings,
    });
  } catch (error) {
    console.error("Update text settings error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);