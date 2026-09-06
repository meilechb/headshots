import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-6 py-16">
      <div className="text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-3 font-display text-4xl">That page isn’t here.</h1>
        <p className="mt-3 text-sm text-muted">
          If you followed a gallery link, check the spelling or ask for a new
          one.
        </p>
        <Link href="/" className="btn-primary mt-8">
          Back to the site
        </Link>
      </div>
    </main>
  );
}
