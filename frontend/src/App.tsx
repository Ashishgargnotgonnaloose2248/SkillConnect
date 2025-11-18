import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Suspense, useEffect, useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import Explorer from "./pages/Explorer";
import Auth from "./pages/Auth";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Sessions from "./pages/Sessions";
import Skills from "./pages/Skills";
import Admin from "./pages/Admin";
import FacultyDashboard from "./pages/FacultyDashboard";
import ConnectFaculty from "./pages/ConnectFaculty";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ 
  children, 
  adminOnly = false 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  const [showInitialLoader, setShowInitialLoader] = useState(true);

  useEffect(() => {
    // Hide loader when the window 'load' event fires (all resources loaded)
    const onLoad = () => setShowInitialLoader(false);
    window.addEventListener("load", onLoad);

    // Safety fallback: hide loader after 4s
    const fallback = setTimeout(() => setShowInitialLoader(false), 4000);

    return () => {
      window.removeEventListener("load", onLoad);
      clearTimeout(fallback);
    };
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {showInitialLoader && <LoadingScreen />}
        <Suspense fallback={<LoadingScreen />}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/explorer" element={<Explorer />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/sessions" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Sessions />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/skills" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Skills />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/faculty-dashboard" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <FacultyDashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/connect-faculty" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <ConnectFaculty />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <Admin />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </Suspense>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

};

export default App;
