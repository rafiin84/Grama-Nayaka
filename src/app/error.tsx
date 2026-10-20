"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (<div className="grid min-h-screen place-items-center p-6 text-center"><div><h1 className="text-2xl font-bold">ಏನೋ ತಪ್ಪಾಗಿದೆ / Something went wrong</h1><p className="mt-2 text-sm text-muted">{error.message}</p><button onClick={reset} className="mt-5 rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-fg">Retry / ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ</button></div></div>);
}
