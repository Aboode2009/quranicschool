import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ChevronLeft, Users, Shield, ShieldCheck, Trash2, BarChart3, UserCheck, BookOpen, DollarSign } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: string;
}

const AdminPage = ({ onBack }: { onBack: () => void }) => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<"users" | "stats">("users");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    totalPeople: 0,
    totalAttendance: 0,
    totalIncome: 0,
    totalExpense: 0,
    totalSessions: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch profiles and roles in parallel
    const [profilesRes, rolesRes, peopleRes, attendanceRes, incomeRes, expenseRes, sessionsRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
      supabase.from("people").select("id", { count: "exact", head: true }),
      supabase.from("attendance").select("id", { count: "exact", head: true }),
      supabase.from("finances").select("amount").eq("type", "income"),
      supabase.from("finances").select("amount").eq("type", "expense"),
      supabase.from("session_notes").select("id", { count: "exact", head: true }),
    ]);

    if (profilesRes.data) setProfiles(profilesRes.data as Profile[]);
    if (rolesRes.data) setRoles(rolesRes.data as UserRole[]);

    setStats({
      totalPeople: peopleRes.count || 0,
      totalAttendance: attendanceRes.count || 0,
      totalIncome: (incomeRes.data || []).reduce((s, r) => s + Number(r.amount), 0),
      totalExpense: (expenseRes.data || []).reduce((s, r) => s + Number(r.amount), 0),
      totalSessions: sessionsRes.count || 0,
    });

    setLoading(false);
  };

  const isUserAdmin = (userId: string) => {
    return roles.some((r) => r.user_id === userId && r.role === "admin");
  };

  const toggleAdmin = async (userId: string) => {
    if (userId === user?.id) {
      toast.error("لا يمكنك تغيير صلاحياتك الخاصة");
      return;
    }

    const currentlyAdmin = isUserAdmin(userId);

    if (currentlyAdmin) {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", "admin");
      if (error) {
        toast.error("خطأ في إزالة الصلاحية");
      } else {
        setRoles((prev) => prev.filter((r) => !(r.user_id === userId && r.role === "admin")));
        toast.success("تم إزالة صلاحية الأدمن");
      }
    } else {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: "admin" });
      if (error) {
        toast.error("خطأ في إضافة الصلاحية");
      } else {
        setRoles((prev) => [...prev, { user_id: userId, role: "admin" }]);
        toast.success("تم منح صلاحية الأدمن");
      }
    }
  };

  const statCards = [
    { label: "إجمالي الأشخاص", value: stats.totalPeople, icon: Users, color: "text-primary" },
    { label: "سجلات الحضور", value: stats.totalAttendance, icon: UserCheck, color: "text-accent" },
    { label: "الإيرادات", value: `${stats.totalIncome.toLocaleString()} د.ع`, icon: DollarSign, color: "text-accent" },
    { label: "المصروفات", value: `${stats.totalExpense.toLocaleString()} د.ع`, icon: DollarSign, color: "text-destructive" },
    { label: "الجلسات", value: stats.totalSessions, icon: BookOpen, color: "text-primary" },
  ];

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <div className="px-4 pt-3 pb-2">
        <button onClick={onBack} className="flex items-center gap-1 text-primary text-sm font-medium mb-3">
          <ChevronLeft className="w-4 h-4 rotate-180" />
          <span>رجوع</span>
        </button>
        <h1 className="text-2xl font-bold text-foreground mb-3">لوحة التحكم</h1>

        <div className="flex gap-2 p-1 rounded-xl bg-secondary">
          <button
            onClick={() => setActiveSection("users")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeSection === "users" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Shield className="w-4 h-4" />
            المستخدمين
          </button>
          <button
            onClick={() => setActiveSection("stats")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeSection === "stats" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            الإحصائيات
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <p>جاري التحميل...</p>
          </div>
        ) : activeSection === "users" ? (
          <div className="flex flex-col gap-2 mt-3">
            <p className="text-xs text-muted-foreground mb-1">
              {profiles.length} مستخدم مسجل
            </p>
            <AnimatePresence mode="popLayout">
              {profiles.map((profile, i) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="ios-card px-4 py-3.5 flex items-center gap-3"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isUserAdmin(profile.id) ? "bg-primary/10" : "bg-secondary"
                  }`}>
                    {isUserAdmin(profile.id) ? (
                      <ShieldCheck className="w-5 h-5 text-primary" />
                    ) : (
                      <Users className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-foreground truncate">
                      {profile.display_name || "بدون اسم"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                  </div>
                  <button
                    onClick={() => toggleAdmin(profile.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isUserAdmin(profile.id)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {isUserAdmin(profile.id) ? "أدمن ✓" : "جعله أدمن"}
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col gap-3 mt-3">
            {statCards.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="ios-card px-4 py-4 flex items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  </div>
                </motion.div>
              );
            })}

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="ios-card px-4 py-4"
            >
              <p className="text-xs text-muted-foreground mb-2">الرصيد الصافي</p>
              <p className={`text-2xl font-bold ${(stats.totalIncome - stats.totalExpense) >= 0 ? "text-accent" : "text-destructive"}`}>
                {(stats.totalIncome - stats.totalExpense).toLocaleString()} <span className="text-sm">د.ع</span>
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
