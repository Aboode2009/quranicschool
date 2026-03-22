

# تعديلات على صفحة حضور الورشة

## التعديلات المطلوبة

### 1. إضافة خيار التوقيت عند اختيار "حاضر"
- عند اختيار "حاضر"، يظهر سؤال جديد: **التوقيت** مع خيارين: "على الوقت" أو "متأخر"
- إضافة حقل `timing` إلى `WorkshopDetail` interface (موجود بالفعل في جدول attendance)
- حفظ القيمة مع سجل الحضور

### 2. تغيير ألوان خيارات "هل قرأ المادة؟"
- **نعم** → أخضر (`bg-green-500 text-white`) ✓
- **لم يكمل** → برتقالي (`bg-orange-500 text-white`) بدلاً من اللون الحالي
- **لا** → أحمر (`bg-destructive text-destructive-foreground`) ✓ (موجود)

### الملفات المتأثرة
- `src/pages/WorkshopAttendancePage.tsx`:
  - إضافة `timing` إلى interface وstate
  - إضافة قسم التوقيت بعد أزرار الحالة مباشرة (عند الحضور)
  - تغيير `activeClass` لـ "لم يكمل" إلى `bg-orange-500 text-white`
  - تغيير `activeClass` لـ "نعم" إلى `bg-green-500 text-white`
  - حفظ وقراءة `timing` من/إلى قاعدة البيانات

