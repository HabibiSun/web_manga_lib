
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    const username = document.getElementById('username');
    const email = document.getElementById('email');
    const password = document.getElementById('password');

    // Функция для отображения ошибки
    const showError = (input, message) => {
        const errorElement = input.nextElementSibling;
        errorElement.textContent = message;
        input.classList.add('invalid');
    };

    // Функция для скрытия ошибки
    const showSuccess = (input) => {
        const errorElement = input.nextElementSibling;
        errorElement.textContent = '';
        input.classList.remove('invalid');
    };

    // Валидаторы
    const validateUsername = () => {
        const value = username.value.trim();
        if (value === '') {
            showSuccess(username);
            return false;
        }

        if (value.length < 6 || value.length > 30) {
            showError(username, 'Имя пользователя должно содержать от 6 до 30 символов.');
            return false;
        }
        showSuccess(username);
        return true;
    };

    const validateEmail = () => {
        const value = email.value.trim();
        if (value === '') {
            showSuccess(email);
            return false;
        }

        const emailFormatRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const allowedCharsRegex = /^[a-zA-Z0-9@._-]+$/;

        if (!emailFormatRegex.test(value)) {
            showError(email, 'Пожалуйста, введите корректный email (example@ya.ru).');
            return false;
        }
        if (!allowedCharsRegex.test(value)) {
            showError(email, 'Email может содержать только английские буквы, цифры и символы @ . _ -');
            return false;
        }
        showSuccess(email);
        return true;
    };

    const validatePassword = () => {
        const value = password.value.trim();

        if (value === '') {
            showSuccess(password);
            return false;
        }

        // Регулярное выражение для проверки разрешенных символов в пароле
        const allowedPasswordCharsRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/;

        if (value.length < 6) {
            showError(password, 'Пароль должен содержать как минимум 6 символов.');
            return false;
        }
        if (!/[A-Z]/.test(value)) {
            showError(password, 'Пароль должен содержать минимум одну заглавную букву.');
            return false;
        }
        if (value.length > 0 && !allowedPasswordCharsRegex.test(value)) {
            showError(password, 'Пароль может содержать только английские буквы, цифры и спецсимволы.');
            return false;
        }
        showSuccess(password);
        return true;
    };

    // Вешаем слушателей событий на ввод
    username.addEventListener('input', validateUsername);
    email.addEventListener('input', validateEmail);
    password.addEventListener('input', validatePassword);

    // Финальная проверка перед отправкой формы
    form.addEventListener('submit', (e) => {
        const isUsernameValid = validateUsername();
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();

        // Если хотя бы одно поле невалидно, отменяем отправку формы
        if (!isUsernameValid || !isEmailValid || !isPasswordValid) {
            e.preventDefault();
        }
    });
});