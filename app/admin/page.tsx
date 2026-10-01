'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Report {
  id: string;
  tracking_code: string;
  category: string;
  entity: string;
  details: string;
  status: string;
  admin_notes: string;
  evidence_url?: string;
  created_at: string;
}

const STATUS_OPTIONS = [
  'الكل',
  'قيد المراجعة',
  'قيد التحقيق',
  'تم الاتخاذ والإحالة',
  'مكتمل ومغلق',
  'مرفوض / غير مستوفي'
];

export default function AdminDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('الكل');

  // جلب البلاغات من Supabase
  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reports:', error);
      alert('حدث خطأ أثناء جلب البيانات');
    } else {
      setReports(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // تحديث حالة البلاغ والملاحظات
  const handleUpdate = async (id: string, status: string, admin_notes: string) => {
    setUpdatingId(id);
    const { error } = await supabase
      .from('reports')
      .update({ status, admin_notes })
      .eq('id', id);

    setUpdatingId(null);

    if (error) {
      alert('حدث خطأ أثناء حفظ التغييرات');
    } else {
      alert('تم تحديث حالة البلاغ بنجاح!');
      fetchReports();
    }
  };

  // حذف البلاغ
  const handleDelete = async (id: string, trackingCode: string) => {
    const confirmDelete = window.confirm(`هل أنت تأكد من رغبتك في حذف البلاغ رقم (${trackingCode}) نهائياً؟`);
    if (!confirmDelete) return;

    setUpdatingId(id);
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id);

    setUpdatingId(null);

    if (error) {
      alert('حدث خطأ أثناء حذف البلاغ');
    } else {
      alert('تم حذف البلاغ بنجاح');
      setReports(reports.filter(r => r.id !== id));
    }
  };

  // تصفية البلاغات بناءً على الحالة المختارة
  const filteredReports = reports.filter((report) => {
    if (selectedStatusFilter === 'الكل') return true;
    return (report.status || 'قيد المراجعة') === selectedStatusFilter;
  });

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 p-4 md:p-8 dir-rtl">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* الهيدر */}
        <header className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 flex items-center gap-2">
              📊 لوحة إشراف ومتابعة البلاغات
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              مراجعة ومعالجة البلاغات الواردة بحرية وأمان
            </p>
          </div>
          <button
            onClick={fetchReports}
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            🔄 {loading ? 'جاري التحميل...' : 'تحديث البيانات'}
          </button>
        </header>

        {/* شريط الفلترة حسب الحالة */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-slate-700 ml-2">تصفية حسب الحالة:</span>
          {STATUS_OPTIONS.map((statusOption) => {
            const count = statusOption === 'الكل'
              ? reports.length
              : reports.filter(r => (r.status || 'قيد المراجعة') === statusOption).length;

            return (
              <button
                key={statusOption}
                onClick={() => setSelectedStatusFilter(statusOption)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedStatusFilter === statusOption
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{statusOption}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  selectedStatusFilter === statusOption ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* قائمة البلاغات */}
        {loading ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 font-bold">جاري تحميل البلاغات...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 font-bold">
              {selectedStatusFilter === 'الكل'
                ? 'لا توجد بلاغات مسجلة حالياً.'
                : `لا توجد بلاغات بحالة "${selectedStatusFilter}".`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                isUpdating={updatingId === report.id}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// مكون كارت البلاغ
function ReportCard({
  report,
  onUpdate,
  onDelete,
  isUpdating
}: {
  report: Report;
  onUpdate: (id: string, status: string, notes: string) => void;
  onDelete: (id: string, code: string) => void;
  isUpdating: boolean;
}) {
  const [status, setStatus] = useState(report.status || 'قيد المراجعة');
  const [notes, setNotes] = useState(report.admin_notes || '');

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 text-right">
      
      {/* أعلى الكارت: الرمز والتاريخ والحذف */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="bg-slate-100 text-slate-800 font-mono font-bold px-3 py-1 rounded-lg text-sm border border-slate-300">
            {report.tracking_code}
          </span>
          <span className="bg-red-50 text-red-600 font-bold px-3 py-1 rounded-lg text-xs border border-red-100">
            {report.category || 'غير محدد'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">
            {new Date(report.created_at).toLocaleString('ar-EG')}
          </span>
          <button
            onClick={() => onDelete(report.id, report.tracking_code)}
            disabled={isUpdating}
            className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded-lg text-xs font-bold transition border border-red-200"
          >
            🗑️ حذف
          </button>
        </div>
      </div>

      {/* الجهة والتفاصيل */}
      <div className="space-y-2">
        <p className="text-sm font-bold text-slate-700">
          الجهة المعنية: <span className="text-slate-900 font-extrabold">{report.entity || 'غير محددة'}</span>
        </p>
        
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
          {report.details}
        </div>
      </div>

      {/* رابط الدليل المرفق إن وجد */}
      {report.evidence_url && (
        <div className="pt-1">
          <a
            href={report.evidence_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs px-4 py-2 rounded-xl border border-emerald-200 transition"
          >
            📁 فتح الدليل المرفق (صورة / مستند)
          </a>
        </div>
      )}

      {/* تحديث الحالة والملاحظات */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">
            تحديث حالة البلاغ:
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:outline-none"
          >
            <option value="قيد المراجعة">قيد المراجعة</option>
            <option value="قيد التحقيق">قيد التحقيق</option>
            <option value="تم الاتخاذ والإحالة">تم الاتخاذ والإحالة</option>
            <option value="مكتمل ومغلق">مكتمل ومغلق</option>
            <option value="مرفوض / غير مستوفي">مرفوض / غير مستوفي</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">
            ملاحظات المراجعة (تظهر للراصد):
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="أضف رد أو ملاحظة للراصد..."
            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      <button
        onClick={() => onUpdate(report.id, status, notes)}
        disabled={isUpdating}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 rounded-xl transition shadow-sm disabled:opacity-50 mt-2"
      >
        {isUpdating ? 'جاري الحفظ...' : 'حفظ التغييرات'}
      </button>

    </div>
  );
}