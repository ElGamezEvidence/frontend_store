import { Manrope, Fraunces } from "next/font/google";

const body = Manrope({ subsets: ["latin"], variable: "--font-body" });
const display = Fraunces({ subsets: ["latin"], variable: "--font-display" });

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${body.variable} ${display.variable} dark min-h-screen bg-background text-foreground`}>
      {children}
    </div>
  );
}
