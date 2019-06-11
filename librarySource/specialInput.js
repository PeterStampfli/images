/**
 * a special input for text text with limited set of characters,
 * 
 * @constructor SpecialInput 
 * @param {String} idName name (id) of a span or div
 */

/* jshint esversion:6 */


function SpecialInput(idName) {
    "use strict";
    this.id = idName;
    DOM.style("#" + idName, "borderStyle", "solid", "borderTopColor", "#777777", "borderLeftColor", "#777777", "borderBottomColor", "#dddddd", "borderRightColor", "#dddddd", "overflow", "auto");
    this.element = document.getElementById(idName);
    this.text = "";
    this.cursorPosition = 0;
    this.hover = false;
    this.focus = false;
    this.keepFocus = false;
    this.element.style.cursor = "text";



    // writing text with cursor position
    // each character in its own span element (detect click position)
    this.charSpans = [];

    this.colorStyleDefaults();
    this.updateStyle();
    this.updateText();


    var specialInput = this;


    /**
     * action upon "enter" command, strategy pattern
     * @method NumberButton#onclick
     * @param {integer} value
     */
    this.onEnter = function(value) {};


    this.element.onclick = function() {
        specialInput.setFocus(true);
    };

    // loosing focus for clicking elsewhere
    const body = document.getElementsByTagName("body")[0];
    body.addEventListener("click", function() {
        if (!specialInput.hover && !specialInput.keepFocus) {
            specialInput.setFocus(false);
        }
        specialInput.keepFocus = false;
    });

    // hovering
    this.element.onmouseenter = function() {
        specialInput.hover = true;
        specialInput.updateStyle();
    };

    this.element.onmouseleave = function() {
        specialInput.hover = false;
        specialInput.updateStyle();
    };
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
     * setup the color styles defaults, use for other buttons too
     * @method SpecialInput#colorStyleDefaults
     */
    SpecialInput.prototype.colorStyleDefaults = Button.prototype.colorStyleDefaults;

    /**
     * write a text in the charSpans, with an extra m-space and a hidden X at end
     * @method SpecialInput#write
     * @param {String} text
     */

    function createNewSpanOnClickFunction(specialInput, i) {
        const f = function() {
            if (specialInput.cursorPosition < i) {
                specialInput.setCursor(i - 1);
            } else {
                specialInput.setCursor(i);
            }
        };
        return f;
    }

    SpecialInput.prototype.write = function(text) {
        // create missing spans
        for (let i = this.charSpans.length; i < text.length + 2; i++) {
            const newSpan = DOM.create("span", DOM.createId(), "#" + this.id);
            const specialInput = this;
            newSpan.onclick = createNewSpanOnClickFunction(specialInput, i);
            /*newSpan.onclick=function(){
                console.log(i);
               
            };
        */
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
        // clear empty spans
        for (let i = text.length + 2; i < this.charSpans.length; i++) {
            const theSpan = this.charSpans[i];
            theSpan.innerHTML = "";
            theSpan.style.display = "none";
        }
    };

    /**
     * update the text display, depending on focus add cursor
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
     * @param {boolean} focus
     */
    SpecialInput.prototype.setFocus = function(focus) {
        this.focus = focus;
        this.updateStyle();
        this.updateText();
    };

    /**
     * set the cursor, make that it has focus
     * @method SpecialInput#setFocus
     * @param {integer} position
     */
    SpecialInput.prototype.setCursor = function(position) {
        console.log("setCursor");
        position = Fast.clamp(0, position, this.text.length);
        this.cursorPosition = position;
    };

    /**
     * set the text, put cursor at end
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
        const newCursorPosition = text.length;
        text += this.text.slice(this.cursorPosition);
        this.text = text;
        this.cursorPosition = newCursorPosition;
        this.setFocus(true);
    };


    /**
     * create a button to move cursor one position to the left
     * @method SpecialInput#stepLeft
     * @param {String} parentId - button added at end of this element
     * @param {String} text
     */
    SpecialInput.prototype.createStepLeftButton = function(parentId, text) {
        const buttonId = DOM.createButton(parentId, text);
        DOM.style("#" + buttonId, "borderRadius", 1000 + px);
        const specialInput = this;
        Button.createAction(buttonId, function() {
            specialInput.setCursor(specialInput.cursorPosition - 1);
            specialInput.setFocus(true);
            specialInput.keepFocus = true;
        });
        KeyboardEvents.addFunction(function(event) {
            if (specialInput.focus) {
                specialInput.setCursor(specialInput.cursorPosition - 1);
                specialInput.setFocus(true);
            }
        }, "ArrowLeft");
    };

    /**
     * create a button to move cursor one position to the right
     * @method SpecialInput#createStepRightButton
     * @param {String} parentId - button added at end of this element
     * @param {String} text
     */
    SpecialInput.prototype.createStepRightButton = function(parentId, text) {
        const buttonId = DOM.createButton(parentId, text);
        DOM.style("#" + buttonId, "borderRadius", 1000 + px);
        const specialInput = this;
        Button.createAction(buttonId, function() {
            specialInput.setCursor(specialInput.cursorPosition + 1);
            specialInput.setFocus(true);
            specialInput.keepFocus = true;
        });
        KeyboardEvents.addFunction(function(event) {
            if (specialInput.focus) {
                specialInput.setCursor(specialInput.cursorPosition + 1);
                specialInput.setFocus(true);
            }
        }, "ArrowRight");
    };


    /**
     * create a button to add text
     * @method SpecialInput#createAddButton
     * @param {String} parentId - button added at end of this element
     * @param {String} text
     */
    SpecialInput.prototype.createAddButton = function(parentId, text) {
        const buttonId = DOM.createButton(parentId, text);
        DOM.style("#" + buttonId, "borderRadius", 1000 + px);
        const specialInput = this;
        Button.createAction(buttonId, function() {
            specialInput.add(text);
            specialInput.setFocus(true);
            specialInput.keepFocus = true;
        });
    };


    /**
     * create a button to add a character, add to keyboard events
     * @method SpecialInput#createAddCharButton
     * @param {String} parentId - button added at end of this element00
     * @param {String} char
     */
    SpecialInput.prototype.createAddCharButton = function(parentId, char) {
        const buttonId = DOM.createButton(parentId, char);
        DOM.style("#" + buttonId, "borderRadius", 1000 + px);
        const specialInput = this;
        Button.createAction(buttonId, function() {
            specialInput.add(char);
            specialInput.setFocus(true);
            specialInput.keepFocus = true;
        });
        KeyboardEvents.addFunction(function(event) {
            if (specialInput.focus) {
                specialInput.add(char);
                console.log(char);
                console.log(event.ctrlKey);
            }
        }, char);

    };

    /**
     * create a clear char button, add backspace keyboard event
     * @method SpecialInput#createClearCharButton
     * @param {String} parentId - button added at end of this element
     * @param {String} text
     */
    SpecialInput.prototype.createClearCharButton = function(parentId, text) {
        const buttonId = DOM.createButton(parentId, text);
        DOM.style("#" + buttonId, "borderRadius", 1000 + px);
        const specialInput = this;
        Button.createAction(buttonId, function() {
            if (specialInput.cursorPosition > 0) {
                specialInput.text = specialInput.text.slice(0, specialInput.cursorPosition - 1) + specialInput.text.slice(specialInput.cursorPosition);
                specialInput.setCursor(specialInput.cursorPosition - 1);

            }
            specialInput.setFocus(true);
            specialInput.keepFocus = true;
        });
        KeyboardEvents.addFunction(function(event) {
            event.preventDefault();
            event.stopPropagation();
            if (specialInput.focus) {
                if (specialInput.cursorPosition > 0) {
                    specialInput.text = specialInput.text.slice(0, specialInput.cursorPosition - 1) + specialInput.text.slice(specialInput.cursorPosition);
                    specialInput.setCursor(specialInput.cursorPosition - 1);
                }
                specialInput.setFocus(true);
            }
        }, "Backspace");
    };

    /**
     * create a clear all button
     * @method SpecialInput#createClearAllButton
     * @param {String} parentId - button added at end of this element
     * @param {String} text
     */
    SpecialInput.prototype.createClearAllButton = function(parentId, text) {
        const buttonId = DOM.createButton(parentId, text);
        DOM.style("#" + buttonId, "borderRadius", 1000 + px);
        const specialInput = this;
        Button.createAction(buttonId, function() {
            specialInput.text = "";
            specialInput.setCursor(0);
            specialInput.setFocus(true);
            specialInput.keepFocus = true;
        });
    };

    /**
     * create an enter button, do something with the symbol
     * @method SpecialInput#createEnterButton
     * @param {String} parentId - button added at end of this element
     * @param {String} text
     */
    SpecialInput.prototype.createEnterButton = function(parentId, text) {
        const buttonId = DOM.createButton(parentId, text);
        DOM.style("#" + buttonId, "borderRadius", 1000 + px);
        const specialInput = this;
        Button.createAction(buttonId, function() {
            specialInput.onEnter(specialInput.text);
            specialInput.setFocus(true);
            specialInput.keepFocus = true;
        });
        KeyboardEvents.addFunction(function(event) {
            if (specialInput.focus) {
                specialInput.onEnter(specialInput.text);
            }
        }, "Enter");
    };

    /**
     * create an set text button, 
     * @method SpecialInput#createSetTextButton
     * @param {String} parentId - button added at end of this element
     * @param {String} text
     */
    SpecialInput.prototype.createSetTextButton = function(parentId, text) {
        const buttonId = DOM.createButton(parentId, text);
        DOM.style("#" + buttonId, "borderRadius", 1000 + px);
        const specialInput = this;
        Button.createAction(buttonId, function() {
            specialInput.setText(text);
            specialInput.setFocus(true);
            specialInput.keepFocus = true;
        });
    };

    /**
     * create a copy button and "copy" event to copy the symbol
     * @method SpecialInput#createCopyButton
     * @param {String} parentId - button added at end of this element
     * @param {String} text
     */
    SpecialInput.prototype.createCopyButton = function(parentId, text) {
        const buttonId = DOM.createButton(parentId, text);
        DOM.style("#" + buttonId, "borderRadius", 1000 + px);
        const specialInput = this;
        Button.createAction(buttonId, function() {
            clipboardHandler.copy(specialInput.text);
        });
        // the copy event should copy this only if it has focus and
        // the clipboardHandler did not cause the copy event
        window.addEventListener("copy", function(event) {
            if (specialInput.focus && !clipboardHandler.active) {
                event.preventDefault();
                event.stopPropagation();
                clipboardHandler.copy(specialInput.text);
            }
        });
        // paste is not possible, alert
        window.addEventListener("paste", function(event) {
            if (specialInput.focus && !clipboardHandler.active) {
                event.preventDefault();
                event.stopPropagation();
                clipboardHandler.paste();
            }
        });

    };

}());
