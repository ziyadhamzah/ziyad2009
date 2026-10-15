import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { StoreProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth";
import { WishlistProvider } from "@/lib/wishlist";
import { ChatProvider } from "@/lib/chat";
import { ReviewsProvider } from "@/lib/review-store";
import { NotifyProvider } from "@/lib/notify";
import { CompareProvider } from "@/lib/compare";
import { AddressProvider } from "@/lib/addresses";
import { PriceWatchProvider } from "@/lib/pricewatch";
import { ThemeProvider } from "@/lib/theme";
import CompareBar from "@/components/CompareBar";
import Toast from "@/components/Toast";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
export const metadata: Metadata = { title: "Temanta", description: "Perlengkapan rumah dari pengrajin Indonesia." };

const themeScript = `try{var t=localStorage.getItem('temanta.theme.v1');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={jakarta.variable} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body className="font-sans">
        <ThemeProvider>
        <AuthProvider>
          <NotifyProvider>
            <WishlistProvider>
              <PriceWatchProvider>
              <ChatProvider>
                <CartProvider>
                  <StoreProvider>
                    <CompareProvider>
                    <AddressProvider>
                    <ReviewsProvider><Navbar /><main>{children}</main><Footer /><CompareBar /><Toast /></ReviewsProvider>
                    </AddressProvider>
                    </CompareProvider>
                  </StoreProvider>
                </CartProvider>
              </ChatProvider>
              </PriceWatchProvider>
            </WishlistProvider>
          </NotifyProvider>
        </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
