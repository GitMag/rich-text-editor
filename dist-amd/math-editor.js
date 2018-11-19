define(['exports', 'jquery', 'sanitize-html'], function (exports, $, sanitizeHtml) { 'use strict';

    $ = $ && $.hasOwnProperty('default') ? $['default'] : $;
    sanitizeHtml = sanitizeHtml && sanitizeHtml.hasOwnProperty('default') ? sanitizeHtml['default'] : sanitizeHtml;

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
    function setCursorAfter($img) {
        var range = document.createRange();
        var img = $img.get(0);
        range.setStartAfter(img);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
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

    var MathQuill = window.MathQuill;
    if (!MathQuill)
        throw new Error('MathQuill is required but has not been loaded');
    var keyCodes = {
        ENTER: 13,
        ESC: 27
    };
    var MQ;
    function init($outerPlaceholder, focus, baseUrl, updateMathImg) {
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

    exports.init = init;

    Object.defineProperty(exports, '__esModule', { value: true });

});
