import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Plus } from "lucide-react";
import LessonCard from "@/components/LessonCard";
import AddLessonDialog from "@/components/AddLessonDialog";
import { getLessonsFromStorage, saveLessonsToStorage } from "@/lib/quran-data";
import type { Lesson } from "@/lib/quran-data";

const MuhaderaPage = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    setLessons(getLessonsFromStorage());
  }, []);

  useEffect(() => {
    if (lessons.length > 0) saveLessonsToStorage(lessons);
  }, [lessons]);

  const addLesson = (lesson: Lesson) => {
    setLessons((prev) => [lesson, ...prev]);
  };

  const updateStatus = (id: string, status: Lesson["status"]) => {
    setLessons((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  };

  const deleteLesson = (id: string) => {
    setLessons((prev) => {
      const updated = prev.filter((l) => l.id !== id);
      saveLessonsToStorage(updated);
      return updated;
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold text-foreground">المحاضرة</h1>
          <button
            onClick={() => setShowAdd(true)}
            className="ios-button w-9 h-9 flex items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Lessons list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col gap-2.5">
          <AnimatePresence mode="popLayout">
            {lessons.map((lesson, i) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                index={i}
                onStatusChange={updateStatus}
                onDelete={deleteLesson}
              />
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
              <p className="text-sm mt-1">اضغط + لإضافة درس جديد</p>
            </motion.div>
          )}
        </div>
      </div>

      <AddLessonDialog open={showAdd} onClose={() => setShowAdd(false)} onAdd={addLesson} />
    </div>
  );
};

export default MuhaderaPage;
