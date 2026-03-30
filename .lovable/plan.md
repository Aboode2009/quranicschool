

# إزالة رقم الورشة من إضافة الورشة + فلترة حسب المشرف

## الفكرة
الورشة تكون مثل المحاضرة تماماً — يضاف اسم الورشة + تاريخ + نوع الدورة + ملاحظات فقط (بدون رقم ورشة). عند دخول المشرف على أي ورشة، يشوف فقط طلاب ورشته المحددة (حسب `supervisedWorkshop`). الأدمن ومدير الدورة يشوفون الكل.

## التعديلات

### 1. `src/components/AddLessonDialog.tsx`
- إزالة قسم `WORKSHOP_NUMBERS` من عرض الورشة (سطور 191-209)
- إبقاء فقط: اسم الورشة → تاريخ → نوع الدورة (`COURSE_TYPES`) → ملاحظات
- إزالة `workshopNumber` من `handleSubmit`

### 2. `src/pages/WorkshopAttendancePage.tsx`
- استيراد `userRole` و `supervisedWorkshop` من `useAuth()`
- تغيير استعلام الأسماء (سطر 55):
  - **المشرف**: فلترة حسب `supervisedWorkshop` → `query.eq("workshop_number", supervisedWorkshop)`
  - **الأدمن/مدير الدورة**: عرض جميع طلاب الورشة (بدون فلتر `workshop_number`)

```typescript
const { permissions, userRole, supervisedWorkshop } = useAuth();

// في fetchData:
let peopleQuery = supabase.from("people").select("id, name, workshop_number").eq("category", "warasha");

if (userRole === "supervisor" && supervisedWorkshop) {
  peopleQuery = peopleQuery.eq("workshop_number", supervisedWorkshop);
}
```

### 3. `src/pages/WarashaPage.tsx`
- إزالة عرض `courseType` من تفاصيل الورشة في القائمة (اختياري — أو إبقاؤه للتوضيح)

### الملفات المتأثرة
- `src/components/AddLessonDialog.tsx` — إزالة رقم الورشة
- `src/pages/WorkshopAttendancePage.tsx` — فلترة حسب المشرف
- `src/pages/WarashaPage.tsx` — تحديث العرض

