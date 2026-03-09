import { motion } from "framer-motion";
import { ClipboardCheck } from "lucide-react";

const TaqyeemPage = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-3 pb-2">
        <h1 className="text-2xl font-bold text-foreground">التقييم</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-muted-foreground"
        >
          <ClipboardCheck className="w-16 h-16 mb-4 opacity-20" strokeWidth={1.5} />
          <p className="text-lg font-medium">صفحة التقييم</p>
          <p className="text-sm mt-1">قريباً...</p>
        </motion.div>
      </div>
    </div>
  );
};

export default TaqyeemPage;
