const { User } = require("../domain/user.js");

class InMemoryUserRepository {
  constructor() {
    this.users = [];
  }

  async create(userData) {
    const user = new User({
      ...userData,
      id: String(this.users.length + 1),
    });
    this.users.push(user);
    return user;
  }

  async findByEmail(email) {
    return this.users.find((u) => u.email === email) || null;
  }

  async findById(id) {
    return this.users.find((u) => u.id === id) || null;
  }

  async update(id, updates) {
    const user = this.users.find((u) => u.id === id);
    if (!user) return null;
    Object.assign(user, updates);
    return user;
  }

  async delete(id) {
    this.users = this.users.filter((u) => u.id !== id);
    return true;
  }
}

module.exports = { InMemoryUserRepository };