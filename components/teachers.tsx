import Image from "next/image";
import type { Teacher } from "@/lib/types";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

/**
 * 主要教师：单列依次排列。
 * 内容顺序固定：肖像 → 姓名 → 职务与身份 → 研究方向 → 简介 → 外部链接。
 * 姓名职务居中，简介放在居中窄容器里、段落左对齐。
 */
export function Teachers({ teachers }: { teachers: Teacher[] }) {
  return (
    <section id="teachers" aria-labelledby="teachers-title" className="scroll-mt-8">
      <SectionHeading
        id="teachers-title"
        title="主要教师"
        sub="认识与你一起做研究的人。"
      />
      <div className="space-y-20 md:space-y-24">
        {teachers.map((t) => (
          <Reveal key={t.id}>
            <article className="flex flex-col items-center text-center">
              {t.photo && (
                <Image
                  src={t.photo.src}
                  alt={t.photo.alt}
                  width={248}
                  height={298}
                  className="aspect-[4/5] w-[200px] rounded-[20px] object-cover md:w-[248px]"
                  priority
                />
              )}
              <h3 className="mt-8 text-[1.625rem] font-semibold md:text-[1.875rem]">
                {t.name}
              </h3>
              <p className="mt-3 text-sm text-aux md:text-[15px]">
                {t.roles.join(" · ")}
              </p>
              <p className="mt-2 text-sm text-aux md:text-[15px]">
                研究方向：{t.directions.join("、")}
              </p>
              <div className="mt-6 max-w-[680px] text-left">
                <p className="text-base leading-[1.8] text-body md:text-[17px]">
                  {t.bio}
                </p>
              </div>
              {t.links.length > 0 && (
                <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[15px]">
                  {t.links.map((l) => (
                    <li key={l.href}>
                      <a
                        href={l.href}
                        className="text-accent underline-offset-4 hover:underline"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
