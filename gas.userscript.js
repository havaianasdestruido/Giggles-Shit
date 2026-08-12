// ==UserScript==
// @name         Giggles&Shit (GAS)
// @namespace    https://github.com/
// @version      2.0.0
// @description  Custom emoji picker for GitHub comments
// @author       PatoFlamejanteTV
// @match        https://github.com/*
// @match        https://gist.github.com/*
// @run-at       document-idle
// @grant        GM_addStyle
// ==/UserScript==

(() => {
    "use strict";

    const PREFIX = "[GAS]";

    // ============================================================
    // CONFIG
    // ============================================================

    const CONFIG = {
        debug: true,

        buttonText: "😈",

        // GitHub custom emoji names.
        //
        // Change these to whatever emoji names you want.
        //
        // Example:
        // {
        //     name: "giggle",
        //     label: "Giggle",
        //     emoji: "😭"
        // }
        //
        // The inserted Markdown will be:
        // :giggle:
        //
        // GitHub must actually know/render the emoji for it to appear
        // as an image.

        emojis: [
            {
                name: "giggle",
                label: "Giggle",
                emoji: "😭"
            },
            {
                name: "shit",
                label: "Shit",
                emoji: "💩"
            },
            {
                name: "bruh",
                label: "Bruh",
                emoji: "🙏"
            },
            {
                name: "fire",
                label: "Fire",
                emoji: "🔥"
            },
            {
                name: "sob",
                label: "Sob",
                emoji: "🥀"
            },
            {
                name: "cooked",
                label: "Cooked",
                emoji: "😭"
            },
            {
                name: "goofy",
                label: "Goofy",
                emoji: "🤡"
            },
            {
                name: "skull",
                label: "Skull",
                emoji: "💀"
            },
            {
                name: "based",
                label: "Based",
                emoji: "🗿"
            },
            {
                name: "sus",
                label: "Sus",
                emoji: "ඞ"
            }
        ],

        // If true, GAS will also show a floating button when it cannot
        // find GitHub's toolbar.
        enableFloatingFallback: true
    };

    // ============================================================
    // STATE
    // ============================================================

    const state = {
        editors: new Set(),
        activeEditor: null,
        picker: null,
        floatingButton: null,
        scanTimer: null,
        lastEditorCount: -1,
        initialized: false
    };

    // ============================================================
    // LOGGING
    // ============================================================

    function log(...args) {
        if (CONFIG.debug) {
            console.log(PREFIX, ...args);
        }
    }

    function warn(...args) {
        console.warn(PREFIX, ...args);
    }

    function error(...args) {
        console.error(PREFIX, ...args);
    }

    // ============================================================
    // STYLES
    // ============================================================

    function installStyles() {
        if (document.getElementById("gas-styles")) {
            return;
        }

        const style = document.createElement("style");
        style.id = "gas-styles";

        style.textContent = `
            /* =====================================================
               GAS BUTTON
               ===================================================== */

            .gas-emoji-button {
                appearance: none !important;
                -webkit-appearance: none !important;

                box-sizing: border-box !important;

                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;

                width: 32px !important;
                height: 32px !important;

                min-width: 32px !important;
                min-height: 32px !important;

                padding: 0 !important;
                margin: 0 !important;

                border: 1px solid var(--borderColor-default, #3d444d) !important;
                border-radius: 6px !important;

                background: var(--bgColor-default, #0d1117) !important;
                color: var(--fgColor-default, #f0f6fc) !important;

                cursor: pointer !important;

                font-size: 18px !important;
                line-height: 1 !important;

                z-index: 9999 !important;

                transition:
                    background-color .12s ease,
                    border-color .12s ease,
                    transform .08s ease !important;
            }

            .gas-emoji-button:hover {
                background: var(--bgColor-neutral-muted, #212830) !important;
                border-color: var(--borderColor-accent-emphasis, #4493f8) !important;
            }

            .gas-emoji-button:active {
                transform: scale(.94) !important;
            }

            .gas-emoji-button.gas-floating {
                position: fixed !important;

                right: 20px !important;
                bottom: 20px !important;

                width: 44px !important;
                height: 44px !important;

                min-width: 44px !important;
                min-height: 44px !important;

                border-radius: 50% !important;

                font-size: 22px !important;

                box-shadow:
                    0 8px 30px rgba(0, 0, 0, .35) !important;

                z-index: 2147483646 !important;
            }

            /* =====================================================
               PICKER
               ===================================================== */

            .gas-picker {
                position: fixed !important;

                width: 340px !important;
                max-width: calc(100vw - 24px) !important;

                max-height: 420px !important;

                display: flex !important;
                flex-direction: column !important;

                overflow: hidden !important;

                background: var(--bgColor-default, #0d1117) !important;
                color: var(--fgColor-default, #f0f6fc) !important;

                border: 1px solid var(--borderColor-default, #3d444d) !important;
                border-radius: 10px !important;

                box-shadow:
                    0 16px 50px rgba(0, 0, 0, .45) !important;

                z-index: 2147483647 !important;

                font-family:
                    -apple-system,
                    BlinkMacSystemFont,
                    "Segoe UI",
                    sans-serif !important;
            }

            .gas-picker-header {
                display: flex !important;
                align-items: center !important;

                gap: 8px !important;

                padding: 10px !important;

                border-bottom:
                    1px solid var(--borderColor-default, #3d444d) !important;
            }

            .gas-picker-title {
                flex: 1 !important;

                font-size: 14px !important;
                font-weight: 600 !important;
            }

            .gas-picker-close {
                appearance: none !important;

                width: 28px !important;
                height: 28px !important;

                border: 0 !important;
                border-radius: 6px !important;

                background: transparent !important;
                color: inherit !important;

                cursor: pointer !important;

                font-size: 16px !important;
            }

            .gas-picker-close:hover {
                background: var(--bgColor-neutral-muted, #212830) !important;
            }

            .gas-picker-search {
                box-sizing: border-box !important;

                width: 100% !important;

                padding: 7px 9px !important;

                border:
                    1px solid var(--borderColor-default, #3d444d) !important;

                border-radius: 6px !important;

                outline: none !important;

                background:
                    var(--bgColor-inset, #010409) !important;

                color: inherit !important;

                font-size: 13px !important;
            }

            .gas-picker-search:focus {
                border-color:
                    var(--borderColor-accent-emphasis, #4493f8) !important;
            }

            .gas-picker-grid {
                display: grid !important;

                grid-template-columns:
                    repeat(6, minmax(0, 1fr)) !important;

                gap: 5px !important;

                padding: 10px !important;

                overflow-y: auto !important;
            }

            .gas-emoji-item {
                appearance: none !important;

                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;

                min-width: 0 !important;

                aspect-ratio: 1 !important;

                padding: 5px !important;

                border: 1px solid transparent !important;
                border-radius: 7px !important;

                background: transparent !important;
                color: inherit !important;

                cursor: pointer !important;
            }

            .gas-emoji-item:hover {
                background:
                    var(--bgColor-neutral-muted, #212830) !important;

                border-color:
                    var(--borderColor-default, #3d444d) !important;
            }

            .gas-emoji-icon {
                font-size: 25px !important;
                line-height: 1 !important;
            }

            .gas-emoji-name {
                width: 100% !important;

                margin-top: 4px !important;

                overflow: hidden !important;

                text-overflow: ellipsis !important;
                white-space: nowrap !important;

                text-align: center !important;

                font-size: 9px !important;

                opacity: .7 !important;
            }

            .gas-picker-empty {
                grid-column: 1 / -1 !important;

                padding: 25px !important;

                text-align: center !important;

                opacity: .65 !important;

                font-size: 13px !important;
            }

            /* =====================================================
               DEBUG
               ===================================================== */

            .gas-debug-outline {
                outline:
                    3px solid #ff00ff !important;

                outline-offset: 2px !important;
            }
        `;

        document.head.appendChild(style);

        log("Styles installed.");
    }

    // ============================================================
    // VISIBILITY
    // ============================================================

    function isVisible(element) {
        if (!element) {
            return false;
        }

        const style = getComputedStyle(element);

        if (
            style.display === "none" ||
            style.visibility === "hidden" ||
            style.opacity === "0"
        ) {
            return false;
        }

        const rect = element.getBoundingClientRect();

        return (
            rect.width > 0 &&
            rect.height > 0
        );
    }

    // ============================================================
    // EDITOR DETECTION
    // ============================================================

    function getAllEditors() {
        const result = new Set();

        // --------------------------------------------------------
        // TEXTAREAS
        // --------------------------------------------------------

        document.querySelectorAll("textarea").forEach(textarea => {
            if (!isVisible(textarea)) {
                return;
            }

            result.add(textarea);
        });

        // --------------------------------------------------------
        // CONTENTEDITABLE
        // --------------------------------------------------------

        document
            .querySelectorAll('[contenteditable="true"]')
            .forEach(element => {
                if (!isVisible(element)) {
                    return;
                }

                result.add(element);
            });

        // --------------------------------------------------------
        // GITHUB SPECIFIC FALLBACKS
        // --------------------------------------------------------

        const selectors = [
            ".js-comment-body",
            ".js-issue-comment",
            ".js-new-comment-form textarea",
            ".js-new-comment-form [contenteditable='true']",
            "[data-testid='comment-body']",
            "[data-testid*='comment'] textarea",
            "[data-testid*='comment'] [contenteditable='true']",
            "[data-testid*='markdown'] textarea",
            "[data-testid*='markdown'] [contenteditable='true']",
            "[data-testid*='editor'] textarea",
            "[data-testid*='editor'] [contenteditable='true']"
        ];

        for (const selector of selectors) {
            try {
                document.querySelectorAll(selector).forEach(element => {
                    if (isVisible(element)) {
                        result.add(element);
                    }
                });
            } catch (err) {
                warn("Invalid selector:", selector, err);
            }
        }

        return [...result];
    }

    function describeEditor(editor) {
        if (!editor) {
            return null;
        }

        return {
            tag: editor.tagName,
            id: editor.id,
            className:
                typeof editor.className === "string"
                    ? editor.className
                    : "",
            name: editor.getAttribute("name"),
            role: editor.getAttribute("role"),
            placeholder:
                editor.getAttribute("placeholder"),
            ariaLabel:
                editor.getAttribute("aria-label"),
            testId:
                editor.getAttribute("data-testid"),
            contentEditable:
                editor.getAttribute("contenteditable"),
            visible: isVisible(editor)
        };
    }

    function scanEditors(verbose = true) {
        const editors = getAllEditors();

        state.editors = new Set(editors);

        if (
            verbose ||
            editors.length !== state.lastEditorCount
        ) {
            log(
                `Found ${editors.length} possible editor(s).`
            );

            editors.forEach((editor, index) => {
                log(
                    `Editor #${index}:`,
                    describeEditor(editor),
                    editor
                );
            });

            state.lastEditorCount = editors.length;
        }

        return editors;
    }

    // ============================================================
    // FIND EDITOR FROM BUTTON / EVENT
    // ============================================================

    function findEditorFromElement(element) {
        if (!element) {
            return null;
        }

        // Direct editor.
        if (
            element.matches?.("textarea") ||
            element.matches?.('[contenteditable="true"]')
        ) {
            return element;
        }

        // Search parent.
        const parentEditor =
            element.closest?.(
                "textarea, [contenteditable='true']"
            );

        if (parentEditor) {
            return parentEditor;
        }

        // Search inside parent container.
        let parent = element;

        for (let i = 0; i < 8 && parent; i++) {
            const editor =
                parent.querySelector?.(
                    "textarea, [contenteditable='true']"
                );

            if (editor && isVisible(editor)) {
                return editor;
            }

            parent = parent.parentElement;
        }

        return null;
    }

    function findBestEditor() {
        // First use currently focused editor.
        const active = document.activeElement;

        const activeEditor =
            findEditorFromElement(active);

        if (activeEditor) {
            return activeEditor;
        }

        // Then use active stored editor.
        if (
            state.activeEditor &&
            document.contains(state.activeEditor) &&
            isVisible(state.activeEditor)
        ) {
            return state.activeEditor;
        }

        // Then scan.
        const editors = scanEditors(false);

        // Prefer textarea.
        const textarea =
            editors.find(
                element =>
                    element.tagName === "TEXTAREA"
            );

        if (textarea) {
            return textarea;
        }

        return editors[0] || null;
    }

    // ============================================================
    // TOOLBAR DETECTION
    // ============================================================

    function getToolbarCandidates(editor) {
        const candidates = [];

        if (!editor) {
            return candidates;
        }

        let current = editor.parentElement;

        for (
            let depth = 0;
            depth < 8 && current;
            depth++
        ) {
            // GitHub / Primer common toolbar patterns.
            const descendants = current.querySelectorAll(
                [
                    "button",
                    "[role='toolbar']",
                    ".toolbar",
                    ".BtnGroup",
                    "[data-toolbar]"
                ].join(",")
            );

            if (descendants.length) {
                candidates.push(current);
            }

            current = current.parentElement;
        }

        return candidates;
    }

    function findToolbar(editor) {
        if (!editor) {
            return null;
        }

        // --------------------------------------------------------
        // Explicit toolbar
        // --------------------------------------------------------

        let toolbar = null;

        const explicitSelectors = [
            "[role='toolbar']",
            "[data-toolbar]",
            ".toolbar",
            ".BtnGroup"
        ];

        let parent = editor.parentElement;

        for (
            let depth = 0;
            depth < 8 && parent && !toolbar;
            depth++
        ) {
            for (const selector of explicitSelectors) {
                const candidate =
                    parent.querySelector(selector);

                if (
                    candidate &&
                    isVisible(candidate)
                ) {
                    toolbar = candidate;
                    break;
                }
            }

            parent = parent.parentElement;
        }

        if (toolbar) {
            return toolbar;
        }

        // --------------------------------------------------------
        // Find nearest container with buttons
        // --------------------------------------------------------

        parent = editor.parentElement;

        for (
            let depth = 0;
            depth < 8 && parent;
            depth++
        ) {
            const buttons =
                [...parent.querySelectorAll("button")]
                    .filter(isVisible);

            if (
                buttons.length > 0 &&
                buttons.length < 30
            ) {
                return parent;
            }

            parent = parent.parentElement;
        }

        return null;
    }

    // ============================================================
    // BUTTON CREATION
    // ============================================================

    function createEmojiButton(editor) {
        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "gas-emoji-button";

        button.dataset.gasEmojiButton = "true";

        button.setAttribute(
            "aria-label",
            "GAS custom emoji"
        );

        button.setAttribute(
            "title",
            "GAS custom emoji"
        );

        button.textContent =
            CONFIG.buttonText;

        button.addEventListener(
            "mousedown",
            event => {
                // Don't let GitHub steal focus before we know
                // which editor we're using.
                event.preventDefault();
            }
        );

        button.addEventListener(
            "click",
            event => {
                event.preventDefault();
                event.stopPropagation();

                state.activeEditor = editor;

                log(
                    "GAS button clicked.",
                    describeEditor(editor)
                );

                openPicker(
                    button,
                    editor
                );
            }
        );

        return button;
    }

    // ============================================================
    // INJECT BUTTON
    // ============================================================

    function injectButton(editor) {
        if (!editor) {
            return false;
        }

        if (!document.contains(editor)) {
            return false;
        }

        if (!isVisible(editor)) {
            return false;
        }

        // Already injected for this editor.
        const existing =
            document.querySelectorAll(
                ".gas-emoji-button"
            );

        for (const button of existing) {
            if (
                button.dataset.gasEditorId ===
                getElementId(editor)
            ) {
                return true;
            }
        }

        const editorId =
            getElementId(editor);

        // --------------------------------------------------------
        // Find toolbar
        // --------------------------------------------------------

        const toolbar =
            findToolbar(editor);

        if (toolbar) {
            log(
                "Found toolbar for editor:",
                toolbar
            );

            const button =
                createEmojiButton(editor);

            button.dataset.gasEditorId =
                editorId;

            // Prefer adding near existing buttons.
            const firstButton =
                toolbar.querySelector("button");

            if (firstButton) {
                firstButton.parentElement?.appendChild(
                    button
                );
            } else {
                toolbar.appendChild(button);
            }

            log(
                "Injected GAS button into toolbar."
            );

            return true;
        }

        log(
            "No toolbar found for editor."
        );

        return false;
    }

    // ============================================================
    // UNIQUE ELEMENT ID
    // ============================================================

    let elementIdCounter = 0;

    function getElementId(element) {
        if (!element.dataset.gasElementId) {
            element.dataset.gasElementId =
                `gas-editor-${++elementIdCounter}`;
        }

        return element.dataset.gasElementId;
    }

    // ============================================================
    // FLOATING FALLBACK
    // ============================================================

    function createFloatingButton() {
        if (!CONFIG.enableFloatingFallback) {
            return;
        }

        if (
            state.floatingButton &&
            document.contains(state.floatingButton)
        ) {
            return;
        }

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "gas-emoji-button gas-floating";

        button.dataset.gasFloating =
            "true";

        button.setAttribute(
            "aria-label",
            "GAS custom emoji picker"
        );

        button.setAttribute(
            "title",
            "GAS custom emoji picker"
        );

        button.textContent =
            CONFIG.buttonText;

        button.addEventListener(
            "click",
            event => {
                event.preventDefault();
                event.stopPropagation();

                const editor =
                    findBestEditor();

                if (!editor) {
                    warn(
                        "Floating button clicked, but no editor was found."
                    );

                    alert(
                        "GAS: No GitHub comment editor found.\n\n" +
                        "Open a comment box first."
                    );

                    return;
                }

                state.activeEditor = editor;

                openPicker(
                    button,
                    editor
                );
            }
        );

        document.body.appendChild(button);

        state.floatingButton =
            button;

        log(
            "Floating fallback button created."
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
            document.createElement("div");

        picker.className =
            "gas-picker";

        picker.dataset.gasPicker =
            "true";

        picker.innerHTML = `
            <div class="gas-picker-header">
                <div class="gas-picker-title">
                    GAS Custom Emoji
                </div>

                <button
                    type="button"
                    class="gas-picker-close"
                    aria-label="Close"
                >
                    ×
                </button>
            </div>

            <div style="padding: 0 10px 10px;">
                <input
                    class="gas-picker-search"
                    type="search"
                    placeholder="Search emoji..."
                    autocomplete="off"
                    spellcheck="false"
                >
            </div>

            <div class="gas-picker-grid"></div>
        `;

        document.body.appendChild(picker);

        state.picker =
            picker;

        picker
            .querySelector(".gas-picker-close")
            .addEventListener(
                "click",
                () => closePicker()
            );

        picker
            .querySelector(".gas-picker-search")
            .addEventListener(
                "input",
                event => {
                    renderEmojiGrid(
                        event.target.value
                    );
                }
            );

        renderEmojiGrid();

        return picker;
    }

    function renderEmojiGrid(search = "") {
        const picker =
            state.picker;

        if (!picker) {
            return;
        }

        const grid =
            picker.querySelector(
                ".gas-picker-grid"
            );

        const query =
            search
                .trim()
                .toLowerCase();

        const emojis =
            CONFIG.emojis.filter(item => {
                if (!query) {
                    return true;
                }

                return (
                    item.name
                        .toLowerCase()
                        .includes(query) ||
                    item.label
                        .toLowerCase()
                        .includes(query)
                );
            });

        grid.replaceChildren();

        if (!emojis.length) {
            const empty =
                document.createElement("div");

            empty.className =
                "gas-picker-empty";

            empty.textContent =
                "No emoji found.";

            grid.appendChild(empty);

            return;
        }

        for (const item of emojis) {
            const button =
                document.createElement("button");

            button.type = "button";

            button.className =
                "gas-emoji-item";

            button.dataset.emojiName =
                item.name;

            button.title =
                `:${item.name}:`;

            button.innerHTML = `
                <span class="gas-emoji-icon">
                    ${escapeHtml(item.emoji)}
                </span>

                <span class="gas-emoji-name">
                    :${escapeHtml(item.name)}:
                </span>
            `;

            button.addEventListener(
                "mousedown",
                event => {
                    event.preventDefault();
                }
            );

            button.addEventListener(
                "click",
                event => {
                    event.preventDefault();
                    event.stopPropagation();

                    insertEmoji(
                        item.name,
                        state.activeEditor
                    );
                }
            );

            grid.appendChild(button);
        }
    }

    function escapeHtml(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    // ============================================================
    // PICKER POSITIONING
    // ============================================================

    function positionPicker(button) {
        const picker =
            state.picker;

        if (!picker || !button) {
            return;
        }

        const rect =
            button.getBoundingClientRect();

        const pickerWidth =
            picker.offsetWidth || 340;

        const pickerHeight =
            picker.offsetHeight || 420;

        let left =
            rect.left;

        let top =
            rect.bottom + 8;

        if (
            left + pickerWidth >
            window.innerWidth - 8
        ) {
            left =
                window.innerWidth -
                pickerWidth -
                8;
        }

        if (
            left < 8
        ) {
            left = 8;
        }

        if (
            top + pickerHeight >
            window.innerHeight - 8
        ) {
            top =
                rect.top -
                pickerHeight -
                8;
        }

        if (
            top < 8
        ) {
            top = 8;
        }

        picker.style.left =
            `${left}px`;

        picker.style.top =
            `${top}px`;
    }

    function openPicker(button, editor) {
        const picker =
            createPicker();

        state.activeEditor =
            editor;

        picker.style.display =
            "flex";

        positionPicker(button);

        const search =
            picker.querySelector(
                ".gas-picker-search"
            );

        search.value = "";

        renderEmojiGrid();

        log(
            "Picker opened.",
            {
                editor:
                    describeEditor(editor),
                button
            }
        );

        setTimeout(() => {
            search.focus();
        }, 0);
    }

    function closePicker() {
        if (!state.picker) {
            return;
        }

        state.picker.style.display =
            "none";

        log("Picker closed.");
    }

    // ============================================================
    // INSERTION
    // ============================================================

    function insertEmoji(name, editor) {
        if (!editor) {
            warn(
                "Cannot insert emoji: no editor."
            );

            return;
        }

        const text =
            `:${name}:`;

        log(
            `Inserting ${text}`,
            describeEditor(editor)
        );

        // --------------------------------------------------------
        // TEXTAREA
        // --------------------------------------------------------

        if (
            editor.tagName === "TEXTAREA" ||
            editor instanceof HTMLInputElement
        ) {
            insertIntoTextarea(
                editor,
                text
            );

            closePicker();

            return;
        }

        // --------------------------------------------------------
        // CONTENTEDITABLE
        // --------------------------------------------------------

        if (
            editor.isContentEditable
        ) {
            insertIntoContentEditable(
                editor,
                text
            );

            closePicker();

            return;
        }

        warn(
            "Unknown editor type:",
            editor
        );
    }

    function insertIntoTextarea(
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

        const oldValue =
            textarea.value;

        textarea.value =
            oldValue.slice(0, start) +
            text +
            oldValue.slice(end);

        const cursor =
            start + text.length;

        textarea.selectionStart =
            cursor;

        textarea.selectionEnd =
            cursor;

        // React/GitHub needs an input event.
        textarea.dispatchEvent(
            new InputEvent(
                "input",
                {
                    bubbles: true,
                    inputType:
                        "insertText",
                    data: text
                }
            )
        );

        textarea.dispatchEvent(
            new Event(
                "change",
                {
                    bubbles: true
                }
            )
        );

        log(
            "Inserted into textarea."
        );
    }

    function insertIntoContentEditable(
        editor,
        text
    ) {
        editor.focus();

        const selection =
            window.getSelection();

        if (
            selection &&
            selection.rangeCount > 0
        ) {
            const range =
                selection.getRangeAt(0);

            if (
                editor.contains(
                    range.commonAncestorContainer
                )
            ) {
                range.deleteContents();

                const node =
                    document.createTextNode(
                        text
                    );

                range.insertNode(node);

                range.setStartAfter(node);
                range.collapse(true);

                selection.removeAllRanges();
                selection.addRange(range);

                editor.dispatchEvent(
                    new InputEvent(
                        "input",
                        {
                            bubbles: true,
                            inputType:
                                "insertText",
                            data: text
                        }
                    )
                );

                log(
                    "Inserted into contenteditable using Selection."
                );

                return;
            }
        }

        // Fallback.
        document.execCommand(
            "insertText",
            false,
            text
        );

        editor.dispatchEvent(
            new InputEvent(
                "input",
                {
                    bubbles: true,
                    inputType:
                        "insertText",
                    data: text
                }
            )
        );

        log(
            "Inserted into contenteditable using execCommand."
        );
    }

    // ============================================================
    // GLOBAL CLICK HANDLER
    // ============================================================

    function installGlobalClickHandler() {
        document.addEventListener(
            "mousedown",
            event => {
                const target =
                    event.target;

                // Close picker if clicking outside.
                if (
                    state.picker &&
                    state.picker.style.display !==
                        "none"
                ) {
                    const insidePicker =
                        state.picker.contains(
                            target
                        );

                    const gasButton =
                        target.closest?.(
                            ".gas-emoji-button"
                        );

                    if (
                        !insidePicker &&
                        !gasButton
                    ) {
                        closePicker();
                    }
                }
            },
            true
        );
    }

    // ============================================================
    // TRACK FOCUS
    // ============================================================

    function installFocusTracking() {
        document.addEventListener(
            "focusin",
            event => {
                const editor =
                    findEditorFromElement(
                        event.target
                    );

                if (!editor) {
                    return;
                }

                state.activeEditor =
                    editor;

                log(
                    "Active editor changed:",
                    describeEditor(editor)
                );
            },
            true
        );
    }

    // ============================================================
    // SCAN + INJECT
    // ============================================================

    function performScan() {
        const editors =
            scanEditors();

        let injected =
            0;

        for (const editor of editors) {
            if (
                injectButton(editor)
            ) {
                injected++;
            }
        }

        if (
            editors.length > 0
        ) {
            log(
                `Scan result: ${editors.length} editor(s), ${injected} button(s) handled.`
            );
        } else {
            log(
                "No editors currently visible."
            );
        }

        // Always keep fallback available.
        if (
            CONFIG.enableFloatingFallback
        ) {
            createFloatingButton();
        }
    }

    function scheduleScan() {
        clearTimeout(
            state.scanTimer
        );

        state.scanTimer =
            setTimeout(
                performScan,
                250
            );
    }

    // ============================================================
    // MUTATION OBSERVER
    // ============================================================

    function installMutationObserver() {
        const observer =
            new MutationObserver(
                mutations => {
                    let relevant = false;

                    for (
                        const mutation
                        of mutations
                    ) {
                        if (
                            mutation.type ===
                            "childList"
                        ) {
                            relevant = true;
                            break;
                        }
                    }

                    if (relevant) {
                        scheduleScan();
                    }
                }
            );

        observer.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );

        log(
            "MutationObserver active."
        );
    }

    // ============================================================
    // DEBUG COMMANDS
    // ============================================================

    function exposeDebugAPI() {
        window.GAS = {
            scan() {
                log(
                    "Manual scan requested."
                );

                performScan();
            },

            editors() {
                const editors =
                    scanEditors();

                console.table(
                    editors.map(
                        describeEditor
                    )
                );

                return editors;
            },

            buttons() {
                const buttons =
                    [
                        ...document.querySelectorAll(
                            ".gas-emoji-button"
                        )
                    ];

                log(
                    `Found ${buttons.length} GAS button(s).`
                );

                buttons.forEach(
                    (button, index) => {
                        log(
                            `GAS button #${index}:`,
                            button
                        );
                    }
                );

                return buttons;
            },

            picker() {
                const picker =
                    createPicker();

                picker.style.display =
                    "flex";

                positionPicker(
                    state.floatingButton ||
                    document.body
                );

                return picker;
            },

            testButton() {
                const editor =
                    findBestEditor();

                if (!editor) {
                    warn(
                        "testButton(): no editor found."
                    );

                    return null;
                }

                const button =
                    createEmojiButton(
                        editor
                    );

                button.style.position =
                    "fixed";

                button.style.left =
                    "50%";

                button.style.top =
                    "100px";

                button.style.zIndex =
                    "2147483647";

                document.body.appendChild(
                    button
                );

                log(
                    "TEST BUTTON CREATED.",
                    button
                );

                return button;
            },

            config: CONFIG,

            state
        };

        log(
            "Debug API available as window.GAS"
        );

        log(
            "Try: GAS.scan()"
        );

        log(
            "Try: GAS.editors()"
        );

        log(
            "Try: GAS.buttons()"
        );

        log(
            "Try: GAS.testButton()"
        );
    }

    // ============================================================
    // DEBUG DOM DUMP
    // ============================================================

    function debugPageStructure() {
        log(
            "========== PAGE DEBUG =========="
        );

        log(
            "URL:",
            location.href
        );

        log(
            "Title:",
            document.title
        );

        log(
            "Textareas:",
            document.querySelectorAll(
                "textarea"
            ).length
        );

        log(
            "Contenteditables:",
            document.querySelectorAll(
                '[contenteditable="true"]'
            ).length
        );

        log(
            "Buttons:",
            document.querySelectorAll(
                "button"
            ).length
        );

        log(
            "Role=toolbar:",
            document.querySelectorAll(
                "[role='toolbar']"
            ).length
        );

        log(
            "GAS buttons:",
            document.querySelectorAll(
                ".gas-emoji-button"
            ).length
        );

        log(
            "================================"
        );
    }

    // ============================================================
    // INITIALIZATION
    // ============================================================

    function start() {
        if (state.initialized) {
            return;
        }

        state.initialized =
            true;

        log(
            "=============================="
        );

        log(
            "Starting GAS v2.0.0..."
        );

        log(
            "URL:",
            location.href
        );

        log(
            "=============================="
        );

        installStyles();

        exposeDebugAPI();

        installGlobalClickHandler();

        installFocusTracking();

        debugPageStructure();

        // Initial scan.
        performScan();

        // GitHub is a SPA, so keep scanning.
        installMutationObserver();

        // Additional delayed scans because GitHub often
        // hydrates React components after page load.
        setTimeout(
            performScan,
            500
        );

        setTimeout(
            performScan,
            1500
        );

        setTimeout(
            performScan,
            3000
        );

        log(
            "GAS initialization complete."
        );
    }

    // ============================================================
    // START
    // ============================================================

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            start,
            {
                once: true
            }
        );
    } else {
        start();
    }

})();
