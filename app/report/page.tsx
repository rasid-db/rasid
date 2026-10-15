'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function NewReportPage() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('استغلال النفوذ والسلطة الوظيفية');
  const [entity, setEntity] = useState('');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  
  const [file, setFile] = useState<File | null>(null);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRefCode, setCreatedRefCode] = useState<string | null>(null);

  const generateRefCode = () => {
    return 'RSD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      console.log('ملاحظة: تعذر الرفع التلقائي للـ Storage.');
    }

    const refCode = generateRefCode();

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

  return (
    <div className="min-h-screen bg-slate-950 text-white dir-rtl text-right py-8 px-4 flex flex-col justify-between">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <Link href="/" className="text-amber-400 font-black text-xl flex items-center gap-2">
            🛡️ منصة راصد
          </Link>
          
          <div className="flex items-center gap-3">
            <Link href="/track" className="text-xs text-slate-300 hover:text-amber-400 font-bold px-3 py-2">
              🔍 متابعة بلاغ سابق
            </Link>
            <Link href="/admin" className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl border border-slate-700 font-bold">
              🔐 لوحة الإشراف
            </Link>
          </div>
        </header>

        {/* نموذج تقديم البلاغ */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl">
          <h2 className="text-lg font-black text-amber-400 border-b border-slate-800 pb-3">
            📝 تقديم بلاغ جديد
          </h2>

          {createdRefCode ? (
            <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-6 text-center space-y-3">
              <span className="text-4xl">🎉</span>
              <h3 className="font-bold text-white text-base">تم تقديم البلاغ بنجاح!</h3>
              <p className="text-xs text-slate-300">احتفظ بالرمز المرجعي التالي لمتابعة حالة بلاغك:</p>
              <div className="font-mono font-black text-xl bg-slate-950 text-amber-400 border border-amber-500/50 py-3 rounded-xl select-all">
                {createdRefCode}
              </div>
              <div className="pt-3 flex justify-center gap-4">
                <button
                  onClick={() => setCreatedRefCode(null)}
                  className="text-xs bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl"
                >
                  تقديم بلاغ آخر
                </button>
                <Link
                  href="/track"
                  className="text-xs bg-slate-800 text-slate-200 font-bold px-4 py-2 rounded-xl border border-slate-700"
                >
                  الانتقال لمتابعة البلاغ
                </Link>
              </div>
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

              {/* إرفاق الدليل */}
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

              {/* التعهد والموافقات مع رابط منبثق للسياسة */}
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
                    أتعهد بصحة وسلامة جميع المعلومات والمرفقات المقدمة في هذا البلاغ، وأتحمل كامل المسؤولية القانونية والأخلاقية، كما أوافق على{' '}
                    <button
                      type="button"
                      onClick={() => setShowPrivacyModal(true)}
                      className="text-amber-400 font-black underline hover:text-amber-300 transition"
                    >
                      سياسة الخصوصية واستخدام البيانات
                    </button>{' '}
                    الخاصة بمنصة راصد. *
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

      </div>

      {/* النافذة المنبثقة (Modal) لشروط الخصوصية الاستخدام */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl text-right">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-amber-400 text-base flex items-center gap-2">
                <span>📜</span> سياسة الخصوصية وشروط استخدام منصة راصد
              </h3>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-3 max-h-72 overflow-y-auto pl-2 leading-relaxed">
              <p className="font-bold text-amber-300">1. سرية وحماية هوية المُبلّغ:</p>
              <p>تضمن منصة راصد حماية وأمان هوية الراصد والمُبلّغ بالكامل دون مشاركتها مع أي طرف ثالث.</p>

              <p className="font-bold text-amber-300">2. المسؤولية عن صحة البيانات:</p>
              <p>يتحمل المُبلّغ كامل المسؤولية الأخلاقية والقانونية عن صحة المستندات والأدلة المرفقة مع البلاغ.</p>

              <p className="font-bold text-amber-300">3. التعامل مع أدلة البلاغات:</p>
              <p>تُحفظ كافة المستندات والمرفقات في خوادم مشفرة وآمنة لا تتاح إلا لفريق المراجعة والإشراف المخوّل.</p>

              <p className="font-bold text-amber-300">4. المتابعة بالرمز المرجعي:</p>
              <p>يتحمل الراصد مسؤولية الاحتفاظ بالرمز المرجعي الخاص بالبلاغ للاستعلام عن التحديثات.</p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setAgreedTerms(true);
                  setShowPrivacyModal(false);
                }}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl transition shadow"
              >
                موافق والتزام بالشروط
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}