'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function TrackReportPage() {
  const [searchCode, setSearchCode] = useState('');
  const [trackedReport, setTrackedReport] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;

    setIsSearching(true);
    setSearchError('');
    setTrackedReport(null);

    // جلب البيانات مع استبعاد رابط المرفق لضمان السرية والخصوصية
    const { data, error } = await supabase
      .from('reports')
      .select('id, title, description, category, entity, status, admin_reply, reference_code, created_at')
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
        <header className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <Link href="/" className="text-amber-400 font-black text-xl flex items-center gap-2">
            🛡️ منصة راصد
          </Link>
          
          <div className="flex items-center gap-3">
            <Link href="/report" className="text-xs text-slate-300 hover:text-amber-400 font-bold px-3 py-2">
              📝 تقديم بلاغ جديد
            </Link>
            <Link href="/admin" className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl border border-slate-700 font-bold">
              🔐 لوحة الإشراف
            </Link>
          </div>
        </header>

        {/* كرت متابعة حالة البلاغ */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl">
          <h2 className="text-lg font-black text-amber-400 border-b border-slate-800 pb-3 flex items-center gap-2">
            <span>🔍</span> متابعة حالة بلاغ سابق
          </h2>

          <form onSubmit={handleTrack} className="flex gap-2">
            <input
              type="text"
              required
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="أدخل الرمز المرجعي (مثال: RSD-YRCTK1)..."
              className="flex-1 bg-slate-950 border border-slate-800 text-xs rounded-xl p-3 outline-none focus:border-amber-500 uppercase font-mono"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-6 py-3 rounded-xl text-xs transition disabled:opacity-50"
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
            <div className="border border-slate-800 rounded-2xl p-5 bg-slate-950 space-y-4 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-mono text-xs text-amber-400 font-bold">
                  {trackedReport.reference_code}
                </span>
                <span className="text-[11px] bg-slate-800 px-2.5 py-1 rounded-md text-amber-300 font-bold border border-slate-700">
                  الحالة: {trackedReport.status || 'جديد'}
                </span>
              </div>

              <h3 className="font-black text-white text-sm">{trackedReport.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
                {trackedReport.description}
              </p>

              {/* رد الإدارة الرسمي فقط للمواطن */}
              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-1">
                <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <span>📩</span> رد وإجراء الإدارة:
                </h4>
                <p className="text-xs text-slate-200 font-semibold leading-relaxed">
                  {trackedReport.admin_reply || 'البلاغ قيد المراجعة والتقييم من قبل فريق الإشراف.'}
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}