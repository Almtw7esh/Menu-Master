import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Branches from "./pages/Branches";
import Menu from "./pages/Menu";
import MenuPreview from "./pages/MenuPreview";
import NotFound from "./pages/NotFound";
import { Suspense, lazy } from "react";
const PublicMenu = lazy(() => import("./pages/PublicMenu"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/branches" element={<Branches />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/menu-preview" element={<MenuPreview />} />
            </Route>
            {/* Public menu route (old, keep for backward compatibility) */}
            <Route path=":restaurant/:branch/menu" element={
              <Suspense fallback={<div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
                <PublicMenu />
              </Suspense>
            } />
            {/* New public menu route: /restaurant-slug/branch-slug/template-uuid */}
            <Route path=":restaurantSlug/:branchSlug/:templateUuid" element={
              <Suspense fallback={<div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
                <PublicMenu />
              </Suspense>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;