const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Chapter = sequelize.define('Chapter', {
    chapterNumber: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING
    },
    pages: {
        type: DataTypes.JSONB,
        allowNull: false
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['MangaId', 'chapterNumber']
        }
    ]
});

module.exports = Chapter;