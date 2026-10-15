'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('الكل');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      setUser(data.user);
      fetchReports();
    }
  };

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

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError('بيانات الدخول غير صحيحة، يرجى التأكد من البريد وكلمة المرور.');
    } else if (data.user) {
      setUser(data.user);
      fetchReports();
    }

    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setEmail('');
    setPassword('');
  };

  const handleUpdateReport = async (id: string, newStatus: string, newReply: string) => {
    setUpdatingId(id);
    const { error } = await supabase
      .from('reports')
      .update({
        status: newStatus,
        admin_reply: newReply,
      })
      .eq('id', id);

    setUpdatingId(null);

    if (error) {
      alert('حدث خطأ أثناء التحديث: ' + error.message);
    } else {
      alert('تم حفظ التحديث بنجاح!');
      fetchReports();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 dir-rtl">
        <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="text-4xl">🔐</div>
            <h1 className="text-2xl font-black">دخول المشرفين</h1>
            <p className="text-xs text-slate-400">منطقة محظورة مخصصة للمصرح لهم فقط</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {authError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl text-center font-bold">
                {authError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">البريد الإلكتروني:</label>
              <input
                type="email"
                required
                placeholder="example@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 text-left dir-ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">كلمة المرور:</label>
              <input
                type="password"
                required
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg disabled:opacity-50"
            >
              {authLoading ? 'جاري التحقق...' : 'دخول اللوحة'}
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition">
              ← العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredReports =
    statusFilter === 'الكل' ? reports : reports.filter((r) => r.status === statusFilter);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-4 md:p-8 dir-rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <span>📊</span> لوحة إشراف ومتابعة البلاغات
            </h1>
            <p className="text-xs text-slate-500 mt-1">مراجعة ومعالجة البلاغات الواردة</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-100 px-4 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-2">
              <span>المشرف:</span>
              <span className="text-blue-600 font-bold dir-ltr">{user.email}</span>
            </div>

            <button
              onClick={fetchReports}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
            >
              <span>🔄</span> تحديث
            </button>

            <button
              onClick={handleLogout}
              className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold px-4 py-2.5 rounded-xl transition"
            >
              خروج
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-2 overflow-x-auto text-xs font-bold">
          <span className="text-slate-400 whitespace-nowrap ml-2">تصفية:</span>
          {['الكل', 'جديد', 'قيد المراجعة', 'قيد التحقيق', 'تم الاتخاذ والإحالة', 'مكتمل ومغلق', 'مرفوض / غير مستوفي'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-xl transition whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st} ({st === 'الكل' ? reports.length : reports.filter((r) => r.status === st).length})
            </button>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm min-h-[300px]">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-sm">جاري التحميل...</div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">لا توجد بلاغات مسجلة.</div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <AdminReportCardItem
                  key={report.id}
                  report={report}
                  isUpdating={updatingId === report.id}
                  onSave={(status, reply) => handleUpdateReport(report.id, status, reply)}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function AdminReportCardItem({ report, isUpdating, onSave }: { report: any; isUpdating: boolean; onSave: (status: string, reply: string) => void }) {
  const [status, setStatus] = useState(report.status || 'جديد');
  const [reply, setReply] = useState(report.admin_reply || '');

  useEffect(() => {
    if (report) {
      setStatus(report.status || 'جديد');
      setReply(report.admin_reply || '');
    }
  }, [report]);

  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4 shadow-sm text-right dir-rtl">
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <span className="font-mono font-bold text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-lg">
          {report.reference_code || 'RSD-UNKNOWN'}
        </span>
        <span className="text-xs text-slate-400">
          {report.created_at ? new Date(report.created_at).toLocaleDateString('ar-EG') : 'تاريخ غير محدد'}
        </span>
      </div>

      <h3 className="font-black text-slate-900 text-base">{report.title}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600">
        <div><span className="font-bold">نوع الفساد:</span> {report.category || report.violation_type || 'غير محدد'}</div>
        <div><span className="font-bold">الموقع / الجهة:</span> [{report.entity || 'غير محدد'}] {report.location || ''}</div>
        <div><span className="font-bold">المُبلّغ:</span> {report.reporter_name || 'أنت تعلم من'} ({report.reporter_phone || report.contact_number || 'بدون رقم'})</div>
        <div><span className="font-bold">الحالة الحالية:</span> <span className="bg-slate-200 px-2 py-0.5 rounded font-bold">{report.status || 'جديد'}</span></div>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
        {report.description}
      </div>

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

      {/* قسم اتخاذ الإجراء والرد المطلوب المباشر */}
      <div className="bg-white p-4 rounded-xl border border-slate-300 space-y-3 pt-3 mt-3 shadow-sm">
        <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">⚙️ اتخاذ إجراء المشرف:</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">تعديل الحالة:</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-2.5 font-bold outline-none cursor-pointer"
            >
              <option value="جديد">جديد</option>
              <option value="قيد المراجعة">قيد المراجعة</option>
              <option value="قيد التحقيق">قيد التحقيق</option>
              <option value="تم الاتخاذ والإحالة">تم الاتخاذ والإحالة</option>
              <option value="مكتمل ومغلق">مكتمل ومغلق</option>
              <option value="مرفوض / غير مستوفي">مرفوض / غير مستوفي</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-slate-600 mb-1">الرد الرسمي (لالمواطن):</label>
            <input
              type="text"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="اكتب الرد الرسمي هنا..."
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-2.5 outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => onSave(status, reply)}
            disabled={isUpdating}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition shadow disabled:opacity-50 cursor-pointer"
          >
            {isUpdating ? 'جاري الحفظ...' : '💾 حفظ الإجراء والرد'}
          </button>
        </div>
      </div>
    </div>
  );
}