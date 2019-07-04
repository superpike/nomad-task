const Sequelize = require('sequelize');

const sequelize = require('../common/database');

const Task = sequelize.define('task', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  text: Sequelize.STRING,
});

module.exports = Task;
