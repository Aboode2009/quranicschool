import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { SURAH_LIST, generateId } from "@/lib/quran-data";
import type { Lesson } from "@/lib/quran-data";

interface AddLessonDialogProps {
  onAdd: (lesson: Lesson) => void;
}

const AddLessonDialog = ({ onAdd }: AddLessonDialogProps) => {
  const [open, setOpen] = useState(false);
  const [surahName, setSurahName] = useState(SURAH_LIST[0]);
  const [fromAyah, setFromAyah] = useState(1);
  const [toAyah, setToAyah] = useState(10);
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date();
    const dateStr = today.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
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
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-emerald hover:brightness-110 transition-all"
      >
        <Plus className="w-5 h-5" />
        إضافة درس جديد
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="card-islamic w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display font-bold">إضافة درس جديد</h2>
                  <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-secondary transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">السورة</label>
                    <select
                      value={surahName}
                      onChange={(e) => setSurahName(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {SURAH_LIST.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1.5">من آية</label>
                      <input
                        type="number"
                        min={1}
                        value={fromAyah}
                        onChange={(e) => setFromAyah(Number(e.target.value))}
                        className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1.5">إلى آية</label>
                      <input
                        type="number"
                        min={1}
                        value={toAyah}
                        onChange={(e) => setToAyah(Number(e.target.value))}
                        className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">ملاحظات</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="ملاحظات اختيارية..."
                      className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-emerald hover:brightness-110 transition-all mt-2"
                  >
                    إضافة الدرس
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AddLessonDialog;
