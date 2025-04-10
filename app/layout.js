import Navbar from "./components/Navbar";
import "./globals.css";
import Footer from "./components/Footer";
import { ReduxProvider } from "./redux/provider";
import { Providers } from "./providers";

export const metadata = {
  title: "EVO 3D - Impressão 3D de Alta Qualidade",
  description:
    "Transformando suas ideias em realidade através da impressão 3D de alta qualidade.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <ReduxProvider>
          <Providers>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </Providers>
        </ReduxProvider>
      </body>
    </html>
  );
}
