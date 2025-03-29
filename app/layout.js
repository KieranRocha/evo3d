// app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "./components/Navbar";
import "./globals.css";
import Footer from "./components/Footer";
import { AppProviders } from "./providers/AppProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "EVO 3D - Impressão 3D de Alta Qualidade",
  description:
    "Transformando suas ideias em realidade através da impressão 3D de alta qualidade.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProviders>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="">{children}</main>
            <Footer />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
