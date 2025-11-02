// Скролы и меню чтения

document.addEventListener('DOMContentLoaded', () => {

    //  Логика навигации
    const readerNav = document.getElementById('reader-nav');
    if (readerNav) {
        let lastScrollY = window.scrollY;
        window.addEventListener('scroll', () => {
            if (window.scrollY > lastScrollY && window.scrollY > 100) { // Добавил небольшую задержку
                readerNav.classList.add('reader-nav--hidden');
            } else {
                readerNav.classList.remove('reader-nav--hidden');
            }
            lastScrollY = window.scrollY;
        });
    }

    // Управление панелью страниц
    const pagesSidebar = document.getElementById('pages-sidebar');
    const pagesToggleBtn = document.getElementById('pages-toggle');
    const pagesOverlay = document.getElementById('pages-overlay');

    let closePagesSidebar = () => {};

    if (pagesSidebar && pagesToggleBtn && pagesOverlay) {
        const openPagesSidebar = () => {
            pagesSidebar.classList.add('is-open');
            pagesOverlay.classList.add('is-open');
        };
        // Присваиваем функцию нашей переменной
        closePagesSidebar = () => {
            pagesSidebar.classList.remove('is-open');
            pagesOverlay.classList.remove('is-open');
        };
        pagesToggleBtn.addEventListener('click', openPagesSidebar);
        pagesOverlay.addEventListener('click', closePagesSidebar);
    }

    // Управление панелью глав
    const chaptersSidebar = document.getElementById('chapters-sidebar');
    const chaptersToggleBtn = document.getElementById('chapters-toggle');
    const chaptersOverlay = document.getElementById('chapters-overlay');

    if (chaptersSidebar && chaptersToggleBtn && chaptersOverlay) {
        const openChaptersSidebar = () => {
            chaptersSidebar.classList.add('is-open');
            chaptersOverlay.classList.add('is-open');
        };
        const closeChaptersSidebar = () => {
            chaptersSidebar.classList.remove('is-open');
            chaptersOverlay.classList.remove('is-open');
        };

        chaptersToggleBtn.addEventListener('click', (event) => {
            event.preventDefault();
            openChaptersSidebar();
        });

        chaptersOverlay.addEventListener('click', closeChaptersSidebar);
    }

    //  Логика прокрутки и подсветки страниц
    const pageLinks = document.querySelectorAll('.page-link');
    const images = document.querySelectorAll('.reader-content img');

    pageLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = link.getAttribute('href');
            const targetImage = document.querySelector(targetId);

            if (targetImage) {
                targetImage.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            if (pagesSidebar) {
                closePagesSidebar();
            }
        });
    });

    if (images.length > 0) { // Запускаем observer только если есть картинки
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const pageId = entry.target.id;
                    const activeLink = document.querySelector(`.page-link[href="#${pageId}"]`);
                    pageLinks.forEach(link => link.classList.remove('active'));
                    if (activeLink) {
                        activeLink.classList.add('active');
                    }
                }
            });
        }, { rootMargin: '-50% 0px -50% 0px' });

        images.forEach(image => {
            observer.observe(image);
        });
    }
});