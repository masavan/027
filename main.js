const slider = (function () {

    let currentIndex = 0;
    let timer = null;
    let isPlaying = true;
    let startX = 0;
    let duration = 1000;
    let slideCount = 0;

    const elements = {
        items: [],
        points: [],
        buttons: {},
        list: null
    };

    /*
    ** Navigation Logic
    */

    const getNextIndex = () => (currentIndex + 1) % slideCount;
    const getPrevIndex = () => (currentIndex - 1 + slideCount) % slideCount;

    const changeSlide = (newIndex) => {

        elements.items[currentIndex].style.opacity = 0;
        elements.points[currentIndex].classList.remove('active');

        currentIndex = newIndex;

        elements.items[currentIndex].style.opacity = 1;
        elements.points[currentIndex].classList.add('active');
    };

    const next = () => changeSlide(getNextIndex());
    const prev = () => changeSlide(getPrevIndex());

    /*
    ** Interval / Playback
    */
    const stopInterval = () => clearInterval(timer);

    const startInterval = () => {
        stopInterval(); // Очистити попередній, щоб не накладалися
        if (isPlaying) {
            timer = setInterval(next, duration);
        }
    };

    const togglePlay = () => {
        isPlaying = !isPlaying;
        const icon = elements.buttons.play.querySelector('i') || elements.buttons.play.children[0];

        if (isPlaying) {
            icon.classList.remove('fa-circle-play');
            icon.classList.add('fa-circle-pause');
            startInterval();
        } else {
            icon.classList.remove('fa-circle-pause');
            icon.classList.add('fa-circle-play');
            stopInterval();
        }
    };

    /*
    ** Setup & Listeners
    */
    const setupPoints = (container) => {
        const pointsContainer = document.getElementById('slider-points');
        pointsContainer.innerHTML = new Array(slideCount).fill(0)
            .map((_, i) => `<span data-index="${i}"></span>`)
            .join('');

        elements.points = pointsContainer.children;
        elements.points[currentIndex].classList.add('active'); // Активувати перший
    };

    const bindEvents = () => {

        elements.buttons.prev.addEventListener('click', () => {
            prev();
            startInterval(); // Скидаємо таймер при кліку
        });
        elements.buttons.next.addEventListener('click', () => {
            next();
            startInterval();
        });
        elements.buttons.play.addEventListener('click', togglePlay);

        document.getElementById('slider-points').addEventListener('click', (e) => {
            const point = e.target.closest('span');
            if (point) {
                changeSlide(parseInt(point.dataset.index, 10));
                startInterval();
            }
        });

        // 🟢 КЕРУВАННЯ КЛАВІАТУРОЮ (СТРІЛКИ)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                prev();
                startInterval();
            }
            if (e.key === 'ArrowRight') {
                next();
                startInterval();
            }
        });

        // Свайпи (Touch/Mouse)
        const handleStart = (e) => startX = e.pageX || e.touches?.[0].pageX;
        const handleEnd = (e) => {
            const endX = e.pageX || e.changedTouches?.[0].pageX;
            const diff = endX - startX;

            if (Math.abs(diff) > 50) {
                if (diff > 0) prev();
                else next();
                startInterval();
            }
        };

        elements.list.addEventListener('mousedown', handleStart);
        elements.list.addEventListener('mouseup', handleEnd);
        elements.list.addEventListener('touchstart', handleStart);
        elements.list.addEventListener('touchend', handleEnd);
    };

    return {
        init(selectors, options) {
            // Ініціалізація елементів
            elements.list = document.getElementById('slider-list');
            const container = document.querySelector(selectors.container);
            elements.items = document.querySelectorAll(selectors.items);
            elements.buttons.prev = document.getElementById('slider-prev');
            elements.buttons.next = document.getElementById('slider-next');
            elements.buttons.play = document.getElementById('slider-play');

            slideCount = elements.items.length;
            duration = options.duration || 1000;

            if (!slideCount) return;


            setupPoints();

            // Встановлюємо стилі для першого рендеру
            elements.items.forEach(el => el.style.opacity = 0);
            elements.items[currentIndex].style.opacity = 1;

            bindEvents();
            startInterval();
        },
        destroy() {
            stopInterval();

        }
    };
})();