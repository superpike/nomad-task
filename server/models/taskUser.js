const Sequelize = require('sequelize');

const sequelize = require('../common/database');

const TaskUser = sequelize.define('taskUser', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
});

module.exports = TaskUser;
