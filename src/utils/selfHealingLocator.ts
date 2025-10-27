// src/utils/selfHealingLocator.ts
import type { Page, Locator } from '@playwright/test';
import type { TestInfo } from '@playwright/test';

export type SelectorList = string[];

/**
 * Options for find/click/fill
 */
export interface FindOptions {
  /** optional human-readable name for the element (used in logs) */
  name?: string;
  /** if provided, attempt text-based fallback search when selectors fail */
  textFallback?: string;
  /** optional timeout for waiting for element in ms (default 2000) */
  timeoutMs?: number;
}

/**
 * Single entry describing a healed item for reporting.
 */
export interface HealedEntry {
  key?: string;              // logical name from caller
  usedSelector: string;      // which selector worked
  triedSelectors: string[];  // selectors attempted (ordered)
  reason?: string;           // optional note
  time: string;              // ISO timestamp
}

/**
 * SelfHealingLocator
 *
 * Usage: create one instance per test, pass page to constructor.
 * Use find/click/fill helpers instead of page.locator directly.
 */
export class SelfHealingLocator {
  private page: Page;
  private healingLog: HealedEntry[] = [];

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Return the healing log for the test run.
   */
  getLog(): HealedEntry[] {
    return this.healingLog;
  }

  /**
   * Attach the healing log to Playwright TestInfo so Allure or test output can pick it up.
   * Call from your test like:
   *   testInfo.attach('self-healing-log', { body: JSON.stringify(locator.getLog(), null, 2), contentType: 'application/json' });
   */
  attachToTestInfo(testInfo: TestInfo, name = 'self-healing-log') {
    try {
      const payload = JSON.stringify(this.getLog(), null, 2);
      testInfo.attach(name, { body: payload, contentType: 'application/json' });
    } catch (err) {
      // best-effort
      // eslint-disable-next-line no-console
      console.warn('Failed to attach healing log to test info', err);
    }
  }

  /**
   * Try a list of selectors and optional text fallback to locate the element.
   * Returns a Playwright Locator for the first selector that resolves (and is visible/count>0).
   * Throws if none found.
   */
  async find(selectorList: SelectorList, options?: FindOptions): Promise<Locator> {
    const tried: string[] = [];
    const timeout = options?.timeoutMs ?? 2000;
    let used: string | undefined;

    for (const sel of selectorList) {
      tried.push(sel);
      try {
        const loc = this.page.locator(sel);
        // quick existence check
        const count = await loc.count();
        if (count > 0) {
          // optionally wait for visible within short timeout
          try {
            await loc.first().waitFor({ state: 'visible', timeout });
          } catch {
            // not visible quickly but exists — still accept it
          }
          used = sel;
          this.logHeal(options?.name, used, tried, 'found via selector');
          return loc.first();
        }
      } catch (err) {
        // ignore and try next selector
      }
    }

    // If no selector worked, try text-based fallback (if caller provided textFallback)
    if (options?.textFallback) {
      const textSel = `text="${options.textFallback}"`;
      tried.push(textSel);
      try {
        const loc = this.page.locator(textSel);
        const count = await loc.count();
        if (count > 0) {
          used = textSel;
          this.logHeal(options?.name, used, tried, 'found via text fallback');
          return loc.first();
        }
      } catch {}
    }

    // Last-resort: scan top-level buttons/inputs with same role/text heuristics (very permissive)
    // This is a simple heuristic - tweak to your app.
    const shortName = options?.name;
    if (shortName) {
      // Try exact text match across common clickable selectors
      const heuristics = [
        `button:has-text("${shortName}")`,
        `a:has-text("${shortName}")`,
        `//*[normalize-space(text())="${shortName}"]`
      ];
      for (const sel of heuristics) {
        tried.push(sel);
        try {
          const loc = this.page.locator(sel);
          if ((await loc.count()) > 0) {
            used = sel;
            this.logHeal(options?.name, used, tried, 'found via heuristics');
            return loc.first();
          }
        } catch {}
      }
    }

    // Nothing found -> log and throw
    this.logHeal(options?.name, '', tried, 'not found');
    throw new Error(`SelfHealingLocator: element not found. Tried selectors: ${tried.join(' | ')}`);
  }

  /**
   * Click using selector list with self-healing semantics
   */
  async click(selectorList: SelectorList, options?: FindOptions) {
    const loc = await this.find(selectorList, options);
    await loc.click();
  }

  /**
   * Fill using selector list
   */
  async fill(selectorList: SelectorList, value: string, options?: FindOptions) {
    const loc = await this.find(selectorList, options);
    await loc.fill(value);
  }

  /**
   * Type (press) using selector list
   */
  async press(selectorList: SelectorList, key: string, options?: FindOptions) {
    const loc = await this.find(selectorList, options);
    await loc.press(key);
  }

  /**
   * Helper to push an entry to healing log.
   */
  private logHeal(key: string | undefined, usedSelector: string, triedSelectors: string[], reason?: string) {
    const entry: HealedEntry = {
      key,
      usedSelector,
      triedSelectors: [...triedSelectors],
      reason,
      time: new Date().toISOString()
    };
    this.healingLog.push(entry);
    // also console log for quick observation
    // eslint-disable-next-line no-console
    console.info('[SelfHealing] ', key ?? '<unnamed>', usedSelector ? `used=${usedSelector}` : 'NOT_FOUND', reason ?? '');
  }
}
