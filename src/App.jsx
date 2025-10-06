import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import AuthDebug from "./components/debug/AuthDebug.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Academics from "./pages/Academics.jsx";
import Teachers from "./pages/Teachers.jsx";
import Events from "./pages/Events.jsx";
import Contact from "./pages/Contact.jsx";
import Auth from "./pages/Auth.jsx";
import Login from "./pages/Login.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DashboardRouter from "./pages/dashboards/DashboardRouter.jsx";
import StudentDashboard from "./pages/dashboards/StudentDashboard.jsx";
import TeacherDashboard from "./pages/dashboards/TeacherDashboard.jsx";
import AdminDashboard from "./pages/dashboards/AdminDashboard.jsx";
import ParentDashboard from "./pages/dashboards/ParentDashboard.jsx";
import StaffDashboard from "./pages/dashboards/StaffDashboard.jsx";
import AccountantDashboard from "./pages/dashboards/AccountantDashboard.jsx";
import RegistrarDashboard from "./pages/dashboards/RegistrarDashboard.jsx";
import DashboardSection from "./pages/dashboards/DashboardSection.jsx";

export default function App() {
  const location = useLocation();

  // Check if current route is a dashboard route
  const isDashboardRoute = location.pathname.startsWith("/dashboard");

  return (
    <div className="min-h-screen flex flex-col">
      {/* <AuthDebug /> */}
      {!isDashboardRoute && <Navbar />}
      <main className={isDashboardRoute ? "flex-1" : "flex-1"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/academics" element={<Academics />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/events" element={<Events />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth" element={<Auth />}>
            <Route index element={<Navigate to="login" replace />} />
            <Route path="login" element={<Login />} />
          </Route>
          {/* Protected dashboard routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardRouter />} />
          </Route>
          <Route element={<ProtectedRoute roles={["student"]} />}>
            <Route path="/dashboard/student" element={<StudentDashboard />} />
            <Route
              path="/dashboard/student/:section"
              element={<StudentDashboard />}
            />
          </Route>
          <Route element={<ProtectedRoute roles={["teacher"]} />}>
            <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
            <Route
              path="/dashboard/teacher/:section"
              element={<TeacherDashboard />}
            />
          </Route>
          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route
              path="/dashboard/admin/:section"
              element={<AdminDashboard />}
            />
          </Route>
          <Route element={<ProtectedRoute roles={["parent"]} />}>
            <Route path="/dashboard/parent" element={<ParentDashboard />} />
            <Route
              path="/dashboard/parent/:section"
              element={<ParentDashboard />}
            />
          </Route>
          <Route element={<ProtectedRoute roles={["staff"]} />}>
            <Route path="/dashboard/staff" element={<StaffDashboard />} />
            <Route
              path="/dashboard/staff/:section"
              element={<StaffDashboard />}
            />
          </Route>
          <Route element={<ProtectedRoute roles={["accountant"]} />}>
            <Route
              path="/dashboard/accountant"
              element={<AccountantDashboard />}
            />
            <Route
              path="/dashboard/accountant/:section"
              element={<AccountantDashboard />}
            />
          </Route>
          <Route element={<ProtectedRoute roles={["registrar"]} />}>
            <Route
              path="/dashboard/registrar"
              element={<RegistrarDashboard />}
            />
            <Route
              path="/dashboard/registrar/:section"
              element={<RegistrarDashboard />}
            />
          </Route>
        </Routes>
      </main>
      {!isDashboardRoute && <Footer />}
    </div>
  );
}
