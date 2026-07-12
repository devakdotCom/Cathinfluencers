import { expect, test, type Page } from '@playwright/test';

/**
 * The public tab bar is paginated: later tabs (Catholic Connect, Resources)
 * live on a second page behind the "Show more navigation tabs" control.
 * This helper reveals a tab if needed before returning its locator.
 */
async function openPublicTab(page: Page, name: RegExp) {
  const tabBar = page.locator('#public-tabs-nav-bar');
  await tabBar.waitFor({ timeout: 30_000 });
  const tab = tabBar.getByRole('tab', { name });
  if (!(await tab.isVisible().catch(() => false))) {
    const more = page.getByRole('button', { name: /show more navigation tabs/i });
    if (await more.isVisible().catch(() => false)) await more.click();
  }
  await tab.scrollIntoViewIfNeeded();
  return tab;
}

test('mobile layout has no page overflow and exposes Resources navigation', async ({ page }) => {
  await page.goto('/app');
  await expect(page.locator('body')).toBeVisible();
  const overflow = await page.evaluate(() => ({
    body: document.body.scrollWidth - document.body.clientWidth,
    root: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  expect(overflow.body).toBeLessThanOrEqual(1);
  expect(overflow.root).toBeLessThanOrEqual(1);

  const resources = await openPublicTab(page, /resources/i);
  await expect(resources).toBeVisible();
  const box = await resources.boundingBox();
  expect(box?.height || 0).toBeGreaterThanOrEqual(44);

  const viewport = page.viewportSize();
  if ((viewport?.width || 0) < 768) {
    const mobileNavigation = page.getByRole('navigation', {
      name: /primary mobile navigation/i,
    });
    await expect(mobileNavigation).toBeVisible();
    const mobileResources = mobileNavigation.getByRole('button', {
      name: /resources/i,
    });
    const mobileBox = await mobileResources.boundingBox();
    expect(mobileBox?.height || 0).toBeGreaterThanOrEqual(44);
    await mobileResources.click();
    await expect(page.locator('#pub-tab-resources')).toBeVisible();
  }
});

test('admin sign-in form remains inside a 320px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/admin');
  await expect(page.getByLabel(/registered email address/i)).toBeVisible();
  const authNavigation = page.getByRole('navigation', {
    name: /authentication navigation/i,
  });
  await expect(authNavigation).toBeVisible();
  const backButton = authNavigation.getByRole('button', {
    name: /back to vox ecclesiae/i,
  });
  await expect(backButton).toContainText('Back');
  const backButtonBox = await backButton.boundingBox();
  expect(backButtonBox?.height || 0).toBeGreaterThanOrEqual(44);
  await expect(authNavigation.getByText('Sign In')).toBeVisible();
  expect(await authNavigation.evaluate(element => getComputedStyle(element).position)).toBe('fixed');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('authentication routes expose consistent breadcrumbs and portal escape paths', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });

  await page.goto('/register');
  const registerNavigation = page.getByRole('navigation', {
    name: /authentication navigation/i,
  });
  await expect(registerNavigation.getByText('Back to Vox Ecclesiae')).toBeVisible();
  await expect(registerNavigation.getByText('Register')).toBeVisible();

  await page.goto('/reset-password');
  const resetNavigation = page.getByRole('navigation', {
    name: /authentication navigation/i,
  });
  await expect(resetNavigation.getByText('Reset Password')).toBeVisible();
  await expect(page.getByRole('heading', { name: /reset your password/i })).toBeVisible();
  await expect(page.getByLabel(/registered email address/i)).toBeVisible();
  await expect(page.getByLabel(/^password/i)).toHaveCount(0);

  await resetNavigation.getByRole('button', { name: /back to vox ecclesiae/i }).click();
  await expect(page).toHaveURL('/');
});

test('global search is keyboard accessible and contained on mobile', async ({ page }) => {
  await page.goto('/app');
  await page.keyboard.press('Control+k');
  const dialog = page.getByRole('dialog', { name: /suggested/i });
  await expect(dialog).toBeVisible();
  const input = page.getByRole('textbox', {
    name: /search members, events, announcements, and resources/i,
  });
  await input.fill('catechism forms');
  await expect(page.getByRole('option', { name: /catholic resource library/i })).toBeVisible();

  const overflow = await page.evaluate(() => ({
    page: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    dialog: document.querySelector('[role="dialog"]')!.scrollWidth -
      document.querySelector('[role="dialog"]')!.clientWidth,
  }));
  expect(overflow.page).toBeLessThanOrEqual(1);
  expect(overflow.dialog).toBeLessThanOrEqual(1);
});

test('AI assistant opens as a contained touch-friendly dialog', async ({ page }) => {
  await page.goto('/app');
  await page.getByRole('button', { name: /open vox ai assistant/i }).click();
  const dialog = page.getByRole('dialog', { name: /vox guide/i });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole('button', { name: /find a collaborator/i }),
  ).toBeVisible();
  const target = dialog.getByRole('button', { name: /draft an announcement/i });
  const targetBox = await target.boundingBox();
  expect(targetBox?.height || 0).toBeGreaterThanOrEqual(44);

  const overflow = await page.evaluate(() => ({
    page: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    dialog: document.querySelector('[role="dialog"]')!.scrollWidth -
      document.querySelector('[role="dialog"]')!.clientWidth,
  }));
  expect(overflow.page).toBeLessThanOrEqual(1);
  expect(overflow.dialog).toBeLessThanOrEqual(1);
});

test('upgraded public directory exposes filters, cards, and parish map view', async ({ page }) => {
  await page.goto('/app');
  const viewport = page.viewportSize();
  if ((viewport?.width || 0) < 768) {
    await page
      .getByRole('navigation', { name: /primary mobile navigation/i })
      .getByRole('button', { name: /directory/i })
      .click();
  } else {
    const leadersTab = await openPublicTab(page, /our leaders/i);
    await leadersTab.click();
  }

  await expect(
    page.getByRole('heading', { name: /find catholic collaborators/i }),
  ).toBeVisible();
  await expect(page.getByPlaceholder(/name, ministry, profession, parish/i)).toBeVisible();
  await page.getByRole('button', { name: /parish map/i }).click();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test('language switcher changes the document language and mobile labels', async ({ page }) => {
  await page.goto('/app');
  await page.getByRole('button', { name: 'தமிழ்' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ta');
  const viewport = page.viewportSize();
  if ((viewport?.width || 0) < 768) {
    await expect(
      page
        .getByRole('navigation', { name: /primary mobile navigation/i })
        .getByText('முகப்பு'),
    ).toBeVisible();
  }
});

test('invalid opaque credential verification is clear and mobile-safe', async ({ page }) => {
  await page.goto(`/verify?id=${'a'.repeat(64)}`);
  const authNavigation = page.getByRole('navigation', {
    name: /authentication navigation/i,
  });
  await expect(authNavigation.getByText('Credential Lookup')).toBeVisible();
  await expect(
    authNavigation.getByRole('button', { name: /back to vox ecclesiae/i }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /credential not valid/i }),
  ).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test('Madha TV uses an allowed YouTube embed with accessible fallbacks', async ({ page }) => {
  await page.goto('/app');
  const connectTab = await openPublicTab(page, /catholic connect/i);
  await connectTab.click();
  await page.getByRole('button', { name: /madha tv/i }).click();

  const player = page.locator('#madhatv-player');
  await expect(player).toHaveAttribute(
    'src',
    /https:\/\/www\.youtube\.com\/embed\/(?:live_stream\?channel=|[A-Za-z0-9_-]{11})/,
  );
  await expect(player).toHaveAttribute(
    'allow',
    'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
  );
  await expect(player).not.toHaveAttribute('sandbox', /.+/);
  await expect(page.getByRole('link', { name: /watch on youtube/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /visit madha tv portal/i })).toBeVisible();
});
