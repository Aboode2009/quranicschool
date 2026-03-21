import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Users, Plus, ChevronLeft, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import AddLessonDialog from "@/components/AddLessonDialog";
import WorkshopAttendancePage from "./WorkshopAttendancePage";
import type { Lesson } from "@/lib/quran-data";
import { formatSyriacDateString } from "@/lib/syriac-locale";
import { useAuth } from "@/hooks/useAuth";
import { useLessons } from "@/hooks/useLessons";
import IslamicDecorations from "@/components/IslamicDecorations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const WarashaPage = () => {
  const { permissions } = useAuth();
  const { lessons: workshops, loading, addLesson: addWorkshop, updateLesson: updateWorkshop, deleteLesson: deleteWorkshop } = useLessons("warasha");
  const [showAdd, setShowAdd] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<Lesson | null>(null);
  const [deletingWorkshop, setDeletingWorkshop] = useState<Lesson | null>(null);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Lesson | null>(null);

  const handleAddWorkshop = async (lesson: Lesson) => {
    const success = await addWorkshop(lesson);
    if (success) setShowAdd(false);
  };

  const handleEditWorkshop = async (lesson: Lesson) => {
    if (!editingWorkshop) return;
    const success = await updateWorkshop(editingWorkshop.id, {
      surahName: lesson.surahName,
      notes: lesson.notes,
    });
    if (success) setEditingWorkshop(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingWorkshop) return;
    await deleteWorkshop(deletingWorkshop.id);
    setDeletingWorkshop(null);
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
    <div className="flex flex-col h-full relative">
      <IslamicDecorations variant="workshop" />
      <div className="px-4 pt-3 pb-2 relative z-10">
        <h1 className="text-2xl font-bold text-foreground mb-3">الورشة</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <p>جاري التحميل...</p>
          </div>
        ) : (
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
                  {permissions.canCreateWorkshops && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors shrink-0"
                        >
                          <MoreHorizontal className="w-4.5 h-4.5 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="min-w-[140px]">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingWorkshop(ws); }}>
                          <Pencil className="w-4 h-4 ml-2" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDeletingWorkshop(ws); }} className="text-destructive focus:text-destructive">
                          <Trash2 className="w-4 h-4 ml-2" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  {!permissions.canCreateWorkshops && (
                    <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
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
        )}
      </div>

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
        onAdd={handleAddWorkshop}
        dialogTitle="ورشة جديدة"
        namePlaceholder="اسم الورشة"
        addLabel="إضافة"
        showWorkshopNumber
      />
      <AddLessonDialog
        open={!!editingWorkshop}
        onClose={() => setEditingWorkshop(null)}
        onAdd={handleEditWorkshop}
        editLesson={editingWorkshop}
        dialogTitle="تعديل الورشة"
        namePlaceholder="اسم الورشة"
      />

      <AlertDialog open={!!deletingWorkshop} onOpenChange={(open) => !open && setDeletingWorkshop(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف "{deletingWorkshop?.surahName}"؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WarashaPage;
