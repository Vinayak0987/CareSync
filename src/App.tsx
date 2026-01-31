import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import DoctorIndex from "./pages/DoctorIndex";
import PharmacyIndex from "./pages/PharmacyIndex";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

type UserRole = 'patient' | 'doctor' | 'pharmacy' | null;

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);

  useState(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.token && user.role) {
          setIsAuthenticated(true);
          setUserRole(user.role as UserRole);
        }
      } catch (error) {
        console.error("Failed to parse user data", error);
        localStorage.removeItem('user');
      }
    }
  });

  const handleLogin = (role: 'patient' | 'doctor' | 'pharmacy') => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              {/* Public Landing Page */}
              <Route path="/" element={<Landing />} />

              {/* Authentication - Role-specific routes */}
              <Route
                path="/login"
                element={
                  isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
                }
              />
              <Route
                path="/login/patient"
                element={
                  isAuthenticated ? <Navigate to="/patient" replace /> : <Login onLogin={handleLogin} defaultRole="patient" />
                }
              />
              <Route
                path="/login/doctor"
                element={
                  isAuthenticated ? <Navigate to="/doctor" replace /> : <Login onLogin={handleLogin} defaultRole="doctor" />
                }
              />
              <Route
                path="/login/pharmacy"
                element={
                  isAuthenticated ? <Navigate to="/pharmacy" replace /> : <Login onLogin={handleLogin} defaultRole="pharmacy" />
                }
              />

              {/* Protected Routes */}
              <Route
                path="/patient/*"
                element={
                  isAuthenticated && userRole === 'patient'
                    ? <Index onLogout={handleLogout} />
                    : <Navigate to="/login" replace />
                }
              />

              <Route
                path="/doctor/*"
                element={
                  isAuthenticated && userRole === 'doctor'
                    ? <DoctorIndex onLogout={handleLogout} />
                    : <Navigate to="/login" replace />
                }
              />

              <Route
                path="/pharmacy/*"
                element={
                  isAuthenticated && userRole === 'pharmacy'
                    ? <PharmacyIndex onLogout={handleLogout} />
                    : <Navigate to="/login" replace />
                }
              />

              {/* Legacy/Convenience Redirection */}
              <Route
                path="/dashboard"
                element={
                  isAuthenticated
                    ? <Navigate to={`/${userRole}`} replace />
                    : <Navigate to="/login" replace />
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
