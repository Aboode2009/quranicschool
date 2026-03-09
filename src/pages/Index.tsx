import { useState } from "react";
import MuhaderaPage from "./MuhaderaPage";
import WarashaPage from "./WarashaPage";
import SettingsPage from "./SettingsPage";
import AttendancePage from "./AttendancePage";
import DashboardPage from "./DashboardPage";
import TabBar from "@/components/TabBar";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "muhadera" | "warasha" | "settings" | "attendance">("dashboard");

  return (
    <div className="flex flex-col h-screen bg-background font-body overflow-hidden">
      <main className="flex-1 overflow-hidden">
        {activeTab === "dashboard" && <DashboardPage onNavigate={setActiveTab} />}
        {activeTab === "muhadera" && <MuhaderaPage />}
        {activeTab === "attendance" && <AttendancePage />}
        {activeTab === "warasha" && <WarashaPage />}
        {activeTab === "settings" && <SettingsPage />}
      </main>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
