import { useState } from "react";
import MuhaderaPage from "./MuhaderaPage";
import WarashaPage from "./WarashaPage";
import TaqyeemPage from "./TaqyeemPage";
import AttendancePage from "./AttendancePage";
import TabBar from "@/components/TabBar";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"muhadera" | "warasha" | "taqyeem" | "attendance">("muhadera");

  return (
    <div className="flex flex-col h-screen bg-background font-body overflow-hidden">
      <main className="flex-1 overflow-hidden">
        {activeTab === "muhadera" && <MuhaderaPage />}
        {activeTab === "attendance" && <AttendancePage />}
        {activeTab === "warasha" && <WarashaPage />}
        {activeTab === "taqyeem" && <TaqyeemPage />}
      </main>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
