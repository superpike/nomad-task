const fs = require('fs');

const settings = {
    HTTP_SERVER_PORT: 8888,
    HTTP_SERVER_HOST: 'localhost',
    DB_URL: 'localhost',
    DB_NAME: 'nomad',
    DB_USER: 'postgres',
    DB_PASSWORD: '123456',
    JWT_SECRET_WORD: 'mySecretKey',
};

if (fs.existsSync(`./.env`)) {
    const fileConfig = (fs.readFileSync('./.env').toString().split("\r\n"));
    fileConfig.forEach(el => {
        if (el) {
            config = el.split('=')
            settings[config[0]] = config[1];
        }
    });
}

module.exports = settings;