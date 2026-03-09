import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, Info, DollarSign, ChevronLeft } from "lucide-react";

const FinancePage = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="flex flex-col h-full" dir="rtl">
      <div className="px-4 pt-3 pb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-primary text-sm font-medium mb-3"
        >
          <ChevronLeft className="w-4 h-4 rotate-180" />
          <span>رجوع</span>
        </button>
        <h1 className="text-2xl font-bold text-foreground mb-1">الأمور المالية</h1>
        <p className="text-sm text-muted-foreground">إدارة الأمور المالية</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <DollarSign className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-base font-medium">لا توجد سجلات مالية بعد</p>
          <p className="text-sm mt-1">قريباً...</p>
        </div>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });
  const [showFinance, setShowFinance] = useState(false);

  const toggleDarkMode = () => {
    const newVal = !isDark;
    setIsDark(newVal);
    if (newVal) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  if (showFinance) {
    return <FinancePage onBack={() => setShowFinance(false)} />;
  }

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <div className="px-4 pt-3 pb-2">
        <h1 className="text-2xl font-bold text-foreground mb-1">الإعدادات</h1>
        <p className="text-sm text-muted-foreground">إعدادات التطبيق</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col gap-3 mt-3">
          {/* Dark Mode Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="ios-card p-4 cursor-pointer active:scale-[0.98] transition-transform"
            onClick={toggleDarkMode}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                {isDark ? (
                  <Moon className="w-5 h-5 text-primary" />
                ) : (
                  <Sun className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-semibold text-foreground">الوضع الليلي</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isDark ? "مفعّل" : "غير مفعّل"}
                </p>
              </div>
              <div className={`w-12 h-7 rounded-full transition-colors flex items-center px-0.5 ${isDark ? "bg-primary" : "bg-muted"}`}>
                <div className={`w-6 h-6 rounded-full bg-card shadow-sm transition-transform ${isDark ? "-translate-x-5" : "translate-x-0"}`} />
              </div>
            </div>
          </motion.div>

          {/* Finance Page */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="ios-card p-4 cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => setShowFinance(true)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-semibold text-foreground">الأمور المالية</p>
                <p className="text-xs text-muted-foreground mt-0.5">إدارة المصاريف والإيرادات</p>
              </div>
              <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180" />
            </div>
          </motion.div>

          {/* About */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="ios-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Info className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-foreground">حول التطبيق</p>
                <p className="text-xs text-muted-foreground mt-0.5">نظام إدارة الحضور - الإصدار 1.0</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
