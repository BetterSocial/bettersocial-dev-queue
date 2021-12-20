const {
  User,
} = require("../../databases/models");

class UserService {
  constructor() { }

  async getUserAdmin(usernameAdmin) {
    try {
      let res = await User.findOne({
        where: {
          username: usernameAdmin
        }
      })
      return res;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserService;