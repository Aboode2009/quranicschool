import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { AppRole } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ChevronLeft, Users, Shield, ShieldCheck, BarChart3, UserCheck, BookOpen, DollarSign, Plus, Trash2, MessageSquarePlus, Crown, Eye, Briefcase, Ban, CheckCircle } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: string;
  supervised_workshop?: string | null;
}

const WORKSHOP_NUMBERS = ["ورشة أولى", "ورشة ثانية", "ورشة ثالثة", "ورشة رابعة", "ورشة خامسة"] as const;

interface CustomQuestion {
  id: string;
  question_text: string;
  options: string[];
  sort_order: number;
}

const ROLE_CONFIG: { role: AppRole; label: string; icon: typeof Shield; color: string; desc: string }[] = [
  { role: "admin", label: "أدمن", icon: ShieldCheck, color: "bg-primary text-primary-foreground", desc: "إدارة المستخدمين والصلاحيات" },
  { role: "course_director", label: "مدير الدورة", icon: Crown, color: "bg-accent text-accent-foreground", desc: "صلاحية كاملة لكل شيء" },
  { role: "supervisor", label: "مشرف", icon: Briefcase, color: "bg-[hsl(var(--chart-4))] text-primary-foreground", desc: "إنشاء محاضرات وورش وأسماء، بدون مالية" },
  { role: "province_manager", label: "مدير محافظة", icon: Eye, color: "bg-secondary text-secondary-foreground", desc: "عرض كل شيء بدون تعديل" },
];

const AdminPage = ({ onBack }: { onBack: () => void }) => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<"users" | "stats" | "questions">("users");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

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
      supabase.from("user_roles").select("user_id, role, supervised_workshop"),
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

  const getUserRole = (userId: string): AppRole | null => {
    const userRoles = roles.filter((r) => r.user_id === userId);
    if (userRoles.some((r) => r.role === "admin")) return "admin";
    if (userRoles.some((r) => r.role === "course_director")) return "course_director";
    if (userRoles.some((r) => r.role === "supervisor")) return "supervisor";
    if (userRoles.some((r) => r.role === "province_manager")) return "province_manager";
    return null;
  };

  const getUserWorkshop = (userId: string): string | null => {
    const supervisorRole = roles.find((r) => r.user_id === userId && r.role === "supervisor");
    return supervisorRole?.supervised_workshop || null;
  };

  const getRoleLabel = (role: AppRole | null): string => {
    if (!role) return "مستخدم عادي";
    return ROLE_CONFIG.find((r) => r.role === role)?.label || "مستخدم";
  };

  const getRoleColor = (role: AppRole | null): string => {
    if (!role) return "bg-muted text-muted-foreground";
    return ROLE_CONFIG.find((r) => r.role === role)?.color || "bg-muted text-muted-foreground";
  };

  const setUserRole = async (userId: string, newRole: AppRole | null, workshopNum?: string | null) => {
    if (userId === user?.id) {
      toast.error("لا يمكنك تغيير صلاحياتك الخاصة");
      return;
    }

    // Remove all existing roles for this user
    const existingRoles = roles.filter((r) => r.user_id === userId);
    if (existingRoles.length > 0) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId);
      if (error) { toast.error("خطأ في تحديث الصلاحية"); return; }
    }

    if (newRole && newRole !== "user") {
      const insertData: any = { user_id: userId, role: newRole };
      if (newRole === "supervisor" && workshopNum) {
        insertData.supervised_workshop = workshopNum;
      }
      const { error } = await supabase.from("user_roles").insert(insertData);
      if (error) { toast.error("خطأ في إضافة الصلاحية"); return; }
      setRoles((prev) => [...prev.filter((r) => r.user_id !== userId), { user_id: userId, role: newRole, supervised_workshop: workshopNum || null }]);
      toast.success(`تم تعيين الدور: ${getRoleLabel(newRole)}${workshopNum ? ` - ${workshopNum}` : ""}`);
    } else {
      setRoles((prev) => prev.filter((r) => r.user_id !== userId));
      toast.success("تم إزالة جميع الصلاحيات");
    }
    setExpandedUser(null);
  };

  const banUser = async (userId: string) => {
    if (userId === user?.id) {
      toast.error("لا يمكنك حظر نفسك");
      return;
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("manage-user", {
        body: { action: "ban", userId },
      });
      if (res.error) throw res.error;
      toast.success("تم حظر المستخدم");
    } catch (e: any) {
      toast.error("خطأ في حظر المستخدم");
    }
  };

  const unbanUser = async (userId: string) => {
    try {
      const res = await supabase.functions.invoke("manage-user", {
        body: { action: "unban", userId },
      });
      if (res.error) throw res.error;
      toast.success("تم إلغاء حظر المستخدم");
    } catch (e: any) {
      toast.error("خطأ في إلغاء الحظر");
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
            {/* Role Legend */}
            <div className="ios-card px-4 py-3 mb-1">
              <p className="text-xs font-bold text-foreground mb-2">الأدوار المتاحة</p>
              <div className="flex flex-wrap gap-1.5">
                {ROLE_CONFIG.map((r) => (
                  <span key={r.role} className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${r.color}`}>
                    {r.label}
                  </span>
                ))}
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-muted text-muted-foreground">مستخدم عادي</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-1">{profiles.length} مستخدم مسجل</p>
            <AnimatePresence mode="popLayout">
              {profiles.map((profile, i) => {
                const currentRole = getUserRole(profile.id);
                const isExpanded = expandedUser === profile.id;
                const RoleIcon = ROLE_CONFIG.find((r) => r.role === currentRole)?.icon || Users;

                return (
                  <motion.div key={profile.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="ios-card overflow-hidden">
                    <div
                      className="px-4 py-3.5 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
                      onClick={() => setExpandedUser(isExpanded ? null : profile.id)}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${currentRole ? "bg-primary/10" : "bg-secondary"}`}>
                        <RoleIcon className={`w-5 h-5 ${currentRole ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-semibold text-foreground truncate">{profile.display_name || "بدون اسم"}</p>
                        <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${getRoleColor(currentRole)}`}>
                        {getRoleLabel(currentRole)}
                        {currentRole === "supervisor" && getUserWorkshop(profile.id) && (
                          <span className="mr-1">({getUserWorkshop(profile.id)})</span>
                        )}
                      </span>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-2">
                            <p className="text-[11px] font-medium text-muted-foreground">اختر الدور</p>
                            <div className="flex flex-col gap-1.5">
                              {ROLE_CONFIG.map((r) => {
                                const Icon = r.icon;
                                const isActive = currentRole === r.role;
                                return (
                                  <div key={r.role}>
                                    <button
                                      onClick={() => {
                                        if (r.role === "supervisor" && !isActive) {
                                          // Don't set role yet, show workshop picker
                                          setUserRole(profile.id, "supervisor", null);
                                        } else {
                                          setUserRole(profile.id, isActive ? null : r.role);
                                        }
                                      }}
                                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-right transition-all ${
                                        isActive ? r.color : "bg-secondary text-foreground"
                                      }`}
                                    >
                                      <Icon className="w-4 h-4 shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold">{r.label}</p>
                                        <p className="text-[10px] opacity-70">{r.desc}</p>
                                      </div>
                                      {isActive && <span className="text-xs">✓</span>}
                                    </button>
                                    {r.role === "supervisor" && isActive && (
                                      <div className="mt-2 mr-6">
                                        <p className="text-[10px] font-medium text-muted-foreground mb-1.5">اختر الورشة المشرف عليها:</p>
                                        <div className="flex flex-wrap gap-1.5">
                                          {WORKSHOP_NUMBERS.map((ws) => (
                                            <button
                                              key={ws}
                                              onClick={() => setUserRole(profile.id, "supervisor", ws)}
                                              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                                                getUserWorkshop(profile.id) === ws
                                                  ? "bg-primary text-primary-foreground"
                                                  : "bg-secondary text-foreground"
                                              }`}
                                            >
                                              {ws}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                              <button
                                onClick={() => setUserRole(profile.id, null)}
                                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-right transition-all ${
                                  !currentRole ? "bg-muted text-muted-foreground ring-2 ring-primary/30" : "bg-secondary text-foreground"
                                }`}
                              >
                                <Users className="w-4 h-4 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold">مستخدم عادي</p>
                                  <p className="text-[10px] opacity-70">بدون صلاحيات خاصة</p>
                                </div>
                                {!currentRole && <span className="text-xs">✓</span>}
                              </button>
                            </div>
                            
                            {/* Ban/Unban buttons */}
                            {profile.id !== user?.id && (
                              <div className="border-t border-ios-separator pt-3 mt-2 flex gap-2">
                                <button
                                  onClick={() => banUser(profile.id)}
                                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-xs font-semibold transition-all active:scale-95"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                  حظر
                                </button>
                                <button
                                  onClick={() => unbanUser(profile.id)}
                                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-accent text-accent-foreground text-xs font-semibold transition-all active:scale-95"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  إلغاء الحظر
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
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
