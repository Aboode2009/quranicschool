import { motion } from "framer-motion";
import { BookOpen, Check, Clock, Trash2, RotateCcw } from "lucide-react";
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
    badgeClass: "bg-secondary text-secondary-foreground",
    borderClass: "border-r-cream-dark",
  },
  "in-progress": {
    label: "جاري",
    icon: BookOpen,
    badgeClass: "bg-accent/20 text-accent-foreground",
    borderClass: "border-r-gold",
  },
  completed: {
    label: "مكتمل",
    icon: Check,
    badgeClass: "bg-primary/10 text-primary",
    borderClass: "border-r-primary",
  },
};

const LessonCard = ({ lesson, index, onStatusChange, onDelete }: LessonCardProps) => {
  const config = statusConfig[lesson.status];
  const StatusIcon = config.icon;

  const nextStatus = (): Lesson["status"] => {
    if (lesson.status === "pending") return "in-progress";
    if (lesson.status === "in-progress") return "completed";
    return "pending";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className={`card-islamic p-5 border-r-4 ${config.borderClass} group hover:shadow-emerald transition-shadow duration-300`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-display font-bold text-foreground">
              سورة {lesson.surahName}
            </h3>
            <span className={`px-3 py-0.5 rounded-full text-xs font-medium ${config.badgeClass}`}>
              <StatusIcon className="inline-block w-3 h-3 ml-1" />
              {config.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            الآيات: {lesson.fromAyah} – {lesson.toAyah}
          </p>
          {lesson.notes && (
            <p className="text-sm text-muted-foreground/80 mt-2 leading-relaxed">{lesson.notes}</p>
          )}
          <p className="text-xs text-muted-foreground/60 mt-3">{lesson.date}</p>
        </div>

        <div className="flex flex-col gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onStatusChange(lesson.id, nextStatus())}
            className="p-2 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors"
            title={lesson.status === "completed" ? "إعادة" : "التالي"}
          >
            {lesson.status === "completed" ? (
              <RotateCcw className="w-4 h-4" />
            ) : (
              <Check className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => onDelete(lesson.id)}
            className="p-2 rounded-lg bg-secondary hover:bg-destructive hover:text-destructive-foreground transition-colors"
            title="حذف"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default LessonCard;
