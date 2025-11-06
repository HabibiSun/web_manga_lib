const { sequelize } = require('../db');
const User = require('./User');
const Manga = require('./Manga');
const Chapter = require('./Chapter');
const Genre = require('./Genre');
const Notification = require('./Notification');
const ReadedMangaChapter = require('./ReadedMangaChapter')


Manga.hasMany(Chapter, { onDelete: 'CASCADE' });
Chapter.belongsTo(Manga);

Manga.hasMany(Notification);
Notification.belongsTo(Manga);

User.belongsToMany(Manga, { through: 'Favorites' });
Manga.belongsToMany(User, { through: 'Favorites' });

User.hasMany(Notification, { onDelete: 'CASCADE' });
Notification.belongsTo(User);


User.hasMany(ReadedMangaChapter, { foreignKey: 'userId', onDelete: 'CASCADE' });
ReadedMangaChapter.belongsTo(User, { foreignKey: 'userId' });
Manga.hasMany(ReadedMangaChapter, { foreignKey: 'mangaId', onDelete: 'CASCADE' });
ReadedMangaChapter.belongsTo(Manga, { foreignKey: 'mangaId' });
Chapter.hasMany(ReadedMangaChapter, { foreignKey: 'chapterId', onDelete: 'CASCADE' });
ReadedMangaChapter.belongsTo(Chapter, { foreignKey: 'chapterId' });


Manga.belongsToMany(Genre, { through: 'MangaGenres' });
Genre.belongsToMany(Manga, { through: 'MangaGenres' });

const db = {
    sequelize,
    User,
    Manga,
    Chapter,
    Genre,
    Notification,
    ReadedMangaChapter
};

module.exports = db;