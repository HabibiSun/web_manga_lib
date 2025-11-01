const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Manga = sequelize.define('Manga', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    originalTitle: {
        type: DataTypes.STRING,
        allowNull: true
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false
    },
    folderName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true // Папки должны иметь уникальные имена
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    coverUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    releaseYear: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING, // 'ongoing', 'completed', 'frozen', 'abandoned'
        allowNull: false
    }
});

module.exports = Manga;