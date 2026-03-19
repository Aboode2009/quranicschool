import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const MaintenanceScreen = () => (
  <div className="flex items-center justify-center h-screen bg-background" dir="rtl">
    <div className="text-center p-8 max-w-md">
      <img
        src="/logo-bg.png"
        alt="Logo"
        className="w-24 h-24 mx-auto mb-6 rounded-2xl opacity-80"
      />
      <div className="mb-4">
        <svg className="w-16 h-16 mx-auto text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-3">
        تم إيقاف التطبيق مؤقتاً
      </h1>
      <p className="text-muted-foreground text-lg">
        من قبل عبد الرحمن
      </p>
      <p className="text-muted-foreground/60 text-sm mt-4">
        سيتم إعادة تشغيل التطبيق قريباً إن شاء الله
      </p>
    </div>
  </div>
);

const App = () => {
  const [maintenanceMode, setMaintenanceMode] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMaintenance = async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("maintenance_mode")
        .limit(1)
        .single();

      if (error) {
        setMaintenanceMode(false);
        return;
      }
      setMaintenanceMode(data?.maintenance_mode ?? false);
    };

    checkMaintenance();
  }, []);

  if (maintenanceMode === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <img src="/logo-bg.png" alt="Logo" className="w-16 h-16 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (maintenanceMode) {
    return <MaintenanceScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
