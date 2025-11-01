const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Genre = sequelize.define('Genre', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    timestamps: false // Отключаем поля createdAt и updatedAt для жанров
});

module.exports = Genre;