'use client';

import { useState, useEffect } from 'react';
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

  // التحقق من حالة تسجيل الدخول الحالية
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

  // جلب البلاغات من Supabase
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

  // تسجيل الدخول ببيانات Supabase Auth
  const handleLogin = async (e: React.FormEvent) => {
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

  // تسجيل الخروج
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setEmail('');
    setPassword('');
  };

  // 1. شاشة تسجيل الدخول
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
              <label className="block text-xs font-bold text-slate-300 mb-2">البريد الإلكتروني للمشرف:</label>
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

  // 2. شاشة لوحة الإشراف
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-4 md:p-8 dir-rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* الهيدر */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <span>📊</span> لوحة إشراف ومتابعة البلاغات
            </h1>
            <p className="text-xs text-slate-500 mt-1">مراجعة ومعالجة البلاغات الواردة</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-100 px-4 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-2">
              <span>المشرف الحالي:</span>
              <span className="text-blue-600 font-bold dir-ltr">{user.email}</span>
            </div>

            <button
              onClick={fetchReports}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
            >
              <span>🔄</span> تحديث البيانات
            </button>

            <button
              onClick={handleLogout}
              className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold px-4 py-2.5 rounded-xl transition"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>

        {/* أزرار التصفية */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-2 overflow-x-auto text-xs font-bold">
          <span className="text-slate-400 whitespace-nowrap ml-2">تصفية حسب الحالة:</span>
          {['الكل', 'قيد المراجعة', 'قيد التحقيق', 'تم الاتخاذ والإحالة', 'مكتمل ومغلق', 'مرفوض / غير مستوفي'].map((st) => (
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

        {/* قائمة البلاغات */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm min-h-[300px]">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-sm">جاري تحميل البلاغات...</div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">لا توجد بلاغات مسجلة حالياً.</div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="border border-slate-200 rounded-2xl p-4 hover:border-slate-300 transition bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                    <span className="font-mono font-bold text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-lg">
                      {report.reference_code}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(report.created_at).toLocaleDateString('ar-EG')}
                    </span>
                  </div>

                  <h3 className="font-black text-slate-900 text-base">{report.title}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600">
                    <div><span className="font-bold">نوع الفساد:</span> {report.category}</div>
                    <div><span className="font-bold">الموقع / الجهة:</span> {report.location}</div>
                    <div><span className="font-bold">المُبلّغ:</span> {report.reporter_name} ({report.reporter_phone || 'بدون رقم'})</div>
                    <div>
                      <span className="font-bold">الحالة:</span>{' '}
                      <span className="bg-slate-200 px-2.5 py-0.5 rounded-md font-bold text-slate-800">
                        {report.status || 'جديد'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    {report.description}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}