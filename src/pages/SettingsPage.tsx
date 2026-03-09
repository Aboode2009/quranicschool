import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Info, DollarSign, ChevronLeft, Plus, Trash2, TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight, Wallet, ClipboardList } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FinanceRecord {
  id: string;
  type: string;
  amount: number;
  description: string;
  date: string;
}

const FinancePage = ({ onBack }: { onBack: () => void }) => {
  const [activeTab, setActiveTab] = useState<"income" | "expense">("income");
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  useEffect(() => {
    fetchRecords();
    fetchTotals();
  }, [activeTab]);

  const fetchTotals = async () => {
    const { data: incomeData } = await supabase
      .from("finances")
      .select("amount")
      .eq("type", "income");
    const { data: expenseData } = await supabase
      .from("finances")
      .select("amount")
      .eq("type", "expense");
    setTotalIncome((incomeData || []).reduce((s, r) => s + Number(r.amount), 0));
    setTotalExpense((expenseData || []).reduce((s, r) => s + Number(r.amount), 0));
  };

  const fetchRecords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("finances")
      .select("*")
      .eq("type", activeTab)
      .order("date", { ascending: false });

    if (error) {
      toast.error("خطأ في تحميل البيانات");
    } else {
      setRecords((data as FinanceRecord[]) || []);
    }
    setLoading(false);
  };

  const addRecord = async () => {
    const trimmedDesc = description.trim();
    const numAmount = parseFloat(amount);
    if (!trimmedDesc || isNaN(numAmount) || numAmount <= 0) {
      toast.error("يرجى إدخال المبلغ والوصف");
      return;
    }

    const { data, error } = await supabase
      .from("finances")
      .insert({
        type: activeTab,
        amount: numAmount,
        description: trimmedDesc,
        date: new Date().toISOString().split("T")[0],
      })
      .select()
      .single();

    if (error) {
      toast.error("خطأ في الإضافة");
    } else if (data) {
      setRecords((prev) => [data as FinanceRecord, ...prev]);
      setAmount("");
      setDescription("");
      setShowAdd(false);
      toast.success("تمت الإضافة بنجاح");
      fetchTotals();
    }
  };

  const deleteRecord = async (id: string) => {
    const { error } = await supabase.from("finances").delete().eq("id", id);
    if (error) {
      toast.error("خطأ في الحذف");
    } else {
      setRecords((prev) => prev.filter((r) => r.id !== id));
      toast.success("تم الحذف");
      fetchTotals();
    }
  };

  const total = records.reduce((sum, r) => sum + Number(r.amount), 0);

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <div className="px-4 pt-3 pb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-primary text-sm font-medium mb-3"
        >
          <ChevronLeft className="w-4 h-4 rotate-180" />
          <span>رجوع</span>
        </button>
        <h1 className="text-2xl font-bold text-foreground mb-3">الأمور المالية</h1>

        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-xl bg-secondary">
          <button
            onClick={() => { setActiveTab("income"); setShowAdd(false); }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "income"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            الإيرادات
          </button>
          <button
            onClick={() => { setActiveTab("expense"); setShowAdd(false); }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "expense"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            المصروفات
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Net Balance Summary */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="ios-card p-4 mt-3"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">الرصيد الصافي</p>
              <p className={`text-2xl font-bold ${(totalIncome - totalExpense) >= 0 ? "text-accent" : "text-destructive"}`}>
                {(totalIncome - totalExpense).toLocaleString()} <span className="text-sm font-medium">د.ع</span>
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 rounded-xl bg-accent/5 p-2.5 text-center">
              <p className="text-[11px] text-muted-foreground">الإيرادات</p>
              <p className="text-sm font-bold text-accent">{totalIncome.toLocaleString()}</p>
            </div>
            <div className="flex-1 rounded-xl bg-destructive/5 p-2.5 text-center">
              <p className="text-[11px] text-muted-foreground">المصروفات</p>
              <p className="text-sm font-bold text-destructive">{totalExpense.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>
        {/* Total card */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`ios-card p-4 mt-3 flex items-center gap-3`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            activeTab === "income" ? "bg-accent/10" : "bg-destructive/10"
          }`}>
            {activeTab === "income" ? (
              <TrendingUp className="w-6 h-6 text-accent" />
            ) : (
              <TrendingDown className="w-6 h-6 text-destructive" />
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {activeTab === "income" ? "إجمالي الإيرادات" : "إجمالي المصروفات"}
            </p>
            <p className={`text-2xl font-bold ${activeTab === "income" ? "text-accent" : "text-destructive"}`}>
              {total.toLocaleString()} <span className="text-sm font-medium">د.ع</span>
            </p>
          </div>
        </motion.div>

        {/* Add form */}
        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="ios-card p-4 mt-3 flex flex-col gap-3"
            >
              <input
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="المبلغ"
                className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={activeTab === "income" ? "مصدر الإيراد" : "وصف المصروف"}
                className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              <div className="flex gap-2">
                <button
                  onClick={addRecord}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold active:scale-[0.97] transition-transform"
                >
                  إضافة
                </button>
                <button
                  onClick={() => setShowAdd(false)}
                  className="py-3 px-5 rounded-xl bg-secondary text-muted-foreground text-sm font-semibold active:scale-[0.97] transition-transform"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Records list */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <p>جاري التحميل...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <DollarSign className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-base font-medium">
              {activeTab === "income" ? "لا توجد إيرادات بعد" : "لا توجد مصروفات بعد"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 mt-3">
            <AnimatePresence mode="popLayout">
              {records.map((rec, i) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ delay: i * 0.03 }}
                  className="ios-card px-4 py-3.5 flex items-center gap-3"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    activeTab === "income" ? "bg-accent/10" : "bg-destructive/10"
                  }`}>
                    {activeTab === "income" ? (
                      <ArrowDownLeft className="w-4 h-4 text-accent" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-foreground truncate">{rec.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{rec.date}</p>
                  </div>
                  <p className={`text-sm font-bold shrink-0 ${
                    activeTab === "income" ? "text-accent" : "text-destructive"
                  }`}>
                    {Number(rec.amount).toLocaleString()}
                  </p>
                  <button
                    onClick={() => deleteRecord(rec.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add button */}
      {!showAdd && (
        <div className="px-4 pb-4">
          <button
            onClick={() => setShowAdd(true)}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
          >
            <Plus className="w-5 h-5" />
            <span>{activeTab === "income" ? "إضافة إيراد" : "إضافة مصروف"}</span>
          </button>
        </div>
      )}
    </div>
  );
};

const SessionNotesPage = ({ onBack }: { onBack: () => void }) => {
  const [notes, setNotes] = useState<{ id: string; content: string; date: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [content, setContent] = useState("");

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("session_notes")
      .select("*")
      .order("date", { ascending: false });
    if (!error) setNotes((data as any[]) || []);
    setLoading(false);
  };

  const addNote = async () => {
    if (!content.trim()) { toast.error("يرجى كتابة الملاحظة"); return; }
    const { data, error } = await supabase
      .from("session_notes")
      .insert({ content: content.trim(), date: new Date().toISOString().split("T")[0] })
      .select()
      .single();
    if (error) { toast.error("خطأ في الإضافة"); }
    else if (data) {
      setNotes((prev) => [data as any, ...prev]);
      setContent("");
      setShowAdd(false);
      toast.success("تمت الإضافة");
    }
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase.from("session_notes").delete().eq("id", id);
    if (error) { toast.error("خطأ في الحذف"); }
    else { setNotes((prev) => prev.filter((n) => n.id !== id)); toast.success("تم الحذف"); }
  };

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <div className="px-4 pt-3 pb-2">
        <button onClick={onBack} className="flex items-center gap-1 text-primary text-sm font-medium mb-3">
          <ChevronLeft className="w-4 h-4 rotate-180" /><span>رجوع</span>
        </button>
        <h1 className="text-2xl font-bold text-foreground mb-1">مقررات الجلسة</h1>
        <p className="text-sm text-muted-foreground">ملاحظات ومقررات كل جلسة</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="ios-card p-4 mt-3 flex flex-col gap-3"
            >
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="اكتب ملاحظة أو مقرر الجلسة..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
              <div className="flex gap-2">
                <button onClick={addNote} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold active:scale-[0.97] transition-transform">
                  إضافة
                </button>
                <button onClick={() => setShowAdd(false)} className="py-3 px-5 rounded-xl bg-secondary text-muted-foreground text-sm font-semibold active:scale-[0.97] transition-transform">
                  إلغاء
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground"><p>جاري التحميل...</p></div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <ClipboardList className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-base font-medium">لا توجد ملاحظات بعد</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 mt-3">
            <AnimatePresence mode="popLayout">
              {notes.map((note, i) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ delay: i * 0.03 }}
                  className="ios-card px-4 py-3.5"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <ClipboardList className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-semibold text-foreground whitespace-pre-wrap">{note.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">{note.date}</p>
                    </div>
                    <button onClick={() => deleteNote(note.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {!showAdd && (
        <div className="px-4 pb-4">
          <button onClick={() => setShowAdd(true)} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.97] transition-transform">
            <Plus className="w-5 h-5" /><span>إضافة ملاحظة</span>
          </button>
        </div>
      )}
    </div>
  );
};

const SettingsPage = () => {
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });
  const [showFinance, setShowFinance] = useState(false);
  const [showSessionNotes, setShowSessionNotes] = useState(false);

  const toggleDarkMode = () => {
    const newVal = !isDark;
    setIsDark(newVal);
    if (newVal) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  if (showFinance) {
    return <FinancePage onBack={() => setShowFinance(false)} />;
  }

  if (showSessionNotes) {
    return <SessionNotesPage onBack={() => setShowSessionNotes(false)} />;
  }

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <div className="px-4 pt-3 pb-2">
        <h1 className="text-2xl font-bold text-foreground mb-1">الإعدادات</h1>
        <p className="text-sm text-muted-foreground">إعدادات التطبيق</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col gap-3 mt-3">
          {/* Dark Mode Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="ios-card p-4 cursor-pointer active:scale-[0.98] transition-transform"
            onClick={toggleDarkMode}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                {isDark ? (
                  <Moon className="w-5 h-5 text-primary" />
                ) : (
                  <Sun className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-semibold text-foreground">الوضع الليلي</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isDark ? "مفعّل" : "غير مفعّل"}
                </p>
              </div>
              <div className={`w-12 h-7 rounded-full transition-colors flex items-center px-0.5 ${isDark ? "bg-primary" : "bg-muted"}`}>
                <div className={`w-6 h-6 rounded-full bg-card shadow-sm transition-transform ${isDark ? "-translate-x-5" : "translate-x-0"}`} />
              </div>
            </div>
          </motion.div>

          {/* Finance Page */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="ios-card p-4 cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => setShowFinance(true)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-semibold text-foreground">الأمور المالية</p>
                <p className="text-xs text-muted-foreground mt-0.5">إدارة الإيرادات والمصروفات</p>
              </div>
              <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180" />
            </div>
          </motion.div>

          {/* About */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="ios-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Info className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-foreground">حول التطبيق</p>
                <p className="text-xs text-muted-foreground mt-0.5">نظام إدارة الحضور - الإصدار 1.0</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
