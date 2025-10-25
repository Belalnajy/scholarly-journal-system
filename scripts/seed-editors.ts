import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// بيانات المحررين
const editors = [
  {
    name: 'أ.د. محمد أحمد السالم',
    email: 'mohamed.salem@university.edu.sa',
    password: 'Editor@123',
    role: 'editor',
    affiliation: 'جامعة الملك سعود',
    department: 'كلية التربية',
    specialization: 'التربية المقارنة والإدارة التعليمية',
    academic_degree: 'professor',
    phone: '+966501234567',
  },
  {
    name: 'أ.د. فاطمة عبدالله المطيري',
    email: 'fatima.almutairi@university.edu.sa',
    password: 'Editor@123',
    role: 'editor',
    affiliation: 'جامعة الإمام محمد بن سعود الإسلامية',
    department: 'كلية العلوم الاجتماعية',
    specialization: 'علم النفس التربوي والإرشاد النفسي',
    academic_degree: 'professor',
    phone: '+966502345678',
  },
  {
    name: 'أ.د. خالد محمد الزهراني',
    email: 'khaled.alzahrani@university.edu.sa',
    password: 'Editor@123',
    role: 'editor',
    affiliation: 'جامعة أم القرى',
    department: 'كلية علوم الحاسب',
    specialization: 'الذكاء الاصطناعي والتعلم الآلي',
    academic_degree: 'professor',
    phone: '+966503456789',
  },
  {
    name: 'أ.د. سارة عبدالرحمن الغامدي',
    email: 'sarah.alghamdi@university.edu.sa',
    password: 'Editor@123',
    role: 'editor',
    affiliation: 'جامعة الملك عبدالعزيز',
    department: 'كلية الآداب والعلوم الإنسانية',
    specialization: 'الأدب العربي والنقد الأدبي',
    academic_degree: 'professor',
    phone: '+966504567890',
  },
  {
    name: 'أ.د. عبدالله حسن القحطاني',
    email: 'abdullah.alqahtani@university.edu.sa',
    password: 'Editor@123',
    role: 'editor',
    affiliation: 'جامعة الملك فهد للبترول والمعادن',
    department: 'كلية إدارة الأعمال',
    specialization: 'الاقتصاد الإسلامي والتمويل',
    academic_degree: 'professor',
    phone: '+966505678901',
  },
  {
    name: 'أ.د. نورة سعد العتيبي',
    email: 'noura.alotaibi@university.edu.sa',
    password: 'Editor@123',
    role: 'editor',
    affiliation: 'جامعة الأميرة نورة بنت عبدالرحمن',
    department: 'كلية الخدمة الاجتماعية',
    specialization: 'علم الاجتماع والتنمية المجتمعية',
    academic_degree: 'associate-professor',
    phone: '+966506789012',
  },
  {
    name: 'أ.د. يوسف إبراهيم الشمري',
    email: 'yousef.alshammari@university.edu.sa',
    password: 'Editor@123',
    role: 'editor',
    affiliation: 'جامعة الملك خالد',
    department: 'كلية الشريعة وأصول الدين',
    specialization: 'الفقه الإسلامي وأصوله',
    academic_degree: 'professor',
    phone: '+966507890123',
  },
  {
    name: 'أ.د. هدى علي الدوسري',
    email: 'huda.aldosari@university.edu.sa',
    password: 'Editor@123',
    role: 'editor',
    affiliation: 'جامعة القصيم',
    department: 'كلية العلوم الطبية التطبيقية',
    specialization: 'الصحة العامة والوقاية',
    academic_degree: 'associate-professor',
    phone: '+966508901234',
  },
  {
    name: 'أ.د. أحمد سليمان الحربي',
    email: 'ahmed.alharbi@university.edu.sa',
    password: 'Editor@123',
    role: 'editor',
    affiliation: 'جامعة طيبة',
    department: 'كلية الهندسة',
    specialization: 'الهندسة الكهربائية والطاقة المتجددة',
    academic_degree: 'professor',
    phone: '+966509012345',
  },
  {
    name: 'أ.د. ريم محمد العنزي',
    email: 'reem.alanazi@university.edu.sa',
    password: 'Editor@123',
    role: 'editor',
    affiliation: 'جامعة الجوف',
    department: 'كلية اللغات والترجمة',
    specialization: 'اللغويات التطبيقية والترجمة',
    academic_degree: 'associate-professor',
    phone: '+966500123456',
  },
];

async function seedEditors() {
  console.log('🌱 بدء إضافة المحررين...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const editor of editors) {
    try {
      const response = await axios.post(`${API_BASE_URL}/users`, editor);
      console.log(`✅ تم إضافة: ${editor.name}`);
      successCount++;
    } catch (error: any) {
      if (error.response?.status === 409) {
        console.log(`⚠️  موجود مسبقاً: ${editor.name}`);
      } else {
        console.log(`❌ فشل: ${editor.name} - ${error.message}`);
        errorCount++;
      }
    }
  }

  console.log('\n📊 النتائج:');
  console.log(`✅ تم الإضافة بنجاح: ${successCount}`);
  console.log(`❌ فشل: ${errorCount}`);
  console.log(`⚠️  موجود مسبقاً: ${editors.length - successCount - errorCount}`);
  console.log('\n✨ تم الانتهاء!');
}

// تشغيل السكريبت
seedEditors().catch(console.error);
