import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar as CalendarIcon } from "lucide-react";
import { generateId } from "@/lib/quran-data";
import type { Lesson } from "@/lib/quran-data";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { syriacLocale, formatSyriacDate } from "@/lib/syriac-locale";

interface AddLessonDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (lesson: Lesson) => void;
  dialogTitle?: string;
  namePlaceholder?: string;
  addLabel?: string;
}

const AddLessonDialog = ({ open, onClose, onAdd, dialogTitle = "درس جديد", namePlaceholder = "اسم المحاضرة", addLabel = "إضافة" }: AddLessonDialogProps) => {
  const [lessonName, setLessonName] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonName.trim() || !selectedDate) return;
    
    const dateStr = selectedDate.toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
    onAdd({
      id: generateId(),
      surahName: lessonName,
      fromAyah: 0,
      toAyah: 0,
      notes,
      status: "pending",
      date: dateStr,
    });
    setLessonName("");
    setNotes("");
    setSelectedDate(new Date());
    onClose();
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
            className="fixed bottom-0 inset-x-0 z-50 max-h-[90vh]"
          >
            <div className="bg-card rounded-t-3xl px-5 pt-3 pb-8 max-w-lg mx-auto shadow-ios">
              {/* Handle */}
              <div className="w-9 h-1 rounded-full bg-ios-separator mx-auto mb-4" />

              <div className="flex items-center justify-between mb-5">
                <button onClick={onClose} className="text-primary text-sm font-medium">إلغاء</button>
                <h2 className="text-[17px] font-bold">{dialogTitle}</h2>
                <button onClick={handleSubmit} className="text-primary text-sm font-bold">{addLabel}</button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="ios-card overflow-hidden">
                  <div className="px-4 py-3 border-b border-ios-separator">
                    <input
                      type="text"
                      value={lessonName}
                      onChange={(e) => setLessonName(e.target.value)}
                      placeholder="اسم المحاضرة"
                      className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
                      required
                    />
                  </div>
                  <div className="px-4 py-3">
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
