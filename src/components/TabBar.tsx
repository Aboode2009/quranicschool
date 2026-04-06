import { BookOpen, Users, Settings, UserCheck, LayoutDashboard } from "lucide-react";

type TabId = "dashboard" | "muhadera" | "warasha" | "settings" | "attendance" | "admin" | "supervisor_attendance" | "supervisors_list" | "electronic_interaction";

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs = [
  { id: "dashboard" as const, label: "الرئيسية", icon: LayoutDashboard },
  { id: "muhadera" as const, label: "محاضرة", icon: BookOpen },
  { id: "attendance" as const, label: "الأسماء", icon: UserCheck },
  { id: "warasha" as const, label: "ورشة", icon: Users },
  { id: "settings" as const, label: "إعدادات", icon: Settings },
];

const TabBar = ({ activeTab, onTabChange }: TabBarProps) => {
  return (
    <div className="ios-nav border-t border-ios-separator bg-card/95 backdrop-blur-xl">
      <div className="flex items-center justify-around px-1 pb-safe">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center gap-1 py-2 px-3 transition-colors"
            >
              <Icon
                className={`w-6 h-6 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabBar;
