// ==UserScript==
// @name         Giggles&Shit (GAS)
// @namespace    https://github.com/
// @version      3.0.0
// @description  Custom image replacement and picker for GitHub comments.
// @author       You
// @match        https://github.com/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// ==/UserScript==

(() => {
    'use strict';

    const GAS_STORAGE_KEY = 'github-gas-v1';

    /*
     * ============================================================
     * GAS CONFIG
     * ============================================================
     *
     * Typing:
     *
     * :crine:
     * :cry:
     * :skull:
     *
     * gets immediately replaced with:
     *
     * <img src="..." width="30px">
     */

    const DEFAULT_GAS = [
        {
            name: 'crine',
            url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRe9fj7QAAJUFGahifMVBeDEEW2RtfzPswTTB4pn_Nn8s8t-eI3_xplxHs&s=10'
        },
        {
            name: 'cry',
            url: 'https://i.pinimg.com/originals/70/e5/c0/70e5c0d856f602642bab27ed530b0ed2.gif'
        },
        {
            name: 'skull',
            url: 'https://preview.redd.it/where-are-my-skull-emojis-v0-afvlslmgt4ve1.jpeg?auto=webp&s=6ee6ed553a3b9bcd574a99782fd84a1aa21df907'
        }
    ];

    let gas = loadGas();

    /*
     * ============================================================
     * STORAGE
     * ============================================================
     */

    function loadGas() {
        try {
            const saved = GM_getValue(GAS_STORAGE_KEY, null);

            if (!saved) {
                return [...DEFAULT_GAS];
            }

            const parsed = JSON.parse(saved);

            if (!Array.isArray(parsed)) {
                return [...DEFAULT_GAS];
            }

            return parsed.filter(entry =>
                entry &&
                typeof entry.name === 'string' &&
                typeof entry.url === 'string' &&
                entry.name.trim() !== '' &&
                entry.url.trim() !== ''
            );
        } catch (error) {
            console.error('[GAS] Failed to load saved GAS:', error);
            return [...DEFAULT_GAS];
        }
    }

    function saveGas() {
        try {
            GM_setValue(
                GAS_STORAGE_KEY,
                JSON.stringify(gas)
            );
        } catch (error) {
            console.error('[GAS] Failed to save GAS:', error);
        }
    }

    /*
     * ============================================================
     * GAS LOOKUP
     * ============================================================
     */

    function getGasMap() {
        const map = new Map();

        for (const entry of gas) {
            if (
                !entry ||
                typeof entry.name !== 'string' ||
                typeof entry.url !== 'string'
            ) {
                continue;
            }

            const trigger = `:${entry.name.trim()}:`;

            map.set(
                trigger.toLowerCase(),
                entry.url.trim()
            );
        }

        return map;
    }

    /*
     * ============================================================
     * HTML HELPERS
     * ============================================================
     */

    function escapeGasAttribute(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function createGasImage(url) {
        return `<img src="${escapeGasAttribute(url)}" width="30px">`;
    }

    /*
     * ============================================================
     * GAS TOKEN REPLACEMENT
     * ============================================================
     */

    function replaceGasTokens(text) {
        const gasMap = getGasMap();

        return text.replace(
            /:[a-zA-Z0-9_+-]+:/g,
            token => {
                const url = gasMap.get(
                    token.toLowerCase()
                );

                if (!url) {
                    return token;
                }

                return createGasImage(url);
            }
        );
    }

    /*
     * ============================================================
     * LIVE GAS REPLACEMENT
     * ============================================================
     *
     * Watches the comment textarea.
     *
     * Example:
     *
     * hello :crine: bro
     *
     * becomes:
     *
     * hello <img src="..." width="30px"> bro
     */

    function setupGasLiveReplacement(textarea) {
        if (
            textarea.dataset.gasLiveReplacement === 'true'
        ) {
            return;
        }

        textarea.dataset.gasLiveReplacement = 'true';

        let previousValue = textarea.value;

        textarea.addEventListener('input', () => {
            const value = textarea.value;

            /*
             * Avoid doing work when the value did not actually
             * grow. This also helps prevent reacting badly to
             * GitHub's own input events.
             */
            if (value.length >= previousValue.length) {
                const cursorStart = textarea.selectionStart ?? value.length;
                const cursorEnd = textarea.selectionEnd ?? cursorStart;

                const beforeCursor =
                    value.slice(0, cursorStart);

                /*
                 * Only look for a complete GAS token immediately
                 * before the cursor.
                 *
                 * Examples:
                 *
                 * :crine|
                 * hello :crine|
                 *
                 * But not:
                 *
                 * :cri|
                 */
                const match = beforeCursor.match(
                    /(^|\s)(:[a-zA-Z0-9_+-]+:)$/i
                );

                if (match) {
                    const token = match[2];

                    const gasMap = getGasMap();

                    const url = gasMap.get(
                        token.toLowerCase()
                    );

                    if (url) {
                        const tokenStart =
                            cursorStart - token.length;

                        const replacement =
                            createGasImage(url);

                        const newValue =
                            value.slice(0, tokenStart) +
                            replacement +
                            value.slice(cursorEnd);

                        textarea.value = newValue;

                        const newCursor =
                            tokenStart + replacement.length;

                        textarea.selectionStart =
                            newCursor;

                        textarea.selectionEnd =
                            newCursor;

                        /*
                         * Make GitHub aware of the new value.
                         */
                        textarea.dispatchEvent(
                            new Event('input', {
                                bubbles: true
                            })
                        );

                        previousValue = newValue;

                        return;
                    }
                }
            }

            previousValue = value;
        });
    }

    /*
     * ============================================================
     * TEXTAREA FINDER
     * ============================================================
     */

    function findGasTextarea(toolbar) {
        const container =
            toolbar.closest('form') ||
            toolbar.closest('.js-write-bucket') ||
            toolbar.parentElement;

        if (!container) {
            return null;
        }

        return container.querySelector(
            'textarea.js-comment-field, textarea[name="comment[body]"]'
        );
    }

    /*
     * ============================================================
     * FIND GITHUB HEADING BUTTON
     * ============================================================
     */

    function findGasHeadingButton(toolbar) {
        const buttons = toolbar.querySelectorAll(
            'button, summary, a, [role="button"]'
        );

        for (const button of buttons) {
            const label = (
                button.getAttribute('aria-label') ||
                button.getAttribute('title') ||
                ''
            ).toLowerCase();

            if (
                label.includes('heading') ||
                label === 'h'
            ) {
                return button;
            }
        }

        return null;
    }

    /*
     * ============================================================
     * GAS TOOLBAR BUTTON
     * ============================================================
     */

    function createGasToolbarButton(toolbar) {
        if (
            toolbar.querySelector(
                '[data-gas-toolbar-button]'
            )
        ) {
            return;
        }

        const textarea = findGasTextarea(toolbar);

        if (!textarea) {
            return;
        }

        setupGasLiveReplacement(textarea);

        const button = document.createElement('button');

        button.type = 'button';

        button.className =
            'gas-toolbar-button Button Button--iconOnly Button--invisible';

        button.dataset.gasToolbarButton = 'true';

        button.setAttribute(
            'aria-label',
            'Giggles&Shit'
        );

        button.setAttribute(
            'title',
            'Giggles&Shit'
        );

        /*
         * Use the first configured GAS image as the button icon.
         * Falls back to a simple text icon when the list is empty.
         */
        if (gas.length > 0) {
            const icon = document.createElement('img');

            icon.src = gas[0].url;
            icon.alt = '';
            icon.draggable = false;

            button.appendChild(icon);
        } else {
            button.textContent = 'G';
        }

        button.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();

            toggleGasPicker(
                toolbar,
                button,
                textarea
            );
        });

        /*
         * Put GAS immediately BEFORE GitHub's H button.
         */
        const headingButton =
            findGasHeadingButton(toolbar);

        if (
            headingButton &&
            headingButton.parentNode
        ) {
            headingButton.parentNode.insertBefore(
                button,
                headingButton
            );
        } else {
            toolbar.appendChild(button);
        }
    }

    /*
     * ============================================================
     * GAS PICKER
     * ============================================================
     */

    function toggleGasPicker(
        toolbar,
        button,
        textarea
    ) {
        const existing =
            document.querySelector(
                '.gas-picker'
            );

        if (existing) {
            existing.remove();
            return;
        }

        document
            .querySelectorAll('.gas-picker')
            .forEach(picker => picker.remove());

        const picker = createGasPicker(
            toolbar,
            button,
            textarea
        );

        document.body.appendChild(picker);

        /*
         * Position picker below the GAS button.
         */
        const buttonRect =
            button.getBoundingClientRect();

        const pickerRect =
            picker.getBoundingClientRect();

        let left = buttonRect.left;
        let top = buttonRect.bottom + 6;

        if (
            left + pickerRect.width >
            window.innerWidth - 10
        ) {
            left =
                window.innerWidth -
                pickerRect.width -
                10;
        }

        if (
            top + pickerRect.height >
            window.innerHeight - 10
        ) {
            top =
                buttonRect.top -
                pickerRect.height -
                6;
        }

        picker.style.left =
            `${Math.max(10, left)}px`;

        picker.style.top =
            `${Math.max(10, top)}px`;

        /*
         * Outside click closes picker.
         */
        setTimeout(() => {
            const closeHandler = event => {
                if (
                    !picker.contains(event.target) &&
                    event.target !== button &&
                    !button.contains(event.target)
                ) {
                    picker.remove();

                    document.removeEventListener(
                        'mousedown',
                        closeHandler,
                        true
                    );
                }
            };

            document.addEventListener(
                'mousedown',
                closeHandler,
                true
            );
        }, 0);
    }

    function createGasPicker(
        toolbar,
        button,
        textarea
    ) {
        const picker =
            document.createElement('div');

        picker.className =
            'gas-picker';

        /*
         * Prevent GitHub from interpreting picker clicks
         * as toolbar interactions.
         */
        picker.addEventListener(
            'mousedown',
            event => {
                event.stopPropagation();
            }
        );

        /*
         * --------------------------------------------------------
         * Header
         * --------------------------------------------------------
         */

        const header =
            document.createElement('div');

        header.className =
            'gas-picker-header';

        const title =
            document.createElement('strong');

        title.textContent =
            'Giggles&Shit';

        header.appendChild(title);

        picker.appendChild(header);

        /*
         * --------------------------------------------------------
         * Grid
         * --------------------------------------------------------
         */

        const grid =
            document.createElement('div');

        grid.className =
            'gas-picker-grid';

        if (gas.length === 0) {
            const empty =
                document.createElement('div');

            empty.className =
                'gas-picker-empty';

            empty.textContent =
                'No GAS entries yet.';

            grid.appendChild(empty);
        }

        for (let index = 0; index < gas.length; index++) {
            const entry = gas[index];

            const item =
                document.createElement('button');

            item.type = 'button';

            item.className =
                'gas-picker-item';

            item.title =
                `:${entry.name}:`;

            const image =
                document.createElement('img');

            image.src =
                entry.url;

            image.alt =
                entry.name;

            image.loading =
                'lazy';

            image.draggable =
                false;

            item.appendChild(image);

            /*
             * Clicking inserts the trigger into the textarea.
             * The normal GAS live replacer then converts it
             * into the image immediately.
             */
            item.addEventListener(
                'click',
                () => {
                    insertGasText(
                        textarea,
                        `:${entry.name}:`
                    );

                    picker.remove();
                }
            );

            grid.appendChild(item);
        }

        picker.appendChild(grid);

        /*
         * --------------------------------------------------------
         * Add GAS
         * --------------------------------------------------------
         */

        const addButton =
            document.createElement('button');

        addButton.type =
            'button';

        addButton.className =
            'gas-add-button';

        addButton.textContent =
            '+ Add GAS';

        addButton.addEventListener(
            'click',
            () => {
                const name =
                    prompt(
                        'GAS trigger name:',
                        'crine'
                    );

                if (!name) {
                    return;
                }

                const cleanName =
                    name
                        .trim()
                        .replace(/^:+|:+$/g, '');

                if (!cleanName) {
                    return;
                }

                const url =
                    prompt(
                        'GAS image URL:'
                    );

                if (!url) {
                    return;
                }

                const cleanUrl =
                    url.trim();

                try {
                    new URL(cleanUrl);
                } catch {
                    alert(
                        'That is not a valid URL.'
                    );

                    return;
                }

                /*
                 * Avoid duplicate names.
                 */
                const exists =
                    gas.some(entry =>
                        entry.name.toLowerCase() ===
                        cleanName.toLowerCase()
                    );

                if (exists) {
                    alert(
                        `GAS ":${cleanName}:" already exists.`
                    );

                    return;
                }

                gas.push({
                    name: cleanName,
                    url: cleanUrl
                });

                saveGas();

                picker.remove();

                /*
                 * Re-open to show the new GAS entry.
                 */
                toggleGasPicker(
                    toolbar,
                    button,
                    textarea
                );
            }
        );

        picker.appendChild(
            addButton
        );

        /*
         * --------------------------------------------------------
         * Remove GAS
         * --------------------------------------------------------
         */

        const removeButton =
            document.createElement('button');

        removeButton.type =
            'button';

        removeButton.className =
            'gas-remove-button';

        removeButton.textContent =
            '− Remove GAS';

        removeButton.addEventListener(
            'click',
            () => {
                if (gas.length === 0) {
                    return;
                }

                const names =
                    gas
                        .map(entry =>
                            `:${entry.name}:`
                        )
                        .join('\n');

                const selected =
                    prompt(
                        `Enter the GAS trigger to remove:\n\n${names}`
                    );

                if (!selected) {
                    return;
                }

                const cleanSelected =
                    selected
                        .trim()
                        .replace(/^:+|:+$/g, '')
                        .toLowerCase();

                const index =
                    gas.findIndex(
                        entry =>
                            entry.name.toLowerCase() ===
                            cleanSelected
                    );

                if (index === -1) {
                    alert(
                        'That GAS entry was not found.'
                    );

                    return;
                }

                gas.splice(
                    index,
                    1
                );

                saveGas();

                picker.remove();

                toggleGasPicker(
                    toolbar,
                    button,
                    textarea
                );
            }
        );

        picker.appendChild(
            removeButton
        );

        return picker;
    }

    /*
     * ============================================================
     * INSERT TEXT
     * ============================================================
     */

    function insertGasText(
        textarea,
        text
    ) {
        textarea.focus();

        const start =
            textarea.selectionStart ??
            textarea.value.length;

        const end =
            textarea.selectionEnd ??
            textarea.value.length;

        const before =
            textarea.value.slice(
                0,
                start
            );

        const after =
            textarea.value.slice(
                end
            );

        const newValue =
            before +
            text +
            after;

        textarea.value =
            newValue;

        const cursor =
            start + text.length;

        textarea.selectionStart =
            cursor;

        textarea.selectionEnd =
            cursor;

        textarea.dispatchEvent(
            new Event(
                'input',
                {
                    bubbles: true
                }
            )
        );
    }

    /*
     * ============================================================
     * STYLES
     * ============================================================
     */

    GM_addStyle(`
        .gas-toolbar-button {
            position: relative;
        }

        .gas-toolbar-button img {
            width: 16px;
            height: 16px;

            object-fit: contain;

            pointer-events: none;
        }

        .gas-picker {
            position: fixed;

            z-index: 999999;

            width: 350px;

            max-height: 430px;

            display: flex;

            flex-direction: column;

            background:
                var(
                    --bgColor-default,
                    #ffffff
                );

            border:
                1px solid
                var(
                    --borderColor-default,
                    #d0d7de
                );

            border-radius: 8px;

            box-shadow:
                0 8px 24px
                rgba(140,149,159,.2);

            overflow: hidden;

            font-family:
                -apple-system,
                BlinkMacSystemFont,
                "Segoe UI",
                sans-serif;
        }

        .gas-picker-header {
            padding: 10px;

            border-bottom:
                1px solid
                var(
                    --borderColor-muted,
                    #d8dee4
                );

            color:
                var(
                    --fgColor-default,
                    #1f2328
                );

            font-size: 13px;
        }

        .gas-picker-grid {
            display: grid;

            grid-template-columns:
                repeat(6, 1fr);

            gap: 5px;

            padding: 10px;

            max-height: 320px;

            overflow-y: auto;
        }

        .gas-picker-item {
            appearance: none;

            display: flex;

            align-items: center;
            justify-content: center;

            width: 100%;

            aspect-ratio: 1;

            padding: 5px;

            border: 0;

            border-radius: 6px;

            background: transparent;

            cursor: pointer;
        }

        .gas-picker-item:hover {
            background:
                var(
                    --bgColor-neutral-muted,
                    #f6f8fa
                );
        }

        .gas-picker-item img {
            width: 42px;
            height: 42px;

            object-fit: contain;

            pointer-events: none;
        }

        .gas-picker-empty {
            grid-column:
                1 / -1;

            padding: 30px 10px;

            text-align: center;

            color:
                var(
                    --fgColor-muted,
                    #656d76
                );

            font-size: 13px;
        }

        .gas-add-button,
        .gas-remove-button {
            appearance: none;

            width: 100%;

            padding: 8px;

            border: 0;

            border-top:
                1px solid
                var(
                    --borderColor-muted,
                    #d8dee4
                );

            background: transparent;

            color:
                var(
                    --fgColor-default,
                    #1f2328
                );

            cursor: pointer;

            font-size: 12px;
        }

        .gas-add-button:hover,
        .gas-remove-button:hover {
            background:
                var(
                    --bgColor-neutral-muted,
                    #f6f8fa
                );
        }

        .gas-remove-button {
            color:
                var(
                    --fgColor-danger,
                    #cf222e
                );
        }

        @media (prefers-color-scheme: dark) {
            .gas-picker {
                background: #0d1117;

                border-color:
                    #30363d;
            }
        }
    `);

    /*
     * ============================================================
     * GITHUB TOOLBAR SCANNING
     * ============================================================
     *
     * GitHub is an SPA, so comment editors can appear later.
     */

    function scanGasToolbars() {
        document
            .querySelectorAll(
                'markdown-toolbar, [role="toolbar"]'
            )
            .forEach(
                toolbar => {
                    createGasToolbarButton(
                        toolbar
                    );
                }
            );
    }

    const gasObserver =
        new MutationObserver(() => {
            scanGasToolbars();
        });

    function startGas() {
        scanGasToolbars();

        gasObserver.observe(
            document.documentElement,
            {
                childList: true,
                subtree: true
            }
        );
    }

    if (
        document.readyState ===
        'loading'
    ) {
        document.addEventListener(
            'DOMContentLoaded',
            startGas,
            {
                once: true
            }
        );
    } else {
        startGas();
    }

})();
