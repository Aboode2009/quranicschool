import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCheck, ChevronLeft, BookOpen, Users, ArrowRight, ChevronDown, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatSyriacDateString } from "@/lib/syriac-locale";

interface Lesson { id: string; surah_name: string; lesson_date: string; category: string; }
interface Supervisor { id: string; name: string; phone?: string | null; }
type AttendStatus = "present" | "absent" | null;
type Excuse = "with_excuse" | "without_excuse";
interface AttendDetail { status: AttendStatus; excuse?: Excuse; }

const Chip = ({ label, active, activeClass, onClick }: { label: string; active: boolean; activeClass: string; onClick: () => void }) => (
  <button onClick={(e) => { e.stopPropagation(); onClick(); }}
    className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${active ? activeClass : "bg-secondary text-secondary-foreground"}`}>
    {label}
  </button>
);

const LessonSupervisorAttendancePage = ({ lesson, onBack }: { lesson: Lesson; onBack: () => void }) => {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendDetail>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => { fetchData(); }, [lesson.id]);

  const fetchData = async () => {
    setLoading(true);
    const [supRes, attRes] = await Promise.all([
      supabase.from("supervisors").select("id, name, phone").order("created_at", { ascending: true }),
      supabase.from("supervisor_attendance").select("supervisor_id, is_present, excuse").eq("lesson_id", lesson.id),
    ]);
    if (supRes.error) { toast.error("خطأ في تحميل المشرفين"); setLoading(false); return; }
    const sups = (supRes.data || []) as Supervisor[];
    setSupervisors(sups);
    const map: Record<string, AttendDetail> = {};
    sups.forEach((s) => { map[s.id] = { status: null }; });
    let matched = 0;
    (attRes.data || []).forEach((r: any) => {
      if (map[r.supervisor_id] !== undefined) {
        matched++;
        map[r.supervisor_id] = { status: r.is_present ? "present" : "absent", excuse: r.excuse || undefined };
      }
    });
    setAttendance(map);
    setIsEditing(matched > 0);
    setLoading(false);
  };

  const setStatus = (id: string, status: AttendStatus) => {
    setAttendance((prev) => ({ ...prev, [id]: { status, excuse: status === "absent" ? "without_excuse" : undefined } }));
    setExpanded(id);
  };

  const saveAttendance = async () => {
    setSaving(true);
    await supabase.from("supervisor_attendance").delete().eq("lesson_id", lesson.id);
    const records = supervisors.map((s) => {
      const d = attendance[s.id];
      return { supervisor_id: s.id, lesson_id: lesson.id, lesson_category: lesson.category, is_present: d?.status === "present", excuse: d?.status === "absent" ? d.excuse || null : null, name: s.name };
    });
    const { error } = await supabase.from("supervisor_attendance").insert(records);
    if (error) toast.error("خطأ في حفظ الحضور");
    else toast.success("تم حفظ الحضور ✓");
    setSaving(false);
  };

  const presentCount = Object.values(attendance).filter((a) => a.status === "present").length;
  const absentCount  = Object.values(attendance).filter((a) => a.status === "absent").length;
  const statusLabel  = (d: AttendDetail) => { if (!d?.status) return "لم يُحدد"; if (d.status === "present") return "حاضر"; return d.excuse === "with_excuse" ? "غائب بعذر" : "غائب بدون عذر"; };
  const statusColor  = (d: AttendDetail) => { if (!d?.status) return "bg-muted/50 text-muted-foreground border-border"; if (d.status === "present") return "bg-green-100 text-green-800 border-green-400 dark:bg-green-900/40 dark:text-green-300 dark:border-green-600"; return "bg-red-100 text-red-800 border-red-400 dark:bg-red-900/40 dark:text-red-300 dark:border-red-600"; };

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-xl bg-secondary text-secondary-foreground"><ArrowRight className="w-4 h-4" /></button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">{lesson.surah_name}</h1>
            <p className="text-xs text-muted-foreground">{formatSyriacDateString(lesson.lesson_date)} · {lesson.category === "muhadera" ? "محاضرة" : "ورشة"}</p>
          </div>
        </div>
        {!loading && supervisors.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-secondary mb-1">
            <div className="flex items-center gap-1.5"><span className="text-xs text-muted-foreground">حاضر</span><span className="text-sm font-bold text-primary">{presentCount}</span></div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5"><span className="text-xs text-muted-foreground">غائب</span><span className="text-sm font-bold text-destructive">{absentCount}</span></div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5"><span className="text-xs text-muted-foreground">الكل</span><span className="text-sm font-bold text-foreground">{supervisors.length}</span></div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? <div className="flex items-center justify-center py-20 text-muted-foreground"><p>جاري التحميل...</p></div>
        : supervisors.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <UserCheck className="w-10 h-10 mb-3 opacity-30" strokeWidth={1.5} />
            <p className="text-base font-medium">لا توجد أسماء مشرفين</p>
            <p className="text-sm mt-1">أضف أسماء المشرفين من صفحة الأسماء أولاً</p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
              {supervisors.map((sup, i) => {
                const detail = attendance[sup.id] || { status: null };
                const isExp = expanded === sup.id;
                return (
                  <motion.div key={sup.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className={`rounded-2xl border overflow-hidden transition-all ${statusColor(detail)}`}>
                    <div onClick={() => setExpanded(isExp ? null : sup.id)} className="flex items-center justify-between px-4 py-3.5 cursor-pointer active:scale-[0.98] transition-transform">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {detail.status && <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${detail.status === "present" ? "bg-green-500" : "bg-red-500"}`} />}
                        <div className="min-w-0">
                          <span className="text-[15px] font-semibold text-foreground block">{sup.name}</span>
                          <span className="text-[11px] mt-0.5 block opacity-70">{statusLabel(detail)}</span>
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExp ? "rotate-180" : ""}`} />
                    </div>
                    <AnimatePresence>
                      {isExp && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                          <div className="px-4 pb-4 space-y-3">
                            <div>
                              <p className="text-[11px] font-medium text-muted-foreground mb-1.5">الحالة</p>
                              <div className="flex gap-2">
                                <Chip label="حاضر" active={detail.status === "present"} activeClass="bg-primary text-primary-foreground" onClick={() => setStatus(sup.id, "present")} />
                                <Chip label="غائب" active={detail.status === "absent"} activeClass="bg-destructive text-destructive-foreground" onClick={() => setStatus(sup.id, "absent")} />
                              </div>
                            </div>
                            {detail.status === "absent" && (
                              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                                <p className="text-[11px] font-medium text-muted-foreground mb-1.5">نوع الغياب</p>
                                <div className="flex gap-2">
                                  <Chip label="بعذر" active={detail.excuse === "with_excuse"} activeClass="bg-accent text-accent-foreground" onClick={() => setAttendance((prev) => ({ ...prev, [sup.id]: { ...prev[sup.id], excuse: "with_excuse" } }))} />
                                  <Chip label="بدون عذر" active={detail.excuse === "without_excuse"} activeClass="bg-destructive text-destructive-foreground" onClick={() => setAttendance((prev) => ({ ...prev, [sup.id]: { ...prev[sup.id], excuse: "without_excuse" } }))} />
                                </div>
                              </motion.div>
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
        )}
      </div>

      {supervisors.length > 0 && (
        <div className="px-4 pb-4">
          <button onClick={saveAttendance} disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-base font-semibold shadow-sm disabled:opacity-50 active:scale-[0.98] transition-transform">
            {saving ? "جاري الحفظ..." : isEditing ? "تعديل الحضور" : "حفظ الحضور"}
          </button>
        </div>
      )}
    </div>
  );
};

const SupervisorAttendancePage = ({ onBack }: { onBack: () => void }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState<"muhadera" | "warasha">("muhadera");
  const [search, setSearch] = useState("");
  const [counts, setCounts] = useState<Record<string, { present: number; absent: number }>>({});

  useEffect(() => { fetchLessons(); }, [activeTab]);

  const fetchLessons = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("lessons").select("id, surah_name, lesson_date, category").eq("category", activeTab).order("created_at", { ascending: false });
    if (!error && data) {
      setLessons(data as Lesson[]);
      const ids = data.map((l: any) => l.id);
      if (ids.length > 0) {
        const { data: attData } = await supabase.from("supervisor_attendance").select("lesson_id, is_present").in("lesson_id", ids);
        const map: Record<string, { present: number; absent: number }> = {};
        (attData || []).forEach((r: any) => { if (!map[r.lesson_id]) map[r.lesson_id] = { present: 0, absent: 0 }; if (r.is_present) map[r.lesson_id].present++; else map[r.lesson_id].absent++; });
        setCounts(map);
      }
    }
    setLoading(false);
  };

  const filtered = lessons.filter((l) => !search || l.surah_name.includes(search));
  if (selectedLesson) return <LessonSupervisorAttendancePage lesson={selectedLesson} onBack={() => { setSelectedLesson(null); fetchLessons(); }} />;

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <div className="px-4 pt-3 pb-2">
        <button onClick={onBack} className="flex items-center gap-1 text-primary text-sm font-medium mb-3"><ChevronLeft className="w-4 h-4 rotate-180" /><span>رجوع</span></button>
        <h1 className="text-2xl font-bold text-foreground mb-1">حضور المشرفين</h1>
        <p className="text-sm text-muted-foreground mb-3">تسجيل حضور المشرفين في المحاضرات والورش</p>
        <div className="flex gap-1 p-1 rounded-xl bg-secondary mb-3">
          {[{ id: "muhadera" as const, label: "المحاضرة", icon: BookOpen }, { id: "warasha" as const, label: "الورشة", icon: Users }].map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearch(""); }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${activeTab === tab.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}>
              <tab.icon className="w-3.5 h-3.5" />{tab.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث..." className="w-full pr-9 pl-4 py-2.5 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm outline-none" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? <div className="flex items-center justify-center py-16 text-muted-foreground"><p>جاري التحميل...</p></div>
        : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <UserCheck className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-base font-medium">لا توجد {activeTab === "muhadera" ? "محاضرات" : "ورش"}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 mt-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((lesson, i) => {
                const c = counts[lesson.id];
                return (
                  <motion.div key={lesson.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    onClick={() => setSelectedLesson(lesson)} className="ios-card px-4 py-3.5 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${activeTab === "muhadera" ? "bg-blue-500/10" : "bg-red-500/10"}`}>
                      {activeTab === "muhadera" ? <BookOpen className="w-5 h-5 text-blue-500" /> : <Users className="w-5 h-5 text-red-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-semibold text-foreground truncate">{lesson.surah_name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatSyriacDateString(lesson.lesson_date)}</p>
                    </div>
                    {c && (
                      <div className="flex gap-1.5 shrink-0">
                        <span className="px-2 py-0.5 rounded-lg bg-green-500/10 text-green-600 text-[11px] font-bold">{c.present} ✓</span>
                        {c.absent > 0 && <span className="px-2 py-0.5 rounded-lg bg-red-500/10 text-red-500 text-[11px] font-bold">{c.absent} ✗</span>}
                      </div>
                    )}
                    <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0 rotate-180" />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupervisorAttendancePage;
