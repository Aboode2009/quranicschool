import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, X, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Lesson } from "@/lib/quran-data";

interface Person {
  id: string;
  name: string;
}

interface LessonAttendancePageProps {
  lesson: Lesson;
  onBack: () => void;
}

const LessonAttendancePage = ({ lesson, onBack }: LessonAttendancePageProps) => {
  const [people, setPeople] = useState<Person[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [lesson.id]);

  const fetchData = async () => {
    // Fetch all people
    const { data: peopleData, error: peopleErr } = await supabase
      .from("people")
      .select("id, name")
      .order("created_at", { ascending: true });

    if (peopleErr) {
      toast.error("خطأ في تحميل الأسماء");
      setLoading(false);
      return;
    }

    const persons = peopleData || [];
    setPeople(persons);

    // Fetch existing attendance for this lesson
    const { data: attData } = await supabase
      .from("attendance")
      .select("person_id, is_present")
      .eq("lesson_name", lesson.id);

    const map: Record<string, boolean> = {};
    // Initialize everyone as absent
    persons.forEach((p) => { map[p.id] = false; });
    // Override with existing records
    (attData || []).forEach((r) => { map[r.person_id] = r.is_present; });

    setAttendance(map);
    setLoading(false);
  };

  const toggle = (personId: string) => {
    setAttendance((prev) => ({ ...prev, [personId]: !prev[personId] }));
  };

  const saveAttendance = async () => {
    setSaving(true);

    // Delete existing then re-insert
    await supabase
      .from("attendance")
      .delete()
      .eq("lesson_name", lesson.id);

    const records = people.map((p) => ({
      person_id: p.id,
      lesson_name: lesson.id,
      lesson_date: new Date().toISOString().split("T")[0],
      is_present: attendance[p.id] ?? false,
    }));

    const { error } = await supabase.from("attendance").insert(records);

    if (error) {
      toast.error("خطأ في حفظ الحضور");
    } else {
      toast.success("تم حفظ الحضور ✓");
    }

    setSaving(false);
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const totalCount = people.length;

  return (
    <div className="flex flex-col h-full" dir="rtl">
      {/* Header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-secondary text-secondary-foreground"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">{lesson.surahName}</h1>
            <p className="text-xs text-muted-foreground">{lesson.date}</p>
          </div>
        </div>

        {/* Summary bar */}
        {!loading && totalCount > 0 && (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-secondary mb-1">
            <span className="text-sm text-muted-foreground">الحضور</span>
            <span className="text-sm font-bold text-foreground">
              {presentCount} / {totalCount}
            </span>
          </div>
        )}
      </div>

      {/* People list */}
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
            <p className="text-base font-medium">لا توجد أسماء مضافة</p>
            <p className="text-sm mt-1">أضف أسماء من تبويب الأسماء أولاً</p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
              {people.map((person, i) => {
                const isPresent = attendance[person.id] ?? false;
                return (
                  <motion.div
                    key={person.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => toggle(person.id)}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-2xl border cursor-pointer transition-all active:scale-[0.98] ${
                      isPresent
                        ? "bg-primary/8 border-primary/30"
                        : "bg-card border-border"
                    }`}
                  >
                    <span className="text-[15px] font-medium text-foreground">
                      {person.name}
                    </span>
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        isPresent
                          ? "bg-primary text-primary-foreground"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {isPresent ? (
                        <Check className="w-5 h-5" strokeWidth={2.5} />
                      ) : (
                        <X className="w-5 h-5" strokeWidth={2.5} />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Save button */}
      {people.length > 0 && (
        <div className="px-4 pb-4">
          <button
            onClick={saveAttendance}
            disabled={saving}
            className="ios-button w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-base font-semibold shadow-sm disabled:opacity-50"
          >
            {saving ? "جاري الحفظ..." : "حفظ الحضور"}
          </button>
        </div>
      )}
    </div>
  );
};

export default LessonAttendancePage;
