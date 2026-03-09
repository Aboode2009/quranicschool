import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { BookOpen } from "lucide-react";
import HeroBanner from "@/components/HeroBanner";
import LessonCard from "@/components/LessonCard";
import AddLessonDialog from "@/components/AddLessonDialog";
import { getLessonsFromStorage, saveLessonsToStorage } from "@/lib/quran-data";
import type { Lesson } from "@/lib/quran-data";

const Index = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [filter, setFilter] = useState<"all" | Lesson["status"]>("all");

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

  const filtered = filter === "all" ? lessons : lessons.filter((l) => l.status === filter);
  const completed = lessons.filter((l) => l.status === "completed").length;

  const filters: { label: string; value: typeof filter }[] = [
    { label: "الكل", value: "all" },
    { label: "لم يبدأ", value: "pending" },
    { label: "جاري", value: "in-progress" },
    { label: "مكتمل", value: "completed" },
  ];

  return (
    <div className="min-h-screen bg-background font-body">
      <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-8">
        <HeroBanner totalLessons={lessons.length} completedLessons={completed} />

        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-2 flex-wrap">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === f.value
                    ? "bg-primary text-primary-foreground shadow-emerald"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <AddLessonDialog onAdd={addLesson} />
        </div>

        {/* Lessons list */}
        <div className="flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((lesson, i) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                index={i}
                onStatusChange={updateStatus}
                onDelete={deleteLesson}
              />
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <BookOpen className="w-12 h-12 mb-4 opacity-40" />
              <p className="text-lg">لا توجد دروس {filter !== "all" ? "في هذا التصنيف" : "بعد"}</p>
              <p className="text-sm mt-1">ابدأ بإضافة درس جديد</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
