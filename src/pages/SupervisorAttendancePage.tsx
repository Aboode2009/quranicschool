import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCheck, Plus, Trash2, ChevronLeft, BookOpen, Users, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatSyriacDateString } from "@/lib/syriac-locale";

interface Lesson {
  id: string;
  surah_name: string;
  lesson_date: string;
  category: string;
}

interface SupervisorRecord {
  id: string;
  name: string;
  lesson_id: string;
  lesson_category: string;
  created_at: string;
}

// ---- صفحة تفاصيل المحاضرة/الورشة ----
const LessonDetailPage = ({
  lesson,
  onBack,
}: {
  lesson: Lesson;
  onBack: () => void;
}) => {
  const [supervisors, setSupervisors] = useState<SupervisorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchSupervisors();
  }, [lesson.id]);

  const fetchSupervisors = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("supervisor_attendance")
      .select("*")
      .eq("lesson_id", lesson.id)
      .order("created_at", { ascending: true });
    if (!error) setSupervisors((data as SupervisorRecord[]) || []);
    setLoading(false);
  };

  const addSupervisor = async () => {
    const name = newName.trim();
    if (!name) { toast.error("اكتب اسم المشرف"); return; }
    const { data, error } = await (supabase as any)
      .from("supervisor_attendance")
      .insert({ name, lesson_id: lesson.id, lesson_category: lesson.category })
      .select()
      .single();
    if (error) { toast.error("خطأ في الإضافة"); return; }
    setSupervisors((prev) => [...prev, data as SupervisorRecord]);
    setNewName("");
    setAdding(false);
    toast.success("تم إضافة المشرف ✓");
  };

  const deleteSupervisor = async (id: string) => {
    const { error } = await (supabase as any).from("supervisor_attendance").delete().eq("id", id);
    if (error) { toast.error("خطأ في الحذف"); return; }
    setSupervisors((prev) => prev.filter((s) => s.id !== id));
    toast.success("تم الحذف");
  };

  const isLecture = lesson.category === "muhadera";

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className="flex flex-col h-full"
      dir="rtl"
    >
      <div className="px-4 pt-3 pb-2">
        <button onClick={onBack} className="flex items-center gap-1 text-primary text-sm font-medium mb-3">
          <ChevronLeft className="w-4 h-4 rotate-180" />
          <span>رجوع</span>
        </button>
        <div className="flex items-center gap-3 mb-1">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isLecture ? "bg-blue-500/10" : "bg-red-500/10"}`}>
            {isLecture
              ? <BookOpen className="w-5 h-5 text-blue-500" />
              : <Users className="w-5 h-5 text-red-500" />}
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{lesson.surah_name}</h1>
            <p className="text-xs text-muted-foreground">{formatSyriacDateString(lesson.lesson_date)} · {isLecture ? "محاضرة" : "ورشة"}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <p>جاري التحميل...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 mt-3">
            <p className="text-xs text-muted-foreground mb-1">{supervisors.length} مشرف مسجل</p>
            <AnimatePresence mode="popLayout">
              {supervisors.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ delay: i * 0.03 }}
                  className="ios-card px-4 py-3.5 flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4 text-primary" />
                  </div>
                  <p className="flex-1 text-[15px] font-semibold text-foreground">{s.name}</p>
                  <button
                    onClick={() => deleteSupervisor(s.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {supervisors.length === 0 && !adding && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <UserCheck className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">لا يوجد مشرفون مسجلون</p>
              </div>
            )}

            <AnimatePresence>
              {adding && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ios-card px-4 py-4 flex flex-col gap-3"
                >
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSupervisor()}
                    placeholder="اسم المشرف..."
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <div className="flex gap-2">
                    <button onClick={addSupervisor} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold active:scale-[0.97] transition-transform">
                      إضافة
                    </button>
                    <button onClick={() => { setAdding(false); setNewName(""); }} className="px-4 py-2.5 rounded-xl bg-secondary text-muted-foreground text-sm font-semibold">
                      إلغاء
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {!adding && (
        <div className="px-4 pb-4">
          <button
            onClick={() => setAdding(true)}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
          >
            <Plus className="w-5 h-5" />
            إضافة مشرف
          </button>
        </div>
      )}
    </motion.div>
  );
};

// ---- الصفحة الرئيسية ----
const SupervisorAttendancePage = ({ onBack }: { onBack: () => void }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState<"muhadera" | "warasha">("muhadera");
  const [search, setSearch] = useState("");
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchLessons();
  }, [activeTab]);

  const fetchLessons = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("lessons")
      .select("id, surah_name, lesson_date, category")
      .eq("category", activeTab)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setLessons(data as Lesson[]);
      // جيب عدد المشرفين لكل درس
      const ids = data.map((l: Lesson) => l.id);
      if (ids.length > 0) {
        const { data: countData } = await supabase
          .from("supervisor_attendance")
          .select("lesson_id")
          .in("lesson_id", ids);
        const map: Record<string, number> = {};
        (countData || []).forEach((r: any) => {
          map[r.lesson_id] = (map[r.lesson_id] || 0) + 1;
        });
        setCounts(map);
      }
    }
    setLoading(false);
  };

  const filtered = lessons.filter((l) =>
    !search || l.surah_name.includes(search)
  );

  if (selectedLesson) {
    return (
      <LessonDetailPage
        lesson={selectedLesson}
        onBack={() => { setSelectedLesson(null); fetchLessons(); }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <div className="px-4 pt-3 pb-2">
        <button onClick={onBack} className="flex items-center gap-1 text-primary text-sm font-medium mb-3">
          <ChevronLeft className="w-4 h-4 rotate-180" />
          <span>رجوع</span>
        </button>
        <h1 className="text-2xl font-bold text-foreground mb-1">حضور المشرفين</h1>
        <p className="text-sm text-muted-foreground mb-3">تسجيل حضور المشرفين في المحاضرات والورش</p>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-secondary mb-3">
          {[
            { id: "muhadera" as const, label: "المحاضرة", icon: BookOpen },
            { id: "warasha" as const, label: "الورشة", icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearch(""); }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث..."
            className="w-full pr-9 pl-4 py-2.5 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <p>جاري التحميل...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <UserCheck className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-base font-medium">لا توجد {activeTab === "muhadera" ? "محاضرات" : "ورش"}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 mt-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((lesson, i) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedLesson(lesson)}
                  className="ios-card px-4 py-3.5 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    activeTab === "muhadera" ? "bg-blue-500/10" : "bg-red-500/10"
                  }`}>
                    {activeTab === "muhadera"
                      ? <BookOpen className="w-5 h-5 text-blue-500" />
                      : <Users className="w-5 h-5 text-red-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-foreground truncate">{lesson.surah_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatSyriacDateString(lesson.lesson_date)}</p>
                  </div>
                  {counts[lesson.id] > 0 && (
                    <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold shrink-0">
                      {counts[lesson.id]} مشرف
                    </span>
                  )}
                  <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0 rotate-180" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupervisorAttendancePage;
