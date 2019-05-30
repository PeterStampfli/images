/**
 * a button to input text,
 * 
 * @constructor TextButton 
 * @param {String} idName name (id) of an html (text) input element, attribute type will be set to text
 */

/* jshint esversion:6 */

function TextButton(idName) {
    "use strict";
    this.element = document.getElementById(idName);
    this.element.setAttribute("type", "text");
    this.hover = false;
    this.pressed = false;

    this.colorStyleDefaults();
    this.updateStyle();

    /**
     * action upon change, strategy pattern
     * @method NumberButton#onclick
     * @param {integer} value
     */
    this.onChange = function(value) {};

    var button = this;

    this.element.onchange = function() {
        button.onChange(button.getValue());
    };

    // onfocus /onblur corresponds to pressed
    this.element.onfocus = function() {
        button.pressed = true;
        button.updateStyle();
    };

    this.element.onblur = function() {
        button.pressed = false;
        button.updateStyle();
    };

    // hovering
    this.element.onmouseenter = function() {
        button.hover = true;
        button.updateStyle();
    };

    this.element.onmouseleave = function() {
        button.hover = false;
        button.updateStyle();
    };
}



(function() {
    "use strict";

    /**
     * update the color style of the element depending on whether its pressed or hovered
     * always call if states change, use for other buttons too
     * @method NumberButton#updateStyle
     */
    TextButton.prototype.updateStyle = Button.prototype.updateStyle;

    /**
     * setup the color styles defaults, use for other buttons too
     * @method NumberButton#colorStyleDefaults
     */
    TextButton.prototype.colorStyleDefaults = Button.prototype.colorStyleDefaults;

    /**
     * get the cursor position
     * @method TextButton#getCursor
     * @return {integer} position - 0-indexed
     */
    TextButton.prototype.getCursor = function() {
        return this.element.selectionEnd;
    };

    /**
     * read the value of the text input
     * @method TextButton#getValue
     * @returns {String}  the button text
     */
    TextButton.prototype.getValue = function() {
        return this.element.value;
    };

    /**
     * read the length of the text input
     * @method TextButton#getLength
     * @returns {integer}  the button text
     */
    TextButton.prototype.getLength = function() {
        return this.element.value.length;
    };

    /**
     * set the cursor position, keeping it in limits, set focus
     * @method TextButton#setCursor
     * @param {integer} position - 0-indexed
     */
    TextButton.prototype.setCursor = function(position) {
        position = Fast.clamp(0, position, this.getLength());
        this.element.focus();
        this.element.setSelectionRange(position, position);
    };

    /**
     * set the value of the text input, set cursor to end, set focus
     * @method TextButton#setValue
     * @param {String} text
     */
    TextButton.prototype.setValue = function(text) {
        this.element.value = text;
        this.setCursor(text.length);
    };

    /**
     * add a text to the text of the button at cursor position, 
     *  new cursor position will be at end of inserted text
     * @method TextButton#add
     * @param {String} addText
     */
    TextButton.prototype.add = function(addText) {
        const text = this.getValue();
        const selectionStart = this.element.selectionStart;
        const before = text.slice(0, selectionStart);
        const selectionEnd = this.element.selectionEnd;
        const after = text.slice(selectionEnd);
        this.setValue(before + addText + after);
        this.setCursor(selectionStart + addText.length);
    };



    /**
     * create a button to move cursor one position to the left
     * selection collapses, end of selection counts
     * @method TextButton#stepLeft
     * @param {String} parentId - button added at end of this element
     * @param {String} text
     */
    TextButton.prototype.createStepLeftButton = function(parentId, text) {
        const buttonId = DOM.createButton(parentId, text);
        DOM.style("#" + buttonId, "borderRadius", 1000 + px);
        const textButton = this;
        Button.createAction(buttonId, function() {
            textButton.setCursor(textButton.getCursor() - 1);
        });
    };


    /**
     * create a button to move cursor one position to the right
     * selection collapses, end of selection counts
     * @method TextButton#stepLeft
     * @param {String} parentId - button added at end of this element
     * @param {String} text
     */
    TextButton.prototype.createStepRightButton = function(parentId, text) {
        const buttonId = DOM.createButton(parentId, text);
        DOM.style("#" + buttonId, "borderRadius", 1000 + px);
        const textButton = this;
        Button.createAction(buttonId, function() {
            textButton.setCursor(textButton.getCursor() + 1);
        });
    };


    /**
     * create a button to add text
     * @method TextButton#createAddButton
     * @param {String} parentId - button added at end of this element
     * @param {String} text
     */
    TextButton.prototype.createAddButton = function(parentId, text) {
        const buttonId = DOM.createButton(parentId, text);
        DOM.style("#" + buttonId, "borderRadius", 1000 + px);
        const textButton = this;
        Button.createAction(buttonId, function() {
            textButton.add(text);
        });
    };

}());
