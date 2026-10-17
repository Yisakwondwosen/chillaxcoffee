import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-pure-white text-graphite p-6 text-center">
      <h1 className="font-retro text-[64px] font-normal leading-none mb-3">404</h1>
      <p className="font-sans text-[15px] text-iron mb-6">This page could not be found.</p>
      <Link href="/" className="btn-cobalt">
        Return to Home
      </Link>
    </main>
  );
}
