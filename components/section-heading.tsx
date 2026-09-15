import { Reveal } from "./reveal";

/** 区块标题：主副标题居中，正文收进下方的终端卡片 */
export function SectionHeading({
  id,
  title,
  sub,
  titleSpans,
}: {
  id: string;
  title: string;
  sub?: string;
  /** 长标题按短语分段（nowrap），避免 CJK 在词中断行 */
  titleSpans?: string[];
}) {
  return (
    <Reveal>
      <header className="mb-8 text-center md:mb-10">
        <h2
          id={id}
          className="text-[clamp(1.875rem,4.5vw,3.25rem)] leading-[1.25] font-semibold text-balance"
        >
          {titleSpans
            ? titleSpans.map((s, i) => (
                <span key={i} className="whitespace-nowrap">
                  {s}
                </span>
              ))
            : title}
        </h2>
        {sub && (
          <p className="mx-auto mt-3 max-w-[36em] text-[15px] leading-[1.75] text-body md:text-base">
            {sub}
          </p>
        )}
      </header>
    </Reveal>
  );
}
