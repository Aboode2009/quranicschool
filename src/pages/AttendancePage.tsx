import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Users, Plus, UserPlus, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface Person {
  id: string;
  name: string;
}

interface AttendanceRecord {
  person_id: string;
  is_present: boolean;
}

const AttendancePage = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [newName, setNewName] = useState("");
  const [lessonName, setLessonName] = useState("");
  const [lessonDate, setLessonDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPeople();
  }, []);

  useEffect(() => {
    if (lessonName && lessonDate && people.length > 0) {
      fetchAttendance();
    }
  }, [lessonName, lessonDate, people]);

  const fetchPeople = async () => {
    const { data, error } = await supabase
      .from("people")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      toast.error("خطأ في تحميل الأسماء");
      console.error(error);
    } else {
      setPeople(data || []);
    }
    setLoading(false);
  };

  const fetchAttendance = async () => {
    const { data, error } = await supabase
      .from("attendance")
      .select("person_id, is_present")
      .eq("lesson_name", lessonName)
      .eq("lesson_date", lessonDate);

    if (error) {
      console.error(error);
      return;
    }

    const map: Record<string, boolean> = {};
    (data || []).forEach((r: AttendanceRecord) => {
      map[r.person_id] = r.is_present;
    });
    setAttendance(map);
  };

  const addPerson = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    const { data, error } = await supabase
      .from("people")
      .insert({ name: trimmed })
      .select()
      .single();

    if (error) {
      toast.error("خطأ في إضافة الاسم");
      console.error(error);
    } else if (data) {
      setPeople((prev) => [...prev, data]);
      setNewName("");
      toast.success(`تمت إضافة ${trimmed}`);
    }
  };

  const toggleAttendance = (personId: string) => {
    setAttendance((prev) => ({
      ...prev,
      [personId]: !prev[personId],
    }));
  };

  const saveAttendance = async () => {
    if (!lessonName.trim()) {
      toast.error("أدخل اسم المحاضرة");
      return;
    }

    setSaving(true);

    // Delete existing records for this lesson/date, then insert fresh
    await supabase
      .from("attendance")
      .delete()
      .eq("lesson_name", lessonName)
      .eq("lesson_date", lessonDate);

    const records = people.map((p) => ({
      person_id: p.id,
      lesson_name: lessonName,
      lesson_date: lessonDate,
      is_present: attendance[p.id] ?? false,
    }));

    const { error } = await supabase.from("attendance").insert(records);

    if (error) {
      toast.error("خطأ في حفظ الحضور");
      console.error(error);
    } else {
      toast.success("تم حفظ الحضور بنجاح");
    }

    setSaving(false);
  };

  return (
    <div className="flex flex-col h-full" dir="rtl">
      {/* Header */}
      <div className="px-4 pt-3 pb-2">
        <h1 className="text-2xl font-bold text-foreground mb-3">الأسماء والحضور</h1>

        {/* Lesson info */}
        <div className="flex flex-col gap-2 mb-3">
          <input
            type="text"
            placeholder="اسم المحاضرة"
            value={lessonName}
            onChange={(e) => setLessonName(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="date"
            value={lessonDate}
            onChange={(e) => setLessonDate(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
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
            <p className="text-base font-medium">لا توجد أسماء بعد</p>
            <p className="text-sm mt-1">أضف أسماء الأشخاص أدناه</p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
              {people.map((person, i) => {
                const isPresent = attendance[person.id] ?? false;
                return (
                  <motion.div
                    key={person.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => toggleAttendance(person.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                      isPresent
                        ? "bg-accent/10 border-accent"
                        : "bg-card border-border"
                    }`}
                  >
                    <span className="text-sm font-medium text-foreground">{person.name}</span>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        isPresent
                          ? "bg-accent text-accent-foreground"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {isPresent ? (
                        <Check className="w-4 h-4" strokeWidth={2.5} />
                      ) : (
                        <X className="w-4 h-4" strokeWidth={2.5} />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="px-4 pb-4 flex flex-col gap-2">
        {/* Add person */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="إضافة شخص جديد"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addPerson()}
            className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={addPerson}
            className="px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold"
          >
            <UserPlus className="w-5 h-5" />
          </button>
        </div>

        {/* Save attendance */}
        <button
          onClick={saveAttendance}
          disabled={saving || !lessonName.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-base font-semibold shadow-sm disabled:opacity-50"
        >
          {saving ? "جاري الحفظ..." : "حفظ الحضور"}
        </button>
      </div>
    </div>
  );
};

export default AttendancePage;
