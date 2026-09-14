import { Reveal } from "./reveal";

/** 区块标题：主副标题居中，正文收进下方的终端卡片 */
export function SectionHeading({
  id,
  title,
  sub,
}: {
  id: string;
  title: string;
  sub?: string;
}) {
  return (
    <Reveal>
      <header className="mb-8 text-center md:mb-10">
        <h2
          id={id}
          className="mx-auto max-w-[16em] text-[clamp(1.875rem,4.5vw,3.25rem)] leading-[1.25] font-semibold text-balance"
        >
          {title}
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
