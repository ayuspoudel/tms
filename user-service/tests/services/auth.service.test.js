const { signup } = require("../../src/services/auth.service.js");
const { InMemoryUserRepository } = require("../../__mocks__/user.repository.js");
const { ValidationError, ConflictError } = require("../../src/utils/errors.js");

describe("AuthService.signup", () => {
  let repo;

  beforeEach(() => {
    repo = new InMemoryUserRepository();
  });

  it("should create a new user with safe output", async () => {
    const result = await signup({
      email: "test@example.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
    }, repo);

    expect(result.user.email).toBe("test@example.com");
    expect(result.user.passwordHash).toBeUndefined();
  });

  it("should throw ConflictError if email already exists", async () => {
    await signup({
      email: "dup@example.com",
      password: "password123",
      firstName: "Jane",
      lastName: "Doe",
    }, repo);

    await expect(
      signup({
        email: "dup@example.com",
        password: "password123",
        firstName: "Jane",
        lastName: "Doe",
      }, repo)
    ).rejects.toThrow(ConflictError);
  });

  it("should throw ValidationError if required fields are missing", async () => {
    await expect(
      signup({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
      }, repo)
    ).rejects.toThrow(ValidationError);
  });
});