import { motion } from "framer-motion";
import { Settings, Palette, Info, Trash2 } from "lucide-react";

const SettingsPage = () => {
  return (
    <div className="flex flex-col h-full" dir="rtl">
      <div className="px-4 pt-3 pb-2">
        <h1 className="text-2xl font-bold text-foreground mb-1">الإعدادات</h1>
        <p className="text-sm text-muted-foreground">إعدادات التطبيق</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col gap-3 mt-3">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
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
