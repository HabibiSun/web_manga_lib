// формы удаления
document.addEventListener('DOMContentLoaded', () => {
    // Находим ВСЕ формы с классом .delete-form
    const deleteForms = document.querySelectorAll('.delete-form');

    deleteForms.forEach(form => {
        form.addEventListener('submit', function (event) {
            // Отменяем стандартное поведение (немедленную отправку формы)
            event.preventDefault();

            const mangaTitle = this.dataset.mangaTitle;

            // Вызываем модальное окно SweetAlert2
            Swal.fire({
                title: 'Вы уверены?',
                text: `Вы действительно хотите удалить «${mangaTitle}»? Это действие необратимо!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#6f42c1',
                cancelButtonColor: '#dc3545',
                confirmButtonText: 'Да, удалить!',
                cancelButtonText: 'Отмена'
            }).then((result) => {
                if (result.isConfirmed) {
                    this.submit();
                }
            });
        });
    });
});