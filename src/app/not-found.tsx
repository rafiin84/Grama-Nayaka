import Link from "next/link";
export default function NotFound() {
  return (<div className="grid min-h-screen place-items-center p-6 text-center"><div><h1 className="text-3xl font-bold">404 · ಪುಟ ಸಿಗಲಿಲ್ಲ / Page not found</h1><p className="mt-2 text-muted">The page you opened does not exist in this demo.</p><Link href="/" className="mt-5 inline-block rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-fg">Home / ಮುಖಪುಟ</Link></div></div>);
}
