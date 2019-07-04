const Sequelize = require('sequelize');

const sequelize = require('../common/database');

const Comment = sequelize.define('comment', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  text: Sequelize.STRING,
  deleted: Sequelize.BOOLEAN,
});

module.exports = Comment;
