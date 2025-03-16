import { Roboto } from "next/font/google";
import "../theme/styles/globals.css";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  subsets: ["latin"],
});

export const metadata = {
  title: "Real-Time Chat App",
  description: "a real-time chat application",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${roboto.variable} font-roboto bg-gray-100 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
