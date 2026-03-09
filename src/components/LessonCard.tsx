import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import type { Lesson } from "@/lib/quran-data";
import { formatSyriacDateString } from "@/lib/syriac-locale";

interface LessonCardProps {
  lesson: Lesson;
  index: number;
}

const LessonCard = ({ lesson, index }: LessonCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      layout
      className="ios-card px-4 py-3.5 flex items-center gap-3"
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
    </motion.div>
  );
};

export default LessonCard;
