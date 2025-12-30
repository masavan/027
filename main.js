const slider = (function () {
    /*
    * State
    */
    const state = {
        duration: 1000,
        numberOfSlides: 0,
        mode: 'play',
        elements: {
            container: null,
            list: null,
            items: null,
            points: {
                container: null,
                items: null,
            },
            buttons: {
                prev: null,
                next: null,
                play: null,
            }
        },
        currentIndex: 0,
        increaseIndex() {
            return ++this.currentIndex;
        },
        decreaseIndex() {
            return --this.currentIndex;
        },
        setIndex(index) {
            this.currentIndex = index;

            return this.currentIndex;
        },
        getIndex() {
            return this.currentIndex;
        },
        setElements({
                        container,
                        items
                    }) {
            this.elements.container = document.querySelector(container);
            this.elements.items = document.querySelectorAll(items);
        },
        setNumberOfSlides() {
            this.numberOfSlides = this.elements.items.length;
        },
        initElements(elements) {
            // Init elements
            this.elements.list = document.getElementById('slider-list');
            this.elements.buttons.prev = document.getElementById('slider-prev');
            this.elements.buttons.next = document.getElementById('slider-next');
            this.elements.buttons.play = document.getElementById('slider-play');
            this.elements.points.container = document.getElementById('slider-points');


            state.setElements(elements);
            state.setNumberOfSlides();

            state.generatePoints();
        },
        generatePoints() {
            const pointsTemplate = new Array(this.numberOfSlides)
                .fill(0)
                .reduce((template, _, index) => {
                    return `${template}<span data-index='${index}'></span>`;
                }, '');

            this.elements.points.container.innerHTML = pointsTemplate;

            this.elements.points.items = this.elements.points.container.children;
        },
        toggleMode() {
            this.mode = this.mode === 'play' ? 'pause' : 'play';

            return this.mode;
        },
        setDuration(duration = 1000) {
            this.duration = duration;
        },
    };

    /*
    ** Navigation
    */
    const getStep = (index) => {


        return index - state.numberOfSlides * (Math.floor(index / state.numberOfSlides))


    }
    const nextStep = () => getStep(state.increaseIndex());
    const prevStep = () => getStep(state.decreaseIndex());
    const moveTo = (index) => getStep(state.setIndex(index));
    const getCurrentStep = () => getStep(state.getIndex());


    /*
    ** Events
    */
    const events = (function () {
        let prevFn = null;
        let nextFn = null;
        let playFn = null;
        let pointsFn = null;
        let mousedownFn = null;
        let mouseupFn = null;
        let timer = null;

        const clickEvents = {
            onPrev(handlePrev) {
                prevFn = handlePrev;
                state.elements.buttons.prev.addEventListener('click', prevFn);
            },
            onNext(handleNext) {
                nextFn = handleNext;
                state.elements.buttons.next.addEventListener('click', nextFn);
            },
            onPlay(handlePlay) {
                playFn = () => {
                    handlePlay(state.toggleMode());
                }

                state.elements.buttons.play.addEventListener('click', playFn);
            },
            onPoint(handlePoint) {
                pointsFn = (e) => {
                    e.target.closest('span') && handlePoint(e.target.dataset.index)
                };
                state.elements.points.container.addEventListener('click', pointsFn);
            }
        };

        const swipesEvents = (swipes) => {
            let startPositionX = 0;
            const getX = (e) => e.offsetX || e.changedTouches?.[0].pageX;

            mousedownFn = (e) => {
                e.preventDefault();

                startPositionX = getX(e);
            };

            mouseupFn = (e) => {
                e.preventDefault();

                getX(e) < startPositionX
                    ? swipes.toLeft()
                    : swipes.toRight();

                startPositionX = 0;
            };

            state.elements.list.addEventListener('mousedown', mousedownFn);
            state.elements.list.addEventListener('mouseup', mouseupFn);
            state.elements.list.addEventListener('touchstart', mousedownFn);
            state.elements.list.addEventListener('touchend', mouseupFn);
        };

        const intervalEvents = {
            start(handleInterval, duration) {
                timer = setInterval(handleInterval, duration);
            },
            stop() {
                clearInterval(timer);
            },
        };

        return {
            init() {
                return {
                    click: clickEvents,
                    swipe: swipesEvents,
                    interval: intervalEvents,
                };
            },
            destroy() {
                state.elements.buttons.prev.removeEventListener('click', prevFn);
                state.elements.buttons.next.removeEventListener('click', nextFn);
                state.elements.buttons.play.removeEventListener('click', playFn);
                state.elements.points.container.removeEventListener('click', pointsFn);
                state.elements.list.removeEventListener('mousedown', mousedownFn);
                state.elements.list.removeEventListener('mouseup', mouseupFn);
                state.elements.list.removeEventListener('touchstart', mousedownFn);
                state.elements.list.removeEventListener('touchend', mouseupFn);

                intervalEvents.stop();

                prevFn = null;
                nextFn = null;
                pointsFn = null;
                mousedownFn = null;
                mouseupFn = null;
                timer = null;
            },
        };
    }());


    /*
    ** Render
    */
    const render = (action = () => {}) => {
        const prevIndex = getCurrentStep();
        action();
        const currentIndex = getCurrentStep();

        renderSlide({
            prevIndex,
            currentIndex,
        });
        renderPoints({
            prevIndex,
            currentIndex,
        });

        // const prevIndex = getCurrentStep();
        // prevStep(); or nextStep();
        // const currentIndex = getCurrentStep();

        // state.elements.items[prevIndex].style.opacity = 0;
        // state.elements.items[currentIndex].style.opacity = 1;
    }

    const renderSlide = ({
                             prevIndex,
                             currentIndex,
                         }) => {
        state.elements.items[prevIndex].style.opacity = 0;
        state.elements.items[currentIndex].style.opacity = 1;
    };

    const renderPoints = ({
                              prevIndex,
                              currentIndex,
                          }) => {
        state.elements.points.items[prevIndex].classList.remove('active');
        state.elements.points.items[currentIndex].classList.add('active');
    };

    const renderPlay = (mode) => {
        const iconTag = state.elements.buttons.play.children[0];

        if (mode === 'pause') {
            iconTag.classList.contains('fa-circle-pause') && iconTag.classList.remove('fa-circle-pause');
            !iconTag.classList.contains('fa-circle-play') && iconTag.classList.add('fa-circle-play');
        } else {
            iconTag.classList.contains('fa-circle-play') && iconTag.classList.remove('fa-circle-play');
            !iconTag.classList.contains('fa-circle-pause') && iconTag.classList.add('fa-circle-pause');
        }
    };


    /*
    ** Init Slider
    */
    const init = (
        elements,
        options
    ) => {

        state.initElements(elements);
        state.setDuration(options.duration);

        const eventsInitiation = events.init();

        render();
        renderPlay(state.mode);

        // Launch Events
        eventsInitiation.click.onPrev(() => {
            render(prevStep);
        });

        eventsInitiation.click.onNext(() => {
            render(nextStep);
        });

        eventsInitiation.click.onPlay((mode) => {
            if (mode === 'pause') {
                renderPlay(mode);
                eventsInitiation.interval.stop();
            } else {
                renderPlay(mode);
                eventsInitiation.interval.start(() => {
                    render(nextStep);
                }, options.duration);
            }
        });

        eventsInitiation.swipe({
            toLeft: () => {
                render(prevStep);
            },
            toRight: () => {
                render(nextStep);
            }
        });

        eventsInitiation.click.onPoint((index) => {
            render(() => moveTo(index));
        });

        eventsInitiation.interval.start(() => {
            render(nextStep);
        }, state.duration);
    };

    return {
        init,
        destroy() {
            events.destroy();
        },
    };
}());
