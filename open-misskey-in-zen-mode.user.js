// ==UserScript==
// @name         open-misskey-in-zen-mode
// @namespace    https://github.com/
// @version      1.0
// @description  Open misskey page in zen mode.
// @author       ilplrr
// @match        https://misskey.io/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    if (location.href.match(new RegExp(location.origin + '/?$'))) return;
    if (location.href.match(/\?zen$/)) return;

    if (confirm('Zenモードで開きますか？')) location.replace(location.href + '?zen');
})();