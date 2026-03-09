import { motion } from "framer-motion";
import { BookOpen, Users, UserCheck, Settings, DollarSign, TrendingUp, TrendingDown, Wallet, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type TabId = "muhadera" | "warasha" | "settings" | "attendance";

interface DashboardProps {
  onNavigate: (tab: TabId) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
} as const;

const cardItem = {
  hidden: { opacity: 0, y: 30, scale: 0.92 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 260, damping: 22 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const DashboardPage = ({ onNavigate }: DashboardProps) => {
  const [peopleCount, setPeopleCount] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchStats();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchStats = async () => {
    const [{ count }, { data: incomeData }, { data: expenseData }] = await Promise.all([
      supabase.from("people").select("*", { count: "exact", head: true }),
      supabase.from("finances").select("amount").eq("type", "income"),
      supabase.from("finances").select("amount").eq("type", "expense"),
    ]);
    setPeopleCount(count || 0);
    setTotalIncome((incomeData || []).reduce((s, r) => s + Number(r.amount), 0));
    setTotalExpense((expenseData || []).reduce((s, r) => s + Number(r.amount), 0));
  };

  const netBalance = totalIncome - totalExpense;

  const greeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return "صباح الخير ☀️";
    if (h < 17) return "مساء النور 🌤️";
    return "مساء الخير 🌙";
  };

  const navCards = [
    {
      id: "muhadera" as TabId,
      title: "المحاضرة",
      desc: "إدارة الدروس والمحاضرات",
      icon: BookOpen,
      gradient: "from-[hsl(211,100%,50%)] to-[hsl(211,100%,65%)]",
      iconBg: "bg-[hsl(211,100%,50%)]/15",
      iconColor: "text-primary",
    },
    {
      id: "warasha" as TabId,
      title: "الورشة",
      desc: "إدارة ورش العمل",
      icon: Users,
      gradient: "from-[hsl(280,70%,55%)] to-[hsl(280,70%,70%)]",
      iconBg: "bg-[hsl(280,70%,55%)]/15",
      iconColor: "text-[hsl(280,70%,55%)]",
    },
    {
      id: "attendance" as TabId,
      title: "الأسماء",
      desc: "متابعة الحضور والأسماء",
      icon: UserCheck,
      gradient: "from-[hsl(155,55%,30%)] to-[hsl(155,55%,45%)]",
      iconBg: "bg-accent/15",
      iconColor: "text-accent",
    },
    {
      id: "settings" as TabId,
      title: "الإعدادات",
      desc: "إعدادات التطبيق والمالية",
      icon: Settings,
      gradient: "from-[hsl(0,0%,35%)] to-[hsl(0,0%,50%)]",
      iconBg: "bg-muted-foreground/15",
      iconColor: "text-muted-foreground",
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto" dir="rtl">
      {/* Header */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="px-5 pt-6 pb-2"
      >
        <p className="text-sm text-muted-foreground font-medium">{greeting()}</p>
        <h1 className="text-3xl font-extrabold text-foreground mt-1">لوحة التحكم</h1>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="px-5 mt-4"
      >
        <div className="grid grid-cols-2 gap-3">
          {/* Net Balance */}
          <motion.div
            variants={cardItem}
            className="col-span-2 ios-card p-5 relative overflow-hidden"
          >
            <div className="absolute -left-8 -top-8 w-32 h-32 rounded-full bg-primary/5 blur-2xl" />
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-accent/5 blur-2xl" />
            <div className="relative flex items-center gap-4">
              <motion.div
                className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0"
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Wallet className="w-7 h-7 text-primary" />
              </motion.div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">الرصيد الصافي</p>
                <p className={`text-3xl font-extrabold mt-0.5 ${netBalance >= 0 ? "text-accent" : "text-destructive"}`}>
                  {netBalance.toLocaleString()}
                  <span className="text-sm font-semibold mr-1">د.ع</span>
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <div className="flex-1 rounded-xl bg-accent/5 p-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground">إيرادات</p>
                  <p className="text-sm font-bold text-accent">{totalIncome.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex-1 rounded-xl bg-destructive/5 p-3 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-destructive shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground">مصروفات</p>
                  <p className="text-sm font-bold text-destructive">{totalExpense.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* People Count */}
          <motion.div
            variants={cardItem}
            className="ios-card p-4 flex items-center gap-3"
          >
            <motion.div
              className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
              whileHover={{ scale: 1.15 }}
            >
              <UserCheck className="w-5 h-5 text-primary" />
            </motion.div>
            <div>
              <p className="text-[10px] text-muted-foreground">الأعضاء</p>
              <p className="text-xl font-extrabold text-foreground">{peopleCount}</p>
            </div>
          </motion.div>

          {/* Quick Finance */}
          <motion.div
            variants={cardItem}
            className="ios-card p-4 flex items-center gap-3 cursor-pointer active:scale-[0.97] transition-transform"
            onClick={() => onNavigate("settings")}
          >
            <motion.div
              className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center shrink-0"
              whileHover={{ scale: 1.15 }}
            >
              <BarChart3 className="w-5 h-5 text-accent" />
            </motion.div>
            <div>
              <p className="text-[10px] text-muted-foreground">السجلات</p>
              <p className="text-xs font-semibold text-foreground">الأمور المالية</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Navigation Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="px-5 mt-5 pb-6"
      >
        <motion.p variants={fadeUp} className="text-sm font-bold text-muted-foreground mb-3">
          الأقسام
        </motion.p>
        <div className="grid grid-cols-2 gap-3">
          {navCards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                variants={cardItem}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onNavigate(card.id)}
                className="ios-card p-5 cursor-pointer relative overflow-hidden group"
              >
                {/* Subtle gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                <motion.div
                  className={`w-12 h-12 rounded-2xl ${card.iconBg} flex items-center justify-center mb-3`}
                  whileHover={{ rotate: -8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Icon className={`w-6 h-6 ${card.iconColor}`} />
                </motion.div>
                <p className="text-[15px] font-bold text-foreground">{card.title}</p>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{card.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
