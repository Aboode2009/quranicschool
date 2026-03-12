import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Plus, ChevronLeft } from "lucide-react";
import AddLessonDialog from "@/components/AddLessonDialog";
import LessonAttendancePage from "./LessonAttendancePage";
import type { Lesson } from "@/lib/quran-data";
import { formatSyriacDateString } from "@/lib/syriac-locale";
import { useAuth } from "@/hooks/useAuth";
import { useLessons } from "@/hooks/useLessons";
import IslamicDecorations from "@/components/IslamicDecorations";

const MuhaderaPage = () => {
  const { permissions } = useAuth();
  const { lessons, loading, addLesson } = useLessons("muhadera");
  const [showAdd, setShowAdd] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const handleAddLesson = async (lesson: Lesson) => {
    const success = await addLesson(lesson);
    if (success) setShowAdd(false);
  };

  if (selectedLesson) {
    return (
      <LessonAttendancePage
        lesson={selectedLesson}
        onBack={() => setSelectedLesson(null)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      <IslamicDecorations variant="lecture" />
      <div className="px-4 pt-3 pb-2 relative z-10">
        <h1 className="text-2xl font-bold text-foreground mb-3">المحاضرة</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <p>جاري التحميل...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            <AnimatePresence mode="popLayout">
              {lessons.map((lesson, i) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                  layout
                  onClick={() => setSelectedLesson(lesson)}
                  className="ios-card px-4 py-3.5 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4.5 h-4.5 text-primary" strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold leading-tight text-foreground">
                      {lesson.surahName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatSyriacDateString(lesson.date)}
                    </p>
                    {lesson.notes && (
                      <p className="text-xs text-muted-foreground/70 mt-1 truncate">{lesson.notes}</p>
                    )}
                  </div>
                  <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0" />
                </motion.div>
              ))}
            </AnimatePresence>

            {lessons.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-muted-foreground"
              >
                <BookOpen className="w-10 h-10 mb-3 opacity-30" strokeWidth={1.5} />
                <p className="text-base font-medium">لا توجد دروس بعد</p>
                <p className="text-sm mt-1">اضغط الزر أدناه لإضافة درس جديد</p>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {permissions.canCreateLessons && (
        <div className="px-4 pb-4">
          <button
            onClick={() => setShowAdd(true)}
            className="ios-button w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-base font-semibold shadow-sm"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
            <span>إضافة محاضرة</span>
          </button>
        </div>
      )}

      <AddLessonDialog open={showAdd} onClose={() => setShowAdd(false)} onAdd={handleAddLesson} />
    </div>
  );
};

export default MuhaderaPage;
