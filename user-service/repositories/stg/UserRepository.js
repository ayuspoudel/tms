import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, ObjectId } from "mongodb";
import { User } from "../../models/User.js";

let mongoServer, client, db, usersCollection;

async function connect() {
  if (!mongoServer) {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    client = new MongoClient(uri, { useUnifiedTopology: true });
    await client.connect();
    db = client.db("test");
    usersCollection = db.collection("users");
    await usersCollection.createIndex({ email: 1 }, { unique: true });
  }
}

export class UserRepository {
  static async _init() {
    await connect();
  }

  // Find user by email
  async findByEmail(email) {
    await connect();
    const doc = await usersCollection.findOne({ email: email.toLowerCase() });
    return doc ? new User(doc) : null;
  }

  // Find user by ID
  async findById(id) {
    await connect();
    // Accept both string and ObjectId
    const _id = ObjectId.isValid(id) ? new ObjectId(id) : id;
    const doc = await usersCollection.findOne({ _id });
    return doc ? new User(doc) : null;
  }

  // Create user
  async createUser(userData) {
    await connect();
    const doc = { ...userData, email: userData.email.toLowerCase() };
    const result = await usersCollection.insertOne(doc);
    return new User({ ...doc, _id: result.insertedId });
  }

  // Update user
  async updateUser(id, updates) {
    await connect();
    const _id = ObjectId.isValid(id) ? new ObjectId(id) : id;
    const result = await usersCollection.findOneAndUpdate(
      { _id },
      { $set: updates },
      { returnDocument: "after" }
    );
    return result.value ? new User(result.value) : null;
  }

  // Delete user
  async deleteUser(id) {
    await connect();
    const _id = ObjectId.isValid(id) ? new ObjectId(id) : id;
    await usersCollection.deleteOne({ _id });
    return true;
  }

  // Utility: Clear all users (for tests)
  static async clearAll() {
    await connect();
    await usersCollection.deleteMany({});
  }

  // Utility: Seed users for tests or dev
  static async seed(usersArray) {
    await connect();
    await usersCollection.deleteMany({});
    if (usersArray.length) {
      await usersCollection.insertMany(usersArray);
    }
  }

  // Utility: Stop the in-memory server (for afterAll in tests)
  static async stop() {
    if (client) await client.close();
    if (mongoServer) await mongoServer.stop();
    client = null;
    mongoServer = null;
    db = null;
    usersCollection = null;
  }
}