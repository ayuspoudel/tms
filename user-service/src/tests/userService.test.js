// src/tests/userService.test.js
import { signup, login } from "../services/userService.js";
import { UserRepository } from "../repositories/index.js";
import { User } from "../models/User.js";

// reset in-memory repo before each test
beforeEach(() => {
  UserRepository.constructor.clearAll?.();
});

describe("User Service - Signup", () => {
  it("should create a new user with hashed password", async () => {
    const user = await signup({
      firstName: "Alice",
      lastName: "Smith",
      dob: "1990-01-01",
      email: "alice@example.com",
      password: "supersecret",
    });

    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("email", "alice@example.com");
    expect(user).not.toHaveProperty("passwordHash");
  });

  it("should not allow duplicate emails", async () => {
    await signup({
      firstName: "Alice",
      lastName: "Smith",
      dob: "1990-01-01",
      email: "alice@example.com",
      password: "supersecret",
    });

    await expect(
      signup({
        firstName: "Alice",
        lastName: "Smith",
        dob: "1990-01-01",
        email: "alice@example.com",
        password: "supersecret",
      })
    ).rejects.toThrow("Email already exists");
  });
});

describe("User Service - Login", () => {
  it("should login with correct credentials", async () => {
    await signup({
      firstName: "Bob",
      lastName: "Jones",
      dob: "1992-05-05",
      email: "bob@example.com",
      password: "mypassword",
    });

    const user = await login({ email: "bob@example.com", password: "mypassword" });
    expect(user).toHaveProperty("email", "bob@example.com");
  });

  it("should fail with wrong password", async () => {
    await signup({
      firstName: "Bob",
      lastName: "Jones",
      dob: "1992-05-05",
      email: "bob@example.com",
      password: "mypassword",
    });

    await expect(
      login({ email: "bob@example.com", password: "wrongpass" })
    ).rejects.toThrow("Invalid credentials");
  });

  it("should fail if user not found", async () => {
    await expect(
      login({ email: "ghost@example.com", password: "nope" })
    ).rejects.toThrow("User not found");
  });
});
