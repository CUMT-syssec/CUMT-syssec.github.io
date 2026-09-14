"use client";

import { useState } from "react";
import type { Teacher } from "@/lib/types";
import { OptionWheel } from "./option-wheel";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

/** 主要教师：曲线轮盘选择姓名，右侧展示当前教师完整介绍。 */
export function Teachers({ teachers }: { teachers: Teacher[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedTeacher = teachers[selectedIndex] ?? teachers[0];

  if (!selectedTeacher) return null;

  return (
    <section id="teachers" aria-labelledby="teachers-title" className="scroll-mt-8">
      <SectionHeading
        id="teachers-title"
        title="主要教师"
        sub="认识与你一起做研究的人。"
      />
      <Reveal>
        <div className="grid overflow-hidden border-y border-ink/10 md:min-h-[430px] md:grid-cols-[0.9fr_1.1fr]">
          <div className="relative h-[330px] min-w-0 border-b border-ink/10 md:h-auto md:border-r md:border-b-0">
            <OptionWheel
              items={teachers.map((teacher) => teacher.name)}
              defaultSelected={0}
              onChange={setSelectedIndex}
              textColor="#7d899b"
              activeColor="#151b26"
              side="left"
              fontSize={2.65}
              spacing={1.25}
              curve={0.9}
              tilt={8}
              blur={0.75}
              fade={0.22}
              minOpacity={0.08}
              smoothing={190}
              inset={104}
              loop
              draggable
              className="teacher-option-wheel"
              ariaLabel="选择主要教师；可使用滚轮、拖动或方向键切换"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute top-1/2 right-6 h-px w-12 bg-accent/55 md:right-8"
            />
          </div>

          <div
            aria-live="polite"
            className="flex min-w-0 items-center px-5 py-9 sm:px-8 md:px-10 md:py-12"
          >
            <article
              key={selectedTeacher.id}
              className="teacher-detail-in w-full text-left"
            >
              <p className="font-mono text-xs tracking-[0.16em] text-aux uppercase">
                {String(selectedIndex + 1).padStart(2, "0")} /{" "}
                {String(teachers.length).padStart(2, "0")}
              </p>
              <h3 className="mt-4 text-3xl font-semibold md:text-4xl">
                {selectedTeacher.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-aux">
                {selectedTeacher.roles.join(" · ")}
              </p>
              <p className="mt-6 text-sm leading-[1.8] text-ink">
                研究方向：{selectedTeacher.directions.join("、")}
              </p>
              <p className="mt-3 text-[15px] leading-[1.85] text-body">
                {selectedTeacher.bio}
              </p>
              {selectedTeacher.links.length > 0 && (
                <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                  {selectedTeacher.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="text-accent underline-offset-4 hover:underline"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
