

# تعديل الحضور بعد الحفظ

## الوضع الحالي
النظام **يدعم التعديل فعلياً** — عند الدخول على درس محفوظ، البيانات تُحمّل من قاعدة البيانات وتظهر الحالة السابقة. عند الحفظ مجدداً، يتم حذف القديم وإدراج الجديد. البروفايل والإكسل يقرأون من نفس الجدول فأي تعديل ينعكس تلقائياً.

## ما يحتاج تحسين
تغيير نص زر الحفظ ليكون واضحاً:
- إذا كان الحضور محفوظ مسبقاً → **"تعديل الحضور"**
- إذا كان جديد → **"حفظ الحضور"**

## التعديلات

### 1. `src/pages/LessonAttendancePage.tsx`
- إضافة state `isEditing` يتحدد عند `fetchData` — إذا وجدنا سجلات حضور سابقة يكون `true`
- تغيير نص الزر: `{isEditing ? "تعديل الحضور" : "حفظ الحضور"}`

### 2. `src/pages/WorkshopAttendancePage.tsx`
- نفس التعديل: إضافة `isEditing` وتغيير نص الزر

## تفاصيل تقنية

```typescript
// في كلا الملفين:
const [isEditing, setIsEditing] = useState(false);

// في fetchData بعد جلب بيانات الحضور:
const hasExistingData = (attRes.data || []).length > 0;
setIsEditing(hasExistingData);

// الزر:
{saving ? "جاري الحفظ..." : isEditing ? "تعديل الحضور" : "حفظ الحضور"}
```

### الملفات المتأثرة
- `src/pages/LessonAttendancePage.tsx`
- `src/pages/WorkshopAttendancePage.tsx`

