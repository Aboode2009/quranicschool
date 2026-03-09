import { BookOpen, Users, ClipboardCheck } from "lucide-react";

interface TabBarProps {
  activeTab: "muhadera" | "warasha" | "taqyeem";
  onTabChange: (tab: "muhadera" | "warasha" | "taqyeem") => void;
}

const tabs = [
  { id: "muhadera" as const, label: "محاضرة", icon: BookOpen },
  { id: "warasha" as const, label: "ورشة", icon: Users },
  { id: "taqyeem" as const, label: "التقييم", icon: ClipboardCheck },
];

const TabBar = ({ activeTab, onTabChange }: TabBarProps) => {
  return (
    <div className="ios-nav border-t border-ios-separator bg-card/95 backdrop-blur-xl">
      <div className="flex items-center justify-around px-2 pb-safe">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center gap-1 py-2 px-6 transition-colors"
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
