import { motion } from "framer-motion";
import { BookOpen, Users, UserCheck, Settings, ChevronLeft } from "lucide-react";

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
  const navCards = [
    {
      id: "muhadera" as TabId,
      title: "المحاضرة",
      desc: "إدارة الدروس والمحاضرات",
      icon: BookOpen,
      bg: "bg-gradient-to-br from-[#1a73e8] to-[#4fc3f7]",
    },
    {
      id: "warasha" as TabId,
      title: "الورشة",
      desc: "",
      icon: Users,
      bg: "bg-gradient-to-br from-[#e84040] to-[#ff8a65]",
    },
    {
      id: "attendance" as TabId,
      title: "الأسماء",
      desc: "متابعة الحضور والأسماء",
      icon: UserCheck,
      bg: "bg-gradient-to-br from-[#7c4dff] to-[#b388ff]",
    },
    {
      id: "settings" as TabId,
      title: "الإعدادات",
      desc: "إعدادات التطبيق والمالية",
      icon: Settings,
      bg: "bg-gradient-to-br from-[#00897b] to-[#4db6ac]",
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
        <h1 className="text-3xl font-extrabold text-foreground">دورة التربية بالقرآن</h1>
        <p className="text-sm text-muted-foreground font-medium mt-1">الشاشة الرئيسية</p>
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
        <div className="flex flex-col gap-4">
          {navCards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                variants={cardItem}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate(card.id)}
                className={`${card.bg} rounded-2xl p-6 cursor-pointer relative overflow-hidden shadow-lg`}
              >
                {/* Decorative circles */}
                <div className="absolute -left-6 -top-6 w-28 h-28 rounded-full bg-white/10 blur-sm" />
                <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/10 blur-sm" />
                
                <div className="relative flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-extrabold text-white mb-1">{card.title}</h3>
                    <p className="text-white/80 text-sm font-medium">{card.desc}</p>
                  </div>
                  <motion.div
                    className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0"
                    whileHover={{ rotate: -10, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </motion.div>
                </div>

                <div className="relative mt-4">
                  <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-xl">
                    فتح
                    <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
