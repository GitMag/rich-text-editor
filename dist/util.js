import $ from 'jquery';
import sanitizeHtml from 'sanitize-html';
import * as sanitizeOpts from './sanitizeOpts';
export const equationImageSelector = 'img[src^="/math.svg"], img[src^="data:image/svg+xml"]';
const screenshotImageSelector = 'img[src^="/screenshot/"], img[src^="data:image/png"]';
function convertLinksToRelative(html) {
    return html.replace(new RegExp(document.location.origin, 'g'), '');
}
export function sanitize(html) {
    return sanitizeHtml(convertLinksToRelative(html), sanitizeOpts);
}
export function insertToTextAreaAtCursor(field, value) {
    const startPos = field.selectionStart;
    const endPos = field.selectionEnd;
    let oldValue = field.value;
    field.value = oldValue.substring(0, startPos) + value + oldValue.substring(endPos, oldValue.length);
    field.selectionStart = field.selectionEnd = startPos + value.length;
}
export function isKey(e, key) {
    return preventIfTrue(e, !e.altKey && !e.shiftKey && !e.ctrlKey && keyOrKeyCode(e, key));
}
export function isCtrlKey(e, key) {
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
export function sanitizeContent(answerElement) {
    const $answerElement = $(answerElement);
    const $mathEditor = $answerElement.find('[data-js="mathEditor"]');
    $mathEditor.hide();
    const text = $answerElement.get(0).innerText;
    $mathEditor.show();
    const html = sanitize($answerElement.html());
    const answerConsideredEmpty = text.trim().length +
        $answerElement.find(equationImageSelector).length +
        $answerElement.find(screenshotImageSelector).length ===
        0;
    return {
        answerHTML: answerConsideredEmpty ? '' : html,
        answerText: text,
        imageCount: existingScreenshotCount($(`<div>${html}</div>`))
    };
}
export function setCursorAfter($img) {
    const range = document.createRange();
    const img = $img.get(0);
    range.setStartAfter(img);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}
export function existingScreenshotCount($editor) {
    const imageCount = $editor.find('img').length;
    const emptyImageCount = $editor.find('img[src=""]').length;
    const equationCount = $editor.find(equationImageSelector).length;
    return imageCount - equationCount - emptyImageCount;
}
export function scrollIntoView($element) {
    const $window = $(window);
    const windowHeight = $window.height() - 40;
    const scroll = windowHeight + $window.scrollTop();
    const pos = $element.offset().top + $element.height();
    if (scroll < pos) {
        $window.scrollTop(pos - windowHeight);
    }
}
//# sourceMappingURL=util.js.map