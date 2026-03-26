

# تعديل نموذج إضافة الورشة + صلاحيات الإنشاء

## التعديلات المطلوبة

### 1. ترتيب حقول نموذج إضافة الورشة
في `AddLessonDialog.tsx`، عند عرض نموذج الورشة (`showWorkshopNumber`):
- **اسم الورشة** (موجود)
- **تاريخ الورشة** (موجود)
- **نوع الدورة** — نفس الدورات الموجودة بالمحاضرة (دورة اليقظة الايمانية، دورة التربية الايمانية...)، نعرض `COURSE_TYPES` بدلاً من `WORKSHOP_NUMBERS` (رقم الورشة)
- **ملاحظات** (موجود بالأسفل)

**ملاحظة**: رقم الورشة (ورشة أولى، ثانية...) يبقى مرتبط بالأشخاص وليس بالورشة نفسها، فالورشة تتبع لدورة معينة.

### 2. تقييد صلاحية الإنشاء للأدمن ومدير الدورة فقط
في `useAuth.tsx`، تعديل صلاحيات المشرف:
- `canCreateLessons: false` (بدلاً من `true`)
- `canCreateWorkshops: false` (بدلاً من `true`)

المشرف يبقى يقدر يدير الحضور والغياب فقط.

## التفاصيل التقنية

### `src/components/AddLessonDialog.tsx`
- عند `showWorkshopNumber`: عرض `COURSE_TYPES` بدلاً من `WORKSHOP_NUMBERS` وحفظ القيمة في `courseType`
- إزالة عرض `WORKSHOP_NUMBERS` من نموذج الورشة (يبقى فقط عند إضافة شخص)

### `src/hooks/useAuth.tsx`
```typescript
case "supervisor":
  return {
    canCreateLessons: false,  // كان true
    canCreateWorkshops: false, // كان true
    ...
  };
```

### الملفات المتأثرة
- `src/components/AddLessonDialog.tsx` — تغيير ترتيب وعرض حقول الورشة
- `src/hooks/useAuth.tsx` — تقييد صلاحيات المشرف

