/**
 * Browser regression suite for the production export; no project dependency added.
 * Run from the repository root. Start a static server for `out`,
 * open it in Playwright CLI, then run:
 *   playwright-cli run-code --filename scripts/check-browser-stability.js
 * Each case uses a fresh context. External video/navigation are local fixtures.
 * fixtures/ambient.webm is a generated 64x64 white VP8 clip (2 seconds).
 * Throws with the complete report if a check fails.
 */
async (page) => {
  const baseURL = await page.evaluate(() => location.origin);
  if (!/^https?:/.test(baseURL)) throw new Error('Open the production preview before running this suite.');
  const browser = page.context().browser();
  const results = [];
  const cases = [
    ['mobile', true], ['landscape-touch', true], ['no-javascript', true],
    ['no-webgl', true], ['webgl1-only', true], ['shader-link-failure', true],
    ['no-media-events', true], ['legacy-media-desktop', false], ['no-resize-observer', true],
    ['reduced-motion', true],
    ['no-observers', false], ['no-2d-context', false],
    ['throwing-2d-context', false], ['media-rejected', false],
    ['media-failed', false], ['tainted-canvas', false],
    ['low-memory', false], ['save-data', false],
    ['context-loss', true], ['large-canvas', false],
    ['desktop-lifecycle', false], ['desktop-anchors', false],
    ['throwing-media-query', false], ['throwing-observers', false],
    ['live-reduced-motion', false],
  ];

  for (const [scenario, mobile] of cases) {
    const viewport = scenario === 'landscape-touch' ? { width: 915, height: 412 }
      : scenario === 'large-canvas' ? { width: 3840, height: 2160 }
      : mobile ? { width: 393, height: 851 } : { width: 1440, height: 900 };
    const context = await browser.newContext({
      viewport, isMobile: mobile, hasTouch: mobile,
      deviceScaleFactor: scenario === 'large-canvas' ? 4 : mobile ? 2.75 : 1,
      javaScriptEnabled: scenario !== 'no-javascript',
      reducedMotion: ['reduced-motion', 'throwing-observers'].includes(scenario) ? 'reduce' : 'no-preference',
    });
    context.setDefaultTimeout(8000);
    const tab = await context.newPage();
    const errors = [];
    let videoRequests = 0;
    tab.on('pageerror', error => { if (errors.length < 5) errors.push(error.message); });
    const assert = (condition, message) => { if (!condition) throw new Error(message); };
    try {
      await tab.addInitScript(scenario => {
        window.__stability = { glDraws: 0, taintReads: 0, videoReads: 0, raf: 0, canvases: [] };
        const stats = window.__stability;
        Object.defineProperty(navigator, 'hardwareConcurrency', { configurable: true, get: () => 8 });
        Object.defineProperty(navigator, 'deviceMemory', { configurable: true, get: () => scenario === 'low-memory' ? 2 : 8 });
        Object.defineProperty(navigator, 'connection', { configurable: true, get: () => ({ saveData: scenario === 'save-data' }) });
        const raf = window.requestAnimationFrame;
        window.requestAnimationFrame = callback => raf.call(window, time => { stats.raf++; callback(time); });
        const getContext = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function(type, ...args) {
          if (scenario === 'no-webgl' && /webgl/.test(type)) return null;
          if (scenario === 'webgl1-only' && type === 'webgl2') return null;
          if (scenario === 'no-2d-context' && type === '2d') return null;
          if (scenario === 'throwing-2d-context' && type === '2d') throw new Error('Injected 2D context failure');
          if (!stats.canvases.includes(this)) stats.canvases.push(this);
          this.__stabilityContext = type;
          return getContext.call(this, type, ...args);
        };
        for (const ctor of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
          if (!ctor) continue;
          const draw = ctor.prototype.drawArrays;
          ctor.prototype.drawArrays = function(...args) { stats.glDraws++; return draw.apply(this, args); };
          if (scenario === 'shader-link-failure') {
            const getParameter = ctor.prototype.getProgramParameter;
            ctor.prototype.getProgramParameter = function(program, parameter) {
              return parameter === this.LINK_STATUS ? false : getParameter.call(this, program, parameter);
            };
          }
        }
        if (scenario === 'no-media-events' || scenario === 'legacy-media-desktop') {
          const matchMedia = window.matchMedia;
          window.matchMedia = query => {
            const result = matchMedia.call(window, query);
            result.addEventListener = undefined;
            result.removeEventListener = undefined;
            return result;
          };
        }
        if (scenario === 'throwing-media-query') window.matchMedia = () => { throw new Error('Injected matchMedia failure'); };
        if (scenario === 'no-resize-observer' || scenario === 'no-observers') delete window.ResizeObserver;
        if (scenario === 'no-observers') delete window.IntersectionObserver;
        if (scenario === 'media-rejected') HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException('Injected autoplay rejection', 'NotAllowedError'));
        const drawImage = CanvasRenderingContext2D.prototype.drawImage;
        CanvasRenderingContext2D.prototype.drawImage = function(...args) {
          if (args[0] instanceof HTMLVideoElement) stats.videoReads++;
          return drawImage.apply(this, args);
        };
        if (scenario === 'tainted-canvas') {
          CanvasRenderingContext2D.prototype.getImageData = function() {
            stats.taintReads++;
            throw new DOMException('Injected tainted canvas', 'SecurityError');
          };
        }
      }, scenario);

      await tab.route('https://cdn.openai.com/ctf-cdn/floral_a.mp4', route => {
        videoRequests++;
        if (scenario === 'media-failed') return route.abort('failed');
        return route.fulfill({
          status: 200, contentType: 'video/webm',
          headers: { 'access-control-allow-origin': '*' },
          path: 'scripts/fixtures/ambient.webm',
        });
      });
      await tab.goto(baseURL, { waitUntil: 'load' });
      await tab.waitForTimeout(650);
      // Fail observer construction when decorations are activated. The framework
      // has already booted: its own module-level prefetch observer is a separate
      // dependency boundary, not part of the application's effect cleanup.
      if (scenario === 'throwing-observers') {
        await tab.evaluate(() => {
          window.IntersectionObserver = class { constructor() { throw new Error('Injected observer failure'); } };
        });
        await tab.emulateMedia({ reducedMotion: 'no-preference' });
        await tab.waitForTimeout(400);
        const visible = await tab.locator('section h2').evaluateAll(headings => headings.every(heading => getComputedStyle(heading.parentElement).opacity !== '0'));
        assert(visible, 'observer failure hid section headings');
      }
      assert(await tab.locator('main').count() === 1, 'main content disappeared');
      assert(await tab.locator('footer a[href="#top"]').count() === 1, 'footer navigation disappeared');

      if (mobile || ['no-observers'].includes(scenario)) {
        assert(await tab.locator('.scroll-stack-scroller--static').count() === 1, 'expected static document flow');
        assert(await tab.locator('.term-body .t-caret--blink').count() === 6, 'content was hidden for a typing animation');
      }
      if (['mobile', 'landscape-touch', 'no-javascript', 'low-memory', 'save-data', 'reduced-motion'].includes(scenario)) {
        assert(videoRequests === 0, 'disabled decoration requested a video');
      }
      if (['no-webgl', 'webgl1-only', 'shader-link-failure', 'no-observers'].includes(scenario)) {
        const fallback = await tab.locator('.aurora-container').evaluate(el => getComputedStyle(el).backgroundImage);
        assert(fallback !== 'none', 'no static background after graphics failure');
      }
      if (['media-rejected', 'media-failed', 'tainted-canvas'].includes(scenario)) {
        await tab.waitForTimeout(400);
        const media = await tab.evaluate(() => ({ src: document.querySelector('video')?.getAttribute('src'), paused: document.querySelector('video')?.paused, reads: window.__stability.videoReads, taint: window.__stability.taintReads }));
        assert(media.paused && !media.src, 'failed video still owns an active source');
        await tab.waitForTimeout(400);
        const later = await tab.evaluate(() => ({ reads: window.__stability.videoReads, taint: window.__stability.taintReads }));
        assert(later.reads === media.reads && later.taint === media.taint, 'failed sampling is still retried');
        if (scenario === 'tainted-canvas') assert(media.taint === 1, 'tainted-canvas failure was not exercised exactly once');
      }
      if (scenario === 'reduced-motion') {
        assert(await tab.locator('.aurora-container canvas').count() === 0, 'reduced motion allocated a GPU canvas');
        assert(await tab.evaluate(() => window.__stability.glDraws) === 0, 'reduced motion still draws WebGL');
      }
      if (scenario === 'context-loss') {
        assert(await tab.locator('.aurora-container canvas').count() === 1, 'no real WebGL context to lose');
        await tab.evaluate(() => document.querySelector('.aurora-container canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
        await tab.waitForTimeout(250);
        const draws = await tab.evaluate(() => window.__stability.glDraws);
        await tab.waitForTimeout(500);
        assert(await tab.evaluate(() => window.__stability.glDraws) === draws, 'lost context still receives draw calls');
        assert(await tab.locator('.aurora-container canvas').count() === 0, 'lost GPU canvas was not released');
        assert(await tab.locator('.aurora-container').evaluate(el => getComputedStyle(el).backgroundImage !== 'none'), 'context loss has no fallback');
      }
      if (scenario === 'large-canvas') {
        await tab.waitForFunction(() => document.querySelector('[data-ascii-fluid]').dataset.asciiOverlayState === 'running');
        const budgets = await tab.evaluate(() => window.__stability.canvases.map(canvas => ({ width: canvas.width, height: canvas.height, kind: canvas.__stabilityContext, main: canvas.hasAttribute('data-ascii-fluid') })));
        assert(budgets.every(c => c.width <= 2048 && c.height <= 2048 && c.width * c.height <= 1500000), 'canvas allocation exceeds the pixel budget: ' + JSON.stringify(budgets));
        assert(budgets.filter(c => c.kind === '2d' && !c.main).every(c => c.width * c.height <= 12000), 'sampling grid exceeds its cell budget');
        assert(await tab.locator('.aurora-container canvas').evaluate(c => c.getBoundingClientRect().width > 3500), 'resolution cap shrank the visible background');
      }
      if (scenario === 'desktop-lifecycle') {
        await tab.waitForTimeout(4000); // one-shot title animation must finish first
        await tab.waitForFunction(() => document.querySelector('[data-ascii-fluid]').dataset.asciiOverlayState === 'running');
        const beforeHide = await tab.evaluate(() => ({gl: window.__stability.glDraws, video: window.__stability.videoReads}));
        await tab.evaluate(() => {
          Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
          document.dispatchEvent(new Event('visibilitychange'));
        });
        await tab.waitForTimeout(500);
        const stopped = await tab.evaluate(() => window.__stability.raf);
        await tab.waitForTimeout(350);
        assert(await tab.evaluate(() => window.__stability.raf) === stopped, 'background RAF loop is still running');
        await tab.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
        await tab.waitForTimeout(350);
        assert(await tab.evaluate(() => window.__stability.raf) > stopped, 'foreground animation did not resume');
        const resumed = await tab.evaluate(() => ({gl: window.__stability.glDraws, video: window.__stability.videoReads, aurora: document.querySelector('.aurora-container').dataset.auroraState, ascii: document.querySelector('[data-ascii-fluid]').dataset.asciiOverlayState}));
        assert(resumed.gl > beforeHide.gl && resumed.aurora === 'running', 'Aurora did not resume');
        assert(resumed.video > beforeHide.video && resumed.ascii === 'running', 'ASCII/video did not resume');
        await tab.evaluate(() => {
          Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
          document.dispatchEvent(new Event('visibilitychange'));
          window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }));
        });
        await tab.waitForTimeout(300);
        const hidden = await tab.evaluate(() => window.__stability.raf);
        await tab.waitForTimeout(300);
        assert(await tab.evaluate(() => window.__stability.raf) === hidden, 'pagehide lifecycle kept a live animation loop');
        await tab.evaluate(() => {
          delete document.hidden;
          window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
          document.dispatchEvent(new Event('visibilitychange'));
        });
        await tab.waitForTimeout(300);
        assert(await tab.evaluate(() => window.__stability.raf) > hidden, 'page restoration did not resume');
      }
      if (scenario === 'live-reduced-motion') {
        await tab.waitForFunction(() => document.querySelector('[data-ascii-fluid]').dataset.asciiOverlayState === 'running');
        await tab.emulateMedia({ reducedMotion: 'reduce' });
        await tab.waitForFunction(() => !document.querySelector('.aurora-container canvas') && !document.querySelector('video').getAttribute('src'));
        assert(await tab.locator('.scroll-stack-scroller--static').count() === 1, 'live reduced motion did not release the stack');
        assert(await tab.locator('.term-body .t-caret--blink').count() === 6, 'live reduced motion hid content');
        const headingsVisible = await tab.locator('section h2').evaluateAll(headings => headings.every(heading => getComputedStyle(heading.parentElement).opacity !== '0'));
        assert(headingsVisible, 'revealed headings stayed invisible after disabling motion');
        await tab.emulateMedia({ reducedMotion: 'no-preference' });
        await tab.waitForFunction(() => document.querySelector('[data-ascii-fluid]').dataset.asciiOverlayState === 'running' && document.querySelector('.aurora-container').dataset.auroraState === 'running');
      }
      if (scenario === 'desktop-anchors') {
        await tab.evaluate(() => {
          const target = document.createElement('div');
          target.id = 'target:[test]';
          document.body.append(target);
          const anchor = document.createElement('a');
          anchor.href = '#target%3A%5Btest%5D';
          anchor.textContent = 'encoded anchor test';
          document.body.prepend(anchor);
        });
        await tab.getByRole('link', { name: 'encoded anchor test' }).click();
        await tab.waitForTimeout(100);
        assert(await tab.evaluate(() => location.hash) === '#target%3A%5Btest%5D', 'encoded anchor did not navigate');
      }
      if (scenario === 'mobile') {
        await tab.evaluate(() => document.fonts.ready);
        await tab.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
        await tab.waitForTimeout(400);
        const footerY = await tab.locator('footer').evaluate(el => el.getBoundingClientRect().top);
        const rafCount = await tab.evaluate(() => window.__stability.raf);
        await tab.waitForTimeout(500);
        assert(await tab.locator('footer').evaluate(el => el.getBoundingClientRect().top) === footerY, 'footer moved while trying to tap');
        assert(await tab.evaluate(() => window.__stability.raf) === rafCount, 'offscreen mobile animations are still running');
        await tab.locator('footer a[href="#top"]').tap();
        await tab.waitForFunction(() => scrollY < 3, null, { timeout: 5000 });
      }
      assert(errors.length === 0, 'uncaught errors: ' + errors.join('; '));
      results.push({ scenario, passed: true, videoRequests });
    } catch (error) {
      results.push({ scenario, passed: false, message: error.message, errors });
    } finally {
      await context.close();
    }
  }
  const report = { passed: results.every(result => result.passed), results };
  if (!report.passed) throw new Error(JSON.stringify(report, null, 2));
  return report;
}
