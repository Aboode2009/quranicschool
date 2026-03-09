import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import LoginPage from "./LoginPage";
import MuhaderaPage from "./MuhaderaPage";
import WarashaPage from "./WarashaPage";
import SettingsPage from "./SettingsPage";
import AttendancePage from "./AttendancePage";
import DashboardPage from "./DashboardPage";
import AdminPage from "./AdminPage";
import TabBar from "@/components/TabBar";

const Index = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<"dashboard" | "muhadera" | "warasha" | "settings" | "attendance" | "admin">("dashboard");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <img src="/logo-bg.png" alt="Logo" className="w-16 h-16 mx-auto mb-4 rounded-2xl animate-pulse" />
          <p className="text-sm text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="flex flex-col h-screen bg-background font-body overflow-hidden">
      <main className="flex-1 overflow-hidden">
        {activeTab === "dashboard" && <DashboardPage onNavigate={setActiveTab} />}
        {activeTab === "muhadera" && <MuhaderaPage />}
        {activeTab === "attendance" && <AttendancePage />}
        {activeTab === "warasha" && <WarashaPage />}
        {activeTab === "settings" && <SettingsPage />}
        {activeTab === "admin" && <AdminPage onBack={() => setActiveTab("settings")} />}
      </main>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
