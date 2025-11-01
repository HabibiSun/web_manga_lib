const { sequelize } = require('../db');
const User = require('./User');
const Manga = require('./Manga');
const Chapter = require('./Chapter');
const Genre = require('./Genre');


Manga.hasMany(Chapter, { onDelete: 'CASCADE' });
Chapter.belongsTo(Manga);


User.belongsToMany(Manga, { through: 'Favorites' });
Manga.belongsToMany(User, { through: 'Favorites' });


Manga.belongsToMany(Genre, { through: 'MangaGenres' });
Genre.belongsToMany(Manga, { through: 'MangaGenres' });

const db = {
    sequelize,
    User,
    Manga,
    Chapter,
    Genre
};

module.exports = db;