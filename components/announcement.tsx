import type { CSSProperties } from "react";
import type { Announcement as AnnouncementContent } from "@/lib/types";

const pieces = Array.from({ length: 34 }, (_, index) => index);

function pieceStyle(index: number, side: "left" | "right"): CSSProperties {
  const direction = side === "left" ? 1 : -1;
  const peakX = 75 + ((index * 71) % 265);
  const peakY = 75 + ((index * 47) % 180);
  const rotation = (index % 2 === 0 ? 1 : -1) * (180 + ((index * 83) % 440));

  return {
    "--peak-x": `${direction * peakX}px`,
    "--peak-y": `${-peakY}px`,
    "--end-x": `${direction * (peakX + 25 + ((index * 29) % 90))}px`,
    "--end-y": `${30 + ((index * 59) % 140)}px`,
    "--mid-rotation": `${rotation / 2}deg`,
    "--rotation": `${rotation}deg`,
    "--delay": `${(index % 7) * 22}ms`,
  } as CSSProperties;
}

function ConfettiBurst({ side }: { side: "left" | "right" }) {
  return (
    <div className={`announcement-burst announcement-burst--${side}`} aria-hidden="true">
      {pieces.map((index) => (
        <span
          key={index}
          className="announcement-confetti"
          style={pieceStyle(index, side)}
        />
      ))}
    </div>
  );
}

/** 一次性礼炮开场；所有文字在动效期间保持可读。 */
export function Announcement({ content }: { content: AnnouncementContent }) {
  return (
    <section
      id="announcement"
      aria-labelledby="announcement-title"
      className="relative flex h-full min-h-[max(92svh,540px)] w-full flex-col overflow-y-auto px-5 text-center text-ink"
    >
      <ConfettiBurst side="left" />
      <ConfettiBurst side="right" />

      <div className="relative z-10 mx-auto my-auto flex w-full max-w-[880px] flex-col items-center pt-7">
        <p className="font-mono text-xs font-medium tracking-[0.16em] text-aux">
          CUMT-SYSSEC
        </p>
        <h1
          id="announcement-title"
          className="mt-3 text-[clamp(4.5rem,12vw,7rem)] leading-none font-semibold tracking-[0.08em] text-brand"
        >
          {content.title}
        </h1>
        <div className="mt-4 h-px w-12 bg-brand" aria-hidden="true" />

        <ul className="mt-5 w-full max-w-[720px] border-t border-ink/10">
          {content.results.map((result) => (
            <li
              key={result.name}
              className="border-b border-ink/10 px-2 py-2.5 text-[clamp(1rem,2.2vw,1.35rem)] leading-relaxed md:py-3"
            >
              <span className="inline-block">
                恭喜<span className="font-semibold">{result.name}</span>同学获
              </span>
              <wbr />
              <span className="inline-block whitespace-nowrap">
                <span className="font-semibold text-accent">{result.school}</span>
                拟录取
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-3 max-w-[720px] text-sm leading-relaxed text-aux">
          <span aria-hidden="true" className="mr-1">*</span>
          <span className="sr-only">注：</span>
          {content.statusNote}
        </p>
        <time
          className="mt-1.5 font-mono text-xs tracking-[0.1em] text-aux"
          dateTime={content.publishedAt}
        >
          {content.publishedAt.replaceAll("-", ".")} 发布
        </time>
      </div>

      <a
        href="#home"
        className="relative z-10 mx-auto mb-8 inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-sm text-body transition-colors hover:text-accent md:mb-10"
      >
        进入实验室首页
        <svg
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </a>
    </section>
  );
}
