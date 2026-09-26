/**
 * Welcome-card layout regression against the production export.
 * Open the local static preview in Playwright CLI, then run:
 *   playwright-cli run-code --filename scripts/check-hero-layout.js
 * Uses the real announcement → welcome sequence; no test dependency added.
 */
async (page) => {
  const baseURL = await page.evaluate(() => location.origin);
  const browser = page.context().browser();
  const results = [];
  const cases = [
    { name: 'mobile-320', width: 320, height: 568, touch: true },
    { name: 'mobile-360', width: 360, height: 640, touch: true },
    { name: 'mobile-393', width: 393, height: 740, touch: true },
    { name: 'mobile-430', width: 430, height: 932, touch: true },
    { name: 'compact-767', width: 767, height: 900 },
    { name: 'landscape-short', width: 568, height: 320, touch: true },
    { name: 'landscape-touch', width: 844, height: 390, touch: true },
    { name: 'large-text', width: 320, height: 568, touch: true, largeText: true },
    { name: 'no-javascript', width: 393, height: 740, touch: true, noJS: true },
    { name: 'reduced-motion', width: 1440, height: 900, reduced: true },
    { name: 'desktop', width: 1440, height: 900 },
  ];

  for (const scenario of cases) {
    const context = await browser.newContext({
      viewport: { width: scenario.width, height: scenario.height },
      isMobile: !!scenario.touch,
      hasTouch: !!scenario.touch,
      javaScriptEnabled: !scenario.noJS,
      reducedMotion: scenario.reduced ? 'reduce' : 'no-preference',
    });
    context.setDefaultTimeout(8000);
    const tab = await context.newPage();
    const errors = [];
    let phase = 'layout';
    tab.on('pageerror', error => errors.push(error.message));
    const assert = (condition, message) => { if (!condition) throw new Error(message); };
    const waitForAnchor = id => tab.waitForFunction(id => {
      const target = document.getElementById(id);
      const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      return location.hash === `#${id}` && Math.abs(target.getBoundingClientRect().top - margin) < 2;
    }, id);
    try {
      await tab.route('https://cdn.openai.com/ctf-cdn/floral_a.mp4', route => route.fulfill({
        status: 200, contentType: 'video/webm',
        headers: { 'access-control-allow-origin': '*' },
        path: 'scripts/fixtures/ambient.webm',
      }));
      await tab.goto(baseURL, { waitUntil: 'load' });
      await tab.evaluate(() => document.fonts.ready);
      const staticLayout = !!(scenario.touch || scenario.width < 768 || scenario.reduced || scenario.noJS);
      if (!scenario.noJS) {
        await tab.waitForFunction(expected => !!document.querySelector('.scroll-stack-scroller--static') === expected, staticLayout);
      }
      if (scenario.largeText) {
        await tab.evaluate(() => { document.documentElement.style.fontSize = '24px'; });
      }
      await tab.locator('#home h1').evaluate(async el => {
        await Promise.all(el.getAnimations().map(animation => animation.finished));
      });

      const layout = await tab.locator('#home').evaluate(hero => {
        const rect = el => {
          const r = el.getBoundingClientRect();
          return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, height: r.height };
        };
        const card = hero.closest('.scroll-stack-card');
        const announcement = document.querySelector('#announcement').closest('.scroll-stack-card');
        return {
          hero: rect(hero), card: rect(card), announcement: rect(announcement),
          content: rect(hero.querySelector('[data-fluid-safe-area]')),
          heading: rect(hero.querySelector('h1')), link: rect(hero.querySelector('a')),
          hasPrecedingAnnouncement: !!card.previousElementSibling?.querySelector('#announcement'),
          viewportHeight: innerHeight,
          hasHorizontalOverflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      assert(layout.hasPrecedingAnnouncement, 'fixture must keep the welcome card after the announcement');
      assert(layout.card.height >= layout.viewportHeight * 0.92 - 2, 'welcome card collapsed below its screen height');
      assert(layout.announcement.height >= layout.viewportHeight * 0.92 - 2, 'announcement lost its screen height');
      assert(Math.abs(layout.hero.height - (layout.card.height - 2)) <= 2, 'welcome section does not fill its card');
      assert(layout.link.top - layout.content.bottom >= 24, 'scroll link overlaps or crowds the welcome content');
      assert(layout.heading.top - layout.hero.top >= 24, 'welcome title is clipped against the card top');
      assert(layout.hero.bottom - layout.link.bottom >= 24, 'scroll link is clipped against the card bottom');
      assert(!layout.hasHorizontalOverflow, 'page overflows the viewport horizontally');
      if (['mobile-393', 'landscape-short', 'reduced-motion'].includes(scenario.name)) {
        phase = 'announcement link';
        const enter = tab.locator('#announcement a[href="#home"]');
        if (scenario.touch) await enter.tap({ timeout: 5000 });
        else await enter.click({ timeout: 5000 });
        await waitForAnchor('home');
        phase = 'welcome link';
        const next = tab.locator('#home a[href="#directions"]');
        if (scenario.touch) await next.tap({ timeout: 5000 });
        else await next.click({ timeout: 5000 });
        await waitForAnchor('directions');
      }
      assert(errors.length === 0, 'uncaught browser errors: ' + errors.join('; '));
      results.push({ scenario: scenario.name, passed: true, height: layout.card.height, gap: layout.link.top - layout.content.bottom });
    } catch (error) {
      results.push({ scenario: scenario.name, passed: false, phase, message: error.message });
    } finally {
      await context.close();
    }
  }

  const report = { passed: results.every(result => result.passed), results };
  if (!report.passed) throw new Error(JSON.stringify(report, null, 2));
  return report;
}
