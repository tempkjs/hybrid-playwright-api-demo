import { test, expect } from "@playwright/test";
import { UserClient } from "../clients/userClient";

test("API – create and verify user", async () => {
  const user = { name: "QA Demo", job: "Architect" };
  const res = await UserClient.createUser(user);
  expect(res.status).toBe(201);
  expect(res.data.name).toBe("QA Demo");
});
