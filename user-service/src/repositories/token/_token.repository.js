class TokenRepository {
  async create(tokenData) {}
  async findByToken(token) {}
  async deleteByToken(token) {}
  async deleteAllByUser(userId) {}
}

module.exports = { TokenRepository };
