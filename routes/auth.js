const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const logger = require('../utils/logger');

const router = express.Router();

// Страница регистрации
router.get('/register', (req, res) => {
    const oldInput = req.flash('old_input')[0] || {};

    res.render('register', {
        title: 'Регистрация',
        oldInput: oldInput
    });
});

const registerValidationRules = [
    // Проверка имени пользователя (без изменений)
    body('username')
        .trim()
        .isLength({ min: 6, max: 30 })
        .withMessage('Имя пользователя должно содержать от 6 до 30 символов.'),

    // Проверка email
    body('email')
        .isEmail()
        .withMessage('Пожалуйста, введите корректный email.')
        .matches(/^[a-zA-Z0-9@._-]+$/)
        .withMessage('Email может содержать только английские буквы, цифры и символы @ . _ -')
        .custom(async (value) => {
            const user = await User.findOne({ where: { email: value } });
            if (user) {
                return Promise.reject('Пользователь с таким email уже существует.');
            }
        })
        .normalizeEmail(),

    // Проверка пароля
    body('password')
        .isLength({ min: 6 })
        .withMessage('Пароль должен содержать как минимум 6 символов.')
        .matches(/[A-Z]/)
        .withMessage('Пароль должен содержать как минимум одну заглавную букву.')
        .matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/)
        .withMessage('Пароль может содержать только английские буквы, цифры и спецсимволы.')
];

// Применяем правила к маршруту регистрации
router.post('/register', registerValidationRules, async (req, res) => {
    // Проверяем результат валидации
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('old_input', req.body);

        req.flash('error_msg', errors.array()[0].msg);
        return res.redirect('/register');
    }

    // Если валидация прошла успешно, продолжаем логику регистрации
    try {
        const { username, email, password } = req.body;
        const hashPassword = await bcrypt.hash(password, 10);
        await User.create({ username, email, password: hashPassword });

        logger.info(`Новый пользователь зарегистрирован: ${email}`);
        req.flash('success_msg', 'Вы успешно зарегистрированы и можете войти!');
        res.redirect('/login');
    } catch (e) {
        req.flash('old_input', req.body);
        logger.error(`Ошибка при регистрации: ${e.message}`);
        req.flash('error_msg', 'Что-то пошло не так, попробуйте снова.');
        res.redirect('/register');
    }
});

// Страница входа
router.get('/login', (req, res) => {
    res.render('login', { title: 'Вход' });
});

// Обработка входа
router.post('/login', async (req, res, next) => { // Добавили 'next' для обработки ошибок
    try {
        const { email, password, remember } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            logger.warn(`Попытка входа для несуществующего пользователя: ${email}`);
            req.flash('error_msg', 'Неверный email или пароль.');
            return res.redirect('/login');
        }
        const areSame = await bcrypt.compare(password, user.password);
        if (areSame) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            if (remember) {
                // Устанавливаем долгий срок жизни cookie
                req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000;
            } else {
                // Иначе cookie будет сессионным (удалится при закрытии браузера)
                req.session.cookie.expires = false;
            }

            req.session.save(err => {
                if (err) {
                    logger.error(`Ошибка сохранения сессии: ${err.message}`);
                    return next(err);
                }
                logger.info(`Пользователь успешно вошел в систему: ${email}`);
                req.flash('success_msg', 'Вы успешно вошли в систему!');
                res.redirect('/');
            });
        } else {
            logger.warn(`Неудачная попытка входа для пользователя: ${email}`);
            req.flash('error_msg', 'Неверный email или пароль.');
            res.redirect('/login');
        }
    } catch (e) {
        logger.error(`Ошибка при входе: ${e.message}`);
        req.flash('error_msg', 'Произошла ошибка сервера.');
        res.redirect('/login');
    }
});

// Выход
router.get('/logout', (req, res) => {
    const email = req.session.user ? req.session.user.email : 'unknown';
    req.session.destroy(() => {
        logger.info(`Пользователь вышел из системы: ${email}`);
        res.redirect('/');
    });
});

module.exports = router;