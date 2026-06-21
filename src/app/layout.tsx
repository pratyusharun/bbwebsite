import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { site } from "@/content/site";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? site.url;
const title = "Byte Brainiacs: ML Showdown — India's Premier ML Competition";
const description = site.hero.sub;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s · Byte Brainiacs",
  },
  description,
  applicationName: "Byte Brainiacs: ML Showdown",
  keywords: [
    "machine learning hackathon",
    "ML competition India",
    "Byte Brainiacs",
    "ML Showdown",
    "NM College",
    "Narsee Monjee College",
    "AI competition",
    "data science contest",
  ],
  authors: [{ name: `${site.org}, ${site.college}` }],
  creator: site.org,
  publisher: site.college,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Byte Brainiacs: ML Showdown",
    title,
    description,
    images: [
      {
        url: "/logo.jpeg",
        width: 1200,
        height: 1140,
        alt: "Byte Brainiacs: The ML Showdown",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/logo.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: "/logo.jpeg",
    apple: "/logo.jpeg",
  },
};

export const viewport: Viewport = {
  themeColor: "#190F30",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Byte Brainiacs: ML Showdown",
  description,
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
  organizer: {
    "@type": "CollegeOrUniversity",
    name: site.college,
    department: site.org,
    sameAs: [site.socials.instagram, site.socials.linkedin],
  },
  location: {
    "@type": "Place",
    name: site.contact.location,
    address: "Mumbai, Maharashtra, India",
  },
  url: siteUrl,
  image: `${siteUrl}/logo.jpeg`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrains.variable} ${fraunces.variable}`}
    >
      <body className="font-body antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="afterglow-mesh" aria-hidden />
        <div className="afterglow-grid" aria-hidden />
        <div className="noise" aria-hidden />
        <SmoothScroll />
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
