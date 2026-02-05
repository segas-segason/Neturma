document.addEventListener('DOMContentLoaded', function () {
    const menuItems = document.querySelectorAll('.menu-item');
    let currentTimeline = null;

    // Инициализация всех блоков
    menuItems.forEach(menuItem => {
        const trigger = menuItem.querySelector('.menu-item__trigger');
        const panel = menuItem.querySelector('.menu-item__panel');
        const panelInner = panel?.querySelector('.menu-item__panel-inner');

        if (!trigger || !panel || !panelInner) return;

        // Инициализация
        gsap.set(panel, {
            display: 'none',
            opacity: 0,
            height: 0,
            overflow: 'hidden'
        });

        gsap.set(panelInner, {
            opacity: 0
        });

        trigger.addEventListener('click', async function (e) {
            e.preventDefault();

            // Если уже есть активная анимация, не делаем ничего
            if (currentTimeline && currentTimeline.isActive()) {
                console.log('Анимация уже выполняется, ждём...');
                return;
            }

            const isExpanded = this.getAttribute('aria-expanded') === 'true';

            if (isExpanded) {
                await animateClose(this, panel, panelInner);
            } else {
                // Закрываем все другие открытые блоки
                await closeAllOpenPanelsExcept(this);
                // Открываем текущий
                await animateOpen(this, panel, panelInner);
            }
        });
    });

    // Закрыть все открытые панели кроме указанной
    async function closeAllOpenPanelsExcept(currentTrigger) {
        const openTriggers = document.querySelectorAll('.menu-item__trigger[aria-expanded="true"]');

        for (let trigger of openTriggers) {
            if (trigger !== currentTrigger) {
                const menuItem = trigger.closest('.menu-item');
                const panel = menuItem.querySelector('.menu-item__panel');
                const panelInner = panel.querySelector('.menu-item__panel-inner');

                await animateClose(trigger, panel, panelInner);
            }
        }
    }

    // Анимация открытия
    function animateOpen(trigger, panel, panelInner) {
        return new Promise((resolve) => {
            trigger.setAttribute('aria-expanded', 'true');

            currentTimeline = gsap.timeline({
                onComplete: () => {
                    currentTimeline = null;
                    resolve();
                }
            });

            currentTimeline
                .set(panel, { display: 'block' })
                .to(panel, {
                    duration: 0.5,
                    height: 'auto',
                    opacity: 1,
                    ease: "sine.in"
                })
                .to(panelInner, {
                    duration: 0.4,
                    opacity: 1,
                    ease: "sine.in",

                    onComplete: function () {
                        // Плавная прокрутка к триггеру
                        gsap.to(window, {
                            duration: 0.5,
                            scrollTo: {
                                y: trigger,
                                autoKill: true
                            },
                            ease: "power2.inOut",
                            onComplete: function () {
                                // Фокусировка на триггере
                                trigger.focus();
                            }
                        });
                    }
                }, "-=0.3");
        });
    }

    // Анимация закрытия
    function animateClose(trigger, panel, panelInner) {
        return new Promise((resolve) => {
            trigger.setAttribute('aria-expanded', 'false');

            currentTimeline = gsap.timeline({
                onComplete: () => {
                    gsap.set(panel, { display: 'none' });
                    currentTimeline = null;
                    resolve();
                }
            });

            currentTimeline
                .to(panelInner, {
                    duration: 0.4,
                    opacity: 0,
                    ease: "sine.out"
                })
                .to(panel, {
                    duration: 0.5,
                    height: 0,
                    opacity: 0,
                    ease: "sine.out"
                }, "-=0.1");
        });
    }
});