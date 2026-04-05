import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar as CalendarIcon } from "lucide-react";
import { generateId } from "@/lib/quran-data";
import type { Lesson } from "@/lib/quran-data";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { syriacLocale, formatSyriacDate } from "@/lib/syriac-locale";

const COURSE_TYPES = [
  "دورة اليقظة الايمانية",
  "دورة التربية الايمانية",
  "دورة التربية النفسية",
  "دورة التربية الفكرية",
] as const;

const WORKSHOP_NUMBERS = [
  "ورشة أولى",
  "ورشة ثانية",
  "ورشة ثالثة",
  "ورشة رابعة",
  "ورشة خامسة",
] as const;

interface AddLessonDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (lesson: Lesson) => void;
  dialogTitle?: string;
  namePlaceholder?: string;
  addLabel?: string;
  editLesson?: Lesson | null;
  showCourseType?: boolean;
  showWorkshopNumber?: boolean;
}

const AddLessonDialog = ({ open, onClose, onAdd, dialogTitle = "درس جديد", namePlaceholder = "اسم المحاضرة", addLabel = "إضافة", editLesson, showCourseType = false, showWorkshopNumber = false }: AddLessonDialogProps) => {
  const [lessonName, setLessonName] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [notes, setNotes] = useState("");
  const [courseType, setCourseType] = useState("");
  const [workshopNumber, setWorkshopNumber] = useState("");
  const [durationHours, setDurationHours] = useState("0");
  const [durationMinutes, setDurationMinutes] = useState("0");

  const isEdit = !!editLesson;

  useEffect(() => {
    if (editLesson && open) {
      setLessonName(editLesson.surahName);
      setNotes(editLesson.notes || "");
      setCourseType((editLesson as any).courseType || "");
      setWorkshopNumber((editLesson as any).workshopNumber || "");
      const mins = (editLesson as any).durationMinutes || 0;
      setDurationHours(String(Math.floor(mins / 60)));
      setDurationMinutes(String(mins % 60));
    } else if (!open) {
      setLessonName("");
      setNotes("");
      setSelectedDate(new Date());
      setCourseType("");
      setWorkshopNumber("");
      setDurationHours("0");
      setDurationMinutes("0");
    }
  }, [editLesson, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonName.trim() || !selectedDate) return;
    
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;
    const totalMins = (parseInt(durationHours) || 0) * 60 + (parseInt(durationMinutes) || 0);
    onAdd({
      id: editLesson?.id || generateId(),
      surahName: lessonName,
      fromAyah: editLesson?.fromAyah || 0,
      toAyah: editLesson?.toAyah || 0,
      notes,
      status: editLesson?.status || "pending",
      date: editLesson?.date || dateStr,
      courseType: courseType,
      workshopNumber: workshopNumber,
      durationMinutes: totalMins > 0 ? totalMins : null,
    } as any);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 inset-x-0 z-50 max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-card rounded-t-3xl px-5 pt-3 pb-8 max-w-lg mx-auto shadow-ios">
              {/* Handle */}
              <div className="w-9 h-1 rounded-full bg-ios-separator mx-auto mb-4" />

              <div className="flex items-center justify-between mb-5">
                <button onClick={onClose} className="text-primary text-sm font-medium">إلغاء</button>
                <h2 className="text-[17px] font-bold">{isEdit ? "تعديل" : dialogTitle}</h2>
                <button onClick={handleSubmit} className="text-primary text-sm font-bold">{isEdit ? "حفظ" : addLabel}</button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="ios-card overflow-hidden">
                  <div className="px-4 py-3 border-b border-ios-separator">
                    <input
                      type="text"
                      value={lessonName}
                      onChange={(e) => setLessonName(e.target.value)}
                      placeholder={namePlaceholder}
                      className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
                      required
                    />
                  </div>
                  {!isEdit && (
                    <div className="px-4 py-3 border-b border-ios-separator">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="w-full flex items-center justify-between text-sm"
                          >
                            <span className="text-foreground">التاريخ</span>
                            <span className="text-muted-foreground flex items-center gap-2">
                              {selectedDate ? formatSyriacDate(selectedDate) : "اختر التاريخ"}
                              <CalendarIcon className="w-4 h-4" />
                            </span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            locale={syriacLocale}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}

                  {/* حقل المدة */}
                  <div className="px-4 py-3 border-b border-ios-separator">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">مدة المحاضرة</span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => setDurationHours(h => String(Math.max(0, parseInt(h||"0") - 1)))}
                            className="w-7 h-7 rounded-lg bg-secondary text-foreground text-lg font-bold flex items-center justify-center active:scale-90 transition-transform">−</button>
                          <span className="w-8 text-center text-sm font-bold text-foreground">{durationHours}</span>
                          <button type="button" onClick={() => setDurationHours(h => String(parseInt(h||"0") + 1))}
                            className="w-7 h-7 rounded-lg bg-secondary text-foreground text-lg font-bold flex items-center justify-center active:scale-90 transition-transform">+</button>
                          <span className="text-xs text-muted-foreground mr-1">ساعة</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => setDurationMinutes(m => String(Math.max(0, parseInt(m||"0") - 5)))}
                            className="w-7 h-7 rounded-lg bg-secondary text-foreground text-lg font-bold flex items-center justify-center active:scale-90 transition-transform">−</button>
                          <span className="w-8 text-center text-sm font-bold text-foreground">{String(parseInt(durationMinutes)||0).padStart(2,"0")}</span>
                          <button type="button" onClick={() => setDurationMinutes(m => String(Math.min(55, parseInt(m||"0") + 5)))}
                            className="w-7 h-7 rounded-lg bg-secondary text-foreground text-lg font-bold flex items-center justify-center active:scale-90 transition-transform">+</button>
                          <span className="text-xs text-muted-foreground mr-1">دقيقة</span>
                        </div>
                      </div>
                    </div>
                    {(parseInt(durationHours) > 0 || parseInt(durationMinutes) > 0) && (
                      <p className="text-xs text-primary mt-1.5 text-left">
                        المدة: {parseInt(durationHours) > 0 ? `${durationHours} ساعة ` : ""}{parseInt(durationMinutes) > 0 ? `${durationMinutes} دقيقة` : ""}
                      </p>
                    )}
                  </div>
                  {showCourseType && (
                    <div className="px-4 py-3">
                      <label className="text-sm text-foreground font-medium mb-2 block">نوع الدورة</label>
                      <div className="flex flex-col gap-2">
                        {COURSE_TYPES.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setCourseType(type)}
                            className={`w-full text-right px-3 py-2.5 rounded-lg text-sm transition-colors ${
                              courseType === type
                                ? "bg-primary text-primary-foreground font-medium"
                                : "bg-muted/50 text-foreground hover:bg-muted"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {showWorkshopNumber && (
                    <div className="px-4 py-3">
                      <label className="text-sm text-foreground font-medium mb-2 block">نوع الدورة</label>
                      <div className="flex flex-col gap-2">
                        {COURSE_TYPES.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setCourseType(type)}
                            className={`w-full text-right px-3 py-2.5 rounded-lg text-sm transition-colors ${
                              courseType === type
                                ? "bg-primary text-primary-foreground font-medium"
                                : "bg-muted/50 text-foreground hover:bg-muted"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="ios-card px-4 py-3">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="ملاحظات..."
                    className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none resize-none"
                  />
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddLessonDialog;
