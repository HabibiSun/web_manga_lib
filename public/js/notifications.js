// Toast успеха/провала
document.addEventListener('DOMContentLoaded', () => {
    // Ищем на странице скрытый элемент с сообщением об успехе
    const successMessageElement = document.getElementById('success-msg');
    if (successMessageElement && successMessageElement.textContent.trim() !== '') {
        Toastify({
            text: successMessageElement.textContent,
            duration: 3000, // 3 секунды
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
            },
        }).showToast();
    }

    // Ищем на странице скрытый элемент с сообщением об ошибке
    const errorMessageElement = document.getElementById('error-msg');
    if (errorMessageElement && errorMessageElement.textContent.trim() !== '') {
        Toastify({
            text: errorMessageElement.textContent,
            duration: 3000,
            close: true,
            gravity: "top",
            position: "center",
            style: {
                background: "linear-gradient(to right, #ff5f6d, #ffc371)",
            },
        }).showToast();
    }
});