// ==UserScript==
// @name         misskey-inner-window-size-enhancer
// @namespace    https://github.com/ilplrr
// @version      1.2
// @updateURL    https://github.com/ilplrr/misskey-userscripts/raw/master/misskey-inner-window-size-enhancer.user.js
// @description  Enhance Misskey's inner window (for Deck UI)
// @author       ilplrr
// @match        https://misskey.io/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const INNER_WINDOW_DEFAULT_HEIGHT = '650px';
    const INNER_WINDOW_DEFAULT_WIDTH = '550px';

    const MAX_WIDTH = 900;

    function main(lastH=-1, lastW=-1){
        const app = document.getElementById('misskey_app');
        if (!app) {
            setTimeout(main, 100);
            return;
        }

        const appHeight = app.offsetHeight;
        const appWidth = app.offsetWidth;
        if (lastH !== appHeight || lastW !== appWidth || appHeight <= 0 || appWidth <= 0) {
            setTimeout(main, 100, appHeight, appWidth);
            return;
        }

        let x = 0;
        let y = 0;
        document.body.addEventListener('mousemove', (e) => { x = e.clientX; y = e.clientY; });

        const callback = function(mutationsList, observer) {
            for(const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    const elm = mutation.addedNodes[0];
                    if (!elm) continue;
                    if (elm.tagName === 'DIV' && [...elm.classList].includes('xpAOc')) {
                        if (elm.querySelector('div.emojis')?.className === 'emojis') continue;

                        // resize
                        elm.style.height = INNER_WINDOW_DEFAULT_HEIGHT;
                        elm.style.width = INNER_WINDOW_DEFAULT_WIDTH;

                        // inner window's edge and corner
                        const windowTopDblclickHandler = () => {
                            elm.style.top = '0px';
                            elm.style.height = `${app.offsetHeight - 5}px`;
                        }

                        const windowBottomDblclickHandler = () => {
                            elm.style.height = `${app.offsetHeight - elm.offsetTop}px`;
                        };

                        const windowLeftDblclickHandler = () => {
                            const right = elm.offsetLeft + elm.offsetWidth;
                            const nextLeft = Math.max(0, right - MAX_WIDTH);
                            elm.style.left = `${nextLeft}px`;
                            elm.style.width = `${right - nextLeft}px`;
                        };

                        const windowRightDblclickHandler = () => {
                            const nextRight = Math.min(app.offsetWidth, elm.offsetLeft + MAX_WIDTH);
                            elm.style.width = `${nextRight - elm.offsetLeft}px`;
                        };

                        const top = elm.querySelector('div.x6GRm.xe7xr');
                        top.addEventListener('dblclick', windowTopDblclickHandler);

                        const bottom = elm.querySelector('div.xnqRB.xe7xr');
                        bottom.addEventListener('dblclick', windowBottomDblclickHandler);

                        const left = elm.querySelector('div.xuyYZ.xe7xr');
                        left.addEventListener('dblclick', windowLeftDblclickHandler);

                        const right = elm.querySelector('div.xpwnF.xe7xr');
                        right.addEventListener('dblclick', windowRightDblclickHandler);

                        const topLeft = elm.querySelector('div.xawgF.xe7xr');
                        topLeft.addEventListener('dblclick', windowTopDblclickHandler);
                        topLeft.addEventListener('dblclick', windowLeftDblclickHandler);

                        const topRight = elm.querySelector('div.x6Jrb.xe7xr');
                        topRight.addEventListener('dblclick', windowTopDblclickHandler);
                        topRight.addEventListener('dblclick', windowRightDblclickHandler);

                        const bottomLeft = elm.querySelector('div.xij7W.xe7xr');
                        bottomLeft.addEventListener('dblclick', windowBottomDblclickHandler);
                        bottomLeft.addEventListener('dblclick', windowLeftDblclickHandler);

                        const bottomRight = elm.querySelector('div.xviz9.xe7xr');
                        bottomRight.addEventListener('dblclick', windowBottomDblclickHandler);
                        bottomRight.addEventListener('dblclick', windowRightDblclickHandler);
                    }
                } else if ('attributes') {
                    const elm = mutation.target;
                    if (typeof(elm.className) === 'string' && elm.className.indexOf('xr8AW') > -1 && elm.querySelector('div.emojis')) {
                        // emoji picker window
                        const h = elm.offsetHeight;
                        const w = elm.offsetWidth;
                        const bottom = y + h;
                        const right = x + w / 2;
                        const top = Math.max(0, y - Math.max(0, bottom - app.offsetHeight)) + window.scrollY;
                        const left = Math.max(0, x - w / 2 - Math.max(0, right - app.offsetWidth)) + window.scrollX;
                        elm.style.top = `${top}px`;
                        elm.style.left = `${left}px`;
                    }
                }
            }
        };

        const observer = new MutationObserver(callback);
        observer.observe(app, { attributes: true, childList: true, subtree: true });
    }
    main()
})();
