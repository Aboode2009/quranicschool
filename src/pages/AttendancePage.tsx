import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Users, UserPlus, Trash2, BookOpen, GraduationCap, ChevronLeft, ChevronDown, Calendar, Download, Phone, MapPin, Plus, Pencil, X, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import type { Lesson } from "@/lib/quran-data";
import { useAuth } from "@/hooks/useAuth";
import IslamicDecorations from "@/components/IslamicDecorations";

interface Person {
  id: string;
  name: string;
  category: string;
  phone?: string | null;
  address?: string | null;
  birth_date?: string | null;
  join_date?: string | null;
  education_level?: string | null;
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
  const { permissions } = useAuth();
  const [activeCategory, setActiveCategory] = useState<"muhadera" | "warasha">("muhadera");
  const [people, setPeople] = useState<Person[]>([]);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newBirthDate, setNewBirthDate] = useState("");
  const [newJoinDate, setNewJoinDate] = useState("");
  const [newEducation, setNewEducation] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [records, setRecords] = useState<CategorizedRecords | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [detailView, setDetailView] = useState<{ items: AttendanceRecord[]; type: "present" | "absent"; label: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Person>>({});

  // Lookup maps for lesson/workshop names
  const [lessonMap, setLessonMap] = useState<Record<string, Lesson>>({});
  const [workshopMap, setWorkshopMap] = useState<Record<string, Lesson>>({});

  useEffect(() => {
    fetchPeople();
  }, [activeCategory]);

  useEffect(() => {
    const fetchLessonMaps = async () => {
      const [lessonsRes, workshopsRes] = await Promise.all([
        supabase.from("lessons").select("id, surah_name, from_ayah, to_ayah, lesson_date, notes, status").eq("category", "muhadera"),
        supabase.from("lessons").select("id, surah_name, from_ayah, to_ayah, lesson_date, notes, status").eq("category", "warasha"),
      ]);
      const lMap: Record<string, Lesson> = {};
      (lessonsRes.data || []).forEach((l: any) => {
        lMap[l.id] = { id: l.id, surahName: l.surah_name, fromAyah: l.from_ayah, toAyah: l.to_ayah, date: l.lesson_date, notes: l.notes, status: l.status };
      });
      const wMap: Record<string, Lesson> = {};
      (workshopsRes.data || []).forEach((w: any) => {
        wMap[w.id] = { id: w.id, surahName: w.surah_name, fromAyah: w.from_ayah, toAyah: w.to_ayah, date: w.lesson_date, notes: w.notes, status: w.status };
      });
      setLessonMap(lMap);
      setWorkshopMap(wMap);
    };
    fetchLessonMaps();
  }, []);

  const fetchPeople = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("people")
      .select("id, name, category, phone, address, birth_date, join_date, education_level")
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

    const insertData: any = { name: trimmed, category: activeCategory };
    if (newPhone.trim()) insertData.phone = newPhone.trim();
    if (newAddress.trim()) insertData.address = newAddress.trim();
    if (newBirthDate) insertData.birth_date = newBirthDate;
    if (newJoinDate) insertData.join_date = newJoinDate;
    if (newEducation.trim()) insertData.education_level = newEducation.trim();

    const { data, error } = await supabase
      .from("people")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      toast.error("خطأ في إضافة الاسم");
    } else if (data) {
      setPeople((prev) => [...prev, data]);
      setNewName("");
      setNewPhone("");
      setNewAddress("");
      setNewBirthDate("");
      setNewJoinDate("");
      setNewEducation("");
      setShowAddForm(false);
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

  const startEditing = (person: Person) => {
    setEditData({
      name: person.name,
      phone: person.phone || "",
      address: person.address || "",
      birth_date: person.birth_date || "",
      join_date: person.join_date || "",
      education_level: person.education_level || "",
    });
    setIsEditing(true);
  };

  const updatePerson = async () => {
    if (!selectedPerson || !editData.name?.trim()) return;
    const updateData: any = {
      name: editData.name!.trim(),
      phone: editData.phone?.trim() || null,
      address: editData.address?.trim() || null,
      birth_date: editData.birth_date || null,
      join_date: editData.join_date || null,
      education_level: editData.education_level?.trim() || null,
    };
    const { error } = await supabase.from("people").update(updateData).eq("id", selectedPerson.id);
    if (error) {
      toast.error("خطأ في تحديث البيانات");
    } else {
      const updated = { ...selectedPerson, ...updateData };
      setSelectedPerson(updated);
      setPeople((prev) => prev.map((p) => p.id === updated.id ? updated : p));
      setIsEditing(false);
      toast.success("تم تحديث البيانات");
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

    // Refresh maps from DB
    const [lessonsRes, workshopsRes] = await Promise.all([
      supabase.from("lessons").select("id, surah_name, from_ayah, to_ayah, lesson_date, notes, status").eq("category", "muhadera"),
      supabase.from("lessons").select("id, surah_name, from_ayah, to_ayah, lesson_date, notes, status").eq("category", "warasha"),
    ]);
    const freshLessons = (lessonsRes.data || []).map((l: any) => ({ id: l.id, surahName: l.surah_name, fromAyah: l.from_ayah, toAyah: l.to_ayah, date: l.lesson_date, notes: l.notes, status: l.status }));
    const freshWorkshops = (workshopsRes.data || []).map((w: any) => ({ id: w.id, surahName: w.surah_name, fromAyah: w.from_ayah, toAyah: w.to_ayah, date: w.lesson_date, notes: w.notes, status: w.status }));
    const lMap: Record<string, Lesson> = {};
    freshLessons.forEach((l: Lesson) => { lMap[l.id] = l; });
    const wMap: Record<string, Lesson> = {};
    freshWorkshops.forEach((w: Lesson) => { wMap[w.id] = w; });
    setLessonMap(lMap);
    setWorkshopMap(wMap);

    const workshopIds = new Set(freshWorkshops.map((w: Lesson) => w.id));
    const lessonIds = new Set(freshLessons.map((l: Lesson) => l.id));

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

  const exportToExcel = (person: Person, data: CategorizedRecords) => {
    const mapRows = (items: AttendanceRecord[], includeExcuse: boolean) =>
      items.map((r) => {
        const row: Record<string, string> = {
          "اسم الدرس": getLessonDisplayName(r.lesson_name),
          "التاريخ": r.lesson_date,
        };
        if (includeExcuse) {
          row["العذر"] = r.excuse === "with_excuse" ? "بعذر" : r.excuse === "without_excuse" ? "بدون عذر" : "-";
        }
        return row;
      });

    const wb = XLSX.utils.book_new();

    const ws1 = XLSX.utils.json_to_sheet(mapRows(data.lecturePresent, false));
    XLSX.utils.book_append_sheet(wb, ws1, "حضور المحاضرات");

    const ws2 = XLSX.utils.json_to_sheet(mapRows(data.lectureAbsent, true));
    XLSX.utils.book_append_sheet(wb, ws2, "غياب المحاضرات");

    const ws3 = XLSX.utils.json_to_sheet(mapRows(data.workshopPresent, false));
    XLSX.utils.book_append_sheet(wb, ws3, "حضور الورشات");

    const ws4 = XLSX.utils.json_to_sheet(mapRows(data.workshopAbsent, true));
    XLSX.utils.book_append_sheet(wb, ws4, "غياب الورشات");

    const summary = [
      { "البند": "حضور المحاضرات", "العدد": data.lecturePresent.length },
      { "البند": "غياب المحاضرات", "العدد": data.lectureAbsent.length },
      { "البند": "حضور الورشات", "العدد": data.workshopPresent.length },
      { "البند": "غياب الورشات", "العدد": data.workshopAbsent.length },
      { "البند": "إجمالي الحضور", "العدد": data.lecturePresent.length + data.workshopPresent.length },
      { "البند": "إجمالي الغياب", "العدد": data.lectureAbsent.length + data.workshopAbsent.length },
    ];
    const ws5 = XLSX.utils.json_to_sheet(summary);
    XLSX.utils.book_append_sheet(wb, ws5, "ملخص");

    // Set RTL and column widths for all sheets
    wb.SheetNames.forEach((name) => {
      const ws = wb.Sheets[name];
      ws["!cols"] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }];
    });

    XLSX.writeFile(wb, `${person.name}_تقرير_الحضور.xlsx`);
    toast.success("تم تصدير الملف بنجاح");
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
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <button
            onClick={() => { setSelectedPerson(null); setRecords(null); setExpandedSection(null); setDetailView(null); setIsEditing(false); }}
            className="flex items-center gap-1 text-primary text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <span>رجوع</span>
          </button>
          {permissions.canAddPeople && !isEditing && (
            <button
              onClick={() => startEditing(selectedPerson)}
              className="flex items-center gap-1.5 text-primary text-sm font-medium"
            >
              <Pencil className="w-4 h-4" />
              <span>تعديل</span>
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-3 pt-4"
            >
              <h3 className="text-lg font-bold text-foreground mb-1">تعديل المعلومات</h3>
              <input
                type="text"
                placeholder="الاسم (مطلوب) *"
                value={editData.name || ""}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="tel"
                  placeholder="رقم الهاتف (اختياري)"
                  value={editData.phone || ""}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  dir="ltr"
                  className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-right"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="العنوان (اختياري)"
                  value={editData.address || ""}
                  onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                  className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="date"
                  value={editData.birth_date || ""}
                  onChange={(e) => setEditData({ ...editData, birth_date: e.target.value })}
                  className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {!editData.birth_date && <span className="absolute right-10 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">المواليد (اختياري)</span>}
              </div>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="date"
                  value={editData.join_date || ""}
                  onChange={(e) => setEditData({ ...editData, join_date: e.target.value })}
                  className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {!editData.join_date && <span className="absolute right-10 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">تاريخ الانضمام (اختياري)</span>}
              </div>
              <div className="relative">
                <GraduationCap className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="التحصيل الدراسي (اختياري)"
                  value={editData.education_level || ""}
                  onChange={(e) => setEditData({ ...editData, education_level: e.target.value })}
                  className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={updatePerson}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ</span>
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          ) : (
          <>
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
            {selectedPerson.phone && (
              <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
                <Phone className="w-3.5 h-3.5" />
                <span dir="ltr">{selectedPerson.phone}</span>
              </div>
            )}
            {selectedPerson.address && (
              <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                <span>{selectedPerson.address}</span>
              </div>
            )}
            {selectedPerson.birth_date && (
              <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                <span>المواليد: {selectedPerson.birth_date}</span>
              </div>
            )}
            {selectedPerson.join_date && (
              <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                <span>تاريخ الانضمام: {selectedPerson.join_date}</span>
              </div>
            )}
            {selectedPerson.education_level && (
              <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{selectedPerson.education_level}</span>
              </div>
            )}
            {records && (
              <button
                onClick={() => exportToExcel(selectedPerson, records)}
                className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-semibold transition-all active:scale-[0.97]"
              >
                <Download className="w-4 h-4" />
                <span>تصدير Excel</span>
              </button>
            )}
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
          )}

        {/* Delete - only if can edit */}
        {permissions.canAddPeople && (
          <div className="px-4 pb-4">
            <button
              onClick={() => deletePerson(selectedPerson.id, selectedPerson.name)}
              className="w-full py-3 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>حذف الشخص</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative" dir="rtl">
      <IslamicDecorations variant="attendance" />
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

      {permissions.canAddPeople && (
        <div className="px-4 pb-4">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
            >
              <Plus className="w-5 h-5" />
              <span>إضافة شخص</span>
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="ios-card p-4 flex flex-col gap-3"
            >
              <input
                type="text"
                placeholder="الاسم (مطلوب) *"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="tel"
                  placeholder="رقم الهاتف (اختياري)"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  dir="ltr"
                  className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-right"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="العنوان (اختياري)"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                 className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="date"
                  placeholder="المواليد (اختياري)"
                  value={newBirthDate}
                  onChange={(e) => setNewBirthDate(e.target.value)}
                  className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {!newBirthDate && <span className="absolute right-10 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">المواليد (اختياري)</span>}
              </div>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="date"
                  placeholder="تاريخ الانضمام (اختياري)"
                  value={newJoinDate}
                  onChange={(e) => setNewJoinDate(e.target.value)}
                  className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {!newJoinDate && <span className="absolute right-10 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">تاريخ الانضمام (اختياري)</span>}
              </div>
              <div className="relative">
                <GraduationCap className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="التحصيل الدراسي (اختياري)"
                  value={newEducation}
                  onChange={(e) => setNewEducation(e.target.value)}
                  className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addPerson}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>إضافة</span>
                </button>
                <button
                  onClick={() => { setShowAddForm(false); setNewName(""); setNewPhone(""); setNewAddress(""); setNewBirthDate(""); setNewJoinDate(""); setNewEducation(""); }}
                  className="px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
