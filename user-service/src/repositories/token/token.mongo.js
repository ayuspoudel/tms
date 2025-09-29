const { UserTokenModel } = require("../../models/userToken.mongoose.js");

class MongoTokenRepository {
  async create(tokenData) {
    const doc = new UserTokenModel(tokenData);
    await doc.save();
    return doc.toObject();
  }

  async findByToken(token) {
    return await UserTokenModel.findOne({ token }).exec();
  }

  async deleteByToken(token) {
    return await UserTokenModel.deleteOne({ token }).exec();
  }

  async deleteAllByUser(userId) {
    return await UserTokenModel.deleteMany({ userId }).exec();
  }
}

module.exports = { MongoTokenRepository };
