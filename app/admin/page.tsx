'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // كلمة مرور بسيطة لحماية اللوحة (يمكن تطويرها لاحقاً بنظام Supabase Auth)
  const ADMIN_PASSWORD = 'admin123rased';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      fetchReports();
    } else {
      alert('كلمة المرور غير صحيحة');
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    setLoading(false);
    if (!error && data) {
      setReports(data);
    }
  };

  const updateReportStatus = async (id: string, newStatus: string, adminNotes: string) => {
    const { error } = await supabase
      .from('reports')
      .update({ status: newStatus, admin_notes: adminNotes })
      .eq('id', id);

    if (error) {
      alert('حدث خطأ أثناء التحديث');
    } else {
      alert('تم تحديث حالة البلاغ بنجاح');
      fetchReports();
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4 dir-rtl">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4 text-slate-800">🔐 دخول لوحة مراجعي راصد</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="أدخل كلمة مرور المسؤول..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg text-center"
            />
            <button
              type="submit"
              className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition"
            >
              دخول
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8 dir-rtl">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">📊 لوحة إشراف ومتابعة البلاغات</h1>
            <p className="text-slate-600 text-sm">مراجعة ومعالجة البلاغات الواردة بحرية وأمان</p>
          </div>
          <button
            onClick={fetchReports}
            className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700 transition"
          >
            تحديث البيانات 🔄
          </button>
        </header>

        {loading ? (
          <div className="text-center py-12 font-bold text-slate-600">جاري تحميل البلاغات...</div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} onUpdate={updateReportStatus} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function ReportCard({ report, onUpdate }: { report: any; onUpdate: (id: string, status: string, notes: string) => void }) {
  const [status, setStatus] = useState(report.status || 'قيد الفحص');
  const [notes, setNotes] = useState(report.admin_notes || '');

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 space-y-4">
      <div className="flex flex-wrap justify-between items-start gap-2 border-b border-slate-100 pb-3">
        <div>
          <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full font-mono font-bold text-sm">
            {report.tracking_code}
          </span>
          <span className="mr-2 bg-red-100 text-red-800 px-3 py-1 rounded-full font-bold text-sm">
            {report.category}
          </span>
        </div>
        <span className="text-xs text-slate-500">
          {new Date(report.created_at).toLocaleString('ar-EG')}
        </span>
      </div>

      <div>
        <h4 className="font-bold text-slate-700">الجهة المعنية: <span className="text-slate-900">{report.entity}</span></h4>
        <p className="mt-2 bg-slate-50 p-3 rounded-lg text-slate-800 whitespace-pre-wrap">{report.details}</p>
      </div>

      <div className="pt-2 border-t border-slate-100 grid md:grid-cols-2 gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">تحديث حالة البلاغ:</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg bg-white"
          >
            <option value="قيد الفحص">قيد الفحص</option>
            <option value="قيد التحقيق">قيد التحقيق والتحري</option>
            <option value="تمت الإحالة للجهات المختصة">تمت الإحالة للجهات المختصة</option>
            <option value="مغلق / غير مكتمل الأدلة">مغلق / غير مكتمل الأدلة</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">ملاحظات المراجعة (تظهر للراصد):</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="أضف رد أو ملاحظة..."
            className="w-full p-2 border border-slate-300 rounded-lg"
          />
        </div>
      </div>

      <button
        onClick={() => onUpdate(report.id, status, notes)}
        className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition"
      >
        حفظ التغييرات
      </button>
    </div>
  );
}