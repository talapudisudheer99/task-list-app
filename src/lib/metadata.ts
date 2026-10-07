import type { Metadata } from "next";
import { APP } from "@/lib/constants/app";

function getMetadataBase(): URL | undefined {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (!url) {
    return undefined;
  }
  try {
    return new URL(url);
  } catch {
    return undefined;
  }
}

/** Shared site metadata for the root layout. */
export function buildRootMetadata(): Metadata {
  const metadataBase = getMetadataBase();

  return {
    metadataBase,
    title: {
      default: APP.name,
      template: `%s · ${APP.name}`,
    },
    description: APP.description,
    applicationName: APP.name,
    keywords: [...APP.keywords],
    authors: [{ name: APP.name }],
    creator: APP.name,
    icons: {
      icon: [{ url: "/logo.svg", type: "image/svg+xml" }],
      shortcut: "/logo.svg",
      apple: "/logo.svg",
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: APP.name,
      title: APP.name,
      description: APP.description,
      ...(metadataBase ? { url: metadataBase } : {}),
    },
    twitter: {
      card: "summary",
      title: APP.name,
      description: APP.description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
