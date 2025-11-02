// Добавление в избранное
document.addEventListener('DOMContentLoaded', () => {
    const favoriteBtn = document.getElementById('favorite-btn');

    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', async () => {
            const mangaId = favoriteBtn.dataset.mangaId;
            // Определяем, какое действие нужно выполнить, прочитав data-атрибут
            const isCurrentlyFavorite = favoriteBtn.dataset.isFavorite === 'true';

            // Определяем метод и URL для запроса
            const method = isCurrentlyFavorite ? 'DELETE' : 'POST';
            const url = `/manga/${mangaId}/favorite`;

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();

                if (response.ok) {
                    Toastify({
                        text: data.message,
                        duration: 3000,
                        style: { background: "linear-gradient(to right, #00b09b, #96c93d)" },
                    }).showToast();

                    // Обновляем состояние кнопки
                    if (isCurrentlyFavorite) {
                        favoriteBtn.textContent = 'Добавить в избранное';
                        favoriteBtn.dataset.isFavorite = 'false';
                    } else {
                        favoriteBtn.textContent = 'В избранном';
                        favoriteBtn.dataset.isFavorite = 'true';
                    }
                } else {
                    Toastify({
                        text: data.message,
                        duration: 3000,
                        style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" },
                    }).showToast();
                }
            } catch (error) {
                console.error('Ошибка:', error);
                Toastify({
                    text: 'Не удалось выполнить запрос.',
                    duration: 3000,
                    style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" },
                }).showToast();
            }
        });
    }
});