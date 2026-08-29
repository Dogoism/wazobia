import type { Metadata } from "next";
import { Geist, Noto_Serif } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Noto Serif carries the full Latin Extended Additional range, so Yorùbá
// and Igbo under-dots and tone marks (ẹ́ ọ̀ ṣ ụ ị) render from one face
// instead of falling back mid-word.
const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin", "latin-ext", "vietnamese"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "YARN — say it the way it’s actually said",
    template: "%s · YARN",
  },
  description:
    "A cross-cultural phrase dictionary for English, Hausa, Igbo, and Yorùbá. YARN maps shared conversational intents to the natural expression in each language — not word-for-word translation.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${notoSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper-raised focus:px-3 focus:py-2 focus:text-sm"
        >
          Skip to content
        </a>
        <header className="border-b border-rule">
          <div className="mx-auto flex w-full max-w-6xl items-baseline justify-between gap-6 px-4 py-5 sm:px-6">
            <Link href="/" className="group flex items-baseline gap-3">
              <span className="font-serif text-2xl font-semibold tracking-tight">
                YARN
              </span>
              <span className="hidden text-sm text-muted sm:inline">
                say it the way it’s actually said
              </span>
            </Link>
            <nav aria-label="Primary">
              <Link
                href="/#browse"
                className="text-sm text-ink-soft underline-offset-4 hover:underline"
              >
                Browse concepts
              </Link>
            </nav>
          </div>
        </header>
        <main id="main" className="flex-1">
          {children}
        </main>
        <footer className="mt-16 border-t border-rule">
          <div className="mx-auto w-full max-w-6xl px-4 py-8 text-sm text-muted sm:px-6">
            <p className="max-w-3xl">
              YARN records how people actually speak. Every entry is labelled
              with its verification status, and machine-suggested content is
              never shown as verified. Regional forms appear only after
              native-speaker verification.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
