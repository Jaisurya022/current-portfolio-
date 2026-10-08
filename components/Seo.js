import Head from "next/head";
import { profile } from "@/data/profile";

export default function Seo({ title, description = profile.summary, path = "" }) {
  const fullTitle = title ? `${title} | ${profile.name}` : `${profile.name} | Frontend Developer (React.js, Next.js)`;
  const url = `${profile.siteUrl}${path}`;
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={`${profile.siteUrl}/og-image.jpg`} />
      <meta name="twitter:card" content="summary_large_image" />
    </Head>
  );
}
