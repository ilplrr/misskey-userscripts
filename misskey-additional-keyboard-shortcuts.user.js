// ==UserScript==
// @name         misskey-additional-keyboard-shortcuts
// @namespace    http://tampermonkey.net/
// @version      2024-08-07
// @description  try to take over the world!
// @author       You
// @match        https://misskey.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=misskey.io
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const UNIVERSAL_UI_CLASS_NAME = 'xEN98';

  function genShortcutHandler(path) {
    return () => {
      if (!document.querySelector(`.${UNIVERSAL_UI_CLASS_NAME}`)) return;

      const el = document.querySelector(`.x6KaV[href="${path}"]`);
      if (el) el.click();
      else location.pathname = path;
    };
  }

  const keyHistory = [];
  const shortcuts = {
    gh: genShortcutHandler('/'),
    gp: () => {
      const userName = document.querySelector('.x6tH3.xyRmg.xwq2R')?.title;
      genShortcutHandler(`/@${userName}`)();
    },
    gn: genShortcutHandler('/my/notifications'),
  };

  function keydownHandler(event) {
    const targetTagName = event.target.tagName.toLowerCase();
    if (targetTagName === 'input' || targetTagName === 'textarea') {
      return;
    }

    keyHistory.push(event.key);
    if (keyHistory.length > 2) {
      keyHistory.shift();
    }

    const keyString = keyHistory.join('');
    if (shortcuts[keyString]) {
      event.preventDefault();
      event.stopPropagation();

      shortcuts[keyString]();
      keyHistory.splice(0); // clear keyHistory.

      let id = null;
      const closePostForm = () => {
        const el = document.querySelector('.xjSpm');
        if (!el) return;

        el.click();
        if (id) {
          clearInterval(id);
          id = null;
        }
      };
      id = setInterval(closePostForm, 10);
      setInterval(() => clearInterval(id), 2000);
    }
  }

  document.addEventListener('keydown', keydownHandler);
})();
