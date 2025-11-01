const express = require('express');
const { Manga, Genre ,Chapter } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();

const multer = require('multer');
const path = require('path');
const fs = require('fs-extra'); // Используем fs-extra

const upload = multer({ dest: 'uploads/' });

// Middleware для проверки, является ли пользователь админом
const isAdmin = (req, res, next) => {
    if (!req.session.isLoggedIn || !req.session.user.isAdmin) {
        return res.redirect('/');
    }
    next();
};

// Применяем middleware ко всем маршрутам админки
router.use(isAdmin);

// Главная страница админки
router.get('/', async (req, res) => {
    try {
        const search = req.query.search;

        const findOptions = {
            order: [
                ['id', 'ASC']
            ]
        };

        if (search && search.trim()) {
            findOptions.where = {
                [Op.or]: [
                    { title: { [Op.iLike]: `%${search}%` } },
                    { originalTitle: { [Op.iLike]: `%${search}%` } }
                ]
            };
        }

        // Выполняем запрос с динамически собранными опциями
        const mangaList = await Manga.findAll(findOptions);

        // Рендерим страницу
        res.render('admin/index', {
            title: 'Админ-панель',
            mangaList,
            currentSearch: search || ''
        });

    } catch (error) {
        console.error('Ошибка при загрузке админ-панели:', error);
        res.status(500).send('Ошибка сервера');
    }
});

// Страница добавления манги
router.get('/add', async (req, res) => { // <-- Делаем функцию асинхронной
    try {
        // Загружаем все жанры из базы данных для отображения в форме
        const allGenres = await Genre.findAll({ order: [['name', 'ASC']] });
        const oldInput = req.flash('old_input')[0] || {};

        res.render('admin/add', {
            title: 'Добавить мангу',
            genres: allGenres,
            oldInput: oldInput
        });
    } catch (error) {
        console.error('Ошибка при загрузке страницы добавления:', error);
        req.flash('error_msg', 'Не удалось загрузить страницу.');
        res.redirect('/admin');
    }
});

// Обработка добавления манги
router.post('/add', upload.single('coverImage'), async (req, res) => {
    try {
        // Получаем все данные из формы, включая массив `genres`
        const { title, originalTitle, folderName, author, releaseYear, description, status, genres } = req.body;

        // Проверяем, был ли загружен файл
        if (!req.file) {
            req.flash('old_input', req.body);
            req.flash('error_msg', 'Необходимо загрузить файл обложки.');
            return res.redirect('/admin/add');
        }

        // Создаем пути
        const targetDir = path.join(__dirname, '..', 'public', 'images', folderName);
        const targetFile = path.join(targetDir, 'cover.jpg');

        // Создаем папку, если ее нет
        await fs.ensureDir(targetDir);

        // Копируем загруженный файл из временной папки в нашу целевую папку
        await fs.copy(req.file.path, targetFile);

        // Удаляем временный файл
        await fs.unlink(req.file.path);

        // Создаем запись в базе данных с локальным путем
        const coverUrl = `/images/${folderName}/cover.jpg`;

        // Сохраняем созданную мангу в переменную `newManga`
        const newManga = await Manga.create({
            title,
            originalTitle,
            folderName,
            author,
            releaseYear,
            description,
            status,
            coverUrl
        });

        // Привязываем выбранные жанры к только что созданной манге
        // Проверяем, что пользователь выбрал хотя бы один жанр
        if (genres && genres.length > 0) {
            // Используем специальный метод Sequelize `setGenres`, который принимает массив ID
            await newManga.setGenres(genres);
            console.log(`Манга "${title}" успешно связана с жанрами (ID: ${genres.join(', ')})`);
        }

        req.flash('success_msg', 'Манга успешно добавлена!');
        res.redirect('/admin');

    } catch (error) {
        console.error('Ошибка при добавлении манги:', error);

        // Дополнительная защита: если произошла ошибка, удаляем временный файл, если он еще существует
        if (req.file && req.file.path) {
            try { await fs.unlink(req.file.path); } catch (e) { console.error("Не удалось удалить временный файл после ошибки.", e); }
        }
        req.flash('old_input', req.body);
        req.flash('error_msg', 'Произошла ошибка при добавлении манги.');
        res.redirect('/admin/add');
    }
});

router.post('/manga/:id/delete', async (req, res) => {
    try {
        const mangaId = req.params.id;

        // 1. Находим мангу в базе данных, чтобы получить имя ее папки
        const manga = await Manga.findByPk(mangaId);

        if (!manga) {
            req.flash('error_msg', 'Манга не найдена.');
            return res.redirect('/admin');
        }

        // Удаляем папку с изображениями с сервера
        const mangaDir = path.join(__dirname, '..', 'public', 'images', manga.folderName);
        await fs.remove(mangaDir);
        console.log(`Папка ${mangaDir} успешно удалена.`);

        // Удаляем запись о манге из базы данных
        await manga.destroy();

        req.flash('success_msg', `Манга "${manga.title}" была успешно удалена.`);
        res.redirect('/admin');

    } catch (error) {
        console.error('Ошибка при удалении манги:', error);
        req.flash('error_msg', 'Произошла ошибка при удалении манги.');
        res.redirect('/admin');
    }
});

router.get('/manga/:mangaId/chapters', async (req, res) => {
    try {
        const mangaId = req.params.mangaId;
        // Находим родительскую мангу, чтобы показать ее название
        const manga = await Manga.findByPk(mangaId);
        // Находим все главы, принадлежащие этой манге
        const chapters = await Chapter.findAll({
            where: { MangaId: mangaId },
            order: [['chapterNumber', 'DESC']] // Сортируем (новые главы сверху)
        });

        res.render('admin/chapters', {
            title: `Управление главами: ${manga.title}`,
            manga,
            chapters
        });
    } catch (error) {
        console.error('Ошибка при загрузке списка глав:', error);
        req.flash('error_msg', 'Не удалось загрузить список глав.');
        res.redirect('/admin');
    }
});

// Страница добавления главы
router.get('/manga/:mangaId/add-chapter', async (req, res) => {
    try {
        const manga = await Manga.findByPk(req.params.mangaId);
        if (!manga) {
            req.flash('error_msg', 'Манга не найдена.');
            return res.redirect('/admin');
        }

        // Получаем данные из flash-сессии для восстановления полей при ошибке
        const oldInput = req.flash('old_input')[0] || {};

        res.render('admin/add-chapter', {
            title: `Добавить главу: ${manga.title}`,
            mangaId: manga.id,
            mangaTitle: manga.title,
            oldInput // Передаем объект с "старыми" данными в шаблон
        });
    } catch (error) {
        console.error('Ошибка при загрузке страницы добавления главы:', error);
        req.flash('error_msg', 'Произошла ошибка.');
        res.redirect('/admin');
    }
});

// Обработка добавления главы
router.post(
    '/manga/:mangaId/add-chapter',
    // Используем multer.array() для приема до 100 файлов из поля с name="pages"
    upload.array('pages', 100),
    async (req, res) => {
        const mangaId = req.params.mangaId;
        try {
            const { chapterNumber, chapterTitle } = req.body;

            // Проверяем, что файлы были загружены
            if (!req.files || req.files.length === 0) {
                req.flash('old_input', req.body);
                req.flash('error_msg', 'Необходимо загрузить хотя бы один файл страницы.');
                return res.redirect(`/admin/manga/${mangaId}/add-chapter`);
            }

            // Находим родительскую мангу, чтобы получить имя ее папки
            const manga = await Manga.findByPk(mangaId);
            if (!manga) {
                req.flash('error_msg', 'Родительская манга не найдена.');
                return res.redirect('/admin');
            }

            // Создаем пути и новую папку для главы
            const chapterFolderName = String(chapterNumber).replace('.', '-');
            const chapterDir = path.join(__dirname, '..', 'public', 'images', manga.folderName, 'chapters', chapterFolderName);
            await fs.ensureDir(chapterDir);

            const pageUrls = [];

            // 4. Обрабатываем каждый загруженный файл в цикле
            for (let i = 0; i < req.files.length; i++) {
                const file = req.files[i];
                // Формируем новое имя файла: 01.jpg, 02.jpg и т.д.
                const newFileName = `${String(i + 1).padStart(2, '0')}${path.extname(file.originalname)}`;
                const targetPath = path.join(chapterDir, newFileName);

                // Копируем файл из временной папки в целевую
                await fs.copy(file.path, targetPath);

                pageUrls.push(`/images/${manga.folderName}/chapters/${chapterFolderName}/${newFileName}`);
            }

            // Удаляем все временные файлы
            await Promise.all(req.files.map(file => fs.unlink(file.path)));

            // Превращаем массив URL в JSON для БД
            const pagesForDb = pageUrls.map((url, index) => ({ pageNumber: index + 1, imageUrl: url }));

            // Создаем запись в базе данных
            await Chapter.create({
                chapterNumber: parseFloat(chapterNumber),
                title: chapterTitle,
                pages: pagesForDb,
                MangaId: mangaId
            });

            req.flash('success_msg', `Глава ${chapterNumber} успешно добавлена!`);
            res.redirect(`/admin/manga/${mangaId}/chapters`);

        } catch (error) {
            console.error('Ошибка при добавлении главы с файлами:', error);
            // Удаляем временные файлы, если они остались после ошибки
            if (req.files && req.files.length > 0) {
                await Promise.all(req.files.map(file => fs.unlink(file.path)));
            }
            req.flash('old_input', req.body);
            req.flash('error_msg', 'Произошла ошибка на сервере при добавлении главы.');
            res.redirect(`/admin/manga/${mangaId}/add-chapter`);
        }
    }
);

router.post('/chapter/:chapterId/delete', async (req, res) => {
    try {
        const chapterId = req.params.chapterId;
        const chapter = await Chapter.findByPk(chapterId);

        if (!chapter) {
            req.flash('error_msg', 'Глава не найдена.');
            // Если не знаем куда, просто отправляем в админку
            return res.redirect('/admin');
        }

        // Сохраняем ID родительской манги, чтобы знать, куда вернуться
        const mangaId = chapter.MangaId;
        await chapter.destroy();

        req.flash('success_msg', 'Глава успешно удалена.');
        // Возвращаем администратора на страницу управления главами для той же манги
        res.redirect(`/admin/manga/${mangaId}/chapters`);

    } catch (error) {
        console.error('Ошибка при удалении главы:', error);
        req.flash('error_msg', 'Произошла ошибка при удалении главы.');
        res.redirect('/admin');
    }
});

router.post('/chapter/:chapterId/delete', async (req, res) => {
    try {
        const chapterId = req.params.chapterId;
        const chapter = await Chapter.findByPk(chapterId);

        if (!chapter) {
            req.flash('error_msg', 'Глава не найдена.');
            // Если не знаем куда, просто отправляем в админку
            return res.redirect('/admin');
        }

        // Сохраняем ID родительской манги, чтобы знать, куда вернуться
        const mangaId = chapter.MangaId;
        await chapter.destroy();

        req.flash('success_msg', 'Глава успешно удалена.');
        // Возвращаем администратора на страницу управления главами для той же манги
        res.redirect(`/admin/manga/${mangaId}/chapters`);

    } catch (error) {
        console.error('Ошибка при удалении главы:', error);
        req.flash('error_msg', 'Произошла ошибка при удалении главы.');
        res.redirect('/admin');
    }
});


// Страница редактирования манги
router.get('/manga/:mangaId/edit', async (req, res) => {
    const manga = await Manga.findByPk(req.params.mangaId);
    res.render('admin/edit', { title: 'Редактировать мангу', manga });
});

// Обработка редактирования манги
router.post('/manga/:mangaId/edit', async (req, res) => {
    const manga = await Manga.findByPk(req.params.mangaId);
    await manga.update(req.body);
    res.redirect('/admin');
});

module.exports = router;