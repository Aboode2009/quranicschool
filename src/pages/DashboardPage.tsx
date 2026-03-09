import { motion } from "framer-motion";
import { BookOpen, Users, UserCheck, Settings } from "lucide-react";
import { useState } from "react";

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
