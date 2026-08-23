import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kairo — Your AI reputation isn't the same everywhere",
  description:
    "See how AI chatbots describe your brand differently depending on which country the question is asked from. Side by side, with evidence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
