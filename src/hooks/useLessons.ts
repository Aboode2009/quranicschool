import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Lesson } from "@/lib/quran-data";

interface DbLesson {
  id: string;
  surah_name: string;
  from_ayah: number;
  to_ayah: number;
  notes: string;
  status: string;
  lesson_date: string;
  category: string;
  created_at: string;
}

function dbToLesson(db: DbLesson): Lesson {
  return {
    id: db.id,
    surahName: db.surah_name,
    fromAyah: db.from_ayah,
    toAyah: db.to_ayah,
    notes: db.notes,
    status: db.status as Lesson["status"],
    date: db.lesson_date,
  };
}

export function useLessons(category: "muhadera" | "warasha") {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLessons = async () => {
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("خطأ في تحميل البيانات");
    } else {
      setLessons((data || []).map(dbToLesson));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLessons();

    // Realtime subscription
    const channel = supabase
      .channel(`lessons-${category}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lessons",
          filter: `category=eq.${category}`,
        },
        () => {
          // Refetch on any change
          fetchLessons();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [category]);

  const addLesson = async (lesson: Lesson): Promise<boolean> => {
    const { error } = await supabase.from("lessons").insert({
      title: lesson.surahName,
      surah_name: lesson.surahName,
      from_ayah: lesson.fromAyah,
      to_ayah: lesson.toAyah,
      notes: lesson.notes,
      status: lesson.status,
      lesson_date: lesson.date || new Date().toISOString().split("T")[0],
      category,
      course_type: (lesson as any).courseType || "",
    });

    if (error) {
      toast.error("خطأ في الإضافة");
      return false;
    }
    return true;
  };

  const updateLesson = async (id: string, updates: Partial<Pick<Lesson, "surahName" | "notes" | "status">>): Promise<boolean> => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.surahName !== undefined) {
      dbUpdates.surah_name = updates.surahName;
      dbUpdates.title = updates.surahName;
    }
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    const { error } = await supabase.from("lessons").update(dbUpdates).eq("id", id);
    if (error) {
      toast.error("خطأ في التعديل");
      return false;
    }
    toast.success("تم التعديل بنجاح");
    return true;
  };

  const deleteLesson = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from("lessons").delete().eq("id", id);
    if (error) {
      toast.error("خطأ في الحذف");
      return false;
    }
    toast.success("تم الحذف بنجاح");
    return true;
  };

  return { lessons, loading, addLesson, updateLesson, deleteLesson, refetch: fetchLessons };
}
