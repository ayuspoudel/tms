import { User } from "../../models/User.js";

// In-memory user store
const users = new Map();

export class UserRepository {
  // Find user by email
  async findByEmail(email) {
    email = email.toLowerCase();
    for (const user of users.values()) {
      if (user.email === email) {
        return new User(user);
      }
    }
    return null;
  }

  // Find user by ID
  async findById(id) {
    const user = users.get(id);
    return user ? new User(user) : null;
  }

  // Create user
  async createUser(userData) {
    const user = new User(userData);
    users.set(user.id, user);
    return user;
  }

  // Update user
  async updateUser(id, updates) {
    const existing = await this.findById(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, id }; // ensure ID is not overwritten
    users.set(id, updated);
    return new User(updated);
  }

  // Delete user
  async deleteUser(id) {
    return users.delete(id);
  }

  // Utility: Clear all users (for tests)
  static clearAll() {
    users.clear();
  }
}