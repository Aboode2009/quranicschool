import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Users, Plus, ChevronLeft } from "lucide-react";
import AddLessonDialog from "@/components/AddLessonDialog";
import WorkshopAttendancePage from "./WorkshopAttendancePage";
import { getWorkshopsFromStorage, saveWorkshopsToStorage, generateId } from "@/lib/quran-data";
import type { Lesson } from "@/lib/quran-data";
import { formatSyriacDateString } from "@/lib/syriac-locale";
import { useAuth } from "@/hooks/useAuth";

const WarashaPage = () => {
  const { permissions } = useAuth();
  const [workshops, setWorkshops] = useState<Lesson[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Lesson | null>(null);

  useEffect(() => {
    setWorkshops(getWorkshopsFromStorage());
  }, []);

  useEffect(() => {
    if (workshops.length > 0) saveWorkshopsToStorage(workshops);
  }, [workshops]);

  const addWorkshop = (lesson: Lesson) => {
    setWorkshops((prev) => [lesson, ...prev]);
  };

  if (selectedWorkshop) {
    return (
      <WorkshopAttendancePage
        lesson={selectedWorkshop}
        onBack={() => setSelectedWorkshop(null)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-3 pb-2">
        <h1 className="text-2xl font-bold text-foreground mb-3">الورشة</h1>
      </div>

      {/* Workshops list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col gap-2.5">
          <AnimatePresence mode="popLayout">
            {workshops.map((ws, i) => (
              <motion.div
                key={ws.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
                layout
                onClick={() => setSelectedWorkshop(ws)}
                className="ios-card px-4 py-3.5 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="w-4.5 h-4.5 text-primary" strokeWidth={1.8} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold leading-tight text-foreground">
                    {ws.surahName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatSyriacDateString(ws.date)}
                  </p>
                  {ws.notes && (
                    <p className="text-xs text-muted-foreground/70 mt-1 truncate">{ws.notes}</p>
                  )}
                </div>

                <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0" />
              </motion.div>
            ))}
          </AnimatePresence>

          {workshops.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-muted-foreground"
            >
              <Users className="w-10 h-10 mb-3 opacity-30" strokeWidth={1.5} />
              <p className="text-base font-medium">لا توجد ورشات بعد</p>
              <p className="text-sm mt-1">اضغط الزر أدناه لإضافة ورشة جديدة</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Add button */}
      {permissions.canCreateWorkshops && (
        <div className="px-4 pb-4">
          <button
            onClick={() => setShowAdd(true)}
            className="ios-button w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-base font-semibold shadow-sm"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
            <span>إضافة ورشة</span>
          </button>
        </div>
      )}

      <AddLessonDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={addWorkshop}
        dialogTitle="ورشة جديدة"
        namePlaceholder="اسم الورشة"
        addLabel="إضافة"
      />
    </div>
  );
};

export default WarashaPage;
