import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await page.getByRole("link", { name: "Sign In" }).click();
  await page.getByRole("textbox", { name: "Enter your email" }).click();
  await page
    .getByRole("textbox", { name: "Enter your email" })
    .fill("tabsheeruddin.md@contenterra.com");
  await page.getByRole("textbox", { name: "Enter your password" }).click();
  await page
    .getByRole("textbox", { name: "Enter your password" })
    .fill("Hello123$");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.getByRole("link", { name: "Write" }).click();
  await page.getByRole("textbox", { name: "Title *" }).click();
  await page
    .getByRole("textbox", { name: "Title *" })
    .fill("I wanna I wanna" + new Date().getMilliseconds());
  await page.getByRole("textbox", { name: "Tags" }).click();
  await page.getByRole("textbox", { name: "Tags" }).fill("tera, mera, kiska");
  await page.locator("#content_md").click();
  await page
    .locator("#content_md")
    .fill(
      "I'mma write this post coz I am crazy and I am just testing this shit out." +
        new Date().getMilliseconds(),
    );
  await page.locator("#content_md").click();
  await page
    .locator("#content_md")
    .fill(
      "I'mma write this post coz I am crazy and I am just testing this shit out.\n## Even gonna use markdown as well",
    );
  await page.getByRole("button", { name: "Publish" }).click();
  await page.getByRole("button", { name: "Back" }).click();
  await page.getByRole("button", { name: "Logout" }).click();
});
