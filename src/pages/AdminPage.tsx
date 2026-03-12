import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ChevronLeft, Users, Shield, ShieldCheck, BarChart3, UserCheck, BookOpen, DollarSign, Plus, Trash2, MessageSquarePlus } from "lucide-react";

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

interface CustomQuestion {
  id: string;
  question_text: string;
  options: string[];
  sort_order: number;
}

const AdminPage = ({ onBack }: { onBack: () => void }) => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<"users" | "stats" | "questions">("users");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  // Custom questions
  const [questions, setQuestions] = useState<CustomQuestion[]>([]);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newOptions, setNewOptions] = useState<string[]>([""]);
  const [addingQuestion, setAddingQuestion] = useState(false);

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
    
    const [profilesRes, rolesRes, peopleRes, attendanceRes, incomeRes, expenseRes, sessionsRes, questionsRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
      supabase.from("people").select("id", { count: "exact", head: true }),
      supabase.from("attendance").select("id", { count: "exact", head: true }),
      supabase.from("finances").select("amount").eq("type", "income"),
      supabase.from("finances").select("amount").eq("type", "expense"),
      supabase.from("session_notes").select("id", { count: "exact", head: true }),
      supabase.from("workshop_questions").select("*").order("sort_order", { ascending: true }),
    ]);

    if (profilesRes.data) setProfiles(profilesRes.data as Profile[]);
    if (rolesRes.data) setRoles(rolesRes.data as UserRole[]);
    if (questionsRes.data) setQuestions(questionsRes.data.map((q: any) => ({ ...q, options: Array.isArray(q.options) ? q.options : [] })));

    setStats({
      totalPeople: peopleRes.count || 0,
      totalAttendance: attendanceRes.count || 0,
      totalIncome: (incomeRes.data || []).reduce((s, r) => s + Number(r.amount), 0),
      totalExpense: (expenseRes.data || []).reduce((s, r) => s + Number(r.amount), 0),
      totalSessions: sessionsRes.count || 0,
    });

    setLoading(false);
  };

  const isUserAdmin = (userId: string) => roles.some((r) => r.user_id === userId && r.role === "admin");

  const toggleAdmin = async (userId: string) => {
    if (userId === user?.id) {
      toast.error("لا يمكنك تغيير صلاحياتك الخاصة");
      return;
    }

    const currentlyAdmin = isUserAdmin(userId);
    if (currentlyAdmin) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
      if (error) { toast.error("خطأ في إزالة الصلاحية"); return; }
      setRoles((prev) => prev.filter((r) => !(r.user_id === userId && r.role === "admin")));
      toast.success("تم إزالة صلاحية الأدمن");
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
      if (error) { toast.error("خطأ في إضافة الصلاحية"); return; }
      setRoles((prev) => [...prev, { user_id: userId, role: "admin" }]);
      toast.success("تم منح صلاحية الأدمن");
    }
  };

  const addQuestion = async () => {
    const text = newQuestionText.trim();
    const opts = newOptions.map((o) => o.trim()).filter(Boolean);
    if (!text) { toast.error("اكتب نص السؤال"); return; }
    if (opts.length < 2) { toast.error("أضف خيارين على الأقل"); return; }

    const { data, error } = await supabase.from("workshop_questions").insert({
      question_text: text,
      options: opts,
      sort_order: questions.length,
    }).select().single();

    if (error) { toast.error("خطأ في إضافة السؤال"); return; }
    setQuestions((prev) => [...prev, { ...data, options: opts }]);
    setNewQuestionText("");
    setNewOptions([""]);
    setAddingQuestion(false);
    toast.success("تم إضافة السؤال ✓");
  };

  const deleteQuestion = async (id: string) => {
    const { error } = await supabase.from("workshop_questions").delete().eq("id", id);
    if (error) { toast.error("خطأ في حذف السؤال"); return; }
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    toast.success("تم حذف السؤال");
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

        <div className="flex gap-1 p-1 rounded-xl bg-secondary">
          {[
            { key: "users" as const, icon: Shield, label: "المستخدمين" },
            { key: "stats" as const, icon: BarChart3, label: "الإحصائيات" },
            { key: "questions" as const, icon: MessageSquarePlus, label: "الأسئلة" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                activeSection === tab.key ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <p>جاري التحميل...</p>
          </div>
        ) : activeSection === "users" ? (
          <div className="flex flex-col gap-2 mt-3">
            <p className="text-xs text-muted-foreground mb-1">{profiles.length} مستخدم مسجل</p>
            <AnimatePresence mode="popLayout">
              {profiles.map((profile, i) => (
                <motion.div key={profile.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="ios-card px-4 py-3.5 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isUserAdmin(profile.id) ? "bg-primary/10" : "bg-secondary"}`}>
                    {isUserAdmin(profile.id) ? <ShieldCheck className="w-5 h-5 text-primary" /> : <Users className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-foreground truncate">{profile.display_name || "بدون اسم"}</p>
                    <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                  </div>
                  <button onClick={() => toggleAdmin(profile.id)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isUserAdmin(profile.id) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                    {isUserAdmin(profile.id) ? "أدمن ✓" : "جعله أدمن"}
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : activeSection === "stats" ? (
          <div className="flex flex-col gap-3 mt-3">
            {statCards.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="ios-card px-4 py-4 flex items-center gap-3">
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
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="ios-card px-4 py-4">
              <p className="text-xs text-muted-foreground mb-2">الرصيد الصافي</p>
              <p className={`text-2xl font-bold ${(stats.totalIncome - stats.totalExpense) >= 0 ? "text-accent" : "text-destructive"}`}>
                {(stats.totalIncome - stats.totalExpense).toLocaleString()} <span className="text-sm">د.ع</span>
              </p>
            </motion.div>
          </div>
        ) : (
          /* Questions section */
          <div className="flex flex-col gap-3 mt-3">
            <p className="text-xs text-muted-foreground">أسئلة مخصصة تظهر في حضور الورشة عند تحديد "حاضر"</p>

            {/* Existing questions */}
            <AnimatePresence mode="popLayout">
              {questions.map((q, i) => (
                <motion.div key={q.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="ios-card px-4 py-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-semibold text-foreground">{q.question_text}</p>
                      <div className="flex gap-1.5 flex-wrap mt-2">
                        {q.options.map((opt) => (
                          <span key={opt} className="px-2.5 py-1 rounded-lg bg-secondary text-xs font-medium text-muted-foreground">{opt}</span>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => deleteQuestion(q.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-destructive/10 text-destructive shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {questions.length === 0 && !addingQuestion && (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <MessageSquarePlus className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">لا توجد أسئلة مخصصة</p>
              </div>
            )}

            {/* Add question form */}
            {addingQuestion ? (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="ios-card px-4 py-4 space-y-3">
                <input
                  type="text"
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="نص السؤال..."
                  className="w-full px-3 py-2.5 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground outline-none"
                />
                <div className="space-y-2">
                  <p className="text-[11px] font-medium text-muted-foreground">الخيارات</p>
                  {newOptions.map((opt, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...newOptions];
                          updated[idx] = e.target.value;
                          setNewOptions(updated);
                        }}
                        placeholder={`خيار ${idx + 1}`}
                        className="flex-1 px-3 py-2 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground outline-none"
                      />
                      {newOptions.length > 1 && (
                        <button onClick={() => setNewOptions(newOptions.filter((_, i) => i !== idx))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setNewOptions([...newOptions, ""])} className="text-xs text-primary font-medium">
                    + إضافة خيار
                  </button>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={addQuestion} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">حفظ</button>
                  <button onClick={() => { setAddingQuestion(false); setNewQuestionText(""); setNewOptions([""]); }} className="px-4 py-2.5 rounded-xl bg-secondary text-muted-foreground text-sm font-semibold">إلغاء</button>
                </div>
              </motion.div>
            ) : (
              <button onClick={() => setAddingQuestion(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
                <Plus className="w-4 h-4" />
                إضافة سؤال جديد
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
