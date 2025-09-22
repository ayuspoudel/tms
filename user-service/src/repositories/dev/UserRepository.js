// repositories/dev/UserRepository.js
import { User } from "../../models/User.js";

// Simple in-memory store for dev mode
const users = new Map();

export class UserRepository {
  async findByEmail(email) {
    email = email.toLowerCase();
    for (const user of users.values()) {
      if (user.email === email) {
        return user instanceof User ? user : new User(user);
      }
    }
    return null;
  }

  async findById(id) {
    const user = users.get(id);
    return user ? (user instanceof User ? user : new User(user)) : null;
  }

  async createUser(userData) {
    const user = userData instanceof User ? userData : new User(userData);
    users.set(user.id, user);
    return user;
  }

  async updateUser(id, updates) {
    const existing = await this.findById(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, id };
    users.set(id, updated);
    return new User(updated);
  }

  async deleteUser(id) {
    return users.delete(id);
  }

  static clearAll() {
    users.clear();
  }
}
