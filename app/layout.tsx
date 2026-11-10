import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Letterly AI — Cover letters that open doors",
  description: "Create a tailored, ATS-friendly cover letter in minutes with Letterly AI.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}