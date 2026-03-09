import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Users, UserPlus, Trash2, BookOpen, GraduationCap, ChevronLeft, ChevronDown, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getLessonsFromStorage, getWorkshopsFromStorage, type Lesson } from "@/lib/quran-data";

interface Person {
  id: string;
  name: string;
  category: string;
}

interface AttendanceRecord {
  lesson_name: string;
  lesson_date: string;
  is_present: boolean;
  excuse: string | null;
}

interface CategorizedRecords {
  lecturePresent: AttendanceRecord[];
  lectureAbsent: AttendanceRecord[];
  workshopPresent: AttendanceRecord[];
  workshopAbsent: AttendanceRecord[];
}

const AttendancePage = () => {
  const [activeCategory, setActiveCategory] = useState<"muhadera" | "warasha">("muhadera");
  const [people, setPeople] = useState<Person[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [records, setRecords] = useState<CategorizedRecords | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [detailView, setDetailView] = useState<{ items: AttendanceRecord[]; type: "present" | "absent"; label: string } | null>(null);

  // Lookup maps for lesson/workshop names
  const [lessonMap, setLessonMap] = useState<Record<string, Lesson>>({});
  const [workshopMap, setWorkshopMap] = useState<Record<string, Lesson>>({});

  useEffect(() => {
    fetchPeople();
  }, [activeCategory]);

  useEffect(() => {
    const lessons = getLessonsFromStorage();
    const workshops = getWorkshopsFromStorage();
    const lMap: Record<string, Lesson> = {};
    lessons.forEach(l => { lMap[l.id] = l; });
    const wMap: Record<string, Lesson> = {};
    workshops.forEach(w => { wMap[w.id] = w; });
    setLessonMap(lMap);
    setWorkshopMap(wMap);
  }, []);

  const fetchPeople = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("people")
      .select("id, name, category")
      .eq("category", activeCategory)
      .order("created_at", { ascending: true });

    if (error) {
      toast.error("خطأ في تحميل الأسماء");
    } else {
      setPeople(data || []);
    }
    setLoading(false);
  };

  const addPerson = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    const { data, error } = await supabase
      .from("people")
      .insert({ name: trimmed, category: activeCategory })
      .select()
      .single();

    if (error) {
      toast.error("خطأ في إضافة الاسم");
    } else if (data) {
      setPeople((prev) => [...prev, data]);
      setNewName("");
      toast.success(`تمت إضافة ${trimmed}`);
    }
  };

  const deletePerson = async (id: string, name: string) => {
    const { error } = await supabase.from("people").delete().eq("id", id);
    if (error) {
      toast.error("خطأ في الحذف");
    } else {
      setPeople((prev) => prev.filter((p) => p.id !== id));
      if (selectedPerson?.id === id) setSelectedPerson(null);
      toast.success(`تم حذف ${name}`);
    }
  };

  const getLessonDisplayName = (lessonId: string): string => {
    const lesson = lessonMap[lessonId];
    if (lesson) {
      if (lesson.surahName && lesson.fromAyah && lesson.toAyah) {
        return `${lesson.surahName} (${lesson.fromAyah}-${lesson.toAyah})`;
      }
      return lesson.surahName || lessonId;
    }
    const workshop = workshopMap[lessonId];
    if (workshop) return workshop.surahName || lessonId;
    return lessonId;
  };

  const openProfile = async (person: Person) => {
    setSelectedPerson(person);
    setStatsLoading(true);
    setExpandedSection(null);

    // Refresh maps
    const lessons = getLessonsFromStorage();
    const workshops = getWorkshopsFromStorage();
    const lMap: Record<string, Lesson> = {};
    lessons.forEach(l => { lMap[l.id] = l; });
    const wMap: Record<string, Lesson> = {};
    workshops.forEach(w => { wMap[w.id] = w; });
    setLessonMap(lMap);
    setWorkshopMap(wMap);

    const workshopIds = new Set(workshops.map(w => w.id));
    const lessonIds = new Set(lessons.map(l => l.id));

    const { data, error } = await supabase
      .from("attendance")
      .select("is_present, lesson_name, lesson_date, excuse")
      .eq("person_id", person.id);

    if (error) {
      toast.error("خطأ في تحميل الإحصائيات");
      setStatsLoading(false);
      return;
    }

    const categorized: CategorizedRecords = {
      lecturePresent: [],
      lectureAbsent: [],
      workshopPresent: [],
      workshopAbsent: [],
    };

    (data || []).forEach((row) => {
      const rec: AttendanceRecord = {
        lesson_name: row.lesson_name,
        lesson_date: row.lesson_date,
        is_present: row.is_present,
        excuse: row.excuse,
      };
      const isWorkshop = workshopIds.has(row.lesson_name);
      const isLecture = lessonIds.has(row.lesson_name);

      if (isWorkshop) {
        if (row.is_present) categorized.workshopPresent.push(rec);
        else categorized.workshopAbsent.push(rec);
      } else if (isLecture) {
        if (row.is_present) categorized.lecturePresent.push(rec);
        else categorized.lectureAbsent.push(rec);
      } else {
        if (person.category === "warasha") {
          if (row.is_present) categorized.workshopPresent.push(rec);
          else categorized.workshopAbsent.push(rec);
        } else {
          if (row.is_present) categorized.lecturePresent.push(rec);
          else categorized.lectureAbsent.push(rec);
        }
      }
    });

    setRecords(categorized);
    setStatsLoading(false);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const openDetailView = (items: AttendanceRecord[], type: "present" | "absent", label: string) => {
    setDetailView({ items, type, label });
  };

  const title = activeCategory === "muhadera" ? "أسماء المحاضرة" : "أسماء الورشة";
  const subtitle = "اضغط على الاسم لعرض الإحصائيات";

  // Stat card component - now opens full page
  const StatCard = ({
    sectionKey, count, label, colorClass, bgClass, items, type
  }: {
    sectionKey: string; count: number; label: string;
    colorClass: string; bgClass: string;
    items: AttendanceRecord[]; type: "present" | "absent";
  }) => {
    return (
      <div
        className={`rounded-xl ${bgClass} p-3 cursor-pointer transition-all active:scale-[0.97]`}
        onClick={() => openDetailView(items, type, label)}
      >
        <div className="text-center">
          <p className={`text-2xl font-bold ${colorClass}`}>{count}</p>
          <p className="text-xs text-muted-foreground mt-1">{label}</p>
        </div>
      </div>
    );
  };

  // Detail full-page view for records
  if (detailView && selectedPerson) {
    return (
      <div className="flex flex-col h-full" dir="rtl">
        <div className="px-4 pt-3 pb-2">
          <button
            onClick={() => setDetailView(null)}
            className="flex items-center gap-1 text-primary text-sm font-medium mb-3"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <span>رجوع</span>
          </button>
          <h1 className="text-xl font-bold text-foreground">
            {detailView.label} - {selectedPerson.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {detailView.items.length} سجل
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {detailView.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Calendar className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-base font-medium">لا توجد سجلات</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 mt-3">
              {detailView.items.map((rec, i) => (
                <motion.div
                  key={rec.lesson_name + i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="ios-card px-4 py-3.5 flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-foreground truncate">
                      {getLessonDisplayName(rec.lesson_name)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{rec.lesson_date}</p>
                  </div>
                  {detailView.type === "absent" && rec.excuse && (
                    <span className={`text-xs px-2.5 py-1 rounded-full shrink-0 font-medium ${
                      rec.excuse === "with_excuse" 
                        ? "bg-amber-100 text-amber-700" 
                        : "bg-destructive/10 text-destructive"
                    }`}>
                      {rec.excuse === "with_excuse" ? "بعذر" : "بدون عذر"}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Profile detail view
  if (selectedPerson) {
    const initials = selectedPerson.name.charAt(0);
    return (
      <div className="flex flex-col h-full" dir="rtl">
        <div className="px-4 pt-3 pb-2">
          <button
            onClick={() => { setSelectedPerson(null); setRecords(null); setExpandedSection(null); setDetailView(null); }}
            className="flex items-center gap-1 text-primary text-sm font-medium mb-3"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <span>رجوع</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center pt-4 pb-6"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <span className="text-3xl font-bold text-primary">{initials}</span>
            </div>
            <h2 className="text-xl font-bold text-foreground">{selectedPerson.name}</h2>
            <span className="text-sm text-muted-foreground mt-1">
              {selectedPerson.category === "muhadera" ? "محاضرة" : "ورشة"}
            </span>
          </motion.div>

          {statsLoading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <p>جاري التحميل...</p>
            </div>
          ) : records ? (
            <div className="flex flex-col gap-3">
              {/* Lecture stats */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="ios-card p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">المحاضرات</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    sectionKey="lp"
                    count={records.lecturePresent.length}
                    label="حضور"
                    colorClass="text-accent"
                    bgClass="bg-accent/10"
                    items={records.lecturePresent}
                    type="present"
                  />
                  <StatCard
                    sectionKey="la"
                    count={records.lectureAbsent.length}
                    label="غياب"
                    colorClass="text-destructive"
                    bgClass="bg-destructive/10"
                    items={records.lectureAbsent}
                    type="absent"
                  />
                </div>
              </motion.div>

              {/* Workshop stats */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="ios-card p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">الورشات</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    sectionKey="wp"
                    count={records.workshopPresent.length}
                    label="حضور"
                    colorClass="text-accent"
                    bgClass="bg-accent/10"
                    items={records.workshopPresent}
                    type="present"
                  />
                  <StatCard
                    sectionKey="wa"
                    count={records.workshopAbsent.length}
                    label="غياب"
                    colorClass="text-destructive"
                    bgClass="bg-destructive/10"
                    items={records.workshopAbsent}
                    type="absent"
                  />
                </div>
              </motion.div>

              {/* Total */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="ios-card p-4"
              >
                <h3 className="text-base font-semibold text-foreground mb-3">الإجمالي</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-primary/10 p-3 text-center">
                    <p className="text-2xl font-bold text-primary">
                      {records.lecturePresent.length + records.workshopPresent.length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">إجمالي الحضور</p>
                  </div>
                  <div className="rounded-xl bg-muted p-3 text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {records.lectureAbsent.length + records.workshopAbsent.length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">إجمالي الغياب</p>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : null}
        </div>

        {/* Delete */}
        <div className="px-4 pb-4">
          <button
            onClick={() => deletePerson(selectedPerson.id, selectedPerson.name)}
            className="w-full py-3 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>حذف الشخص</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <div className="px-4 pt-3 pb-2">
        <h1 className="text-2xl font-bold text-foreground mb-1">{title}</h1>
        <p className="text-sm text-muted-foreground mb-3">{subtitle}</p>

        <div className="flex gap-2 p-1 rounded-xl bg-secondary">
          <button
            onClick={() => setActiveCategory("muhadera")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeCategory === "muhadera"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            المحاضرة
          </button>
          <button
            onClick={() => setActiveCategory("warasha")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeCategory === "warasha"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            الورشة
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <p>جاري التحميل...</p>
          </div>
        ) : people.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-muted-foreground"
          >
            <Users className="w-10 h-10 mb-3 opacity-30" strokeWidth={1.5} />
            <p className="text-base font-medium">لا توجد أسماء بعد</p>
            <p className="text-sm mt-1">أضف الأسماء من الأسفل</p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
              {people.map((person, i) => {
                const initials = person.name.charAt(0);
                return (
                  <motion.div
                    key={person.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => openProfile(person)}
                    className="ios-card px-4 py-3.5 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-base font-bold text-primary">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[15px] font-medium text-foreground block truncate">{person.name}</span>
                      <span className="text-xs text-muted-foreground">اضغط لعرض الإحصائيات</span>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0" />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="px-4 pb-4 flex gap-2">
        <input
          type="text"
          placeholder="اسم الشخص"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addPerson()}
          className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={addPerson}
          className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-1.5"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة</span>
        </button>
      </div>
    </div>
  );
};

export default AttendancePage;
