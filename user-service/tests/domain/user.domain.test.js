import { User } from "../../src/domain/user.js";

describe("User Domain Model", () => {
  it("should create a user with defaults", () => {
    const user = new User({
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
      passwordHash: "hashed_pw",
    });

    expect(user.email).toBe("test@example.com");
    expect(user.firstName).toBe("John");
    expect(user.lastName).toBe("Doe");
    expect(user.displayName).toBe("John Doe");
    expect(user.role).toBe("USER");
    expect(user.status).toBe("PENDING_VERIFICATION");
    expect(user.emailVerified).toBe(false);
  });

  it("should exclude passwordHash in safe()", () => {
    const user = new User({
      email: "safe@example.com",
      firstName: "Safe",
      lastName: "User",
      passwordHash: "secret",
    });

    const safeUser = user.safe();

    expect(safeUser.passwordHash).toBeUndefined();
    expect(safeUser.email).toBe("safe@example.com");
  });

  it("should mark login success", () => {
    const user = new User({
      email: "login@example.com",
      firstName: "Login",
      lastName: "Tester",
      passwordHash: "pw",
    });

    user.markLoginSuccess();

    expect(user.failedLoginAttempts).toBe(0);
    expect(user.lastLoginAt).not.toBeNull();
    expect(user.lockedUntil).toBeNull();
  });

  it("should lock account after 5 failed attempts", () => {
    const user = new User({
      email: "fail@example.com",
      firstName: "Fail",
      lastName: "Tester",
      passwordHash: "pw",
    });

    for (let i = 0; i < 5; i++) {
      user.markLoginFailure();
    }

    expect(user.failedLoginAttempts).toBe(5);
    expect(user.lockedUntil).not.toBeNull();
  });

  it("should verify email and activate user", () => {
    const user = new User({
      email: "verify@example.com",
      firstName: "Verify",
      lastName: "Tester",
      passwordHash: "pw",
    });

    user.verifyEmail();

    expect(user.emailVerified).toBe(true);
    expect(user.status).toBe("ACTIVE");
  });

  it("should update profile", () => {
    const user = new User({
      email: "profile@example.com",
      firstName: "Profile",
      lastName: "Tester",
      passwordHash: "pw",
    });

    user.updateProfile({ phone: "123456789" });

    expect(user.profile.phone).toBe("123456789");
  });
});
