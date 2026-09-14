import type { Metadata } from "next";
import { Anton, JetBrains_Mono, Newsreader, Space_Grotesk } from "next/font/google";

/**
 * DESIGN LAB：设计方向展示平台。
 * 与主站完全隔离——自己的字体、自己的配色、自己的页面结构，
 * 只复用 content/ 里的真实数据。选定方向后再回填主站。
 */

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
});

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbmono",
});

/** pi.dev 式编辑衬线（Plantin 的开放替代），用于方案 C 的叙事标题 */
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-news",
});

export const metadata: Metadata = {
  title: "DESIGN LAB — CUMT-SYSSEC",
  description: "系统安全实验室主页设计方向展示平台：三套大胆方案，选一。",
};

export default function LabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${grotesk.variable} ${anton.variable} ${jetbrains.variable} ${newsreader.variable}`}
    >
      {children}
    </div>
  );
}
