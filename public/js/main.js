// Уведомления
document.addEventListener('DOMContentLoaded', () => {
    const bell = document.getElementById('notification-bell');
    const dropdown = document.getElementById('notifications-dropdown');
    const unreadDot = document.querySelector('.unread-dot');

    const markNotificationsAsRead = async () => {
        if (!unreadDot) {
            return;
        }

        try {
            await fetch('/notifications/mark-as-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            unreadDot.remove();

        } catch (error) {
            console.error('Ошибка при отправке запроса на прочтение уведомлений:', error);
        }
    };

    if (bell && dropdown) {
        bell.addEventListener('click', (event) => {
            event.stopPropagation();
            const isVisible = dropdown.classList.toggle('is-visible');

            if (isVisible) {
                markNotificationsAsRead();
            }
        });

        document.addEventListener('click', (event) => {
            // Закрываем список, если клик был вне его
            if (!dropdown.contains(event.target) && !bell.contains(event.target)) {
                dropdown.classList.remove('is-visible');
            }
        });
    }

    const clearForm = document.getElementById('clear-notifications-form');

    if (clearForm) {
        clearForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Отменяем немедленную отправку

            Swal.fire({
                title: 'Очистить все уведомления?',
                text: "Это действие нельзя будет отменить.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#6f42c1',
                cancelButtonColor: '#dc3545',
                confirmButtonText: 'Да, очистить!',
                cancelButtonText: 'Отмена'
            }).then((result) => {
                if (result.isConfirmed) {
                    this.submit();
                }
            });
        });
    }
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('active');
            navMenu.classList.toggle('is-open');
        });
    }


});