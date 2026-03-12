import { motion } from "framer-motion";

/**
 * Subtle Islamic geometric decorations.
 * variant controls which decorative set to show per-page.
 */
type Variant = "default" | "lecture" | "workshop" | "attendance" | "settings" | "login" | "dashboard";

const IslamicDecorations = ({ variant = "default" }: { variant?: Variant }) => {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {/* Top-right corner arch */}
      <svg
        className="absolute -top-8 -left-8 w-40 h-40 text-primary/[0.04] dark:text-primary/[0.03]"
        viewBox="0 0 200 200"
        fill="none"
      >
        <path
          d="M100 0C100 55.228 55.228 100 0 100L0 0H100Z"
          fill="currentColor"
        />
        <path
          d="M200 100C144.772 100 100 55.228 100 0H200V100Z"
          fill="currentColor"
        />
        <circle cx="100" cy="50" r="30" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
      </svg>

      {/* Bottom-left corner geometric */}
      <svg
        className="absolute -bottom-6 -right-6 w-36 h-36 text-accent/[0.05] dark:text-accent/[0.03]"
        viewBox="0 0 180 180"
        fill="none"
      >
        <polygon points="90,10 170,90 90,170 10,90" stroke="currentColor" strokeWidth="1" fill="none" />
        <polygon points="90,35 145,90 90,145 35,90" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.7" />
        <polygon points="90,55 125,90 90,125 55,90" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.5" />
        <circle cx="90" cy="90" r="15" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.4" />
      </svg>

      {/* Variant-specific decorations */}
      {variant === "lecture" && (
        <motion.svg
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute top-24 -right-12 w-28 h-28 text-primary/[0.04]"
          viewBox="0 0 100 100"
        >
          {/* 8-pointed star */}
          <polygon points="50,5 61,35 95,35 68,55 79,85 50,67 21,85 32,55 5,35 39,35" fill="currentColor" />
        </motion.svg>
      )}

      {variant === "workshop" && (
        <motion.svg
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute top-32 -left-10 w-32 h-32 text-destructive/[0.04]"
          viewBox="0 0 120 120"
        >
          {/* Interlocking crescents */}
          <path d="M60 10 A40 40 0 1 1 60 110 A28 28 0 1 0 60 10Z" fill="currentColor" />
          <path d="M60 25 A25 25 0 1 1 60 95 A18 18 0 1 0 60 25Z" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
        </motion.svg>
      )}

      {variant === "attendance" && (
        <motion.svg
          initial={{ opacity: 0, rotate: -15 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 2 }}
          className="absolute top-20 left-4 w-24 h-24 text-[hsl(var(--accent))]/[0.05]"
          viewBox="0 0 100 100"
        >
          {/* Hexagonal pattern */}
          <polygon points="50,5 93,27 93,73 50,95 7,73 7,27" stroke="currentColor" strokeWidth="1" fill="none" />
          <polygon points="50,20 78,35 78,65 50,80 22,65 22,35" stroke="currentColor" strokeWidth="0.7" fill="none" opacity="0.6" />
          <circle cx="50" cy="50" r="12" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.4" />
        </motion.svg>
      )}

      {variant === "dashboard" && (
        <>
          <motion.svg
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
            className="absolute bottom-32 left-2 w-20 h-20 text-primary/[0.05]"
            viewBox="0 0 80 80"
          >
            <polygon points="40,5 52,28 75,28 56,44 64,68 40,54 16,68 24,44 5,28 28,28" fill="currentColor" />
          </motion.svg>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 0.8 }}
            className="absolute top-16 left-6 w-1 h-20 bg-gradient-to-b from-primary/10 to-transparent rounded-full"
          />
        </>
      )}

      {variant === "login" && (
        <>
          <motion.svg
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="absolute top-1/4 -right-16 w-48 h-48 text-primary/[0.03]"
            viewBox="0 0 200 200"
          >
            <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="0.8" fill="none" />
            <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="0.6" fill="none" />
            <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="0.4" fill="none" />
            {/* Cross lines */}
            <line x1="100" y1="20" x2="100" y2="180" stroke="currentColor" strokeWidth="0.3" />
            <line x1="20" y1="100" x2="180" y2="100" stroke="currentColor" strokeWidth="0.3" />
            <line x1="43" y1="43" x2="157" y2="157" stroke="currentColor" strokeWidth="0.3" />
            <line x1="157" y1="43" x2="43" y2="157" stroke="currentColor" strokeWidth="0.3" />
          </motion.svg>
          <motion.svg
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
            className="absolute bottom-1/4 -left-12 w-36 h-36 text-accent/[0.04]"
            viewBox="0 0 100 100"
          >
            <polygon points="50,5 61,35 95,35 68,55 79,85 50,67 21,85 32,55 5,35 39,35" fill="currentColor" />
          </motion.svg>
        </>
      )}

      {(variant === "settings") && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute top-28 -left-4 w-16 h-16"
        >
          <svg viewBox="0 0 64 64" className="text-accent/[0.06]">
            <rect x="12" y="12" width="40" height="40" rx="4" stroke="currentColor" strokeWidth="1" fill="none" transform="rotate(45 32 32)" />
            <rect x="20" y="20" width="24" height="24" rx="2" stroke="currentColor" strokeWidth="0.7" fill="none" transform="rotate(45 32 32)" opacity="0.6" />
          </svg>
        </motion.div>
      )}

      {/* Subtle repeating dots pattern at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 opacity-[0.02] dark:opacity-[0.01]"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
};

export default IslamicDecorations;
