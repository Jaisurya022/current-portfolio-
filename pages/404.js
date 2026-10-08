import Link from "next/link";
import Seo from "@/components/Seo";

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found" />
      <section className="container-x flex min-h-[80vh] flex-col items-start justify-center pt-24">
        <p className="font-display text-[clamp(5rem,18vw,12rem)] font-extrabold leading-none text-marigold">404</p>
        <h1 className="mt-4 text-4xl font-bold">This page doesn&apos;t exist.</h1>
        <p className="mt-3 text-mist">The link may be old or mistyped.</p>
        <Link href="/" className="btn btn-primary mt-8">Back to the homepage</Link>
      </section>
    </>
  );
}
