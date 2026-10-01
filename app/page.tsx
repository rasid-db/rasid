'use client';

import { useState } from 'react';
import Link from 'next/link';

// مكون المرشد السوداني الكرتوني (الشخصية بالجلابية والعمة)
function SudaneseAvatarGuide() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'يا زول مرحب بيك!',
      dialogue: 'عايز تبلغ عن أي تجاوز؟ الموضوع بسيط وسري جداً.. اضغط على زر "تقديم / متابعة بلاغ".',
      actionText: '1. اضغط على تقديم بلاغ',
      icon: '📝',
    },
    {
      title: 'اكتب التفاصيل',
      dialogue: 'ادخل الموقع، واكتب الحصل شنو بالضبط، ولو عندك صورة أو ملف مرفق ارفقو هنا.',
      actionText: '2. عبّي البيانات والمرفقات',
      icon: '📂',
    },
    {
      title: 'شيل الرمز المرجعي',
      dialogue: 'أهم خطوة! أول ما تخلص حيظهر ليك رمز مرجعي فريد، احفظو عندك كويس عشان تتابع بيهو.',
      actionText: '3. احفظ الرمز المرجعي',
      icon: '🔑',
    },
    {
      title: 'تابع بلاغك بأمان',
      dialogue: 'في أي وقت ادخل الرمز المرجعي عشان تشوف رد الإدارة والإجراءات المتخذة بسريّة تامّة!',
      actionText: '4. متابعة حالة البلاغ',
      icon: '🛡️',
    },
  ];

  return (
    <section className="py-12 px-4 my-8 relative">
      <div className="max-w-4xl mx-auto bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 md:p-10 shadow-2xl shadow-amber-500/5 relative overflow-visible backdrop-blur-md">
        
        {/* خلفية بنقوش هندسية سودانية خفيفة */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none rounded-3xl" />

        {/* عنوان القسم */}
        <div className="text-center mb-8 space-y-2 relative z-10">
          <span className="text-amber-400 font-bold text-xs bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <span>🇸🇩</span> المرشد التفاعلي
          </span>
          <h3 className="text-2xl md:text-3xl font-black text-white">
            كيف تقوم بتقديم ومتابعة بلاغك؟
          </h3>
          <p className="text-slate-400 text-xs md:text-sm">
            شاهد الشرح التفاعلي خطوة بخطوة مع المرشد السوداني
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* جانب الشخصية الكرتونية والفقاعة الكلامية */}
          <div className="md:col-span-5 flex flex-col items-center justify-center text-center space-y-4 pt-6">
            
            <div className="relative w-48 h-48 md:w-56 md:h-56 bg-slate-950 rounded-full border-2 border-amber-500/50 p-1 flex items-center justify-center shadow-2xl shadow-amber-500/10">
              
              {/* فقاعة كلام الشخصية (موضوعة بوضوح فوق الدائرة) */}
              <div className="absolute -top-12 right-0 left-0 mx-auto z-30 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs p-3 rounded-2xl shadow-2xl max-w-[220px] text-center border border-amber-300 leading-snug animate-fade-in">
                "{steps[currentStep].dialogue}"
                <div className="absolute -bottom-2 right-1/2 translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-amber-500" />
              </div>

              {/* فيديو المرشد السوداني */}
              <div className="w-full h-full rounded-full overflow-hidden relative z-10 bg-slate-900">
                <video 
                  key={currentStep}
                  src="/sudanese-avatar.mp4" 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <h4 className="font-extrabold text-amber-400 text-base flex items-center justify-center gap-1.5">
                <span>المرشد السوداني</span>
                <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md">راصد</span>
              </h4>
              <p className="text-slate-400 text-xs">اضغط على الخطوات بالجانب للاستماع للشرح</p>
            </div>
          </div>

          {/* جانب أزرار الخطوات */}
          <div className="md:col-span-7 space-y-3">
            {steps.map((step, idx) => {
              const isActive = currentStep === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`w-full text-right p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-amber-500/10 border-amber-500/80 text-white font-bold scale-[1.02] shadow-lg shadow-amber-500/10'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-xl p-2 rounded-xl ${isActive ? 'bg-amber-500/20' : 'bg-slate-800/50'}`}>
                      {step.icon}
                    </span>
                    <span className="text-sm font-bold">{step.actionText}</span>
                  </div>

                  {isActive && (
                    <span className="text-[11px] bg-amber-500 text-slate-950 font-black px-2.5 py-1 rounded-lg">
                      جاري الشرح...
                    </span>
                  )}
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white dir-rtl flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      
      {/* شريط الملاحة العلوي (Navbar) */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          
          {/* الشعار والهوية السودانية */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-amber-500 to-amber-700 p-2.5 rounded-2xl shadow-lg shadow-amber-500/20">
              🛡️
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight text-white flex items-center gap-2">
                منصة راصد <span className="text-amber-400 font-bold text-xs bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">السودان 🇸🇩</span>
              </h1>
            </div>
          </div>

          {/* زر دخول الإدارة السريع */}
          <Link
            href="/admin"
            className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl border border-slate-700 transition flex items-center gap-2 shadow-sm hover:border-amber-500/40"
          >
            🔐 لوحة الإشراف
          </Link>
        </div>
      </header>

      {/* القسم الرئيسي (Hero Section) */}
      <section className="relative overflow-hidden py-16 md:py-24 px-4 flex-1 flex items-center">
        {/* خلفيات ضوئية بلمسات ذهبية وزرقاء */}
        <div className="absolute top-1/4 right-1/2 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          
          {/* شارة الترحيب */}
          <div className="inline-flex items-center gap-2 bg-slate-900 border border-amber-500/30 text-amber-400 text-xs font-bold px-4 py-2 rounded-full shadow-inner">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            النظام الوطني المستقل لتوثيق وتتبع التجاوزات
          </div>

          {/* العنوان الرئيسي */}
          <h2 className="text-3xl md:text-6xl font-black text-white leading-tight md:leading-tight">
            صوتك أمان للمجتمع، <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-blue-400">
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
              className="w-full sm:w-auto flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base px-8 py-4 rounded-2xl shadow-xl shadow-amber-500/20 transition transform active:scale-95 flex items-center justify-center gap-3 border border-amber-400/30"
            >
              📝 تقديم / متابعة بلاغ
            </Link>

            {/* زر لوحة الإدارة */}
            <Link
              href="/admin"
              className="w-full sm:w-auto flex-1 bg-slate-800/90 hover:bg-slate-700/80 text-slate-100 font-bold text-base px-8 py-4 rounded-2xl border border-slate-700 transition transform active:scale-95 flex items-center justify-center gap-3 shadow-lg"
            >
              📊 دخول المشرفين
            </Link>

          </div>

        </div>
      </section>

      {/* مكون المرشد التفاعلي الشخصية بالجلابية */}
      <SudaneseAvatarGuide />

      {/* مميزات المنصة (Features Section) */}
      <section className="bg-slate-900/40 py-12 px-4 border-t border-slate-800/80">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="text-3xl">🔒</div>
            <h3 className="font-extrabold text-white text-base">سرية وأمان البيانات</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              تضمن المنصة حماية هوية الراصد وتوفير بيئة آمنة لتقديم المستندات والبيانات.
            </p>
          </div>

          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="text-3xl">🔍</div>
            <h3 className="font-extrabold text-white text-base">متابعة دقيقة بالرمز المرجعي</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              احصل على رمز مرجعي فريد لمتابعة مراحل معالجة بلاغك والاطلاع على ردود الإدارة.
            </p>
          </div>

          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-3">
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
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                تأسست عام 2026م
              </span>
            </div>
            <p className="text-sm font-bold text-slate-200">
              تطوير وتأسيس: <span className="text-amber-400 font-extrabold">مجموعة رصد التطوعية</span>
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
              className="bg-slate-900 hover:bg-amber-500/10 hover:border-amber-500/50 text-slate-300 hover:text-amber-400 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-800 transition flex items-center gap-2"
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
              className="bg-slate-900 hover:bg-amber-500/10 hover:border-amber-500/50 text-slate-300 hover:text-amber-400 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-800 transition flex items-center gap-2"
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
              className="bg-slate-900 hover:bg-amber-500/10 hover:border-amber-500/50 text-slate-300 hover:text-amber-400 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-800 transition flex items-center gap-2"
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