

# إضافة مؤشر "تم تسجيل الحضور" على قائمة المحاضرات والورشات

## الفكرة
عند عرض قائمة المحاضرات أو الورشات، يظهر مؤشر بصري (علامة ✓ خضراء أو أيقونة) على كل محاضرة/ورشة تم تسجيل حضورها مسبقاً. هذا يساعد الأدمن على معرفة أي المشرفين أكملوا عملهم وأيهم لا.

## التعديلات

### 1. `src/pages/MuhaderaPage.tsx`
- عند تحميل الصفحة، جلب قائمة `lesson_name` المميزة من جدول `attendance` لمعرفة أي محاضرات تم تسجيل حضورها
- إضافة state: `completedLessons` (مجموعة Set من IDs المحاضرات المسجّلة)
- على كل كارت محاضرة: إذا كان الـ ID موجود في `completedLessons`، يظهر شارة خضراء صغيرة "تم التسجيل ✓" أو تتغير أيقونة الكتاب إلى لون أخضر

### 2. `src/pages/WarashaPage.tsx`
- نفس التعديل بالضبط

### الشكل البصري
- أيقونة الدرس تتحول من `bg-primary/10` إلى `bg-green-100` مع أيقونة خضراء عندما يكون الحضور مسجّل
- نص صغير "تم ✓" بلون أخضر يظهر بجانب التاريخ
- المحاضرات غير المسجّلة تبقى بالشكل العادي

### تفاصيل تقنية
```typescript
// جلب المحاضرات المسجّلة
const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

useEffect(() => {
  const fetchCompleted = async () => {
    const { data } = await supabase
      .from("attendance")
      .select("lesson_name");
    if (data) {
      setCompletedLessons(new Set(data.map(r => r.lesson_name)));
    }
  };
  fetchCompleted();
}, []);

// في الكارت:
const isCompleted = completedLessons.has(lesson.id);
// تغيير لون الأيقونة والخلفية بناءً على isCompleted
```

### الملفات المتأثرة
- `src/pages/MuhaderaPage.tsx`
- `src/pages/WarashaPage.tsx`

