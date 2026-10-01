'use client';

import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 dir-rtl p-4 md:p-8 flex flex-col justify-between">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        
        {/* العودة */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <Link
            href="/report"
            className="text-xs font-bold text-slate-400 hover:text-white bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 transition"
          >
            ← العودة لصفحة البلاغات
          </Link>

          <span className="font-black text-white text-lg">🛡️ منصة راصد - إرشادات وضوابط الاستخدام</span>
        </div>

        {/* محتوى الشروط وإخلاء المسؤولية */}
        <div className="bg-slate-800/50 border border-slate-700/80 rounded-3xl p-6 md:p-8 space-y-6 text-sm text-slate-300 leading-relaxed">
          
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-4 rounded-2xl text-xs space-y-1">
            <p className="font-bold">⚠️ تنبيه وإخلاء مسؤولية قانونية مهم:</p>
            <p>
              منصة "راصد" هي مبادرة مجتمعية تقنية مدنية مستقلا تهدف لجمع المؤشرات والوثائق حول التجاوزات لتحويلها للجهات والنيابات المختصة. المنصة ليست سلطة ضبط قضائي ولا نائباً عاماً.
            </p>
          </div>

          <section className="space-y-2">
            <h3 className="font-bold text-white text-base">1. طبيعة البلاغات وعدم الكيدية</h3>
            <p>
              يجب أن تكون كافة البلاغات المقدمة مبنية على وقائع ومستندات حقيقية. يمنع منعاً باتاً استخدام المنصة لتقديم بلاغات كيدية أو تصفية حسابات شخصية أو التشهير بالأفراد أو المؤسسات.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-white text-base">2. سرية وحماية بيانات المُبلّغ</h3>
            <p>
              تلتزم المنصة بأقصى معايير السرية والأمان وعدم الكشف عن بيانات المُبلّغ لأي طرف ثالث، كما يُتاح خيار تقديم البلاغ كمجهول الهوية بالكامل دون إلزام بتسجيل الاسم أو رقم الهاتف.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-white text-base">3. عدم النشر العلني</h3>
            <p>
              البلاغات والوثائق المرفوعة تُعامل كمعاملات سرية وخاصة بين المُبلّغ وفريق الإشراف وفحص المستندات، ولن يتم نشرها أو إتاحتها للعامة بأي شكل من الأشكال لحماية الحقوق والسمعة القانونية للجميع.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-white text-base">4. التمرير للجهات المختصة</h3>
            <p>
              تقوم المنصة بغربلة وتوثيق البلاغات المكتملة وإعداد تقارير رقمية رفيعة المستوى لتقديمها لديوان المراجع العام أو النيابات والجهات القضائية المعنية وفق الأطر القانونية.
            </p>
          </section>

        </div>

      </div>

      <footer className="mt-8 text-center text-xs text-slate-500">
        © 2026 منصة راصد - المؤسس معاذ الزين
      </footer>
    </div>
  );
}