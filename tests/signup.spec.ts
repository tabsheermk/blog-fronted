import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await page.getByRole("link", { name: "Sign Up" }).click();
  await page.getByRole("textbox", { name: "John", exact: true }).click();
  await page.getByRole("textbox", { name: "John", exact: true }).fill("johan");
  await page.getByRole("textbox", { name: "Doe" }).click();
  await page.getByRole("textbox", { name: "Doe" }).fill("doer");
  await page.getByTestId("signup-email").click();
  await page
    .getByTestId("signup-email")
    .fill(`john${new Date().getMilliseconds().toString()}@example.com`);
  await page.getByTestId("signup-pass").click();
  await page.getByTestId("signup-pass").fill("Hello123$");
  await page.getByTestId("signup-confirm").click();
  await page.getByTestId("signup-confirm").fill("Hello123$");
  await page.getByRole("button", { name: "Create Account" }).click();
  await page.getByRole("link", { name: "Read more →" }).click();
  await page.getByTestId("like-post").click();
  await page.getByRole("button", { name: "Logout" }).click();
});
