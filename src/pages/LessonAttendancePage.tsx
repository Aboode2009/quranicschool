import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Users, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Lesson } from "@/lib/quran-data";
import { formatSyriacDateString } from "@/lib/syriac-locale";
import { useAuth } from "@/hooks/useAuth";

interface Person {
  id: string;
  name: string;
}

type Status = "present" | "absent" | null;
type Timing = "on_time" | "late";
type Activity = "active" | "average" | "idle";
type Excuse = "with_excuse" | "without_excuse";

interface AttendanceDetail {
  status: Status;
  timing?: Timing;
  activity?: Activity;
  excuse?: Excuse;
}

interface LessonAttendancePageProps {
  lesson: Lesson;
  onBack: () => void;
  category?: string;
}

const LessonAttendancePage = ({ lesson, onBack, category = "muhadera" }: LessonAttendancePageProps) => {
  const { permissions } = useAuth();
  const [people, setPeople] = useState<Person[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceDetail>>({});
  const [expandedPerson, setExpandedPerson] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [lesson.id]);

  const fetchData = async () => {
    const { data: peopleData, error: peopleErr } = await supabase
      .from("people")
      .select("id, name")
      .eq("category", category)
      .order("created_at", { ascending: true });

    if (peopleErr) {
      toast.error("خطأ في تحميل الأسماء");
      setLoading(false);
      return;
    }

    const persons = peopleData || [];
    setPeople(persons);

    const { data: attData } = await supabase
      .from("attendance")
      .select("person_id, is_present, timing, activity, excuse")
      .eq("lesson_name", lesson.id);

    const map: Record<string, AttendanceDetail> = {};
    persons.forEach((p) => {
      map[p.id] = { status: null };
    });
    (attData || []).forEach((r: any) => {
      map[r.person_id] = {
        status: r.is_present ? "present" : "absent",
        timing: r.timing || undefined,
        activity: r.activity || undefined,
        excuse: r.excuse || undefined,
      };
    });

    setAttendance(map);
    setLoading(false);
  };

  const setStatus = (personId: string, status: Status) => {
    setAttendance((prev) => ({
      ...prev,
      [personId]: {
        status,
        timing: status === "present" ? "on_time" : undefined,
        activity: status === "present" ? "average" : undefined,
        excuse: status === "absent" ? "without_excuse" : undefined,
      },
    }));
    setExpandedPerson(personId);
  };

  const updateDetail = (personId: string, field: string, value: string) => {
    setAttendance((prev) => ({
      ...prev,
      [personId]: { ...prev[personId], [field]: value },
    }));
  };

  const toggleExpand = (personId: string) => {
    setExpandedPerson((prev) => (prev === personId ? null : personId));
  };

  const saveAttendance = async () => {
    setSaving(true);
    await supabase.from("attendance").delete().eq("lesson_name", lesson.id);

    const records = people.map((p) => {
      const detail = attendance[p.id];
      return {
        person_id: p.id,
        lesson_name: lesson.id,
        lesson_date: new Date().toISOString().split("T")[0],
        is_present: detail?.status === "present",
        timing: detail?.status === "present" ? (detail.timing || null) : null,
        activity: detail?.status === "present" ? (detail.activity || null) : null,
        excuse: detail?.status === "absent" ? (detail.excuse || null) : null,
      };
    });

    const { error } = await supabase.from("attendance").insert(records);
    if (error) {
      toast.error("خطأ في حفظ الحضور");
    } else {
      toast.success("تم حفظ الحضور ✓");
    }
    setSaving(false);
  };

  const presentCount = Object.values(attendance).filter((a) => a.status === "present").length;
  const absentCount = Object.values(attendance).filter((a) => a.status === "absent").length;

  const statusLabel = (detail: AttendanceDetail) => {
    if (!detail?.status) return "لم يُحدد";
    if (detail.status === "present") {
      const t = detail.timing === "late" ? "متأخر" : "على الوقت";
      const a = detail.activity === "active" ? "نشط" : detail.activity === "idle" ? "خامل" : "متوسط";
      return `حاضر · ${t} · ${a}`;
    }
    return detail.excuse === "with_excuse" ? "غائب بعذر" : "غائب بدون عذر";
  };

  const statusColor = (detail: AttendanceDetail) => {
    if (!detail?.status) return "bg-muted text-muted-foreground";
    if (detail.status === "present") return "bg-primary/10 text-primary border-primary/30";
    return "bg-destructive/10 text-destructive border-destructive/30";
  };

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
            <p className="text-xs text-muted-foreground">{formatSyriacDateString(lesson.date)}</p>
          </div>
        </div>

        {!loading && people.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-secondary mb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">حاضر</span>
              <span className="text-sm font-bold text-primary">{presentCount}</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">غائب</span>
              <span className="text-sm font-bold text-destructive">{absentCount}</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">الكل</span>
              <span className="text-sm font-bold text-foreground">{people.length}</span>
            </div>
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
                const detail = attendance[person.id] || { status: null };
                const isExpanded = expandedPerson === person.id;

                return (
                  <motion.div
                    key={person.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`rounded-2xl border overflow-hidden transition-all ${statusColor(detail)}`}
                  >
                    {/* Person row */}
                    <div
                      onClick={() => toggleExpand(person.id)}
                      className="flex items-center justify-between px-4 py-3.5 cursor-pointer active:scale-[0.98] transition-transform"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-[15px] font-semibold text-foreground block">
                          {person.name}
                        </span>
                        <span className="text-[11px] mt-0.5 block opacity-70">
                          {statusLabel(detail)}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </div>

                    {/* Expanded details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-3">
                            {/* Status selection */}
                            <div>
                              <p className="text-[11px] font-medium text-muted-foreground mb-1.5">الحالة</p>
                              <div className="flex gap-2">
                                <Chip
                                  label="حاضر"
                                  active={detail.status === "present"}
                                  activeClass="bg-primary text-primary-foreground"
                                  onClick={() => setStatus(person.id, "present")}
                                />
                                <Chip
                                  label="غائب"
                                  active={detail.status === "absent"}
                                  activeClass="bg-destructive text-destructive-foreground"
                                  onClick={() => setStatus(person.id, "absent")}
                                />
                              </div>
                            </div>

                            {/* Present sub-options */}
                            {detail.status === "present" && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-3"
                              >
                                <div>
                                  <p className="text-[11px] font-medium text-muted-foreground mb-1.5">الوقت</p>
                                  <div className="flex gap-2">
                                    <Chip
                                      label="على الوقت"
                                      active={detail.timing === "on_time"}
                                      activeClass="bg-primary text-primary-foreground"
                                      onClick={() => updateDetail(person.id, "timing", "on_time")}
                                    />
                                    <Chip
                                      label="متأخر"
                                      active={detail.timing === "late"}
                                      activeClass="bg-accent text-accent-foreground"
                                      onClick={() => updateDetail(person.id, "timing", "late")}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[11px] font-medium text-muted-foreground mb-1.5">النشاط</p>
                                  <div className="flex gap-2">
                                    <Chip
                                      label="نشط"
                                      active={detail.activity === "active"}
                                      activeClass="bg-primary text-primary-foreground"
                                      onClick={() => updateDetail(person.id, "activity", "active")}
                                    />
                                    <Chip
                                      label="متوسط"
                                      active={detail.activity === "average"}
                                      activeClass="bg-accent text-accent-foreground"
                                      onClick={() => updateDetail(person.id, "activity", "average")}
                                    />
                                    <Chip
                                      label="خامل"
                                      active={detail.activity === "idle"}
                                      activeClass="bg-destructive text-destructive-foreground"
                                      onClick={() => updateDetail(person.id, "activity", "idle")}
                                    />
                                  </div>
                                </div>
                              </motion.div>
                            )}

                            {/* Absent sub-options */}
                            {detail.status === "absent" && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                              >
                                <p className="text-[11px] font-medium text-muted-foreground mb-1.5">نوع الغياب</p>
                                <div className="flex gap-2">
                                  <Chip
                                    label="بعذر"
                                    active={detail.excuse === "with_excuse"}
                                    activeClass="bg-accent text-accent-foreground"
                                    onClick={() => updateDetail(person.id, "excuse", "with_excuse")}
                                  />
                                  <Chip
                                    label="بدون عذر"
                                    active={detail.excuse === "without_excuse"}
                                    activeClass="bg-destructive text-destructive-foreground"
                                    onClick={() => updateDetail(person.id, "excuse", "without_excuse")}
                                  />
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

      {/* Save button */}
      {people.length > 0 && (
        <div className="px-4 pb-4">
          <button
            onClick={saveAttendance}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-base font-semibold shadow-sm disabled:opacity-50 active:scale-[0.98] transition-transform"
          >
            {saving ? "جاري الحفظ..." : "حفظ الحضور"}
          </button>
        </div>
      )}
    </div>
  );
};

/* Reusable chip button */
const Chip = ({
  label,
  active,
  activeClass,
  onClick,
}: {
  label: string;
  active: boolean;
  activeClass: string;
  onClick: () => void;
}) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
      active ? activeClass : "bg-secondary text-secondary-foreground"
    }`}
  >
    {label}
  </button>
);

export default LessonAttendancePage;
