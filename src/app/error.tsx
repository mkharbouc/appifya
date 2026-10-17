'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Application error:', error);
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-center" dir="rtl">
      <div className="max-w-md">
        <h1 className="text-xl font-bold mb-3">تعذر تحميل الصفحة</h1>
        <p className="text-sm text-slate-400 mb-6">
          حدث خطأ أثناء تشغيل التطبيق. أعد المحاولة، وإذا استمر الخطأ تواصل مع الدعم.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm"
        >
          إعادة المحاولة
        </button>
      </div>
    </main>
  );
}
