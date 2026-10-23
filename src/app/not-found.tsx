import Link from 'next/link';
import { Home, Mail, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-[75vh] flex items-center justify-center px-4 py-16" dir="rtl">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 shadow-inner">
          <FileQuestion className="w-8 h-8" />
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 inline-block mb-3">
          خطأ 404 • Not Found
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
          الصفحة غير موجودة
        </h1>

        <p className="text-sm text-slate-400 mb-8 leading-relaxed">
          عذراً، الرابط الذي تحاول الوصول إليه غير موجود أو تم نقله. تحقق من صحة الرابط أو عد إلى الصفحة الرئيسية.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/20"
          >
            <Home className="w-4 h-4" />
            الرئيسية
          </Link>
          <Link
            href="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-sm transition-all"
          >
            <Mail className="w-4 h-4" />
            تواصل معنا
          </Link>
        </div>
      </div>
    </main>
  );
}
