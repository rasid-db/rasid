'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AdminPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });
      
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
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-amber-400 font-black text-lg">
              🛡️ منصة راصد
            </Link>
            <span className="text-xs text-slate-500">|</span>
            <h1 className="text-lg font-bold text-slate-200">لوحة الإشراف والمتابعة</h1>
          </div>
          
          <button
            onClick={fetchReports}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl border border-slate-700 font-bold transition"
          >
            🔄 تحديث القائمة
          </button>
        </div>

        {loading ? (
          <p className="text-slate-400 text-xs">جاري تحميل البلاغات...</p>
        ) : reports.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
            لا توجد بلاغات حالياً.
          </div>
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

function ReportCard({ report, onUpdate }: { report: any; onUpdate?: () => void }) {
  const [status, setStatus] = useState(report?.status || 'جديد');
  const [adminReply, setAdminReply] = useState(report?.admin_reply || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (report) {
      setStatus(report.status || 'جديد');
      setAdminReply(report.admin_reply || '');
    }
  }, [report]);

  const handleUpdate = async () => {
    if (!report?.id) return;

    setIsUpdating(true);
    const { error } = await supabase
      .from('reports')
      .update({
        status,
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

  const handleDelete = async () => {
    if (!report?.id) return;

    const confirmDelete = confirm(
      `هل أنت تأكد من حذف البلاغ رقم (${report.reference_code}) نهائياً؟`
    );

    if (!confirmDelete) return;

    setIsDeleting(true);
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', report.id);

    setIsDeleting(false);

    if (error) {
      alert('حدث خطأ أثناء حذف البلاغ: ' + error.message);
    } else {
      alert('تم حذف البلاغ بنجاح!');
      if (onUpdate) onUpdate();
    }
  };

  return (
    <div className="border border-slate-800 rounded-2xl p-5 bg-slate-900/80 space-y-4 shadow-sm text-slate-100">
      
      {/* رأس الكرت */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <span className="font-mono font-bold text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-lg">
          {report.reference_code || 'بدون رمز'}
        </span>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400">
            {report.created_at ? new Date(report.created_at).toLocaleDateString('ar-EG') : ''}
          </span>

          {/* زر حذف البلاغ للمشرف */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-[11px] bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold px-3 py-1 rounded-lg transition disabled:opacity-50 flex items-center gap-1 cursor-pointer"
          >
            <span>🗑️</span>
            {isDeleting ? 'جاري الحذف...' : 'حذف البلاغ'}
          </button>
        </div>
      </div>

      <h3 className="font-black text-white text-base">{report.title || 'بدون عنوان'}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
        <div><span className="font-bold text-amber-400">نوع الجريمة:</span> {report.category || 'غير محدد'}</div>
        <div><span className="font-bold text-amber-400">الجهة / الوزارة:</span> {report.entity || 'غير محدد'}</div>
        <div>
          <span className="font-bold text-amber-400">المُبلّغ:</span>{' '}
          {report.reporter_name || 'سري'} ({report.reporter_phone || 'بدون رقم'})
        </div>
        <div>
          <span className="font-bold text-amber-400">الحالة الحالية:</span>{' '}
          <span className="bg-slate-800 px-2.5 py-0.5 rounded-md font-bold text-amber-300 border border-slate-700">
            {report.status || 'جديد'}
          </span>
        </div>
      </div>

      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
        {report.description || 'لا توجد تفاصيل لهذا البلاغ.'}
      </div>

      {/* عرض الدليل المرفق للمشرف حصراً */}
      {report.attachment_url && (
        <div className="pt-1">
          <a
            href={report.attachment_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:underline bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/30 font-bold"
          >
            📎 معاينة الدليل والمرفق
          </a>
        </div>
      )}

      {/* إجراءات المشرف والرد */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 pt-3 mt-3 shadow-inner">
        <h4 className="text-xs font-black text-amber-400 flex items-center gap-1.5">
          <span>⚙️</span> اتخاذ إجراء المشرف وتعديل الحالة:
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
              <option value="مرفوض / مزحة / غير مستوفي">مرفوض / غير مستوفي</option>
            </select>
          </div>

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