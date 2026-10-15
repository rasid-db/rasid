'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 1. المكون الرئيسي المخصص للصفحة (بدون Props)
export default function ReportPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setReports(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 dir-rtl text-right">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-black text-amber-400">إدارة ومتابعة البلاغات</h1>
        {loading ? (
          <p className="text-slate-400 text-sm">جاري تحميل البلاغات...</p>
        ) : reports.length === 0 ? (
          <p className="text-slate-400 text-sm">لا توجد بلاغات حالياً.</p>
        ) : (
          <div className="space-y-4">
            {reports.map((item) => (
              <ReportCard key={item.id} report={item} onUpdate={fetchReports} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// 2. المكون الفرعي الخاص ببطاقة البلاغ
function ReportCard({ report, onUpdate }: { report: any; onUpdate?: () => void }) {
  const [status, setStatus] = useState(report?.status || 'جديد');
  const [adminReply, setAdminReply] = useState(report?.admin_reply || '');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (report) {
      setStatus(report.status || 'جديد');
      setAdminReply(report.admin_reply || '');
    }
  }, [report]);

  if (!report) return null;

  const handleUpdate = async () => {
    if (!report?.id) {
      alert('خطأ: لم يتم العثور على المعرف الخاص بالبلاغ.');
      return;
    }

    setIsUpdating(true);
    const { error } = await supabase
      .from('reports')
      .update({
        status: status,
        admin_reply: adminReply,
      })
      .eq('id', report.id);

    setIsUpdating(false);

    if (error) {
      alert('حدث خطأ أثناء حفظ الإجراء: ' + error.message);
    } else {
      alert('تم تحديث حالة البلاغ والرد بنجاح!');
      if (onUpdate) onUpdate();
    }
  };

  return (
    <div className="border border-slate-800 rounded-2xl p-5 bg-slate-900/80 space-y-4 shadow-sm text-slate-100">
      {/* الهيدر: الرمز المرجعي والتاريخ */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <span className="font-mono font-bold text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-lg">
          {report.reference_code || 'بدون رمز'}
        </span>
        <span className="text-xs text-slate-400">
          {report.created_at ? new Date(report.created_at).toLocaleDateString('ar-EG') : 'تاريخ غير محدد'}
        </span>
      </div>

      {/* عنوان البلاغ */}
      <h3 className="font-black text-white text-base">{report.title || 'بدون عنوان'}</h3>

      {/* تفاصيل الميتا */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
        <div><span className="font-bold text-amber-400">نوع الفساد:</span> {report.category || report.violation_type || 'غير محدد'}</div>
        <div><span className="font-bold text-amber-400">الموقع / الجهة:</span> {report.entity || report.location || 'غير محدد'}</div>
        <div>
          <span className="font-bold text-amber-400">المُبلّغ:</span>{' '}
          {report.reporter_name || 'سري'} ({report.reporter_phone || report.contact_number || 'بدون رقم'})
        </div>
        <div>
          <span className="font-bold text-amber-400">الحالة الحالية:</span>{' '}
          <span className="bg-slate-800 px-2.5 py-0.5 rounded-md font-bold text-amber-300 border border-slate-700">
            {report.status || 'جديد'}
          </span>
        </div>
      </div>

      {/* نص البلاغ */}
      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
        {report.description || 'لا توجد تفاصيل لهذا البلاغ.'}
      </div>

      {/* المرفق إن وجد */}
      {(report.attachment_url || report.file_url) && (
        <div className="pt-1">
          <a
            href={report.attachment_url || report.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:underline bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/30 font-bold"
          >
            📎 عرض المرفق / المستند
          </a>
        </div>
      )}

      {/* قسم اتخاذ الإجراء من قبل المشرف */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 pt-3 mt-3 shadow-inner">
        <h4 className="text-xs font-black text-amber-400 flex items-center gap-1.5">
          <span>⚙️</span> اتخاذ إجراء المشرف وتعديل الحالة:
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* اختيار الحالة */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">تغيير حالة البلاغ:</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
            >
              <option value="جديد">جديد</option>
              <option value="قيد المراجعة">قيد المراجعة</option>
              <option value="قيد التحقيق">قيد التحقيق</option>
              <option value="تم الاتخاذ والإحالة">تم الاتخاذ والإحالة</option>
              <option value="مكتمل ومغلق">مكتمل ومغلق</option>
              <option value="مرفوض / غير مستوفي">مرفوض / غير مستوفي</option>
            </select>
          </div>

          {/* نص الرد */}
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-slate-400 mb-1">رد الإدارة (يظهر للمواطن):</label>
            <input
              type="text"
              value={adminReply}
              onChange={(e) => setAdminReply(e.target.value)}
              placeholder="اكتب الرد الرسمي والإجراء المتخذ..."
              className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
        </div>

        {/* زر الحفظ */}
        <div className="flex justify-end pt-1">
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 py-2 rounded-xl transition shadow disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {isUpdating ? 'جاري الحفظ...' : '💾 حفظ الإجراء والرد'}
          </button>
        </div>
      </div>
    </div>
  );
}