'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// إعداد عميل Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// قائمة الوزارات والجهات المعنية
const MINISTRIES = [
  'وزارة الصحة',
  'وزارة التربية والتعليم',
  'وزارة المالية والاقتصاد الوطني',
  'وزارة الحكم المحلي والبلديات',
  'وزارة التنمية الاجتماعية والإغاثة',
  'وزارة الزراعة والغابات',
  'وزارة الثروة الحيوانية',
  'وزارة الطاقة والنظر والمياه',
  'وزارة البنية التحتية والنقل',
  'وزارة العدل',
  'وزارة الداخلية والأمن الداخلي',
  'وزارة الإعلام وثقافة',
  'وزارة التجارة والصناعة',
  'وزارة العمل والإصلاح الإداري',
  'المجالس والمؤسسات الولائية / المحليات',
  'منظمات وهيئات إغاثية / طوعية',
  'جهة أو مؤسسة أخرى',
];

// قائمة أنواع المخالفات والفساد
const CORRUPTION_TYPES = [
  'اختلاس وتبديد المال العام',
  'الرشوة والابتزاز المالي',
  'استغلال النفوذ والسلطة الوظيفية',
  'المحسوبية والتمييز في التعيينات والخدمات',
  'سوء توزيع المساعدات الإنسانية والإغاثة',
  'التلاعب في العقود والمشتريات الحكومية',
  'الإهمال والتقصير في الخدمات الصحية والطبية',
  'التسيب والإهمال الإداري والمالي',
  'مخالفات في تحصيل الرسوم والجبايات',
  'تجاوزات في الأراضي والعقارات الحكومية',
  'أنواع أخرى من التجاوزات والفساد',
];

export default function ReportPage() {
  const [activeTab, setActiveTab] = useState<'submit' | 'track'>('submit');

  // حالات نموذج تقديم البلاغ
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(''); // نوع الفساد / المخالفة
  const [ministry, setMinistry] = useState(''); // الوزارة / الجهة المعنية
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false); // حالة التعهد والشروط القانونية

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // حالات الاستعلام عن البلاغ
  const [searchCode, setSearchCode] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [trackedReport, setTrackedReport] = useState<any | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  // توليد رمز مرجعي فريد
  const generateReferenceCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'RSD-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // إرسال البلاغ
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let attachmentUrl = null;

      // رفع المرفق إن وجد
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(fileName, file);

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('attachments')
            .getPublicUrl(fileName);
          attachmentUrl = publicUrlData.publicUrl;
        }
      }

      const referenceCode = generateReferenceCode();

      // حفظ البلاغ في قاعدة البيانات
      const { error: insertError } = await supabase.from('reports').insert([
        {
          reference_code: referenceCode,
          title,
          category,
          location: `${ministry ? `[${ministry}] ` : ''}${location}`,
          description,
          reporter_name: reporterName || 'مجهول',
          reporter_phone: reporterPhone || null,
          attachment_url: attachmentUrl,
          status: 'جديد',
        },
      ]);

      if (insertError) throw insertError;

      setSubmittedCode(referenceCode);
      // إعادة تعيين الحقول
      setTitle('');
      setCategory('');
      setMinistry('');
      setLocation('');
      setDescription('');
      setReporterName('');
      setReporterPhone('');
      setFile(null);
      setAgreedToTerms(false);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'حدث خطأ أثناء إرسال البلاغ. يرجى المحاولة لاحقاً.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // الاستعلام عن البلاغ
  const handleTrackReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;

    setIsTracking(true);
    setTrackError(null);
    setTrackedReport(null);

    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('reference_code', searchCode.trim().toUpperCase())
        .single();

      if (error || !data) {
        setTrackError('لم يتم العثور على بلاغ بهذا الرمز المرجعي. يُرجى التثبت من الرمز.');
      } else {
        setTrackedReport(data);
      }
    } catch (err) {
      setTrackError('حدث خطأ أثناء البحث عن البلاغ.');
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 dir-rtl p-4 md:p-8 flex flex-col justify-between">
      <div className="max-w-3xl mx-auto w-full">
        
        {/* العودة للصفحة الرئيسية */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="text-xs font-bold text-slate-400 hover:text-white bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 transition flex items-center gap-2"
          >
            ← العودة للرئيسية
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xl">🛡</span>
            <span className="font-black text-white text-lg">منصة راصد</span>
          </div>
        </div>

        {/* التبديل بين تقديم بلاغ ومتابعة بلاغ */}
        <div className="bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700 flex mb-8">
          <button
            onClick={() => setActiveTab('submit')}
            className={`flex-1 py-3 text-sm font-extrabold rounded-xl transition ${
              activeTab === 'submit'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📝 تقديم بلاغ جديد
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`flex-1 py-3 text-sm font-extrabold rounded-xl transition ${
              activeTab === 'track'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🔍 استعلام ومتابعة حالة بلاغ
          </button>
        </div>

        {/* قسم تقديم بلاغ */}
        {activeTab === 'submit' && (
          <div className="bg-slate-800/50 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-xl">
            {submittedCode ? (
              <div className="text-center space-y-6 py-6">
                <div className="text-5xl">✅</div>
                <h3 className="text-2xl font-black text-emerald-400">تم إرسال البلاغ بنجاح</h3>
                <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                  احتفظ بالرمز المرجعي التالي لمتابعة حالة بلاغك والاطلاع على ردود الإدارة:
                </p>
                <div className="bg-slate-900 border-2 border-dashed border-emerald-500/50 p-4 rounded-2xl inline-block text-2xl font-black tracking-widest text-emerald-300 select-all">
                  {submittedCode}
                </div>
                <div>
                  <button
                    onClick={() => setSubmittedCode(null)}
                    className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-6 py-3 rounded-xl transition"
                  >
                    تقديم بلاغ آخر
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-5">
                <h2 className="text-xl font-black text-white mb-4">نموذج تقديم بلاغ جديد</h2>

                {errorMessage && (
                  <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-4 rounded-xl">
                    {errorMessage}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">عنوان البلاغ *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: تجاوز واختلاس في توزيع الإغاثة"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">نوع المخالفة / الفساد *</label>
                    <select
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">إختر نوع الفساد...</option>
                      {CORRUPTION_TYPES.map((item, idx) => (
                        <option key={idx} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">الوزارة / الجهة المعنية *</label>
                    <select
                      required
                      value={ministry}
                      onChange={(e) => setMinistry(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">إختر الوزارة أو الجهة...</option>
                      {MINISTRIES.map((item, idx) => (
                        <option key={idx} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">الموقع الجغرافي / المنطقة بالتفصيل *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: ولاية الجزيرة - محلية المناقل - مستشفى المناقل"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">تفاصيل وشرح البلاغ *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="اكتب شرحاً تفصيلياً للواقعة والتجاوزات والتواريخ والأسماء إن وجدت..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">اسم مقدم البلاغ (اختياري)</label>
                    <input
                      type="text"
                      placeholder="يمكنك تركه فارغاً للبقاء مجهولاً"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">رقم التواصل (اختياري)</label>
                    <input
                      type="text"
                      placeholder="رقم الهاتف أو الواتساب"
                      value={reporterPhone}
                      onChange={(e) => setReporterPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">إرفاق صورة أو مستند (اختياري)</label>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-700 file:text-white hover:file:bg-slate-600 cursor-pointer"
                  />
                </div>

                {/* خيار التعهد والشروط القانونية */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/60 space-y-2 mt-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-300 leading-relaxed">
                      أقّر وأتعهد بأن كافة المعلومات والمستندات المقدمة صحيحة ولست أهدف منها للتشهير أو البلاغ الكيدي، وأوافق على{' '}
                      <Link href="/terms" target="_blank" className="text-blue-400 underline font-bold hover:text-blue-300">
                        الشروط وإخلاء المسؤولية القانونية
                      </Link>
                      .
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !agreedToTerms}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl transition shadow-lg mt-4 cursor-pointer"
                >
                  {isSubmitting ? 'جاري إرسال البلاغ...' : '🚀 إرسال البلاغ الآن'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* قسم استعلام ومتابعة حالة بلاغ */}
        {activeTab === 'track' && (
          <div className="bg-slate-800/50 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
            <h2 className="text-xl font-black text-white">الاستعلام عن حالة بلاغ</h2>

            <form onSubmit={handleTrackReport} className="flex gap-3">
              <input
                type="text"
                required
                placeholder="أدخل الرمز المرجعي (مثال: RSD-X89A12)"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 uppercase tracking-widest font-mono"
              />
              <button
                type="submit"
                disabled={isTracking}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition"
              >
                {isTracking ? 'جاري البحث...' : 'بحث'}
              </button>
            </form>

            {trackError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-4 rounded-xl">
                {trackError}
              </div>
            )}

            {trackedReport && (
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4 text-sm">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-slate-400 text-xs">الرمز المرجعي:</span>
                  <span className="font-mono font-bold text-blue-400">{trackedReport.reference_code}</span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-slate-400 text-xs">حالة البلاغ:</span>
                  <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold px-3 py-1 rounded-full text-xs">
                    {trackedReport.status || 'قيد المراجعة'}
                  </span>
                </div>

                <div className="border-b border-slate-800 pb-3">
                  <span className="text-slate-400 text-xs block mb-1">عنوان البلاغ:</span>
                  <span className="font-bold text-white">{trackedReport.title}</span>
                </div>

                <div className="border-b border-slate-800 pb-3">
                  <span className="text-slate-400 text-xs block mb-1">نوع الفساد والجهة:</span>
                  <span className="text-slate-300">
                    {trackedReport.category} - {trackedReport.location}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-xs block mb-1">رد الإدارة / ملاحظات المعالجة:</span>
                  <p className="text-slate-200 bg-slate-800 p-3 rounded-xl text-xs leading-relaxed">
                    {trackedReport.admin_notes || 'البلاغ مسجل وفي انتظار المراجعة من قبل فريق الإشراف.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* الفوتر السفلي */}
      <footer className="mt-12 text-center text-xs text-slate-500">
        <p>© 2026 منصة راصد - معاذ الزين</p>
      </footer>
    </div>
  );
}