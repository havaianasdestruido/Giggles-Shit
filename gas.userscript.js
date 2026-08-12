// ==UserScript==
// @name         Giggles&Shit (GAS)
// @namespace    https://github.com/havaianasdestruido/Giggles-Shit
// @version      2.2.0
// @description  Giggles&Shit emoji/image picker for GitHub
// @author       havaianasdestruido
// @match        https://github.com/*
// @icon         https://raw.githubusercontent.com/havaianasdestruido/Giggles-Shit/refs/heads/main/res/img/trollge.jpg
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(() => {
    'use strict';

    // ============================================================
    // CONFIG
    // ============================================================

    const GAS_VERSION = '2.2.0';

    const REPO_URL =
        'https://github.com/havaianasdestruido/Giggles-Shit/issues/new';

    const DEFAULT_GAS = [
        {
            name: 'bulleh',
            url: 'https://raw.githubusercontent.com/havaianasdestruido/Giggles-Shit/refs/heads/main/res/img/bulleh.jpg'
        },
        {
            name: 'crine',
            url: 'https://raw.githubusercontent.com/havaianasdestruido/Giggles-Shit/refs/heads/main/res/img/crine.jpg'
        },
        {
            name: 'rose',
            url: 'https://raw.githubusercontent.com/havaianasdestruido/Giggles-Shit/refs/heads/main/res/img/rose.jpg'
        },
        {
            name: 'skull',
            url: 'https://raw.githubusercontent.com/havaianasdestruido/Giggles-Shit/refs/heads/main/res/img/skull.jpg'
        },
        {
            name: 'trollge',
            url: 'https://raw.githubusercontent.com/havaianasdestruido/Giggles-Shit/refs/heads/main/res/img/trollge.jpg'
        }
    ];

    // ============================================================
    // STATE
    // ============================================================

    const state = {
        editors: new Set(),
        buttons: new Set(),
        activeEditor: null,
        picker: null,
        observer: null,
        scanTimer: null,
        initialized: false
    };

    // ============================================================
    // LOGGING
    // ============================================================

    function log(...args) {
        console.log(
            '%c[GAS]%c',
            'font-weight:bold;color:#f85149',
            'font-weight:normal',
            ...args
        );
    }

    function warn(...args) {
        console.warn(
            '%c[GAS]%c',
            'font-weight:bold;color:#d29922',
            'font-weight:normal',
            ...args
        );
    }

    function error(...args) {
        console.error(
            '%c[GAS]%c',
            'font-weight:bold;color:#ff7b72',
            'font-weight:normal',
            ...args
        );
    }

    // ============================================================
    // STYLES
    // ============================================================

    function installStyles() {
        if (document.getElementById('gas-styles')) {
            return;
        }

        const style = document.createElement('style');

        style.id = 'gas-styles';

        style.textContent = `
            /* ==================================================
               GAS TOOLBAR BUTTON
               ================================================== */

            .gas-toolbar-button {
                appearance: none;
                border: 0;
                background: transparent;
                color: var(--fgColor-default, #f0f6fc);

                width: 32px;
                height: 32px;

                padding: 5px;
                margin: 0;

                border-radius: 6px;
                cursor: pointer;

                display: inline-flex;
                align-items: center;
                justify-content: center;

                transition:
                    background-color 0.12s ease,
                    transform 0.12s ease;
            }

            .gas-toolbar-button:hover {
                background:
                    var(
                        --bgColor-neutral-muted,
                        rgba(177,186,196,.12)
                    );
            }

            .gas-toolbar-button:active {
                transform: scale(.92);
            }

            .gas-toolbar-button img {
                width: 20px;
                height: 20px;

                object-fit: cover;

                border-radius: 4px;

                pointer-events: none;
            }

            /* ==================================================
               PICKER
               ================================================== */

            .gas-picker {
                position: fixed;

                z-index: 2147483647;

                width: min(
                    360px,
                    calc(100vw - 24px)
                );

                max-height: min(
                    430px,
                    calc(100vh - 24px)
                );

                padding: 10px;

                background:
                    var(
                        --bgColor-default,
                        #0d1117
                    );

                color:
                    var(
                        --fgColor-default,
                        #f0f6fc
                    );

                border:
                    1px solid
                    var(
                        --borderColor-default,
                        #30363d
                    );

                border-radius: 12px;

                box-shadow:
                    0 8px 24px rgba(0,0,0,.35),
                    0 2px 8px rgba(0,0,0,.2);

                overflow: auto;

                font-family:
                    -apple-system,
                    BlinkMacSystemFont,
                    "Segoe UI",
                    sans-serif;

                display: none;

                animation:
                    gas-picker-in
                    .12s
                    ease-out;
            }

            @keyframes gas-picker-in {
                from {
                    opacity: 0;
                    transform:
                        translateY(-4px)
                        scale(.98);
                }

                to {
                    opacity: 1;
                    transform:
                        translateY(0)
                        scale(1);
                }
            }

            .gas-picker-header {
                display: flex;
                align-items: center;
                justify-content: space-between;

                padding:
                    4px
                    4px
                    10px;

                margin-bottom: 4px;

                border-bottom:
                    1px solid
                    var(
                        --borderColor-muted,
                        #21262d
                    );
            }

            .gas-picker-title {
                font-size: 13px;
                font-weight: 600;
            }

            .gas-picker-subtitle {
                margin-top: 2px;

                font-size: 11px;

                opacity: .6;
            }

            .gas-picker-close {
                appearance: none;

                border: 0;

                background: transparent;

                width: 28px;
                height: 28px;

                color: inherit;

                cursor: pointer;

                border-radius: 6px;

                font-size: 18px;
                line-height: 1;
            }

            .gas-picker-close:hover {
                background:
                    var(
                        --bgColor-neutral-muted,
                        rgba(177,186,196,.12)
                    );
            }

            .gas-grid {
                display: grid;

                grid-template-columns:
                    repeat(
                        auto-fill,
                        minmax(72px, 1fr)
                    );

                gap: 7px;
            }

            .gas-item {
                appearance: none;

                min-width: 0;

                padding: 6px;

                border:
                    1px solid
                    var(
                        --borderColor-default,
                        #30363d
                    );

                background:
                    var(
                        --bgColor-neutral-muted,
                        rgba(177,186,196,.05)
                    );

                color: inherit;

                border-radius: 8px;

                cursor: pointer;

                display: flex;
                flex-direction: column;

                align-items: center;

                gap: 5px;

                transition:
                    background-color .12s ease,
                    border-color .12s ease,
                    transform .12s ease;
            }

            .gas-item:hover {
                background:
                    var(
                        --bgColor-neutral-muted,
                        rgba(177,186,196,.12)
                    );

                border-color:
                    var(
                        --borderColor-accent-emphasis,
                        #58a6ff
                    );

                transform:
                    translateY(-1px);
            }

            .gas-item:active {
                transform:
                    scale(.95);
            }

            .gas-item img {
                width: 54px;
                height: 54px;

                object-fit: cover;

                border-radius: 6px;

                background: #161b22;

                display: block;
            }

            .gas-item-name {
                max-width: 100%;

                overflow: hidden;

                text-overflow: ellipsis;

                white-space: nowrap;

                font-size: 11px;

                font-weight: 500;
            }

            .gas-item-code {
                max-width: 100%;

                overflow: hidden;

                text-overflow: ellipsis;

                white-space: nowrap;

                font-size: 9px;

                opacity: .5;
            }

            /* ==================================================
               TOAST
               ================================================== */

            .gas-toast {
                position: fixed;

                left: 50%;
                bottom: 24px;

                z-index: 2147483647;

                transform:
                    translateX(-50%);

                padding:
                    8px
                    12px;

                background:
                    var(
                        --bgColor-neutral-emphasis-plus,
                        #21262d
                    );

                color:
                    var(
                        --fgColor-onEmphasis,
                        #ffffff
                    );

                border-radius: 7px;

                font-size: 12px;

                font-weight: 500;

                box-shadow:
                    0 5px 18px
                    rgba(0,0,0,.3);

                pointer-events: none;

                animation:
                    gas-toast-in
                    .12s
                    ease-out;
            }

            @keyframes gas-toast-in {
                from {
                    opacity: 0;

                    transform:
                        translateX(-50%)
                        translateY(5px);
                }

                to {
                    opacity: 1;

                    transform:
                        translateX(-50%)
                        translateY(0);
                }
            }
        `;

        document.head.appendChild(style);

        log('Styles installed.');
    }

    // ============================================================
    // UTILITIES
    // ============================================================

    function isVisible(element) {
        if (!element) {
            return false;
        }

        const rect =
            element.getBoundingClientRect();

        const computed =
            getComputedStyle(element);

        return (
            rect.width > 0 &&
            rect.height > 0 &&
            computed.display !== 'none' &&
            computed.visibility !== 'hidden'
        );
    }

    function isEditor(element) {
        if (!(element instanceof HTMLElement)) {
            return false;
        }

        if (
            element.tagName === 'TEXTAREA'
        ) {
            const placeholder =
                element.getAttribute(
                    'placeholder'
                ) || '';

            const ariaLabel =
                element.getAttribute(
                    'aria-label'
                ) || '';

            const name =
                element.getAttribute(
                    'name'
                ) || '';

            return (
                /description/i.test(
                    placeholder
                ) ||
                /markdown/i.test(
                    ariaLabel
                ) ||
                /description/i.test(
                    name
                )
            );
        }

        return element.isContentEditable;
    }

    // ============================================================
    // EDITOR VALUE HANDLING
    // ============================================================

    function setTextareaValue(
        textarea,
        value
    ) {
        const prototype =
            Object.getPrototypeOf(
                textarea
            );

        const descriptor =
            Object.getOwnPropertyDescriptor(
                prototype,
                'value'
            );

        if (
            descriptor &&
            descriptor.set
        ) {
            descriptor.set.call(
                textarea,
                value
            );
        } else {
            textarea.value = value;
        }

        textarea.dispatchEvent(
            new Event(
                'input',
                {
                    bubbles: true,
                    composed: true
                }
            )
        );

        textarea.dispatchEvent(
            new Event(
                'change',
                {
                    bubbles: true,
                    composed: true
                }
            )
        );
    }

    // ============================================================
    // HTML IMAGE
    // ============================================================

    function createImageHTML(gas) {
        return `<img src="${gas.url}" alt="${gas.name}" width="20px">`;
    }

    // ============================================================
    // INSERT IMAGE
    // ============================================================

    function insertIntoTextarea(
        editor,
        html
    ) {
        const start =
            typeof editor.selectionStart === 'number'
                ? editor.selectionStart
                : editor.value.length;

        const end =
            typeof editor.selectionEnd === 'number'
                ? editor.selectionEnd
                : editor.value.length;

        const currentValue =
            editor.value;

        const newValue =
            currentValue.slice(
                0,
                start
            ) +
            html +
            currentValue.slice(
                end
            );

        setTextareaValue(
            editor,
            newValue
        );

        const cursor =
            start + html.length;

        try {
            editor.setSelectionRange(
                cursor,
                cursor
            );
        } catch (_) {}

        editor.focus();
    }

    function insertIntoContentEditable(
        editor,
        gas
    ) {
        editor.focus();

        const selection =
            window.getSelection();

        const image =
            document.createElement(
                'img'
            );

        image.src = gas.url;
        image.alt = gas.name;
        image.setAttribute(
            'width',
            '20px'
        );

        if (
            !selection ||
            selection.rangeCount === 0
        ) {
            editor.appendChild(
                image
            );

            editor.dispatchEvent(
                new InputEvent(
                    'input',
                    {
                        bubbles: true,
                        inputType:
                            'insertElement'
                    }
                )
            );

            return;
        }

        const range =
            selection.getRangeAt(0);

        range.deleteContents();

        range.insertNode(
            image
        );

        range.setStartAfter(
            image
        );

        range.collapse(
            true
        );

        selection.removeAllRanges();

        selection.addRange(
            range
        );

        editor.dispatchEvent(
            new InputEvent(
                'input',
                {
                    bubbles: true,
                    inputType:
                        'insertElement'
                }
            )
        );
    }

    // ============================================================
    // INSERT GAS
    // ============================================================

    function insertGAS(
        editor,
        gas
    ) {
        if (!editor) {
            warn(
                'No active editor.'
            );

            return;
        }

        const html =
            createImageHTML(gas);

        /*
         * GitHub's issue description editor
         * is currently a textarea, so the HTML
         * is inserted literally into its value.
         *
         * For contenteditable editors we insert
         * a real <img> DOM element.
         */

        if (
            editor instanceof
            HTMLTextAreaElement
        ) {
            insertIntoTextarea(
                editor,
                html
            );
        } else if (
            editor.isContentEditable
        ) {
            insertIntoContentEditable(
                editor,
                gas
            );
        } else {
            warn(
                'Unsupported editor:',
                editor
            );

            return;
        }

        showToast(
            `Inserted ${gas.name}`
        );

        log(
            `Inserted GAS "${gas.name}".`
        );

        closePicker();
    }

    // ============================================================
    // TOAST
    // ============================================================

    let toastTimer = null;

    function showToast(
        message
    ) {
        const old =
            document.querySelector(
                '.gas-toast'
            );

        if (old) {
            old.remove();
        }

        const toast =
            document.createElement(
                'div'
            );

        toast.className =
            'gas-toast';

        toast.textContent =
            message;

        document.body.appendChild(
            toast
        );

        clearTimeout(
            toastTimer
        );

        toastTimer =
            setTimeout(
                () => {
                    toast.remove();
                },
                1400
            );
    }

    // ============================================================
    // PICKER
    // ============================================================

    function createPicker() {
        if (state.picker) {
            return state.picker;
        }

        const picker =
            document.createElement(
                'div'
            );

        picker.className =
            'gas-picker';

        picker.innerHTML = `
            <div class="gas-picker-header">
                <div>
                    <div class="gas-picker-title">
                        Giggles&Shit
                    </div>

                    <div class="gas-picker-subtitle">
                        Choose a GAS image
                    </div>
                </div>

                <button
                    type="button"
                    class="gas-picker-close"
                    aria-label="Close GAS picker"
                >
                    ×
                </button>
            </div>

            <div class="gas-grid"></div>
        `;

        const grid =
            picker.querySelector(
                '.gas-grid'
            );

        for (
            const gas of DEFAULT_GAS
        ) {
            const item =
                document.createElement(
                    'button'
                );

            item.type =
                'button';

            item.className =
                'gas-item';

            item.title =
                `Insert ${gas.name}`;

            item.setAttribute(
                'aria-label',
                `Insert ${gas.name}`
            );

            const image =
                document.createElement(
                    'img'
                );

            image.src =
                gas.url;

            image.alt =
                gas.name;

            image.loading =
                'lazy';

            image.addEventListener(
                'error',
                () => {
                    image.style.opacity =
                        '0.35';
                }
            );

            const name =
                document.createElement(
                    'div'
                );

            name.className =
                'gas-item-name';

            name.textContent =
                gas.name;

            const code =
                document.createElement(
                    'div'
                );

            code.className =
                'gas-item-code';

            code.textContent =
                `<img width="20px">`;

            item.appendChild(
                image
            );

            item.appendChild(
                name
            );

            item.appendChild(
                code
            );

            item.addEventListener(
                'click',
                event => {
                    event.preventDefault();
                    event.stopPropagation();

                    insertGAS(
                        state.activeEditor,
                        gas
                    );
                }
            );

            grid.appendChild(
                item
            );
        }

        const close =
            picker.querySelector(
                '.gas-picker-close'
            );

        close.addEventListener(
            'click',
            event => {
                event.preventDefault();
                event.stopPropagation();

                closePicker();
            }
        );

        picker.addEventListener(
            'click',
            event => {
                event.stopPropagation();
            }
        );

        document.body.appendChild(
            picker
        );

        state.picker =
            picker;

        return picker;
    }

    // ============================================================
    // PICKER POSITION
    // ============================================================

    function positionPicker(
        button
    ) {
        const picker =
            createPicker();

        const buttonRect =
            button.getBoundingClientRect();

        const pickerRect =
            picker.getBoundingClientRect();

        const margin = 8;

        let left =
            buttonRect.left;

        let top =
            buttonRect.bottom +
            margin;

        if (
            left +
                pickerRect.width >
            window.innerWidth -
                margin
        ) {
            left =
                window.innerWidth -
                pickerRect.width -
                margin;
        }

        if (
            left < margin
        ) {
            left = margin;
        }

        if (
            top +
                pickerRect.height >
            window.innerHeight -
                margin
        ) {
            top =
                buttonRect.top -
                pickerRect.height -
                margin;
        }

        if (
            top < margin
        ) {
            top = margin;
        }

        picker.style.left =
            `${left}px`;

        picker.style.top =
            `${top}px`;
    }

    // ============================================================
    // OPEN / CLOSE
    // ============================================================

    function openPicker(
        editor,
        button
    ) {
        state.activeEditor =
            editor;

        const picker =
            createPicker();

        const currentlyOpen =
            picker.dataset.open ===
            'true';

        if (
            currentlyOpen
        ) {
            closePicker();

            return;
        }

        picker.dataset.open =
            'true';

        picker.style.display =
            'block';

        positionPicker(
            button
        );

        log(
            'Opened GAS picker.'
        );
    }

    function closePicker() {
        if (!state.picker) {
            return;
        }

        state.picker.dataset.open =
            'false';

        state.picker.style.display =
            'none';

        state.activeEditor =
            null;
    }

    // ============================================================
    // GAS BUTTON
    // ============================================================

    function createGASButton(
        editor
    ) {
        const button =
            document.createElement(
                'button'
            );

        button.type =
            'button';

        button.className =
            'gas-toolbar-button';

        button.title =
            'Giggles&Shit';

        button.setAttribute(
            'aria-label',
            'Open Giggles&Shit'
        );

        button.dataset.gasButton =
            'true';

        const icon =
            DEFAULT_GAS.find(
                gas =>
                    gas.name ===
                    'trollge'
            );

        const image =
            document.createElement(
                'img'
            );

        image.src =
            icon.url;

        image.alt =
            'GAS';

        image.width = 20;
        image.height = 20;

        image.draggable =
            false;

        button.appendChild(
            image
        );

        button.addEventListener(
            'click',
            event => {
                event.preventDefault();
                event.stopPropagation();

                openPicker(
                    editor,
                    button
                );
            }
        );

        state.buttons.add(
            button
        );

        return button;
    }

    // ============================================================
    // TOOLBAR DETECTION
    // ============================================================

    function findToolbar(
        editor
    ) {
        const parent =
            editor.closest(
                'div[class*="Textarea"]'
            );

        if (parent) {
            const toolbar =
                parent.parentElement?.querySelector(
                    '[role="toolbar"]'
                );

            if (toolbar) {
                return toolbar;
            }
        }

        let current =
            editor.parentElement;

        for (
            let depth = 0;
            current &&
            depth < 8;
            depth++
        ) {
            const toolbar =
                current.querySelector(
                    '[role="toolbar"][aria-label*="Formatting"]'
                );

            if (toolbar) {
                return toolbar;
            }

            current =
                current.parentElement;
        }

        return null;
    }

    // ============================================================
    // INJECT BUTTON
    // ============================================================

    function injectButton(
        editor
    ) {
        if (!editor) {
            return false;
        }

        const toolbar =
            findToolbar(
                editor
            );

        if (!toolbar) {
            return false;
        }

        const existing =
            toolbar.querySelector(
                '[data-gas-button="true"]'
            );

        if (existing) {
            editor.dataset.gasProcessed =
                'true';

            return false;
        }

        const button =
            createGASButton(
                editor
            );

        toolbar.appendChild(
            button
        );

        editor.dataset.gasProcessed =
            'true';

        state.editors.add(
            editor
        );

        log(
            'Injected GAS button into toolbar.'
        );

        return true;
    }

    // ============================================================
    // EDITOR SCANNER
    // ============================================================

    function findEditors() {
        const editors = [];

        const elements =
            document.querySelectorAll(
                'textarea, [contenteditable="true"]'
            );

        for (
            const element of elements
        ) {
            if (
                isEditor(element)
            ) {
                editors.push(
                    element
                );
            }
        }

        return editors;
    }

    function scan() {
        const editors =
            findEditors();

        let handled = 0;

        for (
            const editor of editors
        ) {
            if (
                injectButton(
                    editor
                )
            ) {
                handled++;
            }
        }

        log(
            `Scan result: ${editors.length} editor(s), ${handled} button(s) handled.`
        );

        return editors;
    }

    // ============================================================
    // MUTATION OBSERVER
    // ============================================================

    function scheduleScan() {
        clearTimeout(
            state.scanTimer
        );

        state.scanTimer =
            setTimeout(
                () => {
                    scan();
                },
                100
            );
    }

    function startObserver() {
        if (
            state.observer
        ) {
            return;
        }

        state.observer =
            new MutationObserver(
                mutations => {
                    for (
                        const mutation of mutations
                    ) {
                        if (
                            mutation.type ===
                                'childList' &&
                            mutation.addedNodes.length
                        ) {
                            scheduleScan();

                            break;
                        }
                    }
                }
            );

        state.observer.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );

        log(
            'MutationObserver active.'
        );
    }

    // ============================================================
    // GLOBAL CLICK HANDLER
    // ============================================================

    document.addEventListener(
        'click',
        event => {
            if (
                !state.picker
            ) {
                return;
            }

            if (
                state.picker.contains(
                    event.target
                )
            ) {
                return;
            }

            if (
                event.target.closest(
                    '.gas-toolbar-button'
                )
            ) {
                return;
            }

            closePicker();
        },
        true
    );

    // ============================================================
    // ESCAPE
    // ============================================================

    document.addEventListener(
        'keydown',
        event => {
            if (
                event.key ===
                'Escape'
            ) {
                closePicker();
            }
        },
        true
    );

    // ============================================================
    // RESIZE / SCROLL
    // ============================================================

    window.addEventListener(
        'resize',
        () => {
            if (
                state.picker &&
                state.picker.dataset.open ===
                    'true'
            ) {
                closePicker();
            }
        },
        {
            passive: true
        }
    );

    window.addEventListener(
        'scroll',
        () => {
            if (
                state.picker &&
                state.picker.dataset.open ===
                    'true'
            ) {
                closePicker();
            }
        },
        {
            passive: true
        }
    );

    // ============================================================
    // DEBUG API
    // ============================================================

    window.GAS = {
        version: GAS_VERSION,

        scan() {
            return scan();
        },

        editors() {
            const editors =
                findEditors();

            console.table(
                editors.map(
                    (
                        editor,
                        index
                    ) => ({
                        index,
                        tag:
                            editor.tagName,
                        id:
                            editor.id,
                        className:
                            editor.className,
                        placeholder:
                            editor.getAttribute(
                                'placeholder'
                            ),
                        ariaLabel:
                            editor.getAttribute(
                                'aria-label'
                            ),
                        processed:
                            editor.dataset
                                .gasProcessed ===
                            'true',
                        visible:
                            isVisible(
                                editor
                            )
                    })
                )
            );

            return editors;
        },

        buttons() {
            const buttons =
                [
                    ...document.querySelectorAll(
                        '[data-gas-button="true"]'
                    )
                ];

            console.table(
                buttons.map(
                    (
                        button,
                        index
                    ) => ({
                        index,
                        title:
                            button.title,
                        connected:
                            button.isConnected
                    })
                )
            );

            return buttons;
        },

        testButton() {
            const editor =
                findEditors().find(
                    isVisible
                );

            if (!editor) {
                warn(
                    'No visible editor found.'
                );

                return null;
            }

            const button =
                document.querySelector(
                    '[data-gas-button="true"]'
                );

            if (!button) {
                warn(
                    'No GAS toolbar button found.'
                );

                return null;
            }

            openPicker(
                editor,
                button
            );

            return button;
        },

        close() {
            closePicker();
        },

        gas() {
            return [
                ...DEFAULT_GAS
            ];
        },

        version() {
            return GAS_VERSION;
        }
    };

    // ============================================================
    // PAGE DEBUG
    // ============================================================

    function pageDebug() {
        log(
            '========== PAGE DEBUG =========='
        );

        log(
            'URL:',
            location.href
        );

        log(
            'Title:',
            document.title
        );

        log(
            'Textareas:',
            document.querySelectorAll(
                'textarea'
            ).length
        );

        log(
            'Contenteditables:',
            document.querySelectorAll(
                '[contenteditable="true"]'
            ).length
        );

        log(
            'Buttons:',
            document.querySelectorAll(
                'button'
            ).length
        );

        log(
            'Role=toolbar:',
            document.querySelectorAll(
                '[role="toolbar"]'
            ).length
        );

        log(
            'GAS buttons:',
            document.querySelectorAll(
                '[data-gas-button="true"]'
            ).length
        );

        log(
            '================================'
        );
    }

    // ============================================================
    // INITIALIZATION
    // ============================================================

    function init() {
        if (
            state.initialized
        ) {
            return;
        }

        state.initialized =
            true;

        console.log(
            '%c[GAS] ==============================%c',
            'font-weight:bold;color:#f85149',
            ''
        );

        log(
            `Starting GAS v${GAS_VERSION}...`
        );

        log(
            'URL:',
            REPO_URL
        );

        console.log(
            '%c[GAS] ==============================%c',
            'font-weight:bold;color:#f85149',
            ''
        );

        installStyles();

        log(
            'Debug API available as window.GAS'
        );

        log(
            'Try: GAS.scan()'
        );

        log(
            'Try: GAS.editors()'
        );

        log(
            'Try: GAS.buttons()'
        );

        log(
            'Try: GAS.testButton()'
        );

        pageDebug();

        const editors =
            scan();

        log(
            `Found ${editors.length} possible editor(s).`
        );

        for (
            const editor of editors
        ) {
            log(
                'Editor:',
                {
                    tag:
                        editor.tagName,
                    id:
                        editor.id,
                    className:
                        editor.className,
                    name:
                        editor.getAttribute(
                            'name'
                        ),
                    role:
                        editor.getAttribute(
                            'role'
                        ),
                    placeholder:
                        editor.getAttribute(
                            'placeholder'
                        ),
                    ariaLabel:
                        editor.getAttribute(
                            'aria-label'
                        )
                }
            );
        }

        startObserver();

        log(
            'GAS initialization complete.'
        );
    }

    // ============================================================
    // START
    // ============================================================

    if (
        document.readyState ===
        'loading'
    ) {
        document.addEventListener(
            'DOMContentLoaded',
            init,
            {
                once: true
            }
        );
    } else {
        init();
    }
})();
