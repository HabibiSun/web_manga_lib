const express = require('express');
const path = require('path');
const session = require('express-session');
const morgan = require('morgan');
const flash = require('connect-flash');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { sequelize, connectDB } = require('./db');
const db = require('./models');

// Импортируем маршрутизаторы
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const indexRoutes = require('./routes/index');

const app = express();
app.use(morgan('dev'));

// Подключаемся к БД
connectDB();

// Настройка шаблонизатора EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware для обработки данных форм и JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware для статических файлов (CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Настройка сессий
const sessionStore = new SequelizeStore({ db: sequelize });
app.use(
    session({
        secret: 'a_very_secret_key_that_should_be_in_env_file',
        store: sessionStore,
        resave: false, // Не пересохранять сессию, если она не изменилась
        saveUninitialized: false, // Не создавать сессию для анонимных пользователей

        cookie: {
            maxAge: 24 * 60 * 60 * 1000, // Время жизни cookie (24 часа)
            httpOnly: true,
            secure: false
        }
    })
);
// Создаем таблицу для сессий, если ее нет
sessionStore.sync();

app.use(flash());



// Middleware, которое делает данные сессии доступными во всех шаблонах
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.isAdmin = req.session.user ? req.session.user.isAdmin : false;

    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');

    next();
});

// Подключаем маршруты
app.use('/', indexRoutes);
app.use('/', authRoutes);
app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 3000;

// Синхронизируем модели с БД и запускаем сервер
db.sequelize.sync({ force: false }).then(() => {
    app.listen(PORT, () => {
        console.log(`Сервер запущен на http://localhost:${PORT}`);
    });
});