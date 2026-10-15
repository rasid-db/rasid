'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ReportCard({ report, onUpdate }: { report: any; onUpdate?: () => void }) {
  const [status, setStatus] = useState(report?.status || 'جديد');
  const [adminReply, setAdminReply] = useState(report?.admin_reply || '');
  const [isUpdating, setIsUpdating] = useState(false);

  // إذا لم تتم تصفية البيانات بشكل صحيح، نمنع حدوث Error في الصفحة
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
    <div className="border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition bg-slate-50/50 space-y-4 shadow-sm dir-rtl text-right">
      {/* الهيدر: الرمز المرجعي والتاريخ */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <span className="font-mono font-bold text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-lg">
          {report.reference_code || 'بدون رمز'}
        </span>
        <span className="text-xs text-slate-400">
          {report.created_at ? new Date(report.created_at).toLocaleDateString('ar-EG') : 'تاريخ غير محدد'}
        </span>
      </div>

      {/* عنوان البلاغ */}
      <h3 className="font-black text-slate-900 text-base">{report.title || 'بدون عنوان'}</h3>

      {/* تفاصيل الميتا */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600">
        <div><span className="font-bold">نوع الفساد:</span> {report.category || report.violation_type || 'غير محدد'}</div>
        <div><span className="font-bold">الموقع / الجهة:</span> {report.entity || report.location || 'غير محدد'}</div>
        <div>
          <span className="font-bold">المُبلّغ:</span>{' '}
          {report.reporter_name || 'أنت تعلم من'} ({report.reporter_phone || report.contact_number || 'بدون رقم'})
        </div>
        <div>
          <span className="font-bold">الحالة الحالية:</span>{' '}
          <span className="bg-slate-200 px-2.5 py-0.5 rounded-md font-bold text-slate-800">
            {report.status || 'جديد'}
          </span>
        </div>
      </div>

      {/* نص البلاغ */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
        {report.description || 'لا توجد تفاصيل لهذا البلاغ.'}
      </div>

      {/* المرفق إن وجد */}
      {(report.attachment_url || report.file_url) && (
        <div className="pt-1">
          <a
            href={report.attachment_url || report.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-blue-700 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 font-bold"
          >
            📎 عرض المرفق / المستند
          </a>
        </div>
      )}

      {/* ⚙️ قسم اتخاذ الإجراء من قبل المشرف */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 space-y-3 pt-3 mt-3 shadow-inner">
        <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
          <span>⚙️</span> اتخاذ إجراء المشرف وتعديل الحالة:
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* اختيار الحالة */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">تغيير حالة البلاغ:</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
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
            <label className="block text-[11px] font-bold text-slate-600 mb-1">رد الإدارة (يظهر للمواطن):</label>
            <input
              type="text"
              value={adminReply}
              onChange={(e) => setAdminReply(e.target.value)}
              placeholder="اكتب الرد الرسمي والإجراء المتخذ..."
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* زر الحفظ */}
        <div className="flex justify-end pt-1">
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition shadow disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {isUpdating ? 'جاري الحفظ...' : '💾 حفظ الإجراء والرد'}
          </button>
        </div>
      </div>
    </div>
  );
}