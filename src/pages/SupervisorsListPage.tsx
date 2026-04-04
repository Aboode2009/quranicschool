import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCheck, Plus, Trash2, ChevronLeft, Pencil, X, Save, Phone, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Supervisor {
  id: string;
  name: string;
  phone?: string | null;
  created_at: string;
}

const SupervisorsListPage = ({ onBack }: { onBack: () => void }) => {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  useEffect(() => { fetchSupervisors(); }, []);

  const fetchSupervisors = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("supervisors").select("*").order("created_at", { ascending: true });
    if (!error) setSupervisors((data as Supervisor[]) || []);
    setLoading(false);
  };

  const addSupervisor = async () => {
    const name = newName.trim();
    if (!name) { toast.error("اكتب اسم المشرف"); return; }
    const { data, error } = await supabase
      .from("supervisors").insert({ name, phone: newPhone.trim() || null }).select().single();
    if (error) { toast.error("خطأ في الإضافة"); return; }
    setSupervisors((prev) => [...prev, data as Supervisor]);
    setNewName(""); setNewPhone(""); setShowAdd(false);
    toast.success("تم إضافة المشرف ✓");
  };

  const startEdit = (s: Supervisor) => {
    setEditingId(s.id); setEditName(s.name); setEditPhone(s.phone || "");
  };

  const saveEdit = async () => {
    const name = editName.trim();
    if (!name) { toast.error("اكتب الاسم"); return; }
    const { error } = await supabase
      .from("supervisors").update({ name, phone: editPhone.trim() || null }).eq("id", editingId!);
    if (error) { toast.error("خطأ في التعديل"); return; }
    setSupervisors((prev) => prev.map((s) => s.id === editingId ? { ...s, name, phone: editPhone.trim() || null } : s));
    setEditingId(null);
    toast.success("تم التعديل ✓");
  };

  const deleteSupervisor = async (id: string) => {
    const { error } = await supabase.from("supervisors").delete().eq("id", id);
    if (error) { toast.error("خطأ في الحذف"); return; }
    setSupervisors((prev) => prev.filter((s) => s.id !== id));
    toast.success("تم الحذف");
  };

  const filtered = supervisors.filter((s) => !search || s.name.includes(search));
  const inputClass = "w-full px-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <div className="px-4 pt-3 pb-2">
        <button onClick={onBack} className="flex items-center gap-1 text-primary text-sm font-medium mb-3">
          <ChevronLeft className="w-4 h-4 rotate-180" /><span>رجوع</span>
        </button>
        <h1 className="text-2xl font-bold text-foreground mb-1">أسماء المشرفين</h1>
        <p className="text-sm text-muted-foreground mb-3">{supervisors.length} مشرف مسجل</p>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث..."
            className="w-full pr-9 pl-4 py-2.5 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm outline-none" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Add Form */}
        <AnimatePresence>
          {showAdd && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="ios-card px-4 py-4 flex flex-col gap-3 mt-3">
              <p className="text-sm font-bold text-foreground">مشرف جديد</p>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSupervisor()}
                placeholder="اسم المشرف *" autoFocus className={inputClass} />
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="رقم الهاتف (اختياري)" className={`${inputClass} pr-9`} />
              </div>
              <div className="flex gap-2">
                <button onClick={addSupervisor} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold active:scale-[0.97] transition-transform">
                  إضافة
                </button>
                <button onClick={() => { setShowAdd(false); setNewName(""); setNewPhone(""); }}
                  className="px-4 py-2.5 rounded-xl bg-secondary text-muted-foreground text-sm font-semibold">
                  إلغاء
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground"><p>جاري التحميل...</p></div>
        ) : filtered.length === 0 && !showAdd ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <UserCheck className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-base font-medium">لا يوجد مشرفون</p>
            <p className="text-sm mt-1">اضغط + لإضافة مشرف جديد</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 mt-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((sup, i) => (
                <motion.div key={sup.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40 }} transition={{ delay: i * 0.03 }} className="ios-card overflow-hidden">

                  {editingId === sup.id ? (
                    /* Edit mode */
                    <div className="px-4 py-4 flex flex-col gap-3">
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClass} />
                      <div className="relative">
                        <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="رقم الهاتف" className={`${inputClass} pr-9`} />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={saveEdit} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-1.5">
                          <Save className="w-3.5 h-3.5" /> حفظ
                        </button>
                        <button onClick={() => setEditingId(null)} className="px-4 py-2.5 rounded-xl bg-secondary text-muted-foreground text-sm font-semibold">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View mode */
                    <div className="px-4 py-3.5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <UserCheck className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-semibold text-foreground">{sup.name}</p>
                        {sup.phone && (
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Phone className="w-3 h-3" />{sup.phone}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => startEdit(sup)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteSupervisor(sup.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {!showAdd && (
        <div className="px-4 pb-4">
          <button onClick={() => setShowAdd(true)}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.97] transition-transform">
            <Plus className="w-5 h-5" /> إضافة مشرف
          </button>
        </div>
      )}
    </div>
  );
};

export default SupervisorsListPage;
