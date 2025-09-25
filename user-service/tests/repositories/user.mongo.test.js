const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { MongoUserRepository } = require("../../src/repositories/user.mongo.js");

let mongoServer;
let repo;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  repo = new MongoUserRepository();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("MongoUserRepository Integration", () => {
  it("should create and return a user", async () => {
    const user = await repo.create({
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
      passwordHash: "hashed_pw",
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe("test@example.com");
    expect(user.firstName).toBe("John");
    expect(user.lastName).toBe("Doe");
  });

  it("should find a user by email", async () => {
    const user = await repo.findByEmail("test@example.com");
    expect(user).not.toBeNull();
    expect(user.email).toBe("test@example.com");
  });

  it("should find a user by id", async () => {
    const created = await repo.create({
      email: "findid@example.com",
      firstName: "Jane",
      lastName: "Smith",
      passwordHash: "hashed_pw",
    });

    const found = await repo.findById(created.id);
    expect(found).not.toBeNull();
    expect(found.email).toBe("findid@example.com");
  });

  it("should update a user", async () => {
    const created = await repo.create({
      email: "update@example.com",
      firstName: "OldName",
      lastName: "User",
      passwordHash: "hashed_pw",
    });

    const updated = await repo.update(created.id, { firstName: "NewName" });
    expect(updated.firstName).toBe("NewName");
  });

  it("should delete a user", async () => {
    const created = await repo.create({
      email: "delete@example.com",
      firstName: "Delete",
      lastName: "Me",
      passwordHash: "hashed_pw",
    });

    await repo.delete(created.id);

    const found = await repo.findById(created.id);
    expect(found).toBeNull();
  });
});