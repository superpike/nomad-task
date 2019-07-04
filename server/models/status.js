const Sequelize = require('sequelize');

const sequelize = require('../common/database');

const Status = sequelize.define('status', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: Sequelize.STRING,
  admin: Sequelize.BOOLEAN,
});

module.exports = Status;
