import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Users, UserPlus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Person {
  id: string;
  name: string;
}

interface AttendancePageProps {
  category?: string;
  title?: string;
  subtitle?: string;
}

const AttendancePage = ({ category = "muhadera", title = "الأسماء", subtitle = "قائمة الأشخاص المسجلين" }: AttendancePageProps) => {
  const [people, setPeople] = useState<Person[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPeople();
  }, []);

  const fetchPeople = async () => {
    const { data, error } = await supabase
      .from("people")
      .select("id, name")
      .eq("category", category)
      .order("created_at", { ascending: true });

    if (error) {
      toast.error("خطأ في تحميل الأسماء");
    } else {
      setPeople(data || []);
    }
    setLoading(false);
  };

  const addPerson = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    const { data, error } = await supabase
      .from("people")
      .insert({ name: trimmed, category })
      .select()
      .single();

    if (error) {
      toast.error("خطأ في إضافة الاسم");
    } else if (data) {
      setPeople((prev) => [...prev, data]);
      setNewName("");
      toast.success(`تمت إضافة ${trimmed}`);
    }
  };

  const deletePerson = async (id: string, name: string) => {
    const { error } = await supabase.from("people").delete().eq("id", id);
    if (error) {
      toast.error("خطأ في الحذف");
    } else {
      setPeople((prev) => prev.filter((p) => p.id !== id));
      toast.success(`تم حذف ${name}`);
    }
  };

  return (
    <div className="flex flex-col h-full" dir="rtl">
      {/* Header */}
      <div className="px-4 pt-3 pb-2">
        <h1 className="text-2xl font-bold text-foreground mb-1">الأسماء</h1>
        <p className="text-sm text-muted-foreground">قائمة الأشخاص المسجلين</p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <p>جاري التحميل...</p>
          </div>
        ) : people.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-muted-foreground"
          >
            <Users className="w-10 h-10 mb-3 opacity-30" strokeWidth={1.5} />
            <p className="text-base font-medium">لا توجد أسماء بعد</p>
            <p className="text-sm mt-1">أضف الأسماء من الأسفل</p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
              {people.map((person, i) => (
                <motion.div
                  key={person.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ delay: i * 0.03 }}
                  className="ios-card px-4 py-3.5 flex items-center justify-between"
                >
                  <span className="text-[15px] font-medium text-foreground">{person.name}</span>
                  <button
                    onClick={() => deletePerson(person.id, person.name)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add person */}
      <div className="px-4 pb-4 flex gap-2">
        <input
          type="text"
          placeholder="اسم الشخص"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addPerson()}
          className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={addPerson}
          className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-1.5"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة</span>
        </button>
      </div>
    </div>
  );
};

export default AttendancePage;
