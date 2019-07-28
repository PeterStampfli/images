/**
 * a special input for text text with limited set of characters,
 * 
 * @constructor SpecialInput 
 * @param {String} idName - name (id) of a span or div element that will contain the input
 */

/* jshint esversion:6 */


function SpecialInput(idName) {
    "use strict";
    this.id = idName;
    this.element = document.getElementById(idName);
    // styling the containing element to fit the usual inputs
    DOM.style("#" + idName, "borderStyle", "solid", "borderTopColor", "#777777", "borderLeftColor", "#777777", "borderBottomColor", "#dddddd", "borderRightColor", "#dddddd", "overflow", "auto");
    DOM.style("#" + idName, "cursor", "text");
    //this.element.style.cursor = "text";
    // loading and applying styles
    this.colorStyleDefaults();
    this.updateStyle();
    // status
    this.hover = false;
    this.focus = false;
    this.keepFocus = false;
    // writing text with cursor position
    this.text = "";
    this.cursorPosition = 0;
    // parsing text
    this.parsePosition = 0;
    // each character in its own span element (detect click position)
    this.charSpans = [];
    this.updateText();

    var specialInput = this;

    /**
     * action upon some text input changes (parsing), including change of cursor position, focus
     * overwrite this dummy
     * @method SpecialInput#onTextChange
     */
    this.onTextChange = function() {};

    /**
     * action upon "enter" command, strategy pattern
     * overwrite this dummy
     * @method SpecialInput#onEnter
     */
    this.onEnter = function() {};

    // clicking on the associated span element updates that this specialInput has focus
    this.element.onclick = function() {
        specialInput.setFocus(true);
    };

    // hovering: the mouse lies on the special input element
    this.element.onmouseenter = function() {
        specialInput.hover = true;
        specialInput.updateStyle();
    };

    this.element.onmouseleave = function() {
        specialInput.hover = false;
        specialInput.updateStyle();
    };

    // loosing focus for clicking elsewhere
    // if we click somewhere else than the specialInput element then it looses focus
    // except if we click on a related button
    // the related button acts before this event listener and sets specialInput.keepFocus=true
    const body = document.getElementsByTagName("body")[0];
    body.addEventListener("click", function() {
        if (!specialInput.hover && !specialInput.keepFocus) {
            specialInput.setFocus(false);
        }
        specialInput.keepFocus = false;
    });
}

(function() {
    "use strict";

    /**
     * update the color style of the element depending on whether its pressed or hovered
     * always call if states change, use for other buttons too
     * @method SpecialInput#updateStyle
     */
    SpecialInput.prototype.updateStyle = function() {
        if (this.focus) {
            if (this.hover) {
                this.element.style.color = this.colorDown;
                this.element.style.backgroundColor = this.backgroundColorDown;
            } else {
                this.element.style.color = this.colorDown;
                this.element.style.backgroundColor = this.backgroundColorDown;
            }
        } else {
            if (this.hover) {
                this.element.style.color = this.colorUpHover;
                this.element.style.backgroundColor = this.backgroundColorUpHover;
            } else {
                this.element.style.color = this.colorUp;
                this.element.style.backgroundColor = this.backgroundColorUp;
            }
        }
    };

    /**
     * setup the color styles defaults, 
     * most simple "default" case: use same as for other buttons too
     * @method SpecialInput#colorStyleDefaults
     */
    SpecialInput.prototype.colorStyleDefaults = Button.prototype.colorStyleDefaults;

    /**
     * set the width of the input element
     * important for rescaling text size
     * @method SpecialInput#setWidth
     * @param {integer} width
     */
    SpecialInput.prototype.setWidth = function(width) {
        DOM.style("#" + this.id, "width", width + px);
    };

    // set the cursor of given special input and position as clicked on display
    //  this is only because of GRUNT LINT checking

    function setCursorFromPosition(specialInput, position) {
        const f = function() {
            if (specialInput.cursorPosition < position) {
                specialInput.setCursor(position - 1); // cursor is at left, compensate for span that shows the cursor
            } else {
                specialInput.setCursor(position);
            }
        };
        return f;
    }

    /**
     * write a text in the charSpans, 
     * with an extra m-space and a hidden X at end
     * (that's to be able to set cursor at end, and to prevent span(?) from collapsing
     * @method SpecialInput#write
     * @param {String} text
     */

    SpecialInput.prototype.write = function(text) {
        // create missing spans, with a onClick function that sets the cursor position
        // relative to index to text string
        for (let i = this.charSpans.length; i < text.length + 2; i++) {
            const newSpan = DOM.create("span", DOM.createId(), "#" + this.id);
            const specialInput = this;
            newSpan.onclick = setCursorFromPosition(specialInput, i);
            this.charSpans.push(newSpan);
        }
        //write message to spans and make visible
        for (let i = 0; i < text.length; i++) {
            const theSpan = this.charSpans[i];
            theSpan.innerHTML = text.charAt(i);
            theSpan.style.display = "inline";
            theSpan.style.visibility = "visible";
        }
        // a large space at end of text
        let theSpan = this.charSpans[text.length];
        theSpan.innerHTML = "&nbsp;";
        theSpan.style.display = "inline";
        theSpan.style.visibility = "visible";
        // a hidden X to prevent span from collapsing
        theSpan = this.charSpans[text.length + 1];
        theSpan.innerHTML = "X";
        theSpan.style.display = "inline";
        theSpan.style.visibility = "hidden";
        // clear empty spans, hide
        for (let i = text.length + 2; i < this.charSpans.length; i++) {
            const theSpan = this.charSpans[i];
            theSpan.innerHTML = "";
            theSpan.style.display = "none";
        }
    };

    /**
     * update the text display
     *  if it has focus, then insert cursor as underscore
     * @method SpecialInput.updateText
     */
    SpecialInput.prototype.updateText = function() {
        var text;
        if (this.focus) { // with focus show "cursor"
            text = this.text.slice(0, this.cursorPosition);
            text += "_";
            text += this.text.slice(this.cursorPosition);
        } else {
            text = this.text;
        }
        this.write(text);
    };

    /**
     * set that this input is in focus or not and update everything
     * @method SpecialInput#setFocus
     * @param {boolean} focus - true if element has "focus" (including related buttons)
     */
    SpecialInput.prototype.setFocus = function(focus) {
        this.focus = focus;
        this.updateStyle();
        this.updateText();
        this.colorBlack();
        this.onTextChange();
    };

    /**
     * set the cursor, make that it has focus
     * @method SpecialInput#setFocus
     * @param {integer} position
     */
    SpecialInput.prototype.setCursor = function(position) {
        position = Fast.clamp(0, position, this.text.length);
        this.cursorPosition = position;
    };

    /**
     * set (paste) the text, put cursor at end
     * does not make focus, because from somewhere else it is set
     * @method SpecialInput#setText
     * @param {String} text
     */
    SpecialInput.prototype.setText = function(text) {
        this.text = text;
        this.cursorPosition = text.length;
    };

    /**
     * add a text at cursor position, 
     *  new cursor position will be at end of inserted text
     * @method SpecialInput#add
     * @param {String} addText
     */
    SpecialInput.prototype.add = function(addText) {
        let text = this.text.slice(0, this.cursorPosition);
        text += addText;
        const newCursorPosition = text.length; // new final cursor position
        text += this.text.slice(this.cursorPosition); // add the rest of the text after initial cursor position
        this.text = text;
        this.cursorPosition = newCursorPosition;
        this.setFocus(true);
    };

    /**
     * create a button and keyboard commend to move cursor one position to the left
     * @method SpecialInput#stepLeft
     * @param {String} parentId - button added at end of this element
     * @param {String} text
     * @return Button
     */
    SpecialInput.prototype.createStepLeftButton = function(parentId, text) {
        const buttonId = DOM.createButton(parentId, text);
        DOM.style("#" + buttonId, "borderRadius", 1000 + px);
        const specialInput = this;
        const button = Button.createAction(buttonId, function() {
            specialInput.setCursor(specialInput.cursorPosition - 1);
            specialInput.setFocus(true);
            specialInput.keepFocus = true;
        });
        KeyboardEvents.addFunction(function(event) {
            if (specialInput.focus && button.active) {
                specialInput.setCursor(specialInput.cursorPosition - 1);
                specialInput.setFocus(true);
            }
        }, "ArrowLeft");
        return button;
    };

    /**
     * create a button and keyboard commend to move cursor one position to the right
     * @method SpecialInput#createStepRightButton
     * @param {String} parentId - button added at end of this element
     * @param {String} text
     * @return Button
     */
    SpecialInput.prototype.createStepRightButton = function(parentId, text) {
        const buttonId = DOM.createButton(parentId, text);
        DOM.style("#" + buttonId, "borderRadius", 1000 + px);
        const specialInput = this;
        const button = Button.createAction(buttonId, function() {
            specialInput.setCursor(specialInput.cursorPosition + 1);
            specialInput.setFocus(true);
            specialInput.keepFocus = true;
        });
        KeyboardEvents.addFunction(function(event) {
            if (specialInput.focus && button.active) {
                specialInput.setCursor(specialInput.cursorPosition + 1);
                specialInput.setFocus(true);
            }
        }, "ArrowRight");
        return button;
    };

    /**
     * create a button to add/insert text
     * make shure that special input gets focus and stays in focus
     * @method SpecialInput#createAddButton
     * @param {String} parentId - button added at end of this element
     * @param {String} text
     * @return Button
     */
    SpecialInput.prototype.createAddButton = function(parentId, text) {
        const buttonId = DOM.createButton(parentId, text);
        DOM.style("#" + buttonId, "borderRadius", 1000 + px);
        const specialInput = this;
        const button = Button.createAction(buttonId, function() {
            specialInput.add(text);
            specialInput.setFocus(true);
            specialInput.keepFocus = true;
        });
        return button;
    };

    /**
     * create a button and keyboard command to add a character, add to keyboard events
     * @method SpecialInput#createAddCharButton
     * @param {String} parentId - button added at end of this element00
     * @param {String} char
     * @return Button
     */
    SpecialInput.prototype.createAddCharButton = function(parentId, char) {
        const buttonId = DOM.createButton(parentId, char);
        DOM.style("#" + buttonId, "borderRadius", 1000 + px);
        const specialInput = this;
        const button = Button.createAction(buttonId, function() {
            specialInput.add(char);
            specialInput.setFocus(true);
            specialInput.keepFocus = true;
        });
        KeyboardEvents.addFunction(function(event) {
            if (specialInput.focus && button.active) {
                specialInput.add(char);
            }
        }, char);
        return button;
    };

    /**
     * create a clear char button, add backspace keyboard event
     * @method SpecialInput#createClearCharButton
     * @param {String} parentId - button added at end of this element
     * @param {String} text
     * @return Button
     */
    SpecialInput.prototype.createClearCharButton = function(parentId, text) {
        const buttonId = DOM.createButton(parentId, text);
        DOM.style("#" + buttonId, "borderRadius", 1000 + px);
        const specialInput = this;
        const button = Button.createAction(buttonId, function() {
            if (specialInput.cursorPosition > 0) { // can only clear character if cursor is not at extreme left
                specialInput.text = specialInput.text.slice(0, specialInput.cursorPosition - 1) + specialInput.text.slice(specialInput.cursorPosition);
                specialInput.setCursor(specialInput.cursorPosition - 1);
            }
            specialInput.setFocus(true);
            specialInput.keepFocus = true;
        });
        KeyboardEvents.addFunction(function(event) {
            event.preventDefault();
            event.stopPropagation();
            if (specialInput.focus && button.active) {
                if (specialInput.cursorPosition > 0) {
                    specialInput.text = specialInput.text.slice(0, specialInput.cursorPosition - 1) + specialInput.text.slice(specialInput.cursorPosition);
                    specialInput.setCursor(specialInput.cursorPosition - 1);
                }
                specialInput.setFocus(true);
            }
        }, "Backspace");
        return button;
    };

    /**
     * create a clear all button, clears all input
     * @method SpecialInput#createClearAllButton
     * @param {String} parentId - button added at end of this element
     * @param {String} text
     * @return Button
     */
    SpecialInput.prototype.createClearAllButton = function(parentId, text) {
        const buttonId = DOM.createButton(parentId, text);
        DOM.style("#" + buttonId, "borderRadius", 1000 + px);
        const specialInput = this;
        const button = Button.createAction(buttonId, function() {
            specialInput.text = "";
            specialInput.setCursor(0);
            specialInput.setFocus(true);
            specialInput.keepFocus = true;
        });
        return button;
    };

    /**
     * create an enter button and keyboard command, do something with the symbol
     * @method SpecialInput#createEnterButton
     * @param {String} parentId - button added at end of this element
     * @param {String} text
     * @return Button
     */
    SpecialInput.prototype.createEnterButton = function(parentId, text) {
        const buttonId = DOM.createButton(parentId, text);
        DOM.style("#" + buttonId, "borderRadius", 1000 + px);
        const specialInput = this;
        const button = Button.createAction(buttonId, function() {
            specialInput.setFocus(true);
            specialInput.keepFocus = true;
            specialInput.onEnter();
        });
        KeyboardEvents.addFunction(function(event) {
            if (specialInput.focus && button.active) {
                specialInput.onEnter();
            }
        }, "Enter");
        return button;
    };

    /**
     * create a set text button, sets text of this input, replaces existing text
     * @method SpecialInput#createSetTextButton
     * @param {String} parentId - button added at end of this element
     * @param {String} text - new text
     * @return Button
     */
    SpecialInput.prototype.createSetTextButton = function(parentId, text) {
        const buttonId = DOM.createButton(parentId, text);
        DOM.style("#" + buttonId, "borderRadius", 1000 + px);
        const specialInput = this;
        const button = Button.createAction(buttonId, function() {
            specialInput.setText(text);
            specialInput.setFocus(true);
            specialInput.keepFocus = true;
        });
        return button;
    };

    /**
     * create a copy button and "copy" event to copy the special input text to clipboard
     * @method SpecialInput#createCopyButton
     * @param {String} parentId - button added at end of this element
     * @param {String} text
     * @return Button
     */
    SpecialInput.prototype.createCopyButton = function(parentId, text) {
        const buttonId = DOM.createButton(parentId, text);
        DOM.style("#" + buttonId, "borderRadius", 1000 + px);
        const specialInput = this;
        const button = Button.createAction(buttonId, function() {
            clipboardHandler.copy(specialInput.text);
        });
        // the copy event should copy this only if it has focus and
        // the clipboardHandler did not cause the copy event
        window.addEventListener("copy", function(event) {
            if (specialInput.focus && !clipboardHandler.active && button.active) {
                event.preventDefault();
                event.stopPropagation();
                clipboardHandler.copy(specialInput.text);
            }
        });
        return button;
    };

    //=======================================================================
    // parsing: interface independent of syntax
    //=======================================================================

    /**
     * reset all span characters to color black
     * @method SpecialInput#colorBlack
     */
    SpecialInput.prototype.colorBlack = function() {
        for (var i = this.charSpans.length - 1; i >= 0; i--) {
            this.charSpans[i].style.color = "black";
        }
    };

    // reference position is this.parsePosition

    /**
     * start parsing: set parsePosition to initial
     * @method SpecialInput#startParsing
     */
    SpecialInput.prototype.startParsing = function() {
        this.parsePosition = 0;
    };

    /**
     * advance parsing position, check if end reached, go past end
     * @method SpecialInput#advanceParsing
     * @return boolean, true if advancing, false if already at end
     */
    SpecialInput.prototype.advanceParsing = function() {
        this.parsePosition = Math.min(this.parsePosition + 1, this.text.length);
        return this.parsePosition < this.text.length;
    };

    /**
     * get the character at parsing position
     * @method SpecialInput#getCharParsing
     * @return String contains character at parsing position, is empty if position gas advanced past last char
     */
    SpecialInput.prototype.getCharParsing = function() {
        return this.text.charAt(this.parsePosition);
    };

    /**
     *  mark error, paint chars before parsePosition black,
     * chars at parsePosition and after in red
     * if this.infocus include cursor character at this.cursorPosition
     * cursor should be black
     * @method SpecialInput#markErrorParsing
     */
    SpecialInput.prototype.markErrorParsing = function() {
        // errorPosition is index to span with first error
        // endPosition is after end of text
        let startPosition = this.parsePosition;
        let endPosition = this.text.length;
        // correction for cursor (if in focus)
        if (this.focus) {
            if (this.cursorPosition <= startPosition) {
                startPosition++;
            }
            endPosition++;
        }
        this.colorBlack();
        for (var i = startPosition; i < endPosition; i++) {
            this.charSpans[i].style.color = "red";
        }


        this.charSpans[this.cursorPosition].style.color = "black";



    };


}());
