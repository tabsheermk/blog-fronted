import { test as setup, expect } from "@playwright/test";

setup("authenticate", async ({ request }) => {
  const response = await request.post("http://localhost:3003/api/auth/login", {
    data: {
      email: "tabsheeruddin.md@contenterra.com",
      password: "Hello123$",
    },
  });

  expect(response.ok()).toBeTruthy();

  const storage = await request.storageState();
  await setup.info().attach("storageState", {
    body: JSON.stringify(storage),
  });
});
