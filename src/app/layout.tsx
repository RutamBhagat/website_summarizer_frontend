import "~/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import ProviderLayout from "~/components/providers";

export const metadata: Metadata = {
  title: "BrochureCraft",
  description: "Instant Brochure & Website Summarizer",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body>
        <ProviderLayout>{children}</ProviderLayout>
      </body>
    </html>
  );
}
