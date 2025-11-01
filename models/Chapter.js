const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Chapter = sequelize.define('Chapter', {
    chapterNumber: {
        type: DataTypes.FLOAT, // Используем FLOAT для глав вроде 12.5
        allowNull: false
    },
    title: {
        type: DataTypes.STRING
    },
    pages: {
        type: DataTypes.JSONB, // Храним массив URL-адресов страниц в формате JSON
        allowNull: false
    }
});

module.exports = Chapter;