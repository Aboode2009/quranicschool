import { motion } from "framer-motion";
import { Users, Plus } from "lucide-react";

const WarashaPage = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold text-foreground">الورشة</h1>
          <button className="ios-button w-9 h-9 flex items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Plus className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-muted-foreground"
        >
          <Users className="w-16 h-16 mb-4 opacity-20" strokeWidth={1.5} />
          <p className="text-lg font-medium">صفحة الورشة</p>
          <p className="text-sm mt-1">قريباً...</p>
        </motion.div>
      </div>
    </div>
  );
};

export default WarashaPage;
