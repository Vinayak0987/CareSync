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
import AdminIndex from "./pages/AdminIndex";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

type UserRole = 'patient' | 'doctor' | 'admin' | null;

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);

  const handleLogin = (role: 'patient' | 'doctor' | 'admin') => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
  };

  const getDashboardRoute = () => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    if (userRole === 'doctor') {
      return <DoctorIndex onLogout={handleLogout} />;
    }
    if (userRole === 'admin') {
      return <AdminIndex onLogout={handleLogout} />;
    }
    return <Index onLogout={handleLogout} />;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Landing Page */}
              <Route path="/" element={<Landing />} />
              
              {/* Authentication */}
              <Route 
                path="/login" 
                element={
                  isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
                } 
              />
              
              {/* Protected Dashboard - Routes based on role */}
              <Route 
                path="/dashboard" 
                element={getDashboardRoute()} 
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

