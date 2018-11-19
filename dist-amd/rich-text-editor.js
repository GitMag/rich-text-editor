define(['exports', 'sanitize-html', 'baconjs', 'jquery'], function (exports, sanitizeHtml, Bacon, $) { 'use strict';

    sanitizeHtml = sanitizeHtml && sanitizeHtml.hasOwnProperty('default') ? sanitizeHtml['default'] : sanitizeHtml;
    $ = $ && $.hasOwnProperty('default') ? $['default'] : $;

    var allowedTags = ['div', 'img', 'br'];
    var allowedAttributes = {
        img: ['src', 'alt']
    };
    var allowedSchemes = ['data'];
    var exclusiveFilter = function (frame) { return frame.attribs['data-js'] === 'mathEditor'; };

    var sanitizeOpts = /*#__PURE__*/Object.freeze({
        allowedTags: allowedTags,
        allowedAttributes: allowedAttributes,
        allowedSchemes: allowedSchemes,
        exclusiveFilter: exclusiveFilter
    });

    var equationImageSelector = 'img[src^="/math.svg"], img[src^="data:image/svg+xml"]';
    var screenshotImageSelector = 'img[src^="/screenshot/"], img[src^="data:image/png"]';
    function convertLinksToRelative(html) {
        return html.replace(new RegExp(document.location.origin, 'g'), '');
    }
    function sanitize(html) {
        return sanitizeHtml(convertLinksToRelative(html), sanitizeOpts);
    }
    function insertToTextAreaAtCursor(field, value) {
        var startPos = field.selectionStart;
        var endPos = field.selectionEnd;
        var oldValue = field.value;
        field.value = oldValue.substring(0, startPos) + value + oldValue.substring(endPos, oldValue.length);
        field.selectionStart = field.selectionEnd = startPos + value.length;
    }
    function isKey(e, key) {
        return preventIfTrue(e, !e.altKey && !e.shiftKey && !e.ctrlKey && keyOrKeyCode(e, key));
    }
    function isCtrlKey(e, key) {
        return preventIfTrue(e, !e.altKey && !e.shiftKey && e.ctrlKey && keyOrKeyCode(e, key));
    }
    function keyOrKeyCode(e, val) {
        return typeof val === 'string' ? e.key === val : e.keyCode === val;
    }
    function preventIfTrue(e, val) {
        if (val)
            e.preventDefault();
        return val;
    }
    function sanitizeContent(answerElement) {
        var $answerElement = $(answerElement);
        var $mathEditor = $answerElement.find('[data-js="mathEditor"]');
        $mathEditor.hide();
        var text = $answerElement.get(0).innerText;
        $mathEditor.show();
        var html = sanitize($answerElement.html());
        var answerConsideredEmpty = text.trim().length +
            $answerElement.find(equationImageSelector).length +
            $answerElement.find(screenshotImageSelector).length ===
            0;
        return {
            answerHTML: answerConsideredEmpty ? '' : html,
            answerText: text,
            imageCount: existingScreenshotCount($("<div>" + html + "</div>"))
        };
    }
    function setCursorAfter($img) {
        var range = document.createRange();
        var img = $img.get(0);
        range.setStartAfter(img);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
    function existingScreenshotCount($editor) {
        var imageCount = $editor.find('img').length;
        var emptyImageCount = $editor.find('img[src=""]').length;
        var equationCount = $editor.find(equationImageSelector).length;
        return imageCount - equationCount - emptyImageCount;
    }
    function scrollIntoView($element) {
        var $window = $(window);
        var windowHeight = $window.height() - 40;
        var scroll = windowHeight + $window.scrollTop();
        var pos = $element.offset().top + $element.height();
        if (scroll < pos) {
            $window.scrollTop(pos - windowHeight);
        }
    }

    var specialCharacterGroups = [
        {
            label: 'Perusmerit ja kreikkalaiset aakkoset',
            characters: [
                { character: '°', popular: true },
                { character: '·', latexCommand: '\\cdot', popular: true },
                { character: '±', latexCommand: '\\pm', popular: true },
                { character: '∞', latexCommand: '\\infty', popular: true },
                { character: '²', latexCommand: '^2', popular: true },
                { character: '³', latexCommand: '^3', popular: true },
                { character: '½', latexCommand: '1/2', popular: true },
                { character: '⅓', latexCommand: '1/3', popular: true },
                { character: 'π', latexCommand: '\\pi', popular: true },
                { character: 'α', latexCommand: '\\alpha', popular: true },
                { character: 'β', latexCommand: '\\beta', popular: true },
                { character: 'Γ', latexCommand: '\\Gamma' },
                { character: 'γ', latexCommand: '\\gamma' },
                { character: 'Δ', latexCommand: '\\Delta' },
                { character: 'δ', latexCommand: '\\delta' },
                { character: 'ε', latexCommand: '\\varepsilon' },
                { character: 'ζ', latexCommand: '\\zeta' },
                { character: 'η', latexCommand: '\\eta' },
                { character: 'θ', latexCommand: '\\theta' },
                { character: 'ϑ', latexCommand: '\\vartheta' },
                { character: '&iota;', latexCommand: '\\iota' },
                { character: 'κ', latexCommand: '\\kappa' },
                { character: 'Λ', latexCommand: '\\Lambda' },
                { character: 'λ', latexCommand: '\\lambda' },
                { character: 'µ', latexCommand: '\\mu' },
                { character: 'ν', latexCommand: '\\nu' },
                { character: 'Ξ', latexCommand: '\\Xi' },
                { character: 'ξ', latexCommand: '\\xi' },
                { character: '∏', latexCommand: '\\Pi' },
                { character: 'ρ', latexCommand: '\\rho' },
                { character: '∑', latexCommand: '\\Sigma' },
                { character: 'σ', latexCommand: '\\sigma' },
                { character: 'τ', latexCommand: '\\tau' },
                { character: 'Υ', latexCommand: '\\Upsilon' },
                { character: 'υ', latexCommand: '\\upsilon' },
                { character: 'Φ', latexCommand: '\\Phi' },
                { character: 'Ф', latexCommand: '\\phi' },
                { character: 'χ', latexCommand: '\\chi' },
                { character: 'Ψ', latexCommand: '\\Psi' },
                { character: 'ψ', latexCommand: '\\psi' },
                { character: 'Ω', latexCommand: '\\Omega' },
                { character: 'ω', latexCommand: '\\omega' },
                { character: '∂', latexCommand: '\\partial' },
                { character: 'φ', latexCommand: '\\varphi' }
            ]
        },
        {
            label: 'Algebra',
            characters: [
                { character: '≠', latexCommand: '\\neq', popular: true },
                { character: '≈', latexCommand: '\\approx', popular: true },
                { character: '≤', latexCommand: '\\leq', popular: true },
                { character: '≥', latexCommand: '\\geq' },
                { character: '<' },
                { character: '>' },
                { character: '∼', latexCommand: '\\sim' },
                { character: '≡', latexCommand: '\\equiv' },
                { character: '≢', latexCommand: '\\not\\equiv' },
                { character: '∘', latexCommand: '\\circ' },
                { character: '…', latexCommand: '\\ldots' },
                { character: '∝', latexCommand: '\\propto' }
            ]
        },
        {
            label: 'Geometria ja vektorioppi',
            characters: [
                { character: '∢', latexCommand: '\\sphericalangle', popular: true },
                { character: '|', latexCommand: '\\mid', popular: true },
                { character: '‖', latexCommand: '\\parallel', popular: true },
                { character: '⇌', latexCommand: '\\xrightleftharpoons', noWrite: true },
                { character: '⇅' },
                { character: '∠', latexCommand: '\\angle' },
                { character: '↑', latexCommand: '\\uparrow' },
                { character: '↗', latexCommand: '\\nearrow' },
                { character: '↘', latexCommand: '\\searrow' },
                { character: '↓', latexCommand: '\\downarrow' },
                { character: '↔', latexCommand: '\\leftrightarrow' },
                { character: '⊥', latexCommand: '\\perp' }
            ]
        },
        {
            label: 'Logiikka ja joukko-oppi',
            characters: [
                { character: '→', latexCommand: '\\rightarrow', popular: true },
                { character: '⇒', latexCommand: '\\Rightarrow', popular: true },
                { character: '∈', latexCommand: '\\in', popular: true },
                { character: 'ℤ', latexCommand: '\\mathbb{Z}', popular: true },
                { character: 'ℝ', latexCommand: '\\mathbb{R}', popular: true },
                { character: '⇔', latexCommand: '\\Leftrightarrow' },
                { character: '∃', latexCommand: '\\exists' },
                { character: '∀', latexCommand: '\\forall' },
                { character: 'ℕ', latexCommand: '\\mathbb{N}' },
                { character: 'ℚ', latexCommand: '\\mathbb{Q}' },
                { character: '∩', latexCommand: '\\cap' },
                { character: '∪', latexCommand: '\\cup' },
                { character: '∖', latexCommand: '\\setminus' },
                { character: '⊂', latexCommand: '\\subset' },
                { character: '⊄', latexCommand: '\\notsubset' },
                { character: '∉', latexCommand: '\\notin' },
                { character: '∅', latexCommand: '\\empty' },
                { character: '∧', latexCommand: '\\and' },
                { character: '∨', latexCommand: '\\or' },
                { character: '¬' }
            ]
        }
    ];

    var latexCommandsWithSvg = [
        {
            action: '\\sqrt',
            label: '\\sqrt{X}',
            svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjMuNzQ0ZXgiIGhlaWdodD0iMy4wMDlleCIgc3R5bGU9InZlcnRpY2FsLWFsaWduOiAtMC42NzFleDsiIHZpZXdCb3g9IjAgLTEwMDYuNiAxNjEyIDEyOTUuNyIgcm9sZT0iaW1nIiBmb2N1c2FibGU9ImZhbHNlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGFyaWEtbGFiZWxsZWRieT0iTWF0aEpheC1TVkctMS1UaXRsZSI+Cjx0aXRsZSBpZD0iTWF0aEpheC1TVkctMS1UaXRsZSI+XHNxcnR7XHNxdWFyZX08L3RpdGxlPgo8ZGVmcyBhcmlhLWhpZGRlbj0idHJ1ZSI+CjxwYXRoIHN0cm9rZS13aWR0aD0iMSIgaWQ9IkUxLU1KQU1TLTI1QTEiIGQ9Ik03MSAwUTU5IDQgNTUgMTZWMzQ2TDU2IDY3NlE2NCA2ODYgNzAgNjg5SDcwOVE3MTkgNjgxIDcyMiA2NzRWMTVRNzE5IDEwIDcwOSAxTDM5MCAwSDcxWk02ODIgNDBWNjQ5SDk1VjQwSDY4MloiPjwvcGF0aD4KPHBhdGggc3Ryb2tlLXdpZHRoPSIxIiBpZD0iRTEtTUpNQUlOLTIyMUEiIGQ9Ik05NSAxNzhRODkgMTc4IDgxIDE4NlQ3MiAyMDBUMTAzIDIzMFQxNjkgMjgwVDIwNyAzMDlRMjA5IDMxMSAyMTIgMzExSDIxM1EyMTkgMzExIDIyNyAyOTRUMjgxIDE3N1EzMDAgMTM0IDMxMiAxMDhMMzk3IC03N1EzOTggLTc3IDUwMSAxMzZUNzA3IDU2NVQ4MTQgNzg2UTgyMCA4MDAgODM0IDgwMFE4NDEgODAwIDg0NiA3OTRUODUzIDc4MlY3NzZMNjIwIDI5M0wzODUgLTE5M1EzODEgLTIwMCAzNjYgLTIwMFEzNTcgLTIwMCAzNTQgLTE5N1EzNTIgLTE5NSAyNTYgMTVMMTYwIDIyNUwxNDQgMjE0UTEyOSAyMDIgMTEzIDE5MFQ5NSAxNzhaIj48L3BhdGg+CjwvZGVmcz4KPGcgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIGZpbGw9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIwIiB0cmFuc2Zvcm09Im1hdHJpeCgxIDAgMCAtMSAwIDApIiBhcmlhLWhpZGRlbj0idHJ1ZSI+CiA8dXNlIHhsaW5rOmhyZWY9IiNFMS1NSk1BSU4tMjIxQSIgeD0iMCIgeT0iMjAiPjwvdXNlPgo8cmVjdCBzdHJva2U9Im5vbmUiIHdpZHRoPSI3NzgiIGhlaWdodD0iNjAiIHg9IjgzMyIgeT0iNzYxIj48L3JlY3Q+CiA8dXNlIHhsaW5rOmhyZWY9IiNFMS1NSkFNUy0yNUExIiB4PSI4MzMiIHk9IjAiPjwvdXNlPgo8L2c+Cjwvc3ZnPg=='
        },
        {
            action: '^',
            label: 'x^{X}',
            svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjIuODRleCIgaGVpZ2h0PSIyLjY3NmV4IiBzdHlsZT0idmVydGljYWwtYWxpZ246IC0wLjMzOGV4OyIgdmlld0JveD0iMCAtMTAwNi42IDEyMjMgMTE1Mi4xIiByb2xlPSJpbWciIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgYXJpYS1sYWJlbGxlZGJ5PSJNYXRoSmF4LVNWRy0xLVRpdGxlIj4KPHRpdGxlIGlkPSJNYXRoSmF4LVNWRy0xLVRpdGxlIj54Xntcc3F1YXJlfTwvdGl0bGU+CjxkZWZzIGFyaWEtaGlkZGVuPSJ0cnVlIj4KPHBhdGggc3Ryb2tlLXdpZHRoPSIxIiBpZD0iRTEtTUpNQVRISS03OCIgZD0iTTUyIDI4OVE1OSAzMzEgMTA2IDM4NlQyMjIgNDQyUTI1NyA0NDIgMjg2IDQyNFQzMjkgMzc5UTM3MSA0NDIgNDMwIDQ0MlE0NjcgNDQyIDQ5NCA0MjBUNTIyIDM2MVE1MjIgMzMyIDUwOCAzMTRUNDgxIDI5MlQ0NTggMjg4UTQzOSAyODggNDI3IDI5OVQ0MTUgMzI4UTQxNSAzNzQgNDY1IDM5MVE0NTQgNDA0IDQyNSA0MDRRNDEyIDQwNCA0MDYgNDAyUTM2OCAzODYgMzUwIDMzNlEyOTAgMTE1IDI5MCA3OFEyOTAgNTAgMzA2IDM4VDM0MSAyNlEzNzggMjYgNDE0IDU5VDQ2MyAxNDBRNDY2IDE1MCA0NjkgMTUxVDQ4NSAxNTNINDg5UTUwNCAxNTMgNTA0IDE0NVE1MDQgMTQ0IDUwMiAxMzRRNDg2IDc3IDQ0MCAzM1QzMzMgLTExUTI2MyAtMTEgMjI3IDUyUTE4NiAtMTAgMTMzIC0xMEgxMjdRNzggLTEwIDU3IDE2VDM1IDcxUTM1IDEwMyA1NCAxMjNUOTkgMTQzUTE0MiAxNDMgMTQyIDEwMVExNDIgODEgMTMwIDY2VDEwNyA0NlQ5NCA0MUw5MSA0MFE5MSAzOSA5NyAzNlQxMTMgMjlUMTMyIDI2UTE2OCAyNiAxOTQgNzFRMjAzIDg3IDIxNyAxMzlUMjQ1IDI0N1QyNjEgMzEzUTI2NiAzNDAgMjY2IDM1MlEyNjYgMzgwIDI1MSAzOTJUMjE3IDQwNFExNzcgNDA0IDE0MiAzNzJUOTMgMjkwUTkxIDI4MSA4OCAyODBUNzIgMjc4SDU4UTUyIDI4NCA1MiAyODlaIj48L3BhdGg+CjxwYXRoIHN0cm9rZS13aWR0aD0iMSIgaWQ9IkUxLU1KQU1TLTI1QTEiIGQ9Ik03MSAwUTU5IDQgNTUgMTZWMzQ2TDU2IDY3NlE2NCA2ODYgNzAgNjg5SDcwOVE3MTkgNjgxIDcyMiA2NzRWMTVRNzE5IDEwIDcwOSAxTDM5MCAwSDcxWk02ODIgNDBWNjQ5SDk1VjQwSDY4MloiPjwvcGF0aD4KPC9kZWZzPgo8ZyBzdHJva2U9ImN1cnJlbnRDb2xvciIgZmlsbD0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAiIHRyYW5zZm9ybT0ibWF0cml4KDEgMCAwIC0xIDAgMCkiIGFyaWEtaGlkZGVuPSJ0cnVlIj4KIDx1c2UgeGxpbms6aHJlZj0iI0UxLU1KTUFUSEktNzgiIHg9IjAiIHk9IjAiPjwvdXNlPgogPHVzZSB0cmFuc2Zvcm09InNjYWxlKDAuNzA3KSIgeGxpbms6aHJlZj0iI0UxLU1KQU1TLTI1QTEiIHg9IjgwOSIgeT0iNTgzIj48L3VzZT4KPC9nPgo8L3N2Zz4='
        },
        {
            action: '\\frac',
            label: '\\frac{X}{X}',
            svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjIuNjQ0ZXgiIGhlaWdodD0iNS4zNDNleCIgc3R5bGU9InZlcnRpY2FsLWFsaWduOiAtMS44MzhleDsiIHZpZXdCb3g9IjAgLTE1MDguOSAxMTM4LjUgMjMwMC4zIiByb2xlPSJpbWciIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgYXJpYS1sYWJlbGxlZGJ5PSJNYXRoSmF4LVNWRy0xLVRpdGxlIj4KPHRpdGxlIGlkPSJNYXRoSmF4LVNWRy0xLVRpdGxlIj5cZnJhY3tcc3F1YXJlfXtcc3F1YXJlfTwvdGl0bGU+CjxkZWZzIGFyaWEtaGlkZGVuPSJ0cnVlIj4KPHBhdGggc3Ryb2tlLXdpZHRoPSIxIiBpZD0iRTEtTUpBTVMtMjVBMSIgZD0iTTcxIDBRNTkgNCA1NSAxNlYzNDZMNTYgNjc2UTY0IDY4NiA3MCA2ODlINzA5UTcxOSA2ODEgNzIyIDY3NFYxNVE3MTkgMTAgNzA5IDFMMzkwIDBINzFaTTY4MiA0MFY2NDlIOTVWNDBINjgyWiI+PC9wYXRoPgo8L2RlZnM+CjxnIHN0cm9rZT0iY3VycmVudENvbG9yIiBmaWxsPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMCIgdHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgLTEgMCAwKSIgYXJpYS1oaWRkZW49InRydWUiPgo8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMjAsMCkiPgo8cmVjdCBzdHJva2U9Im5vbmUiIHdpZHRoPSI4OTgiIGhlaWdodD0iNjAiIHg9IjAiIHk9IjIyMCI+PC9yZWN0PgogPHVzZSB4bGluazpocmVmPSIjRTEtTUpBTVMtMjVBMSIgeD0iNjAiIHk9IjY3NiI+PC91c2U+CiA8dXNlIHhsaW5rOmhyZWY9IiNFMS1NSkFNUy0yNUExIiB4PSI2MCIgeT0iLTcxMCI+PC91c2U+CjwvZz4KPC9nPgo8L3N2Zz4='
        },
        {
            action: '\\int',
            label: '\\int_{X}^{X}',
            svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjMuOTc1ZXgiIGhlaWdodD0iNi4xNzZleCIgc3R5bGU9InZlcnRpY2FsLWFsaWduOiAtMi4zMzhleDsiIHZpZXdCb3g9IjAgLTE2NTIuNSAxNzExLjQgMjY1OS4xIiByb2xlPSJpbWciIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgYXJpYS1sYWJlbGxlZGJ5PSJNYXRoSmF4LVNWRy0xLVRpdGxlIj4KPHRpdGxlIGlkPSJNYXRoSmF4LVNWRy0xLVRpdGxlIj5caW50X3tcc3F1YXJlfV57XHNxdWFyZX08L3RpdGxlPgo8ZGVmcyBhcmlhLWhpZGRlbj0idHJ1ZSI+CjxwYXRoIHN0cm9rZS13aWR0aD0iMSIgaWQ9IkUxLU1KU1oyLTIyMkIiIGQ9Ik0xMTQgLTc5OFExMzIgLTgyNCAxNjUgLTgyNEgxNjdRMTk1IC04MjQgMjIzIC03NjRUMjc1IC02MDBUMzIwIC0zOTFUMzYyIC0xNjRRMzY1IC0xNDMgMzY3IC0xMzNRNDM5IDI5MiA1MjMgNjU1VDY0NSAxMTI3UTY1MSAxMTQ1IDY1NSAxMTU3VDY3MiAxMjAxVDY5OSAxMjU3VDczMyAxMzA2VDc3NyAxMzQ2VDgyOCAxMzYwUTg4NCAxMzYwIDkxMiAxMzI1VDk0NCAxMjQ1UTk0NCAxMjIwIDkzMiAxMjA1VDkwOSAxMTg2VDg4NyAxMTgzUTg2NiAxMTgzIDg0OSAxMTk4VDgzMiAxMjM5UTgzMiAxMjg3IDg4NSAxMjk2TDg4MiAxMzAwUTg3OSAxMzAzIDg3NCAxMzA3VDg2NiAxMzEzUTg1MSAxMzIzIDgzMyAxMzIzUTgxOSAxMzIzIDgwNyAxMzExVDc3NSAxMjU1VDczNiAxMTM5VDY4OSA5MzZUNjMzIDYyOFE1NzQgMjkzIDUxMCAtNVQ0MTAgLTQzN1QzNTUgLTYyOVEyNzggLTg2MiAxNjUgLTg2MlExMjUgLTg2MiA5MiAtODMxVDU1IC03NDZRNTUgLTcxMSA3NCAtNjk4VDExMiAtNjg1UTEzMyAtNjg1IDE1MCAtNzAwVDE2NyAtNzQxUTE2NyAtNzg5IDExNCAtNzk4WiI+PC9wYXRoPgo8cGF0aCBzdHJva2Utd2lkdGg9IjEiIGlkPSJFMS1NSkFNUy0yNUExIiBkPSJNNzEgMFE1OSA0IDU1IDE2VjM0Nkw1NiA2NzZRNjQgNjg2IDcwIDY4OUg3MDlRNzE5IDY4MSA3MjIgNjc0VjE1UTcxOSAxMCA3MDkgMUwzOTAgMEg3MVpNNjgyIDQwVjY0OUg5NVY0MEg2ODJaIj48L3BhdGg+CjwvZGVmcz4KPGcgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIGZpbGw9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIwIiB0cmFuc2Zvcm09Im1hdHJpeCgxIDAgMCAtMSAwIDApIiBhcmlhLWhpZGRlbj0idHJ1ZSI+CiA8dXNlIHhsaW5rOmhyZWY9IiNFMS1NSlNaMi0yMjJCIiB4PSIwIiB5PSIwIj48L3VzZT4KIDx1c2UgdHJhbnNmb3JtPSJzY2FsZSgwLjcwNykiIHhsaW5rOmhyZWY9IiNFMS1NSkFNUy0yNUExIiB4PSIxNTAwIiB5PSIxNTQwIj48L3VzZT4KIDx1c2UgdHJhbnNmb3JtPSJzY2FsZSgwLjcwNykiIHhsaW5rOmhyZWY9IiNFMS1NSkFNUy0yNUExIiB4PSI3ODciIHk9Ii0xMjcwIj48L3VzZT4KPC9nPgo8L3N2Zz4='
        },
        {
            action: '\\lim_',
            label: '\\lim_{X}',
            svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjMuMjNleCIgaGVpZ2h0PSIzLjg0M2V4IiBzdHlsZT0idmVydGljYWwtYWxpZ246IC0yLjAwNWV4OyIgdmlld0JveD0iMCAtNzkxLjMgMTM5MC41IDE2NTQuNSIgcm9sZT0iaW1nIiBmb2N1c2FibGU9ImZhbHNlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGFyaWEtbGFiZWxsZWRieT0iTWF0aEpheC1TVkctMS1UaXRsZSI+Cjx0aXRsZSBpZD0iTWF0aEpheC1TVkctMS1UaXRsZSI+XGxpbV97XHNxdWFyZX08L3RpdGxlPgo8ZGVmcyBhcmlhLWhpZGRlbj0idHJ1ZSI+CjxwYXRoIHN0cm9rZS13aWR0aD0iMSIgaWQ9IkUyLU1KTUFJTi02QyIgZD0iTTQyIDQ2SDU2UTk1IDQ2IDEwMyA2MFY2OFExMDMgNzcgMTAzIDkxVDEwMyAxMjRUMTA0IDE2N1QxMDQgMjE3VDEwNCAyNzJUMTA0IDMyOVExMDQgMzY2IDEwNCA0MDdUMTA0IDQ4MlQxMDQgNTQyVDEwMyA1ODZUMTAzIDYwM1ExMDAgNjIyIDg5IDYyOFQ0NCA2MzdIMjZWNjYwUTI2IDY4MyAyOCA2ODNMMzggNjg0UTQ4IDY4NSA2NyA2ODZUMTA0IDY4OFExMjEgNjg5IDE0MSA2OTBUMTcxIDY5M1QxODIgNjk0SDE4NVYzNzlRMTg1IDYyIDE4NiA2MFExOTAgNTIgMTk4IDQ5UTIxOSA0NiAyNDcgNDZIMjYzVjBIMjU1TDIzMiAxUTIwOSAyIDE4MyAyVDE0NSAzVDEwNyAzVDU3IDFMMzQgMEgyNlY0Nkg0MloiPjwvcGF0aD4KPHBhdGggc3Ryb2tlLXdpZHRoPSIxIiBpZD0iRTItTUpNQUlOLTY5IiBkPSJNNjkgNjA5UTY5IDYzNyA4NyA2NTNUMTMxIDY2OVExNTQgNjY3IDE3MSA2NTJUMTg4IDYwOVExODggNTc5IDE3MSA1NjRUMTI5IDU0OVExMDQgNTQ5IDg3IDU2NFQ2OSA2MDlaTTI0NyAwUTIzMiAzIDE0MyAzUTEzMiAzIDEwNiAzVDU2IDFMMzQgMEgyNlY0Nkg0MlE3MCA0NiA5MSA0OVExMDAgNTMgMTAyIDYwVDEwNCAxMDJWMjA1VjI5M1ExMDQgMzQ1IDEwMiAzNTlUODggMzc4UTc0IDM4NSA0MSAzODVIMzBWNDA4UTMwIDQzMSAzMiA0MzFMNDIgNDMyUTUyIDQzMyA3MCA0MzRUMTA2IDQzNlExMjMgNDM3IDE0MiA0MzhUMTcxIDQ0MVQxODIgNDQySDE4NVY2MlExOTAgNTIgMTk3IDUwVDIzMiA0NkgyNTVWMEgyNDdaIj48L3BhdGg+CjxwYXRoIHN0cm9rZS13aWR0aD0iMSIgaWQ9IkUyLU1KTUFJTi02RCIgZD0iTTQxIDQ2SDU1UTk0IDQ2IDEwMiA2MFY2OFExMDIgNzcgMTAyIDkxVDEwMiAxMjJUMTAzIDE2MVQxMDMgMjAzUTEwMyAyMzQgMTAzIDI2OVQxMDIgMzI4VjM1MVE5OSAzNzAgODggMzc2VDQzIDM4NUgyNVY0MDhRMjUgNDMxIDI3IDQzMUwzNyA0MzJRNDcgNDMzIDY1IDQzNFQxMDIgNDM2UTExOSA0MzcgMTM4IDQzOFQxNjcgNDQxVDE3OCA0NDJIMTgxVjQwMlExODEgMzY0IDE4MiAzNjRUMTg3IDM2OVQxOTkgMzg0VDIxOCA0MDJUMjQ3IDQyMVQyODUgNDM3UTMwNSA0NDIgMzM2IDQ0MlEzNTEgNDQyIDM2NCA0NDBUMzg3IDQzNFQ0MDYgNDI2VDQyMSA0MTdUNDMyIDQwNlQ0NDEgMzk1VDQ0OCAzODRUNDUyIDM3NFQ0NTUgMzY2TDQ1NyAzNjFMNDYwIDM2NVE0NjMgMzY5IDQ2NiAzNzNUNDc1IDM4NFQ0ODggMzk3VDUwMyA0MTBUNTIzIDQyMlQ1NDYgNDMyVDU3MiA0MzlUNjAzIDQ0MlE3MjkgNDQyIDc0MCAzMjlRNzQxIDMyMiA3NDEgMTkwVjEwNFE3NDEgNjYgNzQzIDU5VDc1NCA0OVE3NzUgNDYgODAzIDQ2SDgxOVYwSDgxMUw3ODggMVE3NjQgMiA3MzcgMlQ2OTkgM1E1OTYgMyA1ODcgMEg1NzlWNDZINTk1UTY1NiA0NiA2NTYgNjJRNjU3IDY0IDY1NyAyMDBRNjU2IDMzNSA2NTUgMzQzUTY0OSAzNzEgNjM1IDM4NVQ2MTEgNDAyVDU4NSA0MDRRNTQwIDQwNCA1MDYgMzcwUTQ3OSAzNDMgNDcyIDMxNVQ0NjQgMjMyVjE2OFYxMDhRNDY0IDc4IDQ2NSA2OFQ0NjggNTVUNDc3IDQ5UTQ5OCA0NiA1MjYgNDZINTQyVjBINTM0TDUxMCAxUTQ4NyAyIDQ2MCAyVDQyMiAzUTMxOSAzIDMxMCAwSDMwMlY0NkgzMThRMzc5IDQ2IDM3OSA2MlEzODAgNjQgMzgwIDIwMFEzNzkgMzM1IDM3OCAzNDNRMzcyIDM3MSAzNTggMzg1VDMzNCA0MDJUMzA4IDQwNFEyNjMgNDA0IDIyOSAzNzBRMjAyIDM0MyAxOTUgMzE1VDE4NyAyMzJWMTY4VjEwOFExODcgNzggMTg4IDY4VDE5MSA1NVQyMDAgNDlRMjIxIDQ2IDI0OSA0NkgyNjVWMEgyNTdMMjM0IDFRMjEwIDIgMTgzIDJUMTQ1IDNRNDIgMyAzMyAwSDI1VjQ2SDQxWiI+PC9wYXRoPgo8cGF0aCBzdHJva2Utd2lkdGg9IjEiIGlkPSJFMi1NSkFNUy0yNUExIiBkPSJNNzEgMFE1OSA0IDU1IDE2VjM0Nkw1NiA2NzZRNjQgNjg2IDcwIDY4OUg3MDlRNzE5IDY4MSA3MjIgNjc0VjE1UTcxOSAxMCA3MDkgMUwzOTAgMEg3MVpNNjgyIDQwVjY0OUg5NVY0MEg2ODJaIj48L3BhdGg+CjwvZGVmcz4KPGcgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIGZpbGw9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIwIiB0cmFuc2Zvcm09Im1hdHJpeCgxIDAgMCAtMSAwIDApIiBhcmlhLWhpZGRlbj0idHJ1ZSI+CiA8dXNlIHhsaW5rOmhyZWY9IiNFMi1NSk1BSU4tNkMiPjwvdXNlPgogPHVzZSB4bGluazpocmVmPSIjRTItTUpNQUlOLTY5IiB4PSIyNzgiIHk9IjAiPjwvdXNlPgogPHVzZSB4bGluazpocmVmPSIjRTItTUpNQUlOLTZEIiB4PSI1NTciIHk9IjAiPjwvdXNlPgogPHVzZSB0cmFuc2Zvcm09InNjYWxlKDAuNzA3KSIgeGxpbms6aHJlZj0iI0UyLU1KQU1TLTI1QTEiIHg9IjU5MyIgeT0iLTkyOCI+PC91c2U+CjwvZz4KPC9zdmc+'
        },
        {
            action: '\\overrightarrow',
            label: '\\overrightarrow{X}',
            svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjIuMzI0ZXgiIGhlaWdodD0iMy42NzZleCIgc3R5bGU9InZlcnRpY2FsLWFsaWduOiAtMC4zMzhleDsiIHZpZXdCb3g9IjAgLTE0MzcuMiAxMDAwLjUgMTU4Mi43IiByb2xlPSJpbWciIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgYXJpYS1sYWJlbGxlZGJ5PSJNYXRoSmF4LVNWRy0xLVRpdGxlIj4KPHRpdGxlIGlkPSJNYXRoSmF4LVNWRy0xLVRpdGxlIj5cb3ZlcnJpZ2h0YXJyb3d7XHNxdWFyZX08L3RpdGxlPgo8ZGVmcyBhcmlhLWhpZGRlbj0idHJ1ZSI+CjxwYXRoIHN0cm9rZS13aWR0aD0iMSIgaWQ9IkUxLU1KQU1TLTI1QTEiIGQ9Ik03MSAwUTU5IDQgNTUgMTZWMzQ2TDU2IDY3NlE2NCA2ODYgNzAgNjg5SDcwOVE3MTkgNjgxIDcyMiA2NzRWMTVRNzE5IDEwIDcwOSAxTDM5MCAwSDcxWk02ODIgNDBWNjQ5SDk1VjQwSDY4MloiPjwvcGF0aD4KPHBhdGggc3Ryb2tlLXdpZHRoPSIxIiBpZD0iRTEtTUpNQUlOLTIwRDciIGQ9Ik0tMTIzIDY5NFEtMTIzIDcwMiAtMTE4IDcwOFQtMTAzIDcxNFEtOTMgNzE0IC04OCA3MDZULTgwIDY4N1QtNjcgNjYwVC00MCA2MzNRLTI5IDYyNiAtMjkgNjE1US0yOSA2MDYgLTM2IDYwMFQtNTMgNTkwVC04MyA1NzFULTEyMSA1MzFRLTEzNSA1MTYgLTE0MyA1MTZULTE1NyA1MjJULTE2MyA1MzZULTE1MiA1NTlULTEyOSA1ODRULTExNiA1OTVILTI4N0wtNDU4IDU5NlEtNDU5IDU5NyAtNDYxIDU5OVQtNDY2IDYwMlQtNDY5IDYwN1QtNDcxIDYxNVEtNDcxIDYyMiAtNDU4IDYzNUgtOTlRLTEyMyA2NzMgLTEyMyA2OTRaIj48L3BhdGg+CjxwYXRoIHN0cm9rZS13aWR0aD0iMSIgaWQ9IkUxLU1KTUFJTi0yMTkyIiBkPSJNNTYgMjM3VDU2IDI1MFQ3MCAyNzBIODM1UTcxOSAzNTcgNjkyIDQ5M1E2OTIgNDk0IDY5MiA0OTZUNjkxIDQ5OVE2OTEgNTExIDcwOCA1MTFINzExUTcyMCA1MTEgNzIzIDUxMFQ3MjkgNTA2VDczMiA0OTdUNzM1IDQ4MVQ3NDMgNDU2UTc2NSAzODkgODE2IDMzNlQ5MzUgMjYxUTk0NCAyNTggOTQ0IDI1MFE5NDQgMjQ0IDkzOSAyNDFUOTE1IDIzMVQ4NzcgMjEyUTgzNiAxODYgODA2IDE1MlQ3NjEgODVUNzQwIDM1VDczMiA0UTczMCAtNiA3MjcgLThUNzExIC0xMVE2OTEgLTExIDY5MSAwUTY5MSA3IDY5NiAyNVE3MjggMTUxIDgzNSAyMzBINzBRNTYgMjM3IDU2IDI1MFoiPjwvcGF0aD4KPC9kZWZzPgo8ZyBzdHJva2U9ImN1cnJlbnRDb2xvciIgZmlsbD0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAiIHRyYW5zZm9ybT0ibWF0cml4KDEgMCAwIC0xIDAgMCkiIGFyaWEtaGlkZGVuPSJ0cnVlIj4KIDx1c2UgeGxpbms6aHJlZj0iI0UxLU1KQU1TLTI1QTEiIHg9IjExMSIgeT0iMCI+PC91c2U+CiA8dXNlIHhsaW5rOmhyZWY9IiNFMS1NSk1BSU4tMjE5MiIgeD0iMCIgeT0iODA5Ij48L3VzZT4KPC9nPgo8L3N2Zz4='
        },
        {
            action: '\\overleftarrow',
            label: '\\overleftarrow{X}',
            svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjIuMzI0ZXgiIGhlaWdodD0iMy42NzZleCIgc3R5bGU9InZlcnRpY2FsLWFsaWduOiAtMC4zMzhleDsiIHZpZXdCb3g9IjAgLTE0MzcuMiAxMDAwLjUgMTU4Mi43IiByb2xlPSJpbWciIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgYXJpYS1sYWJlbGxlZGJ5PSJNYXRoSmF4LVNWRy0xLVRpdGxlIj4KPHRpdGxlIGlkPSJNYXRoSmF4LVNWRy0xLVRpdGxlIj5cb3ZlcmxlZnRhcnJvd3tcc3F1YXJlfTwvdGl0bGU+CjxkZWZzIGFyaWEtaGlkZGVuPSJ0cnVlIj4KPHBhdGggc3Ryb2tlLXdpZHRoPSIxIiBpZD0iRTEtTUpBTVMtMjVBMSIgZD0iTTcxIDBRNTkgNCA1NSAxNlYzNDZMNTYgNjc2UTY0IDY4NiA3MCA2ODlINzA5UTcxOSA2ODEgNzIyIDY3NFYxNVE3MTkgMTAgNzA5IDFMMzkwIDBINzFaTTY4MiA0MFY2NDlIOTVWNDBINjgyWiI+PC9wYXRoPgo8cGF0aCBzdHJva2Utd2lkdGg9IjEiIGlkPSJFMS1NSk1BSU4tMjE5MCIgZD0iTTk0NCAyNjFUOTQ0IDI1MFQ5MjkgMjMwSDE2NVExNjcgMjI4IDE4MiAyMTZUMjExIDE4OVQyNDQgMTUyVDI3NyA5NlQzMDMgMjVRMzA4IDcgMzA4IDBRMzA4IC0xMSAyODggLTExUTI4MSAtMTEgMjc4IC0xMVQyNzIgLTdUMjY3IDJUMjYzIDIxUTI0NSA5NCAxOTUgMTUxVDczIDIzNlE1OCAyNDIgNTUgMjQ3UTU1IDI1NCA1OSAyNTdUNzMgMjY0UTEyMSAyODMgMTU4IDMxNFQyMTUgMzc1VDI0NyA0MzRUMjY0IDQ4MEwyNjcgNDk3UTI2OSA1MDMgMjcwIDUwNVQyNzUgNTA5VDI4OCA1MTFRMzA4IDUxMSAzMDggNTAwUTMwOCA0OTMgMzAzIDQ3NVEyOTMgNDM4IDI3OCA0MDZUMjQ2IDM1MlQyMTUgMzE1VDE4NSAyODdUMTY1IDI3MEg5MjlROTQ0IDI2MSA5NDQgMjUwWiI+PC9wYXRoPgo8L2RlZnM+CjxnIHN0cm9rZT0iY3VycmVudENvbG9yIiBmaWxsPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMCIgdHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgLTEgMCAwKSIgYXJpYS1oaWRkZW49InRydWUiPgogPHVzZSB4bGluazpocmVmPSIjRTEtTUpBTVMtMjVBMSIgeD0iMTExIiB5PSIwIj48L3VzZT4KIDx1c2UgeGxpbms6aHJlZj0iI0UxLU1KTUFJTi0yMTkwIiB4PSIwIiB5PSI4MDkiPjwvdXNlPgo8L2c+Cjwvc3ZnPg=='
        },
        {
            action: '\\sin',
            svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjIuODU2ZXgiIGhlaWdodD0iMi4xNzZleCIgc3R5bGU9InZlcnRpY2FsLWFsaWduOiAtMC4zMzhleDsiIHZpZXdCb3g9IjAgLTc5MS4zIDEyMjkuNSA5MzYuOSIgcm9sZT0iaW1nIiBmb2N1c2FibGU9ImZhbHNlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGFyaWEtbGFiZWxsZWRieT0iTWF0aEpheC1TVkctMS1UaXRsZSI+Cjx0aXRsZSBpZD0iTWF0aEpheC1TVkctMS1UaXRsZSI+XHNpbjwvdGl0bGU+CjxkZWZzIGFyaWEtaGlkZGVuPSJ0cnVlIj4KPHBhdGggc3Ryb2tlLXdpZHRoPSIxIiBpZD0iRTEtTUpNQUlOLTczIiBkPSJNMjk1IDMxNlEyOTUgMzU2IDI2OCAzODVUMTkwIDQxNFExNTQgNDE0IDEyOCA0MDFROTggMzgyIDk4IDM0OVE5NyAzNDQgOTggMzM2VDExNCAzMTJUMTU3IDI4N1ExNzUgMjgyIDIwMSAyNzhUMjQ1IDI2OVQyNzcgMjU2UTI5NCAyNDggMzEwIDIzNlQzNDIgMTk1VDM1OSAxMzNRMzU5IDcxIDMyMSAzMVQxOTggLTEwSDE5MFExMzggLTEwIDk0IDI2TDg2IDE5TDc3IDEwUTcxIDQgNjUgLTFMNTQgLTExSDQ2SDQyUTM5IC0xMSAzMyAtNVY3NFYxMzJRMzMgMTUzIDM1IDE1N1Q0NSAxNjJINTRRNjYgMTYyIDcwIDE1OFQ3NSAxNDZUODIgMTE5VDEwMSA3N1ExMzYgMjYgMTk4IDI2UTI5NSAyNiAyOTUgMTA0UTI5NSAxMzMgMjc3IDE1MVEyNTcgMTc1IDE5NCAxODdUMTExIDIxMFE3NSAyMjcgNTQgMjU2VDMzIDMxOFEzMyAzNTcgNTAgMzg0VDkzIDQyNFQxNDMgNDQyVDE4NyA0NDdIMTk4UTIzOCA0NDcgMjY4IDQzMkwyODMgNDI0TDI5MiA0MzFRMzAyIDQ0MCAzMTQgNDQ4SDMyMkgzMjZRMzI5IDQ0OCAzMzUgNDQyVjMxMEwzMjkgMzA0SDMwMVEyOTUgMzEwIDI5NSAzMTZaIj48L3BhdGg+CjxwYXRoIHN0cm9rZS13aWR0aD0iMSIgaWQ9IkUxLU1KTUFJTi02OSIgZD0iTTY5IDYwOVE2OSA2MzcgODcgNjUzVDEzMSA2NjlRMTU0IDY2NyAxNzEgNjUyVDE4OCA2MDlRMTg4IDU3OSAxNzEgNTY0VDEyOSA1NDlRMTA0IDU0OSA4NyA1NjRUNjkgNjA5Wk0yNDcgMFEyMzIgMyAxNDMgM1ExMzIgMyAxMDYgM1Q1NiAxTDM0IDBIMjZWNDZINDJRNzAgNDYgOTEgNDlRMTAwIDUzIDEwMiA2MFQxMDQgMTAyVjIwNVYyOTNRMTA0IDM0NSAxMDIgMzU5VDg4IDM3OFE3NCAzODUgNDEgMzg1SDMwVjQwOFEzMCA0MzEgMzIgNDMxTDQyIDQzMlE1MiA0MzMgNzAgNDM0VDEwNiA0MzZRMTIzIDQzNyAxNDIgNDM4VDE3MSA0NDFUMTgyIDQ0MkgxODVWNjJRMTkwIDUyIDE5NyA1MFQyMzIgNDZIMjU1VjBIMjQ3WiI+PC9wYXRoPgo8cGF0aCBzdHJva2Utd2lkdGg9IjEiIGlkPSJFMS1NSk1BSU4tNkUiIGQ9Ik00MSA0Nkg1NVE5NCA0NiAxMDIgNjBWNjhRMTAyIDc3IDEwMiA5MVQxMDIgMTIyVDEwMyAxNjFUMTAzIDIwM1ExMDMgMjM0IDEwMyAyNjlUMTAyIDMyOFYzNTFROTkgMzcwIDg4IDM3NlQ0MyAzODVIMjVWNDA4UTI1IDQzMSAyNyA0MzFMMzcgNDMyUTQ3IDQzMyA2NSA0MzRUMTAyIDQzNlExMTkgNDM3IDEzOCA0MzhUMTY3IDQ0MVQxNzggNDQySDE4MVY0MDJRMTgxIDM2NCAxODIgMzY0VDE4NyAzNjlUMTk5IDM4NFQyMTggNDAyVDI0NyA0MjFUMjg1IDQzN1EzMDUgNDQyIDMzNiA0NDJRNDUwIDQzOCA0NjMgMzI5UTQ2NCAzMjIgNDY0IDE5MFYxMDRRNDY0IDY2IDQ2NiA1OVQ0NzcgNDlRNDk4IDQ2IDUyNiA0Nkg1NDJWMEg1MzRMNTEwIDFRNDg3IDIgNDYwIDJUNDIyIDNRMzE5IDMgMzEwIDBIMzAyVjQ2SDMxOFEzNzkgNDYgMzc5IDYyUTM4MCA2NCAzODAgMjAwUTM3OSAzMzUgMzc4IDM0M1EzNzIgMzcxIDM1OCAzODVUMzM0IDQwMlQzMDggNDA0UTI2MyA0MDQgMjI5IDM3MFEyMDIgMzQzIDE5NSAzMTVUMTg3IDIzMlYxNjhWMTA4UTE4NyA3OCAxODggNjhUMTkxIDU1VDIwMCA0OVEyMjEgNDYgMjQ5IDQ2SDI2NVYwSDI1N0wyMzQgMVEyMTAgMiAxODMgMlQxNDUgM1E0MiAzIDMzIDBIMjVWNDZINDFaIj48L3BhdGg+CjwvZGVmcz4KPGcgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIGZpbGw9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIwIiB0cmFuc2Zvcm09Im1hdHJpeCgxIDAgMCAtMSAwIDApIiBhcmlhLWhpZGRlbj0idHJ1ZSI+CiA8dXNlIHhsaW5rOmhyZWY9IiNFMS1NSk1BSU4tNzMiPjwvdXNlPgogPHVzZSB4bGluazpocmVmPSIjRTEtTUpNQUlOLTY5IiB4PSIzOTQiIHk9IjAiPjwvdXNlPgogPHVzZSB4bGluazpocmVmPSIjRTEtTUpNQUlOLTZFIiB4PSI2NzMiIHk9IjAiPjwvdXNlPgo8L2c+Cjwvc3ZnPg=='
        },
        {
            action: '\\cos',
            svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjMuMTExZXgiIGhlaWdodD0iMS42NzZleCIgc3R5bGU9InZlcnRpY2FsLWFsaWduOiAtMC4zMzhleDsiIHZpZXdCb3g9IjAgLTU3Ni4xIDEzMzkuNSA3MjEuNiIgcm9sZT0iaW1nIiBmb2N1c2FibGU9ImZhbHNlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGFyaWEtbGFiZWxsZWRieT0iTWF0aEpheC1TVkctMS1UaXRsZSI+Cjx0aXRsZSBpZD0iTWF0aEpheC1TVkctMS1UaXRsZSI+XGNvczwvdGl0bGU+CjxkZWZzIGFyaWEtaGlkZGVuPSJ0cnVlIj4KPHBhdGggc3Ryb2tlLXdpZHRoPSIxIiBpZD0iRTEtTUpNQUlOLTYzIiBkPSJNMzcwIDMwNVQzNDkgMzA1VDMxMyAzMjBUMjk3IDM1OFEyOTcgMzgxIDMxMiAzOTZRMzE3IDQwMSAzMTcgNDAyVDMwNyA0MDRRMjgxIDQwOCAyNTggNDA4UTIwOSA0MDggMTc4IDM3NlExMzEgMzI5IDEzMSAyMTlRMTMxIDEzNyAxNjIgOTBRMjAzIDI5IDI3MiAyOVEzMTMgMjkgMzM4IDU1VDM3NCAxMTdRMzc2IDEyNSAzNzkgMTI3VDM5NSAxMjlINDA5UTQxNSAxMjMgNDE1IDEyMFE0MTUgMTE2IDQxMSAxMDRUMzk1IDcxVDM2NiAzM1QzMTggMlQyNDkgLTExUTE2MyAtMTEgOTkgNTNUMzQgMjE0UTM0IDMxOCA5OSAzODNUMjUwIDQ0OFQzNzAgNDIxVDQwNCAzNTdRNDA0IDMzNCAzODcgMzIwWiI+PC9wYXRoPgo8cGF0aCBzdHJva2Utd2lkdGg9IjEiIGlkPSJFMS1NSk1BSU4tNkYiIGQ9Ik0yOCAyMTRRMjggMzA5IDkzIDM3OFQyNTAgNDQ4UTM0MCA0NDggNDA1IDM4MFQ0NzEgMjE1UTQ3MSAxMjAgNDA3IDU1VDI1MCAtMTBRMTUzIC0xMCA5MSA1N1QyOCAyMTRaTTI1MCAzMFEzNzIgMzAgMzcyIDE5M1YyMjVWMjUwUTM3MiAyNzIgMzcxIDI4OFQzNjQgMzI2VDM0OCAzNjJUMzE3IDM5MFQyNjggNDEwUTI2MyA0MTEgMjUyIDQxMVEyMjIgNDExIDE5NSAzOTlRMTUyIDM3NyAxMzkgMzM4VDEyNiAyNDZWMjI2UTEyNiAxMzAgMTQ1IDkxUTE3NyAzMCAyNTAgMzBaIj48L3BhdGg+CjxwYXRoIHN0cm9rZS13aWR0aD0iMSIgaWQ9IkUxLU1KTUFJTi03MyIgZD0iTTI5NSAzMTZRMjk1IDM1NiAyNjggMzg1VDE5MCA0MTRRMTU0IDQxNCAxMjggNDAxUTk4IDM4MiA5OCAzNDlROTcgMzQ0IDk4IDMzNlQxMTQgMzEyVDE1NyAyODdRMTc1IDI4MiAyMDEgMjc4VDI0NSAyNjlUMjc3IDI1NlEyOTQgMjQ4IDMxMCAyMzZUMzQyIDE5NVQzNTkgMTMzUTM1OSA3MSAzMjEgMzFUMTk4IC0xMEgxOTBRMTM4IC0xMCA5NCAyNkw4NiAxOUw3NyAxMFE3MSA0IDY1IC0xTDU0IC0xMUg0Nkg0MlEzOSAtMTEgMzMgLTVWNzRWMTMyUTMzIDE1MyAzNSAxNTdUNDUgMTYySDU0UTY2IDE2MiA3MCAxNThUNzUgMTQ2VDgyIDExOVQxMDEgNzdRMTM2IDI2IDE5OCAyNlEyOTUgMjYgMjk1IDEwNFEyOTUgMTMzIDI3NyAxNTFRMjU3IDE3NSAxOTQgMTg3VDExMSAyMTBRNzUgMjI3IDU0IDI1NlQzMyAzMThRMzMgMzU3IDUwIDM4NFQ5MyA0MjRUMTQzIDQ0MlQxODcgNDQ3SDE5OFEyMzggNDQ3IDI2OCA0MzJMMjgzIDQyNEwyOTIgNDMxUTMwMiA0NDAgMzE0IDQ0OEgzMjJIMzI2UTMyOSA0NDggMzM1IDQ0MlYzMTBMMzI5IDMwNEgzMDFRMjk1IDMxMCAyOTUgMzE2WiI+PC9wYXRoPgo8L2RlZnM+CjxnIHN0cm9rZT0iY3VycmVudENvbG9yIiBmaWxsPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMCIgdHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgLTEgMCAwKSIgYXJpYS1oaWRkZW49InRydWUiPgogPHVzZSB4bGluazpocmVmPSIjRTEtTUpNQUlOLTYzIj48L3VzZT4KIDx1c2UgeGxpbms6aHJlZj0iI0UxLU1KTUFJTi02RiIgeD0iNDQ0IiB5PSIwIj48L3VzZT4KIDx1c2UgeGxpbms6aHJlZj0iI0UxLU1KTUFJTi03MyIgeD0iOTQ1IiB5PSIwIj48L3VzZT4KPC9nPgo8L3N2Zz4='
        },
        {
            action: '\\tan',
            svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjMuMzZleCIgaGVpZ2h0PSIyLjAwOWV4IiBzdHlsZT0idmVydGljYWwtYWxpZ246IC0wLjMzOGV4OyIgdmlld0JveD0iMCAtNzE5LjYgMTQ0Ni41IDg2NS4xIiByb2xlPSJpbWciIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgYXJpYS1sYWJlbGxlZGJ5PSJNYXRoSmF4LVNWRy0xLVRpdGxlIj4KPHRpdGxlIGlkPSJNYXRoSmF4LVNWRy0xLVRpdGxlIj5cdGFuPC90aXRsZT4KPGRlZnMgYXJpYS1oaWRkZW49InRydWUiPgo8cGF0aCBzdHJva2Utd2lkdGg9IjEiIGlkPSJFMS1NSk1BSU4tNzQiIGQ9Ik0yNyA0MjJRODAgNDI2IDEwOSA0NzhUMTQxIDYwMFY2MTVIMTgxVjQzMUgzMTZWMzg1SDE4MVYyNDFRMTgyIDExNiAxODIgMTAwVDE4OSA2OFEyMDMgMjkgMjM4IDI5UTI4MiAyOSAyOTIgMTAwUTI5MyAxMDggMjkzIDE0NlYxODFIMzMzVjE0NlYxMzRRMzMzIDU3IDI5MSAxN1EyNjQgLTEwIDIyMSAtMTBRMTg3IC0xMCAxNjIgMlQxMjQgMzNUMTA1IDY4VDk4IDEwMFE5NyAxMDcgOTcgMjQ4VjM4NUgxOFY0MjJIMjdaIj48L3BhdGg+CjxwYXRoIHN0cm9rZS13aWR0aD0iMSIgaWQ9IkUxLU1KTUFJTi02MSIgZD0iTTEzNyAzMDVUMTE1IDMwNVQ3OCAzMjBUNjMgMzU5UTYzIDM5NCA5NyA0MjFUMjE4IDQ0OFEyOTEgNDQ4IDMzNiA0MTZUMzk2IDM0MFE0MDEgMzI2IDQwMSAzMDlUNDAyIDE5NFYxMjRRNDAyIDc2IDQwNyA1OFQ0MjggNDBRNDQzIDQwIDQ0OCA1NlQ0NTMgMTA5VjE0NUg0OTNWMTA2UTQ5MiA2NiA0OTAgNTlRNDgxIDI5IDQ1NSAxMlQ0MDAgLTZUMzUzIDEyVDMyOSA1NFY1OEwzMjcgNTVRMzI1IDUyIDMyMiA0OVQzMTQgNDBUMzAyIDI5VDI4NyAxN1QyNjkgNlQyNDcgLTJUMjIxIC04VDE5MCAtMTFRMTMwIC0xMSA4MiAyMFQzNCAxMDdRMzQgMTI4IDQxIDE0N1Q2OCAxODhUMTE2IDIyNVQxOTQgMjUzVDMwNCAyNjhIMzE4VjI5MFEzMTggMzI0IDMxMiAzNDBRMjkwIDQxMSAyMTUgNDExUTE5NyA0MTEgMTgxIDQxMFQxNTYgNDA2VDE0OCA0MDNRMTcwIDM4OCAxNzAgMzU5UTE3MCAzMzQgMTU0IDMyMFpNMTI2IDEwNlExMjYgNzUgMTUwIDUxVDIwOSAyNlEyNDcgMjYgMjc2IDQ5VDMxNSAxMDlRMzE3IDExNiAzMTggMTc1UTMxOCAyMzMgMzE3IDIzM1EzMDkgMjMzIDI5NiAyMzJUMjUxIDIyM1QxOTMgMjAzVDE0NyAxNjZUMTI2IDEwNloiPjwvcGF0aD4KPHBhdGggc3Ryb2tlLXdpZHRoPSIxIiBpZD0iRTEtTUpNQUlOLTZFIiBkPSJNNDEgNDZINTVROTQgNDYgMTAyIDYwVjY4UTEwMiA3NyAxMDIgOTFUMTAyIDEyMlQxMDMgMTYxVDEwMyAyMDNRMTAzIDIzNCAxMDMgMjY5VDEwMiAzMjhWMzUxUTk5IDM3MCA4OCAzNzZUNDMgMzg1SDI1VjQwOFEyNSA0MzEgMjcgNDMxTDM3IDQzMlE0NyA0MzMgNjUgNDM0VDEwMiA0MzZRMTE5IDQzNyAxMzggNDM4VDE2NyA0NDFUMTc4IDQ0MkgxODFWNDAyUTE4MSAzNjQgMTgyIDM2NFQxODcgMzY5VDE5OSAzODRUMjE4IDQwMlQyNDcgNDIxVDI4NSA0MzdRMzA1IDQ0MiAzMzYgNDQyUTQ1MCA0MzggNDYzIDMyOVE0NjQgMzIyIDQ2NCAxOTBWMTA0UTQ2NCA2NiA0NjYgNTlUNDc3IDQ5UTQ5OCA0NiA1MjYgNDZINTQyVjBINTM0TDUxMCAxUTQ4NyAyIDQ2MCAyVDQyMiAzUTMxOSAzIDMxMCAwSDMwMlY0NkgzMThRMzc5IDQ2IDM3OSA2MlEzODAgNjQgMzgwIDIwMFEzNzkgMzM1IDM3OCAzNDNRMzcyIDM3MSAzNTggMzg1VDMzNCA0MDJUMzA4IDQwNFEyNjMgNDA0IDIyOSAzNzBRMjAyIDM0MyAxOTUgMzE1VDE4NyAyMzJWMTY4VjEwOFExODcgNzggMTg4IDY4VDE5MSA1NVQyMDAgNDlRMjIxIDQ2IDI0OSA0NkgyNjVWMEgyNTdMMjM0IDFRMjEwIDIgMTgzIDJUMTQ1IDNRNDIgMyAzMyAwSDI1VjQ2SDQxWiI+PC9wYXRoPgo8L2RlZnM+CjxnIHN0cm9rZT0iY3VycmVudENvbG9yIiBmaWxsPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMCIgdHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgLTEgMCAwKSIgYXJpYS1oaWRkZW49InRydWUiPgogPHVzZSB4bGluazpocmVmPSIjRTEtTUpNQUlOLTc0Ij48L3VzZT4KIDx1c2UgeGxpbms6aHJlZj0iI0UxLU1KTUFJTi02MSIgeD0iMzg5IiB5PSIwIj48L3VzZT4KIDx1c2UgeGxpbms6aHJlZj0iI0UxLU1KTUFJTi02RSIgeD0iODkwIiB5PSIwIj48L3VzZT4KPC9nPgo8L3N2Zz4='
        },
        {
            action: '|',
            label: '|X|',
            svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjMuMTAyZXgiIGhlaWdodD0iMi44NDNleCIgc3R5bGU9InZlcnRpY2FsLWFsaWduOiAtMC44MzhleDsiIHZpZXdCb3g9IjAgLTg2My4xIDEzMzUuNSAxMjIzLjkiIHJvbGU9ImltZyIgZm9jdXNhYmxlPSJmYWxzZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBhcmlhLWxhYmVsbGVkYnk9Ik1hdGhKYXgtU1ZHLTEtVGl0bGUiPgo8dGl0bGUgaWQ9Ik1hdGhKYXgtU1ZHLTEtVGl0bGUiPnxcc3F1YXJlfDwvdGl0bGU+CjxkZWZzIGFyaWEtaGlkZGVuPSJ0cnVlIj4KPHBhdGggc3Ryb2tlLXdpZHRoPSIxIiBpZD0iRTEtTUpNQUlOLTdDIiBkPSJNMTM5IC0yNDlIMTM3UTEyNSAtMjQ5IDExOSAtMjM1VjI1MUwxMjAgNzM3UTEzMCA3NTAgMTM5IDc1MFExNTIgNzUwIDE1OSA3MzVWLTIzNVExNTEgLTI0OSAxNDEgLTI0OUgxMzlaIj48L3BhdGg+CjxwYXRoIHN0cm9rZS13aWR0aD0iMSIgaWQ9IkUxLU1KQU1TLTI1QTEiIGQ9Ik03MSAwUTU5IDQgNTUgMTZWMzQ2TDU2IDY3NlE2NCA2ODYgNzAgNjg5SDcwOVE3MTkgNjgxIDcyMiA2NzRWMTVRNzE5IDEwIDcwOSAxTDM5MCAwSDcxWk02ODIgNDBWNjQ5SDk1VjQwSDY4MloiPjwvcGF0aD4KPC9kZWZzPgo8ZyBzdHJva2U9ImN1cnJlbnRDb2xvciIgZmlsbD0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAiIHRyYW5zZm9ybT0ibWF0cml4KDEgMCAwIC0xIDAgMCkiIGFyaWEtaGlkZGVuPSJ0cnVlIj4KIDx1c2UgeGxpbms6aHJlZj0iI0UxLU1KTUFJTi03QyIgeD0iMCIgeT0iMCI+PC91c2U+CiA8dXNlIHhsaW5rOmhyZWY9IiNFMS1NSkFNUy0yNUExIiB4PSIyNzgiIHk9IjAiPjwvdXNlPgogPHVzZSB4bGluazpocmVmPSIjRTEtTUpNQUlOLTdDIiB4PSIxMDU3IiB5PSIwIj48L3VzZT4KPC9nPgo8L3N2Zz4='
        },
        {
            action: '[x]',
            label: '[X]',
            useWrite: true,
            svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjMuMTAyZXgiIGhlaWdodD0iMi44NDNleCIgc3R5bGU9InZlcnRpY2FsLWFsaWduOiAtMC44MzhleDsiIHZpZXdCb3g9IjAgLTg2My4xIDEzMzUuNSAxMjIzLjkiIHJvbGU9ImltZyIgZm9jdXNhYmxlPSJmYWxzZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBhcmlhLWxhYmVsbGVkYnk9Ik1hdGhKYXgtU1ZHLTEtVGl0bGUiPgo8dGl0bGUgaWQ9Ik1hdGhKYXgtU1ZHLTEtVGl0bGUiPltcc3F1YXJlXTwvdGl0bGU+CjxkZWZzIGFyaWEtaGlkZGVuPSJ0cnVlIj4KPHBhdGggc3Ryb2tlLXdpZHRoPSIxIiBpZD0iRTEtTUpNQUlOLTVCIiBkPSJNMTE4IC0yNTBWNzUwSDI1NVY3MTBIMTU4Vi0yMTBIMjU1Vi0yNTBIMTE4WiI+PC9wYXRoPgo8cGF0aCBzdHJva2Utd2lkdGg9IjEiIGlkPSJFMS1NSkFNUy0yNUExIiBkPSJNNzEgMFE1OSA0IDU1IDE2VjM0Nkw1NiA2NzZRNjQgNjg2IDcwIDY4OUg3MDlRNzE5IDY4MSA3MjIgNjc0VjE1UTcxOSAxMCA3MDkgMUwzOTAgMEg3MVpNNjgyIDQwVjY0OUg5NVY0MEg2ODJaIj48L3BhdGg+CjxwYXRoIHN0cm9rZS13aWR0aD0iMSIgaWQ9IkUxLU1KTUFJTi01RCIgZD0iTTIyIDcxMFY3NTBIMTU5Vi0yNTBIMjJWLTIxMEgxMTlWNzEwSDIyWiI+PC9wYXRoPgo8L2RlZnM+CjxnIHN0cm9rZT0iY3VycmVudENvbG9yIiBmaWxsPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMCIgdHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgLTEgMCAwKSIgYXJpYS1oaWRkZW49InRydWUiPgogPHVzZSB4bGluazpocmVmPSIjRTEtTUpNQUlOLTVCIiB4PSIwIiB5PSIwIj48L3VzZT4KIDx1c2UgeGxpbms6aHJlZj0iI0UxLU1KQU1TLTI1QTEiIHg9IjI3OCIgeT0iMCI+PC91c2U+CiA8dXNlIHhsaW5rOmhyZWY9IiNFMS1NSk1BSU4tNUQiIHg9IjEwNTciIHk9IjAiPjwvdXNlPgo8L2c+Cjwvc3ZnPg=='
        },
        {
            action: ']x]',
            label: ']X]',
            useWrite: true,
            svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjMuMTAyZXgiIGhlaWdodD0iMi44NDNleCIgc3R5bGU9InZlcnRpY2FsLWFsaWduOiAtMC44MzhleDsiIHZpZXdCb3g9IjAgLTg2My4xIDEzMzUuNSAxMjIzLjkiIHJvbGU9ImltZyIgZm9jdXNhYmxlPSJmYWxzZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBhcmlhLWxhYmVsbGVkYnk9Ik1hdGhKYXgtU1ZHLTEtVGl0bGUiPgo8dGl0bGUgaWQ9Ik1hdGhKYXgtU1ZHLTEtVGl0bGUiPl1cc3F1YXJlXTwvdGl0bGU+CjxkZWZzIGFyaWEtaGlkZGVuPSJ0cnVlIj4KPHBhdGggc3Ryb2tlLXdpZHRoPSIxIiBpZD0iRTEtTUpNQUlOLTVEIiBkPSJNMjIgNzEwVjc1MEgxNTlWLTI1MEgyMlYtMjEwSDExOVY3MTBIMjJaIj48L3BhdGg+CjxwYXRoIHN0cm9rZS13aWR0aD0iMSIgaWQ9IkUxLU1KQU1TLTI1QTEiIGQ9Ik03MSAwUTU5IDQgNTUgMTZWMzQ2TDU2IDY3NlE2NCA2ODYgNzAgNjg5SDcwOVE3MTkgNjgxIDcyMiA2NzRWMTVRNzE5IDEwIDcwOSAxTDM5MCAwSDcxWk02ODIgNDBWNjQ5SDk1VjQwSDY4MloiPjwvcGF0aD4KPC9kZWZzPgo8ZyBzdHJva2U9ImN1cnJlbnRDb2xvciIgZmlsbD0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAiIHRyYW5zZm9ybT0ibWF0cml4KDEgMCAwIC0xIDAgMCkiIGFyaWEtaGlkZGVuPSJ0cnVlIj4KIDx1c2UgeGxpbms6aHJlZj0iI0UxLU1KTUFJTi01RCIgeD0iMCIgeT0iMCI+PC91c2U+CiA8dXNlIHhsaW5rOmhyZWY9IiNFMS1NSkFNUy0yNUExIiB4PSIyNzgiIHk9IjAiPjwvdXNlPgogPHVzZSB4bGluazpocmVmPSIjRTEtTUpNQUlOLTVEIiB4PSIxMDU3IiB5PSIwIj48L3VzZT4KPC9nPgo8L3N2Zz4='
        },
        {
            action: '\\cases',
            label: '\\begin{cases}X\\\\X\\end{cases}',
            svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjQuMzAzZXgiIGhlaWdodD0iNi4xNzZleCIgc3R5bGU9InZlcnRpY2FsLWFsaWduOiAtMi41MDVleDsiIHZpZXdCb3g9IjAgLTE1ODAuNyAxODUyLjUgMjY1OS4xIiByb2xlPSJpbWciIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgYXJpYS1sYWJlbGxlZGJ5PSJNYXRoSmF4LVNWRy0xLVRpdGxlIj4KPHRpdGxlIGlkPSJNYXRoSmF4LVNWRy0xLVRpdGxlIj5cYmVnaW57Y2FzZXN9XHNxdWFyZVxcXHNxdWFyZVxlbmR7Y2FzZXN9PC90aXRsZT4KPGRlZnMgYXJpYS1oaWRkZW49InRydWUiPgo8cGF0aCBzdHJva2Utd2lkdGg9IjEiIGlkPSJFMS1NSk1BSU4tN0IiIGQ9Ik00MzQgLTIzMVE0MzQgLTI0NCA0MjggLTI1MEg0MTBRMjgxIC0yNTAgMjMwIC0xODRRMjI1IC0xNzcgMjIyIC0xNzJUMjE3IC0xNjFUMjEzIC0xNDhUMjExIC0xMzNUMjEwIC0xMTFUMjA5IC04NFQyMDkgLTQ3VDIwOSAwUTIwOSAyMSAyMDkgNTNRMjA4IDE0MiAyMDQgMTUzUTIwMyAxNTQgMjAzIDE1NVExODkgMTkxIDE1MyAyMTFUODIgMjMxUTcxIDIzMSA2OCAyMzRUNjUgMjUwVDY4IDI2NlQ4MiAyNjlRMTE2IDI2OSAxNTIgMjg5VDIwMyAzNDVRMjA4IDM1NiAyMDggMzc3VDIwOSA1MjlWNTc5UTIwOSA2MzQgMjE1IDY1NlQyNDQgNjk4UTI3MCA3MjQgMzI0IDc0MFEzNjEgNzQ4IDM3NyA3NDlRMzc5IDc0OSAzOTAgNzQ5VDQwOCA3NTBINDI4UTQzNCA3NDQgNDM0IDczMlE0MzQgNzE5IDQzMSA3MTZRNDI5IDcxMyA0MTUgNzEzUTM2MiA3MTAgMzMyIDY4OVQyOTYgNjQ3UTI5MSA2MzQgMjkxIDQ5OVY0MTdRMjkxIDM3MCAyODggMzUzVDI3MSAzMTRRMjQwIDI3MSAxODQgMjU1TDE3MCAyNTBMMTg0IDI0NVEyMDIgMjM5IDIyMCAyMzBUMjYyIDE5NlQyOTAgMTM3UTI5MSAxMzEgMjkxIDFRMjkxIC0xMzQgMjk2IC0xNDdRMzA2IC0xNzQgMzM5IC0xOTJUNDE1IC0yMTNRNDI5IC0yMTMgNDMxIC0yMTZRNDM0IC0yMTkgNDM0IC0yMzFaIj48L3BhdGg+CjxwYXRoIHN0cm9rZS13aWR0aD0iMSIgaWQ9IkUxLU1KQU1TLTI1QTEiIGQ9Ik03MSAwUTU5IDQgNTUgMTZWMzQ2TDU2IDY3NlE2NCA2ODYgNzAgNjg5SDcwOVE3MTkgNjgxIDcyMiA2NzRWMTVRNzE5IDEwIDcwOSAxTDM5MCAwSDcxWk02ODIgNDBWNjQ5SDk1VjQwSDY4MloiPjwvcGF0aD4KPHBhdGggc3Ryb2tlLXdpZHRoPSIxIiBpZD0iRTEtTUpTWjMtN0IiIGQ9Ik02MTggLTk0M0w2MTIgLTk0OUg1ODJMNTY4IC05NDNRNDcyIC05MDMgNDExIC04NDFUMzMyIC03MDNRMzI3IC02ODIgMzI3IC02NTNUMzI1IC0zNTBRMzI0IC0yOCAzMjMgLTE4UTMxNyAyNCAzMDEgNjFUMjY0IDEyNFQyMjEgMTcxVDE3OSAyMDVUMTQ3IDIyNVQxMzIgMjM0UTEzMCAyMzggMTMwIDI1MFExMzAgMjU1IDEzMCAyNThUMTMxIDI2NFQxMzIgMjY3VDEzNCAyNjlUMTM5IDI3MlQxNDQgMjc1UTIwNyAzMDggMjU2IDM2N1EzMTAgNDM2IDMyMyA1MTlRMzI0IDUyOSAzMjUgODUxUTMyNiAxMTI0IDMyNiAxMTU0VDMzMiAxMjA1UTM2OSAxMzU4IDU2NiAxNDQzTDU4MiAxNDUwSDYxMkw2MTggMTQ0NFYxNDI5UTYxOCAxNDEzIDYxNiAxNDExTDYwOCAxNDA2UTU5OSAxNDAyIDU4NSAxMzkzVDU1MiAxMzcyVDUxNSAxMzQzVDQ3OSAxMzA1VDQ0OSAxMjU3VDQyOSAxMjAwUTQyNSAxMTgwIDQyNSAxMTUyVDQyMyA4NTFRNDIyIDU3OSA0MjIgNTQ5VDQxNiA0OThRNDA3IDQ1OSAzODggNDI0VDM0NiAzNjRUMjk3IDMxOFQyNTAgMjg0VDIxNCAyNjRUMTk3IDI1NEwxODggMjUxTDIwNSAyNDJRMjkwIDIwMCAzNDUgMTM4VDQxNiAzUTQyMSAtMTggNDIxIC00OFQ0MjMgLTM0OVE0MjMgLTM5NyA0MjMgLTQ3MlE0MjQgLTY3NyA0MjggLTY5NFE0MjkgLTY5NyA0MjkgLTY5OVE0MzQgLTcyMiA0NDMgLTc0M1Q0NjUgLTc4MlQ0OTEgLTgxNlQ1MTkgLTg0NVQ1NDggLTg2OFQ1NzQgLTg4NlQ1OTUgLTg5OVQ2MTAgLTkwOEw2MTYgLTkxMFE2MTggLTkxMiA2MTggLTkyOFYtOTQzWiI+PC9wYXRoPgo8L2RlZnM+CjxnIHN0cm9rZT0iY3VycmVudENvbG9yIiBmaWxsPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMCIgdHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgLTEgMCAwKSIgYXJpYS1oaWRkZW49InRydWUiPgogPHVzZSB4bGluazpocmVmPSIjRTEtTUpTWjMtN0IiPjwvdXNlPgo8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg5MTcsMCkiPgo8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTEsMCkiPgogPHVzZSB4bGluazpocmVmPSIjRTEtTUpBTVMtMjVBMSIgeD0iMCIgeT0iNTUwIj48L3VzZT4KIDx1c2UgeGxpbms6aHJlZj0iI0UxLU1KQU1TLTI1QTEiIHg9IjAiIHk9Ii02NTAiPjwvdXNlPgo8L2c+CjwvZz4KPC9nPgo8L3N2Zz4='
        },
        {
            action: '\\matrix',
            label: '\\begin{matrix}X&X\\\\X&X\\end{matrix}',
            svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjYuNjlleCIgaGVpZ2h0PSI2LjE3NmV4IiBzdHlsZT0idmVydGljYWwtYWxpZ246IC0yLjUwNWV4OyIgdmlld0JveD0iMCAtMTU4MC43IDI4ODAuNSAyNjU5LjEiIHJvbGU9ImltZyIgZm9jdXNhYmxlPSJmYWxzZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBhcmlhLWxhYmVsbGVkYnk9Ik1hdGhKYXgtU1ZHLTEtVGl0bGUiPgo8dGl0bGUgaWQ9Ik1hdGhKYXgtU1ZHLTEtVGl0bGUiPlxiZWdpbnttYXRyaXh9XHNxdWFyZSZhbXA7XHNxdWFyZVxcXHNxdWFyZSZhbXA7XHNxdWFyZVxlbmR7bWF0cml4fTwvdGl0bGU+CjxkZWZzIGFyaWEtaGlkZGVuPSJ0cnVlIj4KPHBhdGggc3Ryb2tlLXdpZHRoPSIxIiBpZD0iRTEtTUpBTVMtMjVBMSIgZD0iTTcxIDBRNTkgNCA1NSAxNlYzNDZMNTYgNjc2UTY0IDY4NiA3MCA2ODlINzA5UTcxOSA2ODEgNzIyIDY3NFYxNVE3MTkgMTAgNzA5IDFMMzkwIDBINzFaTTY4MiA0MFY2NDlIOTVWNDBINjgyWiI+PC9wYXRoPgo8L2RlZnM+CjxnIHN0cm9rZT0iY3VycmVudENvbG9yIiBmaWxsPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMCIgdHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgLTEgMCAwKSIgYXJpYS1oaWRkZW49InRydWUiPgo8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNjcsMCkiPgo8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTEsMCkiPgogPHVzZSB4bGluazpocmVmPSIjRTEtTUpBTVMtMjVBMSIgeD0iMCIgeT0iNjUwIj48L3VzZT4KIDx1c2UgeGxpbms6aHJlZj0iI0UxLU1KQU1TLTI1QTEiIHg9IjAiIHk9Ii03NTAiPjwvdXNlPgo8L2c+CjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE3NjgsMCkiPgogPHVzZSB4bGluazpocmVmPSIjRTEtTUpBTVMtMjVBMSIgeD0iMCIgeT0iNjUwIj48L3VzZT4KIDx1c2UgeGxpbms6aHJlZj0iI0UxLU1KQU1TLTI1QTEiIHg9IjAiIHk9Ii03NTAiPjwvdXNlPgo8L2c+CjwvZz4KPC9nPgo8L3N2Zz4='
        },
        {
            action: '\\frac{a}{b}^{\\text{(}x}',
            label: '\\frac{X}{X}^{\\text{(}X}',
            useWrite: true,
            svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjQuNzk1ZXgiIGhlaWdodD0iNS44NDNleCIgc3R5bGU9InZlcnRpY2FsLWFsaWduOiAtMS44MzhleDsiIHZpZXdCb3g9IjAgLTE3MjQuMiAyMDY0LjQgMjUxNS42IiByb2xlPSJpbWciIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgYXJpYS1sYWJlbGxlZGJ5PSJNYXRoSmF4LVNWRy0xLVRpdGxlIj4KPHRpdGxlIGlkPSJNYXRoSmF4LVNWRy0xLVRpdGxlIj5cZnJhY3tcc3F1YXJlfXtcc3F1YXJlfV57XHRleHR7KH1cc3F1YXJlfTwvdGl0bGU+CjxkZWZzIGFyaWEtaGlkZGVuPSJ0cnVlIj4KPHBhdGggc3Ryb2tlLXdpZHRoPSIxIiBpZD0iRTEtTUpBTVMtMjVBMSIgZD0iTTcxIDBRNTkgNCA1NSAxNlYzNDZMNTYgNjc2UTY0IDY4NiA3MCA2ODlINzA5UTcxOSA2ODEgNzIyIDY3NFYxNVE3MTkgMTAgNzA5IDFMMzkwIDBINzFaTTY4MiA0MFY2NDlIOTVWNDBINjgyWiI+PC9wYXRoPgo8cGF0aCBzdHJva2Utd2lkdGg9IjEiIGlkPSJFMS1NSk1BSU4tMjgiIGQ9Ik05NCAyNTBROTQgMzE5IDEwNCAzODFUMTI3IDQ4OFQxNjQgNTc2VDIwMiA2NDNUMjQ0IDY5NVQyNzcgNzI5VDMwMiA3NTBIMzE1SDMxOVEzMzMgNzUwIDMzMyA3NDFRMzMzIDczOCAzMTYgNzIwVDI3NSA2NjdUMjI2IDU4MVQxODQgNDQzVDE2NyAyNTBUMTg0IDU4VDIyNSAtODFUMjc0IC0xNjdUMzE2IC0yMjBUMzMzIC0yNDFRMzMzIC0yNTAgMzE4IC0yNTBIMzE1SDMwMkwyNzQgLTIyNlExODAgLTE0MSAxMzcgLTE0VDk0IDI1MFoiPjwvcGF0aD4KPC9kZWZzPgo8ZyBzdHJva2U9ImN1cnJlbnRDb2xvciIgZmlsbD0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAiIHRyYW5zZm9ybT0ibWF0cml4KDEgMCAwIC0xIDAgMCkiIGFyaWEtaGlkZGVuPSJ0cnVlIj4KPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTIwLDApIj4KPHJlY3Qgc3Ryb2tlPSJub25lIiB3aWR0aD0iODk4IiBoZWlnaHQ9IjYwIiB4PSIwIiB5PSIyMjAiPjwvcmVjdD4KIDx1c2UgeGxpbms6aHJlZj0iI0UxLU1KQU1TLTI1QTEiIHg9IjYwIiB5PSI2NzYiPjwvdXNlPgogPHVzZSB4bGluazpocmVmPSIjRTEtTUpBTVMtMjVBMSIgeD0iNjAiIHk9Ii03MTAiPjwvdXNlPgo8L2c+CjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDExMzgsMTA5MykiPgogPHVzZSB0cmFuc2Zvcm09InNjYWxlKDAuNzA3KSIgeGxpbms6aHJlZj0iI0UxLU1KTUFJTi0yOCIgeD0iMCIgeT0iMCI+PC91c2U+CiA8dXNlIHRyYW5zZm9ybT0ic2NhbGUoMC43MDcpIiB4bGluazpocmVmPSIjRTEtTUpBTVMtMjVBMSIgeD0iMzg5IiB5PSIwIj48L3VzZT4KPC9nPgo8L2c+Cjwvc3ZnPg=='
        },
        {
            action: '\\binom',
            label: '\\binom{X}{X}',
            svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjUuMjI5ZXgiIGhlaWdodD0iNi4xNzZleCIgc3R5bGU9InZlcnRpY2FsLWFsaWduOiAtMi41MDVleDsiIHZpZXdCb3g9IjAgLTE1ODAuNyAyMjUxLjUgMjY1OS4xIiByb2xlPSJpbWciIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgYXJpYS1sYWJlbGxlZGJ5PSJNYXRoSmF4LVNWRy0xLVRpdGxlIj4KPHRpdGxlIGlkPSJNYXRoSmF4LVNWRy0xLVRpdGxlIj5cYmlub217XHNxdWFyZX17XHNxdWFyZX08L3RpdGxlPgo8ZGVmcyBhcmlhLWhpZGRlbj0idHJ1ZSI+CjxwYXRoIHN0cm9rZS13aWR0aD0iMSIgaWQ9IkUxLU1KTUFJTi0yOCIgZD0iTTk0IDI1MFE5NCAzMTkgMTA0IDM4MVQxMjcgNDg4VDE2NCA1NzZUMjAyIDY0M1QyNDQgNjk1VDI3NyA3MjlUMzAyIDc1MEgzMTVIMzE5UTMzMyA3NTAgMzMzIDc0MVEzMzMgNzM4IDMxNiA3MjBUMjc1IDY2N1QyMjYgNTgxVDE4NCA0NDNUMTY3IDI1MFQxODQgNThUMjI1IC04MVQyNzQgLTE2N1QzMTYgLTIyMFQzMzMgLTI0MVEzMzMgLTI1MCAzMTggLTI1MEgzMTVIMzAyTDI3NCAtMjI2UTE4MCAtMTQxIDEzNyAtMTRUOTQgMjUwWiI+PC9wYXRoPgo8cGF0aCBzdHJva2Utd2lkdGg9IjEiIGlkPSJFMS1NSlNaMy0yOCIgZD0iTTcwMSAtOTQwUTcwMSAtOTQzIDY5NSAtOTQ5SDY2NFE2NjIgLTk0NyA2MzYgLTkyMlQ1OTEgLTg3OVQ1MzcgLTgxOFQ0NzUgLTczN1Q0MTIgLTYzNlQzNTAgLTUxMVQyOTUgLTM2MlQyNTAgLTE4NlQyMjEgMTdUMjA5IDI1MVEyMDkgOTYyIDU3MyAxMzYxUTU5NiAxMzg2IDYxNiAxNDA1VDY0OSAxNDM3VDY2NCAxNDUwSDY5NVE3MDEgMTQ0NCA3MDEgMTQ0MVE3MDEgMTQzNiA2ODEgMTQxNVQ2MjkgMTM1NlQ1NTcgMTI2MVQ0NzYgMTExOFQ0MDAgOTI3VDM0MCA2NzVUMzA4IDM1OVEzMDYgMzIxIDMwNiAyNTBRMzA2IC0xMzkgNDAwIC00MzBUNjkwIC05MjRRNzAxIC05MzYgNzAxIC05NDBaIj48L3BhdGg+CjxwYXRoIHN0cm9rZS13aWR0aD0iMSIgaWQ9IkUxLU1KQU1TLTI1QTEiIGQ9Ik03MSAwUTU5IDQgNTUgMTZWMzQ2TDU2IDY3NlE2NCA2ODYgNzAgNjg5SDcwOVE3MTkgNjgxIDcyMiA2NzRWMTVRNzE5IDEwIDcwOSAxTDM5MCAwSDcxWk02ODIgNDBWNjQ5SDk1VjQwSDY4MloiPjwvcGF0aD4KPHBhdGggc3Ryb2tlLXdpZHRoPSIxIiBpZD0iRTEtTUpNQUlOLTI5IiBkPSJNNjAgNzQ5TDY0IDc1MFE2OSA3NTAgNzQgNzUwSDg2TDExNCA3MjZRMjA4IDY0MSAyNTEgNTE0VDI5NCAyNTBRMjk0IDE4MiAyODQgMTE5VDI2MSAxMlQyMjQgLTc2VDE4NiAtMTQzVDE0NSAtMTk0VDExMyAtMjI3VDkwIC0yNDZRODcgLTI0OSA4NiAtMjUwSDc0UTY2IC0yNTAgNjMgLTI1MFQ1OCAtMjQ3VDU1IC0yMzhRNTYgLTIzNyA2NiAtMjI1UTIyMSAtNjQgMjIxIDI1MFQ2NiA3MjVRNTYgNzM3IDU1IDczOFE1NSA3NDYgNjAgNzQ5WiI+PC9wYXRoPgo8cGF0aCBzdHJva2Utd2lkdGg9IjEiIGlkPSJFMS1NSlNaMy0yOSIgZD0iTTM0IDE0MzhRMzQgMTQ0NiAzNyAxNDQ4VDUwIDE0NTBINTZINzFRNzMgMTQ0OCA5OSAxNDIzVDE0NCAxMzgwVDE5OCAxMzE5VDI2MCAxMjM4VDMyMyAxMTM3VDM4NSAxMDEzVDQ0MCA4NjRUNDg1IDY4OFQ1MTQgNDg1VDUyNiAyNTFRNTI2IDEzNCA1MTkgNTNRNDcyIC01MTkgMTYyIC04NjBRMTM5IC04ODUgMTE5IC05MDRUODYgLTkzNlQ3MSAtOTQ5SDU2UTQzIC05NDkgMzkgLTk0N1QzNCAtOTM3UTg4IC04ODMgMTQwIC04MTNRNDI4IC00MzAgNDI4IDI1MVE0MjggNDUzIDQwMiA2MjhUMzM4IDkyMlQyNDUgMTE0NlQxNDUgMTMwOVQ0NiAxNDI1UTQ0IDE0MjcgNDIgMTQyOVQzOSAxNDMzVDM2IDE0MzZMMzQgMTQzOFoiPjwvcGF0aD4KPC9kZWZzPgo8ZyBzdHJva2U9ImN1cnJlbnRDb2xvciIgZmlsbD0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAiIHRyYW5zZm9ybT0ibWF0cml4KDEgMCAwIC0xIDAgMCkiIGFyaWEtaGlkZGVuPSJ0cnVlIj4KIDx1c2UgeGxpbms6aHJlZj0iI0UxLU1KU1ozLTI4IiB4PSIwIiB5PSItMSI+PC91c2U+CjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDczNiwwKSI+CiA8dXNlIHhsaW5rOmhyZWY9IiNFMS1NSkFNUy0yNUExIiB4PSIwIiB5PSI2NzYiPjwvdXNlPgogPHVzZSB4bGluazpocmVmPSIjRTEtTUpBTVMtMjVBMSIgeD0iMCIgeT0iLTY4NiI+PC91c2U+CjwvZz4KIDx1c2UgeGxpbms6aHJlZj0iI0UxLU1KU1ozLTI5IiB4PSIxNTE1IiB5PSItMSI+PC91c2U+CjwvZz4KPC9zdmc+'
        },
        '<br>',
        {
            action: '\\nthroot',
            label: '\\sqrt[X]{X}',
            svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjMuNzQ0ZXgiIGhlaWdodD0iMy4wMDlleCIgc3R5bGU9InZlcnRpY2FsLWFsaWduOiAtMC42NzFleDsiIHZpZXdCb3g9IjAgLTEwMDYuNiAxNjEyIDEyOTUuNyIgcm9sZT0iaW1nIiBmb2N1c2FibGU9ImZhbHNlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGFyaWEtbGFiZWxsZWRieT0iTWF0aEpheC1TVkctMS1UaXRsZSI+Cjx0aXRsZSBpZD0iTWF0aEpheC1TVkctMS1UaXRsZSI+XHNxcnRbXHNxdWFyZV17XHNxdWFyZX08L3RpdGxlPgo8ZGVmcyBhcmlhLWhpZGRlbj0idHJ1ZSI+CjxwYXRoIHN0cm9rZS13aWR0aD0iMSIgaWQ9IkUxLU1KQU1TLTI1QTEiIGQ9Ik03MSAwUTU5IDQgNTUgMTZWMzQ2TDU2IDY3NlE2NCA2ODYgNzAgNjg5SDcwOVE3MTkgNjgxIDcyMiA2NzRWMTVRNzE5IDEwIDcwOSAxTDM5MCAwSDcxWk02ODIgNDBWNjQ5SDk1VjQwSDY4MloiPjwvcGF0aD4KPHBhdGggc3Ryb2tlLXdpZHRoPSIxIiBpZD0iRTEtTUpNQUlOLTIyMUEiIGQ9Ik05NSAxNzhRODkgMTc4IDgxIDE4NlQ3MiAyMDBUMTAzIDIzMFQxNjkgMjgwVDIwNyAzMDlRMjA5IDMxMSAyMTIgMzExSDIxM1EyMTkgMzExIDIyNyAyOTRUMjgxIDE3N1EzMDAgMTM0IDMxMiAxMDhMMzk3IC03N1EzOTggLTc3IDUwMSAxMzZUNzA3IDU2NVQ4MTQgNzg2UTgyMCA4MDAgODM0IDgwMFE4NDEgODAwIDg0NiA3OTRUODUzIDc4MlY3NzZMNjIwIDI5M0wzODUgLTE5M1EzODEgLTIwMCAzNjYgLTIwMFEzNTcgLTIwMCAzNTQgLTE5N1EzNTIgLTE5NSAyNTYgMTVMMTYwIDIyNUwxNDQgMjE0UTEyOSAyMDIgMTEzIDE5MFQ5NSAxNzhaIj48L3BhdGg+CjwvZGVmcz4KPGcgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIGZpbGw9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIwIiB0cmFuc2Zvcm09Im1hdHJpeCgxIDAgMCAtMSAwIDApIiBhcmlhLWhpZGRlbj0idHJ1ZSI+CiA8dXNlIHRyYW5zZm9ybT0ic2NhbGUoMC41NzQpIiB4bGluazpocmVmPSIjRTEtTUpBTVMtMjVBMSIgeD0iMjIxIiB5PSI4MTEiPjwvdXNlPgogPHVzZSB4bGluazpocmVmPSIjRTEtTUpNQUlOLTIyMUEiIHg9IjAiIHk9IjIwIj48L3VzZT4KPHJlY3Qgc3Ryb2tlPSJub25lIiB3aWR0aD0iNzc4IiBoZWlnaHQ9IjYwIiB4PSI4MzMiIHk9Ijc2MSI+PC9yZWN0PgogPHVzZSB4bGluazpocmVmPSIjRTEtTUpBTVMtMjVBMSIgeD0iODMzIiB5PSIwIj48L3VzZT4KPC9nPgo8L3N2Zz4='
        },
        {
            action: '_',
            label: 'x_X',
            svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjIuODRleCIgaGVpZ2h0PSIyLjAwOWV4IiBzdHlsZT0idmVydGljYWwtYWxpZ246IC0wLjY3MWV4OyIgdmlld0JveD0iMCAtNTc2LjEgMTIyMyA4NjUuMSIgcm9sZT0iaW1nIiBmb2N1c2FibGU9ImZhbHNlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGFyaWEtbGFiZWxsZWRieT0iTWF0aEpheC1TVkctMS1UaXRsZSI+Cjx0aXRsZSBpZD0iTWF0aEpheC1TVkctMS1UaXRsZSI+eF9cc3F1YXJlPC90aXRsZT4KPGRlZnMgYXJpYS1oaWRkZW49InRydWUiPgo8cGF0aCBzdHJva2Utd2lkdGg9IjEiIGlkPSJFMS1NSk1BVEhJLTc4IiBkPSJNNTIgMjg5UTU5IDMzMSAxMDYgMzg2VDIyMiA0NDJRMjU3IDQ0MiAyODYgNDI0VDMyOSAzNzlRMzcxIDQ0MiA0MzAgNDQyUTQ2NyA0NDIgNDk0IDQyMFQ1MjIgMzYxUTUyMiAzMzIgNTA4IDMxNFQ0ODEgMjkyVDQ1OCAyODhRNDM5IDI4OCA0MjcgMjk5VDQxNSAzMjhRNDE1IDM3NCA0NjUgMzkxUTQ1NCA0MDQgNDI1IDQwNFE0MTIgNDA0IDQwNiA0MDJRMzY4IDM4NiAzNTAgMzM2UTI5MCAxMTUgMjkwIDc4UTI5MCA1MCAzMDYgMzhUMzQxIDI2UTM3OCAyNiA0MTQgNTlUNDYzIDE0MFE0NjYgMTUwIDQ2OSAxNTFUNDg1IDE1M0g0ODlRNTA0IDE1MyA1MDQgMTQ1UTUwNCAxNDQgNTAyIDEzNFE0ODYgNzcgNDQwIDMzVDMzMyAtMTFRMjYzIC0xMSAyMjcgNTJRMTg2IC0xMCAxMzMgLTEwSDEyN1E3OCAtMTAgNTcgMTZUMzUgNzFRMzUgMTAzIDU0IDEyM1Q5OSAxNDNRMTQyIDE0MyAxNDIgMTAxUTE0MiA4MSAxMzAgNjZUMTA3IDQ2VDk0IDQxTDkxIDQwUTkxIDM5IDk3IDM2VDExMyAyOVQxMzIgMjZRMTY4IDI2IDE5NCA3MVEyMDMgODcgMjE3IDEzOVQyNDUgMjQ3VDI2MSAzMTNRMjY2IDM0MCAyNjYgMzUyUTI2NiAzODAgMjUxIDM5MlQyMTcgNDA0UTE3NyA0MDQgMTQyIDM3MlQ5MyAyOTBROTEgMjgxIDg4IDI4MFQ3MiAyNzhINThRNTIgMjg0IDUyIDI4OVoiPjwvcGF0aD4KPHBhdGggc3Ryb2tlLXdpZHRoPSIxIiBpZD0iRTEtTUpBTVMtMjVBMSIgZD0iTTcxIDBRNTkgNCA1NSAxNlYzNDZMNTYgNjc2UTY0IDY4NiA3MCA2ODlINzA5UTcxOSA2ODEgNzIyIDY3NFYxNVE3MTkgMTAgNzA5IDFMMzkwIDBINzFaTTY4MiA0MFY2NDlIOTVWNDBINjgyWiI+PC9wYXRoPgo8L2RlZnM+CjxnIHN0cm9rZT0iY3VycmVudENvbG9yIiBmaWxsPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMCIgdHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgLTEgMCAwKSIgYXJpYS1oaWRkZW49InRydWUiPgogPHVzZSB4bGluazpocmVmPSIjRTEtTUpNQVRISS03OCIgeD0iMCIgeT0iMCI+PC91c2U+CiA8dXNlIHRyYW5zZm9ybT0ic2NhbGUoMC43MDcpIiB4bGluazpocmVmPSIjRTEtTUpBTVMtMjVBMSIgeD0iODA5IiB5PSItMjEzIj48L3VzZT4KPC9nPgo8L3N2Zz4='
        },
        {
            action: '\\sum',
            label: '\\sum_{X}^{X}',
            svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjMuMzU1ZXgiIGhlaWdodD0iNy4zNDNleCIgc3R5bGU9InZlcnRpY2FsLWFsaWduOiAtMy4wMDVleDsiIHZpZXdCb3g9IjAgLTE4NjcuNyAxNDQ0LjUgMzE2MS40IiByb2xlPSJpbWciIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgYXJpYS1sYWJlbGxlZGJ5PSJNYXRoSmF4LVNWRy0xLVRpdGxlIj4KPHRpdGxlIGlkPSJNYXRoSmF4LVNWRy0xLVRpdGxlIj5cc3VtX3tcc3F1YXJlfV57XHNxdWFyZX08L3RpdGxlPgo8ZGVmcyBhcmlhLWhpZGRlbj0idHJ1ZSI+CjxwYXRoIHN0cm9rZS13aWR0aD0iMSIgaWQ9IkUxLU1KU1oyLTIyMTEiIGQ9Ik02MCA5NDhRNjMgOTUwIDY2NSA5NTBIMTI2N0wxMzI1IDgxNVExMzg0IDY3NyAxMzg4IDY2OUgxMzQ4TDEzNDEgNjgzUTEzMjAgNzI0IDEyODUgNzYxUTEyMzUgODA5IDExNzQgODM4VDEwMzMgODgxVDg4MiA4OThUNjk5IDkwMkg1NzRINTQzSDI1MUwyNTkgODkxUTcyMiAyNTggNzI0IDI1MlE3MjUgMjUwIDcyNCAyNDZRNzIxIDI0MyA0NjAgLTU2TDE5NiAtMzU2UTE5NiAtMzU3IDQwNyAtMzU3UTQ1OSAtMzU3IDU0OCAtMzU3VDY3NiAtMzU4UTgxMiAtMzU4IDg5NiAtMzUzVDEwNjMgLTMzMlQxMjA0IC0yODNUMTMwNyAtMTk2UTEzMjggLTE3MCAxMzQ4IC0xMjRIMTM4OFExMzg4IC0xMjUgMTM4MSAtMTQ1VDEzNTYgLTIxMFQxMzI1IC0yOTRMMTI2NyAtNDQ5TDY2NiAtNDUwUTY0IC00NTAgNjEgLTQ0OFE1NSAtNDQ2IDU1IC00MzlRNTUgLTQzNyA1NyAtNDMzTDU5MCAxNzdRNTkwIDE3OCA1NTcgMjIyVDQ1MiAzNjZUMzIyIDU0NEw1NiA5MDlMNTUgOTI0UTU1IDk0NSA2MCA5NDhaIj48L3BhdGg+CjxwYXRoIHN0cm9rZS13aWR0aD0iMSIgaWQ9IkUxLU1KQU1TLTI1QTEiIGQ9Ik03MSAwUTU5IDQgNTUgMTZWMzQ2TDU2IDY3NlE2NCA2ODYgNzAgNjg5SDcwOVE3MTkgNjgxIDcyMiA2NzRWMTVRNzE5IDEwIDcwOSAxTDM5MCAwSDcxWk02ODIgNDBWNjQ5SDk1VjQwSDY4MloiPjwvcGF0aD4KPC9kZWZzPgo8ZyBzdHJva2U9ImN1cnJlbnRDb2xvciIgZmlsbD0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAiIHRyYW5zZm9ybT0ibWF0cml4KDEgMCAwIC0xIDAgMCkiIGFyaWEtaGlkZGVuPSJ0cnVlIj4KIDx1c2UgeGxpbms6aHJlZj0iI0UxLU1KU1oyLTIyMTEiIHg9IjAiIHk9IjAiPjwvdXNlPgogPHVzZSB0cmFuc2Zvcm09InNjYWxlKDAuNzA3KSIgeGxpbms6aHJlZj0iI0UxLU1KQU1TLTI1QTEiIHg9IjYzMiIgeT0iLTE1NjQiPjwvdXNlPgogPHVzZSB0cmFuc2Zvcm09InNjYWxlKDAuNzA3KSIgeGxpbms6aHJlZj0iI0UxLU1KQU1TLTI1QTEiIHg9IjYzMiIgeT0iMTYyNyI+PC91c2U+CjwvZz4KPC9zdmc+'
        },
        {
            action: '\\intsub',
            label: '\\bigg/_{\\!\\!\\!\\!X}^{X}',
            svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjMuOTM3ZXgiIGhlaWdodD0iNi42NzZleCIgc3R5bGU9InZlcnRpY2FsLWFsaWduOiAtMi41MDVleDsiIHZpZXdCb3g9IjAgLTE3OTYgMTY5NSAyODc0LjQiIHJvbGU9ImltZyIgZm9jdXNhYmxlPSJmYWxzZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBhcmlhLWxhYmVsbGVkYnk9Ik1hdGhKYXgtU1ZHLTEtVGl0bGUiPgo8dGl0bGUgaWQ9Ik1hdGhKYXgtU1ZHLTEtVGl0bGUiPlxiaWdnL197XCFcIVwhXCFcc3F1YXJlfV57XHNxdWFyZX08L3RpdGxlPgo8ZGVmcyBhcmlhLWhpZGRlbj0idHJ1ZSI+CjxwYXRoIHN0cm9rZS13aWR0aD0iMSIgaWQ9IkUxLU1KTUFJTi0yRiIgZD0iTTQyMyA3NTBRNDMyIDc1MCA0MzggNzQ0VDQ0NCA3MzBRNDQ0IDcyNSAyNzEgMjQ4VDkyIC0yNDBRODUgLTI1MCA3NSAtMjUwUTY4IC0yNTAgNjIgLTI0NVQ1NiAtMjMxUTU2IC0yMjEgMjMwIDI1N1Q0MDcgNzQwUTQxMSA3NTAgNDIzIDc1MFoiPjwvcGF0aD4KPHBhdGggc3Ryb2tlLXdpZHRoPSIxIiBpZD0iRTEtTUpTWjMtMkYiIGQ9Ik04MSAtOTQ5UTcxIC05NDkgNjMgLTk0MVQ1NSAtOTIxUTU1IC05MTcgNTYgLTkxNVE1OSAtOTA2IDQ5OCAyNjRUOTM5IDE0MzhROTQ1IDE0NTAgOTYwIDE0NTBROTcyIDE0NTAgOTgwIDE0NDFUOTg4IDE0MjFROTgyIDE0MDMgODM5IDEwMjBMMzk4IC0xNTVRMTA3IC05MzQgMTAzIC05MzhROTYgLTk0OSA4MSAtOTQ5WiI+PC9wYXRoPgo8cGF0aCBzdHJva2Utd2lkdGg9IjEiIGlkPSJFMS1NSkFNUy0yNUExIiBkPSJNNzEgMFE1OSA0IDU1IDE2VjM0Nkw1NiA2NzZRNjQgNjg2IDcwIDY4OUg3MDlRNzE5IDY4MSA3MjIgNjc0VjE1UTcxOSAxMCA3MDkgMUwzOTAgMEg3MVpNNjgyIDQwVjY0OUg5NVY0MEg2ODJaIj48L3BhdGg+CjwvZGVmcz4KPGcgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIGZpbGw9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIwIiB0cmFuc2Zvcm09Im1hdHJpeCgxIDAgMCAtMSAwIDApIiBhcmlhLWhpZGRlbj0idHJ1ZSI+CiA8dXNlIHhsaW5rOmhyZWY9IiNFMS1NSlNaMy0yRiIgeD0iMCIgeT0iLTEiPjwvdXNlPgogPHVzZSB0cmFuc2Zvcm09InNjYWxlKDAuNzA3KSIgeGxpbms6aHJlZj0iI0UxLU1KQU1TLTI1QTEiIHg9IjE0NzciIHk9IjE2NjUiPjwvdXNlPgo8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMDQ0LC05ODYpIj4KIDx1c2UgdHJhbnNmb3JtPSJzY2FsZSgwLjcwNykiIHhsaW5rOmhyZWY9IiNFMS1NSkFNUy0yNUExIiB4PSItOTQzIiB5PSIwIj48L3VzZT4KPC9nPgo8L2c+Cjwvc3ZnPg=='
        },
        {
            action: '\\lim_{x\\rightarrow\\infty}',
            label: '\\lim_{x\\rightarrow\\infty}',
            useWrite: true,
            svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjQuMjI3ZXgiIGhlaWdodD0iMy42NzZleCIgc3R5bGU9InZlcnRpY2FsLWFsaWduOiAtMS44MzhleDsiIHZpZXdCb3g9IjAgLTc5MS4zIDE4MTkuNyAxNTgyLjciIHJvbGU9ImltZyIgZm9jdXNhYmxlPSJmYWxzZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBhcmlhLWxhYmVsbGVkYnk9Ik1hdGhKYXgtU1ZHLTEtVGl0bGUiPgo8dGl0bGUgaWQ9Ik1hdGhKYXgtU1ZHLTEtVGl0bGUiPlxsaW1fe3hccmlnaHRhcnJvd1xpbmZ0eX08L3RpdGxlPgo8ZGVmcyBhcmlhLWhpZGRlbj0idHJ1ZSI+CjxwYXRoIHN0cm9rZS13aWR0aD0iMSIgaWQ9IkUxLU1KTUFJTi02QyIgZD0iTTQyIDQ2SDU2UTk1IDQ2IDEwMyA2MFY2OFExMDMgNzcgMTAzIDkxVDEwMyAxMjRUMTA0IDE2N1QxMDQgMjE3VDEwNCAyNzJUMTA0IDMyOVExMDQgMzY2IDEwNCA0MDdUMTA0IDQ4MlQxMDQgNTQyVDEwMyA1ODZUMTAzIDYwM1ExMDAgNjIyIDg5IDYyOFQ0NCA2MzdIMjZWNjYwUTI2IDY4MyAyOCA2ODNMMzggNjg0UTQ4IDY4NSA2NyA2ODZUMTA0IDY4OFExMjEgNjg5IDE0MSA2OTBUMTcxIDY5M1QxODIgNjk0SDE4NVYzNzlRMTg1IDYyIDE4NiA2MFExOTAgNTIgMTk4IDQ5UTIxOSA0NiAyNDcgNDZIMjYzVjBIMjU1TDIzMiAxUTIwOSAyIDE4MyAyVDE0NSAzVDEwNyAzVDU3IDFMMzQgMEgyNlY0Nkg0MloiPjwvcGF0aD4KPHBhdGggc3Ryb2tlLXdpZHRoPSIxIiBpZD0iRTEtTUpNQUlOLTY5IiBkPSJNNjkgNjA5UTY5IDYzNyA4NyA2NTNUMTMxIDY2OVExNTQgNjY3IDE3MSA2NTJUMTg4IDYwOVExODggNTc5IDE3MSA1NjRUMTI5IDU0OVExMDQgNTQ5IDg3IDU2NFQ2OSA2MDlaTTI0NyAwUTIzMiAzIDE0MyAzUTEzMiAzIDEwNiAzVDU2IDFMMzQgMEgyNlY0Nkg0MlE3MCA0NiA5MSA0OVExMDAgNTMgMTAyIDYwVDEwNCAxMDJWMjA1VjI5M1ExMDQgMzQ1IDEwMiAzNTlUODggMzc4UTc0IDM4NSA0MSAzODVIMzBWNDA4UTMwIDQzMSAzMiA0MzFMNDIgNDMyUTUyIDQzMyA3MCA0MzRUMTA2IDQzNlExMjMgNDM3IDE0MiA0MzhUMTcxIDQ0MVQxODIgNDQySDE4NVY2MlExOTAgNTIgMTk3IDUwVDIzMiA0NkgyNTVWMEgyNDdaIj48L3BhdGg+CjxwYXRoIHN0cm9rZS13aWR0aD0iMSIgaWQ9IkUxLU1KTUFJTi02RCIgZD0iTTQxIDQ2SDU1UTk0IDQ2IDEwMiA2MFY2OFExMDIgNzcgMTAyIDkxVDEwMiAxMjJUMTAzIDE2MVQxMDMgMjAzUTEwMyAyMzQgMTAzIDI2OVQxMDIgMzI4VjM1MVE5OSAzNzAgODggMzc2VDQzIDM4NUgyNVY0MDhRMjUgNDMxIDI3IDQzMUwzNyA0MzJRNDcgNDMzIDY1IDQzNFQxMDIgNDM2UTExOSA0MzcgMTM4IDQzOFQxNjcgNDQxVDE3OCA0NDJIMTgxVjQwMlExODEgMzY0IDE4MiAzNjRUMTg3IDM2OVQxOTkgMzg0VDIxOCA0MDJUMjQ3IDQyMVQyODUgNDM3UTMwNSA0NDIgMzM2IDQ0MlEzNTEgNDQyIDM2NCA0NDBUMzg3IDQzNFQ0MDYgNDI2VDQyMSA0MTdUNDMyIDQwNlQ0NDEgMzk1VDQ0OCAzODRUNDUyIDM3NFQ0NTUgMzY2TDQ1NyAzNjFMNDYwIDM2NVE0NjMgMzY5IDQ2NiAzNzNUNDc1IDM4NFQ0ODggMzk3VDUwMyA0MTBUNTIzIDQyMlQ1NDYgNDMyVDU3MiA0MzlUNjAzIDQ0MlE3MjkgNDQyIDc0MCAzMjlRNzQxIDMyMiA3NDEgMTkwVjEwNFE3NDEgNjYgNzQzIDU5VDc1NCA0OVE3NzUgNDYgODAzIDQ2SDgxOVYwSDgxMUw3ODggMVE3NjQgMiA3MzcgMlQ2OTkgM1E1OTYgMyA1ODcgMEg1NzlWNDZINTk1UTY1NiA0NiA2NTYgNjJRNjU3IDY0IDY1NyAyMDBRNjU2IDMzNSA2NTUgMzQzUTY0OSAzNzEgNjM1IDM4NVQ2MTEgNDAyVDU4NSA0MDRRNTQwIDQwNCA1MDYgMzcwUTQ3OSAzNDMgNDcyIDMxNVQ0NjQgMjMyVjE2OFYxMDhRNDY0IDc4IDQ2NSA2OFQ0NjggNTVUNDc3IDQ5UTQ5OCA0NiA1MjYgNDZINTQyVjBINTM0TDUxMCAxUTQ4NyAyIDQ2MCAyVDQyMiAzUTMxOSAzIDMxMCAwSDMwMlY0NkgzMThRMzc5IDQ2IDM3OSA2MlEzODAgNjQgMzgwIDIwMFEzNzkgMzM1IDM3OCAzNDNRMzcyIDM3MSAzNTggMzg1VDMzNCA0MDJUMzA4IDQwNFEyNjMgNDA0IDIyOSAzNzBRMjAyIDM0MyAxOTUgMzE1VDE4NyAyMzJWMTY4VjEwOFExODcgNzggMTg4IDY4VDE5MSA1NVQyMDAgNDlRMjIxIDQ2IDI0OSA0NkgyNjVWMEgyNTdMMjM0IDFRMjEwIDIgMTgzIDJUMTQ1IDNRNDIgMyAzMyAwSDI1VjQ2SDQxWiI+PC9wYXRoPgo8cGF0aCBzdHJva2Utd2lkdGg9IjEiIGlkPSJFMS1NSk1BVEhJLTc4IiBkPSJNNTIgMjg5UTU5IDMzMSAxMDYgMzg2VDIyMiA0NDJRMjU3IDQ0MiAyODYgNDI0VDMyOSAzNzlRMzcxIDQ0MiA0MzAgNDQyUTQ2NyA0NDIgNDk0IDQyMFQ1MjIgMzYxUTUyMiAzMzIgNTA4IDMxNFQ0ODEgMjkyVDQ1OCAyODhRNDM5IDI4OCA0MjcgMjk5VDQxNSAzMjhRNDE1IDM3NCA0NjUgMzkxUTQ1NCA0MDQgNDI1IDQwNFE0MTIgNDA0IDQwNiA0MDJRMzY4IDM4NiAzNTAgMzM2UTI5MCAxMTUgMjkwIDc4UTI5MCA1MCAzMDYgMzhUMzQxIDI2UTM3OCAyNiA0MTQgNTlUNDYzIDE0MFE0NjYgMTUwIDQ2OSAxNTFUNDg1IDE1M0g0ODlRNTA0IDE1MyA1MDQgMTQ1UTUwNCAxNDQgNTAyIDEzNFE0ODYgNzcgNDQwIDMzVDMzMyAtMTFRMjYzIC0xMSAyMjcgNTJRMTg2IC0xMCAxMzMgLTEwSDEyN1E3OCAtMTAgNTcgMTZUMzUgNzFRMzUgMTAzIDU0IDEyM1Q5OSAxNDNRMTQyIDE0MyAxNDIgMTAxUTE0MiA4MSAxMzAgNjZUMTA3IDQ2VDk0IDQxTDkxIDQwUTkxIDM5IDk3IDM2VDExMyAyOVQxMzIgMjZRMTY4IDI2IDE5NCA3MVEyMDMgODcgMjE3IDEzOVQyNDUgMjQ3VDI2MSAzMTNRMjY2IDM0MCAyNjYgMzUyUTI2NiAzODAgMjUxIDM5MlQyMTcgNDA0UTE3NyA0MDQgMTQyIDM3MlQ5MyAyOTBROTEgMjgxIDg4IDI4MFQ3MiAyNzhINThRNTIgMjg0IDUyIDI4OVoiPjwvcGF0aD4KPHBhdGggc3Ryb2tlLXdpZHRoPSIxIiBpZD0iRTEtTUpNQUlOLTIxOTIiIGQ9Ik01NiAyMzdUNTYgMjUwVDcwIDI3MEg4MzVRNzE5IDM1NyA2OTIgNDkzUTY5MiA0OTQgNjkyIDQ5NlQ2OTEgNDk5UTY5MSA1MTEgNzA4IDUxMUg3MTFRNzIwIDUxMSA3MjMgNTEwVDcyOSA1MDZUNzMyIDQ5N1Q3MzUgNDgxVDc0MyA0NTZRNzY1IDM4OSA4MTYgMzM2VDkzNSAyNjFROTQ0IDI1OCA5NDQgMjUwUTk0NCAyNDQgOTM5IDI0MVQ5MTUgMjMxVDg3NyAyMTJRODM2IDE4NiA4MDYgMTUyVDc2MSA4NVQ3NDAgMzVUNzMyIDRRNzMwIC02IDcyNyAtOFQ3MTEgLTExUTY5MSAtMTEgNjkxIDBRNjkxIDcgNjk2IDI1UTcyOCAxNTEgODM1IDIzMEg3MFE1NiAyMzcgNTYgMjUwWiI+PC9wYXRoPgo8cGF0aCBzdHJva2Utd2lkdGg9IjEiIGlkPSJFMS1NSk1BSU4tMjIxRSIgZD0iTTU1IDIxN1E1NSAzMDUgMTExIDM3M1QyNTQgNDQyUTM0MiA0NDIgNDE5IDM4MVE0NTcgMzUwIDQ5MyAzMDNMNTA3IDI4NEw1MTQgMjk0UTYxOCA0NDIgNzQ3IDQ0MlE4MzMgNDQyIDg4OCAzNzRUOTQ0IDIxNFE5NDQgMTI4IDg4OSA1OVQ3NDMgLTExUTY1NyAtMTEgNTgwIDUwUTU0MiA4MSA1MDYgMTI4TDQ5MiAxNDdMNDg1IDEzN1EzODEgLTExIDI1MiAtMTFRMTY2IC0xMSAxMTEgNTdUNTUgMjE3Wk05MDcgMjE3UTkwNyAyODUgODY5IDM0MVQ3NjEgMzk3UTc0MCAzOTcgNzIwIDM5MlQ2ODIgMzc4VDY0OCAzNTlUNjE5IDMzNVQ1OTQgMzEwVDU3NCAyODVUNTU5IDI2M1Q1NDggMjQ2TDU0MyAyMzhMNTc0IDE5OFE2MDUgMTU4IDYyMiAxMzhUNjY0IDk0VDcxNCA2MVQ3NjUgNTFRODI3IDUxIDg2NyAxMDBUOTA3IDIxN1pNOTIgMjE0UTkyIDE0NSAxMzEgODlUMjM5IDMzUTM1NyAzMyA0NTYgMTkzTDQyNSAyMzNRMzY0IDMxMiAzMzQgMzM3UTI4NSAzODAgMjMzIDM4MFExNzEgMzgwIDEzMiAzMzFUOTIgMjE0WiI+PC9wYXRoPgo8L2RlZnM+CjxnIHN0cm9rZT0iY3VycmVudENvbG9yIiBmaWxsPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMCIgdHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgLTEgMCAwKSIgYXJpYS1oaWRkZW49InRydWUiPgo8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMTQsMCkiPgogPHVzZSB4bGluazpocmVmPSIjRTEtTUpNQUlOLTZDIj48L3VzZT4KIDx1c2UgeGxpbms6aHJlZj0iI0UxLU1KTUFJTi02OSIgeD0iMjc4IiB5PSIwIj48L3VzZT4KIDx1c2UgeGxpbms6aHJlZj0iI0UxLU1KTUFJTi02RCIgeD0iNTU3IiB5PSIwIj48L3VzZT4KPC9nPgo8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLC02MDEpIj4KIDx1c2UgdHJhbnNmb3JtPSJzY2FsZSgwLjcwNykiIHhsaW5rOmhyZWY9IiNFMS1NSk1BVEhJLTc4IiB4PSIwIiB5PSIwIj48L3VzZT4KIDx1c2UgdHJhbnNmb3JtPSJzY2FsZSgwLjcwNykiIHhsaW5rOmhyZWY9IiNFMS1NSk1BSU4tMjE5MiIgeD0iNTcyIiB5PSIwIj48L3VzZT4KIDx1c2UgdHJhbnNmb3JtPSJzY2FsZSgwLjcwNykiIHhsaW5rOmhyZWY9IiNFMS1NSk1BSU4tMjIxRSIgeD0iMTU3MyIgeT0iMCI+PC91c2U+CjwvZz4KPC9nPgo8L3N2Zz4='
        },
        {
            action: '\\underrightarrow',
            label: '\\underrightarrow{X}',
            svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjIuMzI0ZXgiIGhlaWdodD0iMy42NzZleCIgc3R5bGU9InZlcnRpY2FsLWFsaWduOiAtMS44MzhleDsiIHZpZXdCb3g9IjAgLTc5MS4zIDEwMDAuNSAxNTgyLjciIHJvbGU9ImltZyIgZm9jdXNhYmxlPSJmYWxzZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBhcmlhLWxhYmVsbGVkYnk9Ik1hdGhKYXgtU1ZHLTEtVGl0bGUiPgo8dGl0bGUgaWQ9Ik1hdGhKYXgtU1ZHLTEtVGl0bGUiPlx1bmRlcnJpZ2h0YXJyb3d7XHNxdWFyZX08L3RpdGxlPgo8ZGVmcyBhcmlhLWhpZGRlbj0idHJ1ZSI+CjxwYXRoIHN0cm9rZS13aWR0aD0iMSIgaWQ9IkUxLU1KQU1TLTI1QTEiIGQ9Ik03MSAwUTU5IDQgNTUgMTZWMzQ2TDU2IDY3NlE2NCA2ODYgNzAgNjg5SDcwOVE3MTkgNjgxIDcyMiA2NzRWMTVRNzE5IDEwIDcwOSAxTDM5MCAwSDcxWk02ODIgNDBWNjQ5SDk1VjQwSDY4MloiPjwvcGF0aD4KPHBhdGggc3Ryb2tlLXdpZHRoPSIxIiBpZD0iRTEtTUpNQUlOLTIxOTIiIGQ9Ik01NiAyMzdUNTYgMjUwVDcwIDI3MEg4MzVRNzE5IDM1NyA2OTIgNDkzUTY5MiA0OTQgNjkyIDQ5NlQ2OTEgNDk5UTY5MSA1MTEgNzA4IDUxMUg3MTFRNzIwIDUxMSA3MjMgNTEwVDcyOSA1MDZUNzMyIDQ5N1Q3MzUgNDgxVDc0MyA0NTZRNzY1IDM4OSA4MTYgMzM2VDkzNSAyNjFROTQ0IDI1OCA5NDQgMjUwUTk0NCAyNDQgOTM5IDI0MVQ5MTUgMjMxVDg3NyAyMTJRODM2IDE4NiA4MDYgMTUyVDc2MSA4NVQ3NDAgMzVUNzMyIDRRNzMwIC02IDcyNyAtOFQ3MTEgLTExUTY5MSAtMTEgNjkxIDBRNjkxIDcgNjk2IDI1UTcyOCAxNTEgODM1IDIzMEg3MFE1NiAyMzcgNTYgMjUwWiI+PC9wYXRoPgo8L2RlZnM+CjxnIHN0cm9rZT0iY3VycmVudENvbG9yIiBmaWxsPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMCIgdHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgLTEgMCAwKSIgYXJpYS1oaWRkZW49InRydWUiPgogPHVzZSB4bGluazpocmVmPSIjRTEtTUpBTVMtMjVBMSIgeD0iMTExIiB5PSIwIj48L3VzZT4KIDx1c2UgeGxpbms6aHJlZj0iI0UxLU1KTUFJTi0yMTkyIiB4PSIwIiB5PSItNjkzIj48L3VzZT4KPC9nPgo8L3N2Zz4='
        },
        {
            action: '\\bar',
            label: '\\bar{X}',
            svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjEuODA4ZXgiIGhlaWdodD0iMi41MDlleCIgc3R5bGU9InZlcnRpY2FsLWFsaWduOiAtMC4zMzhleDsiIHZpZXdCb3g9IjAgLTkzNC45IDc3OC41IDEwODAuNCIgcm9sZT0iaW1nIiBmb2N1c2FibGU9ImZhbHNlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGFyaWEtbGFiZWxsZWRieT0iTWF0aEpheC1TVkctMS1UaXRsZSI+Cjx0aXRsZSBpZD0iTWF0aEpheC1TVkctMS1UaXRsZSI+XGJhcntcc3F1YXJlfTwvdGl0bGU+CjxkZWZzIGFyaWEtaGlkZGVuPSJ0cnVlIj4KPHBhdGggc3Ryb2tlLXdpZHRoPSIxIiBpZD0iRTEtTUpBTVMtMjVBMSIgZD0iTTcxIDBRNTkgNCA1NSAxNlYzNDZMNTYgNjc2UTY0IDY4NiA3MCA2ODlINzA5UTcxOSA2ODEgNzIyIDY3NFYxNVE3MTkgMTAgNzA5IDFMMzkwIDBINzFaTTY4MiA0MFY2NDlIOTVWNDBINjgyWiI+PC9wYXRoPgo8cGF0aCBzdHJva2Utd2lkdGg9IjEiIGlkPSJFMS1NSk1BSU4tQUYiIGQ9Ik02OSA1NDRWNTkwSDQzMFY1NDRINjlaIj48L3BhdGg+CjwvZGVmcz4KPGcgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIGZpbGw9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIwIiB0cmFuc2Zvcm09Im1hdHJpeCgxIDAgMCAtMSAwIDApIiBhcmlhLWhpZGRlbj0idHJ1ZSI+CiA8dXNlIHhsaW5rOmhyZWY9IiNFMS1NSkFNUy0yNUExIiB4PSIwIiB5PSIwIj48L3VzZT4KIDx1c2UgeGxpbms6aHJlZj0iI0UxLU1KTUFJTi1BRiIgeD0iMTM5IiB5PSIyNTQiPjwvdXNlPgo8L2c+Cjwvc3ZnPg=='
        },
        {
            action: '\\overline{\\text{i}}',
            useWrite: true,
            svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjAuNzYyZXgiIGhlaWdodD0iMi44NDNleCIgc3R5bGU9InZlcnRpY2FsLWFsaWduOiAtMC4zMzhleDsiIHZpZXdCb3g9IjAgLTEwNzguNCAzMjggMTIyMy45IiByb2xlPSJpbWciIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgYXJpYS1sYWJlbGxlZGJ5PSJNYXRoSmF4LVNWRy0xLVRpdGxlIj4KPHRpdGxlIGlkPSJNYXRoSmF4LVNWRy0xLVRpdGxlIj5cb3ZlcmxpbmV7XHRleHR7aX19PC90aXRsZT4KPGRlZnMgYXJpYS1oaWRkZW49InRydWUiPgo8cGF0aCBzdHJva2Utd2lkdGg9IjEiIGlkPSJFMS1NSk1BSU4tNjkiIGQ9Ik02OSA2MDlRNjkgNjM3IDg3IDY1M1QxMzEgNjY5UTE1NCA2NjcgMTcxIDY1MlQxODggNjA5UTE4OCA1NzkgMTcxIDU2NFQxMjkgNTQ5UTEwNCA1NDkgODcgNTY0VDY5IDYwOVpNMjQ3IDBRMjMyIDMgMTQzIDNRMTMyIDMgMTA2IDNUNTYgMUwzNCAwSDI2VjQ2SDQyUTcwIDQ2IDkxIDQ5UTEwMCA1MyAxMDIgNjBUMTA0IDEwMlYyMDVWMjkzUTEwNCAzNDUgMTAyIDM1OVQ4OCAzNzhRNzQgMzg1IDQxIDM4NUgzMFY0MDhRMzAgNDMxIDMyIDQzMUw0MiA0MzJRNTIgNDMzIDcwIDQzNFQxMDYgNDM2UTEyMyA0MzcgMTQyIDQzOFQxNzEgNDQxVDE4MiA0NDJIMTg1VjYyUTE5MCA1MiAxOTcgNTBUMjMyIDQ2SDI1NVYwSDI0N1oiPjwvcGF0aD4KPHBhdGggc3Ryb2tlLXdpZHRoPSIxIiBpZD0iRTEtTUpNQUlOLUFGIiBkPSJNNjkgNTQ0VjU5MEg0MzBWNTQ0SDY5WiI+PC9wYXRoPgo8L2RlZnM+CjxnIHN0cm9rZT0iY3VycmVudENvbG9yIiBmaWxsPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMCIgdHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgLTEgMCAwKSIgYXJpYS1oaWRkZW49InRydWUiPgogPHVzZSB4bGluazpocmVmPSIjRTEtTUpNQUlOLTY5IiB4PSIyNCIgeT0iMCI+PC91c2U+CjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAsNDg2KSI+CiA8dXNlIHRyYW5zZm9ybT0ic2NhbGUoMC43MDcpIiB4bGluazpocmVmPSIjRTEtTUpNQUlOLUFGIiB4PSItNzAiIHk9IjAiPjwvdXNlPgogPHVzZSB0cmFuc2Zvcm09InNjYWxlKDAuNzA3KSIgeGxpbms6aHJlZj0iI0UxLU1KTUFJTi1BRiIgeD0iLTM3IiB5PSIwIj48L3VzZT4KPC9nPgo8L2c+Cjwvc3ZnPg=='
        },
        {
            action: '\\overline{\\text{j}}',
            useWrite: true,
            svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjAuODk2ZXgiIGhlaWdodD0iMy4xNzZleCIgc3R5bGU9InZlcnRpY2FsLWFsaWduOiAtMC42NzFleDsgbWFyZ2luLWxlZnQ6IC0wLjA2OWV4OyIgdmlld0JveD0iLTI5LjggLTEwNzguNCAzODUuNyAxMzY3LjQiIHJvbGU9ImltZyIgZm9jdXNhYmxlPSJmYWxzZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBhcmlhLWxhYmVsbGVkYnk9Ik1hdGhKYXgtU1ZHLTEtVGl0bGUiPgo8dGl0bGUgaWQ9Ik1hdGhKYXgtU1ZHLTEtVGl0bGUiPlxvdmVybGluZXtcdGV4dHtqfX08L3RpdGxlPgo8ZGVmcyBhcmlhLWhpZGRlbj0idHJ1ZSI+CjxwYXRoIHN0cm9rZS13aWR0aD0iMSIgaWQ9IkUxLU1KTUFJTi02QSIgZD0iTTk4IDYwOVE5OCA2MzcgMTE2IDY1M1QxNjAgNjY5UTE4MyA2NjcgMjAwIDY1MlQyMTcgNjA5UTIxNyA1NzkgMjAwIDU2NFQxNTggNTQ5UTEzMyA1NDkgMTE2IDU2NFQ5OCA2MDlaTTI4IC0xNjNRNTggLTE2OCA2NCAtMTY4UTEyNCAtMTY4IDEzNSAtNzdRMTM3IC02NSAxMzcgMTQxVDEzNiAzNTNRMTMyIDM3MSAxMjAgMzc3VDcyIDM4NUg1MlY0MDhRNTIgNDMxIDU0IDQzMUw1OCA0MzJRNjIgNDMyIDcwIDQzMlQ4NyA0MzNUMTA4IDQzNFQxMzMgNDM2UTE1MSA0MzcgMTcxIDQzOFQyMDIgNDQxVDIxNCA0NDJIMjE4VjE4NFEyMTcgLTM2IDIxNyAtNTlUMjExIC05OFExOTUgLTE0NSAxNTMgLTE3NVQ1OCAtMjA1UTkgLTIwNSAtMjMgLTE3OVQtNTUgLTExN1EtNTUgLTk0IC00MCAtNzlULTIgLTY0VDM2IC03OVQ1MiAtMTE4UTUyIC0xNDMgMjggLTE2M1oiPjwvcGF0aD4KPHBhdGggc3Ryb2tlLXdpZHRoPSIxIiBpZD0iRTEtTUpNQUlOLUFGIiBkPSJNNjkgNTQ0VjU5MEg0MzBWNTQ0SDY5WiI+PC9wYXRoPgo8L2RlZnM+CjxnIHN0cm9rZT0iY3VycmVudENvbG9yIiBmaWxsPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMCIgdHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgLTEgMCAwKSIgYXJpYS1oaWRkZW49InRydWUiPgogPHVzZSB4bGluazpocmVmPSIjRTEtTUpNQUlOLTZBIiB4PSIyNCIgeT0iMCI+PC91c2U+CjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAsNDg2KSI+CiA8dXNlIHRyYW5zZm9ybT0ic2NhbGUoMC43MDcpIiB4bGluazpocmVmPSIjRTEtTUpNQUlOLUFGIiB4PSItNzAiIHk9IjAiPjwvdXNlPgogPHVzZSB0cmFuc2Zvcm09InNjYWxlKDAuNzA3KSIgeGxpbms6aHJlZj0iI0UxLU1KTUFJTi1BRiIgeD0iMiIgeT0iMCI+PC91c2U+CjwvZz4KPC9nPgo8L3N2Zz4='
        },
        {
            action: '\\overline{\\text{k}}',
            useWrite: true,
            svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjEuMzQyZXgiIGhlaWdodD0iMy4wMDlleCIgc3R5bGU9InZlcnRpY2FsLWFsaWduOiAtMC4zMzhleDsiIHZpZXdCb3g9IjAgLTExNTAuMSA1NzggMTI5NS43IiByb2xlPSJpbWciIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgYXJpYS1sYWJlbGxlZGJ5PSJNYXRoSmF4LVNWRy0xLVRpdGxlIj4KPHRpdGxlIGlkPSJNYXRoSmF4LVNWRy0xLVRpdGxlIj5cb3ZlcmxpbmV7XHRleHR7a319PC90aXRsZT4KPGRlZnMgYXJpYS1oaWRkZW49InRydWUiPgo8cGF0aCBzdHJva2Utd2lkdGg9IjEiIGlkPSJFMS1NSk1BSU4tNkIiIGQ9Ik0zNiA0Nkg1MFE4OSA0NiA5NyA2MFY2OFE5NyA3NyA5NyA5MVQ5NyAxMjRUOTggMTY3VDk4IDIxN1Q5OCAyNzJUOTggMzI5UTk4IDM2NiA5OCA0MDdUOTggNDgyVDk4IDU0MlQ5NyA1ODZUOTcgNjAzUTk0IDYyMiA4MyA2MjhUMzggNjM3SDIwVjY2MFEyMCA2ODMgMjIgNjgzTDMyIDY4NFE0MiA2ODUgNjEgNjg2VDk4IDY4OFExMTUgNjg5IDEzNSA2OTBUMTY1IDY5M1QxNzYgNjk0SDE3OVY0NjNMMTgwIDIzM0wyNDAgMjg3UTMwMCAzNDEgMzA0IDM0N1EzMTAgMzU2IDMxMCAzNjRRMzEwIDM4MyAyODkgMzg1SDI4NFY0MzFIMjkzUTMwOCA0MjggNDEyIDQyOFE0NzUgNDI4IDQ4NCA0MzFINDg5VjM4NUg0NzZRNDA3IDM4MCAzNjAgMzQxUTI4NiAyNzggMjg2IDI3NFEyODYgMjczIDM0OSAxODFUNDIwIDc5UTQzNCA2MCA0NTEgNTNUNTAwIDQ2SDUxMVYwSDUwNVE0OTYgMyA0MTggM1EzMjIgMyAzMDcgMEgyOTlWNDZIMzA2UTMzMCA0OCAzMzAgNjVRMzMwIDcyIDMyNiA3OVEzMjMgODQgMjc2IDE1M1QyMjggMjIyTDE3NiAxNzZWMTIwVjg0UTE3NiA2NSAxNzggNTlUMTg5IDQ5UTIxMCA0NiAyMzggNDZIMjU0VjBIMjQ2UTIzMSAzIDEzNyAzVDI4IDBIMjBWNDZIMzZaIj48L3BhdGg+CjxwYXRoIHN0cm9rZS13aWR0aD0iMSIgaWQ9IkUxLU1KTUFJTi1BRiIgZD0iTTY5IDU0NFY1OTBINDMwVjU0NEg2OVoiPjwvcGF0aD4KPC9kZWZzPgo8ZyBzdHJva2U9ImN1cnJlbnRDb2xvciIgZmlsbD0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAiIHRyYW5zZm9ybT0ibWF0cml4KDEgMCAwIC0xIDAgMCkiIGFyaWEtaGlkZGVuPSJ0cnVlIj4KIDx1c2UgeGxpbms6aHJlZj0iI0UxLU1KTUFJTi02QiIgeD0iMjQiIHk9IjAiPjwvdXNlPgo8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLDUxMikiPgogPHVzZSB0cmFuc2Zvcm09InNjYWxlKDAuNzA3KSIgeGxpbms6aHJlZj0iI0UxLU1KTUFJTi1BRiIgeD0iLTcwIiB5PSIwIj48L3VzZT4KPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjUxLjgwNjE2MDY3NjM3NjI3LDApIHNjYWxlKDAuMDcwMzkyOTg1MzU3ODQxMjUsMSkiPgogPHVzZSB0cmFuc2Zvcm09InNjYWxlKDAuNzA3KSIgeGxpbms6aHJlZj0iI0UxLU1KTUFJTi1BRiI+PC91c2U+CjwvZz4KIDx1c2UgdHJhbnNmb3JtPSJzY2FsZSgwLjcwNykiIHhsaW5rOmhyZWY9IiNFMS1NSk1BSU4tQUYiIHg9IjMxNiIgeT0iMCI+PC91c2U+CjwvZz4KPC9nPgo8L3N2Zz4='
        },
        {
            action: '(',
            label: '(X)',
            svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjMuNjE3ZXgiIGhlaWdodD0iMi44NDNleCIgc3R5bGU9InZlcnRpY2FsLWFsaWduOiAtMC44MzhleDsiIHZpZXdCb3g9IjAgLTg2My4xIDE1NTcuNSAxMjIzLjkiIHJvbGU9ImltZyIgZm9jdXNhYmxlPSJmYWxzZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBhcmlhLWxhYmVsbGVkYnk9Ik1hdGhKYXgtU1ZHLTEtVGl0bGUiPgo8dGl0bGUgaWQ9Ik1hdGhKYXgtU1ZHLTEtVGl0bGUiPihcc3F1YXJlKTwvdGl0bGU+CjxkZWZzIGFyaWEtaGlkZGVuPSJ0cnVlIj4KPHBhdGggc3Ryb2tlLXdpZHRoPSIxIiBpZD0iRTEtTUpNQUlOLTI4IiBkPSJNOTQgMjUwUTk0IDMxOSAxMDQgMzgxVDEyNyA0ODhUMTY0IDU3NlQyMDIgNjQzVDI0NCA2OTVUMjc3IDcyOVQzMDIgNzUwSDMxNUgzMTlRMzMzIDc1MCAzMzMgNzQxUTMzMyA3MzggMzE2IDcyMFQyNzUgNjY3VDIyNiA1ODFUMTg0IDQ0M1QxNjcgMjUwVDE4NCA1OFQyMjUgLTgxVDI3NCAtMTY3VDMxNiAtMjIwVDMzMyAtMjQxUTMzMyAtMjUwIDMxOCAtMjUwSDMxNUgzMDJMMjc0IC0yMjZRMTgwIC0xNDEgMTM3IC0xNFQ5NCAyNTBaIj48L3BhdGg+CjxwYXRoIHN0cm9rZS13aWR0aD0iMSIgaWQ9IkUxLU1KQU1TLTI1QTEiIGQ9Ik03MSAwUTU5IDQgNTUgMTZWMzQ2TDU2IDY3NlE2NCA2ODYgNzAgNjg5SDcwOVE3MTkgNjgxIDcyMiA2NzRWMTVRNzE5IDEwIDcwOSAxTDM5MCAwSDcxWk02ODIgNDBWNjQ5SDk1VjQwSDY4MloiPjwvcGF0aD4KPHBhdGggc3Ryb2tlLXdpZHRoPSIxIiBpZD0iRTEtTUpNQUlOLTI5IiBkPSJNNjAgNzQ5TDY0IDc1MFE2OSA3NTAgNzQgNzUwSDg2TDExNCA3MjZRMjA4IDY0MSAyNTEgNTE0VDI5NCAyNTBRMjk0IDE4MiAyODQgMTE5VDI2MSAxMlQyMjQgLTc2VDE4NiAtMTQzVDE0NSAtMTk0VDExMyAtMjI3VDkwIC0yNDZRODcgLTI0OSA4NiAtMjUwSDc0UTY2IC0yNTAgNjMgLTI1MFQ1OCAtMjQ3VDU1IC0yMzhRNTYgLTIzNyA2NiAtMjI1UTIyMSAtNjQgMjIxIDI1MFQ2NiA3MjVRNTYgNzM3IDU1IDczOFE1NSA3NDYgNjAgNzQ5WiI+PC9wYXRoPgo8L2RlZnM+CjxnIHN0cm9rZT0iY3VycmVudENvbG9yIiBmaWxsPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMCIgdHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgLTEgMCAwKSIgYXJpYS1oaWRkZW49InRydWUiPgogPHVzZSB4bGluazpocmVmPSIjRTEtTUpNQUlOLTI4IiB4PSIwIiB5PSIwIj48L3VzZT4KIDx1c2UgeGxpbms6aHJlZj0iI0UxLU1KQU1TLTI1QTEiIHg9IjM4OSIgeT0iMCI+PC91c2U+CiA8dXNlIHhsaW5rOmhyZWY9IiNFMS1NSk1BSU4tMjkiIHg9IjExNjgiIHk9IjAiPjwvdXNlPgo8L2c+Cjwvc3ZnPg=='
        },
        {
            action: ']x[',
            label: ']X[',
            useWrite: true,
            svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjMuMTAyZXgiIGhlaWdodD0iMi44NDNleCIgc3R5bGU9InZlcnRpY2FsLWFsaWduOiAtMC44MzhleDsiIHZpZXdCb3g9IjAgLTg2My4xIDEzMzUuNSAxMjIzLjkiIHJvbGU9ImltZyIgZm9jdXNhYmxlPSJmYWxzZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBhcmlhLWxhYmVsbGVkYnk9Ik1hdGhKYXgtU1ZHLTEtVGl0bGUiPgo8dGl0bGUgaWQ9Ik1hdGhKYXgtU1ZHLTEtVGl0bGUiPl1cc3F1YXJlWzwvdGl0bGU+CjxkZWZzIGFyaWEtaGlkZGVuPSJ0cnVlIj4KPHBhdGggc3Ryb2tlLXdpZHRoPSIxIiBpZD0iRTEtTUpNQUlOLTVEIiBkPSJNMjIgNzEwVjc1MEgxNTlWLTI1MEgyMlYtMjEwSDExOVY3MTBIMjJaIj48L3BhdGg+CjxwYXRoIHN0cm9rZS13aWR0aD0iMSIgaWQ9IkUxLU1KQU1TLTI1QTEiIGQ9Ik03MSAwUTU5IDQgNTUgMTZWMzQ2TDU2IDY3NlE2NCA2ODYgNzAgNjg5SDcwOVE3MTkgNjgxIDcyMiA2NzRWMTVRNzE5IDEwIDcwOSAxTDM5MCAwSDcxWk02ODIgNDBWNjQ5SDk1VjQwSDY4MloiPjwvcGF0aD4KPHBhdGggc3Ryb2tlLXdpZHRoPSIxIiBpZD0iRTEtTUpNQUlOLTVCIiBkPSJNMTE4IC0yNTBWNzUwSDI1NVY3MTBIMTU4Vi0yMTBIMjU1Vi0yNTBIMTE4WiI+PC9wYXRoPgo8L2RlZnM+CjxnIHN0cm9rZT0iY3VycmVudENvbG9yIiBmaWxsPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMCIgdHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgLTEgMCAwKSIgYXJpYS1oaWRkZW49InRydWUiPgogPHVzZSB4bGluazpocmVmPSIjRTEtTUpNQUlOLTVEIiB4PSIwIiB5PSIwIj48L3VzZT4KIDx1c2UgeGxpbms6aHJlZj0iI0UxLU1KQU1TLTI1QTEiIHg9IjI3OCIgeT0iMCI+PC91c2U+CiA8dXNlIHhsaW5rOmhyZWY9IiNFMS1NSk1BSU4tNUIiIHg9IjEwNTciIHk9IjAiPjwvdXNlPgo8L2c+Cjwvc3ZnPg=='
        },
        {
            action: '[x[',
            label: '[X[',
            useWrite: true,
            svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjMuMTAyZXgiIGhlaWdodD0iMi44NDNleCIgc3R5bGU9InZlcnRpY2FsLWFsaWduOiAtMC44MzhleDsiIHZpZXdCb3g9IjAgLTg2My4xIDEzMzUuNSAxMjIzLjkiIHJvbGU9ImltZyIgZm9jdXNhYmxlPSJmYWxzZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBhcmlhLWxhYmVsbGVkYnk9Ik1hdGhKYXgtU1ZHLTEtVGl0bGUiPgo8dGl0bGUgaWQ9Ik1hdGhKYXgtU1ZHLTEtVGl0bGUiPltcc3F1YXJlWzwvdGl0bGU+CjxkZWZzIGFyaWEtaGlkZGVuPSJ0cnVlIj4KPHBhdGggc3Ryb2tlLXdpZHRoPSIxIiBpZD0iRTEtTUpNQUlOLTVCIiBkPSJNMTE4IC0yNTBWNzUwSDI1NVY3MTBIMTU4Vi0yMTBIMjU1Vi0yNTBIMTE4WiI+PC9wYXRoPgo8cGF0aCBzdHJva2Utd2lkdGg9IjEiIGlkPSJFMS1NSkFNUy0yNUExIiBkPSJNNzEgMFE1OSA0IDU1IDE2VjM0Nkw1NiA2NzZRNjQgNjg2IDcwIDY4OUg3MDlRNzE5IDY4MSA3MjIgNjc0VjE1UTcxOSAxMCA3MDkgMUwzOTAgMEg3MVpNNjgyIDQwVjY0OUg5NVY0MEg2ODJaIj48L3BhdGg+CjwvZGVmcz4KPGcgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIGZpbGw9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIwIiB0cmFuc2Zvcm09Im1hdHJpeCgxIDAgMCAtMSAwIDApIiBhcmlhLWhpZGRlbj0idHJ1ZSI+CiA8dXNlIHhsaW5rOmhyZWY9IiNFMS1NSk1BSU4tNUIiIHg9IjAiIHk9IjAiPjwvdXNlPgogPHVzZSB4bGluazpocmVmPSIjRTEtTUpBTVMtMjVBMSIgeD0iMjc4IiB5PSIwIj48L3VzZT4KIDx1c2UgeGxpbms6aHJlZj0iI0UxLU1KTUFJTi01QiIgeD0iMTA1NyIgeT0iMCI+PC91c2U+CjwvZz4KPC9zdmc+'
        },
        {
            action: '_{ }^{ } ',
            label: '_{X}^{X}X',
            useWrite: true,
            svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjMuMzE5ZXgiIGhlaWdodD0iMy4xNzZleCIgc3R5bGU9InZlcnRpY2FsLWFsaWduOiAtMS4wMDVleDsiIHZpZXdCb3g9IjAgLTkzNC45IDE0MjkgMTM2Ny40IiByb2xlPSJpbWciIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgYXJpYS1sYWJlbGxlZGJ5PSJNYXRoSmF4LVNWRy0xLVRpdGxlIj4KPHRpdGxlIGlkPSJNYXRoSmF4LVNWRy0xLVRpdGxlIj5fe1xzcXVhcmV9Xntcc3F1YXJlfVxzcXVhcmU8L3RpdGxlPgo8ZGVmcyBhcmlhLWhpZGRlbj0idHJ1ZSI+CjxwYXRoIHN0cm9rZS13aWR0aD0iMSIgaWQ9IkUxLU1KQU1TLTI1QTEiIGQ9Ik03MSAwUTU5IDQgNTUgMTZWMzQ2TDU2IDY3NlE2NCA2ODYgNzAgNjg5SDcwOVE3MTkgNjgxIDcyMiA2NzRWMTVRNzE5IDEwIDcwOSAxTDM5MCAwSDcxWk02ODIgNDBWNjQ5SDk1VjQwSDY4MloiPjwvcGF0aD4KPC9kZWZzPgo8ZyBzdHJva2U9ImN1cnJlbnRDb2xvciIgZmlsbD0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAiIHRyYW5zZm9ybT0ibWF0cml4KDEgMCAwIC0xIDAgMCkiIGFyaWEtaGlkZGVuPSJ0cnVlIj4KIDx1c2UgdHJhbnNmb3JtPSJzY2FsZSgwLjcwNykiIHhsaW5rOmhyZWY9IiNFMS1NSkFNUy0yNUExIiB4PSIwIiB5PSI0ODgiPjwvdXNlPgogPHVzZSB0cmFuc2Zvcm09InNjYWxlKDAuNzA3KSIgeGxpbms6aHJlZj0iI0UxLU1KQU1TLTI1QTEiIHg9IjAiIHk9Ii00NTgiPjwvdXNlPgogPHVzZSB4bGluazpocmVmPSIjRTEtTUpBTVMtMjVBMSIgeD0iNjUwIiB5PSIwIj48L3VzZT4KPC9nPgo8L3N2Zz4='
        },
        {
            action: '\\array',
            label: '\\begin{array}{l|l}X&X\\\\\\hlineX&X\\end{array}',
            svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjguNTQ4ZXgiIGhlaWdodD0iNy4xNzZleCIgc3R5bGU9InZlcnRpY2FsLWFsaWduOiAtMy4wMDVleDsiIHZpZXdCb3g9IjAgLTE3OTYgMzY4MC41IDMwODkuNiIgcm9sZT0iaW1nIiBmb2N1c2FibGU9ImZhbHNlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGFyaWEtbGFiZWxsZWRieT0iTWF0aEpheC1TVkctMS1UaXRsZSI+Cjx0aXRsZSBpZD0iTWF0aEpheC1TVkctMS1UaXRsZSI+XGJlZ2lue2FycmF5fXtsfGx9XHNxdWFyZSZhbXA7XHNxdWFyZVxcXGhsaW5lXHNxdWFyZSZhbXA7XHNxdWFyZVxlbmR7YXJyYXl9PC90aXRsZT4KPGRlZnMgYXJpYS1oaWRkZW49InRydWUiPgo8cGF0aCBzdHJva2Utd2lkdGg9IjEiIGlkPSJFMS1NSkFNUy0yNUExIiBkPSJNNzEgMFE1OSA0IDU1IDE2VjM0Nkw1NiA2NzZRNjQgNjg2IDcwIDY4OUg3MDlRNzE5IDY4MSA3MjIgNjc0VjE1UTcxOSAxMCA3MDkgMUwzOTAgMEg3MVpNNjgyIDQwVjY0OUg5NVY0MEg2ODJaIj48L3BhdGg+CjwvZGVmcz4KPGcgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIGZpbGw9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIwIiB0cmFuc2Zvcm09Im1hdHJpeCgxIDAgMCAtMSAwIDApIiBhcmlhLWhpZGRlbj0idHJ1ZSI+CjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE2NywwKSI+CjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDM4OSwwKSI+CiA8dXNlIHhsaW5rOmhyZWY9IiNFMS1NSkFNUy0yNUExIiB4PSIwIiB5PSI2NTAiPjwvdXNlPgogPHVzZSB4bGluazpocmVmPSIjRTEtTUpBTVMtMjVBMSIgeD0iMCIgeT0iLTc1MCI+PC91c2U+CjwvZz4KPGxpbmUgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIgc3Ryb2tlLXdpZHRoPSIyMC45IiB5MT0iMTAiIHgyPSIxMCIgeDE9IjEwIiB5Mj0iMjgyMCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTY2OCwtMTE2NikiPjwvbGluZT4KPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjE2OCwwKSI+CiA8dXNlIHhsaW5rOmhyZWY9IiNFMS1NSkFNUy0yNUExIiB4PSIwIiB5PSI2NTAiPjwvdXNlPgogPHVzZSB4bGluazpocmVmPSIjRTEtTUpBTVMtMjVBMSIgeD0iMCIgeT0iLTc1MCI+PC91c2U+CjwvZz4KPGxpbmUgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIgc3Ryb2tlLXdpZHRoPSIyMC45IiB5Mj0iMTAiIHkxPSIxMCIgeDE9IjEwIiB4Mj0iMzMzNiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCwyMzkpIj48L2xpbmU+CjwvZz4KPC9nPgo8L3N2Zz4='
        },
        {
            action: '^{x\\text{)}}\\frac{a}{b}',
            label: '^{X\\text{)}}\\frac{X}{X}',
            useWrite: true,
            svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjQuNzk1ZXgiIGhlaWdodD0iNS4zNDNleCIgc3R5bGU9InZlcnRpY2FsLWFsaWduOiAtMS44MzhleDsiIHZpZXdCb3g9IjAgLTE1MDguOSAyMDY0LjQgMjMwMC4zIiByb2xlPSJpbWciIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgYXJpYS1sYWJlbGxlZGJ5PSJNYXRoSmF4LVNWRy0xLVRpdGxlIj4KPHRpdGxlIGlkPSJNYXRoSmF4LVNWRy0xLVRpdGxlIj5ee1xzcXVhcmVcdGV4dHspfX1cZnJhY3tcc3F1YXJlfXtcc3F1YXJlfTwvdGl0bGU+CjxkZWZzIGFyaWEtaGlkZGVuPSJ0cnVlIj4KPHBhdGggc3Ryb2tlLXdpZHRoPSIxIiBpZD0iRTEtTUpBTVMtMjVBMSIgZD0iTTcxIDBRNTkgNCA1NSAxNlYzNDZMNTYgNjc2UTY0IDY4NiA3MCA2ODlINzA5UTcxOSA2ODEgNzIyIDY3NFYxNVE3MTkgMTAgNzA5IDFMMzkwIDBINzFaTTY4MiA0MFY2NDlIOTVWNDBINjgyWiI+PC9wYXRoPgo8cGF0aCBzdHJva2Utd2lkdGg9IjEiIGlkPSJFMS1NSk1BSU4tMjkiIGQ9Ik02MCA3NDlMNjQgNzUwUTY5IDc1MCA3NCA3NTBIODZMMTE0IDcyNlEyMDggNjQxIDI1MSA1MTRUMjk0IDI1MFEyOTQgMTgyIDI4NCAxMTlUMjYxIDEyVDIyNCAtNzZUMTg2IC0xNDNUMTQ1IC0xOTRUMTEzIC0yMjdUOTAgLTI0NlE4NyAtMjQ5IDg2IC0yNTBINzRRNjYgLTI1MCA2MyAtMjUwVDU4IC0yNDdUNTUgLTIzOFE1NiAtMjM3IDY2IC0yMjVRMjIxIC02NCAyMjEgMjUwVDY2IDcyNVE1NiA3MzcgNTUgNzM4UTU1IDc0NiA2MCA3NDlaIj48L3BhdGg+CjwvZGVmcz4KPGcgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIGZpbGw9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIwIiB0cmFuc2Zvcm09Im1hdHJpeCgxIDAgMCAtMSAwIDApIiBhcmlhLWhpZGRlbj0idHJ1ZSI+CjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAsNDEyKSI+CiA8dXNlIHRyYW5zZm9ybT0ic2NhbGUoMC43MDcpIiB4bGluazpocmVmPSIjRTEtTUpBTVMtMjVBMSIgeD0iMCIgeT0iMCI+PC91c2U+CiA8dXNlIHRyYW5zZm9ybT0ic2NhbGUoMC43MDcpIiB4bGluazpocmVmPSIjRTEtTUpNQUlOLTI5IiB4PSI3NzgiIHk9IjAiPjwvdXNlPgo8L2c+CjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDkyNSwwKSI+CjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEyMCwwKSI+CjxyZWN0IHN0cm9rZT0ibm9uZSIgd2lkdGg9Ijg5OCIgaGVpZ2h0PSI2MCIgeD0iMCIgeT0iMjIwIj48L3JlY3Q+CiA8dXNlIHhsaW5rOmhyZWY9IiNFMS1NSkFNUy0yNUExIiB4PSI2MCIgeT0iNjc2Ij48L3VzZT4KIDx1c2UgeGxpbms6aHJlZj0iI0UxLU1KQU1TLTI1QTEiIHg9IjYwIiB5PSItNzEwIj48L3VzZT4KPC9nPgo8L2c+CjwvZz4KPC9zdmc+'
        },
        {
            action: '\\mathrm',
            label: '\\mathrm{T}',
            svg: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjEuNjc4ZXgiIGhlaWdodD0iMi4xNzZleCIgc3R5bGU9InZlcnRpY2FsLWFsaWduOiAtMC4zMzhleDsiIHZpZXdCb3g9IjAgLTc5MS4zIDcyMi41IDkzNi45IiByb2xlPSJpbWciIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgYXJpYS1sYWJlbGxlZGJ5PSJNYXRoSmF4LVNWRy0xLVRpdGxlIj4KPHRpdGxlIGlkPSJNYXRoSmF4LVNWRy0xLVRpdGxlIj5cbWF0aHJte1R9PC90aXRsZT4KPGRlZnMgYXJpYS1oaWRkZW49InRydWUiPgo8cGF0aCBzdHJva2Utd2lkdGg9IjEiIGlkPSJFMS1NSk1BSU4tNTQiIGQ9Ik0zNiA0NDNRMzcgNDQ4IDQ2IDU1OFQ1NSA2NzFWNjc3SDY2NlY2NzFRNjY3IDY2NiA2NzYgNTU2VDY4NSA0NDNWNDM3SDY0NVY0NDNRNjQ1IDQ0NSA2NDIgNDc4VDYzMSA1NDRUNjEwIDU5M1E1OTMgNjE0IDU1NSA2MjVRNTM0IDYzMCA0NzggNjMwSDQ1MUg0NDNRNDE3IDYzMCA0MTQgNjE4UTQxMyA2MTYgNDEzIDMzOVY2M1E0MjAgNTMgNDM5IDUwVDUyOCA0Nkg1NThWMEg1NDVMMzYxIDNRMTg2IDEgMTc3IDBIMTY0VjQ2SDE5NFEyNjQgNDYgMjgzIDQ5VDMwOSA2M1YzMzlWNTUwUTMwOSA2MjAgMzA0IDYyNVQyNzEgNjMwSDI0NEgyMjRRMTU0IDYzMCAxMTkgNjAxUTEwMSA1ODUgOTMgNTU0VDgxIDQ4NlQ3NiA0NDNWNDM3SDM2VjQ0M1oiPjwvcGF0aD4KPC9kZWZzPgo8ZyBzdHJva2U9ImN1cnJlbnRDb2xvciIgZmlsbD0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAiIHRyYW5zZm9ybT0ibWF0cml4KDEgMCAwIC0xIDAgMCkiIGFyaWEtaGlkZGVuPSJ0cnVlIj4KIDx1c2UgeGxpbms6aHJlZj0iI0UxLU1KTUFJTi01NCIgeD0iMCIgeT0iMCI+PC91c2U+CjwvZz4KPC9zdmc+'
        }
    ];

    function init(mathEditor, hasRichTextFocus, l, baseUrl) {
        var $toolbar = $("\n        <div class=\"rich-text-editor-tools\" data-js=\"tools\" style=\"display: none\">\n            <div class=\"rich-text-editor-tools-button-wrapper\">\n                <div class=\"rich-text-editor-toolbar-wrapper\">\n                    <button class=\"rich-text-editor-characters-expand-collapse\" data-js=\"expandCollapseCharacters\" style=\"z-index: 100\"></button>\n                </div>\n            </div>\n            <div class=\"rich-text-editor-tools-row\">\n                <div class=\"rich-text-editor-toolbar-wrapper\">\n                    <div class=\"rich-text-editor-toolbar-characters rich-text-editor-toolbar rich-text-editor-toolbar-button-list\" data-js=\"charactersList\"></div>\n                </div>\n            </div>\n            <div class=\"rich-text-editor-tools-row\">\n                <div class=\"rich-text-editor-toolbar-wrapper rich-text-editor-equation-wrapper\">\n                    <div class=\"rich-text-editor-toolbar-equation rich-text-editor-toolbar rich-text-editor-toolbar-button-list\" data-js=\"mathToolbar\"></div>\n                </div>\n            </div>\n            <div class=\"rich-text-editor-tools-button-wrapper\">\n                <div class=\"rich-text-editor-toolbar-wrapper\">\n                    <button class=\"rich-text-editor-new-equation rich-text-editor-button rich-text-editor-button-action\" data-js=\"newEquation\" data-command=\"Ctrl-E\" data-i18n=\"rich_text_editor.insert_equation\">\u03A3 " + l.insertEquation + "</button>\n                </div>\n            </div>\n        </div>\n        ")
            .on('mousedown', function (e) {
            e.preventDefault();
        })
            .on('mousedown', '[data-js="expandCollapseCharacters"]', function (e) {
            e.preventDefault();
            $toolbar.toggleClass('rich-text-editor-characters-expanded');
        });
        var $newEquation = $toolbar.find('[data-js="newEquation"]');
        var $mathToolbar = $toolbar.find('[data-js="mathToolbar"]');
        initSpecialCharacterToolbar($toolbar, mathEditor, hasRichTextFocus);
        initMathToolbar($mathToolbar, mathEditor, baseUrl);
        initNewEquation($newEquation, mathEditor, hasRichTextFocus);
        if ($.fn.i18n) {
            $toolbar.i18n();
        }
        else if ($.fn.localize) {
            $toolbar.localize();
        }
        return $toolbar;
    }
    var specialCharacterToButton = function (char) {
        return "<button class=\"rich-text-editor-button rich-text-editor-button-grid" + (char.popular ? ' rich-text-editor-characters-popular' : '') + "\" " + (char.latexCommand ? "data-command=\"" + char.latexCommand + "\"" : '') + " data-usewrite=\"" + !char.noWrite + "\">" + char.character + "</button>";
    };
    var popularInGroup = function (group) { return group.characters.filter(function (character) { return character.popular; }).length; };
    function initSpecialCharacterToolbar($toolbar, mathEditor, hasAnswerFocus) {
        var gridButtonWidthPx = 35;
        $toolbar
            .find('[data-js="charactersList"]')
            .append(specialCharacterGroups.map(function (group) {
            return "<div class=\"rich-text-editor-toolbar-characters-group\"\n                  style=\"width: " + popularInGroup(group) * gridButtonWidthPx + "px\">\n                  " + group.characters.map(specialCharacterToButton).join('') + "\n             </div>";
        }))
            .on('mousedown', 'button', function (e) {
            e.preventDefault();
            var character = e.currentTarget.innerText;
            var command = e.currentTarget.dataset.command;
            var useWrite = e.currentTarget.dataset.usewrite === 'true';
            if (hasAnswerFocus())
                window.document.execCommand('insertText', false, character);
            else
                mathEditor.insertMath(command || character, undefined, useWrite);
        });
    }
    function initMathToolbar($mathToolbar, mathEditor) {
        $mathToolbar
            .append(latexCommandsWithSvg
            .map(function (o) {
            return typeof o === 'string'
                ? o
                : "<button class=\"rich-text-editor-button rich-text-editor-button-grid\" data-command=\"" + o.action + "\" data-latexcommand=\"" + (o.label || '') + "\" data-usewrite=\"" + (o.useWrite || false) + "\">\n<img src=\"" + o.svg + "\"/>\n</button>";
        })
            .join(''))
            .on('mousedown', 'button', function (e) {
            e.preventDefault();
            var dataset = e.currentTarget.dataset;
            mathEditor.insertMath(dataset.command, dataset.latexcommand, dataset.usewrite === 'true');
        });
    }
    function initNewEquation($newEquation, mathEditor, hasAnswerFocus) {
        $newEquation.mousedown((function (e) {
            e.preventDefault();
            if (!hasAnswerFocus())
                return; // TODO: remove when button is only visible when textarea has focus
            mathEditor.insertNewEquation();
        }).bind(this));
    }

    var loadingImg = 'data:image/gif;base64,R0lGODlhEAAQAPQAAP///wAAAPDw8IqKiuDg4EZGRnp6egAAAFhYWCQkJKysrL6+vhQUFJycnAQEBDY2NmhoaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH+GkNyZWF0ZWQgd2l0aCBhamF4bG9hZC5pbmZvACH5BAAKAAAAIf8LTkVUU0NBUEUyLjADAQAAACwAAAAAEAAQAAAFdyAgAgIJIeWoAkRCCMdBkKtIHIngyMKsErPBYbADpkSCwhDmQCBethRB6Vj4kFCkQPG4IlWDgrNRIwnO4UKBXDufzQvDMaoSDBgFb886MiQadgNABAokfCwzBA8LCg0Egl8jAggGAA1kBIA1BAYzlyILczULC2UhACH5BAAKAAEALAAAAAAQABAAAAV2ICACAmlAZTmOREEIyUEQjLKKxPHADhEvqxlgcGgkGI1DYSVAIAWMx+lwSKkICJ0QsHi9RgKBwnVTiRQQgwF4I4UFDQQEwi6/3YSGWRRmjhEETAJfIgMFCnAKM0KDV4EEEAQLiF18TAYNXDaSe3x6mjidN1s3IQAh+QQACgACACwAAAAAEAAQAAAFeCAgAgLZDGU5jgRECEUiCI+yioSDwDJyLKsXoHFQxBSHAoAAFBhqtMJg8DgQBgfrEsJAEAg4YhZIEiwgKtHiMBgtpg3wbUZXGO7kOb1MUKRFMysCChAoggJCIg0GC2aNe4gqQldfL4l/Ag1AXySJgn5LcoE3QXI3IQAh+QQACgADACwAAAAAEAAQAAAFdiAgAgLZNGU5joQhCEjxIssqEo8bC9BRjy9Ag7GILQ4QEoE0gBAEBcOpcBA0DoxSK/e8LRIHn+i1cK0IyKdg0VAoljYIg+GgnRrwVS/8IAkICyosBIQpBAMoKy9dImxPhS+GKkFrkX+TigtLlIyKXUF+NjagNiEAIfkEAAoABAAsAAAAABAAEAAABWwgIAICaRhlOY4EIgjH8R7LKhKHGwsMvb4AAy3WODBIBBKCsYA9TjuhDNDKEVSERezQEL0WrhXucRUQGuik7bFlngzqVW9LMl9XWvLdjFaJtDFqZ1cEZUB0dUgvL3dgP4WJZn4jkomWNpSTIyEAIfkEAAoABQAsAAAAABAAEAAABX4gIAICuSxlOY6CIgiD8RrEKgqGOwxwUrMlAoSwIzAGpJpgoSDAGifDY5kopBYDlEpAQBwevxfBtRIUGi8xwWkDNBCIwmC9Vq0aiQQDQuK+VgQPDXV9hCJjBwcFYU5pLwwHXQcMKSmNLQcIAExlbH8JBwttaX0ABAcNbWVbKyEAIfkEAAoABgAsAAAAABAAEAAABXkgIAICSRBlOY7CIghN8zbEKsKoIjdFzZaEgUBHKChMJtRwcWpAWoWnifm6ESAMhO8lQK0EEAV3rFopIBCEcGwDKAqPh4HUrY4ICHH1dSoTFgcHUiZjBhAJB2AHDykpKAwHAwdzf19KkASIPl9cDgcnDkdtNwiMJCshACH5BAAKAAcALAAAAAAQABAAAAV3ICACAkkQZTmOAiosiyAoxCq+KPxCNVsSMRgBsiClWrLTSWFoIQZHl6pleBh6suxKMIhlvzbAwkBWfFWrBQTxNLq2RG2yhSUkDs2b63AYDAoJXAcFRwADeAkJDX0AQCsEfAQMDAIPBz0rCgcxky0JRWE1AmwpKyEAIfkEAAoACAAsAAAAABAAEAAABXkgIAICKZzkqJ4nQZxLqZKv4NqNLKK2/Q4Ek4lFXChsg5ypJjs1II3gEDUSRInEGYAw6B6zM4JhrDAtEosVkLUtHA7RHaHAGJQEjsODcEg0FBAFVgkQJQ1pAwcDDw8KcFtSInwJAowCCA6RIwqZAgkPNgVpWndjdyohACH5BAAKAAkALAAAAAAQABAAAAV5ICACAimc5KieLEuUKvm2xAKLqDCfC2GaO9eL0LABWTiBYmA06W6kHgvCqEJiAIJiu3gcvgUsscHUERm+kaCxyxa+zRPk0SgJEgfIvbAdIAQLCAYlCj4DBw0IBQsMCjIqBAcPAooCBg9pKgsJLwUFOhCZKyQDA3YqIQAh+QQACgAKACwAAAAAEAAQAAAFdSAgAgIpnOSonmxbqiThCrJKEHFbo8JxDDOZYFFb+A41E4H4OhkOipXwBElYITDAckFEOBgMQ3arkMkUBdxIUGZpEb7kaQBRlASPg0FQQHAbEEMGDSVEAA1QBhAED1E0NgwFAooCDWljaQIQCE5qMHcNhCkjIQAh+QQACgALACwAAAAAEAAQAAAFeSAgAgIpnOSoLgxxvqgKLEcCC65KEAByKK8cSpA4DAiHQ/DkKhGKh4ZCtCyZGo6F6iYYPAqFgYy02xkSaLEMV34tELyRYNEsCQyHlvWkGCzsPgMCEAY7Cg04Uk48LAsDhRA8MVQPEF0GAgqYYwSRlycNcWskCkApIyEAOwAAAAAAAAAAADxiciAvPgo8Yj5XYXJuaW5nPC9iPjogIG15c3FsX3F1ZXJ5KCkgWzxhIGhyZWY9J2Z1bmN0aW9uLm15c3FsLXF1ZXJ5Jz5mdW5jdGlvbi5teXNxbC1xdWVyeTwvYT5dOiBDYW4ndCBjb25uZWN0IHRvIGxvY2FsIE15U1FMIHNlcnZlciB0aHJvdWdoIHNvY2tldCAnL3Zhci9ydW4vbXlzcWxkL215c3FsZC5zb2NrJyAoMikgaW4gPGI+L2hvbWUvYWpheGxvYWQvd3d3L2xpYnJhaXJpZXMvY2xhc3MubXlzcWwucGhwPC9iPiBvbiBsaW5lIDxiPjY4PC9iPjxiciAvPgo8YnIgLz4KPGI+V2FybmluZzwvYj46ICBteXNxbF9xdWVyeSgpIFs8YSBocmVmPSdmdW5jdGlvbi5teXNxbC1xdWVyeSc+ZnVuY3Rpb24ubXlzcWwtcXVlcnk8L2E+XTogQSBsaW5rIHRvIHRoZSBzZXJ2ZXIgY291bGQgbm90IGJlIGVzdGFibGlzaGVkIGluIDxiPi9ob21lL2FqYXhsb2FkL3d3dy9saWJyYWlyaWVzL2NsYXNzLm15c3FsLnBocDwvYj4gb24gbGluZSA8Yj42ODwvYj48YnIgLz4KPGJyIC8+CjxiPldhcm5pbmc8L2I+OiAgbXlzcWxfcXVlcnkoKSBbPGEgaHJlZj0nZnVuY3Rpb24ubXlzcWwtcXVlcnknPmZ1bmN0aW9uLm15c3FsLXF1ZXJ5PC9hPl06IENhbid0IGNvbm5lY3QgdG8gbG9jYWwgTXlTUUwgc2VydmVyIHRocm91Z2ggc29ja2V0ICcvdmFyL3J1bi9teXNxbGQvbXlzcWxkLnNvY2snICgyKSBpbiA8Yj4vaG9tZS9hamF4bG9hZC93d3cvbGlicmFpcmllcy9jbGFzcy5teXNxbC5waHA8L2I+IG9uIGxpbmUgPGI+Njg8L2I+PGJyIC8+CjxiciAvPgo8Yj5XYXJuaW5nPC9iPjogIG15c3FsX3F1ZXJ5KCkgWzxhIGhyZWY9J2Z1bmN0aW9uLm15c3FsLXF1ZXJ5Jz5mdW5jdGlvbi5teXNxbC1xdWVyeTwvYT5dOiBBIGxpbmsgdG8gdGhlIHNlcnZlciBjb3VsZCBub3QgYmUgZXN0YWJsaXNoZWQgaW4gPGI+L2hvbWUvYWpheGxvYWQvd3d3L2xpYnJhaXJpZXMvY2xhc3MubXlzcWwucGhwPC9iPiBvbiBsaW5lIDxiPjY4PC9iPjxiciAvPgo8YnIgLz4KPGI+V2FybmluZzwvYj46ICBteXNxbF9xdWVyeSgpIFs8YSBocmVmPSdmdW5jdGlvbi5teXNxbC1xdWVyeSc+ZnVuY3Rpb24ubXlzcWwtcXVlcnk8L2E+XTogQ2FuJ3QgY29ubmVjdCB0byBsb2NhbCBNeVNRTCBzZXJ2ZXIgdGhyb3VnaCBzb2NrZXQgJy92YXIvcnVuL215c3FsZC9teXNxbGQuc29jaycgKDIpIGluIDxiPi9ob21lL2FqYXhsb2FkL3d3dy9saWJyYWlyaWVzL2NsYXNzLm15c3FsLnBocDwvYj4gb24gbGluZSA8Yj42ODwvYj48YnIgLz4KPGJyIC8+CjxiPldhcm5pbmc8L2I+OiAgbXlzcWxfcXVlcnkoKSBbPGEgaHJlZj0nZnVuY3Rpb24ubXlzcWwtcXVlcnknPmZ1bmN0aW9uLm15c3FsLXF1ZXJ5PC9hPl06IEEgbGluayB0byB0aGUgc2VydmVyIGNvdWxkIG5vdCBiZSBlc3RhYmxpc2hlZCBpbiA8Yj4vaG9tZS9hamF4bG9hZC93d3cvbGlicmFpcmllcy9jbGFzcy5teXNxbC5waHA8L2I+IG9uIGxpbmUgPGI+Njg8L2I+PGJyIC8+Cg==';

    var SCREENSHOT_LIMIT_ERROR = function () { return new Bacon.Error('Screenshot limit reached!'); };
    var fileTypes = ['image/png', 'image/jpeg'];
    function onPaste(e, saver, onValueChanged, limit) {
        var clipboardData = e.originalEvent.clipboardData;
        var file = clipboardData.items && clipboardData.items.length > 0 && clipboardData.items[0].getAsFile();
        if (file) {
            onPasteBlob(e, file, saver, $(e.currentTarget), onValueChanged, limit);
        }
        else {
            var clipboardDataAsHtml = clipboardData.getData('text/html');
            if (clipboardDataAsHtml)
                onPasteHtml(e, $(e.currentTarget), clipboardDataAsHtml, limit, saver, onValueChanged);
            else
                onLegacyPasteImage($(e.currentTarget), saver, limit, onValueChanged);
        }
    }
    function onPasteBlob(event, file, saver, $answer, onValueChanged, limit) {
        event.preventDefault();
        if (fileTypes.indexOf(file.type) >= 0) {
            if (existingScreenshotCount($answer) + 1 <= limit) {
                saver({ data: file, type: file.type, id: String(new Date().getTime()) }).then(function (screenshotUrl) {
                    var img = "<img src=\"" + screenshotUrl + "\"/>";
                    window.document.execCommand('insertHTML', false, img);
                });
            }
            else {
                onValueChanged(SCREENSHOT_LIMIT_ERROR());
            }
        }
    }
    function onPasteHtml(event, $answer, clipboardDataAsHtml, limit, saver, onValueChanged) {
        event.preventDefault();
        if (totalImageCount($answer, clipboardDataAsHtml) <= limit) {
            window.document.execCommand('insertHTML', false, sanitize(clipboardDataAsHtml));
            persistInlineImages($answer, saver, limit, onValueChanged);
        }
        else {
            onValueChanged(SCREENSHOT_LIMIT_ERROR());
        }
    }
    function onLegacyPasteImage($editor, saver, limit, onValueChanged) {
        persistInlineImages($editor, saver, limit, onValueChanged);
    }
    function checkForImageLimit($editor, imageData, limit) {
        return Bacon.once(existingScreenshotCount($editor) > limit ? new Bacon.Error() : imageData);
    }
    function persistInlineImages($editor, screenshotSaver, screenshotCountLimit, onValueChanged) {
        setTimeout(function () {
            return Bacon.combineAsArray(markAndGetInlineImages($editor).map(function (data) {
                return checkForImageLimit($editor, data, screenshotCountLimit)
                    .doError(function () { return onValueChanged(SCREENSHOT_LIMIT_ERROR()); })
                    .flatMapLatest(function () { return Bacon.fromPromise(screenshotSaver(data)); })
                    .doAction(function (screenShotUrl) { return data.$el.attr('src', screenShotUrl); })
                    .doError(function () { return data.$el.remove(); });
            })).onValue(function () { return $editor.trigger('input'); });
        }, 0);
    }
    function totalImageCount($answer, clipboardDataAsHtml) {
        return existingScreenshotCount($answer) + existingScreenshotCount($("<div>" + clipboardDataAsHtml + "</div>"));
    }
    function markAndGetInlineImages($editor) {
        var images = $editor
            .find('img[src^="data"]')
            .toArray()
            .map(function (el) {
            return Object.assign(decodeBase64Image(el.getAttribute('src')), {
                $el: $(el)
            });
        });
        images
            .filter(function (_a) {
            var type = _a.type;
            return fileTypes.indexOf(type) === -1 && type !== 'image/svg+xml';
        })
            .forEach(function (_a) {
            var $el = _a.$el;
            return $el.remove();
        });
        var pngImages = images.filter(function (_a) {
            var type = _a.type;
            return fileTypes.indexOf(type) >= 0;
        });
        pngImages.forEach(function (_a) {
            var $el = _a.$el;
            return $el.attr('src', loadingImg);
        });
        return pngImages;
    }
    function decodeBase64Image(dataString) {
        if (!dataString)
            return null;
        var matches = dataString.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
        if (matches.length !== 3) {
            return null;
        }
        return {
            type: matches[1],
            data: new Buffer(matches[2], 'base64')
        };
    }

    var MathQuill = window.MathQuill;
    if (!MathQuill)
        throw new Error('MathQuill is required but has not been loaded');
    var keyCodes = {
        ENTER: 13,
        ESC: 27
    };
    var MQ;
    function init$1($outerPlaceholder, focus, baseUrl, updateMathImg) {
        function defaultUpdateMathImg($img, latex) {
            $img.prop({
                src: baseUrl + '/math.svg?latex=' + encodeURIComponent(latex),
                alt: latex
            });
            $img.closest('[data-js="answer"]').trigger('input');
        }
        updateMathImg = updateMathImg || defaultUpdateMathImg;
        var updateMathImgTimeout;
        {
            MQ = MathQuill.getInterface(2);
        }
        var $mathEditorContainer = $("\n        <div class=\"math-editor\" data-js=\"mathEditor\">\n            <div class=\"math-editor-equation-field\" data-js=\"equationField\"></div>\n            <textarea rows=\"1\" class=\"math-editor-latex-field\" data-js=\"latexField\" placeholder=\"LaTe\u03A7\"></textarea>\n        </div>");
        $outerPlaceholder.append($mathEditorContainer);
        var $latexField = $mathEditorContainer.find('[data-js="latexField"]');
        var $equationField = $mathEditorContainer.find('[data-js="equationField"]');
        var mqEditTimeout;
        var visible = false;
        var focusChanged = null;
        //noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
        var mqInstance = MQ.MathField($equationField.get(0), {
            handlers: {
                edit: onMqEdit,
                enter: function () {
                    closeMathEditor(true);
                    setTimeout(function () { return insertNewEquation('<br>'); }, 2);
                }
            }
        });
        $equationField
            .on('input', '.mq-textarea textarea', onMqEdit)
            .on('focus blur', '.mq-textarea textarea', function (e) {
            focus.equationField = e.type !== 'blur' && e.type !== 'focusout';
            onFocusChanged();
        })
            .on('keydown', onClose)
            .on('paste', function (e) { return e.stopPropagation(); });
        $latexField
            .on('keypress', transformLatexKeydown)
            .on('input paste', onLatexUpdate)
            .on('focus blur', function (e) {
            focus.latexField = e.type !== 'blur';
            onFocusChanged();
        })
            .on('keydown', onClose)
            .on('paste', function (e) { return e.stopPropagation(); });
        function onClose(e) {
            if (isCtrlKey(e, keyCodes.ENTER) || isKey(e, keyCodes.ESC))
                closeMathEditor(true);
        }
        return {
            insertNewEquation: insertNewEquation,
            insertMath: insertMath,
            openMathEditor: openMathEditor,
            closeMathEditor: closeMathEditor
        };
        function onMqEdit(e) {
            e && e.originalEvent && e.originalEvent.stopPropagation();
            clearTimeout(mqEditTimeout);
            mqEditTimeout = setTimeout(function () {
                if (focus.latexField)
                    return;
                var latex = mqInstance.latex();
                $latexField.val(latex);
                updateMathImgWithDebounce($mathEditorContainer.prev(), latex);
                updateLatexFieldHeight();
            }, 0);
        }
        function transformLatexKeydown(e) {
            if (e.originalEvent.key === ',') {
                e.preventDefault();
                insertToTextAreaAtCursor($latexField.get(0), '{,}');
            }
            onLatexUpdate(e);
        }
        function onLatexUpdate(e) {
            e && e.originalEvent && e.originalEvent.stopPropagation();
            updateMathImgWithDebounce($mathEditorContainer.prev(), $latexField.val());
            setTimeout(function () { return mqInstance.latex($latexField.val()); }, 1);
            updateLatexFieldHeight();
        }
        function updateLatexFieldHeight() {
            $latexField.get(0).style.height = 'auto';
            $latexField.get(0).style.height = $latexField.get(0).scrollHeight + 'px';
        }
        function onFocusChanged() {
            clearTimeout(focusChanged);
            focusChanged = setTimeout(function () {
                $mathEditorContainer.trigger({ type: 'mathfocus', hasFocus: focus.latexField || focus.equationField });
                if (!focus.latexField && !focus.equationField)
                    closeMathEditor();
            }, 0);
        }
        function insertNewEquation(optionalMarkup) {
            if (optionalMarkup === void 0) { optionalMarkup = ''; }
            window.document.execCommand('insertHTML', false, optionalMarkup + '<img data-js="new" alt="" src="" style="display: none"/>');
            showMathEditor($('[data-js="new"]').removeAttr('data-js'));
        }
        function openMathEditor($img) {
            if (visible)
                closeMathEditor();
            setCursorAfter($img);
            showMathEditor($img);
        }
        function showMathEditor($img) {
            $img.hide();
            $img.after($mathEditorContainer);
            visible = true;
            toggleMathToolbar(true);
            setTimeout(function () { return mqInstance.focus(); }, 0);
            $latexField.val($img.prop('alt'));
            onLatexUpdate();
            scrollIntoView($mathEditorContainer);
        }
        function insertMath(symbol, alternativeSymbol, useWrite) {
            if (focus.latexField) {
                insertToTextAreaAtCursor($latexField.get(0), alternativeSymbol || symbol);
                onLatexUpdate();
            }
            else if (focus.equationField) {
                if (useWrite) {
                    mqInstance.write(symbol);
                }
                else {
                    mqInstance.typedText(symbol);
                }
                if (~symbol.indexOf('\\'))
                    mqInstance.keystroke('Spacebar');
                setTimeout(function () { return mqInstance.focus(); }, 0);
            }
        }
        function updateMathImgWithDebounce($img, latex) {
            clearTimeout(updateMathImgTimeout);
            updateMathImgTimeout = setTimeout(function () {
                updateMathImg($img, latex);
            }, 500);
        }
        function closeMathEditor(setFocusAfterClose) {
            if (setFocusAfterClose === void 0) { setFocusAfterClose = false; }
            var $currentEditor = $mathEditorContainer.closest('[data-js="answer"]');
            var $img = $mathEditorContainer.prev();
            if ($latexField.val().trim() === '') {
                $img.remove();
            }
            else {
                $img.show();
                updateMathImg($img, $latexField.val());
            }
            toggleMathToolbar(false);
            visible = false;
            focus.latexField = false;
            focus.equationField = false;
            $mathEditorContainer.trigger({ type: 'mathfocus', hasFocus: focus.latexField || focus.equationField });
            $outerPlaceholder.append($mathEditorContainer);
            if (setFocusAfterClose)
                $currentEditor.focus();
        }
        function toggleMathToolbar(isVisible) {
            $('body').toggleClass('math-editor-focus', isVisible);
        }
    }

    var FI = {
        editor: {
            mathEditor: 'Matikkaeditori',
            title: 'Kaavaeditorin kehitysversio',
            description: "\n<ul>\n<li>\u201CLis\u00E4\u00E4 kaava\u201D -napin alta l\u00F6yd\u00E4t yleisimpi\u00E4 matematiikassa, fysiikassa ja\nkemiassa k\u00E4ytett\u00E4vi\u00E4 merkint\u00F6j\u00E4. Lis\u00E4ksi erikoismerkkej\u00E4 voi k\u00E4ytt\u00E4\u00E4 kaavan kirjoittamiseen.</li>\n <li>Kaavoja voi rakentaa\nklikkaamalla valikon merkint\u00F6j\u00E4 ja/tai kirjoittamalla LaTeXia.</li>\n <li>Editorin vastauskentt\u00E4\u00E4n voi kirjoittaa teksti\u00E4 ja kaavoja sek\u00E4\nlis\u00E4t\u00E4 kuvia.</li></ul>",
            shortcutTitle: 'Pikanäppäinvinkkejä',
            shortcuts: "<table><tbody>\n<tr><th>Liit\u00E4 kuva leikep\u00F6yd\u00E4lt\u00E4</th><td>Ctrl-V</td></tr>\n<tr><th>Kirjoita kaava</th><td>Ctrl-E</td></tr>\n<tr><th colspan=\"2\">Kaavassa</th></tr>\n<tr><th>Jakoviiva</th><td>/</td></tr>\n<tr><th>Kertomerkki</th><td>*</td></tr>\n<tr><th>Eksponentti</th><td>^</td></tr>\n<tr><th>Sulje kaava</th><td>Esc</td></tr>\n<tr><th>Lis\u00E4\u00E4 kaava seuraavalle riville</th><td>Enter</td></tr>\n</tbody>\n</table>",
            formatting: 'Muotoilu',
            specialCharacters: 'Erikoismerkit',
            insertEquation: 'Lisää kaava',
            close: 'sulje',
            save: 'Tallenna',
            updated: 'Päivitetty',
            sendFeedback: 'Lähetä palautetta',
            langLink: '/sv',
            langLabel: 'På svenska',
            answerTitle: 'Vastaus',
            toggleInstructions: 'Näytä ohjeet'
        },
        annotating: {
            sendFeedback: 'Lähetä palautetta',
            updated: 'Päivitetty',
            mathEditor: 'Matikkaeditori',
            title: 'Arvostelu',
            backLink: '/',
            backLinkLabel: 'Palaa kaavaeditoriin',
            save: 'Tallenna merkinnät',
            langLink: '/sv/bedomning',
            langLabel: 'På svenska'
        }
    };

    var SV = {
        editor: {
            mathEditor: 'Matematikeditor',
            title: 'Formeleditorns utvecklingsversion',
            description: "\n<ul>\n <li>Under knappen \u201CL\u00E4gg till formel\u201D hittar du de vanligaste beteckningarna som anv\u00E4nds i matematik, fysik och kemi. Dessutom kan du anv\u00E4nda specialtecken f\u00F6r att skriva formler.</li>\n<li>Det g\u00E5r att konstruera formler genom att klicka p\u00E5 beteckningarna i menyerna och/eller genom att skriva LaTeX.</li>\n<li>Det g\u00E5r f\u00F6rutom att skriva text och formler, att ocks\u00E5 att l\u00E4gga till bilder i svarsf\u00E4ltet.</li></ul>",
            shortcutTitle: 'Tips på tangentkombinationer',
            shortcuts: "<table><tbody>\n<tr><th>L\u00E4gg till en bild fr\u00E5n urklippet</th><td>Ctrl-V</td></tr>\n<tr><th>Skriv en formel</th><td>Ctrl-E</td></tr>\n<tr><th colspan=\"2\">I formeln </th></tr>\n<tr><th>Br\u00E5kstreck</th><td>/</td></tr>\n<tr><th>Multiplikationstecken</th><td>*</td></tr>\n<tr><th>St\u00E4ng formeln</th><td>Esc</td></tr>\n</tbody>\n</table>",
            formatting: 'Formatering',
            specialCharacters: 'Specialtecken',
            insertEquation: 'Lägg till formel',
            close: 'stäng',
            save: 'Spara',
            updated: 'Uppdaterad',
            sendFeedback: 'Skicka feedback',
            langLink: '/',
            langLabel: 'Suomeksi',
            answerTitle: 'Svar',
            toggleInstructions: 'Visa intruktioner'
        },
        annotating: {
            sendFeedback: 'Skicka respons',
            updated: 'Uppdaterad',
            mathEditor: 'Matematikeditor',
            title: 'Bedömning',
            backLink: '/sv',
            backLinkLabel: 'Matematikeditor',
            save: 'Spara anteckningar',
            langLink: '/tarkistus',
            langLabel: 'Suomeksi'
        }
    };

    var locales = { FI: FI, SV: SV };
    var l = locales[window.locale || 'FI'].editor;
    var keyCodes$1 = {
        E: 69
    };
    var $outerPlaceholder = $('<div class="rich-text-editor-hidden" style="display: none;" data-js="outerPlaceholder">');
    var focus = {
        richText: false,
        latexField: false,
        equationField: false
    };
    var $currentEditor;
    var firstCall = true;
    var math;
    var $toolbar;
    var makeRichText = function (answer, options, onValueChanged) {
        if (onValueChanged === void 0) { onValueChanged = function () { }; }
        var saver = options.screenshot.saver;
        var limit = options.screenshot.limit;
        var baseUrl = options.baseUrl || '';
        if (firstCall) {
            math = init$1($outerPlaceholder, focus, baseUrl, options.updateMathImg);
            $toolbar = init(math, function () { return focus.richText; }, l, baseUrl);
            $('body').append($outerPlaceholder, $toolbar);
            firstCall = false;
        }
        onValueChanged(sanitizeContent(answer));
        var pasteInProgress = false;
        $(answer)
            .attr({
            contenteditable: true,
            spellcheck: false,
            'data-js': 'answer'
        })
            .addClass('rich-text-editor')
            .on('click', equationImageSelector, function (e) {
            if (e.which === 1) {
                onRichTextEditorFocus($(e.target).closest('[data-js="answer"]'));
                math.openMathEditor($(e.target));
            }
        })
            .on('keyup', function (e) {
            if (isCtrlKey(e, keyCodes$1.E) && !$(e.target).hasClass('math-editor-latex-field')) {
                math.insertNewEquation();
            }
        })
            .on('mathfocus', function (e) {
            $(e.currentTarget).toggleClass('rich-text-focused', e.hasFocus);
            if (richTextAndMathBlur())
                onRichTextEditorBlur($currentEditor);
        })
            .on('focus blur', function (e) {
            if (e.type === 'focus')
                math.closeMathEditor();
            onRichTextEditorFocusChanged(e);
        })
            .on('input', function (e) {
            if (!pasteInProgress)
                onValueChanged(sanitizeContent(e.currentTarget));
        })
            .on('drop', function (e) {
            setTimeout(function () {
                $(e.target).html(sanitize(e.target.innerHTML));
            }, 0);
        })
            .on('paste', function (e) {
            pasteInProgress = true;
            setTimeout(function () { return (pasteInProgress = false); }, 0);
            onPaste(e, saver, onValueChanged, limit);
        });
        setTimeout(function () { return document.execCommand('enableObjectResizing', false, false); }, 0);
    };
    function toggleRichTextToolbar(isVisible, $editor) {
        $('body').toggleClass('rich-text-editor-focus', isVisible);
        $editor.toggleClass('rich-text-focused', isVisible);
    }
    function onRichTextEditorFocus($element) {
        $currentEditor = $element;
        toggleRichTextToolbar(true, $currentEditor);
    }
    function onRichTextEditorBlur($element) {
        toggleRichTextToolbar(false, $element);
        focus.richText = false;
    }
    var richTextEditorBlurTimeout;
    function onRichTextEditorFocusChanged(e) {
        focus.richText = e.type === 'focus';
        $(e.currentTarget).toggleClass('rich-text-focused', focus.richText);
        clearTimeout(richTextEditorBlurTimeout);
        richTextEditorBlurTimeout = setTimeout(function () {
            if (richTextAndMathBlur())
                onRichTextEditorBlur($(e.target));
            else
                onRichTextEditorFocus($(e.target));
        }, 0);
    }
    function richTextAndMathBlur() {
        return !focus.richText && !focus.latexField && !focus.equationField;
    }

    exports.makeRichText = makeRichText;

    Object.defineProperty(exports, '__esModule', { value: true });

});
