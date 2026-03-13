import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  console.log("BEFORE EACH RUNNING");
  await page.goto("http://localhost:5173/login");

  await page.getByRole("textbox", { name: "Enter your email" }).click();
  await page
    .getByRole("textbox", { name: "Enter your email" })
    .fill("tabsheeruddin.md@contenterra.com");
  await page.getByRole("textbox", { name: "Enter your password" }).click();
  await page
    .getByRole("textbox", { name: "Enter your password" })
    .fill("Hello123$");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
});

test("search and view posts", async ({ page }) => {
  // await page.goto("http://localhost:5173/dashboard");
  console.log("IAM HERE");
  // await page.getByRole("textbox", { name: "Enter your email" }).click();
  // await page
  //   .getByRole("textbox", { name: "Enter your email" })
  //   .fill("tabsheeruddin.md@contenterra.com");
  // await page.getByRole("textbox", { name: "Enter your password" }).click();
  // await page
  //   .getByRole("textbox", { name: "Enter your password" })
  //   .fill("Hello123$");
  // await page
  //   .getByRole("textbox", { name: "Enter your password" })
  //   .press("Enter");
  // await page.getByRole("button", { name: "Sign In" }).click();
  await page.getByRole("button", { name: "My Posts" }).click();
  await page.getByRole("button", { name: "All Posts" }).click();
  await page.getByRole("searchbox", { name: "Search posts..." }).click();
  await page.getByRole("searchbox", { name: "Search posts..." }).fill("hate");
  await page.getByRole("searchbox", { name: "Search posts..." }).press("Enter");
  await page.getByRole("searchbox", { name: "Search posts..." }).fill("");
  await page.getByRole("button", { name: "latest" }).click();
  await page.getByText("MK Tabsheer").click();
  await page.getByRole("link", { name: "Read more →" }).click();
  await page
    .getByRole("textbox", { name: "What are your thoughts on" })
    .click();
  await page
    .getByRole("textbox", { name: "What are your thoughts on" })
    .fill("hello hi bye " + new Date().getMilliseconds().toString());
  await page.locator("form").click();
  await page.getByTestId("submit-comment").click();
  await page.getByRole("button", { name: "Back" }).click();
});

// Can set dynamic data-testid attribute in the config file.
