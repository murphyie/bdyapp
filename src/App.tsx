import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import React, { Suspense, lazy } from "react";

// Auth Provider
import { AuthProvider } from "@/hooks/useAuth";
import { useCelebrationAccess } from "@/hooks/useCelebrationAccess";
import { useSettings } from "@/hooks/useBirthdayData";

// Components
import Navigation from "@/components/layout/Navigation";
import BirthdayScene from "@/components/three/BirthdayScene";
import ProtectedRoute from "@/components/admin/ProtectedRoute";

// Pages (lazy loaded for better performance)
const Index = lazy(() => import("./pages/Index"));
const Celebration = lazy(() => import("./pages/Celebration"));
const Fireworks = lazy(() => import("./pages/Fireworks"));
const Early = lazy(() => import("./pages/Early"));
const MemoryGame = lazy(() => import("./pages/MemoryGame"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Protected celebration route wrapper - redirects to /early if no access
function CelebrationRoute({ children }: { children: React.ReactNode }) {
  const { hasAccess, isLoading } = useCelebrationAccess();
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  if (!hasAccess) {
    return <Navigate to="/early" replace />;
  }
  
  return <>{children}</>;
}

// Route that only shows when access is NOT granted (for /early page)
function EarlyOnlyRoute({ children }: { children: React.ReactNode }) {
  const { hasAccess, isLoading } = useCelebrationAccess();
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  // If they have access, redirect to home
  if (hasAccess) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

const queryClient = new QueryClient();

// Loading fallback
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading magic...</p>
      </div>
    </div>
  );
}

// Check if route is admin route
function useIsAdminRoute() {
  const location = useLocation();
  return location.pathname.startsWith('/admin');
}

// Animated routes wrapper
function AnimatedRoutes() {
  const location = useLocation();
  const isAdminRoute = useIsAdminRoute();
  const { data: settings } = useSettings();
  
  // Apply theme class to document
  const themeType = settings?.theme_type || 'brotherly';
  const birthdayName = settings?.birthday_name || 'Someone Special';
  const faviconUrl = settings?.favicon_url;
  
  // Update page title and favicon dynamically
  React.useEffect(() => {
    document.title = `Happy Birthday ${birthdayName}! 🎂`;
    
    // Update meta tags
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', `A special birthday celebration for ${birthdayName} - filled with memories, music, and love`);
    }
    
    // Update Open Graph title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', `Happy Birthday ${birthdayName}! 🎂`);
    }
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', `A special birthday celebration for ${birthdayName}`);
    }
  }, [birthdayName]);
  
  // Update favicon dynamically
  React.useEffect(() => {
    if (faviconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = faviconUrl;
    }
  }, [faviconUrl]);
  
  // Apply theme class to html element
  React.useEffect(() => {
    const html = document.documentElement;
    // Remove all theme classes first
    html.classList.remove('theme-brotherly', 'theme-brotherly-simple');
    // Add appropriate theme class
    if (themeType === 'brotherly') {
      html.classList.add('theme-brotherly');
    } else if (themeType === 'brotherly-simple') {
      html.classList.add('theme-brotherly-simple');
    }
  }, [themeType]);

  return (
    <>
      {/* Only show 3D background on public pages */}
      {!isAdminRoute && <BirthdayScene />}
      
      {/* Only show navigation on public pages */}
      {!isAdminRoute && <Navigation />}
      
      <AnimatePresence mode="wait">
        <Suspense fallback={<PageLoader />}>
          <Routes location={location} key={location.pathname}>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/early" element={
              <EarlyOnlyRoute>
                <Early />
              </EarlyOnlyRoute>
            } />
            <Route path="/celebration" element={
              <CelebrationRoute>
                <Celebration />
              </CelebrationRoute>
            } />
            <Route path="/fireworks" element={
              <CelebrationRoute>
                <Fireworks />
              </CelebrationRoute>
            } />
            <Route path="/memory-game" element={
              <CelebrationRoute>
                <MemoryGame />
              </CelebrationRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/admin" element={<AdminLogin />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
