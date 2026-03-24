

# ثلاث تعديلات مطلوبة

## 1. فلترة أسماء الورشة حسب رقمها
**المشكلة**: عند الدخول على ورشة معينة (مثلاً "ورشة أولى")، تظهر جميع الأسماء بدلاً من أسماء تلك الورشة فقط.

**الحل**: في `WorkshopAttendancePage.tsx`، عند جلب الأسماء، نضيف فلتر على `workshop_number` بحيث يطابق `lesson.courseType` (الذي يخزن رقم الورشة مثل "ورشة أولى").

```typescript
// قبل
supabase.from("people").select("...").eq("category", "warasha")

// بعد
supabase.from("people").select("...").eq("category", "warasha").eq("workshop_number", lesson.courseType)
```

**ملف**: `src/pages/WorkshopAttendancePage.tsx` — سطر 55

---

## 2. إصلاح مشكلة التاريخ (ينقص يوم)
**المشكلة**: عند اختيار تاريخ مثل 1/7، يُحفظ كـ 30/6 بسبب تحويل `toISOString()` الذي يستخدم UTC.

**الحل**: في `AddLessonDialog.tsx`، استبدال `toISOString()` بتنسيق يدوي يحترم التوقيت المحلي:

```typescript
// قبل
const dateStr = selectedDate.toISOString().split("T")[0];

// بعد
const y = selectedDate.getFullYear();
const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
const d = String(selectedDate.getDate()).padStart(2, "0");
const dateStr = `${y}-${m}-${d}`;
```

**ملف**: `src/components/AddLessonDialog.tsx` — سطر 65

---

## 3. حظر وإلغاء حظر المستخدمين من لوحة التحكم
**المشكلة**: الأدمن لا يستطيع حظر أو إلغاء حظر حسابات المستخدمين.

**الحل**:
- إنشاء Edge Function جديدة (`manage-user`) تستخدم Supabase Admin API لتعطيل/تفعيل المستخدم (`ban_duration` أو إزالة الحظر)
- إضافة أزرار "حظر" و"إلغاء حظر" في `AdminPage.tsx` بجانب كل مستخدم
- عند الحظر: يتم تعطيل الحساب ولا يستطيع المستخدم تسجيل الدخول
- عند إلغاء الحظر: يعود الحساب للعمل بشكل طبيعي

**الملفات**:
- `supabase/functions/manage-user/index.ts` — Edge Function جديدة
- `src/pages/AdminPage.tsx` — إضافة أزرار الحظر/إلغاء الحظر

