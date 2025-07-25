import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { AuthClientProvider } from "@/providers/auth-client-provider";
import { TRPCProvider } from "@/providers/trpc-provider";
import { Toaster } from "sonner";

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage-grotesque",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ArchiCassoAI Pro",
  description: "AI-powered interior design platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bricolageGrotesque.variable} antialiased`}
      >
        <AuthClientProvider>
          <TRPCProvider>
            {children}
            <Toaster />
          </TRPCProvider>
        </AuthClientProvider>
      </body>
    </html>
  );
}
