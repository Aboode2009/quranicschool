import { motion } from "framer-motion";
import islamicPattern from "@/assets/islamic-pattern.png";

interface HeroBannerProps {
  totalLessons: number;
  completedLessons: number;
}

const HeroBanner = ({ totalLessons, completedLessons }: HeroBannerProps) => {
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-2xl bg-emerald-pattern p-8 md:p-10"
    >
      {/* Pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{ backgroundImage: `url(${islamicPattern})`, backgroundSize: "300px" }}
      />

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
            ترتيب دروس القرآن
          </h1>
          <p className="text-primary-foreground/80 text-lg font-body">
            نظّم حفظك ومراجعتك بسهولة
          </p>
        </div>

        <div className="flex items-center gap-6">
          {/* Progress circle */}
          <div className="relative w-24 h-24">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="hsl(var(--gold) / 0.2)"
                strokeWidth="8"
              />
              <motion.circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="hsl(var(--gold))"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={264}
                initial={{ strokeDashoffset: 264 }}
                animate={{ strokeDashoffset: 264 - (264 * progress) / 100 }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">{progress}%</span>
            </div>
          </div>

          <div className="flex flex-col gap-1 text-primary-foreground/90">
            <span className="text-sm">المكتمل: <strong className="text-gold">{completedLessons}</strong></span>
            <span className="text-sm">المجموع: <strong>{totalLessons}</strong></span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HeroBanner;
