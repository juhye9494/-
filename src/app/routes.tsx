import { createBrowserRouter } from "react-router";
import { RankingPage } from "./pages/RankingPage";
import { SubscribePage } from "./pages/SubscribePage";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { InitDataPage } from "./pages/InitDataPage";
import { AdminPage } from "./pages/AdminPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RankingPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/dashboard",
    Component: DashboardPage,
  },
  {
    path: "/subscribe/:employeeId",
    Component: SubscribePage,
  },
  {
    path: "/init-data",
    Component: InitDataPage,
  },
  {
    path: "/admin",
    Component: AdminPage,
  },
  {
    path: "/admin/login",
    Component: AdminLoginPage,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);