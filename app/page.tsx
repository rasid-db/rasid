'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ENTITIES_LIST = [
  'وزارة الدفاع',
  'وزارة الداخلية',
  'وزارة الخارجية',
  'وزارة العدل',
  'وزارة المالية والتخطيط الاقتصادي',
  'وزارة الصحة',
  'وزارة التربية والتعليم',
  'وزارة التعليم العالي والبحث العلمي',
  'وزارة الطاقة والنفت',
  'وزارة المعادن',
  'وزارة الزراعة والغابات',
  'وزارة الثروة الحيوانية',
  'وزارة التجارة والتموين',
  'وزارة الصناعة',
  'وزارة التنمية الاجتماعية',
  'وزارة الاتصالات والتحول الرقمي',
  'وزارة النقل',
  'وزارة البنى التحتية والتنمية العمرانية',
  'وزارة الثقافة والإعلام',
  'وزارة الشباب والرياضة',
  'بنك السودان المركزي',
  'ديوان النائب العام',
  'السلطة القضائية',
  'حكومة ولاية (إقليم آخر)',
  'جهة أخرى / هيئة مستقلة'
];

const CATEGORIES_LIST = [
  'فساد مالي واختلاس أموال عامة',
  'رشوة، ابتزاز، واستغلال النفوذ',
  'تزوير مستندات ورسمية وإحتيال إداري',
  'مخالفات الشراء والتعاقدات والعطاءات الحكومية',
  'تهريب واستغلال موارد الدولة (ذهب، نفط، عملات)',
  'تعدي واستيلاء غير مشروع على الأراضي والعقارات الحكومية',
  'انتهاكات حقوق الإنسان وإساءة استخدام السلطة الأمنية/الشرطية',
  'جرائم إلكترونية اختراق بيانات وشبكات حكومية',
  'سوء إداري وتوظيف قائم على المحسوبية والتمكين',
  'إهمال جسيم في تقديم الخدمات الأساسية (صحة، تعليم، مياه، كهرباء)',
  'مخالفات وتعديات بيئية وصحية خطر على السلامة العامة'
];

export default function Home() {
  const [tab, setTab] = useState<'submit' | 'track'>('submit');
  const [category, setCategory] = useState('');
  const [entity, setEntity] = useState('');
  const [details, setDetails] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [trackingCode, setTrackingCode] = useState('');
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [trackResult, setTrackResult] = useState<any>(null);
  const [trackError, setTrackError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert('يرجى إرفاق الدليل (صورة، فيديو، أو مستند) لإتمام إرسال البلاغ.');
      return;
    }

    setLoading(true);
    setUploadProgress('جاري رفع الدليل المرفق...');

    try {
      // 1. رفع الملف إلى Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `evidence/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('reports-evidence')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // الحصول على رابط الملف المرفوع
      const { data: publicUrlData } = supabase.storage
        .from('reports-evidence')
        .getPublicUrl(filePath);

      const evidenceUrl = publicUrlData.publicUrl;

      // 2. إنشاء رمز المتابعة وحفظ البلاغ في جدول reports
      setUploadProgress('جاري حفظ البلاغ وتشفير البيانات...');
      const code = 'RASED-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

      const { error: insertError } = await supabase.from('reports').insert([
        {
          tracking_code: code,
          category,
          entity,
          details,
          evidence_url: evidenceUrl
        }
      ]);

      if (insertError) throw insertError;

      setSubmittedCode(code);
    } catch (error: any) {
      console.error(error);
      alert('حدث خطأ أثناء رفع الدليل أو تسجيل البلاغ. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackResult(null);
    setTrackError('');
    if (!trackingCode.trim()) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('reports')
      .select('status, admin_notes, created_at')
      .eq('tracking_code', trackingCode.trim())
      .single();

    setLoading(false);
    if (error || !data) {
      setTrackError('لم يتم العثور على بلاغ بهذا الرمز المرجعي.');
    } else {
      setTrackResult(data);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 p-4 md:p-8 dir-rtl">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8 border-b border-slate-300 pb-4">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">🛡️ منصة راصد - السودان</h1>
          <p className="text-slate-600">نظام بلاغات متخصص لتوثيق وتتبع المخالفات والتجاوزات القانونية</p>
        </header>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('submit')}
            className={`flex-1 py-3 font-bold rounded-lg transition ${tab === 'submit' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'}`}
          >
            تقديم بلاغ جديد
          </button>
          <button
            onClick={() => setTab('track')}
            className={`flex-1 py-3 font-bold rounded-lg transition ${tab === 'track' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'}`}
          >
            متابعة حالة بلاغ
          </button>
        </div>

        {tab === 'submit' && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            {submittedCode ? (
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-green-600">✅ تم تسجيل البلاغ وإرفاق الدليل بنجاح!</h2>
                <p className="text-slate-600">احفظ الرمز المرجعي التالي لمتابعة حالة البلاغ لاحقاً:</p>
                <div className="bg-slate-100 p-4 rounded-lg border border-slate-300 text-red-600 font-mono text-xl font-bold tracking-widest">
                  {submittedCode}
                </div>
                <p className="text-xs text-slate-500">تنبيه: لا يتم حفظ أي بيانات شخصية أو عناوين IP ضماناً للسرية التامة.</p>
                <button
                  onClick={() => { setSubmittedCode(null); setCategory(''); setEntity(''); setDetails(''); setFile(null); }}
                  className="mt-4 w-full bg-slate-800 text-white py-2 rounded-lg font-bold"
                >
                  تقديم بلاغ آخر
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-bold mb-1">الجهة المعنية / الوزارة:</label>
                  <select
                    value={entity}
                    onChange={(e) => setEntity(e.target.value)}
                    required
                    className="w-full p-3 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="">اختر الوزارة أو الهيئة...</option>
                    {ENTITIES_LIST.map((item, idx) => (
                      <option key={idx} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">نوع المخالفة / الخرق القانوني:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="w-full p-3 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="">اختر تصنيف المخالفة...</option>
                    {CATEGORIES_LIST.map((item, idx) => (
                      <option key={idx} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">تفاصيل الواقعة والأدلة:</label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="اشرح الواقعة بالتفصيل (الأشخاص المعنيين، الزمان، المكان، أو أي معطيات تدعم البلاغ)..."
                    required
                    rows={4}
                    className="w-full p-3 border border-slate-300 rounded-lg"
                  ></textarea>
                </div>

                <div>
                  <label className="block font-bold mb-1">
                    إرفاق الدليل (إجباري) <span className="text-red-600">*</span>
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    يرجى إرفاق صورة، فيديو، تسجيل صوتي، أو وثيقة (PDF, Word) تؤكد الواقعة.
                  </p>
                  <input
                    type="file"
                    accept="image/*,video/*,application/pdf,.doc,.docx"
                    required
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 text-sm cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700"
                  />
                  {file && (
                    <p className="text-xs text-green-600 font-bold mt-1">
                      📄 تم اختيار الملف: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  {loading ? (uploadProgress || 'جاري الإرسال...') : 'إرسال البلاغ والدليل بشكل آمن'}
                </button>
              </form>
            )}
          </div>
        )}

        {tab === 'track' && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <form onSubmit={handleTrack} className="space-y-4">
              <div>
                <label className="block font-bold mb-1">أدخل الرمز المرجعي للبلاغ:</label>
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="مثال: RASED-1234-ABCD"
                  required
                  className="w-full p-3 border border-slate-300 rounded-lg font-mono text-center text-lg"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
              >
                {loading ? 'جاري البحث...' : 'استعلام عن البلاغ'}
              </button>
            </form>

            {trackError && (
              <p className="mt-4 text-center text-red-600 font-bold">{trackError}</p>
            )}

            {trackResult && (
              <div className="mt-6 p-4 bg-slate-50 border border-slate-300 rounded-lg space-y-2">
                <p><strong>حالة البلاغ:</strong> <span className="text-blue-600 font-bold">{trackResult.status}</span></p>
                <p><strong>تاريخ التقديم:</strong> {new Date(trackResult.created_at).toLocaleDateString('ar-EG')}</p>
                <p><strong>ملاحظات المراجعة:</strong> {trackResult.admin_notes || 'لا توجد ملاحظات إضافية حالياً.'}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}