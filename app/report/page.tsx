'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PublicReportPage() {
  const [tab, setTab] = useState<'create' | 'track'>('create');
  
  // بيانات نموذج التقديم
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('استغلال النفوذ والسلطة الوظيفية');
  const [entity, setEntity] = useState('');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  
  // المرفق والتعهد
  const [file, setFile] = useState<File | null>(null);
  const [agreedTerms, setAgreedTerms] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRefCode, setCreatedRefCode] = useState<string | null>(null);

  // بيانات نموذج الاستعلام
  const [searchCode, setSearchCode] = useState('');
  const [trackedReport, setTrackedReport] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const generateRefCode = () => {
    return 'RSD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // التحقق المباشر من رفع المرفق والتعهد
    if (!file) {
      alert('يرجى إرفاق الدليل (صورة، فيديو، أو مستند) لإكمال تقديم البلاغ.');
      return;
    }

    if (!agreedTerms) {
      alert('يرجى القبول والتعهد بصحة البيانات وسياسة الخصوصية للتمكن من تقديم البلاغ.');
      return;
    }

    setIsSubmitting(true);
    setCreatedRefCode(null);

    let attachmentUrl = '';

    // 1. رفع المرفق إلى Supabase Storage إن أمكن
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `reports/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file);

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from('attachments')
          .getPublicUrl(filePath);
        attachmentUrl = publicUrlData.publicUrl;
      }
    } catch (err) {
      console.log('ملاحظة: تعذر الرفع التلقائي للـ Storage، سيتم الإرسال بدون رابط مباشر للملف.');
    }

    const refCode = generateRefCode();

    // 2. إدخال البلاغ إلى قاعدة البيانات
    const { error } = await supabase.from('reports').insert([
      {
        title,
        category,
        entity,
        description,
        reporter_name: reporterName || 'مجهول الهوية',
        reporter_phone: reporterPhone || null,
        reference_code: refCode,
        attachment_url: attachmentUrl || file.name,
        status: 'جديد',
      },
    ]);

    setIsSubmitting(false);

    if (error) {
      alert('حدث خطأ أثناء تقديم البلاغ: ' + error.message);
    } else {
      setCreatedRefCode(refCode);
      setTitle('');
      setEntity('');
      setDescription('');
      setReporterName('');
      setReporterPhone('');
      setFile(null);
      setAgreedTerms(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;

    setIsSearching(true);
    setSearchError('');
    setTrackedReport(null);

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('reference_code', searchCode.trim().toUpperCase())
      .maybeSingle();

    setIsSearching(false);

    if (error || !data) {
      setSearchError('لم يتم العثور على بلاغ بهذا الرمز المرجعي. يُرجى التأكد من الرمز والمحاولة مجدداً.');
    } else {
      setTrackedReport(data);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white dir-rtl text-right py-8 px-4 flex flex-col justify-between">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <Link href="/" className="text-amber-400 font-black text-xl flex items-center gap-2">
            🛡️ منصة راصد
          </Link>
          <Link href="/admin" className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl border border-slate-700">
            🔐 دخول المشرفين
          </Link>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setTab('create')}
            className={`py-2.5 text-xs font-bold rounded-xl transition ${
              tab === 'create' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            📝 تقديم بلاغ جديد
          </button>
          <button
            onClick={() => setTab('track')}
            className={`py-2.5 text-xs font-bold rounded-xl transition ${
              tab === 'track' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            🔍 متابعة حالة بلاغ
          </button>
        </div>

        {/* TAB 1: تقديم البلاغ */}
        {tab === 'create' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl">
            <h2 className="text-lg font-black text-amber-400">تقديم بلاغ جديد</h2>

            {createdRefCode ? (
              <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-6 text-center space-y-3">
                <span className="text-4xl">🎉</span>
                <h3 className="font-bold text-white text-base">تم تقديم البلاغ بنجاح!</h3>
                <p className="text-xs text-slate-300">احتفظ بالرمز المرجعي التالي لمتابعة حالة بلاغك:</p>
                <div className="font-mono font-black text-xl bg-slate-950 text-amber-400 border border-amber-500/50 py-3 rounded-xl select-all">
                  {createdRefCode}
                </div>
                <button
                  onClick={() => setCreatedRefCode(null)}
                  className="text-xs text-slate-400 hover:text-amber-400 underline pt-2"
                >
                  تقديم بلاغ آخر
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">عنوان البلاغ *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: تجاوز في إجراءات التعيين..."
                    className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl p-3 outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">نوع التجاوز *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl p-3 outline-none focus:border-amber-500"
                    >
                      <option value="استغلال النفوذ والسلطة الوظيفية">استغلال النفوذ والسلطة الوظيفية</option>
                      <option value="الرشوة والابتزاز المالي">الرشوة والابتزاز المالي</option>
                      <option value="تبديد المال العام">تبديد المال العام</option>
                      <option value="تجاوزات أخرى">تجاوزات أخرى</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">الجهة / الموقع *</label>
                    <input
                      type="text"
                      required
                      value={entity}
                      onChange={(e) => setEntity(e.target.value)}
                      placeholder="اسم الوزارة أو المؤسسة..."
                      className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl p-3 outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">تفاصيل البلاغ *</label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="اكتب شرحاً مفصلاً للتجاوز والموقع والتاريخ..."
                    className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl p-3 outline-none focus:border-amber-500"
                  />
                </div>

                {/* إرفاق الدليل (واجب وضروري) */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 space-y-2">
                  <label className="block text-xs font-black text-amber-400 flex items-center gap-1.5">
                    <span>📎</span> إرفاق الدليل والإثبات (صورة / فيديو / مستند) *
                  </label>
                  <input
                    type="file"
                    required
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-400 file:mr-0 file:ml-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500">
                    الحد الأقصى للملفات المدعومة: الصور، الفيديوهات، وملفات PDF. الإرفاق واجب لإكمال البلاغ.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">اسم المُبلّغ (اختياري)</label>
                    <input
                      type="text"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      placeholder="اتركه فارغاً لتقديم بلاغ سري"
                      className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl p-3 outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">رقم التواصل (اختياري)</label>
                    <input
                      type="text"
                      value={reporterPhone}
                      onChange={(e) => setReporterPhone(e.target.value)}
                      placeholder="للتواصل عند الحاجة فقط"
                      className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl p-3 outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* خانة التعهد واختيار الشروط (واجبة) */}
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 accent-amber-500 rounded border-slate-700 bg-slate-900 cursor-pointer"
                    />
                    <span className="text-xs text-slate-300 leading-relaxed font-semibold">
                      أتعهد بصحة وسلامة جميع المعلومات والمرفقات المقدمة في هذا البلاغ، وأتحمل كامل المسؤولية القانونية والأخلاقية، كما أوافق على <span className="text-amber-400 font-bold">سياسة الخصوصية واستخدام البيانات</span> الخاصة بمنصة راصد. *
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !agreedTerms || !file}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3.5 rounded-xl transition text-xs shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'جاري رفع الدليل وإرسال البلاغ...' : '🚀 إرسال البلاغ الرسمي'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: الاستعلام والمتابعة */}
        {tab === 'track' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl">
            <h2 className="text-lg font-black text-amber-400">متابعة حالة بلاغ سابق</h2>

            <form onSubmit={handleTrack} className="flex gap-2">
              <input
                type="text"
                required
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="أدخل الرمز المرجعي (مثال: RSD-SZF2X4)..."
                className="flex-1 bg-slate-950 border border-slate-800 text-xs rounded-xl p-3 outline-none focus:border-amber-500 uppercase font-mono"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-5 py-3 rounded-xl text-xs transition disabled:opacity-50"
              >
                {isSearching ? 'جاري البحث...' : 'بحث'}
              </button>
            </form>

            {searchError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                {searchError}
              </p>
            )}

            {trackedReport && (
              <div className="border border-slate-800 rounded-2xl p-5 bg-slate-950 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="font-mono text-xs text-amber-400 font-bold">
                    {trackedReport.reference_code}
                  </span>
                  <span className="text-[11px] bg-slate-800 px-2.5 py-1 rounded-md text-slate-300 font-bold">
                    الحالة: {trackedReport.status || 'جديد'}
                  </span>
                </div>

                <h3 className="font-black text-white text-sm">{trackedReport.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl">
                  {trackedReport.description}
                </p>

                {trackedReport.attachment_url && (
                  <div className="pt-1">
                    <a
                      href={trackedReport.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:underline bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/30 font-bold"
                    >
                      📎 عرض الدليل والمرفق
                    </a>
                  </div>
                )}

                {/* رد الإدارة للمواطن */}
                <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl space-y-1">
                  <h4 className="text-xs font-bold text-amber-400">📩 رد وإجراء الإدارة:</h4>
                  <p className="text-xs text-slate-200">
                    {trackedReport.admin_reply || 'البلاغ قيد المراجعة والتقييم من قبل فريق الإشراف.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}