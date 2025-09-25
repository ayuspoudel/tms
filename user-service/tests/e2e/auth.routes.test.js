const request = require("supertest");
const { createApp } = require("../../src/app.js");
const { connectDB, disconnectDB } = require("../../src/config/db.mongo.js");
const mongoose = require("mongoose");

describe("Auth API (Mongo)", () => {
  let app;

  beforeAll(async () => {
    process.env.DB_TYPE = "mongo";
    await connectDB();
    app = createApp();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    // Clean users between tests
    if (mongoose.connection.collections.users) {
      await mongoose.connection.collections.users.deleteMany({});
    }
  });

  it("should signup a new user", async () => {
    const res = await request(app)
      .post("/auth/signup")
      .send({
        email: "test@example.com",
        password: "secret",
        firstName: "Test",
        lastName: "User",
        username: "tester",
      });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe("test@example.com");
  });

  it("should return 409 on duplicate signup", async () => {
    await request(app).post("/auth/signup").send({
      email: "dup@example.com",
      password: "secret",
      firstName: "Dup",
      lastName: "User",
      username: "dup1",
    });

    const res = await request(app).post("/auth/signup").send({
      email: "dup@example.com",
      password: "secret",
      firstName: "Dup",
      lastName: "User",
      username: "dup2",
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already exists/i);
  });

  it("should return 400 on missing required fields", async () => {
    const res = await request(app).post("/auth/signup").send({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });
});
