// ==UserScript==
// @name         make-deck-column-height-resizable
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  try to take over the world!
// @author       You
// @match        https://misskey.io/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=misskey.io
// @grant        none
// ==/UserScript==

(async () => {
  'use strict';

  const waitAppDisplayed = new Promise((resolve) => {
    const f = () => {
      const app = document.getElementById('misskey_app');
      app ? resolve(app) : setTimeout(f, 100);
    };
    f();
  });
  const app = await waitAppDisplayed;

  const miClassNames = {
    columnsElm: 'xrNPB',
    column: 'xAOWy',
    stackActive: 'xeiRC',
  };

  const separatorClassName = `${GM.info.script.name}--separator`;
  (() => {
    const styleClassName = `${GM.info.script.name}--style`;
    const style = document.querySelector(`.${styleClassName}`) || document.createElement('style');
    style.textContent = `
      .xnksy.xa96n {
        margin-bottom: 0 !important;
        min-height: var(--deckColumnHeaderHeight)
      }
      .xnksy.xa96n:not(.${miClassNames.stackActive}) {
        flex-grow: 0 !important;
      }
      .xnksy.xa96n.${miClassNames.stackActive} {
        flex: 1 1 0;
      }

      .${separatorClassName} {
        cursor: row-resize;
        height: var(--columnGap);
        max-height: var(--columnGap);
        userSelect: none;
      }
    `;
    style.classList.add(styleClassName);
    document.body.appendChild(style);
  })();

  const makeColumnsHeightResizable = () => {
    columnsElm.querySelectorAll(`section.${miClassNames.column}`).forEach((column) => {
      column.querySelectorAll(`.${separatorClassName}`).forEach((e) => e.remove());
      const stacks = column.children;

      let targetSeparator = null;

      let first = true;
      [...stacks].forEach((stack) => {
        if (stack.classList.contains(separatorClassName)) return;
        if (first) return (first = false);

        const sep = document.createElement('div');
        sep.classList.add(separatorClassName);
        // sep.style.backgroundColor = `hsl(${new Date().getSeconds() * 6} 100% 80%)`;
        column.insertBefore(sep, stack);

        sep.onmousedown = (event) => {
          targetSeparator = event.target;
          column.style.userSelect = 'none';

          column.onmousemove = (ev) => {
            if (!ev.buttons) {
              column.style.userSelect = null;
              column.onmousemove = null;
              targetSeparator = null;
              return;
            }
            if (!targetSeparator) return;

            const findActiveStack = (propName) => {
              let elm = targetSeparator[propName];
              while (elm && !elm.classList.contains(miClassNames.stackActive)) {
                elm = elm[propName];
              }
              return elm;
            };
            const a = findActiveStack('previousElementSibling');
            const b = findActiveStack('nextElementSibling');
            if (!a || !b) return;

            const rectA = a.getBoundingClientRect();
            const rectB = b.getBoundingClientRect();
            // console.log('ra,rb', ra, rb);

            const top = rectA.top;
            const bottom = rectB.bottom;
            const height = bottom - top;
            const cur = ev.clientY;
            // console.log('t,c,b,h', top, cur, bottom, height);

            const weightA = Math.abs(cur - top) / height;
            const weightB = Math.abs(cur - bottom) / height;
            // console.log('weightA,weightB', weightA, weightB);

            const origFlexGrowA = Number(a.style.flexGrow) || Number(window.getComputedStyle(a).flexGrow) || 1;
            const origFlexGrowB = Number(b.style.flexGrow) || Number(window.getComputedStyle(b).flexGrow) || 1;
            const flexGrowTotal = origFlexGrowA + origFlexGrowB;
            // console.log('flex-grow(orig): a,b,total', origFlexGrowA, origFlexGrowB, flexGrowToal);

            const flexGrowA = weightA * flexGrowTotal;
            const flexGrowB = weightB * flexGrowTotal;
            a.style.flexGrow = flexGrowA;
            b.style.flexGrow = flexGrowB;
            // console.log('flex-grow:a,b,sum', flexGrowA, flexGrowB, flexGrowB + flexGrowA);
          };
        };
        sep.onmouseup = () => {
          column.style.userSelect = null;
          targetSeparator = null;
          column.onmousemove = null;
        };
      });
    });
  };

  const waitColumnsDisplayed = new Promise((resolve) => {
    const f = () => {
      const columnsElm = app.querySelector(`div.${miClassNames.columnsElm}`);
      columnsElm ? resolve(columnsElm) : setTimeout(f, 100);
    };
    f();
  });
  const columnsElm = await waitColumnsDisplayed;

  new MutationObserver(makeColumnsHeightResizable).observe(columnsElm, { childList: true });
  makeColumnsHeightResizable();
})();
