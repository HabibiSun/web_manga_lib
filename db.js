const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('manga_db', 'postgres', '123', {
    host: 'localhost',
    dialect: 'postgres',
    logging: true
});

// Проверка соединения с базой данных
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Соединение с базой данных успешно установлено.');
    } catch (error) {
        console.error('Не удалось подключиться к базе данных:', error);
    }
};

module.exports = { sequelize, connectDB };