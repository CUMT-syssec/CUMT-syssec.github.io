import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "系统安全实验室 CUMT-SYSSEC · 中国矿业大学",
  description:
    "中国矿业大学系统安全实验室（CUMT-SYSSEC）：系统安全与优化、虚拟化、云计算安全。介绍实验室教师、学生去向、科研成果与研究文化。",
  openGraph: {
    title: "系统安全实验室 CUMT-SYSSEC · 中国矿业大学",
    description:
      "中国矿业大学系统安全实验室：系统安全与优化、虚拟化、云计算安全。",
    type: "website",
    locale: "zh_CN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
