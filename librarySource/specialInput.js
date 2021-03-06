/**
 * a special input for text text with limited set of characters,
 * 
 * @constructor SpecialInput 
 * @param {String} idName - name (id) of a span or div element that will contain the input
 */

/*
 * dependencies
 * ==================================================================
 * blinking.css
 * keyboardEvents.js
 * button.js
 * clipboardHandler.js
 * ====================================================================
 */

/* jshint esversion:6 */

function SpecialInput(idName) {
    "use strict";
    this.id = idName;
    this.element = document.getElementById(idName);
    // styling the containing element to fit the usual inputs
    DOM.style("#" + idName, "borderStyle", "solid", "borderTopColor", "#777777", "borderLeftColor", "#777777", "borderBottomColor", "#dddddd", "borderRightColor", "#dddddd");
    DOM.style("#" + idName, "cursor", "text", "overflow", "auto");
    // loading and applying styles
    this.colorStyleDefaults();
    this.updateStyle();
    // remember old symbols
    this.oldSymbols = [];
    this.lookingAt = 0;
    // controlling buttons
    this.enterButton = null;
    this.copyButton = null;
    this.stepRightButton = null;
    this.stepLeftButton = null;
    this.delButton = null;
    this.clearButton = null;
    this.prevButton = null;
    this.nextButton = null;

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
    // moving the cursor to end (default if no click on characters)
    this.element.onmouseup = function() {
        specialInput.setCursor(specialInput.text.length);
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

    const px = "px";

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
     * return a value clamped between max and min  
     * @function clamp 
     * @para {int/float} min 
     * @para {int/float} x 
     * @para {int/float} max  
     */
    function clamp(min, x, max) {
        return Math.max(min, Math.min(x, max));
    }


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
            console.log("span.click");
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
        // at least one span for a character to prevent collapse of the button
        for (let i = this.charSpans.length; i < Math.max(1, text.length); i++) {
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
            theSpan.style.visibility = "initial";
            theSpan.className = "";
        }
        // blink corsor if focus and thus cursor visible
        if (this.focus) { // with focus show "cursor"
            this.charSpans[this.cursorPosition].className = "blinking";
        }

        // clear empty spans, hide
        for (let i = text.length; i < this.charSpans.length; i++) {
            const theSpan = this.charSpans[i];
            theSpan.innerHTML = "";
            theSpan.style.display = "none";
        }
        // prevent collapse if no text
        if (text.length === 0) {
            const theSpan = this.charSpans[0];
            theSpan.innerHTML = "I";
            theSpan.style.display = "inline";
            theSpan.style.visibility = "hidden";
            theSpan.className = "";
        }
    };

    /**
     * update the text display
     *  if it has focus, then insert cursor as underscore
     * @method SpecialInput.updateText
     */
    SpecialInput.prototype.updateText = function() {
        if (this.enterButton != null) {
            this.enterButton.setActive(this.text.length > 0);
        }
        if (this.clearButton != null) {
            this.clearButton.setActive(this.text.length > 0);
        }
        if (this.copyButton != null) {
            this.copyButton.setActive(this.text.length > 0);
        }
        if (this.delButton != null) {
            this.delButton.setActive(this.cursorPosition > 0);
        }
        if (this.stepLeftButton != null) {
            this.stepLeftButton.setActive(this.cursorPosition > 0);
        }
        if (this.stepRightButton != null) {
            this.stepRightButton.setActive(this.cursorPosition < this.text.length);
        }
        if (this.prevButton != null) {
            // can go to a different prev. symbol if 2 or more prev symbols or the one is different
            this.prevButton.setActive((this.lookingAt > 0) &&
                ((this.oldSymbols.length > 1) ||
                    (this.oldSymbols.length === 1) && !this.dublicateTopOfStack()));
        }
        if (this.nextButton != null) {
            // can go to a different prev. symbol if 2 or more prev symbols or the one is different
            this.nextButton.setActive(this.lookingAt < this.oldSymbols.length - 1);
        }
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
        position = clamp(0, position, this.text.length);
        this.cursorPosition = position;
    };

    /**
     * set (paste) the text, put cursor at end
     * does not make focus, because from somewhere else it is set
     * @method SpecialInput#setText
     * @param {String} text
     */
    SpecialInput.prototype.setText = function(text) {
        console.log("settext " + text);
        this.text = text;
        this.cursorPosition = text.length;
    };

    /**
     * add a text at cursor position, 
     *  new cursor position will be at end of inserted text
     * looking at top of stack of old symbols
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
        this.lookingAt = this.oldSymbols.length;
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
        this.stepLeftButton = button;
        button.setActive(false);
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
        this.stepRightButton = button;
        button.setActive(false);
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
     * make sure that special input gets focus and stays in focus
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
        this.delButton = button;
        button.setActive(false);
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
        this.clearButton = button;
        button.setActive(false);
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
            if ((specialInput.oldSymbols.length === 0) || (specialInput.oldSymbols[specialInput.oldSymbols.length - 1] != specialInput.text)) {
                specialInput.oldSymbols.push(specialInput.text);
            }
            specialInput.lookingAt = specialInput.oldSymbols.length;
            if (specialInput.prevButton != null) {
                specialInput.prevButton.setActive(specialInput.oldSymbols.length > 1);
            }
            if (specialInput.nextButton != null) {
                specialInput.nextButton.setActive(false);
            }
            console.log(specialInput.oldSymbols);
            specialInput.onEnter();
        });
        this.enterButton = button;
        button.setActive(false);
        KeyboardEvents.addFunction(function(event) {
            if (specialInput.focus && button.active) {
                if ((specialInput.oldSymbols.length === 0) || (specialInput.oldSymbols[specialInput.oldSymbols.length - 1] != specialInput.text)) {
                    specialInput.oldSymbols.push(specialInput.text);
                }
                specialInput.lookingAt = specialInput.oldSymbols.length;
                if (specialInput.prevButton != null) {
                    specialInput.prevButton.setActive();
                }
                console.log(specialInput.oldSymbols);
                specialInput.onEnter();
            }
        }, "Enter");
        return button;
    };

    /**
     * check if top of stack is the same as current text
     * @method SpecialInput#dublicateTopOfStack
     * @return boolean, true if top of stack is same as current
     */
    SpecialInput.prototype.dublicateTopOfStack = function() {
        return (this.oldSymbols.length > 0) && (this.text == this.oldSymbols[this.oldSymbols.length - 1]);
    };

    /**
     * create a button to go to previous input in old inputs stack
     * if top of stack i
     * @method SpecialInput#createPreviousButton
     * @param {String} parentId - button added at end of this element
     * @param {String} text
     * @return Button
     */
    SpecialInput.prototype.createPreviousButton = function(parentId, text) {
        const buttonId = DOM.createButton(parentId, text);
        DOM.style("#" + buttonId, "borderRadius", 1000 + px);
        const specialInput = this;
        const button = Button.createAction(buttonId, function() {


            console.log("prev");
            console.log("specialInput.lookingAt " + specialInput.lookingAt);
            console.log("specialInput.oldSymbols.length-1 " + specialInput.oldSymbols.length);
            specialInput.lookingAt = clamp(0, specialInput.lookingAt - 1, specialInput.oldSymbols.length - 1);
            console.log("see " + specialInput.lookingAt);
            if (specialInput.oldSymbols[specialInput.lookingAt] == specialInput.text) {
                specialInput.lookingAt = Math.max(0, specialInput.lookingAt - 1);
                console.log("skip dublicate");
            }
            specialInput.setText(specialInput.oldSymbols[specialInput.lookingAt]);
            specialInput.setFocus(true);
            specialInput.keepFocus = true;

        });
        this.prevButton = button;
        button.setActive(false);
        KeyboardEvents.addFunction(function(event) {
            if (specialInput.focus && button.active) {
                console.log("prev");
                specialInput.lookingAt = clamp(0, specialInput.lookingAt - 1, specialInput.oldSymbols.length - 1);
                console.log("see " + specialInput.lookingAt);
                if (specialInput.oldSymbols[specialInput.lookingAt] == specialInput.text) {
                    specialInput.lookingAt = Math.max(0, specialInput.lookingAt - 1);
                    console.log("skip dublicate");
                }
                specialInput.setText(specialInput.oldSymbols[specialInput.lookingAt]);
                specialInput.setFocus(true);
                specialInput.keepFocus = true;


            }
        }, "ArrowUp");


        return button;
    };

    /**
     * create a button to go to next input in the old input stack
     * @method SpecialInput#createNextButton
     * @param {String} parentId - button added at end of this element
     * @param {String} text
     * @return Button
     */
    SpecialInput.prototype.createNextButton = function(parentId, text) {
        const buttonId = DOM.createButton(parentId, text);
        DOM.style("#" + buttonId, "borderRadius", 1000 + px);
        const specialInput = this;
        const button = Button.createAction(buttonId, function() {

            console.log("prev");
            specialInput.lookingAt = clamp(0, specialInput.lookingAt + 1, specialInput.oldSymbols.length - 1);
            console.log("see " + specialInput.lookingAt);
            specialInput.setText(specialInput.oldSymbols[specialInput.lookingAt]);
            specialInput.setFocus(true);
            specialInput.keepFocus = true;

        });
        this.nextButton = button;
        button.setActive(false);
        KeyboardEvents.addFunction(function(event) {
            if (specialInput.focus && button.active) {
                console.log("prev");
                specialInput.lookingAt = clamp(0, specialInput.lookingAt + 1, specialInput.oldSymbols.length - 1);
                console.log("see " + specialInput.lookingAt);
                specialInput.setText(specialInput.oldSymbols[specialInput.lookingAt]);
                specialInput.setFocus(true);
                specialInput.keepFocus = true;


            }
        }, "ArrowDown");


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
            specialInput.lookingAt = specialInput.oldSymbols.length;
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
        this.copyButton = button;
        button.setActive(false);
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
     * check if parsing before or at the cursor (where the char eneters)
     * @method SpecialInput#beforeCursorParsing
     * @return boolean - true if characters left of cursor are parsed
     */
    SpecialInput.prototype.beforeCursorParsing = function() {
        return this.parsePosition <= this.cursorPosition;
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
     * check if parsing character is in given string (as set of chars)
     * @method SpecialInput#isCharParsing
     * @param {String} chars - the characters for testing
     * @return boolean, true if char at parsing position is contained in the chars string, false if end of parsing or not contained
     */
    SpecialInput.prototype.isCharParsing = function(chars) {
        const char = this.getCharParsing();
        if (char.length === 0) {
            return false;
        } else {
            return chars.includes(char);
        }
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
