

# إضافة بحث وفلترة حسب نوع الدورة في المحاضرة والورشة

## الفكرة
إضافة شريط بحث بالاسم + أزرار فلترة حسب نوع الدورة (الأربعة أنواع) في كل من صفحة المحاضرة وصفحة الورشة. عند الضغط على نوع دورة معين، تظهر فقط المحاضرات/الورشات التابعة لتلك الدورة.

## التعديلات

### 1. `src/pages/MuhaderaPage.tsx`
- إضافة state للبحث (`searchQuery`) وفلتر الدورة (`courseFilter`)
- إضافة حقل بحث (Input) تحت العنوان مباشرة مع أيقونة بحث
- إضافة صف أزرار أفقي قابل للتمرير يحتوي على أنواع الدورات الأربعة + زر "الكل"
- فلترة `lessons` حسب `searchQuery` (بحث في `surahName`) و `courseFilter` (مطابقة `courseType`)

### 2. `src/pages/WarashaPage.tsx`
- نفس التعديلات: بحث بالاسم + فلترة حسب نوع الدورة
- فلترة `workshops` بنفس المنطق

### منطق الفلترة (مشترك)
```typescript
const [searchQuery, setSearchQuery] = useState("");
const [courseFilter, setCourseFilter] = useState<string | null>(null);

const filteredLessons = lessons.filter((lesson) => {
  const matchesSearch = !searchQuery || lesson.surahName.includes(searchQuery);
  const matchesCourse = !courseFilter || lesson.courseType === courseFilter;
  return matchesSearch && matchesCourse;
});
```

### واجهة البحث والفلترة
- حقل بحث مع أيقونة Search من lucide
- صف أزرار أفقي: "الكل" + الدورات الأربعة — الزر النشط يكون بلون `primary`، الباقي بلون فاتح
- عند الضغط على نفس الفلتر مرة ثانية يُلغى (يرجع "الكل")

### الملفات المتأثرة
- `src/pages/MuhaderaPage.tsx`
- `src/pages/WarashaPage.tsx`

