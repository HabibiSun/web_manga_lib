const express = require('express');
const { Manga, Chapter, Genre, User } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize'); // Импортируем операторы для поиска

const router = express.Router();

// Главная страница
router.get('/', async (req, res) => {
    try {
        const popularManga = await Manga.findAll({
            limit: 12,
            include: {
                model: Genre,
                through: { attributes: [] }
            }
        });
        res.render('index', {
            title: 'Главная страница',
            popularManga
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка сервера');
    }
});

// Страница каталога
router.get('/catalog', async (req, res) => {
    try {
        const { search = '', genre = '', sort = 'added_desc' } = req.query;

        // --- Подготовка опций для запроса в БД ---
        const findOptions = {
            include: [{ model: Genre, through: { attributes: [] } }],
            where: {},
            order: []
        };

        if (search) {
            findOptions.where = {
                [Op.or]: [
                    { title: { [Op.iLike]: `%${search}%` } },
                    { originalTitle: { [Op.iLike]: `%${search}%` } }
                ]
            };
        }
        if (genre) {
            // Sequelize требует специальный синтаксис для фильтрации по связанной модели
            findOptions.include[0].where = { id: genre };
        }

        // --- Добавляем условия сортировки (ORDER) ---
        switch (sort) {
            case 'title_asc':
                findOptions.order.push(['title', 'ASC']);
                break;
            case 'title_desc':
                findOptions.order.push(['title', 'DESC']);
                break;
            case 'release_desc':
                findOptions.order.push(['releaseYear', 'DESC']);
                break;
            case 'release_asc':
                findOptions.order.push(['releaseYear', 'ASC']);
                break;
            case 'added_asc':
                findOptions.order.push(['createdAt', 'ASC']);
                break;
            case 'added_desc':
            default:
                findOptions.order.push(['createdAt', 'DESC']);
                break;
        }

        // --- Выполняем запросы и рендерим страницу ---
        const mangas = await Manga.findAll(findOptions);
        const allGenres = await Genre.findAll({ order: [['name', 'ASC']] });

        res.render('catalog', {
            title: 'Каталог',
            mangas,
            genres: allGenres,
            currentSearch: search,
            currentGenre: genre,
            currentSort: sort
        });
    } catch (error) {
        logger.error(`Ошибка при загрузке каталога: ${error.message}`);
        res.status(500).send('Ошибка сервера');
    }
});

// Страница конкретной манги
router.get('/manga/:id', async (req, res) => {
    try {
        const mangaId = req.params.id;
        let isFavorite = false;

        // Теперь мы ищем мангу и сразу же включаем в запрос связанные с ней жанры
        const manga = await Manga.findByPk(mangaId, {
            include: {
                model: Genre,
                through: { attributes: [] } // Исключаем данные из связующей таблицы
            }
        });

        if (!manga) {
            return res.status(404).send('Манга не найдена');
        }

        const chapters = await Chapter.findAll({
            where: { MangaId: manga.id },
            order: [['chapterNumber', 'ASC']]
        });

        if (req.session.isLoggedIn) {
            const userId = req.session.user.id;
            const user = await User.findByPk(userId);
            if (user) {
                isFavorite = await user.hasManga(manga);
            }
        }

        res.render('manga', {
            title: manga.title,
            manga,
            chapters,
            isFavorite
        });
    } catch (error) {
        logger.error(`Ошибка при загрузке страницы манги: ${error.message}`);
        res.status(500).send('Ошибка сервера');
    }
});

// Страница чтения главы
router.get('/manga/:mangaId/chapter/:chapterId', async (req, res) => {
    try {
        const { mangaId, chapterId } = req.params;

        // Сначала находим родительскую мангу
        const manga = await Manga.findByPk(mangaId);
        if (!manga) {
            return res.status(404).send('Манга не найдена');
        }

        // Получаем ВСЕ главы для этой манги, отсортированные по номеру
        const allChapters = await Chapter.findAll({
            where: { MangaId: mangaId },
            order: [['chapterNumber', 'ASC']] // Сортируем от меньшего к большему
        });

        // Находим индекс ТЕКУЩЕЙ главы в этом массиве
        const currentIndex = allChapters.findIndex(ch => ch.id == chapterId);

        // Если главу не нашли в списке (например, неверный ID), выдаем ошибку
        if (currentIndex === -1) {
            return res.status(404).send('Глава не найдена');
        }

        // Определяем предыдущую и следующую главы на основе индекса
        const currentChapter = allChapters[currentIndex];
        const previousChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
        const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

        // Рендерим страницу, передавая в нее всю необходимую информацию
        res.render('reader', {
            title: `Чтение: ${manga.title} - Глава ${currentChapter.chapterNumber}`,
            manga,
            chapter: currentChapter,
            previousChapter, // Будет объектом или null
            nextChapter,    // Будет объектом или null
            allChapters
        });
    } catch (error) {
        logger.error(`Ошибка при загрузке ридера: ${error.message}`);
        res.status(500).send('Ошибка сервера');
    }
});

// Страница профиля пользователя (простой пример)
router.get('/profile', async (req, res) => {
    try {
        if (!req.session.isLoggedIn) {
            return res.redirect('/login');
        }

        // Находим пользователя по ID из сессии и "подтягиваем" (include)
        // всю связанную с ним мангу (это и есть избранное).
        // Также "подтягиваем" жанры для каждой манги.
        const userWithFavorites = await User.findByPk(req.session.user.id, {
            include: {
                model: Manga,
                // Для каждой манги из избранного также загружаем ее жанры
                include: {
                    model: Genre,
                    through: { attributes: [] }
                }
            }
        });

        // Sequelize поместит результат в свойство с множественным числом от названия модели
        const favorites = userWithFavorites.Mangas;

        res.render('profile', {
            title: 'Профиль',
            user: req.session.user,
            favorites: favorites // Передаем массив с избранной мангой
        });
    } catch (error) {
        logger.error(`Ошибка при загрузке профиля: ${error.message}`);
        res.redirect('/');
    }
});

router.post('/manga/:id/favorite', async (req, res) => {
    try {
        // Проверяем, залогинен ли пользователь
        if (!req.session.isLoggedIn) {
            return res.status(401).json({ success: false, message: 'Для добавления в избранное необходимо войти.' });
        }

        const mangaId = req.params.id;
        const userId = req.session.user.id;

        // 2. Находим пользователя и мангу в базе данных
        const user = await User.findByPk(userId);
        const manga = await Manga.findByPk(mangaId);

        if (!user || !manga) {
            return res.status(404).json({ success: false, message: 'Пользователь или манга не найдены.' });
        }

        // Используем специальный метод Sequelize "add<ModelName>" для создания связи
        // Sequelize автоматически предотвратит создание дубликатов в связующей таблице.
        await user.addManga(manga);

        logger.info(`Пользователь ${user.email} добавил в избранное мангу ID ${manga.id}`);
        res.status(200).json({ success: true, message: 'Манга добавлена в избранное!' });

    } catch (error) {
        logger.error(`Ошибка при добавлении в избранное: ${error.message}`);
        res.status(500).json({ success: false, message: 'Произошла ошибка на сервере.' });
    }
});
router.delete('/manga/:id/favorite', async (req, res) => {
    try {
        if (!req.session.isLoggedIn) {
            return res.status(401).json({ success: false, message: 'Необходима авторизация.' });
        }

        const mangaId = req.params.id;
        const userId = req.session.user.id;

        const user = await User.findByPk(userId);
        const manga = await Manga.findByPk(mangaId);

        if (!user || !manga) {
            return res.status(404).json({ success: false, message: 'Пользователь или манга не найдены.' });
        }

        // Sequelize предоставляет метод `remove<ModelName>` для удаления связи
        await user.removeManga(manga);

        logger.info(`Пользователь ${user.email} удалил из избранного мангу ID ${manga.id}`);
        res.status(200).json({ success: true, message: 'Манга удалена из избранного!' });

    } catch (error) {
        logger.error(`Ошибка при удалении из избранного: ${error.message}`);
        res.status(500).json({ success: false, message: 'Произошла ошибка на сервере.' });
    }
});


module.exports = router;