const Sequelize = require('sequelize');

const sequelize = require('../common/database');
const settings = require('../common/settings');
const jwt = require('jsonwebtoken');

const User = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  admin: Sequelize.BOOLEAN,
  password: Sequelize.STRING,
  username: Sequelize.STRING,
  email: Sequelize.STRING,
});

User.findByToken = async (token) => {
  try {
    const decodedToken = jwt.verify(token, settings.JWT_SECRET_WORD);

    if (!decodedToken || typeof decodedToken !== "object") {
      return false;
    }
    if ("userId" in decodedToken) {
      user = await User.findByPk(decodedToken.userId);
    } else {
      return false;
    }

    if (!user || user.email !== decodedToken.email) {
      return false;
    }
    return user;
  } catch (err) {
    return false;
  }
}

module.exports = User;
