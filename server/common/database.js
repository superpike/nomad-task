const Sequelize = require('sequelize');
const settings = require('./settings');

const sequelize = new Sequelize(settings.DB_NAME, settings.DB_USER, settings.DB_PASSWORD, {
  dialect: 'postgresql',
  host: settings.DB_URL
});

module.exports = sequelize;
