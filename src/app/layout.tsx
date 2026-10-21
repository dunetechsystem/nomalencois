import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Josefin_Sans, Marcellus } from "next/font/google";
import "./globals.css";
import { site } from "@/config/site";
import { getAgency } from "@/lib/dunastour/server";
import { agencyInfo } from "@/lib/agency-info";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { CartDrawer } from "@/components/checkout/CartDrawer";

// Marcellus = letreiro "NOMA"; Josefin Sans = textos finos dos posts; Cormorant itálico = palavra em destaque.
const marcellus = Marcellus({ subsets: ["latin"], weight: "400", variable: "--font-marcellus", display: "swap" });
const josefin = Josefin_Sans({ subsets: ["latin"], variable: "--font-josefin", display: "swap" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["500"], style: ["italic"], variable: "--font-cormorant", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "NOMA · Agência de Turismo nos Lençóis Maranhenses",
    template: "%s · NOMA Lençóis",
  },
  description:
    "Bem-vindo ao Maranhão real. Lagoas, Circuito Caburé, Mirar das estrelas, transfer e roteiros sob medida nos Lençóis Maranhenses com a NOMA.",
  keywords: ["Lençóis Maranhenses", "Barreirinhas", "passeios", "Lagoa Azul", "Lagoa Bonita", "Atins", "Rio Preguiças", "agência de turismo", "NOMA"],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: site.name,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "NOMA Agência de Turismo" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#2f5e5f",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const info = agencyInfo(await getAgency());
  return (
    <html lang="pt-BR" className={`${marcellus.variable} ${josefin.variable} ${cormorant.variable}`}>
      <body className="min-h-screen overflow-x-hidden">
        <Header info={info} />
        <main>{children}</main>
        <Footer info={info} />
        <WhatsAppFab phone={info.phone} />
        {site.onlineBooking && <CartDrawer />}
      </body>
    </html>
  );
}
