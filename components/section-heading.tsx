import { Reveal } from "./reveal";

/** 区块标题：中文标题行高约 1.25，辅助短句为次要文字 */
export function SectionHeading({
  id,
  title,
  sub,
  dark = false,
}: {
  id: string;
  title: string;
  sub?: string;
  dark?: boolean;
}) {
  return (
    <Reveal>
      <header className="mb-10 md:mb-14">
        <h2
          id={id}
          className="text-[clamp(1.875rem,4.5vw,3.25rem)] leading-[1.25] font-semibold"
        >
          {title}
        </h2>
        {sub && (
          <p
            className={`mt-4 text-[15px] leading-[1.75] md:text-base ${
              dark ? "text-mist" : "text-body"
            }`}
          >
            {sub}
          </p>
        )}
      </header>
    </Reveal>
  );
}
