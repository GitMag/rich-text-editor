const util = require('./util')
const sanitizeHtml = require('sanitize-html')
const sanitizeOpts = require('./sanitizeOpts')
const toolbars = require('./toolbars')
const MQ = MathQuill.getInterface(2)
const locales = {
    FI: require('./FI'),
    SV: require('./SV')
}
const l = locales[window.locale || 'FI'].editor
const keyCodes = {
    ENTER: 13,
    ESC: 27
}

const $outerPlaceholder = $(`<div class="math-editor-hidden" data-js="outerPlaceholder">`)

function moveElementAfter($element, $after) {
    $after.after($element)
}

function hideElementInDOM($element) {
    $outerPlaceholder.append($element)
}

// TODO: replace with data attributes?
let answerFocus = true
let latexEditorFocus = false
let equationEditorFocus = false
let mathEditorVisible = false
let $currentEditor

$('body').append($outerPlaceholder)

const mathEditor = initMathEditor()
const {$toolbar, toggleMathToolbar} = toolbars.init(mathEditor, () => answerFocus, l)

hideElementInDOM($toolbar)

function initMathEditor() {
    const $mathEditorContainer = $(`
        <div class="math-editor" data-js="mathEditor">
            <div class="math-editor-close" title="Ctrl-Enter">${l.close}</div>
            <div class="math-editor-boxes">
                <div class="math-editor-equation-editor" data-js="equationEditor"></div>
                <textarea class="math-editor-latex-editor" data-js="latexEditor" placeholder="LaTex"></textarea>
            </div>
        </div>`)

    hideElementInDOM($mathEditorContainer)

    const $latexEditor = $mathEditorContainer.find('[data-js="latexEditor"]')
    const $equationEditor = $mathEditorContainer.find('[data-js="equationEditor"]')
    const mqInstance = MQ.MathField($equationEditor.get(0), {
        handlers: {
            edit: () => {
                if (latexEditorFocus)
                    return
                const latex = mqInstance.latex()
                $latexEditor.val(latex)
                updateMathImg($mathEditorContainer.prev(), latex)
            },
            enter: field => {
                // TODO: do not close editor / o not create a new equation if there is no text?
                mathEditor.closeMathEditor(true)
                setTimeout(() => insertNewEquation('<div></div>'), 2)
            }
        }
    })

    $equationEditor
        .on('focus mousedown', e => equationEditorFocus = true)
        .on('focus blur', '.mq-textarea textarea', e => {
            equationEditorFocus = e.type !== 'blur'
            onFocusChanged()
        })

    function onLatexUpdate() {
        updateMathImg($mathEditorContainer.prev(), $latexEditor.val())
        setTimeout(() => mqInstance.latex($latexEditor.val()), 1)
    }

    $latexEditor
        .keyup(onLatexUpdate)
        .on('focus blur', e => {
            latexEditorFocus = e.type !== 'blur'
            onFocusChanged()
        })

    $mathEditorContainer.find('.close').mousedown(e => {
        e.preventDefault()
        closeMathEditor(true)
    })

    let focusChanged = null

    function onFocusChanged() {
        clearTimeout(focusChanged)
        focusChanged = setTimeout(() => {
            if (!latexEditorFocus && !equationEditorFocus) closeMathEditor()
            if (!answerFocus && !mathEditorVisible && !latexEditorFocus && !equationEditorFocus) closeEditor()
        }, 0)
    }

    function insertNewEquation(optionalMarkup) {
        window.document.execCommand('insertHTML', false, (optionalMarkup ? optionalMarkup : '') + '<img data-js="new" style="display: none"/>')
        const $addedEquationImage = $('[data-js="new"]')
        $addedEquationImage
            .removeAttr('data-js')

        moveElementAfter($mathEditorContainer, $addedEquationImage)

        mqInstance.latex('')
        mathEditorVisible = true
        toggleMathToolbar(true)
        setTimeout(() => mqInstance.focus(), 0)
    }

    function insertMath(symbol, alternativeSymbol, useWrite) {
        if (latexEditorFocus) {
            util.insertToTextAreaAtCursor($latexEditor.get(0), alternativeSymbol || symbol)
            onLatexUpdate()
        } else if (equationEditorFocus) {
            if (useWrite) {
                mqInstance.write(symbol)
            } else {
                mqInstance.typedText(symbol)
            }

            if (symbol.startsWith('\\')) mqInstance.keystroke('Tab')
            setTimeout(() => mqInstance.focus(), 0)
        }
    }

    function updateMathImg($img, latex) {
        $img
            .prop('src', '/math.svg?latex=' + encodeURIComponent(latex))
            .prop('alt', latex)
    }

    function closeMathEditor(setFocusAfterClose = false) {
        // TODO: remove event bindings
        const $currentEditor = $mathEditorContainer.closest('[data-js="answer"]')
        const $img = $mathEditorContainer.prev()
        if ($latexEditor.val().trim() === '') {
            $img.remove()
        } else {
            $img.show()
            updateMathImg($img, $latexEditor.val())
        }

        toggleMathToolbar(false)
        hideElementInDOM($mathEditorContainer)
        mathEditorVisible = false
        latexEditorFocus = false
        equationEditorFocus = false
        if (setFocusAfterClose) $currentEditor.focus()
    }

    function openMathEditor($img) {
        if (mathEditorVisible) closeMathEditor()
        $img.hide()
        moveElementAfter($mathEditorContainer, $img)
        const latex = $img.prop('alt')
        $latexEditor.val(latex)
        onLatexUpdate()
        mathEditorVisible = true
        toggleMathToolbar(true)
        setTimeout(() => mqInstance.focus(), 0)
    }

    return {
        insertNewEquation,
        insertMath,
        closeMathEditor,
        openMathEditor,
        onFocusChanged
    }
}

function openEditor($element) {
    $currentEditor = $element
    $element.before($toolbar)
    $toolbar.show()
}

function closeEditor() {
    // TODO: remove event bindings
    hideElementInDOM($toolbar)
    mathEditor.closeMathEditor()
    // $editor.off()

    answerFocus = false
    mathEditorVisible = false
    latexEditorFocus = false
}

let blurred

function onEditorFocusChanged(e) {
    answerFocus = e.type === 'focus'

    clearTimeout(blurred)
    blurred = setTimeout(() => {
        if (!answerFocus && !mathEditorVisible && !latexEditorFocus && !equationEditorFocus) closeEditor()
        else if (answerFocus && mathEditorVisible) mathEditor.closeMathEditor()
        else openEditor($(e.target))
    }, 0)
}

function isMathEditorVisible() {
    return mathEditorVisible
}

const markAndGetInlineImages = $editor => $editor.find('img[src^="data"]')
    .each((i, el) => el.setAttribute('id', new Date().getTime() + '-' + i))
    .map((i, el) => Object.assign(decodeBase64Image(el.getAttribute('src')), {id: el.getAttribute('id')}))
    .toArray()
    .filter(({type}) => type === 'image/png')

const persistInlineImages = ($editor, screenshotSaver) => {
    return Bacon.combineAsArray(
        markAndGetInlineImages($editor)
            .map(data => Bacon.fromPromise(
                screenshotSaver(data)
                    .then(screenshotUrl => $editor.find('#' + data.id).attr('src', screenshotUrl).removeAttr('id')))
            )
        )
        .onValue(() => $editor.trigger('input'))
}

function decodeBase64Image(dataString) {
    if (!dataString)
        return null
    const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
    if (matches.length !== 3) {
        return null
    }
    return {
        type: matches[1],
        data: new Buffer(matches[2], 'base64')
    }
}

const makeRichText = (element, options, onValueChanged = () => { }) => {
    const {
        screenshot: {
            saver
        }
    } = options
    const $answer = $(element)
    $answer
        .attr('contenteditable', 'true')
        .attr('spellcheck', 'false')
        .attr('data-js', 'answer')
        .addClass('math-editor-answer')
        .on('keydown', e => {
            if (isCtrlKey(e, keyCodes.ENTER) || isKey(e, keyCodes.ESC)) mathEditor.closeMathEditor(true)
        })
        .on('mousedown', 'img[src^="/math.svg"]', e => mathEditor.openMathEditor($(e.target))) // TODO: open editor if clicked on equation in another editor
        .on('keypress', e => {
            if (isCtrlKey(e, 'l') || isCtrlKey(e, 'i')) mathEditor.insertNewEquation()
        })
        .on('focus blur', e => {
            if (isMathEditorVisible() && e.type === 'focus') mathEditor.closeMathEditor()
            onEditorFocusChanged(e)
        })
        .on('keyup input', e => onValueChanged(sanitizeContent(e.currentTarget)))
        .on('paste', e => {
            if (e.target.tagName === 'TEXTAREA')
                return
            const clipboardData = e.originalEvent.clipboardData
            const file = clipboardData.items && clipboardData.items[0].getAsFile()
            if (file) {
                e.preventDefault()
                if(file.type !== 'image/png')
                    return
                saver(file).then(screenshotUrl => {
                    const img = `<img src="${screenshotUrl}"/>`
                    window.document.execCommand('insertHTML', false, img)
                })
            } else {
                const clipboardDataAsHtml = clipboardData.getData('text/html')
                if (clipboardDataAsHtml) {
                    e.preventDefault()
                    window.document.execCommand('insertHTML', false, sanitizeHtml(clipboardDataAsHtml, sanitizeOpts))
                    setTimeout(()=> persistInlineImages($currentEditor, saver), 0)
                } else {
                    setTimeout(()=> persistInlineImages($currentEditor, saver), 0)
                }
            }
        })
}

function sanitizeContent(answerElement) {
    const $answerElement = $(answerElement)
    const $mathEditor = $answerElement.find('[data-js="mathEditor"]')
    $mathEditor.hide()
    const text = $answerElement.text()
    $mathEditor.show()

    const html = sanitizeHtml($answerElement.html(), sanitizeOpts)

    return { answerHTML: html, answerText: text }
}

function isKey(e, key) { return preventIfTrue(e, !e.altKey && !e.shiftKey && !e.ctrlKey  && keyOrKeyCode(e, key))}

function isCtrlKey(e, key) { return preventIfTrue(e, !e.altKey && !e.shiftKey && e.ctrlKey && keyOrKeyCode(e, key))}

function keyOrKeyCode(e, val) { return typeof val === 'string' ? e.key === val : e.keyCode === val }
function preventIfTrue(e, val) {
    if(val) e.preventDefault()
    return val
}
module.exports = {
    makeRichText
}
