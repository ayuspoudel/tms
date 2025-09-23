// src/tests/userHandler.test.js
import { handler } from "../handlers/userHandler.js";

function makeEvent(method, path, body) {
  return {
    httpMethod: method,
    path,
    body: body ? JSON.stringify(body) : null,
    headers: { "Content-Type": "application/json" },
  };
}

describe("User Handler Integration", () => {
  it("should signup a user", async () => {
    const event = makeEvent("POST", "/signup", {
      firstName: "Alice",
      lastName: "Smith",
      dob: "1990-01-01",
      email: "alice@example.com",
      password: "supersecret",
    });

    const result = await handler(event);
    expect(result.statusCode).toBe(201);

    const body = JSON.parse(result.body);
    expect(body.email).toBe("alice@example.com");
  });

  it("should login successfully", async () => {
    await handler(
      makeEvent("POST", "/signup", {
        firstName: "Bob",
        lastName: "Jones",
        dob: "1992-05-05",
        email: "bob@example.com",
        password: "mypassword",
      })
    );

    const result = await handler(
      makeEvent("POST", "/login", { email: "bob@example.com", password: "mypassword" })
    );

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.email).toBe("bob@example.com");
  });

  it("should return 401 for wrong password", async () => {
    await handler(
      makeEvent("POST", "/signup", {
        firstName: "Eve",
        lastName: "Adams",
        dob: "1988-03-03",
        email: "eve@example.com",
        password: "rightpass",
      })
    );

    const result = await handler(
      makeEvent("POST", "/login", { email: "eve@example.com", password: "wrongpass" })
    );

    expect(result.statusCode).toBe(401);
  });

  it("should return 404 for unknown path", async () => {
    const result = await handler(makeEvent("POST", "/not-a-route"));
    expect(result.statusCode).toBe(404);
  });
});
