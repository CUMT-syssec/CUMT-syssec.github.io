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
import { FooterReveal } from "@/components/footer-reveal";
import "./home-motion.css";

/**
 * 唯一主页面：只负责组装。
 * 阅读顺序固定：首屏 → 主要教师 → 学生去向 → 科研成果 → 我们如何做研究 → 联系 → 页脚。
 * 两次明度切换：深色首屏 → 浅色档案（教师/学生/论文） → 深色收尾（文化/联系/页脚）。
 * 空间关系（桌面端、JS 增强后）：首屏 sticky 垫底、纸面从其上滑过；
 * 页脚从下方露出收尾。移动端 / 减少动效 / 无 JS 时回退为普通文档流。
 */
export default function Home() {
  return (
    <main id="top">
      <FooterReveal
        flow={
          <>
            <HomeStage site={site}>
              <Teachers teachers={teachers} />
              <Outcomes
                cohorts={outcomeCohorts}
                internshipOrgIds={internshipOrgIds}
                organizations={organizations}
              />
              <Publications publications={publications} />
            </HomeStage>

            <div className="hm-dark bg-night text-snow">
              <Culture culture={culture} />
              <Contact site={site} />
            </div>
          </>
        }
        footer={<Footer site={site} />}
      />
    </main>
  );
}
