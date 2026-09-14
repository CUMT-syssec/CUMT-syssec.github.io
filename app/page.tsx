import {
  culture,
  internshipOrgIds,
  organizations,
  outcomeCohorts,
  publications,
  site,
  teachers,
} from "@/lib/content";
import { HomeStage } from "@/components/home-stage";
import { Teachers } from "@/components/teachers";
import { Outcomes } from "@/components/outcomes";
import { Publications } from "@/components/publications";
import { Culture } from "@/components/culture";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";
import ScrollStack, { ScrollStackItem } from "@/components/scroll-stack";

/**
 * 唯一主页面：幻灯片式整页体验，白色风格。
 * 六张接近全屏的白色卡片：首屏（Aurora + ASCII 流体）→ 教师 → 去向 → 论文 → 文化 → 联系+页脚。
 * 滚动时新卡从下方滑入盖住旧卡、旧卡缩小退层，形成牌组式翻页（ScrollStack + Lenis 平滑滚动）。
 * 布局约定：正文容器统一 max-w-[880px]；内容块 my-auto 垂直居中（放不下自动顶对齐滚动）。
 */
export default function Home() {
  return (
    <main id="top">
      <ScrollStack>
        <ScrollStackItem itemClassName="site-slide site-slide--paper">
          <Hero site={site} />
        </ScrollStackItem>

        <ScrollStackItem itemClassName="site-slide site-slide--paper">
          <div className="site-slide-body">
            <div className="mx-auto my-auto w-full max-w-[880px] px-6 py-4 md:px-8">
              <Teachers teachers={teachers} />
            </div>
          </div>
        </ScrollStackItem>

        <ScrollStackItem itemClassName="site-slide site-slide--paper">
          <div className="site-slide-body">
            <div className="mx-auto my-auto w-full max-w-[880px] px-6 py-4 md:px-8">
              <Outcomes
                cohorts={outcomeCohorts}
                internshipOrgIds={internshipOrgIds}
                organizations={organizations}
              />
            </div>
          </div>
        </ScrollStackItem>

        <ScrollStackItem itemClassName="site-slide site-slide--paper">
          <div className="site-slide-body">
            <div className="mx-auto my-auto w-full max-w-[880px] px-6 py-4 md:px-8">
              <Publications publications={publications} />
            </div>
          </div>
        </ScrollStackItem>

        <ScrollStackItem itemClassName="site-slide site-slide--paper">
          <div className="site-slide-body">
            <div className="mx-auto my-auto w-full max-w-[880px] px-6 py-4 md:px-8">
              <Culture culture={culture} />
            </div>
          </div>
        </ScrollStackItem>

        <ScrollStackItem itemClassName="site-slide site-slide--paper">
          <div className="site-slide-body">
            <div className="mx-auto flex min-h-full w-full max-w-[880px] flex-col px-6 py-4 md:px-8">
              {/* 联系主体垂直居中；页脚 mt-auto 贴住卡片底边 */}
              <div className="my-auto">
                <Contact site={site} />
              </div>
              <Footer site={site} />
            </div>
          </div>
        </ScrollStackItem>
      </ScrollStack>
    </main>
  );
}
