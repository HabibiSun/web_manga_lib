const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Notification = sequelize.define('Notification', {
    message: {
        type: DataTypes.STRING,
        allowNull: false
    },
    link: {
        type: DataTypes.STRING,
        allowNull: true
    },
    read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

module.exports = Notification;