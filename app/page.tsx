'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white dir-rtl flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      
      {/* شريط الملاحة العلوي (Navbar) */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          
          {/* الشعار والاسم */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-600/30">
              🛡️
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight text-white">
                منصة راصد <span className="text-blue-500 font-bold text-sm block md:inline">| السودان</span>
              </h1>
            </div>
          </div>

          {/* زر دخول الإدارة السريع */}
          <Link
            href="/admin"
            className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl border border-slate-700 transition flex items-center gap-2 shadow-sm"
          >
            🔐 لوحة الإشراف
          </Link>
        </div>
      </header>

      {/* القسم الرئيسي (Hero Section) */}
      <section className="relative overflow-hidden py-16 md:py-24 px-4 flex-1 flex items-center">
        {/* خلفية تزيينية لمسات ضوئية */}
        <div className="absolute top-1/4 right-1/2 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          
          {/* شارة الترحيب */}
          <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 text-blue-400 text-xs font-bold px-4 py-2 rounded-full shadow-inner">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            النظام الوطني المستقل لتوثيق وتتبع التجاوزات
          </div>

          {/* العنوان الرئيسي */}
          <h2 className="text-3xl md:text-6xl font-black text-white leading-tight md:leading-tight">
            صوتك أمان للمجتمع، <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">
              وثّق وبَلّغ بشفافية وسريّة تامّة
            </span>
          </h2>

          {/* الوصف */}
          <p className="text-slate-400 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
            منصة متخصصة تمكّن المواطنين والراصدين من تقديم البلاغات حول المخالفات والتجاوزات بسهولة مع إمكانية متابعة حالة البلاغ عبر رمز مرجعي خاص دون المساس بالخصوصية.
          </p>

          {/* أزرار التوجيه الرئيسية */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            
            {/* زر تقديم / متابعة بلاغ */}
            <Link
              href="/report"
              className="w-full sm:w-auto flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-extrabold text-base px-8 py-4 rounded-2xl shadow-xl shadow-blue-600/25 transition transform active:scale-95 flex items-center justify-center gap-3 border border-blue-500/30"
            >
              📝 تقديم / متابعة بلاغ
            </Link>

            {/* زر لوحة الإدارة */}
            <Link
              href="/admin"
              className="w-full sm:w-auto flex-1 bg-slate-800 hover:bg-slate-700/80 text-slate-100 font-bold text-base px-8 py-4 rounded-2xl border border-slate-700 transition transform active:scale-95 flex items-center justify-center gap-3 shadow-lg"
            >
              📊 دخول المشرفين
            </Link>

          </div>

        </div>
      </section>

      {/* مميزات المنصة (Features Section) */}
      <section className="bg-slate-950/60 border-t border-slate-800/80 py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="text-3xl">🔒</div>
            <h3 className="font-extrabold text-white text-base">سرية وأمان البيانات</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              تضمن المنصة حماية هوية الراصد وتوفير بيئة آمنة لتقديم المستندات والبيانات.
            </p>
          </div>

          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="text-3xl">🔍</div>
            <h3 className="font-extrabold text-white text-base">متابعة دقيقة بالرمز المرجعي</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              احصل على رمز مرجعي فريد لمتابعة مراحل معالجة بلاغك والاطلاع على ردود الإدارة.
            </p>
          </div>

          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="text-3xl">⚡</div>
            <h3 className="font-extrabold text-white text-base">معالجة وتقييم سريع</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              فريق إشرافي مختص يراجع البلاغات ويتخذ الإجراءات المناسبة لكل حالة.
            </p>
          </div>

        </div>
      </section>

      {/* الفوتر الشامل (Footer) */}
      <footer className="bg-slate-950 border-t border-slate-800 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-right">
          
          {/* بيانات التأسيس والمؤسس */}
          <div className="space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                تأسست عام 2026م
              </span>
            </div>
            <p className="text-sm font-bold text-slate-200">
              تطوير وتأسيس: <span className="text-blue-400 font-extrabold">معاذ الزين</span>
            </p>
            <p className="text-xs text-slate-500">
              منصة سودانية مستقلة تهدف لترسيخ الشفافية والعدالة.
            </p>
          </div>

          {/* روابط التواصل الاجتماعي */}
<div className="flex items-center justify-center gap-3">
  {/* تويتر / X */}
  <a
    href="https://x.com/RASISUDAN1"
    target="_blank"
    rel="noopener noreferrer"
    className="bg-slate-900 hover:bg-blue-600/20 hover:border-blue-500/50 text-slate-300 hover:text-blue-400 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700/80 transition flex items-center gap-2"
    title="تويتر / X منصة"
  >
    <span>📣</span>
    <span>X (تويتر)</span>
  </a>

  {/* فيسبوك */}
  <a
    href="https://www.facebook.com/profile.php?id=61595056197520"
    target="_blank"
    rel="noopener noreferrer"
    className="bg-slate-900 hover:bg-blue-600/20 hover:border-blue-500/50 text-slate-300 hover:text-blue-400 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700/80 transition flex items-center gap-2"
    title="فيسبوك"
  >
    <span>📘</span>
    <span>فيسبوك</span>
  </a>

  {/* انستغرام */}
  <a
    href="https://www.instagram.com/rasid.sudan?stkn=emNiMmFzMzVpZXE5"
    target="_blank"
    rel="noopener noreferrer"
    className="bg-slate-900 hover:bg-blue-600/20 hover:border-blue-500/50 text-slate-300 hover:text-blue-400 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700/80 transition flex items-center gap-2"
    title="انستغرام"
  >
    <span>📷</span>
    <span>انستغرام</span>
  </a>
</div>
        </div>

        {/* شريط الحقوق والأمان */}
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© 2026 منصة راصد - جميع الحقوق محفوظة</p>
          <p className="text-slate-600">نظام مشفر ومحمي بالكامل 🔒</p>
        </div>
      </footer>

    </div>
  );
}