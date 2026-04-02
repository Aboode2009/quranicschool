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
  workshop_number?: string | null;
}

type Status = "present" | "absent" | null;

interface CustomQuestion {
  id: string;
  question_text: string;
  options: string[];
  sort_order: number;
}

interface WorkshopDetail {
  status: Status;
  readMaterial: string; // 'yes' | 'no' | 'incomplete'
  listenedLecture: boolean;
  extractedVerse: boolean;
  excuse?: "with_excuse" | "without_excuse";
  timing?: "on_time" | "late";
  customAnswers: Record<string, string>; // question_id -> answer
}

interface WorkshopAttendancePageProps {
  lesson: Lesson;
  onBack: () => void;
}

const WorkshopAttendancePage = ({ lesson, onBack }: WorkshopAttendancePageProps) => {
  const { permissions, userRole, supervisedWorkshop } = useAuth();
  const [people, setPeople] = useState<Person[]>([]);
  const [attendance, setAttendance] = useState<Record<string, WorkshopDetail>>({});
  const [expandedPerson, setExpandedPerson] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);

  useEffect(() => {
    fetchData();
  }, [lesson.id]);

  const fetchData = async () => {
    let peopleQuery = supabase.from("people").select("id, name, workshop_number").eq("category", "warasha");
    
    // المشرف يشوف فقط طلاب ورشته
    if (userRole === "supervisor" && supervisedWorkshop) {
      peopleQuery = peopleQuery.eq("workshop_number", supervisedWorkshop);
    }
    
    const [peopleRes, questionsRes] = await Promise.all([
      peopleQuery.order("created_at", { ascending: true }),
      supabase.from("workshop_questions").select("*").order("sort_order", { ascending: true }),
    ]);

    if (peopleRes.error) {
      toast.error("خطأ في تحميل الأسماء");
      setLoading(false);
      return;
    }

    const persons = peopleRes.data || [];
    setPeople(persons);

    const questions = (questionsRes.data || []).map((q: any) => ({
      ...q,
      options: Array.isArray(q.options) ? q.options : [],
    }));
    setCustomQuestions(questions);

    const [attRes, answersRes] = await Promise.all([
      supabase.from("attendance")
        .select("person_id, is_present, read_material, read_material_status, listened_lecture, extracted_verse, excuse, timing")
        .eq("lesson_name", lesson.id),
      supabase.from("workshop_answers")
        .select("person_id, question_id, answer")
        .eq("lesson_name", lesson.id),
    ]);

    const answersMap: Record<string, Record<string, string>> = {};
    (answersRes.data || []).forEach((a: any) => {
      if (!answersMap[a.person_id]) answersMap[a.person_id] = {};
      answersMap[a.person_id][a.question_id] = a.answer;
    });

    const map: Record<string, WorkshopDetail> = {};
    persons.forEach((p) => {
      map[p.id] = { status: null, readMaterial: "no", listenedLecture: false, extractedVerse: false, customAnswers: {} };
    });
    (attRes.data || []).forEach((r: any) => {
      const readStatus = r.read_material_status || (r.read_material ? "yes" : "no");
      map[r.person_id] = {
        status: r.is_present ? "present" : "absent",
        readMaterial: readStatus,
        listenedLecture: r.listened_lecture || false,
        extractedVerse: r.extracted_verse || false,
        excuse: r.excuse || undefined,
        timing: r.timing || undefined,
        customAnswers: answersMap[r.person_id] || {},
      };
    });

    setAttendance(map);
    setIsEditing((attRes.data || []).length > 0);
    setLoading(false);
  };

  const setStatus = (personId: string, status: Status) => {
    setAttendance((prev) => ({
      ...prev,
      [personId]: {
        ...prev[personId],
        status,
        excuse: status === "absent" ? "without_excuse" : undefined,
      },
    }));
    setExpandedPerson(personId);
  };

  const setField = (personId: string, field: keyof WorkshopDetail, value: any) => {
    setAttendance((prev) => ({
      ...prev,
      [personId]: { ...prev[personId], [field]: value },
    }));
  };

  const setCustomAnswer = (personId: string, questionId: string, answer: string) => {
    setAttendance((prev) => ({
      ...prev,
      [personId]: {
        ...prev[personId],
        customAnswers: { ...prev[personId].customAnswers, [questionId]: answer },
      },
    }));
  };

  const toggleExpand = (personId: string) => {
    setExpandedPerson((prev) => (prev === personId ? null : personId));
  };

  const saveAttendance = async () => {
    setSaving(true);

    // Delete old attendance and answers
    await Promise.all([
      supabase.from("attendance").delete().eq("lesson_name", lesson.id),
      supabase.from("workshop_answers").delete().eq("lesson_name", lesson.id),
    ]);

    const records = people.map((p) => {
      const detail = attendance[p.id];
      const isPresent = detail?.status === "present";
      return {
        person_id: p.id,
        lesson_name: lesson.id,
        lesson_date: new Date().toISOString().split("T")[0],
        is_present: isPresent,
        read_material: isPresent ? detail?.readMaterial === "yes" : false,
        read_material_status: isPresent ? (detail?.readMaterial || "no") : null,
        listened_lecture: isPresent ? (detail?.listenedLecture || false) : false,
        extracted_verse: isPresent ? (detail?.extractedVerse || false) : false,
        excuse: detail?.status === "absent" ? (detail?.excuse || null) : null,
        timing: isPresent ? (detail?.timing || null) : null,
        workshop_number: p.workshop_number || null,
      };
    });

    // Collect custom answers
    const answerRecords: { person_id: string; lesson_name: string; question_id: string; answer: string }[] = [];
    people.forEach((p) => {
      const detail = attendance[p.id];
      if (detail?.status === "present" && detail.customAnswers) {
        Object.entries(detail.customAnswers).forEach(([qId, ans]) => {
          if (ans) {
            answerRecords.push({ person_id: p.id, lesson_name: lesson.id, question_id: qId, answer: ans });
          }
        });
      }
    });

    const attResult = await supabase.from("attendance").insert(records);
    let ansResult: any = { error: null };
    if (answerRecords.length > 0) {
      ansResult = await supabase.from("workshop_answers").insert(answerRecords);
    }

    if (attResult.error || ansResult.error) {
      toast.error("خطأ في حفظ الحضور");
    } else {
      toast.success("تم حفظ الحضور ✓");
    }
    setSaving(false);
  };

  const presentCount = Object.values(attendance).filter((a) => a.status === "present").length;
  const absentCount = Object.values(attendance).filter((a) => a.status === "absent").length;

  const statusLabel = (detail: WorkshopDetail) => {
    if (!detail?.status) return "لم يُحدد";
    if (detail.status === "present") {
      const parts: string[] = ["حاضر"];
      if (detail.timing === "late") parts.push("متأخر");
      if (detail.readMaterial === "yes") parts.push("قرأ المادة");
      else if (detail.readMaterial === "incomplete") parts.push("لم يكمل المادة");
      
      if (detail.extractedVerse) parts.push("استخرج آية");
      return parts.join(" · ");
    }
    return detail.excuse === "with_excuse" ? "غائب بعذر" : "غائب بدون عذر";
  };

  const statusColor = (detail: WorkshopDetail) => {
    if (!detail?.status) return "bg-muted/50 text-muted-foreground border-border";
    if (detail.status === "present") return "bg-green-100 text-green-800 border-green-400 dark:bg-green-900/40 dark:text-green-300 dark:border-green-600";
    return "bg-red-100 text-red-800 border-red-400 dark:bg-red-900/40 dark:text-red-300 dark:border-red-600";
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
                const detail = attendance[person.id] || { status: null, readMaterial: "no", listenedLecture: false, extractedVerse: false, customAnswers: {} };
                const isExpanded = expandedPerson === person.id;

                return (
                  <motion.div
                    key={person.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`rounded-2xl border overflow-hidden transition-all ${statusColor(detail)}`}
                  >
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
                            {/* Status */}
                            <div>
                              <p className="text-[11px] font-medium text-muted-foreground mb-1.5">الحالة</p>
                              <div className="flex gap-2">
                                <Chip label="حاضر" active={detail.status === "present"} activeClass="bg-primary text-primary-foreground" onClick={() => setStatus(person.id, "present")} />
                                <Chip label="غائب" active={detail.status === "absent"} activeClass="bg-destructive text-destructive-foreground" onClick={() => setStatus(person.id, "absent")} />
                              </div>
                            </div>

                            {/* Present details */}
                            {detail.status === "present" && (
                              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                                {/* Timing */}
                                <div>
                                  <p className="text-[11px] font-medium text-muted-foreground mb-1.5">التوقيت</p>
                                  <div className="flex gap-2">
                                    <Chip label="على الوقت" active={detail.timing === "on_time"} activeClass="bg-green-500 text-white" onClick={() => setField(person.id, "timing", "on_time")} />
                                    <Chip label="متأخر" active={detail.timing === "late"} activeClass="bg-orange-500 text-white" onClick={() => setField(person.id, "timing", "late")} />
                                  </div>
                                </div>

                                {/* Read material - 3 options */}
                                <div>
                                  <p className="text-[11px] font-medium text-muted-foreground mb-1.5">هل قرأ المادة؟</p>
                                  <div className="flex gap-2 flex-wrap">
                                    <Chip label="نعم" active={detail.readMaterial === "yes"} activeClass="bg-green-500 text-white" onClick={() => setField(person.id, "readMaterial", "yes")} />
                                    <Chip label="لم يكمل" active={detail.readMaterial === "incomplete"} activeClass="bg-orange-500 text-white" onClick={() => setField(person.id, "readMaterial", "incomplete")} />
                                    <Chip label="لا" active={detail.readMaterial === "no"} activeClass="bg-destructive text-destructive-foreground" onClick={() => setField(person.id, "readMaterial", "no")} />
                                  </div>
                                </div>

                                {/* Extracted verse */}
                                <div>
                                  <p className="text-[11px] font-medium text-muted-foreground mb-1.5">هل استخرج آية؟</p>
                                  <div className="flex gap-2">
                                    <Chip label="استخرج" active={detail.extractedVerse === true} activeClass="bg-primary text-primary-foreground" onClick={() => setField(person.id, "extractedVerse", true)} />
                                    <Chip label="لا" active={detail.extractedVerse === false} activeClass="bg-destructive text-destructive-foreground" onClick={() => setField(person.id, "extractedVerse", false)} />
                                  </div>
                                </div>

                                {/* Custom questions */}
                                {customQuestions.map((q) => (
                                  <div key={q.id}>
                                    <p className="text-[11px] font-medium text-muted-foreground mb-1.5">{q.question_text}</p>
                                    <div className="flex gap-2 flex-wrap">
                                      {q.options.map((opt) => (
                                        <Chip
                                          key={opt}
                                          label={opt}
                                          active={detail.customAnswers[q.id] === opt}
                                          activeClass="bg-primary text-primary-foreground"
                                          onClick={() => setCustomAnswer(person.id, q.id, opt)}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </motion.div>
                            )}

                            {/* Excuse - only when absent */}
                            {detail.status === "absent" && (
                              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                                <p className="text-[11px] font-medium text-muted-foreground mb-1.5">نوع الغياب</p>
                                <div className="flex gap-2">
                                  <Chip label="بعذر" active={detail.excuse === "with_excuse"} activeClass="bg-accent text-accent-foreground" onClick={() => setField(person.id, "excuse", "with_excuse")} />
                                  <Chip label="بدون عذر" active={detail.excuse === "without_excuse"} activeClass="bg-destructive text-destructive-foreground" onClick={() => setField(person.id, "excuse", "without_excuse")} />
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
      {people.length > 0 && !permissions.isReadOnly && (
        <div className="px-4 pb-4">
          <button
            onClick={saveAttendance}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-base font-semibold shadow-sm disabled:opacity-50 active:scale-[0.98] transition-transform"
          >
            {saving ? "جاري الحفظ..." : isEditing ? "تعديل الحضور" : "حفظ الحضور"}
          </button>
        </div>
      )}
    </div>
  );
};

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

export default WorkshopAttendancePage;
