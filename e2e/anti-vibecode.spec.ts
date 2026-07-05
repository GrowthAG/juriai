import { test, expect, type Page } from "@playwright/test";
import { loginAsDevelopmentUser } from "./auth-helper";

const PAGES = ["/", "/casos/novo"];

test.describe("Anti-Vibecode Compliance", () => {
  for (const url of PAGES) {
    test(`${url}, sem box-shadow`, async ({ page }) => {
      await openPage(page, url);
      const shadows = await page.evaluate(() => {
        const elements = document.querySelectorAll("*");
        const violations: string[] = [];
        elements.forEach((el) => {
          const style = getComputedStyle(el);
          if (style.boxShadow && style.boxShadow !== "none") {
            const tag = el.tagName.toLowerCase();
            const cls = el.className?.toString().slice(0, 40) || "";
            violations.push(`${tag}.${cls}: ${style.boxShadow}`);
          }
        });
        return violations;
      });
      expect(shadows, `box-shadow encontrado em ${url}`).toHaveLength(0);
    });

    test(`${url}, sem border-radius > 8px`, async ({ page }) => {
      await openPage(page, url);
      const violations = await page.evaluate(() => {
        const elements = document.querySelectorAll("*");
        const found: string[] = [];
        elements.forEach((el) => {
          const style = getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return;

          const cssRadii = [
            style.borderTopLeftRadius,
            style.borderTopRightRadius,
            style.borderBottomRightRadius,
            style.borderBottomLeftRadius,
          ];

          const parsedRadii = cssRadii.map((r) => parseFloat(r));
          if (parsedRadii.some((r) => !Number.isFinite(r))) return;

          const effectiveRadii = parsedRadii.map((r) =>
            Math.min(r, rect.width / 2, rect.height / 2)
          );

          const maxEffectiveRadius = Math.max(...effectiveRadii);

          if (maxEffectiveRadius <= 8.01) return;

          // Isenção para círculos pequenos permitidos
          const isSmall = rect.width <= 32 && rect.height <= 32;
          const isRoughlySquare = Math.abs(rect.width - rect.height) < 2;
          const minDimension = Math.min(rect.width, rect.height);
          const isFullCircle = effectiveRadii.every(
            (r) => r >= minDimension / 2 - 0.5
          );
          const isAllowedSmallCircle = isSmall && isRoughlySquare && isFullCircle;

          if (!isAllowedSmallCircle) {
            const tag = el.tagName.toLowerCase();
            const cls = el.className?.toString().slice(0, 40) || "";
            const msg = `${tag}.${cls} (${rect.width.toFixed(
              0
            )}x${rect.height.toFixed(0)}px) -> CSS: ${
              cssRadii[0]
            }, Efetivo: ${maxEffectiveRadius.toFixed(1)}px`;
            if (!found.includes(msg)) found.push(msg);
          }
        });
        return found;
      });
      expect(
        violations,
        `border-radius > 8px encontrado em ${url}`
      ).toHaveLength(0);
    });

    test(`${url}, sem gradientes`, async ({ page }) => {
      await openPage(page, url);
      const violations = await page.evaluate(() => {
        const elements = document.querySelectorAll("*");
        const found: string[] = [];
        elements.forEach((el) => {
          const style = getComputedStyle(el);
          const bg = style.backgroundImage;
          if (bg && bg !== "none" && bg.includes("gradient")) {
            const tag = el.tagName.toLowerCase();
            found.push(`${tag}: ${bg.slice(0, 60)}`);
          }
        });
        return found;
      });
      expect(violations, `gradiente encontrado em ${url}`).toHaveLength(0);
    });
  }
});

async function openPage(page: Page, url: string) {
  if (url.startsWith("/casos")) {
    await loginAsDevelopmentUser(page);
  }
  await page.goto(url);
}
