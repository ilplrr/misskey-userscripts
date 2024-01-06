// ==UserScript==
// @name         make-deck-column-height-resizable
// @namespace    http://tampermonkey.net/
// @version      0.1.3
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
    sections: 'xrNPB',
    section: 'xAOWy',
    column: 'xnksy',
    columnActive: 'xeiRC',
  };

  const separatorClassName = `${GM.info.script.name}--separator`;

  const columnObserver = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      const section = mutation.target.parentElement;
      const activeColumns = section.querySelectorAll(`.${miClassNames.columnActive}`);
      const flexGrowSum = [...activeColumns].reduce((res, e) => res + (Number(e.style.flexGrow) || 1), 0);
      if (flexGrowSum > 0 && flexGrowSum < 1) {
        // active な column の flex-grow の総和が 1 未満にならないようにする。1 未満になると grow してくれないため。
        for (const column of section.querySelectorAll(`.${miClassNames.column}`)) {
          column.style.flexGrow = (Number(column.style.flexGrow) || 1) / flexGrowSum;
        }
      }
    }
  });

  const makeColumnHeightResizable = (section) => {
    section.querySelectorAll(`.${separatorClassName}`).forEach((e) => e.remove());
    const columns = section.children;

    let targetSeparator = null;

    let first = true;
    [...columns].forEach((column) => {
      if (column.classList.contains(separatorClassName)) return;

      columnObserver.observe(column, { attributes: true, attributeFilter: ['class'] });

      if (first) return (first = false);

      const separator = document.createElement('div');
      separator.classList.add(separatorClassName);
      // sep.style.backgroundColor = `hsl(${new Date().getSeconds() * 6} 100% 80%)`;
      section.insertBefore(separator, column);

      separator.onmousedown = (event) => {
        targetSeparator = event.target;
        section.style.userSelect = 'none';

        section.onmousemove = (ev) => {
          if (!ev.buttons) {
            section.style.userSelect = null;
            section.onmousemove = null;
            targetSeparator = null;
            return;
          }
          if (!targetSeparator) return;

          const findActiveStack = (propName) => {
            let elm = targetSeparator[propName];
            while (elm && !elm.classList.contains(miClassNames.columnActive)) {
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

          const max = 100000;
          const columns = [...section.children].filter((e) => e.classList.contains(miClassNames.column));
          const flexGrowSum = columns.reduce((res, e) => res + (Number(e.style.flexGrow) || 1), 0);
          if (flexGrowSum > max) {
            for (const column of columns) {
              column.style.flexGrow = ((Number(column.style.flexGrow) || 1) * max) / flexGrowSum;
            }
          }
        };
      };
      separator.onmouseup = () => {
        section.style.userSelect = null;
        targetSeparator = null;
        section.onmousemove = null;
      };
    });
  };

  const makeColumnsHeightResizable = () => {
    columnsElm.querySelectorAll(`section.${miClassNames.section}`).forEach((section) => {
      makeColumnHeightResizable(section);
      new MutationObserver((muationsList) => {
        for (const mutation of muationsList) {
          const columnAddedOrRemoved = [...mutation.addedNodes, ...mutation.removedNodes].some((node) =>
            node.classList.contains(miClassNames.column),
          );
          if (columnAddedOrRemoved) makeColumnHeightResizable(section);
        }
      }).observe(section, { childList: true, attributes: true });
    });
  };

  const waitColumnsDisplayed = new Promise((resolve) => {
    const f = () => {
      const columnsElm = app.querySelector(`div.${miClassNames.sections}`);
      columnsElm ? resolve(columnsElm) : setTimeout(f, 100);
    };
    f();
  });
  const columnsElm = await waitColumnsDisplayed;

  (() => {
    const styleClassName = `${GM.info.script.name}--style`;
    const style = document.querySelector(`.${styleClassName}`) || document.createElement('style');
    style.textContent = `
      .${miClassNames.column} {
        margin-bottom: 0 !important;
        min-height: var(--deckColumnHeaderHeight)
      }
      .${miClassNames.column}:not(.${miClassNames.columnActive}) {
        flex-grow: 0 !important;
      }
      .${miClassNames.column}.${miClassNames.columnActive} {
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

  new MutationObserver(makeColumnsHeightResizable).observe(columnsElm, { childList: true });
  makeColumnsHeightResizable();
})();
