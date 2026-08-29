import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-24 text-center sm:px-6">
      <h1 className="font-serif text-3xl font-semibold">
        That page isn’t in the dictionary
      </h1>
      <p className="mt-3 text-ink-soft">
        The concept you’re looking for doesn’t exist — or hasn’t been added
        yet.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block text-accent underline underline-offset-4"
      >
        Back to search
      </Link>
    </div>
  );
}
