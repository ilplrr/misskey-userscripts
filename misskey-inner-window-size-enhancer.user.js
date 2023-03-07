// ==UserScript==
// @name         misskey-inner-window-size-enhancer
// @namespace    https://github.com/ilplrr
// @version      1.0
// @description  Enhance Misskey's inner window
// @author       ilplrr
// @match        https://misskey.io/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const INNER_WINDOW_DEFAULT_HEIGHT = '650px';
    const INNER_WINDOW_DEFAULT_WIDTH = '550px';

    function main(lastH=-1, lastW=-1){
        const targetNode = document.getElementById('misskey_app');
        if (!targetNode) {
            setTimeout(main, 100);
            return;
        }

        const appHeight = targetNode.offsetHeight;
        const appWidth = targetNode.offsetWidth;
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
                    if (elm.tagName === 'DIV' && elm.className === 'xpAOc') {
                        if (elm.querySelector('div.emojis')) continue;

                        // resize
                        elm.style.height = INNER_WINDOW_DEFAULT_HEIGHT;
                        elm.style.width = INNER_WINDOW_DEFAULT_WIDTH;

                        // inner window's top border
                        elm.querySelector('div.x6GRm.xe7xr').addEventListener('dblclick', () => {
                            elm.style.top = '0px';
                            elm.style.height = `${appHeight - 5}px`;
                        });

                        // inner window's bottom border
                        elm.querySelector('div.xnqRB.xe7xr').addEventListener('dblclick', () => {
                            elm.style.height = `${appHeight - elm.offsetTop}px`;
                        });
                    }
                } else if ('attributes') {
                    const elm = mutation.target;
                    if (typeof(elm.className) === 'string' && elm.className.indexOf('xr8AW') > -1 && elm.querySelector('div.emojis')) {
                        // emoji picker window
                        const h = elm.offsetHeight;
                        const w = elm.offsetWidth;
                        const bottom = y + h;
                        const right = x + w / 2;
                        const top = Math.max(0, y - Math.max(0, bottom - appHeight));
                        const left = Math.max(0, x - w / 2 - Math.max(0, right - appWidth));
                        elm.style.top = `${top}px`;
                        elm.style.left = `${left}px`;
                    }
                }
            }
        };

        const observer = new MutationObserver(callback);
        observer.observe(targetNode, { attributes: true, childList: true, subtree: true });
    }
    main()
})();
