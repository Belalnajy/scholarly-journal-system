const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// بيانات المراجعين
const reviewers = [
  {
    name: 'د. أحمد محمود الشهري',
    email: 'ahmed.alshehri@reviewer.edu.sa',
    password: 'Reviewer@123',
    role: 'reviewer',
    affiliation: 'جامعة الملك سعود',
    department: 'كلية علوم الحاسب والمعلومات',
    specialization: 'الذكاء الاصطناعي وتطبيقاته',
    academic_degree: 'phd',
    phone: '+966511111111',
  },
  {
    name: 'د. فاطمة علي القحطاني',
    email: 'fatima.alqahtani@reviewer.edu.sa',
    password: 'Reviewer@123',
    role: 'reviewer',
    affiliation: 'جامعة الإمام محمد بن سعود الإسلامية',
    department: 'كلية التربية',
    specialization: 'علم النفس التربوي',
    academic_degree: 'phd',
    phone: '+966512222222',
  },
  {
    name: 'د. خالد عبدالله العتيبي',
    email: 'khaled.alotaibi@reviewer.edu.sa',
    password: 'Reviewer@123',
    role: 'reviewer',
    affiliation: 'جامعة الملك عبدالعزيز',
    department: 'كلية الآداب والعلوم الإنسانية',
    specialization: 'اللغة العربية وآدابها',
    academic_degree: 'phd',
    phone: '+966513333333',
  },
  {
    name: 'د. نورة سعد الغامدي',
    email: 'noura.alghamdi@reviewer.edu.sa',
    password: 'Reviewer@123',
    role: 'reviewer',
    affiliation: 'جامعة الأميرة نورة بنت عبدالرحمن',
    department: 'كلية العلوم الاجتماعية',
    specialization: 'علم الاجتماع',
    academic_degree: 'phd',
    phone: '+966514444444',
  },
  {
    name: 'د. محمد حسن الدوسري',
    email: 'mohammed.aldosari@reviewer.edu.sa',
    password: 'Reviewer@123',
    role: 'reviewer',
    affiliation: 'جامعة الملك فهد للبترول والمعادن',
    department: 'كلية الهندسة',
    specialization: 'الهندسة الكهربائية',
    academic_degree: 'phd',
    phone: '+966515555555',
  },
  {
    name: 'د. سارة إبراهيم المطيري',
    email: 'sarah.almutairi@reviewer.edu.sa',
    password: 'Reviewer@123',
    role: 'reviewer',
    affiliation: 'جامعة أم القرى',
    department: 'كلية الشريعة والدراسات الإسلامية',
    specialization: 'الفقه وأصوله',
    academic_degree: 'phd',
    phone: '+966516666666',
  },
  {
    name: 'د. عبدالرحمن يوسف الزهراني',
    email: 'abdulrahman.alzahrani@reviewer.edu.sa',
    password: 'Reviewer@123',
    role: 'reviewer',
    affiliation: 'جامعة الملك خالد',
    department: 'كلية العلوم',
    specialization: 'الرياضيات التطبيقية',
    academic_degree: 'phd',
    phone: '+966517777777',
  },
  {
    name: 'د. منى أحمد الحربي',
    email: 'mona.alharbi@reviewer.edu.sa',
    password: 'Reviewer@123',
    role: 'reviewer',
    affiliation: 'جامعة طيبة',
    department: 'كلية الطب',
    specialization: 'الصحة العامة',
    academic_degree: 'phd',
    phone: '+966518888888',
  },
  {
    name: 'د. عبدالله صالح العنزي',
    email: 'abdullah.alanazi@reviewer.edu.sa',
    password: 'Reviewer@123',
    role: 'reviewer',
    affiliation: 'جامعة الجوف',
    department: 'كلية إدارة الأعمال',
    specialization: 'إدارة الأعمال والتسويق',
    academic_degree: 'phd',
    phone: '+966519999999',
  },
  {
    name: 'د. هند محمد القرني',
    email: 'hind.alqarni@reviewer.edu.sa',
    password: 'Reviewer@123',
    role: 'reviewer',
    affiliation: 'جامعة القصيم',
    department: 'كلية الصيدلة',
    specialization: 'الصيدلة السريرية',
    academic_degree: 'phd',
    phone: '+966510000000',
  },
  {
    name: 'د. ياسر عبدالعزيز السلمي',
    email: 'yasser.alsulami@reviewer.edu.sa',
    password: 'Reviewer@123',
    role: 'reviewer',
    affiliation: 'جامعة جازان',
    department: 'كلية العلوم الإدارية والمالية',
    specialization: 'الاقتصاد والمالية',
    academic_degree: 'phd',
    phone: '+966511234567',
  },
  {
    name: 'د. ريم خالد الشهراني',
    email: 'reem.alshahrani@reviewer.edu.sa',
    password: 'Reviewer@123',
    role: 'reviewer',
    affiliation: 'جامعة الباحة',
    department: 'كلية التصاميم والفنون',
    specialization: 'التصميم الجرافيكي',
    academic_degree: 'phd',
    phone: '+966512345678',
  },
  {
    name: 'د. سلطان فهد العصيمي',
    email: 'sultan.alosaimi@reviewer.edu.sa',
    password: 'Reviewer@123',
    role: 'reviewer',
    affiliation: 'جامعة حائل',
    department: 'كلية الهندسة',
    specialization: 'الهندسة المدنية',
    academic_degree: 'phd',
    phone: '+966513456789',
  },
  {
    name: 'د. لطيفة سعيد البقمي',
    email: 'latifa.albogami@reviewer.edu.sa',
    password: 'Reviewer@123',
    role: 'reviewer',
    affiliation: 'جامعة تبوك',
    department: 'كلية العلوم الطبية التطبيقية',
    specialization: 'التمريض',
    academic_degree: 'phd',
    phone: '+966514567890',
  },
  {
    name: 'د. ماجد عبدالله الشمري',
    email: 'majed.alshammari@reviewer.edu.sa',
    password: 'Reviewer@123',
    role: 'reviewer',
    affiliation: 'جامعة نجران',
    department: 'كلية علوم الحاسب ونظم المعلومات',
    specialization: 'أمن المعلومات',
    academic_degree: 'phd',
    phone: '+966515678901',
  },
];

async function seedReviewers() {
  console.log('🌱 بدء إضافة المراجعين...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const reviewer of reviewers) {
    try {
      const response = await axios.post(`${API_BASE_URL}/users`, reviewer);
      console.log(`✅ تم إضافة: ${reviewer.name}`);
      successCount++;
    } catch (error) {
      if (error.response?.status === 409) {
        console.log(`⚠️  موجود مسبقاً: ${reviewer.name}`);
      } else {
        console.log(`❌ فشل: ${reviewer.name} - ${error.message}`);
        errorCount++;
      }
    }
  }

  console.log('\n📊 النتائج:');
  console.log(`✅ تم الإضافة بنجاح: ${successCount}`);
  console.log(`❌ فشل: ${errorCount}`);
  console.log(`⚠️  موجود مسبقاً: ${reviewers.length - successCount - errorCount}`);
  console.log(`\n📈 إجمالي المراجعين: ${reviewers.length}`);
  console.log('\n✨ تم الانتهاء!');
}

// تشغيل السكريبت
seedReviewers().catch(console.error);
