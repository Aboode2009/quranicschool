import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { SURAH_LIST, generateId } from "@/lib/quran-data";
import type { Lesson } from "@/lib/quran-data";

interface AddLessonDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (lesson: Lesson) => void;
}

const AddLessonDialog = ({ open, onClose, onAdd }: AddLessonDialogProps) => {
  const [surahName, setSurahName] = useState(SURAH_LIST[0]);
  const [fromAyah, setFromAyah] = useState(1);
  const [toAyah, setToAyah] = useState(10);
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date();
    const dateStr = today.toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
    onAdd({
      id: generateId(),
      surahName,
      fromAyah,
      toAyah,
      notes,
      status: "pending",
      date: dateStr,
    });
    setNotes("");
    setFromAyah(1);
    setToAyah(10);
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
                <h2 className="text-[17px] font-bold">درس جديد</h2>
                <button onClick={handleSubmit} className="text-primary text-sm font-bold">إضافة</button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="ios-card overflow-hidden">
                  <div className="px-4 py-3 flex items-center justify-between border-b border-ios-separator">
                    <label className="text-sm text-foreground">السورة</label>
                    <select
                      value={surahName}
                      onChange={(e) => setSurahName(e.target.value)}
                      className="bg-transparent text-sm text-muted-foreground text-left focus:outline-none"
                    >
                      {SURAH_LIST.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between border-b border-ios-separator">
                    <label className="text-sm text-foreground">من آية</label>
                    <input
                      type="number"
                      min={1}
                      value={fromAyah}
                      onChange={(e) => setFromAyah(Number(e.target.value))}
                      className="bg-transparent text-sm text-muted-foreground text-left w-20 focus:outline-none"
                    />
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between">
                    <label className="text-sm text-foreground">إلى آية</label>
                    <input
                      type="number"
                      min={1}
                      value={toAyah}
                      onChange={(e) => setToAyah(Number(e.target.value))}
                      className="bg-transparent text-sm text-muted-foreground text-left w-20 focus:outline-none"
                    />
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
