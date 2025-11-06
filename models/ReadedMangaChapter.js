const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const ReadedMangaChapter = sequelize.define('ReadedMangaChapter', {

    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    },

    mangaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    },

    chapterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    }

}, {
    indexes: [
        {
            unique: true,
            fields: ['userId', 'mangaId', 'chapterId']
        }
    ]
});

module.exports = ReadedMangaChapter;