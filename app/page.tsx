import {
  culture,
  internshipOrgIds,
  organizations,
  outcomeCohorts,
  publications,
  site,
  teachers,
} from "@/lib/content";
import { Hero } from "@/components/hero";
import { Teachers } from "@/components/teachers";
import { Outcomes } from "@/components/outcomes";
import { Publications } from "@/components/publications";
import { Culture } from "@/components/culture";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";

/**
 * 唯一主页面：只负责组装。
 * 阅读顺序固定：首屏 → 主要教师 → 学生去向 → 科研成果 → 我们如何做研究 → 联系 → 页脚。
 * 两次明度切换：深色首屏 → 浅色档案（教师/学生/论文） → 深色收尾（文化/联系/页脚）。
 */
export default function Home() {
  return (
    <main id="top">
      <Hero site={site} />

      <div className="bg-paper text-ink">
        <div className="mx-auto max-w-[880px] space-y-[72px] px-6 py-[64px] md:space-y-[112px] md:py-[104px]">
          <Teachers teachers={teachers} />
          <Outcomes
            cohorts={outcomeCohorts}
            internshipOrgIds={internshipOrgIds}
            organizations={organizations}
            lastVerified={site.lastVerified}
          />
          <Publications publications={publications} />
        </div>
      </div>

      <div className="bg-night text-snow">
        <Culture culture={culture} />
        <Contact site={site} />
        <Footer site={site} />
      </div>
    </main>
  );
}
