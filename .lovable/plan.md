

# فلترة أسماء المحاضرة حسب ورشة المشرف

## المشكلة
المشرف المسؤول عن ورشة معينة (مثلاً ورشة واحد) عند دخوله على حضور المحاضرة يرى جميع الأسماء. المطلوب أن يرى فقط الأسماء المسجلة في ورشته.

## الحل
تعديل `src/pages/LessonAttendancePage.tsx` في دالة `fetchData`:
- جلب `supervisedWorkshop` من `useAuth()`
- إذا كان المستخدم مشرف (`userRole === "supervisor"`)، نجلب أسماء الورشة (`category: warasha` + `workshop_number` = ورشته) بدلاً من أسماء المحاضرة العامة
- الأدمن ومدير الدورة يبقون يشوفون جميع الأسماء كالمعتاد

## التفاصيل التقنية

```typescript
const { permissions, userRole, supervisedWorkshop } = useAuth();

// في fetchData:
let query = supabase.from("people").select("id, name");

if (userRole === "supervisor" && supervisedWorkshop) {
  // المشرف يشوف فقط طلاب ورشته
  query = query.eq("category", "warasha").eq("workshop_number", supervisedWorkshop);
} else {
  query = query.eq("category", category);
}
```

### الملف المتأثر
- `src/pages/LessonAttendancePage.tsx` — تعديل استعلام جلب الأسماء فقط

