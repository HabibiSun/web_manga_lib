const { sequelize } = require('../db');
const User = require('./User');
const Manga = require('./Manga');
const Chapter = require('./Chapter');
const Genre = require('./Genre');
const Notification = require('./Notification');


Manga.hasMany(Chapter, { onDelete: 'CASCADE' });
Chapter.belongsTo(Manga);

Manga.hasMany(Notification);
Notification.belongsTo(Manga);

User.belongsToMany(Manga, { through: 'Favorites' });
Manga.belongsToMany(User, { through: 'Favorites' });

User.hasMany(Notification, { onDelete: 'CASCADE' });
Notification.belongsTo(User);

Manga.belongsToMany(Genre, { through: 'MangaGenres' });
Genre.belongsToMany(Manga, { through: 'MangaGenres' });

const db = {
    sequelize,
    User,
    Manga,
    Chapter,
    Genre,
    Notification
};

module.exports = db;