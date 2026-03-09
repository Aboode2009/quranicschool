import { motion } from "framer-motion";
import { Check, Clock, BookOpen, Trash2, ChevronLeft } from "lucide-react";
import type { Lesson } from "@/lib/quran-data";

interface LessonCardProps {
  lesson: Lesson;
  index: number;
  onStatusChange: (id: string, status: Lesson["status"]) => void;
  onDelete: (id: string) => void;
}

const statusConfig = {
  pending: {
    label: "لم يبدأ",
    icon: Clock,
    dotClass: "bg-muted-foreground",
  },
  "in-progress": {
    label: "جاري",
    icon: BookOpen,
    dotClass: "bg-primary",
  },
  completed: {
    label: "مكتمل",
    icon: Check,
    dotClass: "bg-accent",
  },
};

const LessonCard = ({ lesson, index, onStatusChange, onDelete }: LessonCardProps) => {
  const config = statusConfig[lesson.status];

  const nextStatus = (): Lesson["status"] => {
    if (lesson.status === "pending") return "in-progress";
    if (lesson.status === "in-progress") return "completed";
    return "pending";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      layout
      className="ios-card px-4 py-3.5 flex items-center gap-3 group active:scale-[0.98] transition-transform"
    >
      {/* Status dot */}
      <button
        onClick={() => onStatusChange(lesson.id, nextStatus())}
        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          lesson.status === "completed"
            ? "border-accent bg-accent"
            : lesson.status === "in-progress"
            ? "border-primary bg-primary/10"
            : "border-ios-separator bg-transparent"
        }`}
      >
        {lesson.status === "completed" && (
          <Check className="w-3.5 h-3.5 text-accent-foreground" strokeWidth={3} />
        )}
        {lesson.status === "in-progress" && (
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-[15px] font-semibold leading-tight ${
          lesson.status === "completed" ? "text-muted-foreground line-through" : "text-foreground"
        }`}>
          {lesson.surahName}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {lesson.date}
        </p>
        {lesson.notes && (
          <p className="text-xs text-muted-foreground/70 mt-1 truncate">{lesson.notes}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onDelete(lesson.id)}
          className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      <ChevronLeft className="w-4 h-4 text-muted-foreground/40 shrink-0" strokeWidth={2} />
    </motion.div>
  );
};

export default LessonCard;
