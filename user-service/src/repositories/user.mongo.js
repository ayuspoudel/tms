const { User } = require("../domain/user.js");
const { UserModel } = require("../models/user.mongoose.js");

class MongoUserRepository {
  async create(userData) {
    const user = new User(userData);
    const doc = new UserModel(user);
    await doc.save();
    return new User(doc.toObject());
  }

  async findByEmail(email) {
    const doc = await UserModel.findOne({ email }).exec();
    return doc ? new User(doc.toObject()) : null;
  }

  async findById(id) {
    const doc = await UserModel.findOne({ id }).exec();
    return doc ? new User(doc.toObject()) : null;
  }

  async update(id, updates) {
    const doc = await UserModel.findOneAndUpdate({ id }, updates, { new: true }).exec();
    return doc ? new User(doc.toObject()) : null;
  }

  async delete(id) {
    await UserModel.deleteOne({ id }).exec();
    return true;
  }
}

module.exports = { MongoUserRepository };