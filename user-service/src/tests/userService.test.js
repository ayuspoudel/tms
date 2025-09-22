// ESM module mocking with jest.unstable_mockModule
await jest.unstable_mockModule("../models/User.js", () => ({
  User: class {
    static findByEmail = jest.fn();
    constructor(props) {
      Object.assign(this, props);
      this.save = jest.fn();
      this.safe = jest.fn();
      this.verifyPassword = jest.fn();
    }
  }
}));
await jest.unstable_mockModule("bcryptjs", () => ({
  default: { hash: jest.fn() }
}));

import { signup, login } from "../services/userService.js";
import { User } from "../models/User.js";
import bcrypt from "bcryptjs";

describe("User Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset static methods after clearAllMocks
    User.findByEmail = jest.fn();
  });

  it("should create a user (positive case)", async () => {
    User.findByEmail.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashed-pass");

    const saveMock = jest.fn().mockResolvedValue();
    const safeMock = jest.fn().mockReturnValue({ email: "new@test.com" });

    User.prototype.save = saveMock;
    User.prototype.safe = safeMock;

    const result = await signup({
      firstName: "Alice",
      lastName: "Smith",
      dob: "1990-01-01",
      email: "new@test.com",
      password: "Pass123!",
    });

    expect(bcrypt.hash).toHaveBeenCalledWith("Pass123!", 10);
    expect(saveMock).toHaveBeenCalled();
    expect(result.email).toBe("new@test.com");
  });

  it("should throw if email already exists (negative)", async () => {
    User.findByEmail.mockResolvedValue({ id: "1", email: "exists@test.com" });

    await expect(
      signup({
        firstName: "Bob",
        lastName: "Doe",
        dob: "1991-01-01",
        email: "exists@test.com",
        password: "Pass123!",
      })
    ).rejects.toThrow("Email already exists");
  });

  it("should throw if required fields are missing (negative)", async () => {
    await expect(
      signup({
        email: "no-pass@test.com",
        password: "", // missing password
      })
    ).rejects.toThrow("Missing Required Fields");
  });

  it("should login successfully (positive case)", async () => {
    const userMock = {
      email: "user@test.com",
      verifyPassword: jest.fn().mockResolvedValue(true),
      safe: jest.fn().mockReturnValue({ email: "user@test.com" }),
    };

    User.findByEmail.mockResolvedValue(userMock);

    const result = await login({
      email: "user@test.com",
      password: "Pass123!",
    });

    expect(userMock.verifyPassword).toHaveBeenCalledWith("Pass123!");
    expect(result.email).toBe("user@test.com");
  });

  it("should throw if user not found (negative)", async () => {
    User.findByEmail.mockResolvedValue(null);

    await expect(
      login({ email: "unknown@test.com", password: "Pass123!" })
    ).rejects.toThrow("User not found");
  });

  it("should throw if password is wrong (negative)", async () => {
    const userMock = {
      email: "user@test.com",
      verifyPassword: jest.fn().mockResolvedValue(false),
      safe: jest.fn(),
    };

    User.findByEmail.mockResolvedValue(userMock);

    await expect(
      login({ email: "user@test.com", password: "wrong" })
    ).rejects.toThrow("Invalid credentials");
  });

  it("should throw if email or password missing (negative)", async () => {
    await expect(login({ email: "", password: "" })).rejects.toThrow(
      "Email and password are required"
    );
  });
});