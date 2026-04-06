import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Plus, Zap, Users, ChevronDown,
  Calendar, Trash2, ArrowRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { formatSyriacDateString } from "@/lib/syriac-locale";

const WORKSHOP_NUMBERS = [
  "ورشة أولى", "ورشة ثانية", "ورشة ثالثة", "ورشة رابعة", "ورشة خامسة",
] as const;

interface Activity {
  id: string;
  name: string;
  date: string;
  workshop_number: string;
  created_by: string | null;
  created_at: string;
}

interface Person {
  id: string;
  name: string;
  workshop_number: string | null;
}

interface PersonResponse {
  is_present: boolean;
  excuse: string | null;
  is_active: boolean;
}

// ─── Chip ─────────────────────────────────────────────────
const Chip = ({ label, active, activeClass, onClick }: {
  label: string; active: boolean; activeClass: string; onClick: () => void;
}) => (
  <button
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
      active ? activeClass : "bg-secondary text-secondary-foreground"
    }`}
  >
    {label}
  </button>
);

// ─── صفحة تفاصيل الفعالية ──────
const ActivityDetailPage = ({
  activity, onBack,
}: { activity: Activity; onBack: () => void }) => {
  const [people, setPeople] = useState<Person[]>([]);
  const [responses, setResponses] = useState<Record<string, PersonResponse>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => { fetchData(); }, [activity.id]);

  const fetchData = async () => {
    setLoading(true);
    const [peopleRes, respRes] = await Promise.all([
      supabase.from("people")
        .select("id, name, workshop_number")
        .eq("category", "warasha")
        .eq("workshop_number", activity.workshop_number)
        .order("created_at", { ascending: true }),
      supabase.from("electronic_activity_responses")
        .select("person_id, is_active, is_present, excuse")
        .eq("activity_id", activity.id),
    ]);

    const persons = (peopleRes.data || []) as Person[];
    setPeople(persons);

    const map: Record<string, PersonResponse> = {};
    persons.forEach((p) => {
      map[p.id] = { is_present: false, excuse: null, is_active: false };
    });

    let matched = 0;
    (respRes.data || []).forEach((r: any) => {
      if (map[r.person_id] !== undefined) {
        matched++;
        map[r.person_id] = {
          is_present: r.is_present ?? false,
          excuse: r.excuse || null,
          is_active: r.is_active ?? false,
        };
      }
    });

    setResponses(map);
    setIsEditing(matched > 0);
    setLoading(false);
  };

  const setPresent = (personId: string, present: boolean) => {
    setResponses((prev) => ({
      ...prev,
      [personId]: {
        ...prev[personId],
        is_present: present,
        excuse: present ? null : prev[personId]?.excuse || null,
        is_active: present ? prev[personId]?.is_active || false : false,
      },
    }));
  };

  const setExcuse = (personId: string, excuse: string) => {
    setResponses((prev) => ({
      ...prev,
      [personId]: { ...prev[personId], excuse },
    }));
  };

  const setActive = (personId: string, active: boolean) => {
    setResponses((prev) => ({
      ...prev,
      [personId]: { ...prev[personId], is_active: active },
    }));
    setExpanded(null);
  };

  const save = async () => {
    setSaving(true);
    await supabase.from("electronic_activity_responses").delete().eq("activity_id", activity.id);
    const records = people.map((p) => ({
      activity_id: activity.id,
      person_id: p.id,
      is_present: responses[p.id]?.is_present ?? false,
      excuse: responses[p.id]?.excuse || null,
      is_active: responses[p.id]?.is_active ?? false,
    }));
    if (records.length > 0) {
      const { error } = await supabase.from("electronic_activity_responses").insert(records);
      if (error) { toast.error("خطأ في الحفظ"); setSaving(false); return; }
    }
    toast.success("تم الحفظ ✓");
    setSaving(false);
    setIsEditing(true);
  };

  const presentCount = Object.values(responses).filter((v) => v.is_present).length;
  const absentCount = people.length - presentCount;
  const activeCount = Object.values(responses).filter((v) => v.is_present && v.is_active).length;
  const inactiveCount = Object.values(responses).filter((v) => v.is_present && !v.is_active).length;

  const statusColor = (r: PersonResponse) => {
    if (r.is_present && r.is_active) return "bg-green-100 text-green-800 border-green-400 dark:bg-green-900/40 dark:text-green-300 dark:border-green-600";
    if (r.is_present && !r.is_active) return "bg-orange-100 text-orange-800 border-orange-400 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-600";
    if (!r.is_present) return "bg-red-100 text-red-800 border-red-400 dark:bg-red-900/40 dark:text-red-300 dark:border-red-600";
    return "bg-muted/50 text-muted-foreground border-border";
  };

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">{activity.name}</h1>
            <p className="text-xs text-muted-foreground">
              {formatSyriacDateString(activity.date)} · {activity.workshop_number}
            </p>
          </div>
        </div>

        {!loading && people.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-secondary mb-1 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">حاضر</span>
              <span className="text-sm font-bold text-green-500">{presentCount}</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">غائب</span>
              <span className="text-sm font-bold text-destructive">{absentCount}</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">متفاعل</span>
              <span className="text-sm font-bold text-primary">{activeCount}</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">الكل</span>
              <span className="text-sm font-bold text-foreground">{people.length}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground"><p>جاري التحميل...</p></div>
        ) : people.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Users className="w-10 h-10 mb-3 opacity-30" strokeWidth={1.5} />
            <p className="text-base font-medium">لا يوجد طلاب في هذه الورشة</p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
              {people.map((person, i) => {
                const r = responses[person.id] || { is_present: false, excuse: null, is_active: false };
                const isExp = expanded === person.id;
                const label = r.is_present
                  ? (r.is_active ? "حاضر · متفاعل" : "حاضر · غير متفاعل")
                  : (r.excuse === "with_excuse" ? "غائب · بعذر" : r.excuse === "without_excuse" ? "غائب · بدون عذر" : "غائب");
                return (
                  <motion.div key={person.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`rounded-2xl border overflow-hidden transition-all ${statusColor(r)}`}>
                    <div onClick={() => setExpanded(isExp ? null : person.id)}
                      className="flex items-center justify-between px-4 py-3.5 cursor-pointer active:scale-[0.98] transition-transform">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          r.is_present ? (r.is_active ? "bg-green-500" : "bg-orange-500") : "bg-red-500"
                        }`} />
                        <div className="min-w-0">
                          <span className="text-[15px] font-semibold text-foreground block">{person.name}</span>
                          <span className="text-[11px] mt-0.5 block opacity-70">{label}</span>
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExp ? "rotate-180" : ""}`} />
                    </div>

                    <AnimatePresence>
                      {isExp && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                          <div className="px-4 pb-4 flex flex-col gap-3">
                            {/* الخطوة 1: الحضور */}
                            <div>
                              <p className="text-[11px] font-medium text-muted-foreground mb-1.5">الحضور</p>
                              <div className="flex gap-2">
                                <Chip label="حاضر" active={r.is_present} activeClass="bg-green-500 text-white" onClick={() => setPresent(person.id, true)} />
                                <Chip label="غائب" active={!r.is_present} activeClass="bg-destructive text-destructive-foreground" onClick={() => setPresent(person.id, false)} />
                              </div>
                            </div>

                            {/* إذا غائب: سبب الغياب */}
                            {!r.is_present && (
                              <div>
                                <p className="text-[11px] font-medium text-muted-foreground mb-1.5">سبب الغياب</p>
                                <div className="flex gap-2">
                                  <Chip label="بعذر" active={r.excuse === "with_excuse"} activeClass="bg-amber-500 text-white" onClick={() => setExcuse(person.id, "with_excuse")} />
                                  <Chip label="بدون عذر" active={r.excuse === "without_excuse"} activeClass="bg-destructive text-destructive-foreground" onClick={() => setExcuse(person.id, "without_excuse")} />
                                </div>
                              </div>
                            )}

                            {/* إذا حاضر: حالة التفاعل */}
                            {r.is_present && (
                              <div>
                                <p className="text-[11px] font-medium text-muted-foreground mb-1.5">حالة التفاعل</p>
                                <div className="flex gap-2">
                                  <Chip label="متفاعل" active={r.is_active} activeClass="bg-green-500 text-white" onClick={() => setActive(person.id, true)} />
                                  <Chip label="غير متفاعل" active={!r.is_active} activeClass="bg-orange-500 text-white" onClick={() => setActive(person.id, false)} />
                                </div>
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
        )}
      </div>

      {people.length > 0 && (
        <div className="px-4 pb-4">
          <button onClick={save} disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-base font-semibold shadow-sm disabled:opacity-50 active:scale-[0.98] transition-transform">
            {saving ? "جاري الحفظ..." : isEditing ? "تعديل البيانات" : "حفظ البيانات"}
          </button>
        </div>
      )}
    </div>
  );
};

// ─── الصفحة الرئيسية ──────────────────────────────────────
const ElectronicInteractionPage = ({ onBack }: { onBack: () => void }) => {
  const { user, userRole, supervisedWorkshop } = useAuth();
  const isAdmin = userRole === "admin" || userRole === "course_director";
  const isSupervisor = userRole === "supervisor";

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  // فورم الإضافة
  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [newWorkshop, setNewWorkshop] = useState(supervisedWorkshop || "");

  useEffect(() => { fetchActivities(); }, []);

  const fetchActivities = async () => {
    setLoading(true);
    let query = supabase.from("electronic_activities").select("*").order("date", { ascending: false });

    // المشرف يشوف فقط فعاليات ورشته
    if (isSupervisor && supervisedWorkshop) {
      query = query.eq("workshop_number", supervisedWorkshop);
    }
    // الأدمن يشوف الكل
    const { data, error } = await query;
    if (!error) setActivities((data as Activity[]) || []);
    setLoading(false);
  };

  const addActivity = async () => {
    if (!newName.trim()) { toast.error("اكتب اسم الفعالية"); return; }
    if (!newDate) { toast.error("اختر التاريخ"); return; }
    if (!newWorkshop) { toast.error("اختر الورشة"); return; }

    const { data, error } = await supabase
      .from("electronic_activities")
      .insert({ name: newName.trim(), date: newDate, workshop_number: newWorkshop, created_by: user?.id || null })
      .select().single();

    if (error) { toast.error("خطأ في الإضافة"); return; }
    setActivities((prev) => [data as Activity, ...prev]);
    setNewName(""); setNewDate(new Date().toISOString().split("T")[0]);
    setNewWorkshop(supervisedWorkshop || ""); setShowAdd(false);
    toast.success("تمت إضافة الفعالية ✓");
  };

  const deleteActivity = async (id: string) => {
    const { error } = await supabase.from("electronic_activities").delete().eq("id", id);
    if (error) { toast.error("خطأ في الحذف"); return; }
    setActivities((prev) => prev.filter((a) => a.id !== id));
    toast.success("تم الحذف");
  };

  const inputClass = "w-full px-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30";

  if (selectedActivity) {
    return <ActivityDetailPage activity={selectedActivity} onBack={() => { setSelectedActivity(null); fetchActivities(); }} />;
  }

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <div className="px-4 pt-3 pb-2">
        <button onClick={onBack} className="flex items-center gap-1 text-primary text-sm font-medium mb-3">
          <ChevronLeft className="w-4 h-4 rotate-180" /><span>رجوع</span>
        </button>
        <h1 className="text-2xl font-bold text-foreground mb-1">التفاعل الإلكتروني</h1>
        <p className="text-sm text-muted-foreground mb-3">فعاليات التفاعل لكل ورشة</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* فورم الإضافة */}
        <AnimatePresence>
          {showAdd && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} className="ios-card px-4 py-4 flex flex-col gap-3 mb-3">
              <p className="text-sm font-bold text-foreground">فعالية جديدة ⚡</p>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                placeholder="اسم الفعالية *" autoFocus className={inputClass} />
              <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className={inputClass} />

              {/* اختيار الورشة — الأدمن يختار، المشرف ورشته تلقائياً */}
              {isAdmin ? (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">الورشة *</p>
                  <div className="flex flex-wrap gap-2">
                    {WORKSHOP_NUMBERS.map((ws) => (
                      <button key={ws} type="button" onClick={() => setNewWorkshop(ws)}
                        className={`px-3 py-2 rounded-lg text-xs transition-colors ${
                          newWorkshop === ws ? "bg-primary text-primary-foreground font-medium" : "bg-muted/50 text-foreground"
                        }`}>{ws}</button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="px-3 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium">
                  {supervisedWorkshop || "ورشتك"}
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={addActivity} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold active:scale-[0.97] transition-transform">إضافة</button>
                <button onClick={() => { setShowAdd(false); setNewName(""); }}
                  className="px-4 py-2.5 rounded-xl bg-secondary text-muted-foreground text-sm font-semibold">إلغاء</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground"><p>جاري التحميل...</p></div>
        ) : activities.length === 0 && !showAdd ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Zap className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-base font-medium">لا توجد فعاليات بعد</p>
            <p className="text-sm mt-1">اضغط + لإضافة فعالية جديدة</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
              {activities.map((act, i) => (
                <motion.div key={act.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40 }} transition={{ delay: i * 0.03 }}
                  className="ios-card px-4 py-3.5 flex items-center gap-3">
                  <div onClick={() => setSelectedActivity(act)}
                    className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-transform">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedActivity(act)}>
                    <p className="text-[15px] font-semibold text-foreground truncate">{act.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-muted-foreground">{formatSyriacDateString(act.date)}</p>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">{act.workshop_number}</span>
                    </div>
                  </div>
                  {(isAdmin) && (
                    <button onClick={() => deleteActivity(act.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-destructive/10 text-destructive shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0 rotate-180 cursor-pointer" onClick={() => setSelectedActivity(act)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {!showAdd && (
        <div className="px-4 pb-4">
          <button onClick={() => setShowAdd(true)}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.97] transition-transform">
            <Plus className="w-5 h-5" /> إضافة فعالية جديدة
          </button>
        </div>
      )}
    </div>
  );
};

export default ElectronicInteractionPage;
