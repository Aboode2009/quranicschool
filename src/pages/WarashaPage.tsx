import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Users, Plus, ChevronLeft, MoreHorizontal, Pencil, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState<string | null>(null);

  const COURSE_TYPES = [
    "دورة اليقظة الايمانية",
    "دورة التربية الايمانية",
    "دورة التربية النفسية",
    "دورة التربية الفكرية",
  ];

  const filteredWorkshops = workshops.filter((ws) => {
    const matchesSearch = !searchQuery || ws.surahName.includes(searchQuery);
    const matchesCourse = !courseFilter || ws.courseType === courseFilter;
    return matchesSearch && matchesCourse;
  });

  const handleAddWorkshop = async (lesson: Lesson) => {
    const success = await addWorkshop(lesson);
    if (success) setShowAdd(false);
  };

  const handleEditWorkshop = async (lesson: Lesson) => {
    if (!editingWorkshop) return;
    const success = await updateWorkshop(editingWorkshop.id, {
      surahName: lesson.surahName,
      notes: lesson.notes,
      courseType: (lesson as any).workshopNumber || (lesson as any).courseType,
    } as any);
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
      <div className="px-4 pt-3 pb-2 relative z-10 space-y-2">
        <h1 className="text-2xl font-bold text-foreground">الورشة</h1>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9 text-right h-9 text-sm rounded-xl bg-muted/30 border-0 focus-visible:ring-1"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 -mx-1 px-1" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          <button
            onClick={() => setCourseFilter(null)}
            className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
              !courseFilter ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/40 text-muted-foreground active:bg-muted"
            }`}
          >
            الكل
          </button>
          {COURSE_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setCourseFilter(courseFilter === type ? null : type)}
              className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                courseFilter === type ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/40 text-muted-foreground active:bg-muted"
              }`}
            >
              {type.replace("دورة ", "")}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <p>جاري التحميل...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            <AnimatePresence mode="popLayout">
              {filteredWorkshops.map((ws, i) => (
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
                      {ws.courseType && ` • ${ws.courseType}`}
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
        showWorkshopNumber
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
